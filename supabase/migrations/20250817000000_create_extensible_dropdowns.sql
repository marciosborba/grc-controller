-- ============================================================================
-- CRIAÇÃO DAS TABELAS PARA DROPDOWNS EXTENSÍVEIS
-- ============================================================================
-- Migração para criar tabelas de dropdowns extensíveis

-- 1. Tabela de Departamentos
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT departments_name_tenant_unique UNIQUE (name, tenant_id)
);

-- Índices para departments
CREATE INDEX IF NOT EXISTS idx_departments_tenant_active ON departments(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- RLS para departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para departments
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

-- 2. Tabela de Cargos/Job Titles
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
  
  -- Constraints
  CONSTRAINT job_titles_title_tenant_unique UNIQUE (title, tenant_id)
);

-- Índices para job_titles
CREATE INDEX IF NOT EXISTS idx_job_titles_tenant_active ON job_titles(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_titles_department ON job_titles(department_id);
CREATE INDEX IF NOT EXISTS idx_job_titles_title ON job_titles(title);

-- RLS para job_titles
ALTER TABLE job_titles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para job_titles
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

-- 3. Tabela de Frameworks de Compliance
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
  
  -- Constraints
  CONSTRAINT frameworks_name_version_tenant_unique UNIQUE (name, version, tenant_id)
);

-- Índices para compliance_frameworks
CREATE INDEX IF NOT EXISTS idx_frameworks_tenant_active ON compliance_frameworks(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_frameworks_name ON compliance_frameworks(name);

-- RLS para compliance_frameworks
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para compliance_frameworks
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

-- 4. Tabela de Categorias de Risco
CREATE TABLE IF NOT EXISTS risk_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT risk_categories_name_tenant_unique UNIQUE (name, tenant_id)
);

-- Índices para risk_categories
CREATE INDEX IF NOT EXISTS idx_risk_categories_tenant_active ON risk_categories(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_risk_categories_name ON risk_categories(name);

-- RLS para risk_categories
ALTER TABLE risk_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para risk_categories
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

-- 5. Tabela de Tipos de Incidente
CREATE TABLE IF NOT EXISTS incident_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity_default VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT incident_types_name_tenant_unique UNIQUE (name, tenant_id)
);

-- Índices para incident_types
CREATE INDEX IF NOT EXISTS idx_incident_types_tenant_active ON incident_types(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_incident_types_name ON incident_types(name);

-- RLS para incident_types
ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para incident_types
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
-- TRIGGERS PARA UPDATED_AT
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