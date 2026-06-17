<template>
  <main
    class="flex h-full flex-col gap-3 overflow-y-auto p-4"
    aria-labelledby="a2-title"
  >
    <h1 id="a2-title" class="text-lg font-semibold text-teal-900">
      {{ __('Sức khỏe Hợp đồng') }}
    </h1>

    <!-- Bộ lọc -->
    <AmCard>
      <div class="flex flex-wrap items-center gap-2">
        <input
          class="flex-1 rounded-md border border-outline-gray-2 px-2.5 py-1.5 text-xs"
          :placeholder="__('🔍 Tìm BV...')"
          :aria-label="__('Tìm bệnh viện')"
        />
        <select
          class="rounded-md border border-outline-gray-2 px-2 py-1.5 text-xs"
          :aria-label="__('Trạng thái')"
        >
          <option>{{ __('Tất cả trạng thái') }}</option>
        </select>
        <button
          class="rounded-md border border-teal-600 px-3 py-1.5 text-xs font-medium text-teal-700"
        >
          {{ __('⬇ Xuất Excel') }}
        </button>
      </div>
    </AmCard>

    <!-- Bảng hợp đồng -->
    <AmCard>
      <table class="w-full text-xs">
        <thead>
          <tr class="text-left text-ink-gray-5">
            <th class="py-1 font-medium">{{ __('Số HĐ') }}</th>
            <th class="py-1 font-medium">{{ __('Bệnh viện') }}</th>
            <th class="py-1 font-medium">{{ __('Hết hạn') }}</th>
            <th class="py-1 font-medium">{{ __('Giá trị (tỷ)') }}</th>
            <th class="py-1 font-medium">{{ __('% Quota') }}</th>
            <th class="py-1 font-medium">{{ __('SKU') }}</th>
            <th class="py-1 font-medium">{{ __('Trạng thái') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in contracts.rows"
            :key="r.contractNo"
            class="border-t border-outline-gray-1"
          >
            <td class="py-1 font-medium">{{ r.contractNo }}</td>
            <td class="py-1">{{ r.hospital }}</td>
            <td class="py-1 tabular-nums">{{ r.expireAt }}</td>
            <td class="py-1 tabular-nums">{{ r.value }}</td>
            <td class="py-1">
              <AmBar
                v-if="r.quotaPct != null"
                :pct="r.quotaPct"
                :theme="
                  r.quotaTone === 'warn' || r.quotaTone === 'danger'
                    ? r.quotaTone
                    : 'default'
                "
              />
              <span v-else class="text-ink-gray-4">—</span>
            </td>
            <td class="py-1 tabular-nums">{{ r.sku ?? '—' }}</td>
            <td class="py-1">
              <AmPill :theme="r.statusTone" :label="r.status" />
            </td>
          </tr>
        </tbody>
      </table>
    </AmCard>

    <!-- Tiêu hao + Top SKU -->
    <section class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <AmCard :title="__('Tiêu hao HĐ theo tháng')">
        <div
          class="flex h-32 items-center justify-center rounded-md border border-dashed border-outline-gray-2 bg-teal-50 text-xs italic text-ink-gray-5"
        >
          📈 {{ __('Bar chart 12 tháng') }}
        </div>
      </AmCard>
      <AmCard :title="__('Danh mục VT trúng thầu — top 5')">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-left text-ink-gray-5">
              <th class="py-1 font-medium">{{ __('SKU') }}</th>
              <th class="py-1 font-medium">{{ __('Quota') }}</th>
              <th class="py-1 font-medium">{{ __('Đã xuất') }}</th>
              <th class="py-1 font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in contracts.topSku"
              :key="s.sku"
              class="border-t border-outline-gray-1"
            >
              <td class="py-1">{{ s.sku }}</td>
              <td class="py-1 tabular-nums">{{ s.quota }}</td>
              <td class="py-1 tabular-nums">{{ s.issued }}</td>
              <td class="py-1 tabular-nums">{{ s.pct }}%</td>
            </tr>
          </tbody>
        </table>
      </AmCard>
    </section>
  </main>
</template>

<script setup>
import { contracts } from '@/data/antmedMock'
import AmCard from '@/components/Antmed/ui/AmCard.vue'
import AmBar from '@/components/Antmed/ui/AmBar.vue'
import AmPill from '@/components/Antmed/ui/AmPill.vue'
</script>
