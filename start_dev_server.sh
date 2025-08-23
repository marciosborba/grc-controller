#!/bin/bash

echo "🚀 Iniciando servidor de desenvolvimento em background..."

# Verificar se já está rodando
if pgrep -f "vite" > /dev/null; then
    echo "⚠️ Servidor já está rodando!"
    echo "📊 Processos encontrados:"
    ps aux | grep -E "(vite|npm run dev)" | grep -v grep
    echo ""
    echo "🌐 Acesse: http://localhost:8080"
    exit 0
fi

# Limpar cache antes de iniciar
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# Iniciar servidor em background
echo "▶️ Iniciando servidor..."
nohup npm run dev > dev_server.log 2>&1 &
SERVER_PID=$!

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 3

# Verificar se iniciou corretamente
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Servidor iniciado com sucesso!"
    echo "📋 PID: $SERVER_PID"
    echo "📄 Log: dev_server.log"
    echo "🌐 URL: http://localhost:8080"
    echo ""
    echo "📊 Para verificar status: ./check_dev_server.sh"
    echo "🛑 Para parar: ./stop_dev_server.sh"
else
    echo "❌ Erro ao iniciar servidor!"
    echo "📄 Verifique o log: cat dev_server.log"
    exit 1
fi