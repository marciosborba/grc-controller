# Módulo de Configurações da Tenant

Este módulo fornece uma interface completa para administradores de tenant gerenciarem todas as configurações e políticas da sua organização.

## Visão Geral

O módulo de Configurações da Tenant permite que administradores da organização (não confundir com administradores da plataforma) tenham controle total sobre:

- **Gerenciamento de Usuários**: Adicionar, editar e remover usuários
- **Configurações de Segurança**: Políticas de senha, sessão e controle de acesso
- **Matriz de Risco**: Configuração personalizada da matriz de risco
- **SSO e MFA**: Configuração de Single Sign-On e autenticação multifator
- **Domínios de Email**: Restrição de domínios permitidos
- **Detecção de Viagem Impossível**: Monitoramento geográfico de logins
- **Gerenciamento de Sessões**: Controle de sessões ativas
- **Backup e Dados**: Configuração de backups e exportação de dados
- **Criptografia**: Gestão de criptografia e chaves criptográficas
- **Logs de Atividade**: Visualização de logs da organização

## Estrutura do Módulo

```
src/components/tenant-settings/
├── TenantSettingsPage.tsx          # Componente principal
├── sections/                       # Seções específicas
│   ├── UserManagementSection.tsx
│   ├── SecurityConfigSection.tsx
│   ├── RiskMatrixConfigSection.tsx
│   ├── SSOConfigSection.tsx
│   ├── MFAConfigSection.tsx
│   ├── EmailDomainSection.tsx
│   ├── ImpossibleTravelSection.tsx
│   ├── SessionManagementSection.tsx
│   ├── BackupDataSection.tsx
│   ├── DataExportSection.tsx
│   ├── EncryptionConfigSection.tsx
│   ├── CryptoKeysSection.tsx
│   └── ActivityLogsSection.tsx
├── shared/                         # Componentes compartilhados
│   ├── TenantGuard.tsx
│   └── SettingsMetrics.tsx
└── README.md                       # Esta documentação
```

## Funcionalidades Principais

### 1. Gerenciamento de Usuários
- Adicionar novos usuários com diferentes funções
- Editar informações de usuários existentes
- Remover usuários da organização
- Controle de convites por email
- Visualização de status de usuários (ativo, inativo, pendente)

### 2. Configurações de Segurança
- **Política de Senhas**: Comprimento mínimo, caracteres obrigatórios, expiração
- **Segurança de Sessão**: Timeout, sessões simultâneas, MFA obrigatório
- **Controle de Acesso**: Limite de tentativas, bloqueio, lista branca de IPs
- **Monitoramento**: Logs de atividades, alertas de atividades suspeitas

### 3. Matriz de Risco Personalizada
- Configuração de níveis de probabilidade e impacto
- Personalização de cores e descrições
- Diferentes tamanhos de matriz (3x3, 4x4, 5x5)
- Métodos de cálculo configuráveis

### 4. Autenticação e Acesso
- **SSO**: Configuração de Single Sign-On (SAML)
- **MFA**: Múltiplos métodos (TOTP, Email, SMS)
- **Domínios**: Restrição de domínios de email permitidos
- **Viagem Impossível**: Detecção de logins geograficamente impossíveis

### 5. Gestão de Dados
- **Backup Automático**: Configuração de frequência e retenção
- **Exportação**: Múltiplos formatos (JSON, CSV, Excel, XML)
- **Criptografia**: Configuração de algoritmos e rotação de chaves
- **Logs**: Visualização e exportação de logs de atividade

## Permissões e Segurança

### Controle de Acesso
- Apenas usuários com role `tenant_admin` ou `admin` podem acessar
- Todas as configurações são isoladas por tenant
- Logs de auditoria para todas as alterações

### Segurança dos Dados
- Criptografia de dados sensíveis
- Rotação automática de chaves
- Backup seguro com criptografia
- Monitoramento de atividades suspeitas

## Como Usar

### 1. Importar o Componente Principal
```tsx
import { TenantSettingsPage } from '@/components/tenant-settings/TenantSettingsPage';

// Em sua rota ou componente pai
<TenantSettingsPage />
```

### 2. Configurar Roteamento
```tsx
// No seu sistema de rotas
{
  path: '/settings',
  element: <TenantSettingsPage />,
  // Adicionar guard de autenticação se necessário
}
```

### 3. Integração com Backend
Cada seção faz chamadas para APIs específicas. Você precisará implementar:

- `/api/tenant/users` - Gerenciamento de usuários
- `/api/tenant/security` - Configurações de segurança
- `/api/tenant/risk-matrix` - Configuração da matriz
- `/api/tenant/backup` - Configurações de backup
- `/api/tenant/logs` - Logs de atividade
- etc.

## Customização

### Adicionando Novas Seções
1. Crie um novo componente em `sections/`
2. Adicione a importação em `TenantSettingsPage.tsx`
3. Adicione uma nova tab no componente principal
4. Implemente a lógica específica da seção

### Modificando Permissões
Edite a verificação de permissões em `TenantSettingsPage.tsx`:
```tsx
const isTenantAdmin = user?.role === 'tenant_admin' || user?.role === 'admin';
```

### Personalizando UI
- Todos os componentes usam o sistema de design padrão
- Classes CSS podem ser customizadas via Tailwind
- Componentes UI estão em `@/components/ui/`

## Dependências

- React 18+
- TypeScript
- Tailwind CSS
- Radix UI (componentes base)
- Lucide React (ícones)
- React Router (navegação)
- Sonner (notificações)

## Considerações de Performance

- Carregamento lazy de seções pesadas
- Debounce em campos de busca
- Paginação em listas grandes
- Cache de configurações frequentemente acessadas

## Roadmap

### Funcionalidades Futuras
- [ ] Integração com provedores SSO externos
- [ ] Configuração de webhooks
- [ ] Templates de configuração
- [ ] Importação/exportação de configurações
- [ ] Auditoria avançada com relatórios
- [ ] Configuração de notificações personalizadas

### Melhorias Planejadas
- [ ] Interface mobile otimizada
- [ ] Modo escuro completo
- [ ] Configurações em tempo real
- [ ] Validação avançada de formulários
- [ ] Testes automatizados

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação da API
2. Verifique os logs de erro no console
3. Entre em contato com a equipe de desenvolvimento

## Licença

Este módulo faz parte do sistema GRC e segue a mesma licença do projeto principal.