# Copyright (c) 2026, AntMed and Contributors
# See license.txt
"""M04 Slice S1 — endpoint Giao phòng mổ (Delivery, read-only).

Đường gọi: antmed_crm.api.antmed.delivery.<fn> (xem m04_or_delivery.md §5).
@frappe.whitelist(methods=["GET"]), type-annotated, RAW dict. count==rows (BR-13).
Vòng đời (assign/start_transit/handover) + SLA + BR-01/06 để slice M04-S2/S3.
"""

import frappe
from frappe import _

DELIVERY_DOCTYPE = "AntMed Delivery"
HOSPITAL_DOCTYPE = "AntMed Hospital"
DOCTOR_DOCTYPE = "AntMed Doctor"

DELIVERY_LIST_FIELDS = [
	"name",
	"hospital",
	"hospital.hospital_name as hospital_name",
	"doctor",
	"surgery_datetime",
	"status",
	"sla_status",
	"assigned_employee",
]
DELIVERY_LIST_ITEM_KEYS = (
	"name",
	"hospital",
	"hospital_name",
	"doctor",
	"surgery_datetime",
	"status",
	"sla_status",
	"assigned_employee",
)
DELIVERY_DETAIL_FIELDS = (
	"name",
	"hospital",
	"doctor",
	"surgery_room",
	"surgery_datetime",
	"sla_minutes",
	"contract",
	"assigned_employee",
	"status",
	"delivered_at",
	"sla_status",
	"notes",
	"docstatus",
)
DELIVERY_ITEM_KEYS = ("item", "item_name", "lot", "uom", "requested_qty", "delivered_qty", "consumed_qty", "returned_qty")


def _coerce_filters(filters: dict | str | None) -> list:
	if not filters:
		return []
	if isinstance(filters, str):
		filters = frappe.parse_json(filters) or []
	if isinstance(filters, dict):
		return [[k, "=", v] for k, v in filters.items()]
	return list(filters)


@frappe.whitelist(methods=["GET"])
def list_deliveries(
	filters: dict | str | None = None,
	status: str | None = None,
	hospital: str | None = None,
	start: int = 0,
	page_length: int = 20,
) -> dict:
	"""Danh sách phiếu giao phòng mổ. Trả RAW {data, total_count} — count==rows khi page_length=0.

	Mỗi item gồm ĐÚNG 8 field: name, hospital, hospital_name, doctor, surgery_datetime,
	status, sla_status, assigned_employee. hospital_name resolve qua Link (dotted-fetch).
	"""
	conditions = _coerce_filters(filters)
	if status:
		conditions.append(["status", "=", status])
	if hospital:
		conditions.append(["hospital", "=", hospital])

	start = max(0, int(start))
	page_length = max(0, int(page_length))

	rows = frappe.get_list(
		DELIVERY_DOCTYPE,
		filters=conditions,
		fields=DELIVERY_LIST_FIELDS,
		limit_start=start,
		limit_page_length=page_length or 0,
		order_by=f"`tab{DELIVERY_DOCTYPE}`.surgery_datetime desc",
	)
	data = [{k: r.get(k) for k in DELIVERY_LIST_ITEM_KEYS} for r in rows]

	total_count = len(frappe.get_list(DELIVERY_DOCTYPE, filters=conditions, pluck="name", limit_page_length=0))
	return {"data": data, "total_count": total_count}


@frappe.whitelist(methods=["GET"])
def get_delivery(name: str) -> dict:
	"""Chi tiết phiếu giao + items[] + hospital_name/doctor_name. throw PermissionError nếu không read."""
	if not frappe.has_permission(DELIVERY_DOCTYPE, "read", doc=name):
		frappe.throw(_("Bạn không có quyền xem phiếu giao này."), frappe.PermissionError)

	doc = frappe.get_doc(DELIVERY_DOCTYPE, name).as_dict()
	result = {k: doc.get(k) for k in DELIVERY_DETAIL_FIELDS}
	# LL-BE-2 + LL-BE-5: enrich *_name, null-guard FK orphan.
	result["hospital_name"] = (
		frappe.db.get_value(HOSPITAL_DOCTYPE, doc.get("hospital"), "hospital_name") if doc.get("hospital") else None
	)
	result["doctor_name"] = (
		frappe.db.get_value(DOCTOR_DOCTYPE, doc.get("doctor"), "full_name") if doc.get("doctor") else None
	)
	result["items"] = [{k: row.get(k) for k in DELIVERY_ITEM_KEYS} for row in (doc.get("items") or [])]
	return result
