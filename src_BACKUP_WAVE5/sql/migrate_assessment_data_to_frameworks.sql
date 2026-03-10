-- Migration Script: Enrich Compliance Frameworks with Assessment Data
-- Mapps assessment_domains and assessment_controls to requisitos_compliance

DO $$
DECLARE
    -- Framework Mapping pairs (Compliance Code, Assessment Code)
    rec RECORD;
    v_comp_fw_id UUID;
    v_assess_fw_id UUID;
    v_domain RECORD;
    v_control RECORD;
    v_new_domain_id UUID;
    v_admin_id UUID;
BEGIN
    -- Get an admin ID for auditing
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- Iterate over the frameworks we want to enrich
    FOR rec IN 
        SELECT * FROM (VALUES 
            ('COBIT-2019', 'COBIT-2019'),
            ('NIST-CSF-2.0', 'NIST-CSF-2.0'),
            ('ISO27001', 'ISO-27001'), -- Assessment uses ISO-27001, Compliance uses ISO27001
            ('SOX-2002', 'SOX-ITGC'),  -- Mapping SOX-ITGC to SOX-2002
            ('LGPD', 'LGPD-BR')        -- Mapping LGPD-BR to LGPD
        ) AS t(comp_code, assess_code)
    LOOP
        RAISE NOTICE 'Processing Framework: % -> %', rec.comp_code, rec.assess_code;

        -- 1. Get IDs
        SELECT id INTO v_comp_fw_id FROM frameworks_compliance WHERE codigo = rec.comp_code LIMIT 1;
        SELECT id INTO v_assess_fw_id FROM assessment_frameworks WHERE codigo = rec.assess_code LIMIT 1;

        IF v_comp_fw_id IS NOT NULL AND v_assess_fw_id IS NOT NULL THEN
            
            -- 2. CLEAR existing data for this framework to avoid duplicates/mess
            DELETE FROM requisitos_compliance WHERE framework_id = v_comp_fw_id;
            
            -- 3. MIGRATE DOMAINS (Level 1)
            FOR v_domain IN SELECT * FROM assessment_domains WHERE framework_id = v_assess_fw_id ORDER BY ordem LOOP
                
                INSERT INTO requisitos_compliance (
                    framework_id,
                    tenant_id,      -- Keep NULL for standard
                    codigo,
                    titulo,
                    descricao,
                    criterios_conformidade,
                    nivel,
                    ordem_apresentacao,
                    status,
                    created_by,
                    updated_by,
                    requisito_pai
                ) VALUES (
                    v_comp_fw_id,
                    NULL, -- Standard Library
                    v_domain.codigo,
                    v_domain.nome,
                    COALESCE(v_domain.descricao, v_domain.nome),
                    'Compliance com Domínio: ' || v_domain.nome, -- Generic criteria if missing
                    1,
                    v_domain.ordem,
                    'ativo',
                    v_admin_id,
                    v_admin_id,
                    NULL
                ) RETURNING id INTO v_new_domain_id;

                -- 4. MIGRATE CONTROLS (Level 2) attached to this Domain
                FOR v_control IN SELECT * FROM assessment_controls WHERE domain_id = v_domain.id ORDER BY ordem LOOP
                    
                    INSERT INTO requisitos_compliance (
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
                        requisito_pai
                    ) VALUES (
                        v_comp_fw_id,
                        NULL,
                        v_control.codigo,
                        v_control.titulo,
                        COALESCE(v_control.descricao, v_control.titulo),
                        COALESCE(v_control.objetivo, 'Verificar implementação do controle ' || v_control.titulo),
                        2,
                        v_control.ordem,
                        'ativo',
                        v_admin_id,
                        v_admin_id,
                        v_new_domain_id -- Link to parent Domain
                    );
                    
                END LOOP; -- End Controls Loop

            END LOOP; -- End Domains Loop

            RAISE NOTICE 'Successfully migrated data for %', rec.comp_code;
        
        ELSE
            RAISE NOTICE 'Skipping %: Framework not found in one or both tables.', rec.comp_code;
        END IF;

    END LOOP; -- End Frameworks Loop

END $$;
