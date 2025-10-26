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
} = useApplicationsList({ limit: 5, sort: 'created_at:desc' })

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
</script>

<template>
  <!-- Full-height page layout with a left sidebar -->
  <div class="min-h-screen w-full bg-gray-100">
    <div class="mx-auto flex min-h-screen w-full">
      <!-- SIDEBAR -->
      <aside class="w-64 shrink-0 border-r border-gray-200 bg-white">
        <div class="flex h-16 items-center px-5">
          <span class="text-base font-semibold text-gray-800">Menu</span>
        </div>

        <nav class="px-3 py-2 space-y-1">
          <!-- Applications link -->
          <router-link
            :to="{ name: 'applications.list' }"
            class="block rounded-md px-3 py-2 text-sm font-medium"
            :class="$route.name === 'applications.list' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          >
            Applications
          </router-link>

          <!-- New Application link -->
          <router-link
            :to="{ name: 'applications.new' }"
            class="block rounded-md px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            + Add New application
          </router-link>

          <!-- Logout button -->
          <button
            type="button"
            @click="onLogout"
            class="mt-3 block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Logout
          </button>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 p-6">
        <div class="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <!-- page header -->
          <div class="mb-4 flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-800">
              Hello, {{ email }}
            </h1>
          </div>

          <p class="mb-6 text-gray-600">Your applications</p>

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
            <!-- left side -->
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-600">Page {{ page }} of {{ pageCount }}</span>
              <span class="hidden text-gray-500 sm:inline">•</span>
              <span class="text-gray-600">{{ rangeText }}</span>

              <label class="ml-2 inline-flex items-center gap-2">
                <span class="text-gray-600">Per page:</span>
                <select
                  :value="limit"
                  @change="event => setLimit(event.target.value)"
                  class="rounded border px-2 py-1 text-sm"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                </select>
              </label>
            </div>

            <!-- right side -->
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
      </main>
    </div>
  </div>
</template>
