import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Frontend'ten /api ile başlayan istekleri backend'e yönlendir
      '/api': {
        target: 'http://127.0.0.1:8000', // Node.js backend adresi
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
