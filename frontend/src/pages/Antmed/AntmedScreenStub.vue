<template>
  <main
    class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
    aria-labelledby="antmed-stub-title"
  >
    <div class="text-4xl" aria-hidden="true">🚧</div>
    <h1 id="antmed-stub-title" class="text-xl font-semibold text-ink-gray-9">
      {{ title }}
    </h1>
    <p class="max-w-md text-p-sm text-ink-gray-6">
      {{ __('Màn prototype đang được dựng theo mockup AntMed.') }}
    </p>
    <span
      v-if="role"
      class="rounded-full bg-surface-gray-2 px-3 py-1 text-xs font-medium text-ink-gray-7"
    >
      {{ __('Vai trò') }}: {{ role }}
    </span>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// T4 — stub dùng chung cho 24 route prototype tới khi T5–T14 dựng màn thật.
// Hiển thị qua AntmedLayout (App.vue chọn shell theo route.meta.antmedShell).
const route = useRoute()
const title = computed(
  () => route.meta?.title || route.name || __('Màn AntMed'),
)
const role = computed(() => route.meta?.role || '')
</script>
