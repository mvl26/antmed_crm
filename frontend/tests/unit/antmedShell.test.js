import { readFileSync } from 'fs'
import path from 'path'
import {
  ANTMED_NAV,
  isNavActive,
  ANTMED_ROLES,
  navForRole,
} from '../../src/data/antmedNav'

// Slice 1 — AntMed app shell (topbar + sidebar) khớp mockup A1.
// T3 — shell ROLE-AWARE: nav theo vai trò (ANTMED_ROLES/navForRole) + role switcher +
// App.vue chọn layout theo route.meta.antmedShell. Idiom test = content-assert nguồn +
// behavior-assert helper thuần (KHÔNG @vue/test-utils — theo antmedRouterGuard.test.js).

const srcDir = path.resolve(__dirname, '../../src')
const layoutSrc = readFileSync(
  path.join(srcDir, 'components/Antmed/AntmedLayout.vue'),
  'utf8',
)
const appSrc = readFileSync(path.join(srcDir, 'App.vue'), 'utf8')

describe('AntMed nav config — single source cho sidebar shell', () => {
  it('Dashboard + Bệnh viện là route thật đã có (enabled)', () => {
    const byKey = Object.fromEntries(ANTMED_NAV.map((i) => [i.key, i]))
    expect(byKey.dashboard).toMatchObject({ to: '/antmed', enabled: true })
    expect(byKey.hospitals).toMatchObject({
      to: '/antmed/hospitals',
      enabled: true,
    })
  })

  it('mỗi item có label/icon/to/enabled hợp lệ', () => {
    for (const i of ANTMED_NAV) {
      expect(i.label).toBeTruthy()
      expect(i.icon).toBeTruthy()
      expect(typeof i.to).toBe('string')
      expect(typeof i.enabled).toBe('boolean')
    }
  })

  it('có stub module sắp tới (Hợp đồng / Tồn kho / Bộ dụng cụ) — disabled', () => {
    const labels = ANTMED_NAV.map((i) => i.label)
    expect(labels).toEqual(
      expect.arrayContaining(['Hợp đồng', 'Tồn kho', 'Bộ dụng cụ']),
    )
    expect(ANTMED_NAV.some((i) => !i.enabled)).toBe(true)
  })
})

describe('isNavActive — dashboard exact, sub-route theo prefix', () => {
  const dash = { to: '/antmed' }
  const hosp = { to: '/antmed/hospitals' }

  it('Dashboard chỉ active khi path đúng /antmed (không active ở sub-route)', () => {
    expect(isNavActive(dash, '/antmed')).toBe(true)
    expect(isNavActive(dash, '/antmed/hospitals')).toBe(false)
  })

  it('Bệnh viện active ở /antmed/hospitals và trang chi tiết con', () => {
    expect(isNavActive(hosp, '/antmed/hospitals')).toBe(true)
    expect(isNavActive(hosp, '/antmed/hospitals/BV-001')).toBe(true)
    expect(isNavActive(hosp, '/antmed')).toBe(false)
  })

  it('an toàn với input xấu', () => {
    expect(isNavActive(null, '/antmed')).toBe(false)
    expect(isNavActive(hosp, undefined)).toBe(false)
  })
})

// ── T3: role-aware nav (8 vai trò mockup) ──────────────────────────────────
describe('ANTMED_ROLES — 8 vai trò mockup (CEO..Admin) + portal variant', () => {
  it('đủ 8 vai trò, mỗi role có key + label', () => {
    expect(ANTMED_ROLES).toHaveLength(8)
    for (const r of ANTMED_ROLES) {
      expect(r.key).toBeTruthy()
      expect(r.label).toBeTruthy()
    }
  })

  it('phủ đúng 8 key vai trò theo mockup', () => {
    const keys = ANTMED_ROLES.map((r) => r.key).sort()
    expect(keys).toEqual(
      [
        'admin',
        'ceo',
        'docs',
        'finance',
        'portal',
        'rep',
        'sales',
        'warehouse',
      ].sort(),
    )
  })

  it('role portal đánh dấu variant=portal (topbar trắng); role rep là mobile', () => {
    const byKey = Object.fromEntries(ANTMED_ROLES.map((r) => [r.key, r]))
    expect(byKey.portal.variant).toBe('portal')
    expect(byKey.rep.mobile).toBe(true)
  })
})

describe('navForRole — nav riêng từng vai trò + fallback an toàn', () => {
  it('navForRole(role) trả mảng item hợp lệ cho mọi vai trò', () => {
    for (const r of ANTMED_ROLES) {
      const nav = navForRole(r.key)
      expect(Array.isArray(nav)).toBe(true)
      expect(nav.length).toBeGreaterThan(0)
      for (const i of nav) {
        expect(i.label).toBeTruthy()
        expect(i.icon).toBeTruthy()
        expect(typeof i.to).toBe('string')
        expect(typeof i.enabled).toBe('boolean')
      }
    }
  })

  it('nav khớp sidebar mockup (CEO/TKD/Thủ kho/Chứng từ/Kế toán/Admin)', () => {
    const lbl = (role) => navForRole(role).map((i) => i.label)
    expect(lbl('ceo')).toEqual(
      expect.arrayContaining(['Dashboard', 'Hợp đồng', 'Doanh thu']),
    )
    expect(lbl('sales')).toEqual(
      expect.arrayContaining(['Điều phối', 'Duyệt yêu cầu', 'Đội ngũ']),
    )
    expect(lbl('warehouse')).toEqual(
      expect.arrayContaining(['Xuất cho NV', 'Kho ký gửi BV', 'Truy vết lot']),
    )
    expect(lbl('docs')).toEqual(
      expect.arrayContaining(['Hàng chờ', 'Kho CO/CQ', 'Đối soát ký nhận']),
    )
    expect(lbl('finance')).toEqual(
      expect.arrayContaining(['Công nợ', 'Hoa hồng NV']),
    )
    expect(lbl('admin')).toEqual(
      expect.arrayContaining(['User & Role', 'Audit log']),
    )
  })

  it('fallback: role không xác định → ANTMED_NAV (giữ shell /antmed cũ, no-regression)', () => {
    expect(navForRole('khong-ton-tai')).toBe(ANTMED_NAV)
    expect(navForRole(undefined)).toBe(ANTMED_NAV)
    expect(navForRole('')).toBe(ANTMED_NAV)
  })
})

describe('AntmedLayout.vue — shell mockup + role switcher', () => {
  it('có topbar thương hiệu (logo AntMed CRM)', () => {
    expect(layoutSrc).toMatch(/AntMed CRM/)
  })

  it('sidebar render qua navForRole (không hardcode 1 danh sách)', () => {
    expect(layoutSrc).toMatch(/antmedNav/)
    expect(layoutSrc).toMatch(/navForRole/)
  })

  it('có role switcher (ANTMED_ROLES) để duyệt 8 vai trò', () => {
    expect(layoutSrc).toMatch(/ANTMED_ROLES/)
  })

  it('hỗ trợ portal variant (topbar trắng cho vai trò G)', () => {
    expect(layoutSrc).toMatch(/portal/)
  })

  it('dùng RouterLink cho item enabled + có slot nội dung', () => {
    expect(layoutSrc).toMatch(/RouterLink|router-link/)
    expect(layoutSrc).toMatch(/<slot/)
  })

  it('đánh dấu active qua isNavActive', () => {
    expect(layoutSrc).toMatch(/isNavActive/)
  })
})

describe('App.vue — chọn layout AntMed theo route.meta.antmedShell', () => {
  it('dùng route.meta.antmedShell (mở rộng) + giữ isAntmedPath (tương thích)', () => {
    expect(appSrc).toMatch(/meta\??\.antmedShell|antmedShell/)
    expect(appSrc).toMatch(/isAntmedPath/)
    expect(appSrc).toMatch(/AntmedLayout/)
  })
})
