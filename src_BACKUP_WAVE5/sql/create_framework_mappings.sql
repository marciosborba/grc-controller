-- Create framework_mappings table
CREATE TABLE IF NOT EXISTS public.framework_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_requirement_id UUID NOT NULL REFERENCES public.requisitos_compliance(id) ON DELETE CASCADE,
    target_requirement_id UUID NOT NULL REFERENCES public.requisitos_compliance(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'equivalent', -- 'equivalent', 'partial', 'related'
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    UNIQUE(source_requirement_id, target_requirement_id)
);

-- Add RLS policies
ALTER TABLE public.framework_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mappings of their tenant" 
    ON public.framework_mappings FOR SELECT 
    USING (tenant_id = (SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid));

CREATE POLICY "Users can insert mappings for their tenant" 
    ON public.framework_mappings FOR INSERT 
    WITH CHECK (tenant_id = (SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid));

CREATE POLICY "Users can update mappings of their tenant" 
    ON public.framework_mappings FOR UPDATE 
    USING (tenant_id = (SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid));

CREATE POLICY "Users can delete mappings of their tenant" 
    ON public.framework_mappings FOR DELETE 
    USING (tenant_id = (SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid));

-- Indexes for performance
CREATE INDEX idx_framework_mappings_source ON public.framework_mappings(source_requirement_id);
CREATE INDEX idx_framework_mappings_target ON public.framework_mappings(target_requirement_id);
CREATE INDEX idx_framework_mappings_tenant ON public.framework_mappings(tenant_id);
