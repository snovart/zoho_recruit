// frontend/src/main.js
import './bootstrap'             // sets up axios globals
import './assets/app.css'        // tailwind (keep before createApp)

import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'

const app = createApp(App)
app.use(router)
app.mount('#app')
