-- Ultimate Enrichment for BACEN (Resolution 4.893/4.658) with full granularity
-- Covering Policy, Governance, Prevention, Response, Outsourcing, and Cloud

DO $$
DECLARE
    v_bacen_id UUID;
    v_admin_id UUID;
    v_sec_pol UUID;  -- Policy
    v_sec_gov UUID;  -- Governance & Risk
    v_sec_prev UUID; -- Prevention & Controls
    v_sec_inc UUID;  -- Incidents
    v_sec_out UUID;  -- Outsourcing & Cloud
    v_sec_cont UUID; -- Continuity
BEGIN
    SELECT id INTO v_bacen_id FROM frameworks_compliance WHERE codigo = 'BACEN-4658' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_bacen_id;

    IF v_bacen_id IS NOT NULL THEN
        
        -- UPDATE FRAMEWORK METADATA TO REFLECT CURRENT NORM
        UPDATE frameworks_compliance 
        SET nome = 'Resolução CMN 4.893 (Segurança Cibernética)',
            descricao = 'Dispõe sobre a política de segurança cibernética e sobre os requisitos para a contratação de serviços de processamento e armazenamento de dados e de computação em nuvem.'
        WHERE id = v_bacen_id;

        --------------------------------------------------------------------------------
        -- I. POLÍTICA DE SEGURANÇA CIBERNÉTICA
        --------------------------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'CAP.I', 'Política de Segurança Cibernética', 'Estabelecimento da política e diretrizes gerais.', 'Política aprovada.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec_pol;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.2', 'Implementação da Política', 'A instituição deve implementar e manter política de segurança cibernética compatível com seu porte e perfil de risco.', 'Existência de política formal.', 2, 'ativo', v_sec_pol, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.3.I', 'Objetivos de Segurança', 'A política deve contemplar os objetivos de segurança cibernética da instituição.', 'Objetivos definidos na política.', 2, 'ativo', v_sec_pol, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.3.II', 'Procedimentos e Controles', 'A política deve contemplar os procedimentos e os controles adotados para reduzir a vulnerabilidade.', 'Lista de controles essenciais.', 2, 'ativo', v_sec_pol, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.3.IV', 'Gestão de Terceiros', 'A política deve contemplar os controles específicos para contratação de serviços relevantes.', 'Cláusulas de segurança em contratos.', 2, 'ativo', v_sec_pol, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.4', 'Divulgação da Política', 'A política deve ser divulgada aos funcionários e prestadores de serviços.', 'Evidência de comunicação/treinamento.', 2, 'ativo', v_sec_pol, v_admin_id, v_admin_id);

        --------------------------------------------------------------------------------
        -- II. GOVERNANÇA E GESTÃO DE RISCOS
        --------------------------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'CAP.II', 'Governança e Gestão de Riscos', 'Estruturas de responsabilidade e integração com gestão de riscos.', 'Atas e relatórios.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec_gov;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.9', 'Diretor Responsável', 'A instituição deve indicar diretor responsável pela política de segurança cibernética.', 'Nomeação formal em ata.', 2, 'ativo', v_sec_gov, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.5', 'Aprovação do Conselho', 'A política deve ser aprovada pelo conselho de administração ou pela diretoria.', 'Ata de aprovação.', 2, 'ativo', v_sec_gov, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.20', 'Relatório Anual', 'Elaboração de relatório anual sobre a implementação da política e plano de ação.', 'Relatório apresentado ao comitê/conselho.', 2, 'ativo', v_sec_gov, v_admin_id, v_admin_id);

        --------------------------------------------------------------------------------
        -- III. PROCEDIMENTOS E CONTROLES (PREVENÇÃO)
        --------------------------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'CAP.III', 'Procedimentos e Controles de Prevenção', 'Controles técnicos de segurança.', 'Implementação técnica.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec_prev;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.6.I', 'Autenticação e Criptografia', 'Controles de autenticação, criptografia, prevenção de intrusão e vazamento.', 'MFA, Encryption at rest/transit.', 2, 'ativo', v_sec_prev, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.6.II', 'Testes de Segurança', 'Realização periódica de testes de segurança e varreduras de vulnerabilidade.', 'Relatórios de Pentest.', 2, 'ativo', v_sec_prev, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.6.III', 'Proteção da Rede', 'Segmentação da rede de computadores e controles de acesso.', 'Segmentação lógica/física.', 2, 'ativo', v_sec_prev, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.7', 'Rastreabilidade', 'Procedimentos para assegurar a rastreabilidade das informações.', 'Logs de auditoria e SIEM.', 2, 'ativo', v_sec_prev, v_admin_id, v_admin_id);

        --------------------------------------------------------------------------------
        -- IV. RESPOSTA A INCIDENTES
        --------------------------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'CAP.IV', 'Gestão de Incidentes', 'Processos de resposta e recuperação.', 'IRP (Incident Response Plan).', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec_inc;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.10', 'Plano de Resposta', 'Procedimentos para resposta a incidentes e recuperação de dados e sistemas.', 'Documento de Plano de Resposta a Incidentes.', 2, 'ativo', v_sec_inc, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.11', 'Análise de Causa Raiz', 'Processo de análise da causa dos incidentes relevantes.', 'Relatórios de Post-Mortem.', 2, 'ativo', v_sec_inc, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.12', 'Notificação ao BACEN', 'Obrigatoriedade de informar o Banco Central sobre incidentes relevantes.', 'Protocolos de notificação.', 2, 'ativo', v_sec_inc, v_admin_id, v_admin_id);

        --------------------------------------------------------------------------------
        -- V. CONTRATAÇÃO DE SERVIÇOS (TERCEIROS E NUVEM)
        --------------------------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'CAP.V', 'Contratação de Serviços e Nuvem', 'Requisitos para terceiros e cloud computing.', 'Contratos e Due Diligence.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec_out;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.13', 'Políticas para Terceiros', 'Adoção de procedimentos antes da contratação (Due Diligence).', 'Avaliação de risco de terceiros.', 2, 'ativo', v_sec_out, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.14', 'Capacidade do Prestador', 'Verificar a capacidade do prestador de serviço em cumprir a política da instituição.', 'Certificações (ISO 27001, SOC2) do vendor.', 2, 'ativo', v_sec_out, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.15.I', 'Nuvem: Confidencialidade', 'Garantia de confidencialidade, integridade e disponibilidade dos dados em nuvem.', 'Controles contratuais de criptografia.', 2, 'ativo', v_sec_out, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.15.IV', 'Nuvem: Segregação', 'Previsão de segregação de dados em ambientes compartilhados.', 'Auditoria de controles lógicos.', 2, 'ativo', v_sec_out, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.16', 'Nuvem no Exterior', 'Requisitos para processamento em nuvem no exterior (legislação e acordos).', 'Parecer legal favorável.', 2, 'ativo', v_sec_out, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.17', 'Resiliência e Continuidade', 'Planos de recuperação de negócios para os serviços contratados.', 'Testes de DRP do fornecedor.', 2, 'ativo', v_sec_out, v_admin_id, v_admin_id);

        --------------------------------------------------------------------------------
        -- VI. CONTINUIDADE DE NEGÓCIOS
        --------------------------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'CAP.VI', 'Continuidade de Negócios', 'Plano de Continuidade de Negócios (PCN).', 'PCN Testado.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_sec_cont;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.19', 'Cenários de Cibernética no PCN', 'O PCN deve contemplar cenários de incidentes cibernéticos.', 'Cenários de Ransomware no PCN.', 2, 'ativo', v_sec_cont, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'Art.19.P', 'Testes de Continuidade', 'Realização de testes periódicos dos planos de continuidade.', 'Relatórios de teste de recuperação.', 2, 'ativo', v_sec_cont, v_admin_id, v_admin_id);

    END IF;

END $$;
