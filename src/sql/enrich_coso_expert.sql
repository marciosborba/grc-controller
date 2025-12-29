-- Expert Enrichment for COSO 2013 (All 17 Principles)

DO $$
DECLARE
    v_coso_id UUID;
    v_admin_id UUID;
    v_env_id UUID; -- Control Environment
    v_risk_id UUID; -- Risk Assessment
    v_act_id UUID; -- Control Activities
    v_info_id UUID; -- Info & Comm
    v_mon_id UUID; -- Monitoring
BEGIN
    SELECT id INTO v_coso_id FROM frameworks_compliance WHERE codigo = 'COSO-2013' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP COSO
    DELETE FROM requisitos_compliance WHERE framework_id = v_coso_id;

    IF v_coso_id IS NOT NULL THEN
        -- 1. Control Environment (Principles 1-5)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.CR1', 'Ambiente de Controle', 'Conjunto de normas, processos e estruturas que fornecem a base para o controle interno.', 'Ambiente de controle estabelecido.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_env_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P1', 'Princípio 1: Integridade e Valores Éticos', 'A organização demonstra compromisso com a integridade e valores éticos.', 'Código de conduta.', 2, 'ativo', v_env_id, v_admin_id, v_admin_id);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P2', 'Princípio 2: Independência do Conselho', 'O conselho de administração demonstra independência da gestão e exerce supervisão.', 'Atas de reunião do conselho.', 2, 'ativo', v_env_id, v_admin_id, v_admin_id);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P3', 'Princípio 3: Estrutura e Autoridade', 'A gestão estabelece, com supervisão do conselho, estruturas, linhas de reporte e autoridades.', 'Organograma atualizado.', 2, 'ativo', v_env_id, v_admin_id, v_admin_id);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P4', 'Princípio 4: Competência', 'A organização demonstra compromisso em atrair, desenvolver e reter talentos competentes.', 'Políticas de RH e planos de treinamento.', 2, 'ativo', v_env_id, v_admin_id, v_admin_id);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P5', 'Princípio 5: Responsabilidade', 'A organização mantém indivíduos responsáveis pelas suas funções de controle interno.', 'Definição de metas e responsabilidades.', 2, 'ativo', v_env_id, v_admin_id, v_admin_id);

        -- 2. Risk Assessment (Principles 6-9)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.CR2', 'Avaliação de Riscos', 'Processo dinâmico e interativo para identificar e avaliar riscos.', 'Matriz de riscos.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_risk_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P6', 'Princípio 6: Objetivos Claros', 'A organização especifica objetivos com clareza suficiente para permitir a identificação de riscos.', 'Planejamento estratégico.', 2, 'ativo', v_risk_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P7', 'Princípio 7: Identificação de Riscos', 'A organização identifica riscos à realização de objetivos e analisa como devem ser gerenciados.', 'Inventário de riscos.', 2, 'ativo', v_risk_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P8', 'Princípio 8: Avaliação de Fraude', 'A organização considera o potencial de fraude na avaliação de riscos.', 'Matriz de riscos de fraude.', 2, 'ativo', v_risk_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P9', 'Princípio 9: Mudanças Significativas', 'A organização identifica e avalia mudanças que poderiam impactar significativamente o sistema de controle interno.', 'Gestão de mudanças no ambiente de risco.', 2, 'ativo', v_risk_id, v_admin_id, v_admin_id);

        -- 3. Control Activities (Principles 10-12)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.CR3', 'Atividades de Controle', 'Ações estabelecidas por meio de políticas e procedimentos.', 'Políticas e procedimentos operacionais.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_act_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P10', 'Princípio 10: Seleção de Controles', 'A organização seleciona e desenvolve atividades de controle que contribuem para a mitigação de riscos.', 'Controles chaves identificados.', 2, 'ativo', v_act_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P11', 'Princípio 11: Controles Gerais de TI', 'A organização seleciona e desenvolve atividades de controle geral sobre a tecnologia.', 'Controles de acesso, backup e desenvolvimento.', 2, 'ativo', v_act_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P12', 'Princípio 12: Políticas e Procedimentos', 'A organização implementa atividades de controle por meio de políticas e procedimentos.', 'Políticas publicadas e comunicadas.', 2, 'ativo', v_act_id, v_admin_id, v_admin_id);

        -- 4. Information and Communication (Principles 13-15)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.CR4', 'Informação e Comunicação', 'Comunicação interna e externa relevante e de qualidade.', 'Canais de comunicação.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_info_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P13', 'Princípio 13: Informação Relevante', 'A organização obtém ou gera e utiliza informações relevantes e de qualidade.', 'Relatórios gerenciais precisos.', 2, 'ativo', v_info_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P14', 'Princípio 14: Comunicação Interna', 'A organização comunica internamente informações, incluindo objetivos e responsabilidades.', 'Intranet, e-mails e reuniões.', 2, 'ativo', v_info_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P15', 'Princípio 15: Comunicação Externa', 'A organização se comunica com partes interessadas externas sobre assuntos que afetam o controle interno.', 'Canal de denúncias e RI.', 2, 'ativo', v_info_id, v_admin_id, v_admin_id);

        -- 5. Monitoring Activities (Principles 16-17)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.CR5', 'Atividades de Monitoramento', 'Avaliações contínuas e/ou independentes.', 'Auditoria interna e monitoramento contínuo.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_mon_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P16', 'Princípio 16: Avaliações Contínuas', 'A organização seleciona, desenvolve e realiza avaliações contínuas/independentes.', 'Relatórios de monitoramento.', 2, 'ativo', v_mon_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_coso_id, 'COSO.P17', 'Princípio 17: Avaliação de Deficiências', 'A organização avalia e comunica deficiências de controle interno em tempo hábil.', 'Planos de ação para correção de gaps.', 2, 'ativo', v_mon_id, v_admin_id, v_admin_id);
    END IF;

END $$;
