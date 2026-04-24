import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // THÊM ĐOẠN SERVER PROXY NÀY VÀO
  server: {
    proxy: {
      '/api': {
        target: 'http://smartlight.runasp.net', // Trỏ thẳng về Backend của bạn
        changeOrigin: true,
        secure: false,
      }
    }
  }
})