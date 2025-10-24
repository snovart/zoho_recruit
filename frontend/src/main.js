// frontend/src/main.js
import './bootstrap'             // sets up axios globals
import './assets/app.css'        // tailwind (keep before createApp)

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'

// --- Create Vue app ---
const app = createApp(App)

// --- Create and use Pinia BEFORE router and mount ---
const pinia = createPinia()
app.use(pinia)

// --- Use router ---
app.use(router)

// --- Mount the app ---
app.mount('#app')
