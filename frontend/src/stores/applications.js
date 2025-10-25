// frontend/src/stores/applications.js
// Centralized store for the 2-step “New Application” flow.

import { defineStore } from 'pinia'
import { SKILL_SUGGESTIONS } from '@/constants/application'

// step defaults
function initialStep1 () {
  return {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    current_address: '',
    date_of_birth: '',
    position_applied_for: '',
    resume_file: null,        // File | null
    linkedin_profile: '',
  }
}

function initialStep2 () {
  return {
    education_level: '',
    years_of_experience: '',  // keep as string
    skills: [],               // array of strings
    previous_employer: '',
    current_job_title: '',
    notice_period: '',
    expected_salary: '',      // keep as string
    availability_for_interview: '',
    preferred_location: '',
    cover_letter: '',
    source_of_application: '',
  }
}

// value checker for dirty flag
function hasValue (v) {
  if (v === null || v === undefined) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (Array.isArray(v)) return v.length > 0
  if (v instanceof File) return !!v.name
  if (typeof v === 'number') return true   // 0 is valid
  if (typeof v === 'boolean') return true
  if (typeof v === 'object') return Object.keys(v).length > 0
  return false
}

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    step1: initialStep1(),
    step2: initialStep2(),
  }),

  getters: {
    // compatibility getters
    position: (s) => s.step1?.position_applied_for || '',
    suggestions: (s) =>
      SKILL_SUGGESTIONS[s.step1?.position_applied_for] ?? [],

    merged: (s) => ({ ...s.step1, ...s.step2 }),

    hasStep1: (s) => {
      const st = s.step1 || {}
      return Object.values(st).some(hasValue)
    },

    isDirty () {
      const m = this.merged
      if (m.resume_file instanceof File && m.resume_file.name) return true
      for (const [k, v] of Object.entries(m)) {
        if (k === 'resume_file') continue
        if (hasValue(v)) return true
      }
      return false
    },
  },

  actions: {
    // Normalize payloads to known shape to avoid stray keys
    setStep1 (payload = {}) {
      this.step1 = { ...initialStep1(), ...payload }
    },
    setStep2 (payload = {}) {
      this.step2 = { ...initialStep2(), ...payload }
    },

    // Replace objects instead of mutating (so extra keys are dropped)
    clear () {
      this.step1 = initialStep1()
      this.step2 = initialStep2()
      // или так: this.$patch({ step1: initialStep1(), step2: initialStep2() })
    },

    hasAnyData () {
      return this.isDirty
    },
  },
})
