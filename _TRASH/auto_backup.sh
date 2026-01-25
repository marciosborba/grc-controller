#!/bin/bash

echo "🔄 Auto Backup - Salvando todas as alterações..."

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não é um repositório Git!"
    exit 1
fi

# Mostrar status atual
echo "📋 Status atual:"
git status --porcelain

# Adicionar todos os arquivos
echo "➕ Adicionando todos os arquivos..."
git add .

# Verificar se há algo para commitar
if git diff --cached --quiet; then
    echo "✅ Nenhuma alteração para commitar"
else
    # Fazer commit com timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "💾 Fazendo commit: Auto backup - $TIMESTAMP"
    git commit -m "Auto backup - $TIMESTAMP

- Backup automático de todas as alterações
- Timestamp: $TIMESTAMP
- Branch: $(git branch --show-current)"

    # Fazer push
    echo "🚀 Fazendo push para origin..."
    git push origin $(git branch --show-current)
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup realizado com sucesso!"
    else
        echo "⚠️ Erro no push, mas commit local foi realizado"
    fi
fi

# Mostrar status final
echo ""
echo "📊 Status final:"
git status --porcelain

echo ""
echo "📈 Últimos commits:"
git log --oneline -3

echo ""
echo "✅ Auto backup concluído!"