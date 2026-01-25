#!/bin/bash

# Script para configurar templates de riscos usando psql direto
# Baseado nas configurações do db.md

echo "🚀 Configurando Templates de Riscos no PostgreSQL/Supabase"
echo "=================================================="

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado. Instale o PostgreSQL client:"
    echo "   Ubuntu/Debian: sudo apt install postgresql-client"
    echo "   macOS: brew install postgresql"
    echo "   Windows: Baixe do site oficial do PostgreSQL"
    exit 1
fi

# Configurações do banco (do db.md)
DB_HOST="db.myxvxponlmulnjstbjwd.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Verificar se a senha está no .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ SUPABASE_DB_PASSWORD não encontrada no .env"
    echo "💡 Adicione a senha do banco no arquivo .env:"
    echo "SUPABASE_DB_PASSWORD=sua_senha_aqui"
    exit 1
fi

# String de conexão
CONNECTION_STRING="postgresql://$DB_USER:$SUPABASE_DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo "🔗 Testando conexão com o banco..."
if psql "$CONNECTION_STRING" -c "SELECT version();" > /dev/null 2>&1; then
    echo "   ✅ Conexão estabelecida"
else
    echo "   ❌ Falha na conexão. Verifique as credenciais no .env"
    exit 1
fi

# Verificar se tabelas existem
echo "📋 Verificando se tabelas existem..."
TABLE_EXISTS=$(psql "$CONNECTION_STRING" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'risk_templates');" 2>/dev/null | tr -d ' ')

if [ "$TABLE_EXISTS" = "f" ]; then
    echo "   📄 Criando schema das tabelas..."
    if psql "$CONNECTION_STRING" -f "src/lib/database/schemas/riskTemplates.sql" > /dev/null 2>&1; then
        echo "   ✅ Schema criado com sucesso"
    else
        echo "   ❌ Erro ao criar schema"
        exit 1
    fi
else
    echo "   ✅ Tabelas já existem"
fi

# Verificar quantos templates existem
echo "📊 Verificando templates existentes..."
TEMPLATE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM risk_templates;" 2>/dev/null | tr -d ' ')

if [ "$TEMPLATE_COUNT" = "0" ] || [ -z "$TEMPLATE_COUNT" ]; then
    echo "   📄 Populando templates de riscos..."
    if psql "$CONNECTION_STRING" -f "src/lib/database/seeds/riskTemplatesSeeder.sql" > /dev/null 2>&1; then
        echo "   ✅ Templates populados com sucesso"
        
        # Verificar resultado final
        FINAL_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM risk_templates;" 2>/dev/null | tr -d ' ')
        echo "=================================================="
        echo "🎉 Configuração concluída!"
        echo "📊 Templates criados: $FINAL_COUNT"
        echo "🌐 Acesse: https://myxvxponlmulnjstbjwd.supabase.co"
    else
        echo "   ❌ Erro ao popular templates"
        exit 1
    fi
else
    echo "=================================================="
    echo "ℹ️  Templates já existem no banco: $TEMPLATE_COUNT"
    echo "🌐 Acesse: https://myxvxponlmulnjstbjwd.supabase.co"
fi