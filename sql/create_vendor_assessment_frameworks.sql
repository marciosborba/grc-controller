CREATE TABLE IF NOT EXISTS public.vendor_assessment_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    framework_type TEXT NOT NULL,
    industry TEXT,
    version TEXT,
    is_active BOOLEAN DEFAULT true,
    questions JSONB DEFAULT '[]'::jsonb,
    scoring_model JSONB,
    alex_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID,
    updated_by UUID
);

-- Habilitar RLS
ALTER TABLE public.vendor_assessment_frameworks ENABLE ROW LEVEL SECURITY;

-- Evitar duplicados de politicas se rodar de novo
DO $$
BEGIN
    DROP POLICY IF EXISTS "tenant_isolation_vendor_frameworks" ON public.vendor_assessment_frameworks;
    DROP POLICY IF EXISTS "Users can view frameworks" ON public.vendor_assessment_frameworks;
    DROP POLICY IF EXISTS "Users can insert frameworks" ON public.vendor_assessment_frameworks;
    DROP POLICY IF EXISTS "Users can update frameworks" ON public.vendor_assessment_frameworks;
    DROP POLICY IF EXISTS "Users can delete frameworks" ON public.vendor_assessment_frameworks;
END
$$;

-- Usar o padrão que encontrei em outras tabelas do projeto
CREATE POLICY "tenant_isolation_vendor_frameworks" ON public.vendor_assessment_frameworks
    FOR ALL TO authenticated
    USING (
         tenant_id = current_setting('app.current_tenant', true)::uuid 
         OR tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Criar os frameworks de QA para testes (se nao existirem)
INSERT INTO public.vendor_assessment_frameworks 
(id, tenant_id, name, description, framework_type, is_active)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Framework ISO 27001 (Teste QA)', 'Questionário padrão baseado nos controles da ISO 27001 para avaliação de segurança da informação de fornecedores.', 'iso27001', true
WHERE NOT EXISTS (SELECT 1 FROM public.vendor_assessment_frameworks WHERE name = 'Framework ISO 27001 (Teste QA)');

INSERT INTO public.vendor_assessment_frameworks 
(id, tenant_id, name, description, framework_type, is_active)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Framework ISO 27701 (Teste QA)', 'Questionário padrão baseado nos controles da ISO 27701 para avaliação de privacidade e proteção de dados de fornecedores.', 'iso27701', true
WHERE NOT EXISTS (SELECT 1 FROM public.vendor_assessment_frameworks WHERE name = 'Framework ISO 27701 (Teste QA)');
