#!/bin/bash

echo "🛑 Parando servidor de desenvolvimento..."

# Encontrar e parar processos
PIDS=$(pgrep -f "vite\|npm run dev" 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "ℹ️ Nenhum servidor rodando"
    exit 0
fi

echo "📋 Processos encontrados:"
ps aux | grep -E "(vite|npm run dev)" | grep -v grep

echo ""
echo "🔄 Parando processos..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Aguardar um pouco
sleep 2

# Verificar se parou
REMAINING=$(pgrep -f "vite\|npm run dev" 2>/dev/null)
if [ -z "$REMAINING" ]; then
    echo "✅ Servidor parado com sucesso!"
else
    echo "⚠️ Forçando parada..."
    pkill -9 -f "vite" 2>/dev/null || true
    pkill -9 -f "npm run dev" 2>/dev/null || true
    echo "✅ Servidor forçadamente parado!"
fi

# Limpar arquivo de log
if [ -f "dev_server.log" ]; then
    echo "🧹 Limpando log anterior..."
    rm -f dev_server.log
fi

echo "🏁 Pronto para reiniciar!"