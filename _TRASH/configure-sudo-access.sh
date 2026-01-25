#!/bin/bash

# 🔐 Script para Configurar Acesso Sudo Seguro
# Este script configura sudo NOPASSWD para comandos específicos de desenvolvimento

set -e

echo "🔐 Configurando acesso sudo para desenvolvimento..."
echo ""

# Verificar se é executado como usuário normal
if [ "$EUID" -eq 0 ]; then
    echo "❌ Não execute este script como root!"
    echo "   Execute como usuário normal: ./configure-sudo-access.sh"
    exit 1
fi

# Verificar se usuário está no grupo sudo
if ! groups | grep -q sudo; then
    echo "❌ Usuário $(whoami) não está no grupo sudo!"
    echo "   Execute: sudo usermod -aG sudo $(whoami)"
    exit 1
fi

echo "✅ Usuário $(whoami) está no grupo sudo"
echo ""

# Fazer backup do sudoers
echo "💾 Fazendo backup do sudoers..."
sudo cp /etc/sudoers /etc/sudoers.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado"
echo ""

# Criar arquivo de configuração específico
SUDO_FILE="/etc/sudoers.d/dev-commands"
echo "📝 Criando configuração em $SUDO_FILE..."

# Comandos seguros para desenvolvimento
sudo tee "$SUDO_FILE" > /dev/null << EOF
# Configuração sudo para desenvolvimento
# Criado em: $(date)
# Usuário: $(whoami)

# Comandos de sistema seguros
$(whoami) ALL=(ALL) NOPASSWD: \\
    /usr/bin/apt update, \\
    /usr/bin/apt upgrade, \\
    /usr/bin/apt install *, \\
    /usr/bin/apt remove *, \\
    /usr/bin/apt autoremove, \\
    /usr/bin/apt autoclean

# Comandos npm/node
$(whoami) ALL=(ALL) NOPASSWD: \\
    /usr/bin/npm install -g *, \\
    /usr/bin/npm update -g *, \\
    /usr/bin/npm uninstall -g *

# Comandos snap
$(whoami) ALL=(ALL) NOPASSWD: \\
    /usr/bin/snap install *, \\
    /usr/bin/snap refresh *, \\
    /usr/bin/snap remove *

# Comandos systemctl (serviços específicos)
$(whoami) ALL=(ALL) NOPASSWD: \\
    /usr/bin/systemctl restart nginx, \\
    /usr/bin/systemctl start nginx, \\
    /usr/bin/systemctl stop nginx, \\
    /usr/bin/systemctl status *, \\
    /usr/bin/systemctl reload nginx

# Comandos de rede seguros
$(whoami) ALL=(ALL) NOPASSWD: \\
    /usr/bin/netstat *, \\
    /usr/bin/ss *, \\
    /usr/bin/lsof *
EOF

# Verificar sintaxe do arquivo criado
echo "🔍 Verificando sintaxe..."
if sudo visudo -c -f "$SUDO_FILE"; then
    echo "✅ Sintaxe correta"
else
    echo "❌ Erro na sintaxe! Removendo arquivo..."
    sudo rm "$SUDO_FILE"
    exit 1
fi

# Definir permissões corretas
sudo chmod 440 "$SUDO_FILE"
echo "✅ Permissões configuradas"
echo ""

# Testar configuração
echo "🧪 Testando configuração..."
echo ""

# Testes
tests=(
    "apt update"
    "npm list -g --depth=0"
    "systemctl status nginx"
)

for test_cmd in "${tests[@]}"; do
    echo "   Testando: sudo $test_cmd"
    if sudo -n $test_cmd > /dev/null 2>&1; then
        echo "   ✅ Funcionou sem senha"
    else
        echo "   ⚠️  Ainda pede senha ou comando não disponível"
    fi
done

echo ""

# Testar comando que deve pedir senha
echo "🔒 Testando segurança (deve pedir senha):"
if sudo -n visudo -c > /dev/null 2>&1; then
    echo "   ⚠️  ATENÇÃO: visudo não pede senha (pode ser inseguro)"
else
    echo "   ✅ visudo ainda pede senha (seguro)"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Comandos liberados sem senha:"
echo "   • apt update, upgrade, install, remove"
echo "   • npm install/update/uninstall -g"
echo "   • snap install/refresh/remove"
echo "   • systemctl (nginx e status)"
echo "   • netstat, ss, lsof"
echo ""
echo "🔒 Comandos que ainda pedem senha (seguro):"
echo "   • visudo, passwd, su"
echo "   • rm -rf /, chmod 777"
echo "   • Outros comandos administrativos críticos"
echo ""
echo "🔄 Para reverter:"
echo "   sudo rm $SUDO_FILE"
echo ""
echo "📁 Arquivo de configuração: $SUDO_FILE"
echo "💾 Backup do sudoers original: /etc/sudoers.backup.*"