# Copyright (c) 2026, AntMed and Contributors
# See license.txt
"""M06 Slice S1 (BE) — Chứng từ (bundle + hàng chờ phát hành): AntMed Document/Line/Release Queue.

Cover m06_documents.md §2 (Document/Line/Queue) + §5 (list_release_queue/get_bundle/refresh)
+ §4 (BR-03 chuẩn bị — đánh dấu thiếu CO/CQ; chặn cứng phát hành ở M06-S3):
  test_doctypes              — 3 DocType tồn tại; Document Line istable.
  test_create_bundle_missing — item requires_cocq + lô THIẾU CO/CQ → status 'Thiếu chứng từ' + missing.
  test_create_bundle_ok      — item KHÔNG requires_cocq → 'Chờ phát hành'.
  test_list_release_queue    — {data,total_count} count==rows.
  test_get_bundle            — detail + lines; co_attached/cq_attached đúng.
  test_refresh_status        — gắn CO/CQ cho lô rồi refresh → 'Chờ phát hành'.

Lệnh chạy:
  bench --site miyano run-tests --app antmed_crm --module antmed_crm.tests.test_antmed_document
"""

import frappe
from frappe.tests.utils import FrappeTestCase

from antmed_crm.api.antmed import documents


def _ensure(doctype, key, val, values):
	name = frappe.db.get_value(doctype, {key: val}, "name")
	if name:
		return name
	return frappe.get_doc({"doctype": doctype, key: val, **values}).insert(ignore_permissions=True).name


class TestAntMedDocument(FrappeTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.hosp = _ensure("AntMed Hospital", "hospital_code", "_T-DOC-BV", {"hospital_name": "BV Chứng Từ"})
		cls.item_cocq = _ensure("AntMed Item", "item_code", "_T-DOC-STENT", {"item_name": "Stent cần CO/CQ", "requires_cocq": 1})
		cls.item_free = _ensure("AntMed Item", "item_code", "_T-DOC-GAC", {"item_name": "Gạc không CO/CQ", "requires_cocq": 0})
		cls.lot_nocert = _ensure("AntMed Lot", "lot_no", "_T-DOC-LOT-NOCERT", {"item": cls.item_cocq, "expiry_date": "2027-12-31"})

	def _mk_delivery(self, items):
		return frappe.get_doc(
			{"doctype": "AntMed Delivery", "hospital": self.hosp, "surgery_datetime": "2026-08-01 08:00:00", "items": items}
		).insert(ignore_permissions=True).name

	def test_doctypes(self):
		for dt in ("AntMed Document", "AntMed Document Line", "AntMed Document Release Queue"):
			self.assertTrue(frappe.db.exists("DocType", dt), msg=f"thiếu {dt}")
		self.assertEqual(frappe.get_meta("AntMed Document Line").istable, 1)

	def test_create_bundle_missing(self):
		dlv = self._mk_delivery([{"item": self.item_cocq, "lot": self.lot_nocert, "requested_qty": 2}])
		res = documents.create_bundle(dlv)
		self.assertEqual(res["status"], "Thiếu chứng từ")
		self.assertIn(self.item_cocq, res["missing"])

	def test_create_bundle_ok(self):
		dlv = self._mk_delivery([{"item": self.item_free, "requested_qty": 5}])
		res = documents.create_bundle(dlv)
		self.assertEqual(res["status"], "Chờ phát hành")
		self.assertEqual(res["missing"], [])

	def test_list_release_queue(self):
		dlv = self._mk_delivery([{"item": self.item_free, "requested_qty": 1}])
		documents.create_bundle(dlv)
		res = documents.list_release_queue(page_length=0)
		self.assertEqual(set(res.keys()), {"data", "total_count"})
		self.assertEqual(len(res["data"]), res["total_count"])

	def test_get_bundle(self):
		dlv = self._mk_delivery([{"item": self.item_cocq, "lot": self.lot_nocert, "requested_qty": 2}])
		b = documents.create_bundle(dlv)["bundle"]
		detail = documents.get_bundle(b)
		self.assertEqual(detail["name"], b)
		self.assertEqual(len(detail["lines"]), 1)
		self.assertEqual(detail["lines"][0]["requires_cocq"], 1)
		self.assertEqual(detail["lines"][0]["co_attached"], 0)

	def test_refresh_status(self):
		dlv = self._mk_delivery([{"item": self.item_cocq, "lot": self.lot_nocert, "requested_qty": 2}])
		b = documents.create_bundle(dlv)["bundle"]
		self.assertEqual(frappe.db.get_value("AntMed Document", b, "status"), "Thiếu chứng từ")
		# gắn CO + CQ cho lô rồi refresh
		cert_co = frappe.get_doc({"doctype": "AntMed Certificate", "cert_no": "CO-DOC-1", "cert_type": "CO"}).insert(ignore_permissions=True).name
		cert_cq = frappe.get_doc({"doctype": "AntMed Certificate", "cert_no": "CQ-DOC-1", "cert_type": "CQ"}).insert(ignore_permissions=True).name
		frappe.db.set_value("AntMed Lot", self.lot_nocert, {"co_cert": cert_co, "cq_cert": cert_cq})
		res = documents.refresh_release_status(dlv)
		self.assertEqual(res["status"], "Chờ phát hành")
