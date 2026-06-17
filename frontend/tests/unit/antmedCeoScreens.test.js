import { readFileSync } from 'fs'
import path from 'path'

// T5 — CEO screens A1/A2/A3 (mockup §A). Idiom: content-assert nguồn (KHÔNG @vue/test-utils).
// Mỗi màn render trong AntmedLayout (route meta.antmedShell, T4) + dùng UI kit (T1) + mock (T2).

const srcDir = path.resolve(__dirname, '../../src')
const read = (rel) => readFileSync(path.join(srcDir, rel), 'utf8')
const a1 = read('pages/Antmed/AntmedCeoDashboard.vue')
const a2 = read('pages/Antmed/AntmedContractHealth.vue')
const a3 = read('pages/Antmed/AntmedRevenue.vue')
const routerSrc = read('router.js')

describe('A1 · CEO Dashboard điều hành', () => {
  it('lấy dữ liệu mẫu ceoDashboard (antmedMock), KHÔNG hardcode số', () => {
    expect(a1).toMatch(/ceoDashboard/)
    expect(a1).toMatch(/from ['"]@\/data\/antmedMock['"]/)
  })
  it('4 KPI (AmKpiCard) + Funnel + Top 10 BV (AmBar) + Cảnh báo', () => {
    expect(a1).toMatch(/AmKpiCard/)
    expect(a1).toMatch(/AmFunnel/)
    expect(a1).toMatch(/AmBar/)
    expect(a1).toMatch(/Top 10|Top 10 Bệnh viện/i)
    expect(a1).toMatch(/Cảnh báo/)
    expect(a1).toMatch(/AmAlertBox|AmPill/)
  })
  it('có placeholder bản đồ doanh thu (heatmap-map)', () => {
    expect(a1).toMatch(/Bản đồ|Heatmap|🗺/)
  })
})

describe('A2 · Sức khỏe hợp đồng', () => {
  it('lấy contracts mẫu + render bảng HĐ (contractNo) + quota bar + status pill', () => {
    expect(a2).toMatch(/contracts/)
    expect(a2).toMatch(/from ['"]@\/data\/antmedMock['"]/)
    expect(a2).toMatch(/contractNo/)
    expect(a2).toMatch(/AmBar/)
    expect(a2).toMatch(/AmPill/)
  })
  it('có card top SKU (tiêu hao)', () => {
    expect(a2).toMatch(/topSku|SKU/)
  })
})

describe('A3 · Báo cáo doanh thu', () => {
  it('lấy revenue mẫu + 3 KPI + heatmap NV×BV (AmHeatCell) + legend', () => {
    expect(a3).toMatch(/revenue/)
    expect(a3).toMatch(/from ['"]@\/data\/antmedMock['"]/)
    expect(a3).toMatch(/AmKpiCard/)
    expect(a3).toMatch(/AmHeatCell/)
    expect(a3).toMatch(/heatmap|heatColumns/)
  })
})

describe('T5 — route CEO trỏ màn thật (KHÔNG còn stub)', () => {
  it('3 route CEO dùng component thật, không AntmedScreenStub', () => {
    expect(routerSrc).toMatch(/AntmedCeoDashboard\.vue/)
    expect(routerSrc).toMatch(/AntmedContractHealth\.vue/)
    expect(routerSrc).toMatch(/AntmedRevenue\.vue/)
  })
})
