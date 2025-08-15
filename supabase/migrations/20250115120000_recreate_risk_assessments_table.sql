-- Recriar tabela risk_assessments baseada nos formulários da aplicação
-- Análise dos formulários mostra que precisamos de campos específicos

-- 1. Remover tabela existente se houver problemas de constraint
DROP TABLE IF EXISTS public.risk_assessments CASCADE;

-- 2. Criar tabela risk_assessments com estrutura correta baseada nos formulários
CREATE TABLE public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
    
    -- Campos básicos (NewRiskManagementPage.tsx)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    executive_summary TEXT,
    technical_details TEXT,
    risk_category VARCHAR(100) NOT NULL,
    
    -- Avaliação de risco (formulários usam 1-5 para NewRisk e 1-10 para RiskManagement)
    -- Vamos padronizar para 1-5 conforme NewRiskManagementPage.tsx
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    impact_score INTEGER NOT NULL CHECK (impact_score >= 1 AND impact_score <= 5),
    likelihood_score INTEGER NOT NULL CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
    
    -- Score calculado automaticamente
    risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
    
    -- Nível de risco calculado baseado no score
    risk_level VARCHAR(20) NOT NULL DEFAULT 'Médio',
    
    -- Status e gestão
    status VARCHAR(50) NOT NULL DEFAULT 'Identificado',
    treatment_type VARCHAR(50) DEFAULT 'Mitigar',
    
    -- Responsáveis (assigned_to deve ser TEXT para nomes)
    owner_id UUID,
    assigned_to TEXT, -- Campo TEXT para aceitar nomes como "Marcio Borba"
    created_by UUID,
    
    -- Datas
    due_date TIMESTAMPTZ,
    identified_date TIMESTAMPTZ DEFAULT NOW(),
    last_review_date TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    
    -- Campos de controle
    severity VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    
    -- Dados estruturados para análise avançada
    analysis_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX idx_risk_assessments_tenant_id ON public.risk_assessments(tenant_id);
CREATE INDEX idx_risk_assessments_status ON public.risk_assessments(status);
CREATE INDEX idx_risk_assessments_risk_level ON public.risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_category ON public.risk_assessments(risk_category);
CREATE INDEX idx_risk_assessments_created_at ON public.risk_assessments(created_at);
CREATE INDEX idx_risk_assessments_due_date ON public.risk_assessments(due_date);
CREATE INDEX idx_risk_assessments_analysis_data ON public.risk_assessments USING gin (analysis_data);

-- 4. Habilitar RLS
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para multi-tenancy
CREATE POLICY "Users can view risks from their tenant" 
ON public.risk_assessments FOR SELECT 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create risks in their tenant" 
ON public.risk_assessments FOR INSERT 
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update risks from their tenant" 
ON public.risk_assessments FOR UPDATE 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete risks from their tenant" 
ON public.risk_assessments FOR DELETE 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- 6. Criar função para atualizar risk_level automaticamente
CREATE OR REPLACE FUNCTION update_risk_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular nível de risco baseado no score (probability * impact)
    CASE 
        WHEN NEW.risk_score >= 20 THEN NEW.risk_level := 'Muito Alto';
        WHEN NEW.risk_score >= 15 THEN NEW.risk_level := 'Alto';
        WHEN NEW.risk_score >= 8 THEN NEW.risk_level := 'Médio';
        WHEN NEW.risk_score >= 4 THEN NEW.risk_level := 'Baixo';
        ELSE NEW.risk_level := 'Muito Baixo';
    END CASE;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar risk_level e updated_at
CREATE TRIGGER update_risk_assessments_trigger
    BEFORE INSERT OR UPDATE ON public.risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_risk_level();

-- 8. Recriar tabelas relacionadas se necessário
CREATE TABLE IF NOT EXISTS public.risk_action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
    risk_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
    treatment_type VARCHAR(50) NOT NULL DEFAULT 'Mitigar',
    description TEXT,
    target_date TIMESTAMPTZ,
    budget DECIMAL(15,2),
    approved_by UUID,
    approval_date TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.risk_action_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
    action_plan_id UUID NOT NULL REFERENCES public.risk_action_plans(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    responsible_person TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'TBD',
    priority VARCHAR(20) DEFAULT 'Média',
    evidence_url TEXT,
    evidence_description TEXT,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.risk_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
    risk_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    person_email TEXT NOT NULL,
    communication_date TIMESTAMPTZ DEFAULT NOW(),
    decision VARCHAR(50),
    justification TEXT,
    notified_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Habilitar RLS nas tabelas relacionadas
ALTER TABLE public.risk_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_action_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_communications ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas RLS para tabelas relacionadas
-- Políticas para risk_action_plans
CREATE POLICY "Users can manage action plans from their tenant" 
ON public.risk_action_plans FOR ALL 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Políticas para risk_action_activities
CREATE POLICY "Users can manage activities from their tenant" 
ON public.risk_action_activities FOR ALL 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Políticas para risk_communications
CREATE POLICY "Users can manage communications from their tenant" 
ON public.risk_communications FOR ALL 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- 11. Criar índices para tabelas relacionadas
CREATE INDEX idx_risk_action_plans_tenant_id ON public.risk_action_plans(tenant_id);
CREATE INDEX idx_risk_action_plans_risk_id ON public.risk_action_plans(risk_id);

CREATE INDEX idx_risk_action_activities_tenant_id ON public.risk_action_activities(tenant_id);
CREATE INDEX idx_risk_action_activities_action_plan_id ON public.risk_action_activities(action_plan_id);
CREATE INDEX idx_risk_action_activities_deadline ON public.risk_action_activities(deadline);

CREATE INDEX idx_risk_communications_tenant_id ON public.risk_communications(tenant_id);
CREATE INDEX idx_risk_communications_risk_id ON public.risk_communications(risk_id);

-- 12. Comentários para documentação
COMMENT ON TABLE public.risk_assessments IS 'Tabela principal de avaliações de risco com suporte multi-tenant';
COMMENT ON COLUMN public.risk_assessments.tenant_id IS 'ID do tenant para isolamento de dados';
COMMENT ON COLUMN public.risk_assessments.assigned_to IS 'Nome da pessoa responsável (texto livre)';
COMMENT ON COLUMN public.risk_assessments.probability IS 'Probabilidade do risco (1-5)';
COMMENT ON COLUMN public.risk_assessments.impact_score IS 'Score de impacto (1-5)';
COMMENT ON COLUMN public.risk_assessments.likelihood_score IS 'Score de probabilidade (1-5)';
COMMENT ON COLUMN public.risk_assessments.risk_score IS 'Score calculado automaticamente (likelihood * impact)';
COMMENT ON COLUMN public.risk_assessments.risk_level IS 'Nível de risco calculado automaticamente baseado no score';

-- 13. Inserir dados de exemplo para teste (opcional)
INSERT INTO public.risk_assessments (
    title,
    description,
    risk_category,
    probability,
    impact_score,
    likelihood_score,
    assigned_to,
    created_by
) VALUES (
    'Risco de Teste',
    'Risco criado para testar a nova estrutura da tabela',
    'Operacional',
    3,
    3,
    3,
    'Usuário de Teste',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
) ON CONFLICT DO NOTHING;

-- Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
ORDER BY ordinal_position;

RAISE NOTICE 'Tabela risk_assessments recriada com sucesso baseada nos formulários da aplicação!';