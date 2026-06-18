<template>
  <main
    class="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 px-4 py-8"
  >
    <div class="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl">
      <!-- Brand -->
      <div class="mb-6 flex flex-col items-center gap-1 text-center">
        <div class="flex items-center gap-1.5 text-2xl font-bold text-teal-900">
          <span aria-hidden="true">⚕</span>
          <span>AntMed CRM</span>
        </div>
        <p class="text-p-sm text-ink-gray-6">
          {{ __('Đăng nhập hệ thống') }}
        </p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="doLogin">
        <FormControl
          v-model="email"
          type="email"
          :label="__('Email')"
          :placeholder="__('ten@congty.com')"
          autocomplete="username"
          :disabled="loginRes.loading"
          required
        />

        <FormControl
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :label="__('Mật khẩu')"
          placeholder="••••••••"
          autocomplete="current-password"
          :disabled="loginRes.loading"
          required
        >
          <template #suffix>
            <button
              type="button"
              class="rounded text-ink-gray-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              :aria-label="showPassword ? __('Ẩn mật khẩu') : __('Hiện mật khẩu')"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <FeatherIcon
                :name="showPassword ? 'eye-off' : 'eye'"
                class="h-4 w-4"
              />
            </button>
          </template>
        </FormControl>

        <p
          v-if="errorMessage"
          class="rounded-md bg-surface-red-1 px-3 py-2 text-p-sm text-ink-red-3"
          role="alert"
          aria-live="assertive"
        >
          {{ errorMessage }}
        </p>

        <Button
          variant="solid"
          theme="green"
          type="submit"
          class="w-full"
          :loading="loginRes.loading"
          :disabled="!email || !password"
          :label="__('Đăng nhập')"
        />
      </form>

      <p class="mt-5 text-center text-p-sm text-ink-gray-5">
        {{ __('Quên mật khẩu? Vui lòng liên hệ quản trị viên.') }}
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Button, FormControl, FeatherIcon, createResource } from 'frappe-ui'
import { sessionStore } from '@/stores/session'

const route = useRoute()
const session = sessionStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

// Đích sau đăng nhập: query `redirect-to` (path SPA, vd /antmed/deliveries) → /crm/<path>.
// Mặc định /crm/antmed. Chỉ chấp nhận path nội bộ bắt đầu bằng '/' (chống open-redirect).
const redirectTarget = computed(() => {
  const rt = route.query['redirect-to']
  const path = typeof rt === 'string' && rt.startsWith('/') ? rt : '/antmed'
  return '/crm' + path
})

// Login resource RIÊNG (KHÔNG dùng session.login — onSuccess của nó router.replace, còn ở
// đây SPA đang chạy boot GUEST nên phải reload đầy đủ để lấy boot đã xác thực).
const loginRes = createResource({
  url: 'login',
  onSuccess() {
    window.location.href = redirectTarget.value
  },
  onError() {
    // Lỗi hiển thị qua errorMessage (đọc loginRes.error). Nuốt để tránh unhandled rejection.
  },
})

const errorMessage = computed(() =>
  loginRes.error ? __('Email hoặc mật khẩu không đúng.') : '',
)

function doLogin() {
  if (!email.value || !password.value || loginRes.loading) return
  loginRes.submit({ usr: email.value, pwd: password.value })
}

onMounted(() => {
  // Đã đăng nhập mà mở trang login → về thẳng app (full reload lấy boot xác thực).
  if (session.isLoggedIn) window.location.href = '/crm/antmed'
})
</script>
