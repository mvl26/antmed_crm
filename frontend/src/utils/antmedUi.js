/**
 * AntMed prototype — UI helper thuần (palette mockup → token Tailwind dự án).
 *
 * Tham chiếu: docs/antmed_crm/docs/AntMed_CRM_Full_Mockups.html.
 * Mockup palette → Tailwind:
 *   brand #0EA5A4 → teal-600 · brand-dark #134E4A → teal-900 · brand-soft #E0F2F1 → teal-50
 *   accent #F97316 → orange-500 · danger #DC2626 → red-600 · ok #16A34A → green-600 · warn #F59E0B → amber-500
 *
 * Đây là tầng thuần (không Vue) để unit-test trực tiếp — component chỉ bind class trả về.
 */

/** Pill trạng thái (mockup .pill.{ok|warn|danger|info|neutral}). Kèm CHỮ — không chỉ màu (WCAG). */
export const PILL_THEME = {
  ok: 'bg-green-100 text-green-800',
  warn: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-ink-gray-2 text-ink-gray-7',
}

/** Class pill theo theme; theme lạ → neutral (an toàn, không vỡ render). */
export function pillClass(theme) {
  return PILL_THEME[theme] || PILL_THEME.neutral
}

/** Thanh bar tiến độ (mockup .bar / .bar.warn / .bar.danger). */
export const BAR_THEME = {
  default: 'bg-teal-600',
  warn: 'bg-amber-500',
  danger: 'bg-red-500',
}
export function barFillClass(theme) {
  return BAR_THEME[theme] || BAR_THEME.default
}

/** Heatmap cell mức 1..5 (mockup .h1c..h5c — đỏ tăng dần). */
export const HEAT_CLASS = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-red-200 text-red-900',
  3: 'bg-red-300 text-red-900',
  4: 'bg-red-400 text-white',
  5: 'bg-red-500 text-white',
}
export function heatClass(level) {
  return HEAT_CLASS[level] || ''
}

/** Một chặng lifecycle/steps (mockup .lifecycle div.done/.cur, .step.done/.current). */
export function stageClass(status) {
  if (status === 'done') return 'bg-green-100 text-green-800 font-semibold'
  if (status === 'current' || status === 'cur')
    return 'bg-teal-600 text-white font-semibold'
  return 'bg-ink-gray-2 text-ink-gray-5'
}

/** Alert box theme (mockup .alert-box / .info / .danger). */
export const ALERT_THEME = {
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  warn: 'bg-amber-50 border-amber-500 text-amber-800',
  danger: 'bg-red-50 border-red-500 text-red-800',
}
export function alertClass(theme) {
  return ALERT_THEME[theme] || ALERT_THEME.warn
}

/** Viền trái accent cho kanban card (mockup .kcard.urgent/.warn/.ok). */
export const KANBAN_ACCENT = {
  urgent: 'border-l-4 border-l-red-500',
  warn: 'border-l-4 border-l-orange-500',
  ok: 'border-l-4 border-l-green-600',
}
export function kanbanAccentClass(accent) {
  return KANBAN_ACCENT[accent] || ''
}
