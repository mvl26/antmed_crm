<template>
  <main class="flex h-full flex-col" aria-labelledby="antmed-leads-title">
    <header class="flex flex-col gap-2 border-b border-outline-gray-modals px-6 py-4">
      <nav class="text-p-xs text-ink-gray-5" :aria-label="__('Đường dẫn')">
        <RouterLink to="/antmed" class="rounded text-ink-gray-6 hover:text-ink-gray-8">{{ __('Trang chủ') }}</RouterLink>
        <span class="px-1.5 text-ink-gray-4" aria-hidden="true">›</span>
        <span class="text-ink-gray-7" aria-current="page">{{ __('Khách hàng tiềm năng (Lead)') }}</span>
      </nav>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="antmed-leads-title" class="text-xl font-semibold text-ink-gray-9">🧲 {{ __('Quản lý Lead') }}</h1>
          <p class="text-p-sm text-ink-gray-6">{{ __('Khách hàng tiềm năng — kế thừa CRM Lead, lọc theo tuyến phụ trách của bạn') }}</p>
        </div>
        <Button variant="solid" theme="teal" :label="__('+ Tạo lead')" @click="openCreate" />
      </div>
    </header>

    <!-- Filter trạng thái -->
    <section class="flex flex-wrap items-center gap-1.5 border-b border-outline-gray-1 px-6 py-2.5">
      <button
        type="button"
        class="rounded-full px-3 py-1 text-p-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        :class="!statusFilter ? 'bg-teal-700 text-white' : 'bg-surface-gray-2 text-ink-gray-7 hover:bg-surface-gray-3'"
        @click="setStatus('')"
      >
        {{ __('Tất cả') }}
      </button>
      <button
        v-for="s in statusOptions"
        :key="s"
        type="button"
        class="rounded-full px-3 py-1 text-p-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        :class="statusFilter === s ? 'bg-teal-700 text-white' : 'bg-surface-gray-2 text-ink-gray-7 hover:bg-surface-gray-3'"
        @click="setStatus(s)"
      >
        {{ s }}
      </button>
    </section>

    <section class="flex-1 overflow-auto px-6 pb-6 pt-4" aria-live="polite">
      <div v-if="leads.loading" class="flex items-center justify-center gap-2 py-16 text-ink-gray-6">
        <LoadingIndicator class="h-4 w-4" /><span>{{ __('Đang tải…') }}</span>
      </div>
      <div v-else-if="leads.error" class="flex flex-col items-center gap-3 py-16 text-center" role="alert">
        <Badge variant="subtle" theme="red" size="lg" :label="__('Không tải được')" />
        <Button variant="outline" :label="__('Thử lại')" @click="leads.reload()" />
      </div>
      <div v-else-if="!rows.length" class="py-16 text-center text-p-sm text-ink-gray-6">{{ __('Chưa có lead nào trong phạm vi của bạn.') }}</div>

      <table v-else class="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr class="text-p-xs uppercase text-ink-gray-5">
            <th class="border-b border-outline-gray-modals py-2 pr-4 font-medium">{{ __('Lead / Tổ chức') }}</th>
            <th class="border-b border-outline-gray-modals py-2 pr-4 font-medium">{{ __('Trạng thái') }}</th>
            <th class="border-b border-outline-gray-modals py-2 pr-4 font-medium">{{ __('Tuyến') }}</th>
            <th class="border-b border-outline-gray-modals py-2 pr-4 font-medium">{{ __('NV phụ trách') }}</th>
            <th class="border-b border-outline-gray-modals py-2 pr-4 font-medium">{{ __('Liên hệ') }}</th>
            <th class="border-b border-outline-gray-modals py-2 text-right font-medium">{{ __('Doanh thu năm') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in rows" :key="l.name" class="text-p-sm text-ink-gray-8 transition-colors hover:bg-surface-gray-1">
            <td class="border-b border-outline-gray-1 py-2.5 pr-4">
              <div class="font-medium text-ink-gray-9">{{ l.lead_name }}</div>
              <div class="text-p-xs text-ink-gray-5">{{ l.organization || '—' }}</div>
            </td>
            <td class="border-b border-outline-gray-1 py-2.5 pr-4">
              <Badge variant="subtle" :theme="statusTheme(l.status)" size="sm" :label="l.status || '—'" />
            </td>
            <td class="border-b border-outline-gray-1 py-2.5 pr-4 text-ink-gray-7">{{ l.territory || '—' }}</td>
            <td class="border-b border-outline-gray-1 py-2.5 pr-4 text-ink-gray-7">{{ l.lead_owner_name || '—' }}</td>
            <td class="border-b border-outline-gray-1 py-2.5 pr-4 text-ink-gray-7">
              <div>{{ l.mobile_no || '—' }}</div>
              <div class="text-p-xs text-ink-gray-5">{{ l.email || '' }}</div>
            </td>
            <td class="border-b border-outline-gray-1 py-2.5 text-right tabular-nums text-ink-gray-8">
              {{ l.annual_revenue ? formatVnMoney(l.annual_revenue) : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="rows.length" class="pt-3 text-p-sm text-ink-gray-5">{{ __('Tổng cộng') }}: {{ leads.data?.total_count }} {{ __('lead') }}</p>
    </section>

    <!-- Dialog tạo lead -->
    <Dialog v-model="createDlg" :options="{ title: __('Tạo lead mới') }">
      <template #body-content>
        <div class="bg-surface-modal px-4 pb-6 pt-5 sm:px-6">
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl :label="__('Tên lead')" v-model="cForm.lead_name" :placeholder="__('Nguyễn Văn A')" />
              <FormControl :label="__('Tổ chức / Bệnh viện')" v-model="cForm.organization" />
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl :label="__('Điện thoại')" v-model="cForm.mobile_no" />
              <FormControl type="email" :label="__('Email')" v-model="cForm.email" />
            </div>
            <FormControl
              type="select"
              :label="__('Trạng thái')"
              v-model="cForm.status"
              :options="statusOptions.map((s) => ({ label: s, value: s }))"
            />
          </div>
          <div class="mt-6 flex justify-end gap-2 border-t border-outline-gray-1 pt-4">
            <Button :label="__('Huỷ')" @click="createDlg = false" />
            <Button variant="solid" theme="teal" :loading="createRes.loading" :label="__('Tạo lead')" @click="onCreate" />
          </div>
        </div>
      </template>
    </Dialog>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Badge, Button, Dialog, FormControl, createResource, toast } from 'frappe-ui'
import LoadingIndicator from '@/components/Icons/LoadingIndicator.vue'
import { listLeads, getLeadStatuses, LEAD_STATUS_THEME } from '@/data/antmed'
import { formatVnMoney } from '@/utils/antmedUi'

const PIPE = 'antmed_crm.api.antmed.pipeline'

const statusFilter = ref('')
const leads = listLeads({ params: { page_length: 0 }, auto: true })
leads.onError = (err) => toast.error(err?.messages?.[0] || __('Không tải được danh sách lead'))
const statusesRes = getLeadStatuses({ auto: true })

const rows = computed(() => leads.data?.data || [])
const statusOptions = computed(() => statusesRes.data?.statuses || [])

function statusTheme(s) {
  return LEAD_STATUS_THEME[s] || 'gray'
}
function setStatus(s) {
  statusFilter.value = s
  leads.params = { status: s || undefined, page_length: 0 }
  leads.reload()
}

// Tạo lead
const createDlg = ref(false)
const cForm = ref({ lead_name: '', organization: '', mobile_no: '', email: '', status: 'New' })
const createRes = createResource({
  url: `${PIPE}.create_lead`,
  method: 'POST',
  onSuccess() {
    toast.success(__('Đã tạo lead mới'))
    createDlg.value = false
    leads.reload()
  },
  onError: (err) => toast.error(err?.messages?.[0] || __('Không tạo được lead')),
})
function openCreate() {
  cForm.value = { lead_name: '', organization: '', mobile_no: '', email: '', status: statusOptions.value.includes('New') ? 'New' : statusOptions.value[0] || 'New' }
  createDlg.value = true
}
function onCreate() {
  if (!cForm.value.lead_name) {
    toast.error(__('Nhập tên lead'))
    return
  }
  createRes.submit({ ...cForm.value })
}
</script>
