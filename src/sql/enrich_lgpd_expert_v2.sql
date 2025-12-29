-- Expert Enrichment for LGPD v2 (Training & Retention)

DO $$
DECLARE
    v_lgpd_id UUID;
    v_admin_id UUID;
    v_gov UUID;
    v_sec UUID;
    v_gov_train UUID;
    v_gov_ret UUID;
BEGIN
    SELECT id INTO v_lgpd_id FROM frameworks_compliance WHERE codigo = 'LGPD' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- Get Parent IDs created in previous step
    SELECT id INTO v_gov FROM requisitos_compliance WHERE framework_id = v_lgpd_id AND codigo = 'LGPD.GOV' LIMIT 1;
    SELECT id INTO v_sec FROM requisitos_compliance WHERE framework_id = v_lgpd_id AND codigo = 'LGPD.SEC' LIMIT 1;

    IF v_gov IS NOT NULL THEN
        -- Add Training to Governance
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.GOV.4', 'Conscientização e Treinamento', 'Programa de aculturação em privacidade.', 'Logs de Treinamento.', 2, 'ativo', v_gov, v_admin_id, v_admin_id) RETURNING id INTO v_gov_train;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.GOV.4.1', 'Treinamento de Onboarding', 'Treinamento obrigatório para novos colaboradores.', 'Certificado de conclusão.', 3, 'ativo', v_gov_train, v_admin_id, v_admin_id);
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.GOV.4.2', 'Treinamento Específico', 'Treinamento focado para áreas que tratam dados sensíveis (RH, Saúde).', 'Material específico.', 3, 'ativo', v_gov_train, v_admin_id, v_admin_id);

        -- Add Data Retention to Governance (or Security, fitting in Gov/Cycle)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.GOV.5', 'Ciclo de Vida e Retenção', 'Gestão do prazo de armazenamento.', 'Tabela de Temporalidade.', 2, 'ativo', v_gov, v_admin_id, v_admin_id) RETURNING id INTO v_gov_ret;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.GOV.5.1', 'Descarte Seguro', 'Procedimentos para eliminação segura de dados após o fim da finalidade.', 'Certificado de destruição.', 3, 'ativo', v_gov_ret, v_admin_id, v_admin_id);
    END IF;

END $$;
