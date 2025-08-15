-- ============================================================================
-- SCRIPT COMPLETO PARA DROPDOWNS EXTENSÍVEIS
-- ============================================================================
-- Execute este script no SQL Editor do Supabase Studio
-- URL: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd/sql

-- ============================================================================
-- 1. CRIAÇÃO DAS TABELAS
-- ============================================================================

-- Tabela de Departamentos
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT departments_name_tenant_unique UNIQUE (name, tenant_id)
);

-- Tabela de Cargos/Job Titles
CREATE TABLE IF NOT EXISTS job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT job_titles_title_tenant_unique UNIQUE (title, tenant_id)
);

-- Tabela de Frameworks de Compliance
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT frameworks_name_version_tenant_unique UNIQUE (name, version, tenant_id)
);

-- Tabela de Categorias de Risco
CREATE TABLE IF NOT EXISTS risk_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT risk_categories_name_tenant_unique UNIQUE (name, tenant_id)
);

-- Tabela de Tipos de Incidente
CREATE TABLE IF NOT EXISTS incident_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity_default VARCHAR(50) DEFAULT 'medium',
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT incident_types_name_tenant_unique UNIQUE (name, tenant_id)
);

-- ============================================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Departamentos
CREATE INDEX IF NOT EXISTS idx_departments_tenant_active ON departments(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- Cargos
CREATE INDEX IF NOT EXISTS idx_job_titles_tenant_active ON job_titles(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_titles_department ON job_titles(department_id);
CREATE INDEX IF NOT EXISTS idx_job_titles_title ON job_titles(title);

-- Frameworks
CREATE INDEX IF NOT EXISTS idx_frameworks_tenant_active ON compliance_frameworks(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_frameworks_name ON compliance_frameworks(name);

-- Categorias de Risco
CREATE INDEX IF NOT EXISTS idx_risk_categories_tenant_active ON risk_categories(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_risk_categories_name ON risk_categories(name);

-- Tipos de Incidente
CREATE INDEX IF NOT EXISTS idx_incident_types_tenant_active ON incident_types(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_incident_types_name ON incident_types(name);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. POLÍTICAS RLS - DEPARTMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view departments from their tenant" ON departments;
CREATE POLICY "Users can view departments from their tenant" ON departments
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert departments" ON departments;
CREATE POLICY "Admins can insert departments" ON departments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

DROP POLICY IF EXISTS "Admins can update departments" ON departments;
CREATE POLICY "Admins can update departments" ON departments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

-- ============================================================================
-- 5. POLÍTICAS RLS - JOB_TITLES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view job_titles from their tenant" ON job_titles;
CREATE POLICY "Users can view job_titles from their tenant" ON job_titles
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert job_titles" ON job_titles;
CREATE POLICY "Admins can insert job_titles" ON job_titles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

DROP POLICY IF EXISTS "Admins can update job_titles" ON job_titles;
CREATE POLICY "Admins can update job_titles" ON job_titles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

-- ============================================================================
-- 6. POLÍTICAS RLS - COMPLIANCE_FRAMEWORKS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view frameworks from their tenant" ON compliance_frameworks;
CREATE POLICY "Users can view frameworks from their tenant" ON compliance_frameworks
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert frameworks" ON compliance_frameworks;
CREATE POLICY "Admins can insert frameworks" ON compliance_frameworks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

DROP POLICY IF EXISTS "Admins can update frameworks" ON compliance_frameworks;
CREATE POLICY "Admins can update frameworks" ON compliance_frameworks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

-- ============================================================================
-- 7. POLÍTICAS RLS - RISK_CATEGORIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view risk_categories from their tenant" ON risk_categories;
CREATE POLICY "Users can view risk_categories from their tenant" ON risk_categories
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert risk_categories" ON risk_categories;
CREATE POLICY "Admins can insert risk_categories" ON risk_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

DROP POLICY IF EXISTS "Admins can update risk_categories" ON risk_categories;
CREATE POLICY "Admins can update risk_categories" ON risk_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

-- ============================================================================
-- 8. POLÍTICAS RLS - INCIDENT_TYPES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view incident_types from their tenant" ON incident_types;
CREATE POLICY "Users can view incident_types from their tenant" ON incident_types
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert incident_types" ON incident_types;
CREATE POLICY "Admins can insert incident_types" ON incident_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

DROP POLICY IF EXISTS "Admins can update incident_types" ON incident_types;
CREATE POLICY "Admins can update incident_types" ON incident_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (is_platform_admin = true OR 'admin' = ANY(roles))
    )
  );

-- ============================================================================
-- 9. TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at (reutilizar se já existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabela
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_titles_updated_at ON job_titles;
CREATE TRIGGER update_job_titles_updated_at BEFORE UPDATE ON job_titles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_frameworks_updated_at ON compliance_frameworks;
CREATE TRIGGER update_frameworks_updated_at BEFORE UPDATE ON compliance_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_categories_updated_at ON risk_categories;
CREATE TRIGGER update_risk_categories_updated_at BEFORE UPDATE ON risk_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incident_types_updated_at ON incident_types;
CREATE TRIGGER update_incident_types_updated_at BEFORE UPDATE ON incident_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. DADOS INICIAIS (SEED DATA)
-- ============================================================================

-- Inserir dados iniciais para cada tenant existente
DO $$
DECLARE
    tenant_record RECORD;
    first_user_id UUID;
BEGIN
    -- Buscar primeiro usuário para usar como created_by
    SELECT user_id INTO first_user_id FROM profiles LIMIT 1;
    
    -- Para cada tenant existente
    FOR tenant_record IN SELECT id FROM tenants LOOP
        -- Departamentos padrão
        INSERT INTO departments (name, description, tenant_id, created_by, is_active)
        VALUES 
            ('Tecnologia da Informação', 'Departamento responsável pela infraestrutura e sistemas', tenant_record.id, first_user_id, true),
            ('Segurança da Informação', 'Departamento responsável pela segurança cibernética', tenant_record.id, first_user_id, true),
            ('Compliance', 'Departamento responsável pela conformidade regulatória', tenant_record.id, first_user_id, true),
            ('Auditoria', 'Departamento responsável por auditorias internas', tenant_record.id, first_user_id, true),
            ('Riscos', 'Departamento responsável pela gestão de riscos', tenant_record.id, first_user_id, true),
            ('Jurídico', 'Departamento jurídico e legal', tenant_record.id, first_user_id, true),
            ('Recursos Humanos', 'Departamento de gestão de pessoas', tenant_record.id, first_user_id, true),
            ('Financeiro', 'Departamento financeiro e contábil', tenant_record.id, first_user_id, true),
            ('Operações', 'Departamento de operações e processos', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, tenant_id) DO NOTHING;

        -- Cargos padrão
        INSERT INTO job_titles (title, description, tenant_id, created_by, is_active)
        VALUES 
            ('Analista de Segurança', 'Responsável por análises de segurança da informação', tenant_record.id, first_user_id, true),
            ('Especialista em Compliance', 'Especialista em conformidade regulatória', tenant_record.id, first_user_id, true),
            ('Auditor Interno', 'Responsável por auditorias internas', tenant_record.id, first_user_id, true),
            ('Analista de Riscos', 'Responsável por análise e gestão de riscos', tenant_record.id, first_user_id, true),
            ('CISO', 'Chief Information Security Officer', tenant_record.id, first_user_id, true),
            ('Gerente de TI', 'Gerente do departamento de tecnologia', tenant_record.id, first_user_id, true),
            ('Coordenador de Compliance', 'Coordenador de atividades de compliance', tenant_record.id, first_user_id, true),
            ('Analista de Dados', 'Responsável por análise de dados e relatórios', tenant_record.id, first_user_id, true)
        ON CONFLICT (title, tenant_id) DO NOTHING;

        -- Frameworks padrão
        INSERT INTO compliance_frameworks (name, description, version, tenant_id, created_by, is_active)
        VALUES 
            ('ISO 27001', 'Sistema de Gestão de Segurança da Informação', '2013', tenant_record.id, first_user_id, true),
            ('LGPD', 'Lei Geral de Proteção de Dados', '2020', tenant_record.id, first_user_id, true),
            ('SOX', 'Sarbanes-Oxley Act', '2002', tenant_record.id, first_user_id, true),
            ('NIST CSF', 'NIST Cybersecurity Framework', '1.1', tenant_record.id, first_user_id, true),
            ('PCI DSS', 'Payment Card Industry Data Security Standard', '4.0', tenant_record.id, first_user_id, true),
            ('COBIT', 'Control Objectives for Information Technologies', '2019', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, version, tenant_id) DO NOTHING;

        -- Categorias de risco padrão
        INSERT INTO risk_categories (name, description, color, tenant_id, created_by, is_active)
        VALUES 
            ('Cibersegurança', 'Riscos relacionados à segurança cibernética', '#ef4444', tenant_record.id, first_user_id, true),
            ('Operacional', 'Riscos operacionais e de processos', '#f97316', tenant_record.id, first_user_id, true),
            ('Financeiro', 'Riscos financeiros e de mercado', '#eab308', tenant_record.id, first_user_id, true),
            ('Compliance', 'Riscos de conformidade regulatória', '#22c55e', tenant_record.id, first_user_id, true),
            ('Reputacional', 'Riscos à reputação da organização', '#8b5cf6', tenant_record.id, first_user_id, true),
            ('Estratégico', 'Riscos estratégicos de negócio', '#06b6d4', tenant_record.id, first_user_id, true),
            ('Tecnológico', 'Riscos relacionados à tecnologia', '#64748b', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, tenant_id) DO NOTHING;

        -- Tipos de incidente padrão
        INSERT INTO incident_types (name, description, severity_default, tenant_id, created_by, is_active)
        VALUES 
            ('Violação de Dados', 'Acesso não autorizado a dados sensíveis', 'high', tenant_record.id, first_user_id, true),
            ('Malware', 'Infecção por software malicioso', 'medium', tenant_record.id, first_user_id, true),
            ('Phishing', 'Tentativa de engenharia social', 'medium', tenant_record.id, first_user_id, true),
            ('Falha de Sistema', 'Indisponibilidade de sistemas críticos', 'high', tenant_record.id, first_user_id, true),
            ('Acesso Não Autorizado', 'Tentativa de acesso não autorizado', 'medium', tenant_record.id, first_user_id, true),
            ('Perda de Dados', 'Perda acidental de dados', 'high', tenant_record.id, first_user_id, true),
            ('Violação de Compliance', 'Não conformidade com regulamentações', 'high', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, tenant_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- 11. VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se as tabelas foram criadas
SELECT 
    'departments' as table_name,
    COUNT(*) as record_count
FROM departments
UNION ALL
SELECT 
    'job_titles' as table_name,
    COUNT(*) as record_count
FROM job_titles
UNION ALL
SELECT 
    'compliance_frameworks' as table_name,
    COUNT(*) as record_count
FROM compliance_frameworks
UNION ALL
SELECT 
    'risk_categories' as table_name,
    COUNT(*) as record_count
FROM risk_categories
UNION ALL
SELECT 
    'incident_types' as table_name,
    COUNT(*) as record_count
FROM incident_types;

-- ============================================================================
-- SCRIPT CONCLUÍDO!
-- ============================================================================
-- ✅ Todas as tabelas para dropdowns extensíveis foram criadas
-- ✅ Políticas RLS implementadas para segurança multi-tenant
-- ✅ Dados iniciais inseridos para todos os tenants
-- ✅ Índices criados para performance
-- ✅ Triggers configurados para updated_at
-- 
-- 🎯 Próximos passos:
-- 1. Testar os dropdowns extensíveis na aplicação
-- 2. Verificar se os hooks estão funcionando
-- 3. Testar a funcionalidade "Adicionar Novo"
-- ============================================================================