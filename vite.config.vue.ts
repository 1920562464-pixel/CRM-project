import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },

  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src-vue')
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],
    esbuildOptions: {
      target: 'esnext'
    }
  },

  build: {
    target: 'esnext',
    outDir: 'dist-vue',
    emptyOutDir: true
  }
})
