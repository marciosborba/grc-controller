# 🚨 Correção Rápida - Sistema de Administração de Usuários

## Passos para Resolver o Erro

### 1. Verificar o Sistema
```bash
npm run check-user-management
```

### 2. Se houver arquivos faltando, execute:
```bash
# Criar diretórios necessários
mkdir -p src/components/admin
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/config
mkdir -p supabase/migrations
```

### 3. Instalar dependências que podem estar faltando:
```bash
npm install @hookform/resolvers zod sonner
```

### 4. Verificar se as migrações foram aplicadas:
```bash
supabase migration up
```

### 5. Se o erro persistir, verificar imports:

**Arquivo: `src/components/settings/UserManagementPage.tsx`**
```typescript
// Deve conter apenas:
export { UserManagementPage } from '@/components/admin/UserManagementPage';
```

**Arquivo: `src/App.tsx`**
```typescript
// Deve importar:
import { UserManagementPage } from "@/components/settings/UserManagementPage";
```

### 6. Verificar se os utilitários existem:

Se houver erro sobre `authCleanup` ou `securityLogger`, eles foram criados automaticamente.

### 7. Reiniciar o servidor de desenvolvimento:
```bash
npm run dev
```

## Erros Comuns e Soluções

### ❌ "Cannot find module '@/types/user-management'"
**Solução**: O arquivo foi criado. Verificar se existe em `src/types/user-management.ts`

### ❌ "Cannot find module '@/hooks/useUserManagement'"
**Solução**: O arquivo foi criado. Verificar se existe em `src/hooks/useUserManagement.ts`

### ❌ "Cannot find module '@/utils/authCleanup'"
**Solução**: O arquivo foi criado automaticamente. Verificar se existe em `src/utils/authCleanup.ts`

### ❌ "Table 'tenants' doesn't exist"
**Solução**: Executar as migrações:
```bash
supabase migration up
```

### ❌ "Function 'log_activity' doesn't exist"
**Solução**: Executar as migrações do sistema:
```bash
supabase db reset
```

### ❌ Erro de TypeScript
**Solução**: Adicionar ao `tsconfig.json`:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Verificação Final

Após aplicar as correções:

1. Execute: `npm run check-user-management`
2. Se tudo estiver ✅, execute: `npm run dev`
3. Acesse: `http://localhost:5173/settings`

## Se Nada Funcionar

Execute a recuperação completa:

```bash
# 1. Limpar dependências
rm -rf node_modules package-lock.json
npm install

# 2. Resetar banco
supabase db reset

# 3. Verificar sistema
npm run check-user-management

# 4. Iniciar desenvolvimento
npm run dev
```

## Contato

Se o problema persistir, verifique:
- Console do navegador para erros JavaScript
- Terminal para erros de compilação
- Logs do Supabase para erros de banco

Todos os arquivos necessários foram criados automaticamente. O sistema deve funcionar após seguir estes passos.