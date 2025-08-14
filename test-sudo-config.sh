#!/bin/bash

# 🧪 Script para Testar Configuração Sudo
# Execute este script APÓS configurar o sudo

echo "🧪 Testando configuração sudo..."
echo ""

# Função para testar comando
test_command() {
    local cmd="$1"
    local description="$2"
    
    echo -n "   $description: "
    if sudo -n $cmd > /dev/null 2>&1; then
        echo "✅ Funciona sem senha"
        return 0
    else
        echo "❌ Ainda pede senha"
        return 1
    fi
}

# Função para testar comando que deve pedir senha
test_secure_command() {
    local cmd="$1"
    local description="$2"
    
    echo -n "   $description: "
    if sudo -n $cmd > /dev/null 2>&1; then
        echo "⚠️  NÃO pede senha (pode ser inseguro)"
        return 1
    else
        echo "✅ Ainda pede senha (seguro)"
        return 0
    fi
}

echo "📋 Testando comandos que devem funcionar SEM senha:"
passed=0
total=0

# Testes de comandos liberados
test_command "apt update" "apt update" && ((passed++))
((total++))

test_command "npm list -g --depth=0" "npm list global" && ((passed++))
((total++))

test_command "systemctl status ssh" "systemctl status" && ((passed++))
((total++))

test_command "netstat -tuln" "netstat" && ((passed++))
((total++))

echo ""
echo "🔒 Testando comandos que devem AINDA pedir senha:"
secure_passed=0
secure_total=0

# Testes de segurança
test_secure_command "visudo -c" "visudo" && ((secure_passed++))
((secure_total++))

test_secure_command "passwd --help" "passwd" && ((secure_passed++))
((secure_total++))

echo ""
echo "📊 Resultados:"
echo "   Comandos liberados: $passed/$total funcionando"
echo "   Comandos seguros: $secure_passed/$secure_total ainda protegidos"

echo ""
if [ $passed -eq $total ] && [ $secure_passed -eq $secure_total ]; then
    echo "🎉 CONFIGURAÇÃO PERFEITA!"
    echo "   ✅ Todos os comandos necessários funcionam sem senha"
    echo "   ✅ Comandos críticos ainda estão protegidos"
    echo ""
    echo "🚀 Agora eu posso executar comandos sudo automaticamente!"
elif [ $passed -gt 0 ]; then
    echo "⚠️  CONFIGURAÇÃO PARCIAL"
    echo "   Alguns comandos funcionam, outros podem precisar de ajustes"
else
    echo "❌ CONFIGURAÇÃO NÃO FUNCIONOU"
    echo "   Nenhum comando está funcionando sem senha"
    echo ""
    echo "💡 Verifique se executou os comandos de configuração corretamente"
fi

echo ""
echo "📁 Arquivos de configuração:"
if [ -f "/etc/sudoers.d/dev-commands" ]; then
    echo "   ✅ /etc/sudoers.d/dev-commands existe"
    echo "   📄 Conteúdo:"
    sudo cat /etc/sudoers.d/dev-commands | grep -v "^#" | grep -v "^$" | head -5
    echo "   ..."
else
    echo "   ❌ /etc/sudoers.d/dev-commands não existe"
fi

echo ""
echo "🔄 Para reverter a configuração:"
echo "   ./remove-sudo-access.sh"