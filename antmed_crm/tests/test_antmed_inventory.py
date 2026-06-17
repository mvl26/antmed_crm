# Copyright (c) 2026, AntMed and Contributors
# See license.txt
"""M03 Slice M03-S1 (BE foundation) — DocType AntMed Item + API list_items/get_item — TDD viết TRƯỚC.

Cover spec m03_inventory.md §2 (AntMed Item) + §5 (list_items/get_item) + §10 DoD:
  test_item_doctype_and_fields  — DocType tồn tại; đủ field tối thiểu; autoname field:item_code.
  test_item_code_unique         — 2 item cùng item_code → raise.
  test_list_items_shape         — {data,total_count}; item đúng 6 key; len(data)==total_count (count==rows).
  test_list_items_search        — search khớp item_code HOẶC item_name.
  test_list_items_filter        — filter classification lọc đúng.
  test_get_item                 — get_item trả field VTYT + lots[] (rỗng — Lot chưa land).
  test_get_item_permission      — user không read → PermissionError.
  test_docperm_vietnamese       — DocPerm dùng role VI (Quản lý/Thủ kho), KHÔNG role AM System Admin.

Lệnh chạy:
  bench --site miyano run-tests --app antmed_crm --module antmed_crm.tests.test_antmed_inventory
"""

import frappe
from frappe.tests.utils import FrappeTestCase

from antmed_crm.api.antmed import inventory

ITEM_MIN_FIELDS = {
	"item_code",
	"item_name",
	"manufacturer_code",
	"registration_no",
	"ma_dkluuhanh",
	"requires_cocq",
	"shelf_life_months",
	"classification",
	"uom",
	"default_unit_price",
	"is_consignment",
	"disabled",
}
LIST_ITEM_KEYS = {"name", "item_code", "item_name", "classification", "requires_cocq", "shelf_life_months"}


def _mk_item(item_code, item_name, **kw):
	if frappe.db.exists("AntMed Item", item_code):
		return frappe.get_doc("AntMed Item", item_code)
	doc = frappe.get_doc(
		{"doctype": "AntMed Item", "item_code": item_code, "item_name": item_name, **kw}
	)
	doc.insert(ignore_permissions=True)
	return doc


class TestAntMedInventory(FrappeTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.it1 = _mk_item(
			"_T-VTYT-STENT",
			"Stent mạch vành phủ thuốc",
			classification="Loại D",
			requires_cocq=1,
			shelf_life_months=36,
			uom="Cái",
			default_unit_price=12000000,
		).name
		cls.it2 = _mk_item(
			"_T-VTYT-GAC",
			"Gạc phẫu thuật",
			classification="Loại A",
			requires_cocq=0,
			shelf_life_months=60,
			uom="Gói",
		).name

	def test_item_doctype_and_fields(self):
		self.assertTrue(frappe.db.exists("DocType", "AntMed Item"))
		meta = frappe.get_meta("AntMed Item")
		fields = {f.fieldname for f in meta.fields}
		self.assertTrue(
			ITEM_MIN_FIELDS.issubset(fields), msg=f"AntMed Item thiếu field: {ITEM_MIN_FIELDS - fields}"
		)
		# autoname field:item_code → name == item_code
		self.assertEqual(self.it1, "_T-VTYT-STENT")
		self.assertEqual(meta.get_field("item_code").unique, 1)
		self.assertEqual(meta.track_changes, 1)

	def test_item_code_unique(self):
		"""item_code unique + autoname field:item_code → insert thẳng mã trùng phải raise."""
		with self.assertRaises(
			(frappe.UniqueValidationError, frappe.DuplicateEntryError, frappe.ValidationError)
		):
			frappe.get_doc(
				{"doctype": "AntMed Item", "item_code": "_T-VTYT-STENT", "item_name": "Trùng mã"}
			).insert(ignore_permissions=True)

	def test_list_items_shape(self):
		res = inventory.list_items(page_length=0)
		self.assertEqual(set(res.keys()), {"data", "total_count"})
		self.assertGreaterEqual(len(res["data"]), 2)
		self.assertEqual(set(res["data"][0].keys()), LIST_ITEM_KEYS)
		self.assertEqual(len(res["data"]), res["total_count"])

	def test_list_items_search(self):
		# search theo item_name
		r1 = inventory.list_items(search="Stent", page_length=0)
		codes1 = {r["item_code"] for r in r1["data"]}
		self.assertIn("_T-VTYT-STENT", codes1)
		self.assertNotIn("_T-VTYT-GAC", codes1)
		# search theo item_code
		r2 = inventory.list_items(search="_T-VTYT-GAC", page_length=0)
		codes2 = {r["item_code"] for r in r2["data"]}
		self.assertIn("_T-VTYT-GAC", codes2)
		self.assertNotIn("_T-VTYT-STENT", codes2)

	def test_list_items_filter(self):
		res = inventory.list_items(filters={"classification": "Loại D"}, page_length=0)
		codes = {r["item_code"] for r in res["data"]}
		self.assertIn("_T-VTYT-STENT", codes)
		self.assertNotIn("_T-VTYT-GAC", codes)
		self.assertEqual(len(res["data"]), res["total_count"])

	def test_get_item(self):
		res = inventory.get_item(self.it1)
		self.assertEqual(res["item_code"], "_T-VTYT-STENT")
		self.assertEqual(res["item_name"], "Stent mạch vành phủ thuốc")
		self.assertEqual(res["classification"], "Loại D")
		self.assertEqual(res["requires_cocq"], 1)
		self.assertEqual(res["shelf_life_months"], 36)
		self.assertIn("lots", res)
		self.assertEqual(res["lots"], [])  # AntMed Lot chưa land (slice kế)

	def test_get_item_permission(self):
		email = "_t_inv_noperm@example.com"
		if not frappe.db.exists("User", email):
			frappe.get_doc(
				{"doctype": "User", "email": email, "first_name": "NoPermInv", "send_welcome_email": 0}
			).insert(ignore_permissions=True)
		frappe.set_user(email)
		try:
			with self.assertRaises(frappe.PermissionError):
				inventory.get_item(self.it1)
		finally:
			frappe.set_user("Administrator")

	def test_docperm_vietnamese(self):
		perms = {p.role for p in frappe.get_meta("AntMed Item").permissions}
		self.assertIn("Quản lý", perms)
		self.assertIn("Thủ kho", perms)
		self.assertIn("System Manager", perms)
		self.assertNotIn("AM System Admin", perms)
