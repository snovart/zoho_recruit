<!-- frontend/src/pages/ApplicationNew.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Step1Form from '@/components/applications/Step1Form.vue'
import Step2Form from '@/components/applications/Step2Form.vue'
import { useApplicationsStore } from '@/stores/applications'

const router = useRouter()
const appStore = useApplicationsStore()

const step = ref(1)
const step1Valid = ref(false)
const step2Valid = ref(false)

function onStep1ValidChange(ok) { step1Valid.value = ok }
function onStep1Submit(payload) {
  appStore.setStep1(payload)
  step.value = 2
}
function onStep2ValidChange(ok) { step2Valid.value = ok }

async function onStep2Submit(step2Payload) {
  appStore.setStep2(step2Payload)

  // merge and convert to FormData
  const data = appStore.merged
  const fd = new FormData()

  // send the actual file under a conventional field name (adjust if your API expects another key)
  if (data.resume_file instanceof File) {
    fd.append('resume', data.resume_file)
  }

  // append the rest (skip the raw File field)
  for (const [k, v] of Object.entries(data)) {
    if (k === 'resume_file' || v === undefined || v === null) continue
    if (Array.isArray(v)) {
      fd.append(k, JSON.stringify(v)) // arrays as JSON string
    } else {
      fd.append(k, v)
    }
  }

  // POST as multipart/form-data
  await axios.post('/api/applications', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  appStore.clear()
  router.push({ name: 'applications.list' })
}

function goBackToList() {
  appStore.clear()
  router.push({ name: 'applications.list' })
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6">
    <button class="text-sm text-gray-600 hover:underline" @click="goBackToList">
      ← Back to list
    </button>

    <div class="mt-4 rounded-xl bg-white p-6 shadow">
      <div class="mb-6 flex items-center gap-3">
        <span class="flex h-6 w-6 items-center justify-center rounded-full"
              :class="step === 1 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-700'">1</span>
        <span :class="step === 1 ? 'text-gray-900' : 'text-gray-500'">Step 1</span>
        <span class="mx-2 select-none text-gray-300">—</span>
        <span class="flex h-6 w-6 items-center justify-center rounded-full"
              :class="step === 2 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-700'">2</span>
        <span :class="step === 2 ? 'text-gray-900' : 'text-gray-500'">Step 2</span>
      </div>

      <Step1Form
        v-if="step === 1"
        @valid-change="onStep1ValidChange"
        @submit="onStep1Submit"
      />

      <Step2Form
        v-else
        :key="appStore.position || 'step2'"
        @valid-change="onStep2ValidChange"
        @back="step = 1"
        @submit="onStep2Submit"
      />
    </div>
  </div>
</template>

<style scoped>
/* no @apply here */
</style>
