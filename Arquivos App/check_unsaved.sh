#!/bin/bash

echo "🔍 Verificando arquivos não salvos..."

# Verificar arquivos não rastreados
UNTRACKED=$(git ls-files --others --exclude-standard)
if [ ! -z "$UNTRACKED" ]; then
    echo "⚠️ ARQUIVOS NÃO RASTREADOS ENCONTRADOS:"
    echo "$UNTRACKED"
    echo ""
fi

# Verificar arquivos modificados
MODIFIED=$(git diff --name-only)
if [ ! -z "$MODIFIED" ]; then
    echo "⚠️ ARQUIVOS MODIFICADOS NÃO COMMITADOS:"
    echo "$MODIFIED"
    echo ""
fi

# Verificar arquivos staged
STAGED=$(git diff --cached --name-only)
if [ ! -z "$STAGED" ]; then
    echo "⚠️ ARQUIVOS STAGED NÃO COMMITADOS:"
    echo "$STAGED"
    echo ""
fi

# Se tudo estiver limpo
if [ -z "$UNTRACKED" ] && [ -z "$MODIFIED" ] && [ -z "$STAGED" ]; then
    echo "✅ Todos os arquivos estão salvos!"
else
    echo "🚨 ATENÇÃO: Há arquivos não salvos!"
    echo "💡 Execute: ./auto_backup.sh para salvar tudo"
fi

echo ""
echo "📊 Status Git:"
git status --porcelain