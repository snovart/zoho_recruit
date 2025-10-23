import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ------------------------------------------------------------
// Vite configuration
// Adds folder aliases for cleaner imports
// Example: import MyComp from '@components/MyComp.vue'
// ------------------------------------------------------------
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
    },
  },
})
