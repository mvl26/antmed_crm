# Copyright (c) 2026, AntMed and Contributors
# See license.txt
"""M08 Slice S1 — endpoint Pipeline / Gói thầu (AntMed Tender).

Đường gọi: antmed_crm.api.antmed.pipeline.<fn> (xem m08_pipeline.md §5).
@frappe.whitelist(), type-annotated, RAW dict. count==rows (BR-13).
BR-M08-01 (tender_no unique — field) · BR-M08-02 (Trúng cần decision_no).
"""

import frappe
from frappe import _

TENDER_DOCTYPE = "AntMed Tender"
HOSPITAL_DOCTYPE = "AntMed Hospital"

TENDER_LIST_FIELDS = ["name", "tender_no", "tender_name", "hospital", "hospital.hospital_name as hospital_name", "status", "estimated_value", "win_probability_pct"]
TENDER_LIST_ITEM_KEYS = ("name", "tender_no", "tender_name", "hospital", "hospital_name", "status", "estimated_value", "win_probability_pct")
TENDER_DETAIL_FIELDS = ("name", "tender_no", "tender_name", "hospital", "status", "source", "bid_open_date", "bid_close_date", "estimated_value", "win_probability_pct", "result", "decision_no", "won_contract", "deal", "docstatus")

# Giai đoạn pipeline hợp lệ (state machine nhẹ qua status).
_STAGES = ("Tiếp cận", "Khảo sát", "Báo giá", "Dự thầu", "Trúng", "Trượt")


def _coerce_filters(filters: dict | str | None) -> list:
	if not filters:
		return []
	if isinstance(filters, str):
		filters = frappe.parse_json(filters) or []
	if isinstance(filters, dict):
		return [[k, "=", v] for k, v in filters.items()]
	return list(filters)


@frappe.whitelist(methods=["POST"])
def create_tender(
	tender_no: str,
	tender_name: str,
	hospital: str | None = None,
	source: str | None = None,
	estimated_value: float | None = None,
	bid_open_date: str | None = None,
	bid_close_date: str | None = None,
) -> dict:
	"""Tạo gói thầu mới (status 'Tiếp cận'). BR-M08-01: tender_no unique (field)."""
	if not frappe.has_permission(TENDER_DOCTYPE, "create"):
		frappe.throw(_("Bạn không có quyền tạo gói thầu."), frappe.PermissionError)
	doc = frappe.get_doc(
		{
			"doctype": TENDER_DOCTYPE,
			"tender_no": tender_no,
			"tender_name": tender_name,
			"hospital": hospital,
			"source": source,
			"estimated_value": estimated_value,
			"bid_open_date": bid_open_date,
			"bid_close_date": bid_close_date,
			"status": "Tiếp cận",
		}
	)
	doc.insert(ignore_permissions=True)
	return {"name": doc.name, "status": doc.status}


@frappe.whitelist(methods=["POST"])
def move_stage(name: str, stage: str) -> dict:
	"""Chuyển giai đoạn pipeline (Tiếp cận→…→Dự thầu). Trúng/Trượt qua set_tender_result."""
	if not frappe.has_permission(TENDER_DOCTYPE, "write", doc=name):
		frappe.throw(_("Bạn không có quyền cập nhật gói thầu."), frappe.PermissionError)
	if stage not in _STAGES[:4]:
		frappe.throw(_("Giai đoạn '{0}' không hợp lệ (Trúng/Trượt dùng set_tender_result).").format(stage))
	frappe.db.set_value(TENDER_DOCTYPE, name, "status", stage)
	return {"name": name, "status": stage}


@frappe.whitelist(methods=["POST"])
def set_tender_result(name: str, result: str, decision_no: str | None = None) -> dict:
	"""Chốt kết quả thầu. BR-M08-02: 'Trúng' bắt buộc có decision_no (số QĐ KQLCNT)."""
	if not frappe.has_permission(TENDER_DOCTYPE, "write", doc=name):
		frappe.throw(_("Bạn không có quyền cập nhật gói thầu."), frappe.PermissionError)
	if result not in ("Trúng", "Trượt"):
		frappe.throw(_("Kết quả phải là 'Trúng' hoặc 'Trượt'."))
	if result == "Trúng" and not decision_no:
		frappe.throw(_("BR-M08-02: Gói thầu 'Trúng' phải có số quyết định (decision_no)."))
	win_pct = 100 if result == "Trúng" else 0
	frappe.db.set_value(
		TENDER_DOCTYPE, name, {"status": result, "result": result, "decision_no": decision_no, "win_probability_pct": win_pct}
	)
	won_contract = None
	if result == "Trúng":
		won_contract = _ensure_won_contract(name)
	return {"name": name, "status": result, "decision_no": decision_no, "won_contract": won_contract}


def _ensure_won_contract(tender_name: str) -> str | None:
	"""BR-M08-05: gói Trúng → tạo HĐ NHÁP (AntMed Contract) từ gói thầu. Idempotent (skip nếu đã có)."""
	existing = frappe.db.get_value(TENDER_DOCTYPE, tender_name, "won_contract")
	if existing:
		return existing
	from frappe.utils import nowdate

	tender = frappe.get_doc(TENDER_DOCTYPE, tender_name)
	contract_no = f"HD-{tender.tender_no}"
	if frappe.db.exists("AntMed Contract", {"contract_no": contract_no}):
		c_name = frappe.db.get_value("AntMed Contract", {"contract_no": contract_no}, "name")
	else:
		c = frappe.get_doc(
			{
				"doctype": "AntMed Contract",
				"contract_no": contract_no,
				"hospital": tender.hospital,
				"signed_date": nowdate(),
				"status": "Nháp",
				"total_value": tender.estimated_value,
			}
		)
		c.insert(ignore_permissions=True)
		c_name = c.name
	frappe.db.set_value(TENDER_DOCTYPE, tender_name, "won_contract", c_name)
	return c_name


@frappe.whitelist(methods=["GET"])
def forecast() -> dict:
	"""Dự báo doanh số pipeline = Σ(estimated_value × win_probability_pct/100), gộp theo giai đoạn.

	Trả {total_weighted, by_stage:[{stage, weighted}]}. Đọc dưới DocPerm.
	"""
	rows = frappe.get_list(TENDER_DOCTYPE, fields=["status", "estimated_value", "win_probability_pct"], limit_page_length=0)
	total = 0.0
	by_stage: dict = {}
	for r in rows:
		w = float(r.get("estimated_value") or 0) * float(r.get("win_probability_pct") or 0) / 100.0
		total += w
		by_stage[r.get("status")] = by_stage.get(r.get("status"), 0.0) + w
	return {"total_weighted": round(total, 2), "by_stage": [{"stage": s, "weighted": round(v, 2)} for s, v in by_stage.items()]}


@frappe.whitelist(methods=["GET"])
def list_tenders(
	filters: dict | str | None = None,
	status: str | None = None,
	start: int = 0,
	page_length: int = 20,
) -> dict:
	"""Danh sách gói thầu. Trả RAW {data, total_count} — count==rows dưới DocPerm."""
	conditions = _coerce_filters(filters)
	if status:
		conditions.append(["status", "=", status])
	start = max(0, int(start))
	page_length = max(0, int(page_length))
	rows = frappe.get_list(
		TENDER_DOCTYPE,
		filters=conditions,
		fields=TENDER_LIST_FIELDS,
		limit_start=start,
		limit_page_length=page_length or 0,
		order_by=f"`tab{TENDER_DOCTYPE}`.modified desc",
	)
	data = [{k: r.get(k) for k in TENDER_LIST_ITEM_KEYS} for r in rows]
	total_count = len(frappe.get_list(TENDER_DOCTYPE, filters=conditions, pluck="name", limit_page_length=0))
	return {"data": data, "total_count": total_count}


@frappe.whitelist(methods=["GET"])
def get_tender(name: str) -> dict:
	"""Chi tiết gói thầu + hospital_name. throw PermissionError nếu không read."""
	if not frappe.has_permission(TENDER_DOCTYPE, "read", doc=name):
		frappe.throw(_("Bạn không có quyền xem gói thầu này."), frappe.PermissionError)
	doc = frappe.get_doc(TENDER_DOCTYPE, name).as_dict()
	result = {k: doc.get(k) for k in TENDER_DETAIL_FIELDS}
	result["hospital_name"] = frappe.db.get_value(HOSPITAL_DOCTYPE, doc.get("hospital"), "hospital_name") if doc.get("hospital") else None
	return result
