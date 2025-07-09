import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(async () => {
  
  const { default: checker } = await import('vite-plugin-checker')

  return {
    root: '.',
    plugins: [
      react(),
      checker({ typescript: true })
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },

    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    }
  }
})
