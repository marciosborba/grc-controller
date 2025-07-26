# Sistema de Administração de Usuários Multi-Tenant

## Visão Geral

Este documento descreve o sistema completo de administração de usuários desenvolvido para a aplicação GRC, incluindo funcionalidades de multi-tenancy, autenticação multifator (MFA) e logs de auditoria detalhados.

## Arquitetura do Sistema

### 1. Modelo de Dados

#### Tabelas Principais

**`tenants`** - Organizações/Empresas
```sql
- id: UUID (PK)
- name: VARCHAR(255) - Nome da organização
- slug: VARCHAR(100) - Identificador único
- domain: VARCHAR(255) - Domínio da organização
- settings: JSONB - Configurações específicas
- subscription_plan: VARCHAR(50) - Plano de assinatura
- max_users: INTEGER - Limite de usuários
- is_active: BOOLEAN - Status ativo/inativo
```

**`profiles`** - Perfis de Usuários (Estendido)
```sql
- user_id: UUID (FK para auth.users)
- tenant_id: UUID (FK para tenants)
- full_name: VARCHAR(255)
- job_title: VARCHAR(255)
- department: VARCHAR(255)
- phone: VARCHAR(20)
- permissions: TEXT[] - Permissões específicas
- is_active: BOOLEAN
- theme: VARCHAR(10)
- last_login_at: TIMESTAMP
- login_count: INTEGER
- failed_login_attempts: INTEGER
- locked_until: TIMESTAMP
- password_changed_at: TIMESTAMP
- must_change_password: BOOLEAN
- two_factor_enabled: BOOLEAN
- email_verified: BOOLEAN
- timezone: VARCHAR(50)
- language: VARCHAR(10)
- notification_preferences: JSONB
```

**`user_mfa`** - Configurações de MFA
```sql
- user_id: UUID (FK)
- is_enabled: BOOLEAN
- secret_key: VARCHAR(255) - Chave TOTP
- backup_codes: TEXT[] - Códigos de recuperação
- last_used_at: TIMESTAMP
```

**`user_sessions`** - Sessões Ativas
```sql
- user_id: UUID (FK)
- session_token: VARCHAR(255)
- ip_address: INET
- user_agent: TEXT
- location: VARCHAR(255)
- is_active: BOOLEAN
- expires_at: TIMESTAMP
- last_activity: TIMESTAMP
```

**`permissions`** - Permissões do Sistema
```sql
- name: VARCHAR(100) - Nome único da permissão
- description: TEXT
- resource: VARCHAR(100) - Recurso (users, risks, etc.)
- action: VARCHAR(50) - Ação (create, read, update, delete)
```

**`role_permissions`** - Associação Roles-Permissões
```sql
- role: app_role (ENUM)
- permission_id: UUID (FK)
- tenant_id: UUID (FK) - Para permissões específicas por tenant
```

**`security_logs`** - Logs de Segurança
```sql
- user_id: UUID (FK)
- tenant_id: UUID (FK)
- event_type: VARCHAR(100)
- severity: VARCHAR(20) - info, warning, error, critical
- ip_address: INET
- user_agent: TEXT
- geo_location: JSONB
- details: JSONB
```

### 2. Níveis de Acesso (Roles)

#### Hierarquia de Roles

1. **`admin`** - Administrador Master
   - Acesso completo ao sistema
   - Gerenciamento de todos os usuários
   - Configurações globais
   - Administração de tenants

2. **`ciso`** - Chief Information Security Officer
   - Gerenciamento de usuários do tenant
   - Visualização de logs de segurança
   - Configurações de segurança
   - Relatórios de auditoria

3. **`risk_manager`** - Gerente de Riscos
   - Gerenciamento de riscos
   - Visualização de usuários
   - Relatórios específicos de riscos

4. **`compliance_officer`** - Oficial de Compliance
   - Gerenciamento de compliance
   - Visualização de logs
   - Relatórios de conformidade

5. **`auditor`** - Auditor
   - Acesso somente leitura
   - Visualização de logs e relatórios
   - Exportação de dados para auditoria

6. **`user`** - Usuário Regular
   - Acesso básico às funcionalidades
   - Visualização do próprio perfil

### 3. Sistema de Permissões

#### Permissões Granulares

**Usuários:**
- `users.create` - Criar novos usuários
- `users.read` - Visualizar usuários
- `users.update` - Editar usuários
- `users.delete` - Excluir usuários
- `users.manage_roles` - Gerenciar roles
- `users.reset_password` - Resetar senhas
- `users.unlock` - Desbloquear usuários

**Tenant:**
- `tenant.read` - Visualizar configurações
- `tenant.update` - Editar configurações
- `tenant.manage` - Gerenciamento completo

**Logs e Auditoria:**
- `logs.read` - Visualizar logs de atividade
- `logs.export` - Exportar logs
- `security_logs.read` - Visualizar logs de segurança

**Sistema:**
- `system.admin` - Administração completa

## Funcionalidades Implementadas

### 1. Gerenciamento de Usuários

#### Criação de Usuários
- Formulário completo com validação
- Atribuição de roles múltiplas
- Configuração de permissões específicas
- Envio de convite por email
- Configuração de senha obrigatória

#### Edição de Usuários
- Atualização de informações pessoais
- Modificação de roles e permissões
- Configurações de segurança
- Preferências de notificação
- Configurações regionais

#### Visualização Detalhada
- Informações completas do usuário
- Histórico de atividades
- Sessões ativas
- Status de segurança
- Configurações MFA

#### Ações em Lote
- Ativação/Desativação múltipla
- Desbloqueio de usuários
- Reset de senhas em massa
- Atribuição de roles
- Exclusão múltipla

### 2. Autenticação Multifator (MFA)

#### Configuração TOTP
- Geração de chave secreta
- QR Code para configuração
- Suporte a aplicativos autenticadores
- Códigos de backup

#### Verificação
- Validação de tokens TOTP
- Uso de códigos de backup
- Controle de tentativas
- Logs de uso

#### Gerenciamento
- Habilitação/Desabilitação
- Regeneração de códigos de backup
- Histórico de uso
- Alertas de segurança

### 3. Sistema de Logs e Auditoria

#### Logs de Segurança
- Tentativas de login
- Alterações de senha
- Configurações MFA
- Bloqueios de conta
- Atividades suspeitas

#### Logs de Atividade
- Ações de usuários
- Modificações de dados
- Acessos a recursos
- Exportações
- Configurações

#### Informações Capturadas
- Endereço IP
- User Agent
- Geolocalização
- Timestamp preciso
- Detalhes da ação
- Resultado (sucesso/falha)

### 4. Interface de Usuário

#### Dashboard de Administração
- Estatísticas em tempo real
- Gráficos de atividade
- Alertas de segurança
- Resumo de usuários

#### Filtros Avançados
- Busca por nome/email
- Filtro por role
- Filtro por status
- Filtro por departamento
- Filtro por MFA
- Filtro por último login

#### Tabela Responsiva
- Visualização otimizada
- Seleção múltipla
- Ações contextuais
- Ordenação
- Paginação

## Segurança Implementada

### 1. Autenticação
- Integração com Supabase Auth
- Validação de senhas robustas
- Bloqueio por tentativas falhadas
- Expiração de sessões

### 2. Autorização
- Row Level Security (RLS)
- Verificação de permissões granulares
- Isolamento por tenant
- Validação de roles

### 3. Auditoria
- Log de todas as ações
- Rastreamento de alterações
- Detecção de atividades suspeitas
- Retenção de logs

### 4. Proteção de Dados
- Sanitização de inputs
- Validação de dados
- Criptografia de dados sensíveis
- Backup seguro

## Configuração e Instalação

### 1. Migrações do Banco

Execute as migrações na ordem:
```bash
# 1. Estrutura principal
supabase migration up 20250125000000_user_management_system.sql

# 2. Dados de exemplo (opcional)
supabase migration up 20250125000001_seed_user_management_data.sql
```

### 2. Configuração de Variáveis

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# MFA (opcional - para produção usar biblioteca real)
VITE_MFA_ISSUER=GRC_System
```

### 3. Dependências

```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install react-hook-form
npm install @hookform/resolvers
npm install zod
npm install sonner
```

## Uso do Sistema

### 1. Acessando a Administração

```typescript
// Verificar permissões
const { hasPermission } = useUserManagement();

if (hasPermission('users.read')) {
  // Usuário pode visualizar usuários
}
```

### 2. Criando Usuários

```typescript
const { createUser } = useUserManagement();

const userData = {
  email: 'usuario@empresa.com',
  full_name: 'Nome Completo',
  roles: ['user'],
  tenant_id: 'tenant-1',
  send_invitation: true
};

createUser(userData);
```

### 3. Configurando MFA

```typescript
const { setupMFA, enableMFA } = useMFA();

// Iniciar configuração
const setupData = await setupMFA();

// Verificar e habilitar
await enableMFA({
  token: '123456' // Código do app autenticador
});
```

### 4. Visualizando Logs

```typescript
const { getUserActivity } = useUserManagement();

const activity = await getUserActivity(userId);
console.log(activity.recent_activities);
```

## Melhores Práticas

### 1. Segurança
- Sempre validar permissões no backend
- Usar HTTPS em produção
- Implementar rate limiting
- Monitorar logs de segurança
- Backup regular dos dados

### 2. Performance
- Implementar paginação
- Usar índices apropriados
- Cache de permissões
- Otimizar queries
- Lazy loading de componentes

### 3. Usabilidade
- Feedback visual claro
- Mensagens de erro informativas
- Confirmação para ações destrutivas
- Filtros intuitivos
- Responsividade

### 4. Manutenção
- Logs estruturados
- Monitoramento de métricas
- Documentação atualizada
- Testes automatizados
- Versionamento de API

## Extensões Futuras

### 1. Funcionalidades Avançadas
- SSO (Single Sign-On)
- Integração com Active Directory
- Aprovação de usuários em workflow
- Políticas de senha avançadas
- Notificações em tempo real

### 2. Relatórios
- Dashboard executivo
- Relatórios de compliance
- Análise de comportamento
- Métricas de segurança
- Exportação automatizada

### 3. Integrações
- SIEM systems
- Identity providers
- Ferramentas de monitoramento
- APIs externas
- Webhooks

## Suporte e Manutenção

### 1. Monitoramento
- Logs de erro
- Métricas de performance
- Alertas de segurança
- Status de saúde do sistema

### 2. Backup
- Backup automático diário
- Retenção de 90 dias
- Teste de restauração mensal
- Backup de configurações

### 3. Atualizações
- Patches de segurança
- Atualizações de dependências
- Melhorias de performance
- Novas funcionalidades

---

**Desenvolvido para o Sistema GRC**  
**Versão:** 1.0.0  
**Data:** Janeiro 2025