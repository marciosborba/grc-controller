# 🔐 Criar Administrador da Plataforma

## Credenciais do Administrador
- **Email**: `adm@grc-controller.com`
- **Senha**: `Teste123!@#`
- **Nome**: `Administrador da Plataforma`

## 📝 Método 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Criar Usuário no Supabase
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Authentication** → **Users**
4. Clique em **Add user**
5. Preencha:
   - **Email**: `adm@grc-controller.com`
   - **Password**: `Teste123!@#`
   - ✅ Marque **Auto Confirm User**
6. Clique em **Create user**
7. **COPIE o ID do usuário gerado** (você precisará dele)

### Passo 2: Executar SQL para Configurar Permissões
No Supabase Dashboard, vá para **SQL Editor** e execute:

```sql
-- 1. Criar tenant padrão (se não existir)
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES (
    'Organização Principal',
    'principal',
    'adm@grc-controller.com',
    1000,
    'enterprise',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Criar perfil do usuário (SUBSTITUA 'COLE_O_ID_DO_USUARIO_AQUI')
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
    'COLE_O_ID_DO_USUARIO_AQUI', -- ⚠️ SUBSTITUA pelo ID copiado do passo 1
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com',
    '[]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    job_title = EXCLUDED.job_title,
    tenant_id = EXCLUDED.tenant_id,
    is_active = EXCLUDED.is_active,
    email = EXCLUDED.email;

-- 3. Criar role admin (SUBSTITUA 'COLE_O_ID_DO_USUARIO_AQUI')
INSERT INTO user_roles (user_id, role)
VALUES (
    'COLE_O_ID_DO_USUARIO_AQUI', -- ⚠️ SUBSTITUA pelo ID copiado do passo 1
    'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Criar administrador da plataforma (SUBSTITUA 'COLE_O_ID_DO_USUARIO_AQUI')
INSERT INTO platform_admins (
    user_id,
    role,
    permissions,
    created_at
)
VALUES (
    'COLE_O_ID_DO_USUARIO_AQUI', -- ⚠️ SUBSTITUA pelo ID copiado do passo 1
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- 5. Verificar se foi criado corretamente
SELECT 
    'Usuário criado com sucesso!' as status,
    pa.role,
    p.full_name,
    p.email,
    t.name as tenant_name
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
JOIN tenants t ON p.tenant_id = t.id
WHERE p.email = 'adm@grc-controller.com';
```

### Passo 3: Testar Login
1. Acesse sua aplicação em `http://localhost:8081`
2. Faça login com:
   - **Email**: `adm@grc-controller.com`
   - **Senha**: `Teste123!@#`
3. Verifique se o menu **"Tenants"** aparece na barra lateral
4. Acesse `/admin/tenants` para gerenciar organizações

---

## 📝 Método 2: Via Script SQL Direto

Se preferir executar tudo de uma vez, use o arquivo `scripts/create-platform-admin.sql`:

1. Primeiro, crie o usuário manualmente no Supabase Dashboard (Passo 1 do Método 1)
2. Copie o ID do usuário
3. Edite o arquivo `scripts/create-platform-admin.sql`
4. Substitua todas as ocorrências de `USER_ID_AQUI` pelo ID real
5. Execute o script no SQL Editor do Supabase

---

## 🔍 Verificação e Solução de Problemas

### Comandos de Verificação SQL:
```sql
-- Ver usuário criado
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'adm@grc-controller.com';

-- Ver perfil
SELECT * FROM profiles 
WHERE email = 'adm@grc-controller.com';

-- Ver se é admin da plataforma
SELECT pa.*, p.full_name, p.email 
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
WHERE p.email = 'adm@grc-controller.com';

-- Ver tenant padrão
SELECT * FROM tenants WHERE slug = 'principal';
```

### Problemas Comuns:

1. **"Usuário não consegue fazer login"**
   - Verifique se `email_confirmed_at` não é NULL
   - Confirme a senha no Supabase Dashboard

2. **"Menu Tenants não aparece"**
   - Verifique se existe entrada em `platform_admins`
   - Confirme se o perfil está associado ao tenant correto

3. **"Erro ao criar usuários"**
   - Verifique se o tenant tem `is_active = true`
   - Confirme se `max_users` é suficiente

---

## ✅ Resultado Esperado

Após seguir os passos:
- ✅ Login funcionando com as credenciais fornecidas
- ✅ Menu "Tenants" visível na barra lateral
- ✅ Acesso à página `/admin/tenants`
- ✅ Capacidade de criar novos tenants
- ✅ Capacidade de criar usuários sem limites

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se aplicou a migração `20250808000001_multi_tenant_setup.sql`
2. Confirme se o usuário foi criado no Supabase Auth
3. Execute os comandos de verificação SQL
4. Verifique os logs da aplicação no console do navegador