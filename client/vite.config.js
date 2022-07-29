import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/': {
        target: 'https://39.106.13.131:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [svelte()]
})
