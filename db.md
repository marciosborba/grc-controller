# 📊 Banco de Dados - Lições Aprendidas e Dicas de Produtividade

## 🎯 Visão Geral

Este documento contém lições aprendidas importantes sobre o trabalho com **Supabase PostgreSQL REMOTO** no projeto GRC Controller, incluindo limitações, soluções e dicas para desenvolvimento mais produtivo.

### 🌐 **Informações do Banco de Dados Remoto**
- **Provedor**: Supabase (PostgreSQL na nuvem)
- **Versão**: PostgreSQL 17.4 on aarch64-unknown-linux-gnu
- **Localização**: South America (São Paulo)
- **URL**: https://myxvxponlmulnjstbjwd.supabase.co
- **Host**: db.myxvxponlmulnjstbjwd.supabase.co:5432
- **Projeto**: Controller GRC (myxvxponlmulnjstbjwd)
- **Status**: ✅ 100% Configurado e Funcional

### 📊 **Status Atual do Banco**
- ✅ **Conexão**: Funcionando perfeitamente
- ✅ **Tabela tenants**: 2 registros ativos
- ✅ **Campo settings**: Implementado (JSONB)
- ✅ **Dados de empresa**: Configurados para "GRC-Controller"
- ✅ **Nome fantasia**: "GRC-Controller" ativo
- ✅ **Acesso DDL**: Comandos ALTER TABLE funcionando
- ✅ **Backup/Restore**: Totalmente operacional

---

## 🚫 Limitações do Supabase Client

### ❌ O que NÃO é possível via JavaScript Client

#### **Comandos DDL (Data Definition Language)**
```javascript
// ❌ NÃO FUNCIONA - Alterações de schema
await supabase.rpc('exec_sql', {
  sql: 'ALTER TABLE tenants ADD COLUMN settings JSONB DEFAULT \'{}\';'
});
// Erro: "Could not find the function public.exec_sql(sql)"

// ❌ NÃO FUNCIONA - Criação de tabelas
await supabase.rpc('create_table', { ... });

// ❌ NÃO FUNCIONA - Alteração de colunas
await supabase.rpc('alter_column', { ... });
```

#### **Limitações de Segurança**
- Execução de SQL arbitrário via API REST
- Alterações de schema via service role key
- Comandos administrativos de estrutura do banco
- Criação/modificação de funções PostgreSQL

### ✅ O que É possível via JavaScript Client

#### **Operações CRUD (Create, Read, Update, Delete)**
```javascript
// ✅ FUNCIONA - Operações de dados
const { data, error } = await supabase
  .from('tenants')
  .select('*')
  .eq('id', tenantId);

// ✅ FUNCIONA - Inserção de dados
const { data, error } = await supabase
  .from('tenants')
  .insert({ name: 'Nova Empresa', settings: {} });

// ✅ FUNCIONA - Atualização de dados
const { data, error } = await supabase
  .from('tenants')
  .update({ settings: { company_data: { ... } } })
  .eq('id', tenantId);

// ✅ FUNCIONA - Chamada de funções PostgreSQL existentes
const { data, error } = await supabase.rpc('rpc_manage_tenant', {
  action: 'update',
  tenant_data: { ... }
});
```

---

## 🛠️ Soluções para Alterações de Schema

### 1. **Supabase Dashboard** (Recomendado para desenvolvimento)
```sql
-- Executar diretamente no SQL Editor do Dashboard
-- URL: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd
ALTER TABLE tenants ADD COLUMN settings JSONB DEFAULT '{}';
CREATE INDEX idx_tenants_settings ON tenants USING GIN (settings);
```

**Vantagens:**
- ✅ Acesso direto ao PostgreSQL remoto
- ✅ Interface visual amigável
- ✅ Execução imediata no banco de produção
- ✅ Ideal para desenvolvimento e testes
- ✅ **Status**: ✅ Configurado e funcionando

### 2. **Supabase CLI** (Recomendado para produção)
```bash
# Verificar status do projeto remoto
supabase projects list
# ● Controller GRC (myxvxponlmulnjstbjwd) - LINKED

# Criar nova migração
supabase migration new add_settings_to_tenants

# Editar arquivo de migração
# supabase/migrations/YYYYMMDDHHMMSS_add_settings_to_tenants.sql

# Aplicar migração no banco remoto
supabase db push
```

**Vantagens:**
- ✅ Versionamento de mudanças
- ✅ Controle de migração
- ✅ Aplicação direta no banco remoto
- ✅ Histórico de alterações
- ✅ **Status**: ✅ CLI v2.33.9 configurado e linkado

### 3. **Acesso Direto via PostgreSQL Client** (Novo - 100% Funcional)
```bash
# Usando nosso script personalizado (RECOMENDADO)
node database-manager.cjs test-connection
node database-manager.cjs show-structure tenants
node database-manager.cjs execute-sql "ALTER TABLE tenants ADD COLUMN nova_coluna TEXT;"

# Usando psql diretamente
psql "postgresql://postgres:[PASSWORD]@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres"
```

**Vantagens:**
- ✅ **Controle total** sobre o banco remoto
- ✅ **Execução imediata** de comandos DDL
- ✅ **Automação completa** via scripts
- ✅ **Backup/restore** automatizado
- ✅ **Status**: ✅ 100% Configurado e testado

### 4. **Migration Files** (Melhor prática)
```sql
-- supabase/migrations/20250101000000_add_tenant_settings.sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

COMMENT ON COLUMN tenants.settings IS 'Configurações da tenant incluindo dados da empresa';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_tenants_settings_company_data 
ON tenants USING GIN ((settings->'company_data'));
```

---

## 🔧 Estrutura de Dados Atual (Banco Remoto)

### **Tabela Tenants - Status Atual**
```sql
-- ✅ ESTRUTURA ATUAL NO BANCO REMOTO
-- Verificado em: Janeiro 2025
-- Host: db.myxvxponlmulnjstbjwd.supabase.co

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  max_users INTEGER DEFAULT 10,
  current_users_count INTEGER DEFAULT 0,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}', -- ✅ IMPLEMENTADO E FUNCIONANDO
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ✅ DADOS ATUAIS (2 registros)
-- 1. "empresa 2" (ID: 37b809d4-1a23-40b9-8ef1-17f24ed4c08b)
-- 2. "GRC-Controller" (ID: 46b1c048-85a1-423b-96fc-776007c8de1f) - COM DADOS DE EMPRESA
```

### **Estrutura do Campo Settings - Dados Reais**
```json
// ✅ DADOS REAIS DA TENANT "GRC-Controller"
// Verificado no banco remoto em Janeiro 2025
{
  "company_data": {
    "corporate_name": "GRC Controller Ltda",
    "trading_name": "GRC-Controller", // ✅ ATIVO NO SIDEBAR
    "tax_id": "12.345.678/0001-90",
    "industry": "tecnologia",
    "size": "media",
    "address": "Rua da Governança, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "country": "Brasil",
    "description": "Plataforma completa de Governança, Riscos e Compliance para empresas modernas"
  }
}

// 📋 ESTRUTURA RECOMENDADA PARA EXPANSÃO
{
  "company_data": { /* dados da empresa */ },
  "risk_matrix": {
    "type": "4x4",
    "impact_labels": ["Baixo", "Médio", "Alto", "Crítico"],
    "probability_labels": ["Raro", "Improvável", "Possível", "Provável"]
  },
  "preferences": {
    "theme": "light",
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo"
  }
}
```

---

## 🚀 Dicas de Produtividade (Banco Remoto)

### 0. **Scripts Prontos para Uso (100% Funcionais)**
```bash
# ✅ TESTADOS E FUNCIONANDO NO BANCO REMOTO

# Testar conexão com o banco remoto
node database-manager.cjs test-connection

# Ver estrutura da tabela tenants
node database-manager.cjs show-structure tenants

# Executar SQL customizado no banco remoto
node database-manager.cjs execute-sql "SELECT name, settings FROM tenants;"

# Fazer backup da tabela tenants
node database-manager.cjs backup-table tenants

# Adicionar nova coluna (exemplo)
node database-manager.cjs add-column tenants nova_coluna TEXT

# Configurar campo settings (já feito)
node database-manager.cjs setup-tenant-settings
```

### 1. **Debugging de Dados**
```javascript
// 🔍 Script para debug rápido de dados
const debugTenant = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();
  
  console.log('Tenant:', data);
  console.log('Settings:', JSON.stringify(data.settings, null, 2));
  console.log('Company Data:', data.settings?.company_data);
};
```

### 2. **Testes de Conectividade**
```javascript
// 🧪 Teste rápido de conexão e permissões
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('tenants').select('count');
    console.log('✅ Conexão OK:', data);
  } catch (err) {
    console.log('❌ Erro de conexão:', err.message);
  }
};
```

### 3. **Mapeamento de Tenants (Dados Reais do Banco Remoto)**
```javascript
// 📋 MAPEAMENTO ATUAL - DADOS REAIS DO BANCO REMOTO
// Verificado em Janeiro 2025
const TENANT_NAMES: Record<string, string> = {
  '37b809d4-1a23-40b9-8ef1-17f24ed4c08b': 'empresa 2',
  '46b1c048-85a1-423b-96fc-776007c8de1f': 'GRC-Controller', // ✅ ATIVO
  // Adicionar novos tenants aqui conforme criados no banco remoto
};

// 🔄 Script para gerar mapeamento automaticamente
const generateTenantMapping = async () => {
  const { data: tenants } = await supabase.from('tenants').select('id, name');
  const mapping = tenants.reduce((acc, tenant) => {
    acc[tenant.id] = tenant.name;
    return acc;
  }, {});
  console.log('const TENANT_NAMES =', JSON.stringify(mapping, null, 2));
};
```

### 4. **Fallbacks Robustos**
```javascript
// 🛡️ Função robusta para nome da tenant
export const getTenantDisplayName = (tenant?: Tenant): string => {
  // Prioridade: Nome fantasia > Razão social > Nome da tenant > Fallback
  if (!tenant) return 'Governança • Riscos • Compliance';
  
  if (!tenant.settings?.company_data) {
    return tenant.name?.trim() || 'Governança • Riscos • Compliance';
  }

  const companyData = tenant.settings.company_data;
  return companyData.trading_name?.trim() || 
         companyData.corporate_name?.trim() || 
         tenant.name?.trim() || 
         'Governança • Riscos • Compliance';
};
```

---

## 🔒 Row Level Security (RLS)

### **Problema Comum**
```javascript
// ❌ Usuário não consegue acessar tenant devido ao RLS
const { data, error } = await supabase.from('tenants').select('*');
// Erro: RLS policy violation
```

### **Solução no AuthContext**
```javascript
// ✅ Implementar fallback quando RLS bloqueia acesso
const buildUserObject = async (supabaseUser: User) => {
  let tenant: Tenant | undefined;
  
  try {
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .single();
    
    if (tenantData) {
      tenant = tenantData;
    } else {
      // 🛡️ Fallback quando RLS bloqueia acesso
      tenant = {
        id: profile.tenant_id,
        name: TENANT_NAMES[profile.tenant_id] || 'Organização',
        // ... outros campos com valores padrão
      };
    }
  } catch (error) {
    // Criar tenant de fallback
  }
};
```

---

## 📝 Checklist de Desenvolvimento

### **Antes de Implementar Novas Features**
- [ ] Verificar se precisa de alterações de schema
- [ ] Criar migration file se necessário
- [ ] Testar com dados de exemplo
- [ ] Implementar fallbacks para RLS
- [ ] Atualizar mapeamentos se necessário
- [ ] Documentar mudanças neste arquivo

### **Debugging de Problemas**
- [ ] Verificar logs do console do navegador
- [ ] Testar conexão com Supabase
- [ ] Verificar permissões RLS
- [ ] Validar estrutura de dados
- [ ] Testar com service role se necessário

### **Deploy de Mudanças**
- [ ] Aplicar migrations em staging
- [ ] Testar funcionalidades afetadas
- [ ] Verificar performance de queries
- [ ] Aplicar em produção
- [ ] Monitorar logs pós-deploy

---

## 🎯 Comandos Úteis (Banco Remoto)

### **Acesso Direto ao Banco Remoto (RECOMENDADO)**
```bash
# ✅ COMANDOS TESTADOS E FUNCIONANDO

# Testar conexão
node database-manager.cjs test-connection

# Ver estrutura de tabelas
node database-manager.cjs show-structure tenants

# Executar SQL no banco remoto
node database-manager.cjs execute-sql "SELECT COUNT(*) FROM tenants;"

# Backup de tabelas
node database-manager.cjs backup-table tenants

# Ver todos os comandos disponíveis
node database-manager.cjs
```

### **Supabase CLI (Configurado e Linkado)**
```bash
# ✅ STATUS: CLI v2.33.9 linkado ao projeto remoto

# Verificar projetos (deve mostrar ● Controller GRC)
supabase projects list

# Dump do schema do banco remoto
supabase db dump --linked

# Dump dos dados do banco remoto
supabase db dump --linked --data-only

# Criar nova migração
supabase migration new nome_da_migracao

# Aplicar migrations no banco remoto
supabase db push

# Gerar tipos TypeScript do banco remoto
supabase gen types typescript --project-id myxvxponlmulnjstbjwd > src/types/database.types.ts
```

### **SQL Úteis**
```sql
-- Verificar estrutura de tabela
\d+ tenants

-- Listar todas as colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants';

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'tenants';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tenants';
```

---

## 🔄 Histórico de Mudanças (Banco Remoto)

### **2025-01-14 - Configuração Completa do Banco Remoto**
- ✅ **Conexão PostgreSQL**: Estabelecida com banco remoto (PostgreSQL 17.4)
- ✅ **Campo settings**: Adicionado via Dashboard (JSONB)
- ✅ **Dados de empresa**: Configurados para tenant "GRC-Controller"
- ✅ **Nome fantasia**: "GRC-Controller" ativo no sidebar
- ✅ **Acesso DDL**: Scripts funcionando 100%
- ✅ **Supabase CLI**: v2.33.9 linkado ao projeto remoto
- ✅ **Mapeamento tenants**: Atualizado com dados reais
- ✅ **Fallback robusto**: Implementado no AuthContext
- ✅ **Documentação**: Criada e atualizada

### **Status Atual: 100% Funcional**
- ✅ **Banco remoto**: Totalmente acessível e operacional
- ✅ **Comandos DDL**: Funcionando via database-manager.cjs
- ✅ **Backup/Restore**: Implementado e testado
- ✅ **Nome fantasia**: Exibindo "GRC-Controller" no sidebar
- ✅ **Credenciais**: Configuradas e seguras (.env protegido)

### **Próximas Melhorias**
- [ ] Implementar cache de dados da tenant
- [ ] Adicionar validação de schema para settings
- [ ] Criar interface para gerenciar configurações via UI
- [ ] Implementar backup automático de settings
- [ ] Atualizar Supabase CLI para v2.34.3

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/reference/cli)

---

---

## 🎯 Status Final: 100% Configurado

### **✅ Banco de Dados Remoto - Totalmente Funcional**
- **Host**: db.myxvxponlmulnjstbjwd.supabase.co:5432
- **Versão**: PostgreSQL 17.4
- **Região**: South America (São Paulo)
- **Tenants**: 2 registros ativos
- **Campo settings**: ✅ Implementado (JSONB)
- **Nome fantasia**: ✅ "GRC-Controller" ativo
- **Acesso DDL**: ✅ 100% funcional
- **Scripts**: ✅ database-manager.cjs operacional
- **CLI**: ✅ Supabase CLI v2.33.9 linkado
- **Segurança**: ✅ Credenciais protegidas

### **🚀 Capacidades Disponíveis**
- ✅ Executar comandos DDL automaticamente
- ✅ Alterar estrutura de tabelas via script
- ✅ Fazer backup/restore de dados
- ✅ Usar nome fantasia no sidebar
- ✅ Debugging completo do banco
- ✅ Automação total de tarefas de banco

---

*Documento criado em: Janeiro 2025*  
*Última atualização: 14 Janeiro 2025*  
*Projeto: GRC Controller*  
*Banco: Supabase PostgreSQL Remoto (100% Configurado)*