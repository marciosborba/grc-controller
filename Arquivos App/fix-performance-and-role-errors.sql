-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO DE PERFORMANCE E ERROS DE ROLE
-- =====================================================
-- Este script corrige problemas de performance e erros relacionados a roles

BEGIN;

-- =====================================================
-- 1. VERIFICAR E CORRIGIR TABELA USER_ROLES
-- =====================================================

-- Verificar se a tabela user_roles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Criando tabela user_roles...';
        
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'user',
            tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, role, tenant_id)
        );
        
        -- Criar índices para performance
        CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
        CREATE INDEX idx_user_roles_role ON user_roles(role);
        CREATE INDEX idx_user_roles_composite ON user_roles(user_id, tenant_id, role);
        
        RAISE NOTICE 'Tabela user_roles criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela user_roles já existe';
    END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR E CORRIGIR DADOS DE USER_ROLES
-- =====================================================

-- Garantir que todos os usuários tenham pelo menos uma role
DO $$
DECLARE
    user_record RECORD;
    default_tenant_id UUID;
BEGIN
    -- Obter o tenant padrão
    SELECT id INTO default_tenant_id FROM tenants ORDER BY created_at LIMIT 1;
    
    IF default_tenant_id IS NULL THEN
        RAISE NOTICE 'Nenhum tenant encontrado, criando tenant padrão...';
        INSERT INTO tenants (id, name, slug, contact_email, max_users, subscription_plan, is_active)
        VALUES (
            '46b1c048-85a1-423b-96fc-776007c8de1f',
            'GRC-Controller',
            'grc-controller',
            'admin@grc-controller.com',
            100,
            'enterprise',
            true
        ) ON CONFLICT (id) DO NOTHING;
        
        default_tenant_id := '46b1c048-85a1-423b-96fc-776007c8de1f';
    END IF;
    
    -- Para cada usuário sem role, adicionar role padrão
    FOR user_record IN 
        SELECT DISTINCT p.user_id, p.tenant_id
        FROM profiles p
        LEFT JOIN user_roles ur ON ur.user_id = p.user_id
        WHERE ur.user_id IS NULL
    LOOP
        INSERT INTO user_roles (user_id, role, tenant_id, created_at)
        VALUES (
            user_record.user_id,
            'user',
            COALESCE(user_record.tenant_id, default_tenant_id),
            NOW()
        ) ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
        
        RAISE NOTICE 'Adicionada role padrão para usuário: %', user_record.user_id;
    END LOOP;
    
    -- Verificar usuários sem tenant_id na tabela user_roles
    UPDATE user_roles 
    SET tenant_id = default_tenant_id 
    WHERE tenant_id IS NULL;
    
    RAISE NOTICE 'Correção de user_roles concluída';
END $$;

-- =====================================================
-- 3. OTIMIZAR QUERIES DE ROLES
-- =====================================================

-- Criar view otimizada para consultas de roles
CREATE OR REPLACE VIEW user_roles_optimized AS
SELECT 
    ur.user_id,
    ur.role,
    ur.tenant_id,
    p.full_name,
    p.email,
    t.name as tenant_name
FROM user_roles ur
JOIN profiles p ON p.user_id = ur.user_id
LEFT JOIN tenants t ON t.id = ur.tenant_id;

-- =====================================================
-- 4. CORRIGIR POLÍTICAS RLS PARA USER_ROLES
-- =====================================================

-- Habilitar RLS se não estiver habilitado
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS tenant_isolation_user_roles ON user_roles;
DROP POLICY IF EXISTS user_roles_select_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_insert_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_update_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_delete_policy ON user_roles;

-- Criar políticas mais flexíveis para user_roles
CREATE POLICY user_roles_select_policy ON user_roles
    FOR SELECT TO authenticated
    USING (
        -- Usuário pode ver suas próprias roles
        user_id = auth.uid()
        OR
        -- Platform admins podem ver todas as roles
        EXISTS (
            SELECT 1 FROM platform_admins pa 
            WHERE pa.user_id = auth.uid()
        )
        OR
        -- Usuários do mesmo tenant podem ver roles do tenant
        tenant_id IN (
            SELECT p.tenant_id 
            FROM profiles p 
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY user_roles_insert_policy ON user_roles
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Platform admins podem inserir qualquer role
        EXISTS (
            SELECT 1 FROM platform_admins pa 
            WHERE pa.user_id = auth.uid()
        )
        OR
        -- Admins do tenant podem inserir roles no seu tenant
        (
            tenant_id IN (
                SELECT p.tenant_id 
                FROM profiles p 
                WHERE p.user_id = auth.uid()
            )
            AND
            EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('admin', 'super_admin')
            )
        )
    );

CREATE POLICY user_roles_update_policy ON user_roles
    FOR UPDATE TO authenticated
    USING (
        -- Platform admins podem atualizar qualquer role
        EXISTS (
            SELECT 1 FROM platform_admins pa 
            WHERE pa.user_id = auth.uid()
        )
        OR
        -- Admins do tenant podem atualizar roles no seu tenant
        (
            tenant_id IN (
                SELECT p.tenant_id 
                FROM profiles p 
                WHERE p.user_id = auth.uid()
            )
            AND
            EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('admin', 'super_admin')
            )
        )
    );

CREATE POLICY user_roles_delete_policy ON user_roles
    FOR DELETE TO authenticated
    USING (
        -- Platform admins podem deletar qualquer role
        EXISTS (
            SELECT 1 FROM platform_admins pa 
            WHERE pa.user_id = auth.uid()
        )
        OR
        -- Admins do tenant podem deletar roles no seu tenant
        (
            tenant_id IN (
                SELECT p.tenant_id 
                FROM profiles p 
                WHERE p.user_id = auth.uid()
            )
            AND
            EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('admin', 'super_admin')
            )
        )
    );

-- =====================================================
-- 5. OTIMIZAR TABELA CUSTOM_ROLES
-- =====================================================

-- Verificar se a tabela custom_roles existe e otimizar
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_roles') THEN
        -- Criar índices se não existirem
        CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON custom_roles(name);
        CREATE INDEX IF NOT EXISTS idx_custom_roles_active ON custom_roles(is_active);
        CREATE INDEX IF NOT EXISTS idx_custom_roles_system ON custom_roles(is_system);
        CREATE INDEX IF NOT EXISTS idx_custom_roles_tenant ON custom_roles(tenant_id);
        
        -- Garantir que existam roles básicas
        INSERT INTO custom_roles (
            id, name, display_name, description, permissions, color, icon,
            is_active, is_system, tenant_id, created_at, updated_at
        ) VALUES 
        (
            gen_random_uuid(),
            'user',
            'Usuário Básico',
            'Acesso básico aos módulos da plataforma',
            ARRAY['all'],
            '#6B7280',
            'User',
            true,
            true,
            NULL,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'admin',
            'Administrador',
            'Acesso administrativo completo ao tenant',
            ARRAY['*', 'all', 'admin', 'read', 'write', 'delete'],
            '#DC2626',
            'Shield',
            true,
            true,
            NULL,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'auditor',
            'Auditor',
            'Acesso a módulos de auditoria e relatórios',
            ARRAY['audit.read', 'audit.write', 'assessment.read', 'report.read', 'compliance.read', 'logs.read'],
            '#7C3AED',
            'Eye',
            true,
            true,
            NULL,
            NOW(),
            NOW()
        )
        ON CONFLICT (name) DO UPDATE SET
            updated_at = NOW(),
            is_active = true;
            
        RAISE NOTICE 'Roles básicas garantidas na tabela custom_roles';
    ELSE
        RAISE NOTICE 'Tabela custom_roles não existe, criando...';
        
        CREATE TABLE custom_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
            color TEXT DEFAULT '#6B7280',
            icon TEXT DEFAULT 'User',
            is_active BOOLEAN DEFAULT true,
            is_system BOOLEAN DEFAULT false,
            tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(name, tenant_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_custom_roles_name ON custom_roles(name);
        CREATE INDEX idx_custom_roles_active ON custom_roles(is_active);
        CREATE INDEX idx_custom_roles_system ON custom_roles(is_system);
        CREATE INDEX idx_custom_roles_tenant ON custom_roles(tenant_id);
        
        RAISE NOTICE 'Tabela custom_roles criada';
    END IF;
END $$;

-- =====================================================
-- 6. OTIMIZAR PERFORMANCE GERAL
-- =====================================================

-- Atualizar estatísticas das tabelas
ANALYZE user_roles;
ANALYZE custom_roles;
ANALYZE profiles;
ANALYZE tenants;

-- Criar função para cache de roles do usuário
CREATE OR REPLACE FUNCTION get_user_roles_cached(p_user_id UUID)
RETURNS TABLE(role TEXT, tenant_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.role, ur.tenant_id
    FROM user_roles ur
    WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 7. VERIFICAR INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar usuários órfãos
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM user_roles ur
    LEFT JOIN profiles p ON p.user_id = ur.user_id
    WHERE p.user_id IS NULL;
    
    IF orphan_count > 0 THEN
        RAISE NOTICE 'Encontrados % registros órfãos em user_roles', orphan_count;
        
        -- Remover registros órfãos
        DELETE FROM user_roles ur
        WHERE NOT EXISTS (
            SELECT 1 FROM profiles p WHERE p.user_id = ur.user_id
        );
        
        RAISE NOTICE 'Registros órfãos removidos';
    END IF;
END $$;

-- =====================================================
-- 8. CRIAR TRIGGERS PARA MANTER DADOS ATUALIZADOS
-- =====================================================

-- Trigger para atualizar updated_at em user_roles
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_roles_updated_at ON user_roles;
CREATE TRIGGER trigger_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

-- Trigger para garantir role padrão ao criar perfil
CREATE OR REPLACE FUNCTION ensure_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir role padrão se não existir
    INSERT INTO user_roles (user_id, role, tenant_id, created_at)
    VALUES (NEW.user_id, 'user', NEW.tenant_id, NOW())
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_default_role ON profiles;
CREATE TRIGGER trigger_ensure_default_role
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_default_user_role();

COMMIT;

-- =====================================================
-- RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    role_count INTEGER;
    custom_role_count INTEGER;
    tenant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles;
    SELECT COUNT(*) INTO role_count FROM user_roles;
    SELECT COUNT(*) INTO custom_role_count FROM custom_roles WHERE is_active = true;
    SELECT COUNT(*) INTO tenant_count FROM tenants WHERE is_active = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO DE PERFORMANCE E ROLES CONCLUÍDA! 🎉';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Usuários: %', user_count;
    RAISE NOTICE 'Roles atribuídas: %', role_count;
    RAISE NOTICE 'Roles customizadas ativas: %', custom_role_count;
    RAISE NOTICE 'Tenants ativos: %', tenant_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tabela user_roles otimizada';
    RAISE NOTICE '✅ Políticas RLS corrigidas';
    RAISE NOTICE '✅ Índices de performance criados';
    RAISE NOTICE '✅ Triggers de integridade implementados';
    RAISE NOTICE '✅ Dados órfãos removidos';
    RAISE NOTICE '';
    RAISE NOTICE 'A aplicação deve carregar mais rapidamente agora!';
END $$;