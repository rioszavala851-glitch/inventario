import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensure access from network/Docker
    hmr: {
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      protocol: 'ws',
    },
  },
})
