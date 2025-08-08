# Configuração Multi-Tenant - GRC Controller

Este documento descreve como configurar e usar o sistema multi-tenant implementado na plataforma GRC Controller.

## 📋 Resumo das Implementações

### ✅ Funcionalidades Implementadas

1. **Sistema Multi-Tenant Completo**
   - Isolamento de dados por organização
   - Controle de limites de usuários por tenant
   - Gestão centralizada de tenants

2. **Níveis de Administração**
   - **Administrador da Plataforma**: Acesso total, pode gerenciar todos os tenants
   - **Administrador do Tenant**: Pode gerenciar usuários dentro de sua própria organização
   - **Usuários**: Acesso limitado aos recursos de sua organização

3. **Validações e Segurança**
   - Validação automática de limites de usuários por tenant
   - Isolamento completo de dados entre organizações
   - Políticas RLS (Row Level Security) implementadas

### 🗄️ Estrutura do Banco de Dados

#### Novas Tabelas:
- `tenants`: Organizações/empresas
- `platform_admins`: Administradores da plataforma

#### Tabelas Modificadas:
- `profiles`: Adicionado `tenant_id` obrigatório
- Políticas RLS atualizadas para isolamento por tenant

## 🚀 Como Configurar

### 1. Aplicar Migrações

Execute a migração principal:
```sql
-- Execute o arquivo: supabase/migrations/20250808000001_multi_tenant_setup.sql
```

### 2. Configurar Primeiro Administrador da Plataforma

1. **Encontre o ID do usuário que será admin:**
```sql
SELECT id, email FROM auth.users WHERE email = 'seu-admin@exemplo.com';
```

2. **Execute o script de configuração:**
```sql
-- Substitua USER_ID_AQUI pelo ID real do usuário
INSERT INTO platform_admins (user_id, role, permissions, created_at)
VALUES (
    'USER_ID_AQUI',
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]',
    now()
);
```

3. **Verifique se foi criado:**
```sql
SELECT * FROM platform_admins;
```

### 3. Acessar a Plataforma

Após configurar o administrador da plataforma:

1. **Faça login** com a conta configurada como admin da plataforma
2. **Acesse o menu "Tenants"** na barra lateral (visível apenas para admins da plataforma)
3. **Gerencie organizações** e configure limites de usuários

## 🏢 Gerenciamento de Tenants

### Interface de Administração

A página `/admin/tenants` permite:

- ✅ **Criar novos tenants**
- ✅ **Editar informações** (nome, contatos, limites)
- ✅ **Configurar limites de usuários**
- ✅ **Monitorar uso** (usuários atuais vs limite)
- ✅ **Ativar/desativar** organizações

### Campos de Configuração:

- **Nome da Empresa**: Nome da organização
- **Slug**: Identificador único (auto-gerado)
- **Email de Contato**: Para comunicações
- **Telefone**: Contato opcional
- **Email de Faturamento**: Para questões comerciais
- **Limite de Usuários**: Máximo de usuários permitidos
- **Plano de Assinatura**: trial, basic, professional, enterprise

## 👥 Gerenciamento de Usuários Multi-Tenant

### Para Administradores da Plataforma:
- ✅ Podem criar usuários em qualquer tenant
- ✅ Visualizam todos os usuários de todos os tenants
- ✅ Sem limites de criação de usuários

### Para Administradores de Tenant:
- ✅ Podem criar usuários apenas em seu tenant
- ✅ Visualizam apenas usuários de seu tenant
- ✅ Respeitam o limite configurado para seu tenant

### Validações Automáticas:
- ✅ **Verificação de limite**: Impede criação quando limite atingido
- ✅ **Isolamento de dados**: Cada tenant vê apenas seus dados
- ✅ **Contador automático**: Atualização em tempo real do número de usuários

## 🔐 Estrutura de Permissões

### Administrador da Plataforma:
```
- tenants.manage: Gerenciar todos os tenants
- users.global: Gerenciar usuários de qualquer tenant
- platform.admin: Acesso administrativo global
- Todas as demais permissões
```

### Administrador do Tenant:
```
- users.create: Criar usuários em seu tenant
- users.read: Visualizar usuários de seu tenant
- users.update: Editar usuários de seu tenant
- users.delete: Excluir usuários de seu tenant
```

### Usuário Normal:
```
- read: Visualizar dados de seu tenant
```

## 🧪 Como Testar

### 1. Teste de Administrador da Plataforma:
1. Faça login como admin da plataforma
2. Acesse `/admin/tenants`
3. Crie um novo tenant com limite de 5 usuários
4. Acesse gestão de usuários e crie usuários para diferentes tenants

### 2. Teste de Limite de Usuários:
1. Crie um tenant com limite baixo (ex: 2 usuários)
2. Tente criar mais usuários que o permitido
3. Verifique se a validação impede a criação

### 3. Teste de Isolamento:
1. Crie usuários em tenants diferentes
2. Faça login como admin de um tenant
3. Verifique se consegue ver apenas usuários de seu tenant

## 📊 Monitoramento

### Métricas Disponíveis:
- Total de tenants ativos
- Usuários por tenant
- Tenants próximos ao limite
- Uso por plano de assinatura

### Logs de Atividade:
Todas as ações de gerenciamento são registradas com:
- Quem executou a ação
- Quando foi executada
- Detalhes da operação
- IP e user agent

## 🔧 Configurações Avançadas

### Personalização de Limites:
```sql
-- Alterar limite de um tenant específico
UPDATE tenants 
SET max_users = 50 
WHERE slug = 'nome-do-tenant';
```

### Suspender Tenant:
```sql
-- Suspender um tenant
UPDATE tenants 
SET is_active = false 
WHERE slug = 'nome-do-tenant';
```

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup antes de aplicar migrações
2. **Teste**: Teste em ambiente de desenvolvimento primeiro
3. **Monitoramento**: Acompanhe logs de erro durante a migração
4. **Performance**: Índices foram criados para otimizar consultas multi-tenant

## ❓ Suporte

Para problemas ou dúvidas:
1. Verifique os logs da aplicação
2. Consulte as políticas RLS no Supabase
3. Teste as permissões com diferentes tipos de usuário
4. Verifique se as migrações foram aplicadas corretamente

---

**Status**: ✅ Implementação Completa
**Data**: 2025-08-08
**Versão**: 1.0