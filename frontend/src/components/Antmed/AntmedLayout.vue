<template>
  <div class="flex h-screen w-screen flex-col">
    <!-- Topbar (mockup A1: teal-900; vai trò Portal G = nền trắng border) -->
    <header
      class="flex items-center gap-3 px-4 py-2.5"
      :class="
        isPortal
          ? 'border-b border-outline-gray-2 bg-white text-teal-900'
          : 'bg-teal-900 text-white'
      "
    >
      <RouterLink
        to="/antmed"
        class="flex items-center gap-1.5 font-semibold focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <span aria-hidden="true">⚕</span>
        <span>{{ isPortal ? __('AntMed Portal') : __('AntMed CRM') }}</span>
      </RouterLink>

      <div
        v-if="!isPortal"
        class="ml-2 hidden max-w-xs flex-1 items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm sm:flex"
      >
        <span aria-hidden="true">🔍</span>
        <input
          class="w-full bg-transparent text-white placeholder:text-white/60 focus:outline-none"
          :placeholder="__('Tìm bệnh viện / vật tư / NV...')"
          :aria-label="__('Tìm kiếm')"
        />
      </div>

      <!-- Role switcher: duyệt 8 vai trò prototype (single-source ANTMED_ROLES) -->
      <label class="ml-auto flex items-center gap-1.5 text-xs">
        <span class="sr-only">{{ __('Vai trò') }}</span>
        <select
          v-model="selectedRole"
          class="rounded-full px-2.5 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          :class="
            isPortal
              ? 'border border-outline-gray-2 bg-surface-gray-1 text-ink-gray-8'
              : 'bg-white/15 text-white'
          "
          :aria-label="__('Chọn vai trò xem trước')"
        >
          <option value="">{{ periodLabel }}</option>
          <option v-for="r in ANTMED_ROLES" :key="r.key" :value="r.key">
            {{ __(r.label) }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="rounded-full px-1.5 py-1 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        :class="isPortal ? 'hover:bg-surface-gray-2' : 'hover:bg-white/15'"
        :aria-label="__('Thông báo')"
      >
        <span aria-hidden="true">🔔</span>
      </button>
      <div
        class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
        :class="isPortal ? 'bg-teal-600 text-white' : 'bg-white text-teal-900'"
        aria-hidden="true"
      >
        {{ currentAvatar }}
      </div>
    </header>

    <!-- Body: sidebar 180px + main -->
    <div class="flex min-h-0 flex-1">
      <nav
        class="w-[180px] shrink-0 overflow-y-auto border-r border-outline-gray-1 bg-surface-gray-1 p-1.5"
        :aria-label="__('Điều hướng AntMed')"
      >
        <template v-for="item in nav" :key="item.key">
          <RouterLink
            v-if="item.enabled"
            :to="item.to"
            class="mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-p-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            :class="
              isNavActive(item, route.path)
                ? 'bg-teal-50 font-semibold text-teal-900'
                : 'text-ink-gray-7 hover:bg-surface-gray-3'
            "
            :aria-current="isNavActive(item, route.path) ? 'page' : undefined"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            <span>{{ __(item.label) }}</span>
          </RouterLink>

          <div
            v-else
            class="mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-p-sm text-ink-gray-4"
            aria-disabled="true"
            :title="__('Sắp có')"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            <span class="flex-1">{{ __(item.label) }}</span>
            <span
              class="rounded bg-ink-gray-2 px-1 py-0.5 text-[10px] font-medium text-ink-gray-5"
            >
              {{ __('Sắp có') }}
            </span>
          </div>
        </template>
      </nav>

      <main class="min-w-0 flex-1 overflow-auto bg-surface-white">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ANTMED_ROLES, navForRole, isNavActive } from '@/data/antmedNav'

const route = useRoute()

// Vai trò đang xem: ưu tiên lựa chọn ở switcher; nếu rỗng → route.meta.role
// (T4 gắn meta.role mỗi màn); nếu vẫn rỗng → '' ⇒ navForRole trả ANTMED_NAV
// (giữ shell /antmed/* real-data cũ, no-regression).
const selectedRole = ref('')
const effectiveRole = computed(
  () => selectedRole.value || route.meta?.role || '',
)

// Sidebar role-aware (single-source ROLE_NAV qua navForRole).
const nav = computed(() => navForRole(effectiveRole.value))

const currentRole = computed(() =>
  ANTMED_ROLES.find((r) => r.key === effectiveRole.value),
)
const isPortal = computed(() => currentRole.value?.variant === 'portal')
const currentAvatar = computed(() => currentRole.value?.avatar || 'AM')

// Chip kỳ báo cáo (mockup: "Tháng 05/2026") — option mặc định của switcher.
const periodLabel = computed(() => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${__('Tháng')} ${mm}/${d.getFullYear()}`
})
</script>
