<!-- frontend/src/components/applications/Step1Form.vue -->
<script setup>
/**
 * Stage 1 of the application form.
 * - Controlled fields with local validation
 * - Literals & options from @/constants/application
 * - Emits:
 *    submit        -> normalized payload (snake_case) when valid
 *    valid-change  -> boolean on each revalidation
 */

import { reactive, computed, watch } from 'vue'
import {
  APP_TEXT,
  FIELDS,
  ERRORS,
  POSITION_OPTIONS,
} from '@/constants/application'

const emit = defineEmits(['submit', 'valid-change'])

// local state (camelCase)
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  position: '',
  resumeFile: null,   // File object (upload later)
  linkedin: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  position: '',
  resumeFile: '',
  linkedin: '',
})

// simple helpers
const isEmail = (v) => /\S+@\S+\.\S+/.test(String(v || ''))
const isUrl   = (v) => /^(https?:\/\/)?([^\s.]+\.\S{2,}|localhost)(\/\S*)?$/i.test(String(v || ''))

function validate () {
  // reset errors
  Object.keys(errors).forEach(k => { errors[k] = '' })

  // requireds
  if (!form.firstName) errors.firstName = ERRORS.required
  if (!form.lastName)  errors.lastName  = ERRORS.required
  if (!form.email)     errors.email     = ERRORS.required
  if (!form.phone)     errors.phone     = ERRORS.required
  if (!form.address)   errors.address   = ERRORS.required
  if (!form.dateOfBirth) errors.dateOfBirth = ERRORS.required
  if (!form.position)  errors.position  = ERRORS.required
  if (!form.resumeFile) errors.resumeFile = ERRORS.fileRequired

  // formats
  if (form.email && !isEmail(form.email)) errors.email = ERRORS.invalidEmail
  if (form.linkedin && !isUrl(form.linkedin)) errors.linkedin = ERRORS.invalidUrl
}

const isValid = computed(() =>
  Object.values(errors).every(v => !v)
  && !!form.firstName && !!form.lastName && !!form.email && !!form.phone
  && !!form.address && !!form.dateOfBirth && !!form.position && !!form.resumeFile
)

// revalidate and notify parent on change
watch(
  () => ({
    ...form,
    // do not include File object in deep comparison noise
    resumePresence: !!form.resumeFile,
  }),
  () => {
    validate()
    emit('valid-change', isValid.value)
  },
  { deep: true, immediate: true }
)

function onFileChange (e) {
  const f = e.target.files?.[0] || null
  form.resumeFile = f
}

function handleSubmit () {
  validate()
  if (!isValid.value) {
    emit('valid-change', false)
    return
  }

  // normalize camelCase -> snake_case (payload for API)
  const payload = {
    first_name: form.firstName,
    last_name: form.lastName,
    email: form.email,
    phone: form.phone,
    current_address: form.address,
    date_of_birth: form.dateOfBirth,
    position_applied_for: form.position,
    // real upload will return a path/key; keep placeholder for now
    resume_path: form.resumeFile ? form.resumeFile.name : '',
    linkedin_profile: form.linkedin || null,
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- First name -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.firstName }}
        </label>
        <input
          v-model.trim="form.firstName"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="given-name"
        />
        <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
      </div>

      <!-- Last name -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.lastName }}
        </label>
        <input
          v-model.trim="form.lastName"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="family-name"
        />
        <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.email }}
        </label>
        <input
          v-model.trim="form.email"
          type="email"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="email"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.phone }}
        </label>
        <input
          v-model.trim="form.phone"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="tel"
        />
        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
      </div>

      <!-- Address (full width on md) -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.address }}
        </label>
        <textarea
          v-model.trim="form.address"
          rows="3"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
      </div>

      <!-- Date of birth -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.dateOfBirth }}
        </label>
        <input
          v-model="form.dateOfBirth"
          type="date"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p v-if="errors.dateOfBirth" class="mt-1 text-sm text-red-600">{{ errors.dateOfBirth }}</p>
      </div>

      <!-- Position -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.position }}
        </label>
        <select
          v-model="form.position"
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="" disabled>Select…</option>
          <option v-for="opt in POSITION_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p v-if="errors.position" class="mt-1 text-sm text-red-600">{{ errors.position }}</p>
      </div>

      <!-- Resume -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.resume }}
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.rtf"
          @change="onFileChange"
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p v-if="errors.resumeFile" class="mt-1 text-sm text-red-600">{{ errors.resumeFile }}</p>
      </div>

      <!-- LinkedIn -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.linkedin }}
        </label>
        <input
          v-model.trim="form.linkedin"
          type="url"
          placeholder="https://linkedin.com/in/…"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p v-if="errors.linkedin" class="mt-1 text-sm text-red-600">{{ errors.linkedin }}</p>
      </div>
    </div>

    <!-- actions -->
    <div class="flex items-center justify-end gap-3 pt-2">
      <button
        type="submit"
        class="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {{ APP_TEXT.actions.next }}
      </button>
    </div>
  </form>
</template>

<style scoped>
/* no @apply here to avoid PostCSS “unknown utility class” errors */
</style>
