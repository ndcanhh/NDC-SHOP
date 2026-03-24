import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Chỉnh sửa đường dẫn mặc định: Mọi truy cập đến "/api" sẽ được ngầm chuyển tới cửa số 5000 của Backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
