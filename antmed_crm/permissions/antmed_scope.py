# Copyright (c) 2026, AntMed and Contributors
# See license.txt
"""M14-S3a — Data-scope BR-13 (owner-based) cho AntMed doctype qua permission_query_conditions.

An toàn + well-defined: NV chỉ thấy bản ghi MÌNH phụ trách (field owner). Admin/Quản lý bypass
(thấy hết) như org_hierarchy. Fail-closed: NV không khớp → KHÔNG thấy gì.

⚠️ Đây là 'BR-13 lite' theo owner. Scope hospital-territory đầy đủ (NV thấy mọi bản ghi của BV
trong tuyến) cần model NV↔BV — CHƯA tồn tại, là quyết định thiết kế (chờ BA/khách hàng).
"""

import frappe

# DocType → field chứa NV phụ trách (owner-based). Mở rộng dần khi field rõ ràng.
_OWNER_FIELD = {
	"AntMed Delivery": "assigned_employee",
}
# Role thấy TẤT CẢ (không bị scope) — như Quản lý/admin trong org_hierarchy.
_BYPASS_ROLES = {"System Manager", "Quản lý"}


def _scope_condition(doctype: str, user: str | None = None) -> str:
	user = user or frappe.session.user
	if user == "Administrator":
		return ""
	if _BYPASS_ROLES & set(frappe.get_roles(user)):
		return ""
	field = _OWNER_FIELD.get(doctype)
	if not field:
		return ""
	# fail-closed: chỉ bản ghi NV phụ trách (escape user — chống injection).
	return f"`tab{doctype}`.`{field}` = {frappe.db.escape(user)}"


def delivery_scope(user=None):
	"""permission_query_conditions cho AntMed Delivery (BR-13 owner-based)."""
	return _scope_condition("AntMed Delivery", user)
