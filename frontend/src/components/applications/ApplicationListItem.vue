<!-- frontend/src/components/applications/ApplicationListItem.vue -->
<script setup>
/**
 * Displays a single application entry in read-only mode.
 * Props:
 *  - app: object with application fields (snake_case)
 */
import { computed } from 'vue'

const props = defineProps({
  app: {
    type: Object,
    required: true,
  },
})

function fmtDate (v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString()
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition mb-2">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold text-gray-900">
        {{ app.first_name }} {{ app.last_name }}
      </h3>
      <span class="text-sm text-gray-500">{{ fmtDate(app.created_at) }}</span>
    </div>

    <p class="text-sm text-gray-700 mb-1">
      <strong>Position:</strong> {{ app.position_applied_for || '—' }}
    </p>
    <p class="text-sm text-gray-700 mb-1">
      <strong>Email:</strong> {{ app.email || '—' }}
    </p>
    <p class="text-sm text-gray-700 mb-1">
      <strong>Phone:</strong> {{ app.phone || '—' }}
    </p>
    <p class="text-sm text-gray-700 mb-1">
      <strong>Location:</strong> {{ app.preferred_location || '—' }}
    </p>

    <p v-if="app.skills?.length" class="mt-2 text-sm text-gray-600">
      <strong>Skills:</strong>
      <span v-for="(s, i) in app.skills" :key="i" class="inline-block bg-gray-100 rounded px-2 py-0.5 mr-1">
        {{ s }}
      </span>
    </p>
  </div>
</template>
