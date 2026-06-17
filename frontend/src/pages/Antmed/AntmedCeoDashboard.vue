<template>
  <main
    class="flex h-full flex-col gap-3 overflow-y-auto p-4"
    aria-labelledby="a1-title"
  >
    <header class="flex items-baseline justify-between">
      <h1 id="a1-title" class="text-lg font-semibold text-teal-900">
        {{ __('Dashboard điều hành') }}
      </h1>
      <span class="text-xs text-ink-gray-5"
        >{{ d.period }} · {{ d.scope }}</span
      >
    </header>

    <!-- 4 KPI -->
    <section
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      :aria-label="__('Chỉ số tổng quan')"
    >
      <AmKpiCard
        v-for="k in d.kpis"
        :key="k.label"
        :label="__(k.label)"
        :value="k.value"
        :sub="k.sub"
        :value-class="k.tone === 'danger' ? 'text-red-600' : ''"
      />
    </section>

    <!-- Bản đồ doanh thu + Top 10 BV -->
    <section class="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <AmCard class="lg:col-span-2" :title="__('Bản đồ Doanh thu theo Tỉnh')">
        <div
          class="flex h-36 items-center justify-center rounded-md border border-dashed border-outline-gray-2 bg-teal-50 text-xs italic text-ink-gray-5"
        >
          🗺 {{ __('Heatmap VN — click tỉnh để drilldown') }}
        </div>
      </AmCard>
      <AmCard :title="__('Top 10 Bệnh viện')">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-left text-ink-gray-5">
              <th class="py-1 font-medium">{{ __('BV') }}</th>
              <th class="py-1 font-medium">{{ __('DT') }}</th>
              <th class="py-1 font-medium">{{ __('Quota') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="h in d.topHospitals"
              :key="h.name"
              class="border-t border-outline-gray-1"
            >
              <td class="py-1">{{ h.name }}</td>
              <td class="py-1 tabular-nums">{{ h.revenue }}</td>
              <td class="py-1">
                <AmBar :pct="h.quotaPct" :theme="barTheme(h.tone)" />
              </td>
            </tr>
          </tbody>
        </table>
      </AmCard>
    </section>

    <!-- Pipeline + Cảnh báo -->
    <section class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <AmCard :title="__('Pipeline gói thầu')">
        <AmFunnel :stages="funnelStages" />
      </AmCard>
      <AmCard :title="__('⚠ Cảnh báo điều hành')">
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="(a, i) in d.alerts"
            :key="i"
            class="flex items-center gap-2 text-xs"
          >
            <AmPill :theme="a.tone" :label="a.tag" />
            <span>{{ a.text }}</span>
          </li>
        </ul>
      </AmCard>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { ceoDashboard } from '@/data/antmedMock'
import AmKpiCard from '@/components/Antmed/ui/AmKpiCard.vue'
import AmCard from '@/components/Antmed/ui/AmCard.vue'
import AmBar from '@/components/Antmed/ui/AmBar.vue'
import AmFunnel from '@/components/Antmed/ui/AmFunnel.vue'
import AmPill from '@/components/Antmed/ui/AmPill.vue'

const d = ceoDashboard
// Funnel width giảm dần theo mockup (Lead 100 → Trúng 38).
const FUNNEL_W = [100, 88, 70, 55, 38]
const funnelStages = computed(() =>
  d.funnel.map((f, i) => ({
    label: __(f.stage),
    count: f.count,
    width: FUNNEL_W[i] ?? 100,
  })),
)
const barTheme = (tone) =>
  tone === 'warn' || tone === 'danger' ? tone : 'default'
</script>
