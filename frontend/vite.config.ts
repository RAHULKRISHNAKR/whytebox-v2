import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Split large chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // State management
            'state-vendor': ['@reduxjs/toolkit', 'react-redux', 'zustand'],
            // UI library
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            // Data fetching
            'query-vendor': ['@tanstack/react-query', 'axios'],
            // BabylonJS (large — separate chunk)
            'babylon-vendor': ['@babylonjs/core', '@babylonjs/loaders', '@babylonjs/materials'],
            // Charts and visualization
            'viz-vendor': ['d3', 'recharts', 'reactflow'],
          },
        },
      },
      // Warn if any chunk exceeds 1MB
      chunkSizeWarningLimit: 1000,
    },

    server: {
      port: 5173,
      host: '0.0.0.0',
      // Proxy API calls to backend in development.
      // Backend runs on port 5001 locally (macOS AirPlay Receiver occupies 5000).
      // Production uses VITE_API_URL env var — these fallbacks are dev-only.
      proxy: {
        // Proxy /api/* and /ws/* to the backend.
        // Use 127.0.0.1 (not localhost) — on macOS with Node 18+, 'localhost' resolves
        // to IPv6 ::1 first, but uvicorn binds to IPv4 0.0.0.0/127.0.0.1 by default,
        // causing ECONNREFUSED ::1. Explicit 127.0.0.1 forces IPv4.
        // VITE_BACKEND_PORT can override the port (default 8000).
        '/api': {
          target: `http://127.0.0.1:${env.VITE_BACKEND_PORT || '8000'}`,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: `http://127.0.0.1:${env.VITE_BACKEND_PORT || '8000'}`,
          changeOrigin: true,
          ws: true,
        },
      },
    },

    preview: {
      port: 4173,
      host: '0.0.0.0',
    },

    // Optimise deps for faster dev server startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@tanstack/react-query',
        'axios',
        'zustand',
      ],
      exclude: [
        '@babylonjs/core',  // BabylonJS uses ESM — exclude from pre-bundling
      ],
    },

    define: {
      // Make env vars available at build time
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    },
  }
})

// Made with Bob
