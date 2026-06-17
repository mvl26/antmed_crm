/**
 * AntMed SPA — single source danh sách điều hướng cho app shell (sidebar mockup A1).
 *
 * Tham chiếu mockup: docs/docs/AntMed_CRM_Full_Mockups.html (sidebar nav).
 * Mỗi item:
 *   - key:     định danh ổn định (test + active-state).
 *   - label:   nhãn tiếng Việt hiển thị.
 *   - icon:    emoji glyph (khớp mockup; nhẹ, không cần icon-set).
 *   - to:      path SPA (vue-router).
 *   - enabled: true = route đã build (điều hướng được);
 *              false = module chưa build → render "Sắp có", KHÔNG điều hướng (tránh dead-link).
 *
 * Đổi/thêm màn = sửa DUY NHẤT ở đây (sidebar render từ mảng này). Khi build module mới
 * (M02 Hợp đồng, M03 Tồn kho, …) → bật enabled=true + thêm route tương ứng trong router.js.
 */
export const ANTMED_NAV = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    to: '/antmed',
    enabled: true,
  },
  {
    key: 'hospitals',
    label: 'Bệnh viện',
    icon: '🏥',
    to: '/antmed/hospitals',
    enabled: true,
  },
  {
    key: 'contracts',
    label: 'Hợp đồng',
    icon: '📋',
    to: '/antmed/contracts',
    enabled: true,
  },
  {
    key: 'inventory',
    label: 'Tồn kho',
    icon: '📦',
    to: '/antmed/inventory',
    enabled: false,
  },
  {
    key: 'deliveries',
    label: 'Giao phòng mổ',
    icon: '🚚',
    to: '/antmed/deliveries',
    enabled: false,
  },
  {
    key: 'instruments',
    label: 'Bộ dụng cụ',
    icon: '🧰',
    to: '/antmed/instruments',
    enabled: false,
  },
  {
    key: 'documents',
    label: 'Chứng từ',
    icon: '📄',
    to: '/antmed/documents',
    enabled: false,
  },
  { key: 'kpi', label: 'KPI', icon: '👥', to: '/antmed/kpi', enabled: false },
  {
    key: 'reports',
    label: 'Báo cáo',
    icon: '📈',
    to: '/antmed/reports',
    enabled: false,
  },
]

/**
 * Item có đang active với `path` hiện tại không.
 *
 * Lưu ý edge-case: MỌI path AntMed đều bắt đầu bằng '/antmed', nên Dashboard ('/antmed')
 * chỉ active khi path TRÙNG KHỚP (exact) — không dùng prefix, nếu không Dashboard sẽ
 * luôn active ở mọi trang con. Các item khác active khi path == to hoặc là sub-route (to + '/').
 *
 * @param {{to?: string}} item
 * @param {string} path
 * @returns {boolean}
 */
export function isNavActive(item, path) {
  if (!item || typeof item.to !== 'string' || typeof path !== 'string')
    return false
  if (item.to === '/antmed') return path === '/antmed' || path === '/antmed/'
  return path === item.to || path.startsWith(item.to + '/')
}

/**
 * T3 — Shell ROLE-AWARE: 8 vai trò mockup (docs/.../AntMed_CRM_Full_Mockups.html).
 * Mỗi role có sidebar riêng (ROLE_NAV). `variant:'portal'` = topbar trắng (vai trò G);
 * `mobile:true` = NV kinh doanh dùng phone-frame (tabbar) thay sidebar.
 */
export const ANTMED_ROLES = [
  { key: 'ceo', label: 'CEO / Ban GĐ', avatar: 'CEO' },
  { key: 'sales', label: 'Trưởng KD', avatar: 'TK' },
  { key: 'rep', label: 'NV Kinh doanh', avatar: 'NA', mobile: true },
  { key: 'warehouse', label: 'Thủ kho Tổng', avatar: 'TK' },
  { key: 'docs', label: 'Chứng từ / Pháp lý', avatar: 'CT' },
  { key: 'finance', label: 'Kế toán', avatar: 'KT' },
  {
    key: 'portal',
    label: 'Portal Bác sỹ / BV',
    avatar: 'TH',
    variant: 'portal',
  },
  { key: 'admin', label: 'System Admin', avatar: 'AD' },
]

/**
 * Nav theo vai trò — labels/icons bám sidebar mockup. `to` = route role-prefixed
 * (T4 đăng ký). `enabled:false` ⇒ render "Sắp có" (tránh dead-link tới khi T4/T5+
 * dựng route/màn). T4 sẽ bật enabled khi route tồn tại.
 */
export const ROLE_NAV = {
  ceo: [
    {
      key: 'ceo-dash',
      label: 'Dashboard',
      icon: '📊',
      to: '/',
      enabled: false,
    },
    {
      key: 'ceo-contracts',
      label: 'Hợp đồng',
      icon: '📋',
      to: '/ceo/contract-health',
      enabled: false,
    },
    {
      key: 'ceo-revenue',
      label: 'Doanh thu',
      icon: '💰',
      to: '/ceo/revenue',
      enabled: false,
    },
    {
      key: 'ceo-inventory',
      label: 'Tồn kho',
      icon: '📦',
      to: '/warehouse/consignment',
      enabled: false,
    },
    {
      key: 'ceo-instruments',
      label: 'Bộ dụng cụ',
      icon: '🧰',
      to: '/instruments',
      enabled: false,
    },
    {
      key: 'ceo-kpi',
      label: 'KPI NS',
      icon: '👥',
      to: '/sales/team',
      enabled: false,
    },
    {
      key: 'ceo-reports',
      label: 'Báo cáo',
      icon: '📈',
      to: '/ceo/revenue',
      enabled: false,
    },
  ],
  sales: [
    {
      key: 'sales-dispatch',
      label: 'Điều phối',
      icon: '🎯',
      to: '/sales/dispatch',
      enabled: false,
    },
    {
      key: 'sales-approvals',
      label: 'Duyệt yêu cầu',
      icon: '📥',
      to: '/sales/approvals',
      enabled: false,
    },
    {
      key: 'sales-team',
      label: 'Đội ngũ',
      icon: '👥',
      to: '/sales/team',
      enabled: false,
    },
    {
      key: 'sales-customers',
      label: 'Khách hàng',
      icon: '🏥',
      to: '/antmed/hospitals',
      enabled: true,
    },
    {
      key: 'sales-instruments',
      label: 'Bộ dụng cụ',
      icon: '🧰',
      to: '/instruments',
      enabled: false,
    },
  ],
  rep: [
    {
      key: 'rep-home',
      label: 'Trang chủ',
      icon: '🏠',
      to: '/rep',
      enabled: false,
    },
    {
      key: 'rep-wizard',
      label: 'Giao hàng',
      icon: '🚚',
      to: '/rep/wizard',
      enabled: false,
    },
    {
      key: 'rep-checklist',
      label: 'Bộ dụng cụ',
      icon: '🧰',
      to: '/rep/checklist',
      enabled: false,
    },
    {
      key: 'rep-doctor',
      label: 'CRM Bác sỹ',
      icon: '👨‍⚕️',
      to: '/rep/doctor',
      enabled: false,
    },
    {
      key: 'rep-offline',
      label: 'Offline',
      icon: '📴',
      to: '/rep/offline',
      enabled: false,
    },
  ],
  warehouse: [
    {
      key: 'wh-import',
      label: 'Nhập kho',
      icon: '📥',
      to: '/warehouse/import',
      enabled: false,
    },
    {
      key: 'wh-export',
      label: 'Xuất cho NV',
      icon: '📤',
      to: '/warehouse/export',
      enabled: false,
    },
    {
      key: 'wh-consignment',
      label: 'Kho ký gửi BV',
      icon: '🏥',
      to: '/warehouse/consignment',
      enabled: false,
    },
    {
      key: 'wh-lot-trace',
      label: 'Truy vết lot',
      icon: '🔍',
      to: '/warehouse/lot-trace',
      enabled: false,
    },
    {
      key: 'wh-instruments',
      label: 'Bộ dụng cụ',
      icon: '🧰',
      to: '/instruments',
      enabled: false,
    },
  ],
  docs: [
    {
      key: 'docs-pending',
      label: 'Hàng chờ',
      icon: '📥',
      to: '/docs/pending',
      enabled: false,
    },
    {
      key: 'docs-co-cq',
      label: 'Kho CO/CQ',
      icon: '📂',
      to: '/docs/co-cq',
      enabled: false,
    },
    {
      key: 'docs-einvoice',
      label: 'Hóa đơn điện tử',
      icon: '🧾',
      to: '/docs/pending',
      enabled: false,
    },
    {
      key: 'docs-reconciliation',
      label: 'Đối soát ký nhận',
      icon: '✍',
      to: '/docs/reconciliation',
      enabled: false,
    },
  ],
  finance: [
    {
      key: 'fin-invoices',
      label: 'Hóa đơn',
      icon: '🧾',
      to: '/finance/receivables',
      enabled: false,
    },
    {
      key: 'fin-receivables',
      label: 'Công nợ',
      icon: '💳',
      to: '/finance/receivables',
      enabled: false,
    },
    {
      key: 'fin-commission',
      label: 'Hoa hồng NV',
      icon: '💼',
      to: '/finance/commission',
      enabled: false,
    },
  ],
  portal: [
    {
      key: 'portal-call',
      label: 'Gọi vật tư',
      icon: '🩺',
      to: '/portal',
      enabled: false,
    },
    {
      key: 'portal-loan',
      label: 'Mượn bộ dụng cụ',
      icon: '🧰',
      to: '/portal',
      enabled: false,
    },
    {
      key: 'portal-history',
      label: 'Lịch sử & chứng từ',
      icon: '📄',
      to: '/portal/history',
      enabled: false,
    },
  ],
  admin: [
    {
      key: 'admin-users',
      label: 'User & Role',
      icon: '👥',
      to: '/admin/users',
      enabled: false,
    },
    {
      key: 'admin-rules',
      label: 'Quy tắc KD',
      icon: '📜',
      to: '/admin/users',
      enabled: false,
    },
    {
      key: 'admin-audit',
      label: 'Audit log',
      icon: '🔍',
      to: '/admin/audit',
      enabled: false,
    },
    {
      key: 'admin-integrations',
      label: 'Tích hợp',
      icon: '🔌',
      to: '/admin/users',
      enabled: false,
    },
  ],
}

/**
 * Nav cho 1 vai trò. Role lạ/rỗng/undefined → ANTMED_NAV (giữ shell `/antmed/*`
 * real-data cũ, no-regression). Single-source: đổi nav = sửa ROLE_NAV ở đây.
 *
 * @param {string} [role]
 * @returns {Array}
 */
export function navForRole(role) {
  return ROLE_NAV[role] || ANTMED_NAV
}
