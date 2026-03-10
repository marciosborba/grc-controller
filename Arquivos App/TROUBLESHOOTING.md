# Guia de Solução de Problemas - Sistema de Administração de Usuários

## Problemas Comuns e Soluções

### 1. Erro de Importação de Componentes

**Problema**: Erro ao importar componentes do sistema de administração de usuários.

**Solução**:
```bash
# Verificar se todos os arquivos foram criados corretamente
ls -la src/components/admin/
ls -la src/hooks/
ls -la src/types/
```

### 2. Erro de Dependências Faltando

**Problema**: Módulos não encontrados ou dependências faltando.

**Solução**:
```bash
# Instalar dependências que podem estar faltando
npm install @hookform/resolvers zod sonner
npm install @radix-ui/react-toast
npm install @tanstack/react-query
```

### 3. Erro de Tipos TypeScript

**Problema**: Erros de tipos TypeScript nos novos componentes.

**Solução**:
```typescript
// Verificar se os tipos estão sendo importados corretamente
import type { ExtendedUser, AppRole } from '@/types/user-management';

// Se houver erro de tipos, adicionar ao tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true,
    "strict": false
  }
}
```

### 4. Erro de Banco de Dados

**Problema**: Tabelas ou funções não existem no banco.

**Solução**:
```bash
# Executar as migrações
supabase migration up

# Ou aplicar manualmente:
supabase db reset
```

### 5. Erro de Autenticação

**Problema**: Problemas com autenticação ou permissões.

**Solução**:
```typescript
// Verificar se o AuthContext está funcionando
const { user, isLoading } = useAuth();
console.log('User:', user);
console.log('Loading:', isLoading);

// Verificar se as funções de utilidade existem
import { logAuthEvent } from '@/utils/securityLogger';
```

### 6. Erro de Componentes UI

**Problema**: Componentes shadcn/ui não encontrados.

**Solução**:
```bash
# Verificar se todos os componentes UI existem
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add alert
```

### 7. Erro de Roteamento

**Problema**: Rotas não funcionando ou componentes não carregando.

**Solução**:
```typescript
// Verificar se a rota está configurada corretamente no App.tsx
<Route path="settings" element={<UserManagementPage />} />

// Verificar se o redirecionamento está funcionando
// src/components/settings/UserManagementPage.tsx deve ter:
export { UserManagementPage } from '@/components/admin/UserManagementPage';
```

## Comandos de Verificação

### Verificar Estrutura de Arquivos
```bash
# Verificar se todos os arquivos foram criados
find src -name "*user*" -type f
find src -name "*admin*" -type f
find src -name "*mfa*" -type f
```

### Verificar Dependências
```bash
# Verificar se as dependências estão instaladas
npm list @hookform/resolvers
npm list zod
npm list sonner
npm list @tanstack/react-query
```

### Verificar Banco de Dados
```sql
-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tenants', 'user_mfa', 'user_sessions', 'permissions', 'security_logs');

-- Verificar se as funções existem
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('user_has_permission', 'log_security_event', 'update_user_activity');
```

### Verificar Tipos TypeScript
```bash
# Compilar TypeScript para verificar erros
npx tsc --noEmit
```

## Soluções Específicas por Erro

### Erro: "Cannot find module '@/types/user-management'"
```bash
# Verificar se o arquivo existe
ls -la src/types/user-management.ts

# Se não existir, recriar o arquivo
# (usar o conteúdo fornecido na implementação)
```

### Erro: "Cannot find module '@/hooks/useUserManagement'"
```bash
# Verificar se o arquivo existe
ls -la src/hooks/useUserManagement.ts

# Se não existir, recriar o arquivo
# (usar o conteúdo fornecido na implementação)
```

### Erro: "Cannot find module '@/utils/authCleanup'"
```bash
# Verificar se o arquivo existe
ls -la src/utils/authCleanup.ts

# Se não existir, foi criado na correção
```

### Erro: "Cannot find module '@/utils/securityLogger'"
```bash
# Verificar se o arquivo existe
ls -la src/utils/securityLogger.ts

# Se não existir, foi criado na correção
```

### Erro: "Table 'tenants' doesn't exist"
```sql
-- Executar a migração principal
-- supabase/migrations/20250125000000_user_management_system.sql
```

### Erro: "Function 'log_activity' doesn't exist"
```sql
-- Verificar se a função existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'log_activity';

-- Se não existir, executar a migração
```

## Passos de Recuperação Completa

Se houver muitos erros, seguir estes passos:

### 1. Limpar e Reinstalar Dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Verificar Configuração do Supabase
```bash
# Verificar se o Supabase está configurado
supabase status

# Se não estiver, inicializar
supabase init
supabase start
```

### 3. Aplicar Migrações
```bash
# Resetar banco e aplicar migrações
supabase db reset

# Ou aplicar migrações específicas
supabase migration up
```

### 4. Verificar Configuração do TypeScript
```json
// tsconfig.json - verificar se tem as configurações corretas
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. Verificar Configuração do Vite
```typescript
// vite.config.ts - verificar se tem o alias configurado
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## Logs de Debug

Para debugar problemas, adicionar logs:

```typescript
// No componente principal
console.log('UserManagementPage loaded');

// Nos hooks
console.log('useUserManagement hook initialized');
console.log('User permissions:', user?.permissions);

// Nas queries
console.log('Users query result:', users);
console.log('Stats query result:', stats);
```

## Contato para Suporte

Se os problemas persistirem:

1. Verificar se todos os arquivos foram criados corretamente
2. Verificar se as dependências estão instaladas
3. Verificar se as migrações foram aplicadas
4. Verificar logs do console para erros específicos
5. Verificar logs do Supabase para erros de banco

## Arquivos Críticos

Verificar se estes arquivos existem e estão corretos:

- `src/types/user-management.ts`
- `src/hooks/useUserManagement.ts`
- `src/hooks/useMFA.ts`
- `src/components/admin/UserManagementPage.tsx`
- `src/utils/authCleanup.ts`
- `src/utils/securityLogger.ts`
- `supabase/migrations/20250125000000_user_management_system.sql`