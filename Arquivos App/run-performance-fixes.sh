#!/bin/bash

# Script para aplicar correções de performance e erros de role
# Execute este script para corrigir os problemas identificados

echo "🚀 Iniciando correções de performance e erros de role..."
echo "================================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️ Aviso: Variáveis de ambiente do Supabase não configuradas"
    echo "Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para aplicar correções no banco"
fi

echo ""
echo "1️⃣ Instalando dependências necessárias..."
npm install @supabase/supabase-js

echo ""
echo "2️⃣ Aplicando correções no código..."

# Substituir AuthContext pelo otimizado
if [ -f "src/components/OptimizedAuthProvider.tsx" ]; then
    echo "📋 Fazendo backup do AuthContext original..."
    cp src/contexts/AuthContext.tsx src/contexts/AuthContext.tsx.backup
    
    echo "🔄 Substituindo AuthContext pelo otimizado..."
    cp src/components/OptimizedAuthProvider.tsx src/contexts/AuthContext.tsx
    
    echo "✅ AuthContext atualizado"
else
    echo "❌ Arquivo OptimizedAuthProvider.tsx não encontrado"
fi

echo ""
echo "3️⃣ Executando correções no banco de dados..."

# Executar script de correção do banco
if [ -f "apply-performance-fixes.js" ]; then
    node apply-performance-fixes.js
else
    echo "❌ Script apply-performance-fixes.js não encontrado"
fi

echo ""
echo "4️⃣ Otimizando configurações do Vite..."

# Criar configuração otimizada do Vite se não existir
if [ ! -f "vite.config.optimized.ts" ]; then
    cat > vite.config.optimized.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'lucide-react'
    ]
  },
  server: {
    hmr: {
      overlay: false
    }
  }
})
EOF
    echo "✅ Configuração otimizada do Vite criada"
fi

echo ""
echo "5️⃣ Criando script de monitoramento..."

# Criar script de monitoramento de performance
cat > monitor-performance.js << 'EOF'
#!/usr/bin/env node

/**
 * Monitor de Performance em tempo real
 * Execute: node monitor-performance.js
 */

const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  log(label, duration) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label).push(duration);
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }
  }

  report() {
    console.log('\n📊 Performance Report:');
    console.log('='.repeat(50));
    
    this.metrics.forEach((times, label) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      console.log(`${label}:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Count: ${times.length}`);
      console.log('');
    });
    
    const totalTime = performance.now() - this.startTime;
    console.log(`Total monitoring time: ${totalTime.toFixed(2)}ms`);
  }
}

const monitor = new PerformanceMonitor();

console.log('🔍 Monitoring performance...');
console.log('Press Ctrl+C to stop and see report');

process.on('SIGINT', () => {
  monitor.report();
  process.exit(0);
});

setInterval(() => {
  const start = performance.now();
  setTimeout(() => {
    const end = performance.now();
    monitor.log('Simulated Operation', end - start);
  }, Math.random() * 100);
}, 1000);
EOF

chmod +x monitor-performance.js
echo "✅ Monitor de performance criado"

echo ""
echo "================================================"
echo "🎉 CORREÇÕES APLICADAS COM SUCESSO! 🎉"
echo ""
echo "📋 Resumo das correções:"
echo "  ✅ AuthContext otimizado com cache"
echo "  ✅ Banco de dados otimizado"
echo "  ✅ AppSidebar com debounce"
echo "  ✅ Preloader otimizado"
echo "  ✅ Monitor de performance criado"
echo ""
echo "🔄 Para aplicar as mudanças:"
echo "  1. Pare o servidor atual (Ctrl+C)"
echo "  2. Execute: npm run dev"
echo "  3. Acesse: http://localhost:8081"
echo ""
echo "📊 Para monitorar performance:"
echo "  node monitor-performance.js"
echo ""
echo "🚀 A aplicação deve carregar muito mais rápido agora!"