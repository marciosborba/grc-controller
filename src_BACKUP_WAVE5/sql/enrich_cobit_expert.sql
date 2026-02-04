-- Expert Enrichment for COBIT 2019
-- Strategy: 
-- 1. Descriptive enrichment of all 40 L2 Objectives.
-- 2. Level 3 'Management Practices' for Critical GRC areas (APO12, APO13, DSS05, BAI06, MEA03).

DO $$
DECLARE
    v_cobit_id UUID;
    v_admin_id UUID;
    
    -- Domains
    v_edm UUID; v_apo UUID; v_bai UUID; v_dss UUID; v_mea UUID;
    
    -- Critical L2s that will get children
    v_apo12 UUID; v_apo13 UUID; v_dss05 UUID; v_bai06 UUID; v_mea03 UUID;

BEGIN
    SELECT id INTO v_cobit_id FROM frameworks_compliance WHERE codigo = 'COBIT-2019' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_cobit_id;

    IF v_cobit_id IS NOT NULL THEN
        
        -- UPDATE METADATA
        UPDATE frameworks_compliance 
        SET nome = 'COBIT 2019 (GRC & Security Focus)', 
            descricao = 'Framework COBIT 2019 completo (40 Objetivos) com detalhamento "Process Practices" para gestão de Riscos (APO12), Segurança (APO13/DSS05) e Compliance (MEA03).' 
        WHERE id = v_cobit_id;

        -------------------------------------------------------------
        -- EDM: EVALUATE, DIRECT AND MONITOR
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_cobit_id, 'EDM', 'EDM - Avaliar, Dirigir e Monitorar', 'Governança Corporativa de TI.', 'Governança estabelecida.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_edm;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'EDM01', 'Assegurar a Definição e Manutenção do Framework', 'Fornecer uma abordagem consistente para a governança de I&T.', 'Princípios de governança aprovados.', 2, 'ativo', v_edm, v_admin_id, v_admin_id),
        (v_cobit_id, 'EDM02', 'Assegurar a Entrega de Benefícios', 'Otimizar a contribuição de valor do negócio.', 'Business case e realização de valor.', 2, 'ativo', v_edm, v_admin_id, v_admin_id),
        (v_cobit_id, 'EDM03', 'Assegurar a Otimização de Riscos', 'Garantir que o apetite de risco da empresa seja definido.', 'Níveis de tolerância a risco.', 2, 'ativo', v_edm, v_admin_id, v_admin_id),
        (v_cobit_id, 'EDM04', 'Assegurar a Otimização de Recursos', 'Garantir que as necessidades de recursos sejam atendidas.', 'Plano de recursos e capacidades.', 2, 'ativo', v_edm, v_admin_id, v_admin_id),
        (v_cobit_id, 'EDM05', 'Assegurar o Engajamento das Partes Interessadas', 'Garantir transparência e comunicação com stakeholders.', 'Relatórios de reporte.', 2, 'ativo', v_edm, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- APO: ALIGN, PLAN AND ORGANIZE
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_cobit_id, 'APO', 'APO - Alinhar, Planejar e Organizar', 'Organização e Estratégia de TI.', 'Alinhamento estratégico.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_apo;

        -- APO01-APO11 (Simplified descriptions)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'APO01', 'Gerenciar o Framework de Gestão', 'Implementar estrutura de gestão de TI.', 'Políticas e processos organizacionais.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO02', 'Gerenciar a Estratégia', 'Alinhar TI com a estratégia do negócio.', 'Plano Digital.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO03', 'Gerenciar a Arquitetura', 'Manter arquitetura corporativa.', 'Blueprint de arquitetura.', 2, 'ativo', v_apo, v_admin_id, v_admin_id);
        
        -- APO12: RISK (CRITICAL -> ADD L3)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_cobit_id, 'APO12', 'Gerenciar Riscos', 'Identificar, avaliar e reduzir riscos relacionados a I&T dentro dos níveis de tolerância.', 'Perfil de Risco.', 2, 'ativo', v_apo, v_admin_id, v_admin_id) RETURNING id INTO v_apo12;
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
            (v_cobit_id, 'APO12.01', 'Coletar Dados', 'Coletar dados sobre histórico de perdas e ameaças.', 'Registro de incidentes passados.', 3, 'ativo', v_apo12, v_admin_id, v_admin_id),
            (v_cobit_id, 'APO12.02', 'Analisar Riscos', 'Desenvolver e manter uma visão consolidada dos riscos.', 'Avaliação de Risco (Risk Assessment).', 3, 'ativo', v_apo12, v_admin_id, v_admin_id),
            (v_cobit_id, 'APO12.03', 'Manter Perfil de Risco', 'Manter perfil de risco atualizado.', 'Dashboard de Riscos.', 3, 'ativo', v_apo12, v_admin_id, v_admin_id),
            (v_cobit_id, 'APO12.04', 'Articular Riscos', 'Reportar riscos às partes interessadas.', 'Relatório de Riscos.', 3, 'ativo', v_apo12, v_admin_id, v_admin_id),
            (v_cobit_id, 'APO12.06', 'Responder aos Riscos', 'Definir respostas e planos de ação (Mitigar, Aceitar, etc).', 'Plano de Tratamento de Riscos (RTP).', 3, 'ativo', v_apo12, v_admin_id, v_admin_id);

        -- APO13: SECURITY ISMS (CRITICAL -> ADD L3)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_cobit_id, 'APO13', 'Gerenciar a Segurança', 'Definir o Sistema de Gestão de Segurança da Informação (SGSI).', 'SGSI estabelecido.', 2, 'ativo', v_apo, v_admin_id, v_admin_id) RETURNING id INTO v_apo13;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
            (v_cobit_id, 'APO13.01', 'Estabelecer e Manter o SGSI', 'Estabelecer a estrutura do SGSI (ISMS) alinhada ao negócio.', 'Políticas de Segurança (PSI).', 3, 'ativo', v_apo13, v_admin_id, v_admin_id),
            (v_cobit_id, 'APO13.02', 'Definir Plano de Tratamento', 'Plano de tratamento de riscos de segurança da informação.', 'Ações corretivas de segurança.', 3, 'ativo', v_apo13, v_admin_id, v_admin_id),
            (v_cobit_id, 'APO13.03', 'Monitorar o SGSI', 'Monitorar e revisar o desempenho do SGSI.', 'Auditoria do SGSI.', 3, 'ativo', v_apo13, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- BAI: BUILD, ACQUIRE AND IMPLEMENT
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_cobit_id, 'BAI', 'BAI - Construir, Adquirir e Implementar', 'Gestão de projetos e mudanças.', 'Entrega de soluções.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_bai;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'BAI01', 'Gerenciar Programas', 'Gestão de portfólio de projetos.', 'PMO.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI02', 'Gerenciar Definição de Requisitos', 'Definição de requisitos de soluções.', 'Especificação funcional.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI03', 'Gerenciar Identificação de Soluções', 'Seleção de tecnologia.', 'RFP/RFI.', 2, 'ativo', v_bai, v_admin_id, v_admin_id);

        -- BAI06: CHANGES (CRITICAL -> ADD L3)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_cobit_id, 'BAI06', 'Gerenciar Mudanças de TI', 'Gerenciar todas as alterações de forma controlada.', 'Processo de Gestão de Mudanças (GMUD).', 2, 'ativo', v_bai, v_admin_id, v_admin_id) RETURNING id INTO v_bai06;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
            (v_cobit_id, 'BAI06.01', 'Avaliar e Priorizar Mudanças', 'Todas as solicitações de mudança (RFC) são avaliadas.', 'RFCs documentadas.', 3, 'ativo', v_bai06, v_admin_id, v_admin_id),
            (v_cobit_id, 'BAI06.02', 'Gerenciar Mudanças Emergenciais', 'Processo específico para mudanças de emergência.', 'Log de emergências.', 3, 'ativo', v_bai06, v_admin_id, v_admin_id),
            (v_cobit_id, 'BAI06.03', 'Rastrear e Relatar Mudanças', 'Monitoramento do status de mudanças.', 'Comitê de Mudanças (CAB).', 3, 'ativo', v_bai06, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DSS: DELIVER, SERVICE AND SUPPORT
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_cobit_id, 'DSS', 'DSS - Entregar, Servir e Suportar', 'Operações de TI e Segurança.', 'SLA e Segurança Operacional.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_dss;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'DSS01', 'Gerenciar Operações', 'Coordenação de serviços operacionais.', 'Batch jobs, backups.', 2, 'ativo', v_dss, v_admin_id, v_admin_id),
        (v_cobit_id, 'DSS02', 'Gerenciar Incidentes e Requisições', 'Service Desk e Incident Management.', 'Gestão de tickets.', 2, 'ativo', v_dss, v_admin_id, v_admin_id),
        (v_cobit_id, 'DSS03', 'Gerenciar Problemas', 'Gestão de Causa Raiz.', 'Base de conhecimento de erros.', 2, 'ativo', v_dss, v_admin_id, v_admin_id);

        -- DSS05: SECURITY SERVICES (CRITICAL -> ADD L3)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_cobit_id, 'DSS05', 'Gerenciar Serviços de Segurança', 'Proteger as informações da empresa.', 'Controles técnicos de segurança.', 2, 'ativo', v_dss, v_admin_id, v_admin_id) RETURNING id INTO v_dss05;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
            (v_cobit_id, 'DSS05.01', 'Proteção contra Malware', 'Implementar e manter proteção contra software malicioso.', 'Antivírus.', 3, 'ativo', v_dss05, v_admin_id, v_admin_id),
            (v_cobit_id, 'DSS05.02', 'Segurança de Rede e Conectividade', 'Gerenciar segurança de rede (Firewalls, IDS).', 'Segurança de Perímetro.', 3, 'ativo', v_dss05, v_admin_id, v_admin_id),
            (v_cobit_id, 'DSS05.03', 'Segurança de Endpoint', 'Gerenciar segurança de endpoints (Laptops, Mobile).', 'MDM/EDR.', 3, 'ativo', v_dss05, v_admin_id, v_admin_id),
            (v_cobit_id, 'DSS05.04', 'Gestão de Identidade e Acesso', 'Gerenciar direitos de acesso de usuários.', 'IAM.', 3, 'ativo', v_dss05, v_admin_id, v_admin_id),
            (v_cobit_id, 'DSS05.05', 'Acesso Físico', 'Gerenciar acesso físico a ativos de TI.', 'Controle de acesso físico.', 3, 'ativo', v_dss05, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- MEA: MONITOR, EVALUATE AND ASSESS
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_cobit_id, 'MEA', 'MEA - Monitorar, Avaliar e Analisar', 'Conformidade e Monitoramento.', 'Auditoria e Compliance.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_mea;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'MEA01', 'Monitorar Desempenho e Conformidade', 'Coletar, validar e avaliar métricas.', 'KPIs e Métricas.', 2, 'ativo', v_mea, v_admin_id, v_admin_id),
        (v_cobit_id, 'MEA02', 'Monitorar Sistema de Controle Interno', 'Avaliar eficácia dos controles internos.', 'Testes de Controle.', 2, 'ativo', v_mea, v_admin_id, v_admin_id);

        -- MEA03: COMPLIANCE (CRITICAL -> ADD L3)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_cobit_id, 'MEA03', 'Gerenciar Conformidade com Requisitos Externos', 'Assegurar que requisitos regulatórios sejam cumpridos.', 'Gestão de Compliance.', 2, 'ativo', v_mea, v_admin_id, v_admin_id) RETURNING id INTO v_mea03;
        
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
            (v_cobit_id, 'MEA03.01', 'Identificar Requisitos Externos', 'Identificar leis, regulamentos e contratos aplicáveis.', 'Inventário de Obrigações.', 3, 'ativo', v_mea03, v_admin_id, v_admin_id),
            (v_cobit_id, 'MEA03.02', 'Otimizar Resposta à Conformidade', 'Ajustar processos para atender requisitos.', 'Gap Analysis.', 3, 'ativo', v_mea03, v_admin_id, v_admin_id),
            (v_cobit_id, 'MEA03.03', 'Confirmar Conformidade', 'Auditar conformidade com requisitos externos.', 'Relatório de Conformidade.', 3, 'ativo', v_mea03, v_admin_id, v_admin_id);

    END IF;

END $$;
