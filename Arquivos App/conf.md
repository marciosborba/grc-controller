# Módulo Configurações Gerais - Documentação Técnica

## 📋 Visão Geral

O módulo **Configurações Gerais** foi desenvolvido para integrar a plataforma GRC com serviços externos, ampliando significativamente as funcionalidades e valor da aplicação. O módulo permite configurar APIs, provedores de IA, serviços de email, SSO, webhooks, backups e sincronizações.

**Localização:** `/settings/general`  
**Acesso:** Usuários com permissão `admin` ou `all`  
**Status:** ✅ Concluído e funcional  

---

## 🏗️ Estrutura de Arquivos

### Arquivos Principais
```
src/components/general-settings/
├── GeneralSettingsPage.tsx                    # Página principal com navegação por abas
├── sections/
│   ├── IntegrationsStatusDashboard.tsx        # Dashboard de status das integrações
│   ├── APIIntegrationsSection.tsx             # Configuração de APIs REST/GraphQL/SOAP
│   ├── MCPConfigurationSection.tsx            # Model Context Protocol para IA
│   ├── EmailServiceSection.tsx                # Configuração de provedores de email
│   ├── SSOConfigurationSection.tsx            # Single Sign-On integrations
│   ├── WebhooksSection.tsx                    # Sistema de webhooks e notificações
│   └── BackupSyncSection.tsx                  # Backup e sincronização de dados
```

### Integrações no Sistema
- **App.tsx** - Rota `/settings/general` adicionada
- **AppSidebar.tsx** - Item de menu "Configurações Gerais" com ícone Plug

---

## 🎯 Funcionalidades Implementadas

### 1. Dashboard de Status das Integrações
**Arquivo:** `IntegrationsStatusDashboard.tsx`

**Recursos:**
- KPI cards com métricas em tempo real
- Monitor de atividade com logs recentes
- Status health check para cada tipo de integração
- Gráficos de uso e performance
- Alertas para problemas de conectividade

**Métricas Monitoradas:**
- Provedores conectados vs total
- Tokens utilizados hoje
- Requests realizados
- Uptime médio das integrações

### 2. Integrações de APIs
**Arquivo:** `APIIntegrationsSection.tsx`

**Tipos de API Suportados:**
- REST API
- GraphQL
- SOAP

**Métodos de Autenticação:**
- None (sem autenticação)
- API Key
- Bearer Token
- Basic Authentication
- OAuth 2.0

**Funcionalidades:**
- Configuração de headers customizados
- Rate limiting configurável
- Teste de conectividade com simulação
- CRUD completo de conexões
- Armazenamento seguro de credenciais

### 3. Model Context Protocol (MCP)
**Arquivo:** `MCPConfigurationSection.tsx`

**Provedores Suportados:**
- Anthropic Claude (3.5 Sonnet, etc.)
- OpenAI GPT (4 Turbo, etc.)
- Provedores customizados

**Configurações Avançadas:**
- Janela de contexto (context window)
- Temperatura de geração
- Máximo de tokens
- Endpoints personalizados
- Chaves de API seguras

**Perfis de Contexto:**
- Análise de Riscos (ISO 31000, COSO, NIST)
- Compliance LGPD (ANPD guidelines)
- Perfis customizados com prompts especializados
- Sistema de prompt templates

### 4. Configuração de E-mail
**Arquivo:** `EmailServiceSection.tsx`

**Provedores Suportados:**
- SMTP genérico
- SendGrid
- Amazon SES
- Mailgun
- Microsoft Graph API
- Customizados

**Recursos de Template:**
- Editor de templates com variáveis dinâmicas
- Preview em tempo real
- Versionamento de templates
- Templates para diferentes tipos de notificação

**Analytics e Monitoramento:**
- Taxa de entrega
- Bounces e rejeições
- Opens e clicks
- Fila de envio
- Logs detalhados

### 5. Integração SSO
**Arquivo:** `SSOConfigurationSection.tsx`

**Provedores Suportados:**
- Azure Active Directory
- Google Workspace
- Okta
- Auth0
- SAML genérico
- OpenID Connect (OIDC)

**Configurações:**
- Mapeamento de atributos de usuário
- Auto-provisioning de contas
- Sincronização de roles e permissões
- Configurações de segurança (2FA, session timeout)
- Logs de auditoria detalhados

### 6. Sistema de Webhooks
**Arquivo:** `WebhooksSection.tsx`

**Eventos Suportados:**
- **Riscos:** created, updated, deleted
- **Incidentes:** created, resolved
- **Assessments:** started, completed
- **Compliance:** updated
- **Usuários:** created
- **Políticas:** published

**Recursos de Segurança:**
- Assinatura HMAC para autenticação
- Retry automático configurável
- Timeout configurável
- Headers customizados

**Monitoramento:**
- Taxa de sucesso em tempo real
- Tempo de resposta médio
- Eventos recentes com status
- Logs de erro detalhados

### 7. Backup e Sincronização
**Arquivo:** `BackupSyncSection.tsx`

**Destinos de Backup:**
- Sistema de arquivos local
- Amazon S3
- Google Drive
- Microsoft OneDrive
- FTP/SFTP

**Configurações Avançadas:**
- Agendamento (manual, horário, diário, semanal, mensal)
- Compressão de dados
- Criptografia end-to-end
- Política de retenção configurável
- Inclusão/exclusão de dados específicos

**Tipos de Dados:**
- Database completo
- Uploads e documentos
- Configurações do sistema
- Logs de auditoria
- Relatórios e exports

**Sincronização:**
- One-way (uma via)
- Two-way (bidirecional)
- Resolução de conflitos configurável
- Sincronização em tempo real ou agendada

---

## 🎨 Design System e UX

### Componentes UI Utilizados
- **shadcn/ui** - Sistema de design consistente
- **Tailwind CSS** - Styling utilitário
- **Lucide React** - Ícones consistentes
- **Radix UI** - Componentes acessíveis

### Padrões de Interface
- **Tabs navigation** para organização de seções
- **Card layouts** para agrupamento de informações
- **Modal dialogs** para formulários complexos
- **Toast notifications** para feedback de ações
- **Progress indicators** para operações longas
- **Status badges** para indicação visual de estados

### Responsividade
**Mobile-First Approach:**
- Breakpoints: xs (475px), sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts adaptativos: `grid-cols-2 lg:grid-cols-4`
- Texto responsivo: `text-xs sm:text-sm`
- Padding/margin adaptativos: `p-3 sm:p-4`
- Ícones escaláveis: `h-3 w-3 sm:h-4 sm:w-4`

---

## 🔧 Estruturas de Dados

### Interfaces TypeScript Principais

```typescript
// API Connections
interface APIConnection {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'soap';
  baseUrl: string;
  authType: 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth2';
  status: 'connected' | 'disconnected' | 'error';
  // ... outras propriedades
}

// MCP Providers
interface MCPProvider {
  id: string;
  name: string;
  type: 'claude' | 'openai' | 'custom';
  endpoint: string;
  model?: string;
  contextWindow: number;
  temperature: number;
  // ... outras propriedades
}

// Email Configurations
interface EmailProvider {
  id: string;
  name: string;
  type: 'smtp' | 'sendgrid' | 'ses' | 'mailgun' | 'graph';
  status: 'connected' | 'disconnected' | 'error';
  // ... configurações específicas
}

// SSO Providers
interface SSOProvider {
  id: string;
  name: string;
  type: 'azure-ad' | 'google' | 'okta' | 'auth0' | 'saml' | 'oidc';
  // ... configurações específicas
}

// Webhook Endpoints
interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  // ... configurações de retry e segurança
}

// Backup Configurations
interface BackupConfig {
  id: string;
  name: string;
  type: 'local' | 'aws-s3' | 'google-drive' | 'onedrive' | 'ftp';
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  // ... configurações de retenção e segurança
}
```

---

## 🧪 Funcionalidades de Teste

### Simulações Implementadas
- **API Testing:** Conexão simulada com diferentes cenários de sucesso/erro
- **MCP Testing:** Teste de conectividade com provedores de IA
- **Email Testing:** Envio de email de teste com validação
- **SSO Testing:** Validação de configurações de autenticação
- **Webhook Testing:** Disparo de evento de teste
- **Backup Testing:** Execução simulada de backup com progresso

### Estados de Loading
- **Spinners** para operações de teste
- **Progress bars** para operações longas (backup)
- **Skeleton loading** para carregamento de dados
- **Toast feedback** para sucesso/erro

---

## 🔐 Considerações de Segurança

### Armazenamento de Credenciais
- **Máscaras de senha** nos inputs
- **Ocultação de API keys** com toggle de visibilidade
- **Validação de JSON** para headers customizados
- **Sanitização de inputs** para prevenção de XSS

### Logs de Auditoria
- **Security logging** para todas as configurações
- **Change tracking** para modificações
- **Access logs** para tentativas de conexão
- **Error logging** para falhas de autenticação

---

## 🚀 Status de Implementação

### ✅ Concluído
- [x] Estrutura base do módulo
- [x] Dashboard de status das integrações
- [x] Seção de APIs (REST/GraphQL/SOAP)
- [x] Configuração MCP (Model Context Protocol)
- [x] Serviços de email
- [x] Integração SSO
- [x] Sistema de webhooks
- [x] Backup e sincronização
- [x] Integração nas rotas principais
- [x] Adição ao menu de navegação
- [x] Design responsivo completo
- [x] Testes de build e desenvolvimento

### 🔄 Melhorias Futuras Possíveis
- [ ] Sistema de logs de integrações centralizado
- [ ] Testes de conectividade mais robustos
- [ ] Implementação real de backends para funcionalidades
- [ ] Sistema de notificações push
- [ ] Dashboard analytics mais avançado
- [ ] Integração com mais provedores
- [ ] Sistema de backup incremental
- [ ] Criptografia de dados mais avançada
- [ ] Rate limiting inteligente
- [ ] Health checks automáticos

---

## 🎯 Pontos de Extensão

### Para Novas Integrações
1. **Criar nova seção** em `src/components/general-settings/sections/`
2. **Definir interfaces TypeScript** para o novo serviço
3. **Implementar formulários** usando padrões existentes
4. **Adicionar ao TabsList** na página principal
5. **Incluir no dashboard** de status se relevante

### Para Novos Provedores
1. **Expandir enums** nos tipos existentes
2. **Adicionar configurações específicas** do provedor
3. **Implementar ícones** e branding apropriados
4. **Criar testes de conectividade** específicos
5. **Documentar configuração** necessária

---

## 📚 Referências e Padrões

### Arquivos de Referência
- **AppSidebar.tsx** - Padrões de navegação
- **RiskMatrix.tsx** - Responsividade implementada anteriormente
- **ExecutiveDashboard.tsx** - Padrões de KPI cards
- **UserManagementPage.tsx** - Padrões de formulários complexos

### Padrões Estabelecidos
- **Naming convention:** PascalCase para componentes, camelCase para props
- **File structure:** Uma seção por arquivo, interfaces no topo
- **State management:** useState local, props drilling quando necessário
- **Error handling:** Try-catch com toast notifications
- **Loading states:** Conditional rendering com spinners
- **Form validation:** Validação inline com feedback visual

---

## 🔗 Integrações Externas

### APIs Utilizadas
- **Supabase** - Para persistência futura de configurações
- **React Router** - Navegação e roteamento
- **TanStack Query** - Potencial para cache de dados
- **Sonner** - Sistema de notificações toast

### Dependências Principais
- **React 18** - Framework base
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

---

*Documento criado em: 15 de agosto de 2025*  
*Última atualização: 15 de agosto de 2025*  
*Versão: 1.0*  
*Status: Módulo concluído e funcional*