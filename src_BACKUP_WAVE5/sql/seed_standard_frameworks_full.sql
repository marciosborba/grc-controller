-- Seeding Standard Frameworks with Robust Requirements
-- Frameworks: BACEN 4.658, COBIT 2019, PCI-DSS 4.0, COSO 2013, SOX

DO $$
DECLARE
    v_bacen_id UUID;
    v_cobit_id UUID;
    v_pci_id UUID;
    v_coso_id UUID;
    v_sox_id UUID;
    v_admin_id UUID;
BEGIN
    -- 0. Get IDs
    SELECT id INTO v_bacen_id FROM frameworks_compliance WHERE codigo = 'BACEN-4658' LIMIT 1;
    SELECT id INTO v_cobit_id FROM frameworks_compliance WHERE codigo = 'COBIT-2019' LIMIT 1;
    SELECT id INTO v_pci_id FROM frameworks_compliance WHERE codigo = 'PCI-DSS-4.0' LIMIT 1;
    SELECT id INTO v_coso_id FROM frameworks_compliance WHERE codigo = 'COSO-2013' LIMIT 1;
    SELECT id INTO v_sox_id FROM frameworks_compliance WHERE codigo = 'SOX-2002' LIMIT 1;
    
    -- Dummy admin ID (or finding a real one if needed, but usually null created_by is fine for system seeds, or use a placeholder)
    -- trying to find a valid user if possible, else NULL
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- 1. CLEANUP (Delete existing weak requirements)
    DELETE FROM requisitos_compliance WHERE framework_id IN (v_bacen_id, v_cobit_id, v_pci_id, v_coso_id, v_sox_id);

    --------------------------------------------------------------------------------
    -- BACEN 4.658 (Resolução 4.658/2018 - Política de Segurança Cibernética)
    --------------------------------------------------------------------------------
    IF v_bacen_id IS NOT NULL THEN
        -- Art. 2º - Política de Segurança
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_bacen_id, 'BACEN.2', 'Política de Segurança Cibernética', 'A instituição deve implementar e manter política de segurança cibernética formulada com base em princípios de autencidade, integridade e disponibilidade.', 'Verificar existência de política formal aprovada pelo Conselho.', 'ativo', NULL);
        
        -- Art. 6º - Controles Específicos
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_bacen_id, 'BACEN.6', 'Controles de Segurança', 'Adoção de procedimentos e controles para reduzir a vulnerabilidade a incidentes.', 'Verificar controles de autenticação, criptografia e prevenção de intrusão.', 'ativo', NULL);

        -- Art. 12 - Contratação de Serviços
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_bacen_id, 'BACEN.12', 'Contratação de Serviços de Processamento', 'A instituição deve assegurar que a contratação de serviços relevantes de processamento, armazenamento de dados e de computação em nuvem observe a legislação.', 'Auditoria de contratos de terceiros e vendors.', 'ativo', NULL);
        
        -- Art. 15 - Nuvem (Cloud)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_bacen_id, 'BACEN.15', 'Serviços em Nuvem', 'Requisitos para contratação de serviços de computação em nuvem no exterior.', 'Verificar existência de acordo para troca de informações e supervisão.', 'ativo', NULL);

        -- Art. 21 - Incidentes
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_bacen_id, 'BACEN.21', 'Plano de Ação e Resposta', 'A instituição deve elaborar relatórios sobre incidentes relevantes e plano de ação.', 'Verificar procedimentos de resposta a incidentes (IRP) documentados.', 'ativo', NULL);
    END IF;

    --------------------------------------------------------------------------------
    -- COBIT 2019 (Core Objectives)
    --------------------------------------------------------------------------------
    IF v_cobit_id IS NOT NULL THEN
        -- EDM (Evaluate, Direct and Monitor)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'EDM01', 'Assegurar a Definição e Manutenção do Framework de Governança', 'Analisar e articular os requisitos para a governança de TI da empresa.', 'Verificar atas de comitê de TI e estrutura de governança.', 'ativo', NULL);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'EDM03', 'Assegurar a Otimização de Riscos', 'Garantir que o apetite e tolerância a riscos sejam entendidos, articulados e comunicados.', 'Verificar matriz de riscos corporativa.', 'ativo', NULL);

        -- APO (Align, Plan and Organize)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'APO12', 'Gerenciar Riscos', 'Identificar, acessar e reduzir riscos relacionados a TI dentro dos níveis de tolerância.', 'Verificar registros de avaliação de risco contínua.', 'ativo', NULL);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'APO13', 'Gerenciar Segurança', 'Definir, operar e monitorar sistema para gestão de segurança da informação.', 'Verificar ISMS implementado.', 'ativo', NULL);

        -- BAI (Build, Acquire and Implement)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'BAI06', 'Gerenciar Mudanças', 'Gerenciar todas as mudanças de forma controlada, incluindo mudanças padrão e emergenciais.', 'Verificar processo de CAB (Change Advisory Board).', 'ativo', NULL);

        -- DSS (Deliver, Service and Support)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'DSS05', 'Gerenciar Serviços de Segurança', 'Proteger informações da empresa para manter nível de risco de segurança aceitável.', 'Verificar firewalls, antivírus e controles de perímetro.', 'ativo', NULL);

        -- MEA (Monitor, Evaluate and Assess)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_cobit_id, 'MEA01', 'Monitorar, Avaliar e Analisar Desempenho e Conformidade', 'Coletar, validar e avaliar métricas de alinhamento com objetivos de negócio.', 'Verificar dashboards de monitoramento e KPIs.', 'ativo', NULL);
    END IF;

    --------------------------------------------------------------------------------
    -- PCI-DSS 4.0 (The 12 Requirements)
    --------------------------------------------------------------------------------
    IF v_pci_id IS NOT NULL THEN
        -- Req 1
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_pci_id, 'PCI.1', 'Instalar e manter controles de segurança de rede', 'Processos e mecanismos para restringir tráfego de rede não autorizado (firewalls).', 'Verificar regras de firewall e diagramas de rede atualizados.', 'ativo', NULL);
        
        -- Req 2
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_pci_id, 'PCI.2', 'Aplicar configurações seguras a todos os componentes', 'Não usar padrões fornecidos pelo fabricante (senhas padrão, configurações inseguras).', 'Verificar hardening de servidores e troca de senhas default.', 'ativo', NULL);
        
        -- Req 3
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_pci_id, 'PCI.3', 'Proteger dados de conta armazenados', 'Manter o armazenamento de dados de portadores de cartão ao mínimo necessário e criptografado.', 'Verificar criptografia em repouso e políticas de retenção.', 'ativo', NULL);
        
        -- Req 4
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_pci_id, 'PCI.4', 'Proteger dados de conta em transmissão', 'Criptografar dados do titular do cartão durante a transmissão em redes públicas.', 'Verificar uso de TLS 1.2+ e certificados válidos.', 'ativo', NULL);
        
        -- Req 5
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_pci_id, 'PCI.5', 'Proteger contra malware', 'Implementar e manter controles antimalware em todos os sistemas afetados.', 'Verificar antivírus ativo e atualizado.', 'ativo', NULL);

        -- Req 8
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_pci_id, 'PCI.8', 'Identificar usuários e autenticar acesso', 'Atribuir uma identificação única para cada pessoa com acesso ao sistema e usar MFA.', 'Verificar política de senhas e Multifactor Authentication (MFA).', 'ativo', NULL);
    END IF;

    --------------------------------------------------------------------------------
    -- COSO 2013 (17 Principles)
    --------------------------------------------------------------------------------
    IF v_coso_id IS NOT NULL THEN
        -- Control Environment
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_coso_id, 'COSO.1', 'Compromisso com a Integridade', 'A organização demonstra compromisso com a integridade e valores éticos.', 'Verificar Código de Conduta assinado.', 'ativo', NULL);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_coso_id, 'COSO.2', 'Supervisão de Controles', 'O conselho de administração demonstra independência e supervisiona o desenvolvimento e desempenho do controle interno.', 'Verificar composição do conselho e independência.', 'ativo', NULL);

        -- Risk Assessment
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_coso_id, 'COSO.6', 'Definição de Objetivos', 'A organização especifica os objetivos com clareza suficiente para permitir a identificação e avaliação dos riscos.', 'Verificar planejamento estratégico documentado.', 'ativo', NULL);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_coso_id, 'COSO.7', 'Identificação de Riscos', 'A organização identifica riscos à realização de seus objetivos e analisa riscos para determinar como devem ser gerenciados.', 'Verificar inventário de riscos.', 'ativo', NULL);
    END IF;

    --------------------------------------------------------------------------------
    -- SOX (Sarbanes-Oxley)
    --------------------------------------------------------------------------------
    IF v_sox_id IS NOT NULL THEN
        -- Section 302
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_sox_id, 'SOX.302', 'Responsabilidade Corporativa pelos Relatórios Financeiros', 'Diretores devem certificar a veracidade dos relatórios financeiros e a eficácia dos controles internos.', 'Verificar assinaturas de certificação dos executivos (CEO/CFO).', 'ativo', NULL);
        
        -- Section 404
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_sox_id, 'SOX.404', 'Avaliação da Gestão sobre Controles Internos', 'Exige que a gestão e o auditor externo relatem sobre a adequação do controle interno sobre relatórios financeiros.', 'Verificar relatório de auditoria independente sobre controles internos.', 'ativo', NULL);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_sox_id, 'SOX.404.IT', 'Controles Gerais de TI (ITGC)', 'Controles sobre operações de TI, acesso lógico, desenvolvimento e mudanças que suportam relatórios financeiros.', 'Verificar controles de acesso, changelog e backup.', 'ativo', NULL);

        -- Section 409
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_sox_id, 'SOX.409', 'Divulgação em Tempo Real', 'Divulgação rápida e atual de informações sobre mudanças materiais na condição financeira ou operações.', 'Verificar processos de fato relevante.', 'ativo', NULL);

        -- Section 802
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, status, tenant_id)
        VALUES (v_sox_id, 'SOX.802', 'Penalidades Criminais por Alteração de Documentos', 'Proibição de destruição, alteração ou falsificação de registros em investigações federais.', 'Verificar política de retenção de documentos e logs imutáveis.', 'ativo', NULL);
    END IF;

END $$;
