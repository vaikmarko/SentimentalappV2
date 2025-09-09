import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The backend writes markdown files into MentalOS/user_data while the app is running.
  // Those changes should *not* cause the front-end dev-server to reload the entire page,
  // otherwise the editor and chat reset whenever the AI updates a file.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    },
    watch: {
      // Ignore any files under user_data (both at project root and within MentalOS)
      ignored: [
        '**/user_data/**',           // root-level user_data
        '**/MentalOS/user_data/**',  // within MentalOS package
      ],
    },
  },
})
