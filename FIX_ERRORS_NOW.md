# 🚨 CORREÇÃO IMEDIATA DE ERROS

## Passos para Resolver os Erros Agora

### 1. **PRIMEIRO**: Execute as migrações do banco
```bash
# Aplicar as migrações principais
supabase migration up

# Se der erro, resetar o banco
supabase db reset
```

### 2. **SEGUNDO**: Verificar se as dependências estão instaladas
```bash
# Instalar dependências que podem estar faltando
npm install @hookform/resolvers zod sonner @tanstack/react-query react-hook-form
```

### 3. **TERCEIRO**: Verificar se os arquivos existem
Execute o comando de verificação:
```bash
npm run check-user-management
```

### 4. **QUARTO**: Se houver erro de "Cannot find module"

#### Para erro de `@/types/user-management`:
```bash
# Verificar se o arquivo existe
ls -la src/types/user-management.ts
```

#### Para erro de `@/hooks/useUserManagement`:
```bash
# Verificar se o arquivo existe
ls -la src/hooks/useUserManagement.ts
```

#### Para erro de `@/utils/authCleanup`:
```bash
# Verificar se o arquivo existe
ls -la src/utils/authCleanup.ts
```

### 5. **QUINTO**: Se houver erro de tabela não encontrada

#### Erro: "relation 'public.user_roles' does not exist"
```sql
-- Executar no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);
```

#### Erro: "relation 'public.tenants' does not exist"
```sql
-- Executar no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. **SEXTO**: Se houver erro de função não encontrada

#### Erro: "function rpc_log_activity does not exist"
```sql
-- Executar no Supabase SQL Editor:
CREATE OR REPLACE FUNCTION public.rpc_log_activity(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id VARCHAR DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    _log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (
        user_id, action, resource_type, resource_id, details
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id, p_details
    ) RETURNING id INTO _log_id;
    
    RETURN _log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. **SÉTIMO**: Se houver erro de TypeScript

#### Adicionar ao `tsconfig.json`:
```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "strict": false
  }
}
```

### 8. **OITAVO**: Reiniciar o servidor
```bash
# Parar o servidor (Ctrl+C)
# Depois executar:
npm run dev
```

## ⚡ SOLUÇÃO RÁPIDA COMPLETA

Se nada funcionar, execute esta sequência:

```bash
# 1. Parar o servidor
# Ctrl+C

# 2. Limpar dependências
rm -rf node_modules package-lock.json
npm install

# 3. Resetar banco
supabase db reset

# 4. Verificar sistema
npm run check-user-management

# 5. Iniciar servidor
npm run dev
```

## 🔍 VERIFICAR ERROS ESPECÍFICOS

### Console do Navegador
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Procure por erros em vermelho
4. Anote a mensagem de erro exata

### Terminal
1. Olhe no terminal onde está rodando `npm run dev`
2. Procure por erros de compilação
3. Anote a mensagem de erro exata

### Supabase
1. Vá para o Supabase Dashboard
2. Aba "Logs"
3. Procure por erros de SQL

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Migrações aplicadas (`supabase migration up`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivos existem (`npm run check-user-management`)
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Console sem erros (F12)
- [ ] Supabase conectado

## 🆘 SE AINDA HOUVER ERRO

1. **Copie a mensagem de erro exata**
2. **Verifique qual arquivo está causando o erro**
3. **Execute o comando de verificação**: `npm run check-user-management`
4. **Siga as instruções específicas que aparecerem**

## 📞 COMANDOS DE EMERGÊNCIA

```bash
# Verificar se o Supabase está rodando
supabase status

# Verificar se as tabelas existem
supabase db diff

# Ver logs do Supabase
supabase logs

# Verificar compilação TypeScript
npx tsc --noEmit
```

---

**IMPORTANTE**: Execute os passos na ordem. Não pule etapas. Se um passo falhar, resolva antes de continuar.