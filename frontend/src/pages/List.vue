<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, signOut } = useAuth()

const email = computed(() => user.value?.email || '')

async function onLogout() {
  await signOut()
  router.replace({ name: 'login' })
}

function onNewApplication() {
  router.push({ name: 'applications.new' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-semibold text-gray-800">
          Hello, {{ email }}
        </h1>

        <button
          type="button"
          @click="onLogout"
          class="text-sm text-red-600 hover:text-red-800 cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div class="flex justify-between items-center mb-6">
        <p class="text-gray-600">
          This will be your applications list page.
        </p>

        <button
          type="button"
          @click="onNewApplication"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded cursor-pointer"
        >
          New application
        </button>
      </div>

      <div class="border-t border-gray-200 pt-4 text-sm text-gray-500">
        (empty state for now)
      </div>
    </div>
  </div>
</template>
