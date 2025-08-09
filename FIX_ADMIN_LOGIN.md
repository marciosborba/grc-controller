# 🔧 Solução para Problema de Login do Administrador

O usuário `adm@grc-controller.com` não está conseguindo fazer login. Vamos resolver isso passo a passo.

## 🔍 Passo 1: Diagnóstico

Execute o script de diagnóstico no **SQL Editor** do Supabase:

```sql
-- Verificar se usuário existe
SELECT 
    'AUTH USER' as tipo,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'adm@grc-controller.com';

-- Verificar perfil
SELECT 
    'PROFILE' as tipo,
    user_id,
    email,
    tenant_id,
    is_active
FROM profiles 
WHERE email = 'adm@grc-controller.com';
```

## 🛠️ Passo 2: Soluções (escolha uma)

### Solução A: Criar pelo Dashboard do Supabase (RECOMENDADO)

1. **Acesse Supabase Dashboard** → **Authentication** → **Users**
2. **Delete** o usuário existente se houver algum com problema
3. **Clique "Add user"** e preencha:
   - Email: `adm@grc-controller.com`
   - Password: `Teste123!@#`
   - ✅ **Auto Confirm User** (IMPORTANTE!)
4. **Copie o ID** do usuário criado
5. **Execute este SQL** substituindo `USER_ID_AQUI`:

```sql
BEGIN;

-- Garantir que tenant existe
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- Criar/atualizar perfil
INSERT INTO profiles (
    user_id, full_name, job_title, tenant_id, is_active, email, permissions
)
VALUES (
    'USER_ID_AQUI',  -- ⚠️ SUBSTITUA AQUI
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com',
    '[]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    tenant_id = EXCLUDED.tenant_id,
    is_active = true,
    email = EXCLUDED.email;

-- Adicionar roles
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_ID_AQUI', 'admin')  -- ⚠️ SUBSTITUA AQUI
ON CONFLICT DO NOTHING;

INSERT INTO platform_admins (user_id, role, permissions) 
VALUES (
    'USER_ID_AQUI',  -- ⚠️ SUBSTITUA AQUI
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

COMMIT;

-- Verificar
SELECT 'SUCCESS' as status, u.email, pa.role 
FROM auth.users u
JOIN profiles p ON u.id = p.user_id  
JOIN platform_admins pa ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';
```

### Solução B: Via Página de Signup da Aplicação

1. **Acesse** sua aplicação em `http://localhost:8081`
2. **Vá para a página de registro** (se houver)
3. **Registre** com:
   - Email: `adm@grc-controller.com`
   - Senha: `Teste123!@#`
   - Nome: `Administrador da Plataforma`
4. **Confirme o email** no Supabase Dashboard se necessário
5. **Execute o SQL** acima para dar privilégios de admin

### Solução C: Reset da Senha

Se o usuário já existe mas a senha não funciona:

1. **No Supabase Dashboard** → **Authentication** → **Users**
2. **Encontre** o usuário `adm@grc-controller.com`
3. **Clique nos 3 pontos** → **Reset Password**
4. **Defina nova senha**: `Teste123!@#`
5. **Execute o SQL** de configuração acima

## 🔍 Passo 3: Verificação de Login

Após executar uma das soluções:

1. **Limpe o cache** do navegador
2. **Acesse** a aplicação
3. **Tente fazer login** com:
   - Email: `adm@grc-controller.com`
   - Senha: `Teste123!@#`
4. **Verifique** se o menu "Tenants" aparece

## 🚨 Problemas Comuns e Soluções

### "Invalid login credentials"
- ✅ Verifique se `email_confirmed_at` não é NULL no banco
- ✅ Confirme o usuário manualmente no Dashboard
- ✅ Teste reset de senha

### "Email not confirmed"
- ✅ No Dashboard: Users → usuário → 3 pontos → "Confirm email"

### "Profile not found" 
- ✅ Execute o SQL de criação do perfil
- ✅ Verifique se `tenant_id` está correto

### Menu "Tenants" não aparece
- ✅ Verifique se existe entrada em `platform_admins`
- ✅ Confirme se `isPlatformAdmin` é true no contexto

## 🧪 Teste Rápido

Execute este SQL para testar tudo:

```sql
-- Este comando deve retornar 1 linha com todos os dados
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.full_name,
    p.is_active as profile_active,
    pa.role as platform_role,
    ur.role as system_role,
    t.name as tenant_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN platform_admins pa ON u.id = pa.user_id  
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE u.email = 'adm@grc-controller.com';
```

**Resultado esperado:**
- `email_confirmed`: true
- `profile_active`: true  
- `platform_role`: platform_admin
- `system_role`: admin
- `tenant_name`: Organização Principal

## 📞 Se Nada Funcionar

1. **Delete completamente** o usuário no Dashboard
2. **Execute** a migração multi-tenant novamente
3. **Siga a Solução A** desde o início
4. **Verifique** os logs do navegador para erros JavaScript

---

**Credenciais finais:**
- 📧 **Email**: `adm@grc-controller.com`
- 🔑 **Senha**: `Teste123!@#`