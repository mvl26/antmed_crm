import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  PILL_THEME,
  pillClass,
  barFillClass,
  heatClass,
  stageClass,
  alertClass,
  kanbanAccentClass,
} from '../../src/utils/antmedUi'

// T1 — UI kit prototype. Test tầng thuần (antmedUi.js) + content-assert mỗi component tồn tại.
// Theo idiom dự án (antmedShell.test.js): KHÔNG @vue/test-utils.

describe('antmedUi — pill theme', () => {
  it('PILL_THEME phủ đủ 5 trạng thái mockup', () => {
    expect(Object.keys(PILL_THEME).sort()).toEqual(
      ['danger', 'info', 'neutral', 'ok', 'warn'].sort(),
    )
  })
  it('pillClass map đúng + fallback neutral cho theme lạ', () => {
    expect(pillClass('ok')).toBe(PILL_THEME.ok)
    expect(pillClass('danger')).toBe(PILL_THEME.danger)
    expect(pillClass('khong-ton-tai')).toBe(PILL_THEME.neutral)
  })
})

describe('antmedUi — bar / heat / stage / alert / kanban', () => {
  it('barFillClass default/warn/danger', () => {
    expect(barFillClass('warn')).toMatch(/amber/)
    expect(barFillClass('danger')).toMatch(/red/)
    expect(barFillClass('xxx')).toMatch(/teal/) // fallback default
  })
  it('heatClass 1..5 có class, ngoài range = rỗng', () => {
    for (let l = 1; l <= 5; l++) expect(heatClass(l)).toBeTruthy()
    expect(heatClass(0)).toBe('')
    expect(heatClass(9)).toBe('')
  })
  it('stageClass: done xanh lá, current teal, còn lại xám', () => {
    expect(stageClass('done')).toMatch(/green/)
    expect(stageClass('current')).toMatch(/teal/)
    expect(stageClass('cur')).toMatch(/teal/)
    expect(stageClass('todo')).toMatch(/ink-gray/)
  })
  it('alertClass info/warn/danger + fallback warn', () => {
    expect(alertClass('info')).toMatch(/blue/)
    expect(alertClass('danger')).toMatch(/red/)
    expect(alertClass('zzz')).toBe(alertClass('warn'))
  })
  it('kanbanAccentClass urgent/warn/ok + rỗng khi không có', () => {
    expect(kanbanAccentClass('urgent')).toMatch(/red/)
    expect(kanbanAccentClass('ok')).toMatch(/green/)
    expect(kanbanAccentClass('')).toBe('')
  })
})

describe('UI kit — components/Antmed/ui/* tồn tại & hợp lệ', () => {
  const uiDir = path.resolve(__dirname, '../../src/components/Antmed/ui')
  const KIT = [
    'AmPill',
    'AmCard',
    'AmKpiCard',
    'AmBar',
    'AmLifecycle',
    'AmSteps',
    'AmTimeline',
    'AmFunnel',
    'AmHeatCell',
    'AmKanbanColumn',
    'AmKanbanCard',
    'AmPhoneFrame',
    'AmTablet',
    'AmRoleBand',
    'AmScanBox',
    'AmAlertBox',
    'AmSignaturePad',
  ]

  it.each(KIT)('%s.vue có <template>', (name) => {
    const file = path.join(uiDir, name + '.vue')
    expect(existsSync(file)).toBe(true)
    expect(readFileSync(file, 'utf8')).toMatch(/<template>/)
  })
})
