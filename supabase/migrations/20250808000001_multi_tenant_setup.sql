-- Migration para implementar multi-tenancy completo
-- Criado em: 2025-08-08

-- Criar enum para tipos de papel do sistema
DO $$ BEGIN
    CREATE TYPE platform_role AS ENUM ('platform_admin', 'tenant_admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de tenants (organizações)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    billing_email VARCHAR(255),
    max_users INTEGER DEFAULT 10 NOT NULL,
    current_users_count INTEGER DEFAULT 0,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT max_users_positive CHECK (max_users > 0),
    CONSTRAINT current_users_non_negative CHECK (current_users_count >= 0),
    CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial'))
);

-- Criar tabela para administradores da plataforma
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role platform_role DEFAULT 'platform_admin',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Atualizar tabela profiles para incluir tenant_id obrigatório
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON platform_admins(user_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tenants
-- Administradores da plataforma podem ver todos os tenants
CREATE POLICY "Platform admins can view all tenants"
    ON tenants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Usuários normais só podem ver seu próprio tenant
CREATE POLICY "Users can view their own tenant"
    ON tenants
    FOR SELECT
    USING (
        id IN (
            SELECT tenant_id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Administradores da plataforma podem gerenciar todos os tenants
CREATE POLICY "Platform admins can manage all tenants"
    ON tenants
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas RLS para platform_admins
CREATE POLICY "Platform admins can view platform admin records"
    ON platform_admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Platform admins can manage platform admin records"
    ON platform_admins
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Atualizar política RLS dos profiles para isolamento por tenant
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        -- Usuário pode ver seu próprio perfil
        user_id = auth.uid() 
        OR 
        -- Ou perfis do mesmo tenant se for admin/ciso
        (
            tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
            AND (
                has_role(auth.uid(), 'admin'::app_role) 
                OR has_role(auth.uid(), 'ciso'::app_role)
                OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
            )
        )
    );

-- Função para verificar se usuário é admin da plataforma
CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE user_id = user_id_param
    );
END;
$$;

-- Função para verificar se usuário é admin do tenant
CREATE OR REPLACE FUNCTION is_tenant_admin(user_id_param uuid, tenant_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_tenant_id UUID;
    is_admin BOOLEAN;
BEGIN
    -- Verificar se usuário pertence ao tenant
    SELECT tenant_id INTO user_tenant_id
    FROM profiles
    WHERE user_id = user_id_param;
    
    -- Se não pertence ao tenant, não é admin
    IF user_tenant_id != tenant_id_param THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se tem role de admin
    SELECT has_role(user_id_param, 'admin'::app_role) INTO is_admin;
    
    RETURN is_admin;
END;
$$;

-- Função para atualizar contador de usuários do tenant
CREATE OR REPLACE FUNCTION update_tenant_user_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador ao adicionar usuário
        UPDATE tenants 
        SET 
            current_users_count = current_users_count + 1,
            updated_at = now()
        WHERE id = NEW.tenant_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador ao remover usuário
        UPDATE tenants 
        SET 
            current_users_count = GREATEST(0, current_users_count - 1),
            updated_at = now()
        WHERE id = OLD.tenant_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Ajustar contadores se tenant mudou
        IF OLD.tenant_id != NEW.tenant_id THEN
            -- Decrementar do tenant antigo
            UPDATE tenants 
            SET 
                current_users_count = GREATEST(0, current_users_count - 1),
                updated_at = now()
            WHERE id = OLD.tenant_id;
            
            -- Incrementar no novo tenant
            UPDATE tenants 
            SET 
                current_users_count = current_users_count + 1,
                updated_at = now()
            WHERE id = NEW.tenant_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger para atualizar contador de usuários
DROP TRIGGER IF EXISTS trigger_update_tenant_user_count ON profiles;
CREATE TRIGGER trigger_update_tenant_user_count
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_user_count();

-- Função para validar limite de usuários por tenant
CREATE OR REPLACE FUNCTION check_tenant_user_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    is_platform_admin_user BOOLEAN;
BEGIN
    -- Verificar se é um admin da plataforma (sem limite)
    SELECT is_platform_admin(NEW.user_id) INTO is_platform_admin_user;
    
    IF is_platform_admin_user THEN
        RETURN NEW;
    END IF;
    
    -- Buscar limites do tenant
    SELECT current_users_count, max_users
    INTO current_count, max_allowed
    FROM tenants
    WHERE id = NEW.tenant_id;
    
    -- Se é INSERT ou UPDATE que muda o tenant, verificar limite
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.tenant_id != NEW.tenant_id) THEN
        IF current_count >= max_allowed THEN
            RAISE EXCEPTION 'Limite de usuários atingido para este tenant. Máximo: %, Atual: %', max_allowed, current_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para validar limite de usuários
CREATE TRIGGER trigger_check_tenant_user_limit
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_tenant_user_limit();

-- Inserir tenant padrão para migração
INSERT INTO tenants (id, name, slug, contact_email, max_users, current_users_count)
SELECT 
    'tenant-1'::uuid, 
    'Organização Principal', 
    'principal', 
    'admin@example.com',
    1000,
    (SELECT COUNT(*) FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Atualizar profiles existentes para o tenant padrão (se não tiverem tenant)
UPDATE profiles 
SET tenant_id = 'tenant-1'::uuid 
WHERE tenant_id IS NULL;

-- Fazer tenant_id obrigatório após migração
ALTER TABLE profiles ALTER COLUMN tenant_id SET NOT NULL;

-- Função RPC para administradores da plataforma gerenciarem tenants
CREATE OR REPLACE FUNCTION rpc_manage_tenant(
    action TEXT,
    tenant_data JSONB DEFAULT NULL,
    tenant_id_param UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result JSONB;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    -- Verificar se usuário é admin da plataforma
    IF NOT is_platform_admin(current_user_id) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores da plataforma podem gerenciar tenants.';
    END IF;
    
    CASE action
        WHEN 'create' THEN
            INSERT INTO tenants (name, slug, contact_email, contact_phone, billing_email, max_users, subscription_plan)
            VALUES (
                tenant_data->>'name',
                tenant_data->>'slug',
                tenant_data->>'contact_email',
                tenant_data->>'contact_phone',
                tenant_data->>'billing_email',
                COALESCE((tenant_data->>'max_users')::INTEGER, 10),
                COALESCE(tenant_data->>'subscription_plan', 'basic')
            )
            RETURNING jsonb_build_object('id', id, 'status', 'created') INTO result;
            
        WHEN 'update' THEN
            UPDATE tenants 
            SET 
                name = COALESCE(tenant_data->>'name', name),
                contact_email = COALESCE(tenant_data->>'contact_email', contact_email),
                contact_phone = COALESCE(tenant_data->>'contact_phone', contact_phone),
                billing_email = COALESCE(tenant_data->>'billing_email', billing_email),
                max_users = COALESCE((tenant_data->>'max_users')::INTEGER, max_users),
                subscription_plan = COALESCE(tenant_data->>'subscription_plan', subscription_plan),
                is_active = COALESCE((tenant_data->>'is_active')::BOOLEAN, is_active),
                updated_at = now()
            WHERE id = tenant_id_param
            RETURNING jsonb_build_object('id', id, 'status', 'updated') INTO result;
            
        WHEN 'delete' THEN
            -- Verificar se tenant tem usuários
            IF EXISTS (SELECT 1 FROM profiles WHERE tenant_id = tenant_id_param) THEN
                RAISE EXCEPTION 'Não é possível excluir tenant com usuários associados.';
            END IF;
            
            DELETE FROM tenants WHERE id = tenant_id_param
            RETURNING jsonb_build_object('id', id, 'status', 'deleted') INTO result;
            
        ELSE
            RAISE EXCEPTION 'Ação inválida: %', action;
    END CASE;
    
    RETURN COALESCE(result, '{"status": "no_change"}'::jsonb);
END;
$$;

-- Comentários nas tabelas
COMMENT ON TABLE tenants IS 'Tabela de organizações/empresas (multi-tenant)';
COMMENT ON TABLE platform_admins IS 'Administradores da plataforma com acesso global';
COMMENT ON COLUMN tenants.max_users IS 'Limite máximo de usuários para o tenant';
COMMENT ON COLUMN tenants.current_users_count IS 'Contador atual de usuários (atualizado via trigger)';
COMMENT ON COLUMN profiles.tenant_id IS 'ID do tenant ao qual o usuário pertence (isolamento)';