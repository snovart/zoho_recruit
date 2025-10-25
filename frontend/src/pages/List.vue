<!-- frontend/src/pages/List.vue -->
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useApplicationsList } from '@/composables/useApplicationsList'
import ApplicationListItem from '@/components/applications/ApplicationListItem.vue'

const router = useRouter()
const { user, signOut } = useAuth()

const {
  items,
  loading,
  error,
  page,
  limit,
  total,
  pageCount,
  canPrev,
  canNext,
  prevPage,
  nextPage,
  setLimit,
} = useApplicationsList({ limit: 2, sort: 'created_at:desc' })

const email = computed(() => user.value?.email || '')

const rangeText = computed(() => {
  if (!total.value) return '0 of 0'
  const start = (page.value - 1) * limit.value + 1
  const end = Math.min(page.value * limit.value, total.value)
  return `${start}–${end} of ${total.value}`
})

async function onLogout () {
  await signOut()
  router.replace({ name: 'login' })
}

function onNewApplication () {
  router.push({ name: 'applications.new' })
}

function onPageSizeChange (event) {
  const value = event?.target?.value
  setLimit(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-800">
          Hello, {{ email }}
        </h1>

        <button
          type="button"
          @click="onLogout"
          class="cursor-pointer text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>

      <div class="mb-6 flex items-center justify-between">
        <p class="text-gray-600">Your applications</p>

        <button
          type="button"
          @click="onNewApplication"
          class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New application
        </button>
      </div>

      <!-- loading -->
      <div v-if="loading" class="text-sm text-gray-500">Loading…</div>

      <!-- error -->
      <div v-else-if="error" class="text-sm text-red-600">
        {{ String(error) }}
      </div>

      <!-- empty -->
      <div
        v-else-if="!Array.isArray(items) || items.length === 0"
        class="border-t border-gray-200 pt-4 text-sm text-gray-500"
      >
        No applications yet.
      </div>

      <!-- list -->
      <div v-else class="divide-y divide-gray-200">
        <ApplicationListItem
          v-for="app in items"
          :key="app.id"
          :app="app"
        />
      </div>

      <!-- pagination -->
      <div
        v-if="!loading && !error && (Array.isArray(items) ? items.length : 0) >= 0"
        class="mt-6 flex flex-col items-start gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- левая часть -->
        <div class="flex items-center gap-4 text-sm">
          <span class="text-gray-600">Page {{ page }} of {{ pageCount }}</span>
          <span class="hidden text-gray-500 sm:inline">•</span>
          <span class="text-gray-600">{{ rangeText }}</span>

          <label class="ml-2 inline-flex items-center gap-2">
            <span class="text-gray-600">Per page:</span>
            <select
              :value="limit"
              @change="onPageSizeChange"
              class="rounded border px-2 py-1 text-sm"
            >
              <option :value="2">2</option>
              <option :value="5">5</option>
              <option :value="10">10</option>
            </select>
          </label>
        </div>

        <!-- правая часть -->
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="!canPrev"
            @click="prevPage"
            class="rounded border px-3 py-1 text-sm"
            :class="canPrev ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-50'"
          >
            Prev
          </button>

          <button
            type="button"
            :disabled="!canNext"
            @click="nextPage"
            class="rounded border px-3 py-1 text-sm"
            :class="canNext ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-50'"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
