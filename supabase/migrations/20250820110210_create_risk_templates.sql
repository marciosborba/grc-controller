-- Schema para Templates de Riscos na Biblioteca - PostgreSQL/Supabase
-- Migração criada automaticamente

-- Criar tipos ENUM para PostgreSQL
CREATE TYPE risk_level_enum AS ENUM ('Muito Alto', 'Alto', 'Médio', 'Baixo', 'Muito Baixo');
CREATE TYPE template_status_enum AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE audit_action_enum AS ENUM ('create', 'update', 'delete', 'activate', 'deactivate');

-- Tabela principal de templates de riscos
CREATE TABLE IF NOT EXISTS risk_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    risk_level risk_level_enum NOT NULL,
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
    methodology VARCHAR(255) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    alex_risk_suggested BOOLEAN DEFAULT FALSE,
    total_ratings INTEGER DEFAULT 0,
    status template_status_enum DEFAULT 'active'
);

-- Tabela para controles dos templates
CREATE TABLE IF NOT EXISTS risk_template_controls (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    control_description TEXT NOT NULL,
    control_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (template_id) REFERENCES risk_templates(id) ON DELETE CASCADE
);

-- Tabela para KRIs dos templates
CREATE TABLE IF NOT EXISTS risk_template_kris (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    kri_description TEXT NOT NULL,
    kri_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (template_id) REFERENCES risk_templates(id) ON DELETE CASCADE
);

-- Tabela para tags dos templates
CREATE TABLE IF NOT EXISTS risk_template_tags (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (template_id) REFERENCES risk_templates(id) ON DELETE CASCADE
);

-- Tabela para avaliações dos usuários
CREATE TABLE IF NOT EXISTS risk_template_ratings (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (template_id) REFERENCES risk_templates(id) ON DELETE CASCADE,
    UNIQUE (template_id, user_id)
);

-- Tabela para auditoria de mudanças
CREATE TABLE IF NOT EXISTS risk_template_audit (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    action audit_action_enum NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_risk_templates_category ON risk_templates (category);
CREATE INDEX IF NOT EXISTS idx_risk_templates_industry ON risk_templates (industry);
CREATE INDEX IF NOT EXISTS idx_risk_templates_risk_level ON risk_templates (risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_templates_is_popular ON risk_templates (is_popular);
CREATE INDEX IF NOT EXISTS idx_risk_templates_status ON risk_templates (status);
CREATE INDEX IF NOT EXISTS idx_risk_templates_created_at ON risk_templates (created_at);
CREATE INDEX IF NOT EXISTS idx_risk_templates_rating ON risk_templates (rating);
CREATE INDEX IF NOT EXISTS idx_risk_templates_alex_suggested ON risk_templates (alex_risk_suggested);

CREATE INDEX IF NOT EXISTS idx_risk_template_controls_template_id ON risk_template_controls (template_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_kris_template_id ON risk_template_kris (template_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_tags_template_id ON risk_template_tags (template_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_tags_tag ON risk_template_tags (tag);
CREATE INDEX IF NOT EXISTS idx_risk_template_ratings_template_id ON risk_template_ratings (template_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_ratings_user_id ON risk_template_ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_audit_template_id ON risk_template_audit (template_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_audit_action ON risk_template_audit (action);
CREATE INDEX IF NOT EXISTS idx_risk_template_audit_changed_by ON risk_template_audit (changed_by);
CREATE INDEX IF NOT EXISTS idx_risk_template_audit_created_at ON risk_template_audit (created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela risk_templates
CREATE TRIGGER update_risk_templates_updated_at 
    BEFORE UPDATE ON risk_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE risk_templates IS 'Templates de riscos para biblioteca com controles e KRIs';
COMMENT ON TABLE risk_template_controls IS 'Controles associados aos templates de riscos';
COMMENT ON TABLE risk_template_kris IS 'Key Risk Indicators (KRIs) dos templates';
COMMENT ON TABLE risk_template_tags IS 'Tags para categorização e busca dos templates';
COMMENT ON TABLE risk_template_ratings IS 'Avaliações dos usuários para os templates';
COMMENT ON TABLE risk_template_audit IS 'Auditoria de mudanças nos templates';

-- Comentários nas colunas principais
COMMENT ON COLUMN risk_templates.rating IS 'Rating médio calculado das avaliações dos usuários (0.0-5.0)';
COMMENT ON COLUMN risk_templates.usage_count IS 'Número de vezes que o template foi usado';
COMMENT ON COLUMN risk_templates.is_popular IS 'Flag automática baseada em usage_count e rating';
COMMENT ON COLUMN risk_templates.alex_risk_suggested IS 'Template sugerido pela IA Alex Risk';
COMMENT ON COLUMN risk_templates.total_ratings IS 'Número total de avaliações recebidas';