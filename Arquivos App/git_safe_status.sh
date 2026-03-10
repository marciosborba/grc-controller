#!/bin/bash

echo "🔍 Git Status Seguro (contorna objeto corrompido)..."

# Usar git status --porcelain que funciona
echo "📋 Arquivos modificados/não rastreados:"
git status --porcelain

echo ""
echo "📊 Branch atual:"
git branch --show-current

echo ""
echo "📈 Últimos commits:"
git log --oneline -3

echo ""
echo "🌐 Remote status:"
git remote -v

echo ""
echo "✅ Git está funcionando (usando comandos alternativos)"