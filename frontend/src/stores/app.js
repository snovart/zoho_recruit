// frontend/src/stores/app.js
// ------------------------------------------------------------
// Global Pinia store for the application
// ------------------------------------------------------------
// Purpose:
//  - Provides central state management for the SPA
//  - Used to share data (e.g., user info, theme, etc.) between components
// ------------------------------------------------------------

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: 'Zoho Recruit',
    version: '1.0.0',
  }),

  getters: {
    appTitle: (state) => `${state.appName} v${state.version}`,
  },

  actions: {
    setVersion(newVersion) {
      this.version = newVersion
    },
  },
})
