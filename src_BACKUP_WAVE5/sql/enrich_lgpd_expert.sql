-- Expert Enrichment for LGPD (Operational Framework)
-- Structure: Domain (L1) -> Program Area (L2) -> Operational Control (L3)

DO $$
DECLARE
    v_lgpd_id UUID;
    v_admin_id UUID;
    
    -- Domains (L1)
    v_gov UUID; -- Governanca
    v_dsr UUID; -- Direitos
    v_sec UUID; -- Seguranca e Incidentes
    v_vendor UUID; -- Terceiros
    v_pbd UUID; -- Privacy by Design

    -- L2 Areas
    v_gov_dpo UUID; v_gov_ropa UUID; v_gov_dpia UUID;
    v_dsr_portal UUID; v_dsr_consent UUID;
    v_sec_measures UUID; v_sec_incidents UUID;
    v_vendor_mgmt UUID; v_intl UUID;
    v_pbd_sdlc UUID;

BEGIN
    SELECT id INTO v_lgpd_id FROM frameworks_compliance WHERE codigo = 'LGPD' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_lgpd_id;

    IF v_lgpd_id IS NOT NULL THEN
        
        -- UPDATE METADATA
        UPDATE frameworks_compliance 
        SET nome = 'LGPD Operational Framework',
            descricao = 'Framework operacional para conformidade com a Lei Geral de Proteção de Dados (13.709/2018), focado em controles práticos.'
        WHERE id = v_lgpd_id;

        -------------------------------------------------------------
        -- DOMAIN 1: GOVERNANÇA DE PRIVACIDADE
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.GOV', 'Governança de Privacidade', 'Estruturas de gestão e responsabilidade.', 'Programa implementado.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_gov;

            -- DPO
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.GOV.1', 'Encarregado (DPO)', 'Nomeação e atuação do DPO.', 'DPO nomeado.', 2, 'ativo', v_gov, v_admin_id, v_admin_id) RETURNING id INTO v_gov_dpo;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.GOV.1.1', 'Nomeação Formal', 'Identidade e informações de contato do DPO divulgadas publicamente.', 'Site com contato do DPO.', 3, 'ativo', v_gov_dpo, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.GOV.1.2', 'Independência e Recursos', 'DPO possui autonomia e recursos para desempenhar as funções.', 'Orçamento e acesso à alta gestão.', 3, 'ativo', v_gov_dpo, v_admin_id, v_admin_id);

            -- RoPA
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.GOV.2', 'Registro de Operações (RoPA)', 'Mapeamento do ciclo de vida dos dados.', 'Inventário de Dados.', 2, 'ativo', v_gov, v_admin_id, v_admin_id) RETURNING id INTO v_gov_ropa;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.GOV.2.1', 'Inventário de Dados', 'Registro de todas as atividades de tratamento de dados pessoais (Art 37).', 'Data Mapping atualizado.', 3, 'ativo', v_gov_ropa, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.GOV.2.2', 'Bases Legais', 'Atribuição de base legal para cada tratamento.', 'Justificativa legal documentada.', 3, 'ativo', v_gov_ropa, v_admin_id, v_admin_id);

            -- RIPD/DPIA
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.GOV.3', 'Relatório de Impacto (RIPD)', 'Avaliação de riscos à privacidade.', 'Matriz de Risco de Privacidade.', 2, 'ativo', v_gov, v_admin_id, v_admin_id) RETURNING id INTO v_gov_dpia;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.GOV.3.1', 'Metodologia de RIPD', 'Processo definido para realizar RIPD em projetos de alto risco.', 'Política de RIPD.', 3, 'ativo', v_gov_dpia, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DOMAIN 2: DIREITOS DOS TITULARES (DSR)
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.DSR', 'Direitos dos Titulares', 'Atendimento às requisições.', 'Portal de Privacidade.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_dsr;

            -- Canal de Atendimento
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.DSR.1', 'Gestão de Requisições', 'Canal para exercício de direitos.', 'Workflow de DSR.', 2, 'ativo', v_dsr, v_admin_id, v_admin_id) RETURNING id INTO v_dsr_portal;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.DSR.1.1', 'Canal de Fácil Acesso', 'Meio facilitado para o titular solicitar direitos (Art. 18).', 'Formulário web ou email dedicado.', 3, 'ativo', v_dsr_portal, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.DSR.1.2', 'Prazo de Resposta', 'Monitoramento do prazo de 15 dias para respostas completas.', 'Controle de SLA.', 3, 'ativo', v_dsr_portal, v_admin_id, v_admin_id);

            -- Consentimento
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.DSR.2', 'Gestão de Consentimento', 'Coleta e revogação válida.', 'CMP (Consent Management Platform).', 2, 'ativo', v_dsr, v_admin_id, v_admin_id) RETURNING id INTO v_dsr_consent;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.DSR.2.1', 'Consentimento Granular', 'Opção de opt-in livre, informado e inequívoco.', 'Checkboxes desmarcados por padrão.', 3, 'ativo', v_dsr_consent, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.DSR.2.2', 'Cookies e Rastreadores', 'Aviso e gestão de cookies no site.', 'Banner de cookies conforme ANPD.', 3, 'ativo', v_dsr_consent, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DOMAIN 3: SEGURANÇA E INCIDENTES
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.SEC', 'Segurança da Informação', 'Medidas técnicas e administrativas (Art. 46).', 'ISO 27001 controls.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec;

            -- Medidas Técnicas
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.SEC.1', 'Medidas Técnicas', 'Controles de proteção de dados.', 'Criptografia e Acesso.', 2, 'ativo', v_sec, v_admin_id, v_admin_id) RETURNING id INTO v_sec_measures;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.SEC.1.1', 'Controle de Acesso', 'Acesso aos dados pessoais restrito a pessoal autorizado.', 'RBAC.', 3, 'ativo', v_sec_measures, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.SEC.1.2', 'Anonimização/Pseudonimização', 'Uso de técnicas para desvincular dados do titular.', 'Técnicas de mascaramento.', 3, 'ativo', v_sec_measures, v_admin_id, v_admin_id);

            -- Incidentes
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.SEC.2', 'Gestão de Incidentes', 'Detecção e notificação de violações (Art. 48).', 'Plano de Resposta a Incidentes.', 2, 'ativo', v_sec, v_admin_id, v_admin_id) RETURNING id INTO v_sec_incidents;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.SEC.2.1', 'Notificação à ANPD', 'Procedimento para notificar a autoridade em prazo razoável (2 dias úteis rec.).', 'Draft de notificação preparado.', 3, 'ativo', v_sec_incidents, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DOMAIN 4: GESTÃO DE TERCEIROS
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.EXT', 'Transferência e Terceiros', 'Cadeia de suprimentos.', 'Contratos.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_vendor;

            -- Operadores
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.EXT.1', 'Gestão de Operadores', 'Controle sobre quem trata dados em nome da empresa.', 'Vendor Risk Mgmt.', 2, 'ativo', v_vendor, v_admin_id, v_admin_id) RETURNING id INTO v_vendor_mgmt;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.EXT.1.1', 'Cláusulas Contratuais', 'Contratos com cláusulas específicas de proteção de dados e auditoria.', 'Addendum de Proteção de Dados (DPA).', 3, 'ativo', v_vendor_mgmt, v_admin_id, v_admin_id);

            -- Transferencia Intl
             INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.EXT.2', 'Transferência Internacional', 'Legalidade de dados fora do país (Art. 33).', 'SCCs.', 2, 'ativo', v_vendor, v_admin_id, v_admin_id) RETURNING id INTO v_intl;

        -------------------------------------------------------------
        -- DOMAIN 5: PRIVACY BY DESIGN
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_lgpd_id, 'LGPD.PBD', 'Privacy by Design', 'Privacidade desde a concepção.', 'PbD.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_pbd;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_lgpd_id, 'LGPD.PBD.1', 'Ciclo de Desenvolvimento', 'Inclusão de requisitos de privacidade em novos produtos.', 'Checklist de PbD.', 2, 'ativo', v_pbd, v_admin_id, v_admin_id) RETURNING id INTO v_pbd_sdlc;
            
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_lgpd_id, 'LGPD.PBD.1.1', 'Minimização', 'Coletar apenas os dados estritamente necessários.', 'Revisão de campos de coleta.', 3, 'ativo', v_pbd_sdlc, v_admin_id, v_admin_id);

    END IF;

END $$;
