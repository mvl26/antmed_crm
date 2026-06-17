<template>
  <main
    class="flex h-full flex-col gap-3 overflow-y-auto p-4"
    aria-labelledby="a3-title"
  >
    <h1 id="a3-title" class="text-lg font-semibold text-teal-900">
      {{ __('Báo cáo Doanh thu') }}
    </h1>

    <!-- 3 KPI -->
    <section
      class="grid grid-cols-1 gap-3 sm:grid-cols-3"
      :aria-label="__('Chỉ số doanh thu')"
    >
      <AmKpiCard
        v-for="k in revenue.kpis"
        :key="k.label"
        :label="__(k.label)"
        :value="k.value"
        :sub="k.sub"
        :value-class="k.tone === 'danger' ? 'text-red-600' : ''"
      />
    </section>

    <!-- 2 chart placeholder -->
    <section class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <AmCard :title="__('Doanh thu theo Nhóm vật tư')">
        <div
          class="flex h-32 items-center justify-center rounded-md border border-dashed border-outline-gray-2 bg-teal-50 text-xs italic text-ink-gray-5"
        >
          📊 {{ __('Stacked bar theo tháng + nhóm') }}
        </div>
      </AmCard>
      <AmCard :title="__('Cơ cấu doanh thu')">
        <div
          class="flex h-32 items-center justify-center rounded-md border border-dashed border-outline-gray-2 bg-teal-50 text-xs italic text-ink-gray-5"
        >
          🥧 {{ __('Pie chart % theo nhóm') }}
        </div>
      </AmCard>
    </section>

    <!-- Heatmap NV × BV -->
    <AmCard :title="__('Doanh thu theo NV Kinh doanh × Bệnh viện')">
      <table class="w-full text-xs">
        <thead>
          <tr class="text-left text-ink-gray-5">
            <th class="py-1 font-medium">{{ __('NV') }}</th>
            <th
              v-for="c in revenue.heatColumns"
              :key="c"
              class="py-1 text-center font-medium"
            >
              {{ c }}
            </th>
            <th class="py-1 text-right font-medium">{{ __('Tổng (tr)') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in revenue.heatmap"
            :key="row.rep"
            class="border-t border-outline-gray-1"
          >
            <td class="py-1">{{ row.rep }}</td>
            <td
              v-for="(cell, i) in row.cells"
              :key="i"
              class="px-0.5 py-1 text-center"
            >
              <AmHeatCell :level="cell.lvl" :value="cell.v" />
            </td>
            <td class="py-1 text-right font-bold tabular-nums">
              {{ row.total }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-2 flex gap-3 text-[10px] text-ink-gray-5">
        <span
          v-for="l in revenue.legend"
          :key="l.label"
          class="inline-flex items-center gap-1"
        >
          <i
            class="inline-block h-2.5 w-2.5 rounded-sm"
            :style="{ background: l.color }"
          />{{ l.label }}
        </span>
      </div>
    </AmCard>
  </main>
</template>

<script setup>
import { revenue } from '@/data/antmedMock'
import AmKpiCard from '@/components/Antmed/ui/AmKpiCard.vue'
import AmCard from '@/components/Antmed/ui/AmCard.vue'
import AmHeatCell from '@/components/Antmed/ui/AmHeatCell.vue'
</script>
