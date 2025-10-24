<!-- frontend/src/components/applications/Step1Form.vue -->
<script setup>
/**
 * Step 1 of the application form.
 * - Controlled fields with local validation
 * - Texts & options from @/constants/application
 * - Persists/reads payload via Pinia store (applications)
 * - Emits:
 *    submit        -> normalized payload (snake_case) when valid
 *    valid-change  -> boolean on each revalidation
 */

import { reactive, computed, watch, onMounted } from 'vue'
import {
  APP_TEXT,
  FIELDS,
  ERRORS,
  POSITION_OPTIONS,
} from '@/constants/application'
import { useApplicationsStore } from '@/stores/applications'

const store = useApplicationsStore()
const emit = defineEmits(['submit', 'valid-change'])

// --- local state (camelCase) ---------------------------------------------
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  position: '',
  resumeFile: null, // File object (upload later)
  linkedin: '',
})

// which fields the user has interacted with (for delayed error display)
const touched = reactive({
  firstName: false,
  lastName: false,
  email: false,
  phone: false,
  address: false,
  dateOfBirth: false,
  position: false,
  resumeFile: false,
  linkedin: false,
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

// --- helpers & validation -------------------------------------------------
const isEmail = (v) => /\S+@\S+\.\S+/.test(String(v || ''))
const isUrl   = (v) =>
  /^(https?:\/\/)?([^\s.]+\.\S{2,}|localhost)(\/\S*)?$/i.test(String(v || ''))

function validate () {
  // reset all errors
  Object.keys(errors).forEach(k => { errors[k] = '' })

  // required checks
  if (!form.firstName) errors.firstName = ERRORS.required
  if (!form.lastName)  errors.lastName  = ERRORS.required
  if (!form.email)     errors.email     = ERRORS.required
  if (!form.phone)     errors.phone     = ERRORS.required
  if (!form.address)   errors.address   = ERRORS.required
  if (!form.dateOfBirth) errors.dateOfBirth = ERRORS.required
  if (!form.position)  errors.position  = ERRORS.required
  if (!form.resumeFile) errors.resumeFile = ERRORS.fileRequired

  // format checks
  if (form.email && !isEmail(form.email)) errors.email = ERRORS.invalidEmail
  if (form.linkedin && !isUrl(form.linkedin)) errors.linkedin = ERRORS.invalidUrl
}

const isValid = computed(() =>
  Object.values(errors).every(v => !v) &&
  !!form.firstName &&
  !!form.lastName &&
  !!form.email &&
  !!form.phone &&
  !!form.address &&
  !!form.dateOfBirth &&
  !!form.position &&
  !!form.resumeFile
)

// revalidate + notify parent on any change
watch(
  () => ({
    ...form,
    // avoid noisy deep compare on File object
    resumePresence: !!form.resumeFile,
  }),
  () => {
    validate()
    emit('valid-change', isValid.value)
  },
  { deep: true, immediate: true }
)

// mark field as touched (and revalidate) on blur/change
function touch (key) {
  touched[key] = true
  validate()
}

function onFileChange (e) {
  const f = e.target.files?.[0] || null
  form.resumeFile = f
  touch('resumeFile')
}

// --- restore from store on mount (when the user navigates back) ----------
onMounted(() => {
  if (store.hasStep1) {
    const s = store.step1
    form.firstName   = s.first_name || ''
    form.lastName    = s.last_name || ''
    form.email       = s.email || ''
    form.phone       = s.phone || ''
    form.address     = s.current_address || ''
    form.dateOfBirth = s.date_of_birth || ''
    form.position    = s.position_applied_for || ''
    form.linkedin    = s.linkedin_profile || ''
    // resume_path from server cannot be converted back to a File; keep empty.
    // The user can re-select the file if needed.
  }
})

// --- submit ---------------------------------------------------------------
function handleSubmit () {
  // treat all fields as touched when submitting
  Object.keys(touched).forEach(k => (touched[k] = true))
  validate()
  if (!isValid.value) {
    emit('valid-change', false)
    return
  }

  // normalize camelCase -> snake_case (payload for API and store)
  const payload = {
    first_name: form.firstName,
    last_name: form.lastName,
    email: form.email,
    phone: form.phone,
    current_address: form.address,
    date_of_birth: form.dateOfBirth,
    position_applied_for: form.position,
    // real upload will return a path/key; placeholder for now
    resume_path: form.resumeFile ? form.resumeFile.name : '',
    linkedin_profile: form.linkedin || null,
  }

  // persist in store so the user can go back and see their data
  store.setStep1(payload)

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
          {{ FIELDS.firstName }} <span class="text-red-600">*</span>
        </label>
        <input
          v-model.trim="form.firstName"
          @blur="touch('firstName')"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="given-name"
        />
        <p v-if="touched.firstName && errors.firstName" class="mt-1 text-sm text-red-600">
          {{ errors.firstName }}
        </p>
      </div>

      <!-- Last name -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.lastName }} <span class="text-red-600">*</span>
        </label>
        <input
          v-model.trim="form.lastName"
          @blur="touch('lastName')"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="family-name"
        />
        <p v-if="touched.lastName && errors.lastName" class="mt-1 text-sm text-red-600">
          {{ errors.lastName }}
        </p>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.email }} <span class="text-red-600">*</span>
        </label>
        <input
          v-model.trim="form.email"
          @blur="touch('email')"
          type="email"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="email"
        />
        <p v-if="touched.email && errors.email" class="mt-1 text-sm text-red-600">
          {{ errors.email }}
        </p>
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.phone }} <span class="text-red-600">*</span>
        </label>
        <input
          v-model.trim="form.phone"
          @blur="touch('phone')"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autocomplete="tel"
        />
        <p v-if="touched.phone && errors.phone" class="mt-1 text-sm text-red-600">
          {{ errors.phone }}
        </p>
      </div>

      <!-- Address -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.address }} <span class="text-red-600">*</span>
        </label>
        <textarea
          v-model.trim="form.address"
          @blur="touch('address')"
          rows="3"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p v-if="touched.address && errors.address" class="mt-1 text-sm text-red-600">
          {{ errors.address }}
        </p>
      </div>

      <!-- Date of birth -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.dateOfBirth }} <span class="text-red-600">*</span>
        </label>
        <input
          v-model="form.dateOfBirth"
          @blur="touch('dateOfBirth')"
          type="date"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p v-if="touched.dateOfBirth && errors.dateOfBirth" class="mt-1 text-sm text-red-600">
          {{ errors.dateOfBirth }}
        </p>
      </div>

      <!-- Position -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.position }} <span class="text-red-600">*</span>
        </label>
        <select
          v-model="form.position"
          @blur="touch('position')"
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="" disabled>Select…</option>
          <option v-for="opt in POSITION_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p v-if="touched.position && errors.position" class="mt-1 text-sm text-red-600">
          {{ errors.position }}
        </p>
      </div>

      <!-- Resume -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.resume }} <span class="text-red-600">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.rtf"
          @change="onFileChange"
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p v-if="touched.resumeFile && errors.resumeFile" class="mt-1 text-sm text-red-600">
          {{ errors.resumeFile }}
        </p>
      </div>

      <!-- LinkedIn -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ FIELDS.linkedin }}
        </label>
        <input
          v-model.trim="form.linkedin"
          @blur="touch('linkedin')"
          type="url"
          placeholder="https://linkedin.com/in/…"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p v-if="touched.linkedin && errors.linkedin" class="mt-1 text-sm text-red-600">
          {{ errors.linkedin }}
        </p>
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
/* keep empty to avoid PostCSS utility aliasing issues */
</style>
