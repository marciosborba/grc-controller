#!/bin/bash

echo "🔄 Reiniciando servidor de desenvolvimento..."

# Matar processos do npm/vite
echo "🛑 Parando servidor atual..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

# Aguardar um pouco
sleep 2

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Aguardar um pouco mais
sleep 1

echo "✅ Cache limpo e servidor parado!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Execute: npm run dev"
echo "2. Aguarde o servidor iniciar"
echo "3. Abra o navegador em http://localhost:8080"
echo "4. Faça hard refresh: Ctrl+F5 ou Ctrl+Shift+R"
echo "5. Verifique o console do navegador para o log: '🚀 [SIDEBAR] AppSidebar carregado'"
echo ""
echo "🎯 O menu deve aparecer como: 'Gestão de Políticas' (não mais 'Políticas')"