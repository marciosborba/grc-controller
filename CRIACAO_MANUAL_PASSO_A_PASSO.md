# 🔧 Criação Manual do Usuário Administrador - Passo a Passo

Vamos criar o usuário de forma **100% manual e controlada** para garantir que funcione.

## 📋 **PASSO 1: Execute o Diagnóstico**

Primeiro, execute o arquivo `DIAGNOSTICO_COMPLETO.sql` no SQL Editor do Supabase para ver exatamente o que está faltando.

## 🛠️ **PASSO 2: Criação Manual no Dashboard**

### 2.1 Acessar Supabase Dashboard
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **Authentication** → **Users**

### 2.2 Limpar Usuário Existente (se necessário)
Se já existe um usuário `adm@grc-controller.com` com problemas:
1. **Encontre** o usuário na lista
2. **Clique** nos 3 pontos (⋮)
3. **Delete** o usuário
4. **Confirme** a exclusão

### 2.3 Criar Novo Usuário
1. **Clique** em "Add user"
2. **Preencha**:
   - Email: `adm@grc-controller.com`
   - Password: `Teste123!@#`
   - ✅ **IMPORTANTE**: Marque "Auto Confirm User"
   - ✅ **IMPORTANTE**: Marque "Send Magic Link" se disponível
3. **Clique** "Create user"
4. **COPIE** o ID do usuário (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## 📝 **PASSO 3: Verificar Criação**

Execute este SQL para verificar se o usuário foi criado corretamente:

```sql
SELECT 
    id,
    email,
    email_confirmed_at,
    encrypted_password IS NOT NULL as tem_senha,
    role,
    created_at
FROM auth.users 
WHERE email = 'adm@grc-controller.com';
```

**Resultado esperado:**
- ✅ `email_confirmed_at` deve ter uma data (não NULL)
- ✅ `tem_senha` deve ser `true`
- ✅ `role` deve ser `authenticated`

## 🔐 **PASSO 4: Configurar Perfil e Permissões**

Execute este SQL substituindo `COLE_O_ID_AQUI` pelo ID copiado:

```sql
-- Garantir que tenant existe
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- Criar perfil
INSERT INTO profiles (
    user_id, 
    full_name, 
    job_title, 
    tenant_id, 
    is_active, 
    email, 
    permissions
)
VALUES (
    'COLE_O_ID_AQUI'::uuid,  -- ⚠️ SUBSTITUA AQUI
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com',
    '[]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    tenant_id = (SELECT id FROM tenants WHERE slug = 'principal'),
    full_name = EXCLUDED.full_name,
    is_active = true;

-- Criar platform admin
INSERT INTO platform_admins (user_id, role, permissions) 
VALUES (
    'COLE_O_ID_AQUI'::uuid,  -- ⚠️ SUBSTITUA AQUI
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- Criar role de sistema (se tabela existir)
DO $$
BEGIN
    INSERT INTO user_roles (user_id, role) 
    VALUES ('COLE_O_ID_AQUI'::uuid, 'admin');  -- ⚠️ SUBSTITUA AQUI
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN unique_violation THEN NULL;
END $$;

-- Verificar se tudo foi criado
SELECT 
    '✅ CONFIGURAÇÃO COMPLETA!' as status,
    u.email,
    p.full_name,
    pa.role as platform_role,
    t.name as tenant
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
JOIN platform_admins pa ON u.id = pa.user_id
JOIN tenants t ON p.tenant_id = t.id
WHERE u.email = 'adm@grc-controller.com';
```

## 🧪 **PASSO 5: Teste o Login**

### 5.1 Teste Direto no Supabase
1. No Dashboard, vá para **Authentication** → **Users**
2. Encontre seu usuário `adm@grc-controller.com`
3. Clique nos 3 pontos (⋮)
4. Selecione "Send magic link" ou "Reset password"
5. Use para confirmar que o usuário está ativo

### 5.2 Teste na Aplicação
1. Acesse `http://localhost:8081`
2. Tente fazer login com:
   - Email: `adm@grc-controller.com`
   - Senha: `Teste123!@#`

## 🔍 **PASSO 6: Debug se Não Funcionar**

Se o login ainda não funcionar, execute:

```sql
-- Verificar detalhes do usuário
SELECT 
    'DETALHES USUARIO' as info,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.encrypted_password IS NOT NULL as tem_senha,
    u.role,
    u.aud
FROM auth.users u
WHERE u.email = 'adm@grc-controller.com';

-- Verificar identity
SELECT 
    'IDENTITY' as info,
    i.provider,
    i.provider_id,
    i.email
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email = 'adm@grc-controller.com';

-- Testar hash da senha
SELECT 
    'TESTE SENHA' as info,
    encrypted_password = crypt('Teste123!@#', encrypted_password) as senha_correta
FROM auth.users 
WHERE email = 'adm@grc-controller.com';
```

## 🚨 **Problemas Comuns e Soluções:**

### "Invalid login credentials"
```sql
-- Confirmar email
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'adm@grc-controller.com';

-- Resetar senha
UPDATE auth.users 
SET encrypted_password = crypt('Teste123!@#', gen_salt('bf'))
WHERE email = 'adm@grc-controller.com';
```

### "User not found"
- Verifique se o usuário realmente existe no Dashboard
- Recrie o usuário se necessário

### Login funciona mas sem menu "Tenants"
```sql
-- Verificar se é platform admin
SELECT * FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
WHERE p.email = 'adm@grc-controller.com';
```

## ✅ **Resultado Final Esperado:**

Após seguir todos os passos:
- ✅ Login funciona com `adm@grc-controller.com` / `Teste123!@#`
- ✅ Menu "Tenants" aparece na barra lateral
- ✅ Acesso à página `/admin/tenants` funciona
- ✅ Pode criar novos tenants e usuários

---

**Execute primeiro o `DIAGNOSTICO_COMPLETO.sql` e compartilhe os resultados comigo para identificar exatamente onde está o problema!**