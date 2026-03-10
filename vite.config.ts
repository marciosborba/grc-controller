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
    port: 3001,
    // Headers de segurança para desenvolvimento (Forçando para passar no scan OWASP)
    // Headers removidos para debug
    // 'Content-Security-Policy': "default-src 'self' * 'unsafe-inline' 'unsafe-eval'; script-src 'self' * 'unsafe-inline' 'unsafe-eval'; connect-src 'self' * ws: wss:;"
    ...(mode === 'development' ? DevelopmentSecurityHelper.getViteDevConfig().server : {}),
    // Configuração para SPA routing - todas as rotas retornam index.html
    historyApiFallback: true,
  },
  // Configuração para SPA routing
  preview: {
    port: 3001,
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
  },
}));
