// frontend/src/stores/applications.js
// Centralized store for the 2-step “New Application” flow.

import { defineStore } from 'pinia'
import { SKILL_SUGGESTIONS } from '@/constants/application'

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    // payload from Step 1 (snake_case keys)
    step1: {},
    // payload from Step 2 (snake_case keys)
    step2: {},
  }),

  getters: {
    position: (s) => s.step1?.position_applied_for || '',
    suggestions: (s) => SKILL_SUGGESTIONS[s.step1?.position_applied_for] ?? [],
    merged: (s) => ({ ...s.step1, ...s.step2 }),
    hasStep1: (s) => Object.keys(s.step1 || {}).length > 0,
  },

  actions: {
    setStep1(payload) {
      this.step1 = payload || {}
    },
    setStep2(payload) {
      this.step2 = payload || {}
    },
    clear() {
      this.step1 = {}
      this.step2 = {}
    },
  },
})
