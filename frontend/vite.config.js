/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      // Dev: Proxy /api về localhost:5000
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    define: {
      // Cho phép dùng import.meta.env.VITE_API_URL trong code
      __API_URL__: JSON.stringify(apiTarget),
    }
  }
})
