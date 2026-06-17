import { readFileSync } from 'fs'
import path from 'path'
import { shouldRedirectNotPermitted } from '../../src/utils/antmedGuard'
import { isAntmedUser, isAntmedPath } from '../../src/utils/antmed'

// W0-2 / DEC-B Gate-3 — router guard allow-check ADDITIVE.
// Test HÀNH VI quyết-định guard (param phát đi == lựa chọn) + đọc cờ boot, KHÔNG hardcode role.

const srcDir = path.resolve(__dirname, '../../src')
const routerSrc = readFileSync(path.join(srcDir, 'router.js'), 'utf8')

const crm = () => ({ isCrmUser: () => true, isAntmedUser: () => false })
const antmed = () => ({ isCrmUser: () => false, isAntmedUser: () => true })
const outsider = () => ({ isCrmUser: () => false, isAntmedUser: () => false })

describe('AntMed router guard — Gate-3 (allow-check additive)', () => {
  // ── 4 case acceptance ─────────────────────────────────────────────
  it('redirects_antmed_user_into_antmed_route — AntMed user vào /antmed/* KHÔNG redirect', () => {
    expect(
      shouldRedirectNotPermitted({ path: '/antmed/hospitals' }, antmed()),
    ).toBe(false)
  })

  it('guard_redirects_antmed_only_user_away_from_crm_routes — AntMed-thuần vào /leads VẪN redirect', () => {
    expect(shouldRedirectNotPermitted({ path: '/leads' }, antmed())).toBe(true)
  })

  it('guard_crm_user_unaffected — CRM user vào /leads VÀ /antmed/* đều pass (no-regression 2 chiều)', () => {
    expect(shouldRedirectNotPermitted({ path: '/leads' }, crm())).toBe(false)
    expect(
      shouldRedirectNotPermitted({ path: '/antmed/hospitals' }, crm()),
    ).toBe(false)
  })

  it('outsider (không CRM không AntMed) bị redirect ở MỌI route', () => {
    expect(
      shouldRedirectNotPermitted({ path: '/antmed/hospitals' }, outsider()),
    ).toBe(true)
    expect(shouldRedirectNotPermitted({ path: '/leads' }, outsider())).toBe(
      true,
    )
  })

  // ── helper: cờ đọc từ boot, KHÔNG hardcode role ───────────────────
  it('isAntmedUser() đọc window.is_antmed_user (cờ boot) — KHÔNG hardcode tên Role', () => {
    const prev = window.is_antmed_user
    window.is_antmed_user = true
    expect(isAntmedUser()).toBe(true)
    window.is_antmed_user = false
    expect(isAntmedUser()).toBe(false)
    delete window.is_antmed_user
    expect(isAntmedUser()).toBe(false) // fallback an toàn = false (chặn)
    window.is_antmed_user = prev
  })

  it('isAntmedPath() nhận diện đúng prefix /antmed', () => {
    expect(isAntmedPath('/antmed')).toBe(true)
    expect(isAntmedPath('/antmed/hospitals/X')).toBe(true)
    expect(isAntmedPath('/leads')).toBe(false)
    expect(isAntmedPath(undefined)).toBe(false)
  })

  // ── router.js wiring (regression: nhánh additive + CRM gốc giữ nguyên) ──
  it('router.js wire nhánh additive qua shouldRedirectNotPermitted + giữ route CRM gốc', () => {
    expect(routerSrc).toMatch(/shouldRedirectNotPermitted/)
    expect(routerSrc).toMatch(/isAntmedUser/)
    // route CRM gốc + route AntMed cùng tồn tại
    expect(routerSrc).toMatch(/name:\s*['"]Leads['"]/)
    expect(routerSrc).toMatch(/name:\s*['"]AntmedHome['"]/)
    // KHÔNG hardcode tên Role AntMed (VI) trong router
    expect(routerSrc).not.toMatch(/NV kinh doanh|Thủ kho|Quản lý/)
  })
})

// ── T4: bảng route 24 màn prototype (role-prefixed, meta antmedShell + role) ──
// Non-destructive (DEC user 2026-06-17): A1=/ceo, KHÔNG hijack Home '/' — landing
// thật giữ nguyên. 24 route trỏ AntmedScreenStub; T5–T14 thay bằng màn thật.
describe('T4 — routing 24 màn prototype', () => {
  const PROTO = [
    ['AntmedCeoDashboard', '/ceo', 'ceo'],
    ['AntmedContractHealth', '/ceo/contract-health', 'ceo'],
    ['AntmedRevenue', '/ceo/revenue', 'ceo'],
    ['AntmedDispatch', '/sales/dispatch', 'sales'],
    ['AntmedTeam', '/sales/team', 'sales'],
    ['AntmedApprovals', '/sales/approvals', 'sales'],
    ['AntmedRepHome', '/rep', 'rep'],
    ['AntmedDeliveryWizard', '/rep/wizard', 'rep'],
    ['AntmedInstrumentChecklist', '/rep/checklist', 'rep'],
    ['AntmedRepDoctor', '/rep/doctor', 'rep'],
    ['AntmedOffline', '/rep/offline', 'rep'],
    ['AntmedWarehouseExport', '/warehouse/export', 'warehouse'],
    ['AntmedConsignment', '/warehouse/consignment', 'warehouse'],
    ['AntmedLotTrace', '/warehouse/lot-trace', 'warehouse'],
    ['AntmedDocsPending', '/docs/pending', 'docs'],
    ['AntmedCoCq', '/docs/co-cq', 'docs'],
    ['AntmedReconciliation', '/docs/reconciliation', 'docs'],
    ['AntmedReceivables', '/finance/receivables', 'finance'],
    ['AntmedCommission', '/finance/commission', 'finance'],
    ['AntmedPortalHome', '/portal', 'portal'],
    ['AntmedPortalHistory', '/portal/history', 'portal'],
    ['AntmedUsers', '/admin/users', 'admin'],
    ['AntmedAudit', '/admin/audit', 'admin'],
    ['AntmedInstruments', '/instruments', 'warehouse'],
  ]

  it('đủ 24 route prototype (name + path) trong router.js', () => {
    expect(PROTO).toHaveLength(24)
    for (const [name, pth] of PROTO) {
      expect(routerSrc).toMatch(new RegExp(`name:\\s*['"]${name}['"]`))
      expect(routerSrc).toContain(`'${pth}'`)
    }
  })

  it('route prototype gắn meta antmedShell:true + role (key, không VI role-name)', () => {
    expect(routerSrc).toMatch(/antmedShell:\s*true/)
    for (const role of [
      'ceo',
      'sales',
      'rep',
      'warehouse',
      'docs',
      'finance',
      'portal',
      'admin',
    ]) {
      expect(routerSrc).toMatch(new RegExp(`role:\\s*['"]${role}['"]`))
    }
  })

  it('A1 = /ceo — non-destructive (KHÔNG gắn antmedShell/redirect cho Home /)', () => {
    // Home '/' vẫn là route 'Home' không component (beforeEach xử lý) — giữ landing thật.
    expect(routerSrc).toMatch(/name:\s*['"]AntmedCeoDashboard['"]/)
    expect(routerSrc).toMatch(/path:\s*['"]\/ceo['"]/)
  })

  it('màn chưa dựng dùng AntmedScreenStub (T5–T14 thay dần)', () => {
    expect(routerSrc).toMatch(/AntmedScreenStub/)
  })
})
