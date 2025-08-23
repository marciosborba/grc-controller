#!/bin/bash

# Script para manter o servidor Vite rodando de forma persistente
echo "🚀 Iniciando servidor Vite de forma persistente..."

# Matar qualquer processo vite existente
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Aguardar um pouco
sleep 2

# Iniciar o servidor em background com nohup
nohup npm run dev > vite.log 2>&1 &

# Capturar o PID
VITE_PID=$!
echo "📝 Servidor iniciado com PID: $VITE_PID"
echo $VITE_PID > vite.pid

# Aguardar o servidor inicializar
echo "⏳ Aguardando servidor inicializar..."
sleep 5

# Verificar se está rodando
if ps -p $VITE_PID > /dev/null; then
    echo "✅ Servidor está rodando!"
    echo "🌐 Acesse: http://localhost:8080"
    echo "📋 PID salvo em: vite.pid"
    echo "📄 Logs em: vite.log"
    
    # Verificar se a porta está sendo usada
    if ss -tlnp | grep -q ":8080"; then
        echo "🔌 Porta 8080 está ativa"
    else
        echo "⚠️  Porta 8080 não está ativa ainda, aguarde mais um pouco"
    fi
else
    echo "❌ Falha ao iniciar o servidor"
    echo "📄 Verificar logs em: vite.log"
    exit 1
fi