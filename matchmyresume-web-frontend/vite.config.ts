import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['daisyui']
        }
      }
    }
  },
  // SEO optimization: ensure proper base URL for static hosting
  base: './',
  // Enable source maps for better debugging
  css: {
    devSourcemap: true
  }
})