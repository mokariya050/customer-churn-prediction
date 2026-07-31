import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// All Flask API routes must be proxied to the backend dev server
const FLASK_URL = 'http://localhost:5000'

const proxyRoute = {
  target: FLASK_URL,
  changeOrigin: true,
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict':     proxyRoute,
      '/chat':        proxyRoute,
      '/explain':     proxyRoute,
      '/test-gemini': proxyRoute,
    },
  },
})
