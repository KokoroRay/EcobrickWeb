import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  optimizeDeps: {
    include: ['tslib']
  },
  server: {
    mimeTypes: {
      'application/javascript': ['js', 'mjs']
    }
  }
})
