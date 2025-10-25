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
    // keeps compatibility with existing components
    position: (s) => s.step1?.position_applied_for || '',
    suggestions: (s) =>
      SKILL_SUGGESTIONS[s.step1?.position_applied_for] ?? [],

    // merged payload snapshot
    merged: (s) => ({ ...s.step1, ...s.step2 }),

    // did user touch step1 at all
    hasStep1: (s) => {
      const st = s.step1 || {}
      return Object.values(st).some(hasValue)
    },

    // global dirty flag (any step)
    isDirty () {
      const m = this.merged
      // explicit file first
      if (m.resume_file instanceof File && m.resume_file.name) return true
      for (const [k, v] of Object.entries(m)) {
        if (k === 'resume_file') continue
        if (hasValue(v)) return true
      }
      return false
    },
  },

  actions: {
    setStep1 (payload = {}) {
      Object.assign(this.step1, payload)
    },
    setStep2 (payload = {}) {
      Object.assign(this.step2, payload)
    },
    clear () {
      Object.assign(this.step1, initialStep1())
      Object.assign(this.step2, initialStep2())
    },
    // convenience helper for guards
    hasAnyData () {
      return this.isDirty
    },
  },
})
