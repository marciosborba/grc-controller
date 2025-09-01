import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { colorUpdaterPlugin } from "./vite-color-plugin.js";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && colorUpdaterPlugin(),
    // Disable lovable-tagger to improve rendering
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    devSourcemap: mode === 'development',
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (id.includes('recharts') || id.includes('html2canvas')) {
            return 'vendor-charts';
          }
          
          // Feature chunks
          if (id.includes('privacy')) {
            return 'feature-privacy';
          }
          if (id.includes('assessments')) {
            return 'feature-assessments';
          }
          if (id.includes('admin')) {
            return 'feature-admin';
          }
          if (id.includes('general-settings')) {
            return 'feature-settings';
          }
          if (id.includes('risks')) {
            return 'feature-risks';
          }
          
          // Node modules default
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
}));
