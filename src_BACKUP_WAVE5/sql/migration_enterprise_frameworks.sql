-- Migration: Enterprise Framework Architecture

-- 1. Modify frameworks_compliance table
ALTER TABLE public.frameworks_compliance 
ADD COLUMN IF NOT EXISTS is_standard BOOLEAN DEFAULT FALSE;

-- Make tenant_id nullable to support global frameworks
ALTER TABLE public.frameworks_compliance 
ALTER COLUMN tenant_id DROP NOT NULL;

-- Ensure consistency: Standard frameworks must have NULL tenant_id, Custom must have tenant_id
-- We drop existing check if it exists to avoid errors on potential re-runs
ALTER TABLE public.frameworks_compliance DROP CONSTRAINT IF EXISTS check_standard_tenant_consistency;

ALTER TABLE public.frameworks_compliance 
ADD CONSTRAINT check_standard_tenant_consistency 
CHECK (
    (is_standard = true AND tenant_id IS NULL) OR 
    (is_standard = false AND tenant_id IS NOT NULL)
);

-- 2. Update RLS Policies
-- Allow everyone to READ standard frameworks
DROP POLICY IF EXISTS "frameworks_compliance_tenant_policy" ON public.frameworks_compliance;

CREATE POLICY "frameworks_compliance_select_policy" ON public.frameworks_compliance
FOR SELECT USING (
    tenant_id IN (
        SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()
    ) OR 
    (is_standard = true AND tenant_id IS NULL)
);

CREATE POLICY "frameworks_compliance_insert_policy" ON public.frameworks_compliance
FOR INSERT WITH CHECK (
    tenant_id IN (
        SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()
    )
);

CREATE POLICY "frameworks_compliance_update_policy" ON public.frameworks_compliance
FOR UPDATE USING (
    tenant_id IN (
        SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()
    )
);

CREATE POLICY "frameworks_compliance_delete_policy" ON public.frameworks_compliance
FOR DELETE USING (
    tenant_id IN (
        SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()
    )
);

-- 3. Create Clone Function
CREATE OR REPLACE FUNCTION public.clone_framework(
    p_framework_id UUID,
    p_target_tenant_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_framework_id UUID;
    v_source_framework RECORD;
    v_req RECORD;
    v_id_map JSONB := '{}'::jsonb;
    v_new_req_id UUID;
BEGIN
    -- 1. Get Source Framework
    SELECT * INTO v_source_framework 
    FROM public.frameworks_compliance 
    WHERE id = p_framework_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Framework not found';
    END IF;

    -- 2. Clone Framework Header
    INSERT INTO public.frameworks_compliance (
        tenant_id,
        codigo,
        nome,
        descricao,
        tipo,
        origem,
        versao,
        categoria,
        subcategoria,
        nivel_aplicabilidade,
        jurisdicao,
        status,
        is_standard,
        created_by,
        updated_by
    ) VALUES (
        p_target_tenant_id,
        v_source_framework.codigo, -- Keep code or append suffix? usually keep same code for mapping
        v_source_framework.nome || ' (Clone)',
        v_source_framework.descricao,
        v_source_framework.tipo,
        v_source_framework.origem,
        v_source_framework.versao,
        v_source_framework.categoria,
        v_source_framework.subcategoria,
        v_source_framework.nivel_aplicabilidade,
        v_source_framework.jurisdicao,
        'ativo', -- Reset status to active
        FALSE,   -- Clones are never standard
        p_user_id,
        p_user_id
    ) RETURNING id INTO v_new_framework_id;

    -- 3. Clone Requirements (First Pass: Create all entries)
    -- We use a cursor order by codigo or hierarchy to try to maintain order, but ID mapping is crucial
    FOR v_req IN SELECT * FROM public.requisitos_compliance WHERE framework_id = p_framework_id LOOP
        
        INSERT INTO public.requisitos_compliance (
            framework_id,
            tenant_id,
            codigo,
            titulo,
            descricao,
            criterios_conformidade,
            nivel,
            ordem_apresentacao,
            status,
            created_by,
            updated_by,
            -- We temporarily skip requisito_pai, we link it in second pass
            requisito_pai
        ) VALUES (
            v_new_framework_id,
            p_target_tenant_id,
            v_req.codigo,
            v_req.titulo,
            v_req.descricao,
            v_req.criterios_conformidade,
            v_req.nivel,
            v_req.ordem_apresentacao,
            'ativo',
            p_user_id,
            p_user_id,
            NULL -- Placeholder
        ) RETURNING id INTO v_new_req_id;

        -- Map old ID to new ID
        v_id_map := jsonb_set(v_id_map, ARRAY[v_req.id::text], to_jsonb(v_new_req_id));
    END LOOP;

    -- 4. Second Pass: Link Hierarchy (requisito_pai)
    -- Iterate again over source requirements that have a parent
    FOR v_req IN SELECT * FROM public.requisitos_compliance WHERE framework_id = p_framework_id AND requisito_pai IS NOT NULL LOOP
        -- Find the NEW ID for this requirement
        DECLARE 
            v_new_child_id UUID;
            v_new_parent_id UUID;
        BEGIN
            v_new_child_id := (v_id_map->>v_req.id::text)::UUID;
            v_new_parent_id := (v_id_map->>v_req.requisito_pai::text)::UUID;
            
            IF v_new_child_id IS NOT NULL AND v_new_parent_id IS NOT NULL THEN
                UPDATE public.requisitos_compliance
                SET requisito_pai = v_new_parent_id
                WHERE id = v_new_child_id;
            END IF;
        END;
    END LOOP;

    RETURN v_new_framework_id;
END;
$$;
