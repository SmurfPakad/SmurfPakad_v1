import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
    base: "/cryptoflow/",
  server: {
    host: "::",
    port: 5173,
    open: true,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'index-[hash].js',
        chunkFileNames: 'chunk-[name]-[hash].js',
        // Heavy libraries in their own long-cacheable chunks, loaded only by pages that use them
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          graph: ['react-force-graph-2d', 'react-force-graph-3d'],
          charts: ['recharts'],
          pdf: ['jspdf'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'index-[hash].css';
          }
          return 'asset-[name]-[hash][extname]';
        },
      },
    },
  },
}));
