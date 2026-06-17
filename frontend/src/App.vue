<template>
  <FrappeUIProvider>
    <NotPermitted v-if="$route.name === 'Not Permitted'" />
    <Layout v-else-if="session.isLoggedIn" class="isolate">
      <router-view :key="$route.fullPath" />
    </Layout>
    <Dialogs />
    <DoctypeModals />
  </FrappeUIProvider>
</template>

<script setup>
import NotPermitted from '@/pages/NotPermitted.vue'
import DoctypeModals from '@/components/Modals/DoctypeModals.vue'
import { Dialogs } from '@/utils/dialogs'
import { sessionStore } from '@/stores/session'
import { isAntmedPath } from '@/utils/antmed'
import { FrappeUIProvider, setConfig, useTheme } from 'frappe-ui'
import { computed, defineAsyncComponent, provide } from 'vue'
import { useRoute } from 'vue-router'

const session = sessionStore()
provide('session', session)
const route = useRoute()

const { setTheme } = useTheme()
if (!localStorage.getItem('theme')) {
  setTheme('light')
}

const MobileLayout = defineAsyncComponent(
  () => import('./components/Layouts/MobileLayout.vue'),
)
const DesktopLayout = defineAsyncComponent(
  () => import('./components/Layouts/DesktopLayout.vue'),
)
// AntMed SPA shell (topbar + sidebar khớp mockup) cho route /antmed/* — ADDITIVE:
// route CRM gốc GIỮ NGUYÊN Mobile/Desktop layout (no-regression).
const AntmedLayout = defineAsyncComponent(
  () => import('./components/Antmed/AntmedLayout.vue'),
)
const Layout = computed(() => {
  // AntMed shell chọn theo route.meta.antmedShell (24 màn prototype role-based) HOẶC
  // isAntmedPath (route /antmed/* real-data cũ — giữ tương thích, no-regression).
  if (route.meta?.antmedShell || isAntmedPath(route.path)) {
    return AntmedLayout
  }
  if (window.innerWidth < 640) {
    return MobileLayout
  } else {
    return DesktopLayout
  }
})

setConfig('systemTimezone', window.timezone?.system || null)
setConfig('localTimezone', window.timezone?.user || null)
setConfig('translatedMessages', window.translated_messages || {})
</script>
