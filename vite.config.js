import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet')) return 'leaflet';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/animejs') || id.includes('node_modules/lenis')) return 'animations';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/i18next')) return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
