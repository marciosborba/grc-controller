-- Corrigir estrutura da tabela risk_assessments para multi-tenancy e campos corretos
-- Baseado nos requisitos: tenant_id obrigatório, assigned_to como TEXT para nomes

-- Primeiro, verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(100),
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    likelihood_score INTEGER CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
    risk_level VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Identificado',
    assigned_to TEXT, -- Campo para nome da pessoa (não UUID)
    due_date TIMESTAMPTZ,
    severity VARCHAR(20) DEFAULT 'medium',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    analysis_data JSONB DEFAULT '{}'
);

-- Adicionar tenant_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.risk_assessments ADD COLUMN tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f';
    END IF;
END $$;

-- Alterar assigned_to para TEXT se for UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'assigned_to' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;
    END IF;
END $$;

-- Remover constraints problemáticos de probability se existirem
DO $$
BEGIN
    -- Remover constraint antigo se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_probability_check'
    ) THEN
        ALTER TABLE public.risk_assessments DROP CONSTRAINT risk_assessments_probability_check;
    END IF;
    
    -- Adicionar constraint correto
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_probability_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_probability_range 
        CHECK (probability >= 1 AND probability <= 5);
    END IF;
END $$;

-- Adicionar constraints para likelihood_score e impact_score se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_likelihood_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_likelihood_range 
        CHECK (likelihood_score >= 1 AND likelihood_score <= 5);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_impact_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_impact_range 
        CHECK (impact_score >= 1 AND impact_score <= 5);
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para multi-tenancy
DROP POLICY IF EXISTS "Users can view risks from their tenant" ON public.risk_assessments;
CREATE POLICY "Users can view risks from their tenant" 
ON public.risk_assessments FOR SELECT 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can create risks in their tenant" ON public.risk_assessments;
CREATE POLICY "Users can create risks in their tenant" 
ON public.risk_assessments FOR INSERT 
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update risks from their tenant" ON public.risk_assessments;
CREATE POLICY "Users can update risks from their tenant" 
ON public.risk_assessments FOR UPDATE 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete risks from their tenant" ON public.risk_assessments;
CREATE POLICY "Users can delete risks from their tenant" 
ON public.risk_assessments FOR DELETE 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_risk_assessments_tenant_id ON public.risk_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON public.risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON public.risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created_at ON public.risk_assessments(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_risk_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_risk_assessments_updated_at_trigger ON public.risk_assessments;
CREATE TRIGGER update_risk_assessments_updated_at_trigger
    BEFORE UPDATE ON public.risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_risk_assessments_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.risk_assessments IS 'Tabela de avaliações de risco com suporte multi-tenant';
COMMENT ON COLUMN public.risk_assessments.tenant_id IS 'ID do tenant para isolamento de dados';
COMMENT ON COLUMN public.risk_assessments.assigned_to IS 'Nome da pessoa responsável (texto livre)';
COMMENT ON COLUMN public.risk_assessments.probability IS 'Probabilidade do risco (1-5)';
COMMENT ON COLUMN public.risk_assessments.likelihood_score IS 'Score de probabilidade (1-5)';
COMMENT ON COLUMN public.risk_assessments.impact_score IS 'Score de impacto (1-5)';
COMMENT ON COLUMN public.risk_assessments.risk_score IS 'Score calculado automaticamente (likelihood * impact)';