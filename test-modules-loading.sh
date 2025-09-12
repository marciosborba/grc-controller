#!/bin/bash

echo "🧪 Testando carregamento dos módulos da aplicação..."

# Função para testar uma rota
test_route() {
    local route=$1
    local description=$2
    
    echo "🔍 Testando: $description ($route)"
    
    # Fazer requisição e capturar código de status
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080$route")
    
    if [ "$status_code" = "200" ]; then
        echo "✅ $description: OK (HTTP $status_code)"
    else
        echo "❌ $description: ERRO (HTTP $status_code)"
    fi
}

# Testar se o servidor está respondendo
echo "🌐 Verificando se o servidor está ativo..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Servidor ativo na porta 8080"
else
    echo "❌ Servidor não está respondendo na porta 8080"
    exit 1
fi

# Testar rotas principais
echo ""
echo "📋 Testando rotas principais:"
test_route "/" "Página inicial"
test_route "/dashboard" "Dashboard"
test_route "/risks" "Gestão de Riscos"
test_route "/privacy" "Privacidade"
test_route "/policy-management" "Gestão de Políticas"
test_route "/vendors" "Fornecedores"
test_route "/incidents" "Incidentes"
test_route "/test-route" "Rota de teste"

echo ""
echo "🔍 Verificando se há erros no console do Vite..."

# Verificar logs do Vite (últimas 20 linhas)
echo "📊 Últimas mensagens do servidor:"
if pgrep -f "vite" > /dev/null; then
    echo "✅ Processo Vite encontrado"
    # Tentar capturar logs se possível
    echo "ℹ️ Para ver logs detalhados, verifique o terminal onde o Vite está rodando"
else
    echo "⚠️ Processo Vite não encontrado"
fi

echo ""
echo "🎯 Teste concluído!"
echo "💡 Para testar a interface, acesse: http://localhost:8080"