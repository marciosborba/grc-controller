-- Expert Enrichment for COSO 2013 (Level 3: Points of Focus)
-- Structure: Component (L1) -> Principle (L2) -> Point of Focus (L3)

DO $$
DECLARE
    v_coso_id UUID;
    v_admin_id UUID;
    
    -- Level 1: Components
    v_c1 UUID; v_c2 UUID; v_c3 UUID; v_c4 UUID; v_c5 UUID;

    -- Level 2: Principles
    v_p1 UUID; v_p2 UUID; v_p3 UUID; v_p4 UUID; v_p5 UUID;
    v_p6 UUID; v_p7 UUID; v_p8 UUID; v_p9 UUID;
    v_p10 UUID; v_p11 UUID; v_p12 UUID;
    v_p13 UUID; v_p14 UUID; v_p15 UUID;
    v_p16 UUID; v_p17 UUID;

BEGIN
    SELECT id INTO v_coso_id FROM frameworks_compliance WHERE codigo = 'COSO-2013' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_coso_id;

    IF v_coso_id IS NOT NULL THEN
        
        -------------------------------------------------------------
        -- COMPONENT 1: Control Environment
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.C1', 'Ambiente de Controle', 'Normas e estruturas base.', 'Ambiente estabelecido.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_c1;

        -- P1: Integrity
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P1', 'Princípio 1: Integridade e Ética', 'Compromisso com valores éticos.', 'Código de Conduta.', 2, 'ativo', v_c1, v_admin_id, v_admin_id) RETURNING id INTO v_p1;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P1.F1', 'Tom no Topo', 'A alta administração estabelece o "Tone at the Top" sobre integridade.', 'Comunicações da liderança.', 3, 'ativo', v_p1, v_admin_id, v_admin_id);
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P1.F2', 'Padrões de Conduta', 'Padrões de conduta são definidos e entendidos pela organização.', 'Adesão ao Code of Conduct.', 3, 'ativo', v_p1, v_admin_id, v_admin_id);

        -- P2: Oversight
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P2', 'Princípio 2: Supervisão do Conselho', 'Conselho independente exerce responsabilidade de supervisão.', 'Atuação do Conselho.', 2, 'ativo', v_c1, v_admin_id, v_admin_id) RETURNING id INTO v_p2;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P2.F1', 'Independência', 'O conselho demonstra independência da gestão.', 'Membros independentes no board.', 3, 'ativo', v_p2, v_admin_id, v_admin_id);

        -- P3: Structure
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P3', 'Princípio 3: Estrutura e Autoridade', 'Estabelecimento de estruturas, linhas de reporte e autoridades.', 'Estrutura Organizacional.', 2, 'ativo', v_c1, v_admin_id, v_admin_id) RETURNING id INTO v_p3;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P3.F1', 'Segregação de Funções', 'Definição de autoridade limita conflitos de interesse (SoD).', 'Matriz SoD.', 3, 'ativo', v_p3, v_admin_id, v_admin_id);

        -- P4: Competence
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P4', 'Princípio 4: Competência Profissional', 'Atrair, desenvolver e reter indivíduos competentes.', 'Gestão de Talentos.', 2, 'ativo', v_c1, v_admin_id, v_admin_id) RETURNING id INTO v_p4;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P4.F1', 'Avaliação de Desempenho', 'Avaliação periódica de competências e desempenho.', 'Ciclo de performance review.', 3, 'ativo', v_p4, v_admin_id, v_admin_id);
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P4.F2', 'Sucessão', 'Planos de sucessão para posições chave.', 'Plano de sucessão documentado.', 3, 'ativo', v_p4, v_admin_id, v_admin_id);

        -- P5: Accountability
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P5', 'Princípio 5: Responsabilidade (Accountability)', 'Indivíduos são responsáveis por suas funções de controle interno.', 'Metas de CI.', 2, 'ativo', v_c1, v_admin_id, v_admin_id) RETURNING id INTO v_p5;

        -------------------------------------------------------------
        -- COMPONENT 2: Risk Assessment
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.C2', 'Avaliação de Riscos', 'Processo iterativo de identificação de riscos.', 'Processo de Risco.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_c2;

        -- P6: Objectives
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P6', 'Princípio 6: Objetivos Claros', 'Objetivos claros para identificação de riscos.', 'Objetivos definidos.', 2, 'ativo', v_c2, v_admin_id, v_admin_id) RETURNING id INTO v_p6;

        -- P7: Rick ID
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P7', 'Princípio 7: Identificação e Análise', 'Identificar riscos e analisar como gerenciá-los.', 'Matriz de Risco.', 2, 'ativo', v_c2, v_admin_id, v_admin_id) RETURNING id INTO v_p7;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P7.F1', 'Níveis de Risco', 'Avaliação de impacto e probabilidade.', 'Metodologia de I x P.', 3, 'ativo', v_p7, v_admin_id, v_admin_id);
      
        -- P8: Fraud
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P8', 'Princípio 8: Risco de Fraude', 'Considerar potencial de fraude na avaliação.', 'Triangle de fraude.', 2, 'ativo', v_c2, v_admin_id, v_admin_id) RETURNING id INTO v_p8;

        -- P9: Changes
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P9', 'Princípio 9: Mudanças Significativas', 'Identificar mudanças que impactam o controle interno.', 'Gestão de Mudanças Internas/Externas.', 2, 'ativo', v_c2, v_admin_id, v_admin_id) RETURNING id INTO v_p9;

        -------------------------------------------------------------
        -- COMPONENT 3: Control Activities
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.C3', 'Atividades de Controle', 'Políticas e procedimentos de mitigação.', 'Controles.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_c3;

        -- P10: Selection
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P10', 'Princípio 10: Seleção de Controles', 'Selecionar controles que mitigam riscos a níveis aceitáveis.', 'Mix de controles.', 2, 'ativo', v_c3, v_admin_id, v_admin_id) RETURNING id INTO v_p10;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P10.F1', 'Tipos de Controle', 'Uso de controles preventivos e detectivos.', 'Equilíbrio Prevention/Detection.', 3, 'ativo', v_p10, v_admin_id, v_admin_id);

        -- P11: IT Controls
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P11', 'Princípio 11: Controles Gerais de TI (ITGC)', 'Controles sobre tecnologia para suportar objetivos.', 'ITGCs.', 2, 'ativo', v_c3, v_admin_id, v_admin_id) RETURNING id INTO v_p11;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P11.F1', 'Acesso Lógico', 'Controles de acesso lógico sobre infraestrutura, aplicações e dados.', 'Gestão de Acesso.', 3, 'ativo', v_p11, v_admin_id, v_admin_id);
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P11.F2', 'Ciclo de Vida (SDLC)', 'Controles sobre aquisição, desenvolvimento e manutenção de tecnologia.', 'Processo SDLC formal.', 3, 'ativo', v_p11, v_admin_id, v_admin_id);

        -- P12: Policies
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P12', 'Princípio 12: Implementação via Políticas', 'Implementar controles através de políticas e procedimentos.', 'Políticas Documentadas.', 2, 'ativo', v_c3, v_admin_id, v_admin_id) RETURNING id INTO v_p12;

        -------------------------------------------------------------
        -- COMPONENT 4: Info & Comm
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.C4', 'Informação e Comunicação', 'Fluxo de informação.', 'Comunicação.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_c4;

        -- P13: Quality Info
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P13', 'Princípio 13: Qualidade da Informação', 'Obter dados relevantes e de qualidade.', 'Dados confiáveis.', 2, 'ativo', v_c4, v_admin_id, v_admin_id) RETURNING id INTO v_p13;

        -- P14: Internal Comm
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P14', 'Princípio 14: Comunicação Interna', 'Comunicar informações internamente.', 'Canais internos.', 2, 'ativo', v_c4, v_admin_id, v_admin_id) RETURNING id INTO v_p14;

        -- P15: External Comm
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P15', 'Princípio 15: Comunicação Externa', 'Comunicar-se com partes externas.', 'Canal de Denúncias/RI.', 2, 'ativo', v_c4, v_admin_id, v_admin_id) RETURNING id INTO v_p15;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_coso_id, 'COSO.P15.F1', 'Canal de Denúncias', 'Canal de comunicação anônimo e independente.', 'Linha Ética ativa.', 3, 'ativo', v_p15, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- COMPONENT 5: Monitoring
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.C5', 'Atividades de Monitoramento', 'Avaliação contínua.', 'Monitoramento.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_c5;

        -- P16: Evaluations
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P16', 'Princípio 16: Avaliações Contínuas e Independentes', 'Monitoramento contínuo e independente.', 'Auditoria Interna.', 2, 'ativo', v_c5, v_admin_id, v_admin_id) RETURNING id INTO v_p16;

        -- P17: Deficiencies
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P17', 'Princípio 17: Tratamento de Deficiências', 'Avaliar e comunicar deficiências de controle.', 'Gestão de Gaps.', 2, 'ativo', v_c5, v_admin_id, v_admin_id) RETURNING id INTO v_p17;

    END IF;

END $$;
