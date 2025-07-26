# 🚨 RESOLVER ERROS RAPIDAMENTE

## ⚡ SOLUÇÃO AUTOMÁTICA (RECOMENDADO)

Execute este comando para corrigir automaticamente a maioria dos problemas:

```bash
npm run fix-errors
```

## 🔧 SOLUÇÃO MANUAL

Se a correção automática não funcionar, siga estes passos:

### 1. Verificar o que está faltando
```bash
npm run check-user-management
```

### 2. Aplicar migrações do banco
```bash
supabase migration up
```

### 3. Instalar dependências
```bash
npm install @hookform/resolvers zod sonner
```

### 4. Reiniciar servidor
```bash
npm run dev
```

## 📋 ERROS MAIS COMUNS

### ❌ "Cannot find module '@/types/user-management'"
**Solução**: O arquivo foi criado automaticamente. Execute `npm run fix-errors`

### ❌ "Cannot find module '@/hooks/useUserManagement'"
**Solução**: O arquivo foi criado automaticamente. Execute `npm run fix-errors`

### ❌ "relation 'public.user_roles' does not exist"
**Solução**: Execute `supabase migration up` ou `supabase db reset`

### ❌ "function rpc_log_activity does not exist"
**Solução**: Execute `supabase migration up` para aplicar as funções

### ❌ Erro de TypeScript
**Solução**: Execute `npm run fix-errors` que corrige automaticamente

## 🆘 SE NADA FUNCIONAR

Execute a recuperação completa:

```bash
# 1. Correção automática
npm run fix-errors

# 2. Se ainda houver erro, reset completo
rm -rf node_modules package-lock.json
npm install
supabase db reset
npm run dev
```

## 📞 COMANDOS ÚTEIS

```bash
# Verificar sistema
npm run check-user-management

# Correção automática
npm run fix-errors

# Ver status do Supabase
supabase status

# Ver logs do Supabase
supabase logs

# Compilar TypeScript
npx tsc --noEmit
```

## ✅ VERIFICAÇÃO FINAL

Após resolver os erros:

1. ✅ `npm run check-user-management` - Sem erros
2. ✅ `npm run dev` - Servidor inicia sem erros
3. ✅ Abrir `http://localhost:5173/settings` - Página carrega
4. ✅ Console do navegador (F12) - Sem erros vermelhos

---

**IMPORTANTE**: Execute `npm run fix-errors` primeiro. Ele resolve 90% dos problemas automaticamente.