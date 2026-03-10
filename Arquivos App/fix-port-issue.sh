#!/bin/bash

echo "🔍 Diagnosticando problema de porta..."

# Verificar qual porta está sendo usada
echo "📊 Verificando processos Vite ativos:"
ps aux | grep vite | grep -v grep

echo ""
echo "🌐 Verificando portas em uso:"
netstat -tlnp 2>/dev/null | grep -E ":(808[0-9]|3000)" || echo "netstat não disponível, usando ss:"
ss -tlnp 2>/dev/null | grep -E ":(808[0-9]|3000)" || echo "Nenhuma ferramenta de rede disponível"

echo ""
echo "🔍 Verificando configuração do Vite:"
grep -n "port.*808" vite.config.ts || echo "Configuração de porta não encontrada"

echo ""
echo "🧹 Limpando cache do Vite..."
rm -rf node_modules/.vite
rm -rf dist

echo ""
echo "🔄 Matando processos Vite existentes..."
pkill -f "vite" || echo "Nenhum processo Vite encontrado"

echo ""
echo "⏳ Aguardando 2 segundos..."
sleep 2

echo ""
echo "🚀 Iniciando servidor Vite na porta correta..."
echo "📝 Comando: npm run dev"
echo ""
echo "✅ Execute 'npm run dev' para iniciar o servidor na porta 8080"
echo "🌐 Depois acesse: http://localhost:8080"