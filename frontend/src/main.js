// frontend/src/main.js
// ------------------------------------------------------------------
// Vue 3 + Vite entrypoint
// Includes: TailwindCSS, Pinia, Router, Axios bootstrap
// ------------------------------------------------------------------

import './assets/app.css'      // Tailwind and global styles
import './bootstrap'           // Axios (window.axios)
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// ---- Initialize Vue app ------------------------------------------
const app = createApp(App)

// ---- Plugins ------------------------------------------------------
app.use(createPinia())
app.use(router)

// ---- Mount --------------------------------------------------------
app.mount('#app')
