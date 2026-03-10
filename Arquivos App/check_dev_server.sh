#!/bin/bash

echo "🔍 Verificando status do servidor de desenvolvimento..."

# Verificar processos
PIDS=$(pgrep -f "vite\|npm run dev" 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "❌ Servidor NÃO está rodando"
    echo ""
    echo "🚀 Para iniciar: ./start_dev_server.sh"
    exit 1
else
    echo "✅ Servidor está RODANDO"
    echo ""
    echo "📋 Processos:"
    ps aux | grep -E "(vite|npm run dev)" | grep -v grep
    echo ""
    echo "🌐 URLs disponíveis:"
    echo "   Local:   http://localhost:8080/"
    echo "   Network: http://10.0.2.15:8080/"
    echo "   Network: http://172.18.0.1:8080/"
    echo ""
    
    # Verificar se a porta está respondendo
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ Servidor respondendo na porta 8080"
    else
        echo "⚠️ Servidor rodando mas não responde na porta 8080"
    fi
    
    # Mostrar últimas linhas do log se existir
    if [ -f "dev_server.log" ]; then
        echo ""
        echo "📄 Últimas linhas do log:"
        tail -5 dev_server.log
    fi
fi

echo ""
echo "🛑 Para parar: ./stop_dev_server.sh"