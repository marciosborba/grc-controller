-- Migration: Create Custom Fields Tables
-- Description: Creates tables for storing custom fields definition and values with tenant isolation

-- 1. Table: custom_fields
CREATE TABLE IF NOT EXISTS public.custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'vulnerability', 'application', 'asset', etc.
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'text', 'number', 'date', 'boolean', 'select', etc.
    options JSONB, -- For select/multiselect
    required BOOLEAN DEFAULT false,
    visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    tab VARCHAR(50) DEFAULT 'custom',
    placeholder VARCHAR(255),
    description TEXT,
    validation JSONB, -- { min, max, pattern, message }
    import_mapping JSONB, -- { qualys: 'FIELD', nessus: 'field' }
    metadata JSONB, -- { sectionTitle, sectionSubtitle, etc. }
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Uniqueness constraint: Same field name per entity per tenant
    CONSTRAINT custom_fields_name_tenant_entity_unique UNIQUE (name, tenant_id, entity_type)
);

-- 2. Table: custom_field_values
CREATE TABLE IF NOT EXISTS public.custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- The ID of the vulnerability, asset, etc.
    value JSONB, -- Storing value as JSONB for flexibility (can store strings, numbers, arrays)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Uniqueness constraint: One value per field per entity
    CONSTRAINT custom_field_values_unique UNIQUE (field_id, entity_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_custom_fields_tenant_entity ON public.custom_fields(tenant_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON public.custom_field_values(entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_tenant ON public.custom_field_values(tenant_id);

-- 4. Enable RLS
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for custom_fields

-- Policy: View fields (Users can look at fields of their tenant)
CREATE POLICY "Users can view custom_fields of their tenant" ON public.custom_fields
    FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
    );

-- Policy: Insert fields (Admins only)
CREATE POLICY "Admins can insert custom_fields" ON public.custom_fields
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()
            AND (
                is_platform_admin = true OR 
                (tenant_id = custom_fields.tenant_id AND 'admin' = ANY(roles))
            )
        )
    );

-- Policy: Update fields (Admins only)
CREATE POLICY "Admins can update custom_fields" ON public.custom_fields
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()
            AND (
                is_platform_admin = true OR 
                (tenant_id = custom_fields.tenant_id AND 'admin' = ANY(roles))
            )
        )
    );

-- Policy: Delete fields (Admins only)
CREATE POLICY "Admins can delete custom_fields" ON public.custom_fields
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()
            AND (
                is_platform_admin = true OR 
                (tenant_id = custom_fields.tenant_id AND 'admin' = ANY(roles))
            )
        )
    );

-- 6. RLS Policies for custom_field_values

-- Policy: View values
CREATE POLICY "Users can view custom_field_values of their tenant" ON public.custom_field_values
    FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
    );

-- Policy: Insert/Update values (Users can edit values if they have access to the entity - simplified to tenant access for now)
-- Ideally this should match the permission to edit the entity (vulnerability, etc.)
CREATE POLICY "Users can manage custom_field_values of their tenant" ON public.custom_field_values
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
    );

-- 7. Triggers for updated_at
CREATE TRIGGER update_custom_fields_updated_at
    BEFORE UPDATE ON public.custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at
    BEFORE UPDATE ON public.custom_field_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
