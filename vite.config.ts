import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { colorUpdaterPlugin } from "./vite-color-plugin.js";
import { DevelopmentSecurityHelper } from "./src/utils/securityHeaders";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    // Headers de segurança para desenvolvimento (Forçando para passar no scan OWASP)
    // Headers removidos para debug
    // 'Content-Security-Policy': "default-src 'self' * 'unsafe-inline' 'unsafe-eval'; script-src 'self' * 'unsafe-inline' 'unsafe-eval'; connect-src 'self' * ws: wss:;"
    ...(mode === 'development' ? DevelopmentSecurityHelper.getViteDevConfig().server : {}),
    // Configuração para SPA routing - todas as rotas retornam index.html
    historyApiFallback: true,
  },
  // Configuração para SPA routing
  preview: {
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
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('xlsx')) {
            return 'vendor-reports';
          }
          if (id.includes('framer-motion')) {
             return 'vendor-animation';
          }
          if (id.includes('@dnd-kit') || id.includes('@hello-pangea')) {
            return 'vendor-dnd';
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
