# Copyright (c) 2026, AntMed and Contributors
# For license information, please see license.txt
"""Quick-search command palette (header) — tìm nhanh đa-doctype.

global_search(query, limit) gộp kết quả Bệnh viện + Hợp đồng cho command palette FE.
Tái dùng list_hospitals/list_contracts (đã có search + frappe.get_list dưới quyền user)
→ KẾ THỪA permission + data-scope BR-13, KHÔNG nhân đôi logic phân quyền.
"""

import frappe

from antmed_crm.api.antmed.contract import list_contracts
from antmed_crm.api.antmed.customer import list_hospitals


@frappe.whitelist(methods=["GET"])
def global_search(query: str | None = None, limit: str | int = 5) -> dict:
	"""Trả RAW dict {"hospitals": list[dict], "contracts": list[dict]}.

	- query rỗng/whitespace → cả hai nhóm rỗng (tránh quét toàn bảng).
	- limit clamp 1..20; giá trị không parse được → mặc định 5.
	- Mỗi nhóm tối đa `limit` bản ghi, theo quyền đọc của user hiện tại.
	"""
	query = (query or "").strip()
	if not query:
		return {"hospitals": [], "contracts": []}

	try:
		limit = int(limit)
	except (TypeError, ValueError):
		limit = 5
	limit = max(1, min(limit, 20))

	hospitals = list_hospitals(search=query, page_length=limit).get("data", [])
	contracts = list_contracts(search=query, page_length=limit).get("data", [])
	return {"hospitals": hospitals, "contracts": contracts}
