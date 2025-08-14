#!/bin/bash

# 🔄 Script para Remover Acesso Sudo Configurado
# Este script remove as configurações de sudo NOPASSWD

set -e

echo "🔄 Removendo configurações de sudo NOPASSWD..."
echo ""

# Verificar se é executado como usuário normal
if [ "$EUID" -eq 0 ]; then
    echo "❌ Não execute este script como root!"
    echo "   Execute como usuário normal: ./remove-sudo-access.sh"
    exit 1
fi

SUDO_FILE="/etc/sudoers.d/dev-commands"

# Verificar se arquivo existe
if [ ! -f "$SUDO_FILE" ]; then
    echo "ℹ️  Arquivo $SUDO_FILE não existe"
    echo "   Nada para remover"
    exit 0
fi

echo "📄 Arquivo encontrado: $SUDO_FILE"
echo ""

# Mostrar conteúdo atual
echo "📋 Conteúdo atual:"
sudo cat "$SUDO_FILE" | grep -v "^#" | grep -v "^$"
echo ""

# Confirmar remoção
read -p "❓ Deseja remover esta configuração? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remover arquivo
    echo "🗑️  Removendo $SUDO_FILE..."
    sudo rm "$SUDO_FILE"
    echo "✅ Arquivo removido"
    
    # Testar se sudo volta a pedir senha
    echo ""
    echo "🧪 Testando se sudo volta a pedir senha..."
    if sudo -n apt update > /dev/null 2>&1; then
        echo "⚠️  Sudo ainda não pede senha (pode haver outras configurações)"
    else
        echo "✅ Sudo voltou a pedir senha"
    fi
    
    echo ""
    echo "🎉 Configuração removida com sucesso!"
    echo ""
    echo "📝 Para restaurar backup completo (se necessário):"
    echo "   sudo cp /etc/sudoers.backup.* /etc/sudoers"
    
else
    echo "❌ Operação cancelada"
fi