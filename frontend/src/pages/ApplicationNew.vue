<script setup>
/**
 * ApplicationNew.vue
 * Two-step wizard for creating a new application.
 * Step 1 -> Step 2
 *
 * For now:
 *  - Step 1 uses <Step1Form /> and, when valid, advances to step 2
 *  - Step 2 is a lightweight placeholder where we will plug Step2Form next
 */

import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Step1Form from '@/components/applications/Step1Form.vue'
import { APP_TEXT } from '@/constants/application'

const router = useRouter()

// current step (1 | 2)
const step = ref(1)

// data from step 1 (will be sent along with step 2 later)
const step1Data = ref(null)

// UI helpers
const isStep1 = computed(() => step.value === 1)
const isStep2 = computed(() => step.value === 2)

// emitted when Step1Form is successfully submitted
function handleStep1Submit(payload) {
  step1Data.value = payload
  step.value = 2
}

// go back to list without saving
function cancelAndBack() {
  router.push({ name: 'applications.list' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-10 px-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ APP_TEXT.title }}
        </h1>
        <RouterLink
          :to="{ name: 'applications.list' }"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to list
        </RouterLink>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-xl shadow p-6">
        <!-- Simple step indicator -->
        <div class="mb-6 flex items-center gap-3 text-sm">
          <div
            class="inline-flex items-center gap-2"
            :class="isStep1 ? 'text-indigo-600' : 'text-gray-500'"
          >
            <span
              class="h-6 w-6 inline-flex items-center justify-center rounded-full"
              :class="isStep1 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'"
            >1</span>
            <span>Step 1</span>
          </div>

          <span class="text-gray-300">—</span>

          <div
            class="inline-flex items-center gap-2"
            :class="isStep2 ? 'text-indigo-600' : 'text-gray-500'"
          >
            <span
              class="h-6 w-6 inline-flex items-center justify-center rounded-full"
              :class="isStep2 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'"
            >2</span>
            <span>Step 2</span>
          </div>
        </div>

        <!-- STEP 1 -->
        <section v-if="isStep1">
          <Step1Form @submit="handleStep1Submit" />
          <div class="mt-6 flex items-center justify-between">
            <button
              type="button"
              class="text-sm text-gray-600 hover:text-gray-900"
              @click="cancelAndBack"
            >
              Cancel
            </button>
          </div>
        </section>

        <!-- STEP 2 (placeholder, Step2Form will be added next) -->
        <section v-else>
          <div class="space-y-4">
            <p class="text-gray-700">
              Step 2 placeholder. We will plug the detailed fields (education, experience, skills)
              here next. Below is a small preview of what you entered on Step 1:
            </p>

            <pre class="bg-gray-50 rounded-lg border border-gray-200 p-4 text-xs overflow-auto">
{{ JSON.stringify(step1Data, null, 2) }}
            </pre>

            <div class="flex items-center justify-between pt-2">
              <button
                class="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                @click="step = 1"
              >
                ← Back
              </button>

              <button
                class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                title="Will be enabled after we implement Step 2"
                disabled
              >
                Submit application
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
