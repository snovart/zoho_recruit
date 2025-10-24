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

function onStep1ValidChange(ok) {
  step1Valid.value = ok
}

function onStep1Submit(payload) {
  appStore.setStep1(payload)               // save to store
  console.log('[New] Step1 saved to store:', payload)
  step.value = 2
}

function onStep2ValidChange(ok) {
  step2Valid.value = ok
}

async function onStep2Submit(step2Payload) {
  appStore.setStep2(step2Payload)          // save to store
  const finalPayload = appStore.merged
  console.log('[New] Final payload (store.merged):', finalPayload)

  // TODO: send to backend
  // await axios.post('/api/applications', finalPayload)

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
      <!-- stepper -->
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
