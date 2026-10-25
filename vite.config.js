import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The google-books function only allows http://localhost:5173, so never fall back to another port.
  server: { port: 5173, strictPort: true },
})
