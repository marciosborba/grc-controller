-- Create Processos table
CREATE TABLE IF NOT EXISTS public.processos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel UUID REFERENCES auth.users(id),
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for Processos
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users based on tenant_id" ON public.processos
    FOR ALL
    USING (tenant_id = (select auth.jwt() ->> 'tenant_id')::uuid);

-- Create Sistemas table
CREATE TABLE IF NOT EXISTS public.sistemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    fornecedor VARCHAR(255),
    versao VARCHAR(50),
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for Sistemas
ALTER TABLE public.sistemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users based on tenant_id" ON public.sistemas
    FOR ALL
    USING (tenant_id = (select auth.jwt() ->> 'tenant_id')::uuid);

-- Grant permissions (if needed, usually authenticated role has access by default in Supabase if policies exist)
GRANT ALL ON public.processos TO authenticated;
GRANT ALL ON public.sistemas TO authenticated;
GRANT ALL ON public.processos TO service_role;
GRANT ALL ON public.sistemas TO service_role;
