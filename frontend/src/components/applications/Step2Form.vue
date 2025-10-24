<!-- frontend/src/components/applications/Step2Form.vue -->
<script setup>
/**
 * Step 2 (Pinia version).
 * - Reads Step 1 data from applications store
 * - Shows skill suggestions for chosen position
 * - Emits:
 *    back
 *    submit -> step2 payload (snake_case); parent merges via store
 */

import { reactive, computed, watch } from 'vue'
import {
  APP_TEXT, FIELDS, ERRORS,
  EDUCATION_OPTIONS, NOTICE_OPTIONS, LOCATION_OPTIONS, SOURCE_OPTIONS,
} from '@/constants/application'
import { useApplicationsStore } from '@/stores/applications'

const emit = defineEmits(['back', 'submit', 'valid-change'])
const appStore = useApplicationsStore()

/* ---------- suggestions from store ---------- */
const suggestions = computed(() => appStore.suggestions)

/* ---------- local state (camelCase) ---------- */
const form = reactive({
  educationLevel: '',
  yearsOfExperience: '',
  skills: [],
  previousEmployer: '',
  currentJobTitle: '',
  notice: '',
  expectedSalary: '',
  interviewAt: '',
  preferredLocation: '',
  coverLetter: '',
  source: '',
})

/* ---------- errors ---------- */
const errors = reactive({
  educationLevel: '',
  yearsOfExperience: '',
  notice: '',
  source: '',
})

function validate () {
  errors.educationLevel    = form.educationLevel ? '' : ERRORS.required
  errors.yearsOfExperience = form.yearsOfExperience === '' ? ERRORS.required : ''
  errors.notice            = form.notice ? '' : ERRORS.required
  errors.source            = form.source ? '' : ERRORS.required
}

const isValid = computed(() =>
  !errors.educationLevel &&
  !errors.yearsOfExperience &&
  !errors.notice &&
  !errors.source &&
  form.educationLevel &&
  form.yearsOfExperience !== '' &&
  form.notice &&
  form.source
)

watch(form, () => {
  validate()
  emit('valid-change', isValid.value)
}, { deep: true, immediate: true })

/* ---------- skills toggle ---------- */
function toggleSkill (s) {
  const i = form.skills.indexOf(s)
  if (i === -1) form.skills.push(s)
  else form.skills.splice(i, 1)
}

function handleBack () {
  emit('back')
}

function handleSubmit () {
  validate()
  if (!isValid.value) {
    emit('valid-change', false)
    return
  }

  // produce snake_case payload for step 2
  const step2 = {
    education_level: form.educationLevel,
    years_of_experience: Number(form.yearsOfExperience),
    skills: form.skills,
    previous_employer: form.previousEmployer || null,
    current_job_title: form.currentJobTitle || null,
    notice_period: form.notice,
    expected_salary: form.expectedSalary !== '' ? Number(form.expectedSalary) : null,
    availability_for_interview: form.interviewAt || null,
    preferred_location: form.preferredLocation || null,
    cover_letter: form.coverLetter || null,
    source_of_application: form.source,
  }

  emit('submit', step2)
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Education -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.education }}</label>
        <select v-model="form.educationLevel"
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="" disabled>Select…</option>
          <option v-for="opt in EDUCATION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="errors.educationLevel" class="mt-1 text-sm text-red-600">{{ errors.educationLevel }}</p>
      </div>

      <!-- Years of experience -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.yearsExp }}</label>
        <input v-model.number="form.yearsOfExperience" type="number" min="0"
               class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <p v-if="errors.yearsOfExperience" class="mt-1 text-sm text-red-600">{{ errors.yearsOfExperience }}</p>
      </div>

      <!-- Skills -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.skills }}</label>

        <div v-if="suggestions.length"
             class="mt-2 flex flex-wrap gap-2">
          <button v-for="s in suggestions"
                  :key="s" type="button" @click="toggleSkill(s)"
                  class="rounded-full px-3 py-1 text-sm"
                  :class="form.skills.includes(s) ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            {{ s }}
          </button>
        </div>
        <p v-else class="mt-2 text-sm text-gray-500">No suggestions for the selected position.</p>

        <div v-if="form.skills.length" class="mt-3 flex flex-wrap gap-2">
          <span v-for="s in form.skills" :key="`sel-${s}`"
                class="rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700">
            {{ s }}
          </span>
        </div>
      </div>

      <!-- Previous employer -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.prevEmployer }}</label>
        <input v-model.trim="form.previousEmployer" type="text"
               class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <!-- Current job title -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.currentTitle }}</label>
        <input v-model.trim="form.currentJobTitle" type="text"
               class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <!-- Notice period -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.notice }}</label>
        <select v-model="form.notice"
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="" disabled>Select…</option>
          <option v-for="opt in NOTICE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="errors.notice" class="mt-1 text-sm text-red-600">{{ errors.notice }}</p>
      </div>

      <!-- Expected salary -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.expectedSalary }}</label>
        <input v-model.number="form.expectedSalary" type="number" min="0"
               class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <!-- Availability for interview -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.interviewAt }}</label>
        <input v-model="form.interviewAt" type="datetime-local"
               class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <!-- Preferred location -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.preferredLocation }}</label>
        <select v-model="form.preferredLocation"
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="" disabled>Select…</option>
          <option v-for="opt in LOCATION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <!-- Cover letter -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.coverLetter }}</label>
        <textarea v-model.trim="form.coverLetter" rows="4"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <!-- Source -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ FIELDS.source }}</label>
        <select v-model="form.source"
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="" disabled>Select…</option>
          <option v-for="opt in SOURCE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="errors.source" class="mt-1 text-sm text-red-600">{{ errors.source }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2">
      <button type="button" class="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200" @click="handleBack">
        {{ APP_TEXT.actions.back }}
      </button>

      <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        {{ APP_TEXT.actions.submit }}
      </button>
    </div>
  </form>
</template>

<style scoped>
/* no @apply here */
</style>
