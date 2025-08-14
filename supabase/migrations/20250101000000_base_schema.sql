-- ============================================================================
-- MIGRATION: SCHEMA BASE DO SISTEMA GRC
-- ============================================================================
-- Criação das tabelas base e estrutura fundamental do sistema

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELAS BÁSICAS DO SISTEMA
-- ============================================================================

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    tenant_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tenants (multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de frameworks de compliance
CREATE TABLE IF NOT EXISTS frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    category VARCHAR(100),
    version VARCHAR(20),
    description TEXT,
    created_by_user_id UUID REFERENCES auth.users(id),
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de controles dos frameworks
CREATE TABLE IF NOT EXISTS framework_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
    control_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    requirements TEXT,
    guidance TEXT,
    testing_procedures TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de assessments
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework_id UUID REFERENCES frameworks(id),
    tenant_id UUID REFERENCES tenants(id),
    status VARCHAR(50) DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de respostas dos assessments
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    control_id UUID REFERENCES framework_controls(id),
    maturity_level INTEGER CHECK (maturity_level >= 1 AND maturity_level <= 5),
    evidence TEXT,
    comments TEXT,
    respondent_id UUID REFERENCES auth.users(id),
    reviewer_id UUID REFERENCES auth.users(id),
    status VARCHAR(30) DEFAULT 'pending',
    responded_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de papéis/roles dos usuários
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas básicas para tenants (visível para usuários do tenant)
CREATE POLICY "Users can view own tenant" ON tenants FOR SELECT USING (
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular progresso de assessment
CREATE OR REPLACE FUNCTION calculate_assessment_progress(assessment_uuid UUID)
RETURNS JSON AS $$
DECLARE
    total_controls INTEGER;
    completed_responses INTEGER;
    progress_percentage NUMERIC;
    result JSON;
BEGIN
    -- Contar total de controles do framework
    SELECT COUNT(*) INTO total_controls
    FROM framework_controls fc
    JOIN assessments a ON a.framework_id = fc.framework_id
    WHERE a.id = assessment_uuid;
    
    -- Contar respostas completas
    SELECT COUNT(*) INTO completed_responses
    FROM assessment_responses ar
    WHERE ar.assessment_id = assessment_uuid
    AND ar.maturity_level IS NOT NULL;
    
    -- Calcular porcentagem
    IF total_controls > 0 THEN
        progress_percentage := (completed_responses::NUMERIC / total_controls::NUMERIC) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Montar resultado
    SELECT json_build_object(
        'total_controls', total_controls,
        'completed_responses', completed_responses,
        'progress_percentage', ROUND(progress_percentage, 2)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_tenant_id ON frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_framework_controls_framework_id ON framework_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_framework_id ON assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON user_roles(tenant_id);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE profiles IS 'Perfis dos usuários com informações básicas';
COMMENT ON TABLE tenants IS 'Organizações/empresas no sistema multi-tenant';
COMMENT ON TABLE frameworks IS 'Frameworks de compliance (ISO 27001, SOC2, etc.)';
COMMENT ON TABLE framework_controls IS 'Controles específicos de cada framework';
COMMENT ON TABLE assessments IS 'Avaliações de compliance baseadas em frameworks';
COMMENT ON TABLE assessment_responses IS 'Respostas dos usuários aos controles';
COMMENT ON TABLE user_roles IS 'Papéis/permissões dos usuários no sistema';