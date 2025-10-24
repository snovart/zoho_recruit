<!-- frontend/src/pages/Login.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { AUTH_TEXT, ROUTE_APPS } from '@/constants/auth'

const router = useRouter()
const { signIn, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const remember = ref(false)

/**
 * Handle login form submit
 */
async function handleSubmit() {
  if (!email.value || !password.value) return

  const { ok } = await signIn(email.value, password.value, remember.value)
  if (ok) {
    router.push(ROUTE_APPS)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-semibold mb-6 text-center text-gray-800">
        {{ AUTH_TEXT.title }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ AUTH_TEXT.emailLabel }}
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
            autocomplete="username"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ AUTH_TEXT.passwordLabel }}
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              v-model="remember"
              class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {{ AUTH_TEXT.remember }}
          </label>

          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? '...' : AUTH_TEXT.submit }}
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-600 text-center mt-2">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>
