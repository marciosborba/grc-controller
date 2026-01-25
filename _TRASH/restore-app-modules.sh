#!/bin/bash

echo "🔄 Restaurando módulos da aplicação..."

# Fazer backup do App.tsx atual
echo "📦 Fazendo backup do App.tsx atual..."
cp src/App.tsx src/App-minimal-backup.tsx

# Substituir pelo App intermediário
echo "🔄 Substituindo App.tsx pela versão intermediária..."
cp src/App-intermediate.tsx src/App.tsx

echo "✅ App.tsx restaurado com módulos principais!"
echo "📝 Backup salvo em: src/App-minimal-backup.tsx"

# Verificar se o servidor precisa ser reiniciado
echo "🔍 Verificando se o servidor Vite está rodando..."
if pgrep -f "vite" > /dev/null; then
    echo "✅ Servidor Vite detectado - hot reload deve funcionar automaticamente"
else
    echo "⚠️ Servidor Vite não detectado - você pode precisar executar 'npm run dev'"
fi

echo "🌐 Acesse http://localhost:8080 para testar a aplicação"