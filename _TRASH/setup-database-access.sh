#!/bin/bash

# 🚀 Script de Configuração - Acesso PostgreSQL
# Este script configura o ambiente para acesso direto ao PostgreSQL do Supabase

echo "🐘 Configurando acesso ao PostgreSQL do Supabase..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências necessárias
echo ""
echo "📦 Instalando dependências..."

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "⚠️  package.json não encontrado. Inicializando projeto npm..."
    npm init -y
fi

# Instalar pg (PostgreSQL driver)
echo "📦 Instalando driver PostgreSQL (pg)..."
npm install pg

# Instalar dotenv para variáveis de ambiente
echo "📦 Instalando dotenv..."
npm install dotenv

# Instalar tipos TypeScript se necessário
if [ -f "tsconfig.json" ]; then
    echo "📦 Instalando tipos TypeScript..."
    npm install --save-dev @types/pg
fi

# Verificar se Supabase CLI está instalado
echo ""
echo "🔧 Verificando Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI não encontrado."
    echo "📥 Instalando Supabase CLI..."
    
    # Detectar sistema operacional
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo "❌ Homebrew não encontrado. Instale manualmente:"
            echo "   https://supabase.com/docs/guides/cli"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "💡 Para Linux, instale manualmente:"
        echo "   npm install -g supabase"
        echo "   ou siga: https://supabase.com/docs/guides/cli"
    else
        # Windows ou outros
        echo "💡 Para seu sistema, instale manualmente:"
        echo "   npm install -g supabase"
        echo "   ou siga: https://supabase.com/docs/guides/cli"
    fi
else
    echo "✅ Supabase CLI encontrado: $(supabase --version)"
fi

# Configurar arquivo .env
echo ""
echo "🔐 Configurando variáveis de ambiente..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado a partir do .env.example"
    else
        echo "⚠️  .env.example não encontrado. Criando .env básico..."
        cat > .env << EOF
# Configurações do Supabase
SUPABASE_URL=https://myxvxponlmulnjstbjwd.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_DB_PASSWORD=sua_senha_do_banco_aqui
NODE_ENV=development
EOF
        echo "✅ Arquivo .env criado"
    fi
else
    echo "✅ Arquivo .env já existe"
fi

# Verificar .gitignore
echo ""
echo "🔒 Verificando .gitignore..."

if [ ! -f ".gitignore" ]; then
    echo "📝 Criando .gitignore..."
    cat > .gitignore << EOF
# Dependências
node_modules/
npm-debug.log*

# Variáveis de ambiente
.env
.env.local
.env.production

# Logs
*.log

# Arquivos temporários
.DS_Store
Thumbs.db
EOF
else
    # Verificar se .env está no .gitignore
    if ! grep -q "\.env" .gitignore; then
        echo ".env" >> .gitignore
        echo "✅ Adicionado .env ao .gitignore"
    fi
fi

echo "✅ .gitignore configurado"

# Adicionar scripts ao package.json
echo ""
echo "📝 Configurando scripts npm..."

# Verificar se jq está disponível para editar JSON
if command -v jq &> /dev/null; then
    # Usar jq para adicionar scripts
    tmp=$(mktemp)
    jq '.scripts += {
        "db:connect": "psql \"postgresql://postgres:$SUPABASE_DB_PASSWORD@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres\"",
        "db:test": "node database-manager.js test-connection",
        "db:setup": "node database-manager.js setup-tenant-settings",
        "db:structure": "node database-manager.js show-structure tenants",
        "db:backup": "node database-manager.js backup-table tenants"
    }' package.json > "$tmp" && mv "$tmp" package.json
    echo "✅ Scripts npm adicionados"
else
    echo "⚠️  jq não encontrado. Adicione manualmente os scripts ao package.json:"
    echo '  "db:test": "node database-manager.js test-connection"'
    echo '  "db:setup": "node database-manager.js setup-tenant-settings"'
fi

# Testar conexão se credenciais estiverem configuradas
echo ""
echo "🧪 Testando configuração..."

if [ -f ".env" ]; then
    # Carregar variáveis do .env
    export $(grep -v '^#' .env | xargs)
    
    if [ -n "$SUPABASE_DB_PASSWORD" ] && [ "$SUPABASE_DB_PASSWORD" != "sua_senha_do_banco_aqui" ]; then
        echo "🔗 Testando conexão com o banco..."
        node database-manager.js test-connection
    else
        echo "⚠️  Configure SUPABASE_DB_PASSWORD no arquivo .env antes de testar"
    fi
fi

# Instruções finais
echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as credenciais no arquivo .env:"
echo "   - SUPABASE_DB_PASSWORD (obtenha no Dashboard > Settings > Database)"
echo "   - SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY (Dashboard > Settings > API)"
echo ""
echo "2. Teste a conexão:"
echo "   npm run db:test"
echo ""
echo "3. Configure o campo settings na tabela tenants:"
echo "   npm run db:setup"
echo ""
echo "4. Comandos disponíveis:"
echo "   node database-manager.js                    # Ver todos os comandos"
echo "   node database-manager.js test-connection    # Testar conexão"
echo "   node database-manager.js show-structure tenants  # Ver estrutura da tabela"
echo ""
echo "📚 Documentação completa em: PostgreSQL_CLI_Access.md"
echo ""
echo "⚠️  IMPORTANTE: Nunca commite o arquivo .env com credenciais reais!"