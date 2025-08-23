#!/bin/bash

echo "🚀 Iniciando servidor de desenvolvimento persistente..."

# Verificar se screen está instalado
if ! command -v screen &> /dev/null; then
    echo "📦 Instalando screen..."
    sudo apt-get update && sudo apt-get install -y screen
fi

# Verificar se já está rodando
if screen -list | grep -q "dev-server"; then
    echo "⚠️ Servidor já está rodando em screen!"
    echo "📊 Para ver: screen -r dev-server"
    echo "🌐 Acesse: http://localhost:8080"
    exit 0
fi

# Parar qualquer processo anterior
echo "🛑 Parando processos anteriores..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# Iniciar em screen
echo "▶️ Iniciando servidor em screen..."
screen -dmS dev-server bash -c "npm run dev; exec bash"

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 5

# Verificar se está rodando
if screen -list | grep -q "dev-server"; then
    echo "✅ Servidor iniciado com sucesso em screen!"
    echo "📋 Screen session: dev-server"
    echo "🌐 URL: http://localhost:8080"
    echo ""
    echo "📊 Comandos úteis:"
    echo "   Ver servidor: screen -r dev-server"
    echo "   Sair do screen: Ctrl+A, D"
    echo "   Parar servidor: ./stop_dev_server.sh"
    echo "   Verificar status: ./check_dev_server.sh"
else
    echo "❌ Erro ao iniciar servidor!"
    exit 1
fi