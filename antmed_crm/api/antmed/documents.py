# Copyright (c) 2026, AntMed and Contributors
# See license.txt
"""M06 Slice S1 — endpoint Chứng từ (bundle + hàng chờ phát hành).

Đường gọi: antmed_crm.api.antmed.documents.<fn> (xem m06_documents.md §5).
@frappe.whitelist(), type-annotated, RAW dict. count==rows (BR-13). BR-03 (gate CO/CQ):
slice này ĐÁNH DẤU thiếu CO/CQ (missing_items/chips); chặn CỨNG phát hành ở M06-S3 (HĐĐT).
"""

import json

import frappe
from frappe import _

DOCUMENT_DOCTYPE = "AntMed Document"
QUEUE_DOCTYPE = "AntMed Document Release Queue"
DELIVERY_DOCTYPE = "AntMed Delivery"

QUEUE_LIST_FIELDS = ["name", "delivery", "document_bundle", "status", "missing_chips", "assigned_to"]
QUEUE_LIST_ITEM_KEYS = ("name", "delivery", "document_bundle", "status", "missing_chips", "assigned_to")
DOC_DETAIL_FIELDS = ("name", "delivery", "hospital", "status", "missing_items", "hash_sha256")
LINE_KEYS = ("item", "lot", "qty", "requires_cocq", "co_attached", "cq_attached")


def _build_lines(delivery_name: str) -> tuple[list, list]:
	"""Dựng dòng chứng từ từ phiếu giao + đánh dấu CO/CQ. Trả (lines, missing_item_codes).

	requires_cocq lấy từ AntMed Item; co/cq attached = lô có co_cert/cq_cert (AntMed Lot).
	"""
	dlv = frappe.get_doc(DELIVERY_DOCTYPE, delivery_name)
	lines, missing = [], []
	for it in dlv.items:
		requires = int(frappe.db.get_value("AntMed Item", it.item, "requires_cocq") or 0) if it.item else 0
		co = cq = 0
		if it.lot:
			cert = frappe.db.get_value("AntMed Lot", it.lot, ["co_cert", "cq_cert"]) or (None, None)
			co = 1 if cert[0] else 0
			cq = 1 if cert[1] else 0
		lines.append(
			{"item": it.item, "lot": it.lot, "qty": it.requested_qty, "requires_cocq": requires, "co_attached": co, "cq_attached": cq}
		)
		if requires and not (co and cq):
			missing.append(it.item)
	return lines, missing


def _status_for(missing: list) -> str:
	return "Thiếu chứng từ" if missing else "Chờ phát hành"


@frappe.whitelist(methods=["POST"])
def create_bundle(delivery: str) -> dict:
	"""Tạo bundle chứng từ + dòng + hàng chờ từ 1 phiếu giao (idempotent theo delivery)."""
	if not frappe.has_permission(DOCUMENT_DOCTYPE, "create"):
		frappe.throw(_("Bạn không có quyền tạo bundle chứng từ."), frappe.PermissionError)
	existing = frappe.db.get_value(DOCUMENT_DOCTYPE, {"delivery": delivery}, "name")
	if existing:
		return refresh_release_status(delivery)

	lines, missing = _build_lines(delivery)
	status = _status_for(missing)
	hospital = frappe.db.get_value(DELIVERY_DOCTYPE, delivery, "hospital")
	bundle = frappe.get_doc(
		{
			"doctype": DOCUMENT_DOCTYPE,
			"delivery": delivery,
			"hospital": hospital,
			"status": status,
			"missing_items": json.dumps(missing, ensure_ascii=False),
			"lines": lines,
		}
	)
	bundle.insert(ignore_permissions=True)
	if not frappe.db.exists(QUEUE_DOCTYPE, delivery):
		frappe.get_doc(
			{
				"doctype": QUEUE_DOCTYPE,
				"delivery": delivery,
				"document_bundle": bundle.name,
				"status": status,
				"missing_chips": json.dumps(missing, ensure_ascii=False),
			}
		).insert(ignore_permissions=True)
	return {"bundle": bundle.name, "status": status, "missing": missing}


@frappe.whitelist(methods=["POST"])
def refresh_release_status(delivery: str) -> dict:
	"""Tính lại CO/CQ thiếu cho bundle của phiếu giao + cập nhật bundle/queue status."""
	bundle_name = frappe.db.get_value(DOCUMENT_DOCTYPE, {"delivery": delivery}, "name")
	if not bundle_name:
		frappe.throw(_("Chưa có bundle chứng từ cho phiếu giao {0}.").format(delivery))
	lines, missing = _build_lines(delivery)
	status = _status_for(missing)
	bundle = frappe.get_doc(DOCUMENT_DOCTYPE, bundle_name)
	bundle.set("lines", lines)
	bundle.status = status
	bundle.missing_items = json.dumps(missing, ensure_ascii=False)
	bundle.save(ignore_permissions=True)
	if frappe.db.exists(QUEUE_DOCTYPE, delivery):
		frappe.db.set_value(QUEUE_DOCTYPE, delivery, {"status": status, "missing_chips": json.dumps(missing, ensure_ascii=False)})
	return {"bundle": bundle_name, "status": status, "missing": missing}


@frappe.whitelist(methods=["GET"])
def list_release_queue(status: str | None = None, start: int = 0, page_length: int = 20) -> dict:
	"""Hàng chờ phát hành chứng từ. Trả RAW {data, total_count} — count==rows dưới DocPerm."""
	conditions = []
	if status:
		conditions.append(["status", "=", status])
	start = max(0, int(start))
	page_length = max(0, int(page_length))
	rows = frappe.get_list(
		QUEUE_DOCTYPE,
		filters=conditions,
		fields=QUEUE_LIST_FIELDS,
		limit_start=start,
		limit_page_length=page_length or 0,
		order_by="modified desc",
	)
	data = [{k: r.get(k) for k in QUEUE_LIST_ITEM_KEYS} for r in rows]
	total_count = len(frappe.get_list(QUEUE_DOCTYPE, filters=conditions, pluck="name", limit_page_length=0))
	return {"data": data, "total_count": total_count}


@frappe.whitelist(methods=["GET"])
def get_bundle(name: str) -> dict:
	"""Chi tiết bundle + lines[]. throw PermissionError nếu không read."""
	if not frappe.has_permission(DOCUMENT_DOCTYPE, "read", doc=name):
		frappe.throw(_("Bạn không có quyền xem bundle chứng từ này."), frappe.PermissionError)
	doc = frappe.get_doc(DOCUMENT_DOCTYPE, name).as_dict()
	result = {k: doc.get(k) for k in DOC_DETAIL_FIELDS}
	result["lines"] = [{k: ln.get(k) for k in LINE_KEYS} for ln in (doc.get("lines") or [])]
	return result
