import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /** Keep compile / HMR lines in the terminal instead of clearing the screen each rebuild. */
  clearScreen: false,
  server: {
    /** Shows VITE v... ready in ms and HMR updates in the console you launched `npm run dev` from. */
    strictPort: false,
    /** When VITE_API_BASE_URL is unset, `fetch("/api/...")` hits Vite; forward to Laravel. */
    proxy: {
      "/api": { target: "http://127.0.0.1:8001", changeOrigin: true },
      "/sanctum": { target: "http://127.0.0.1:8001", changeOrigin: true },
    },
  },
})
