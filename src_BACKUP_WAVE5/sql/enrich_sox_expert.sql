-- Expert Enrichment for SOX (ITGC Focus)
-- Structure: ITGC Domain (L1) -> Control Objective (L2) -> Key Control Activity (L3)

DO $$
DECLARE
    v_sox_id UUID;
    v_admin_id UUID;

    -- Domains (L1)
    v_ac UUID; -- Access Control
    v_cm UUID; -- Change Management
    v_dev UUID; -- Program Development (SDLC)
    v_ops UUID; -- Computer Operations

    -- L2 Objectives
    v_ac_users UUID; v_ac_admin UUID; v_ac_review UUID; v_ac_auth UUID; v_ac_phys UUID;
    v_cm_auth UUID; v_cm_test UUID; v_cm_emerg UUID;
    v_dev_sdlc UUID; v_dev_mig UUID;
    v_ops_sched UUID; v_ops_backup UUID;

BEGIN
    SELECT id INTO v_sox_id FROM frameworks_compliance WHERE codigo = 'SOX-2002' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_sox_id;

    IF v_sox_id IS NOT NULL THEN
        
        -- UPDATE METADATA
        UPDATE frameworks_compliance 
        SET nome = 'SOX ITGC (Sarbanes-Oxley)', 
            descricao = 'Controles Gerais de TI (ITGC) estruturados nos 4 domínios principais: Acesso, Mudança, Desenvolvimento e Operações.' 
        WHERE id = v_sox_id;

        -------------------------------------------------------------
        -- DOMAIN 1: ACCESS TO PROGRAMS AND DATA (AP&D)
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_sox_id, 'SOX.AC', 'Acesso a Programas e Dados', 'Segurança Lógica e Física.', 'Matriz de Acesso.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_ac;

            -- Provisioning / Deprovisioning
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.AC.1', 'Gestão de Usuários', 'Processo de concessão e revogação de acessos.', 'Tickets de acesso.', 2, 'ativo', v_ac, v_admin_id, v_admin_id) RETURNING id INTO v_ac_users;
                
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.1.1', 'Novas Contratações (New Hires)', 'Acesso concedido baseado na função e aprovado pelo gestor.', 'Aprovação formal antes do acesso.', 3, 'ativo', v_ac_users, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.1.2', 'Desligamentos (Terminations)', 'Revogação tempestiva de acesso de demitidos (ex: 24h).', 'Ticket de desligamento.', 3, 'ativo', v_ac_users, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.1.3', 'Transferências', 'Ajuste de acessos em mudanças de cargo.', 'Review de transferência.', 3, 'ativo', v_ac_users, v_admin_id, v_admin_id);

            -- Privileged Access
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.AC.2', 'Acesso Privilegiado', 'Gestão de contas administrativas (Superusers).', 'PAM.', 2, 'ativo', v_ac, v_admin_id, v_admin_id) RETURNING id INTO v_ac_admin;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.2.1', 'Restrição de Admin', 'Acesso admin restrito ao mínimo necessário.', 'Lista de Admins.', 3, 'ativo', v_ac_admin, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.2.2', 'Contas Genéricas (Firecall)', 'Uso de IDs genéricos monitorado e restrito (Emergency IDs).', 'Log de uso Firecall.', 3, 'ativo', v_ac_admin, v_admin_id, v_admin_id);

            -- Periodic Review
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.AC.3', 'Revisão Periódica (UAR)', 'Recertificação de acessos.', 'UAR Reports.', 2, 'ativo', v_ac, v_admin_id, v_admin_id) RETURNING id INTO v_ac_review;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.3.1', 'Revisão de Usuários', 'Os gestores revisam o acesso de sua equipe periodicamente (anual/semestral).', 'Evidência de UAR assinada.', 3, 'ativo', v_ac_review, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.3.2', 'Revisão de Privilégios', 'Revisão focada em contas de alto privilégio (trimestral).', 'UAR Admin.', 3, 'ativo', v_ac_review, v_admin_id, v_admin_id);

            -- Auth
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.AC.4', 'Autenticação', 'Parâmetros de senha e MFA.', 'Configuração de segurança.', 2, 'ativo', v_ac, v_admin_id, v_admin_id) RETURNING id INTO v_ac_auth;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.4.1', 'Parâmetros de Senha', 'Complexidade, Expiração, Bloqueio após falhas.', 'Screenshots de configuração.', 3, 'ativo', v_ac_auth, v_admin_id, v_admin_id);

            -- Physical
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.AC.5', 'Acesso Físico', 'Segurança do Datacenter.', 'Controle de Acesso.', 2, 'ativo', v_ac, v_admin_id, v_admin_id) RETURNING id INTO v_ac_phys;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.AC.5.1', 'Acesso ao Datacenter', 'Acesso restrito a pessoal autorizado via biometria/cartão.', 'Logs de acesso físico.', 3, 'ativo', v_ac_phys, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DOMAIN 2: PROGRAM CHANGE (CM)
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_sox_id, 'SOX.CM', 'Gestão de Mudanças', 'Controle sobre alterações em produção.', 'GMUD.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_cm;

            -- Authorization
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.CM.1', 'Autorização e Teste', 'Todas as mudanças são aprovadas e testadas.', 'RFC workflow.', 2, 'ativo', v_cm, v_admin_id, v_admin_id) RETURNING id INTO v_cm_auth;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.CM.1.1', 'Aprovação de Negócio', 'Mudanças aprovadas pelos donos do processo.', 'Business approval.', 3, 'ativo', v_cm_auth, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.CM.1.2', 'UAT (User Acceptance Testing)', 'Testes aceitos pelo usuário antes da migração.', 'Evidência de UAT.', 3, 'ativo', v_cm_auth, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.CM.1.3', 'Segregação de Funções (SoD)', 'Quem desenvolve não migra para produção (DevAccess violation).', 'Logs de transporte.', 3, 'ativo', v_cm_auth, v_admin_id, v_admin_id);

            -- Emergency
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.CM.2', 'Mudanças Emergenciais', 'Processo excepcional.', 'Emergency Change.', 2, 'ativo', v_cm, v_admin_id, v_admin_id) RETURNING id INTO v_cm_emerg;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.CM.2.1', 'Aprovação Post Facto', 'Emergências aprovadas formalmente após a correção.', 'Aprovação retroativa.', 3, 'ativo', v_cm_emerg, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DOMAIN 3: PROGRAM DEVELOPMENT (PD)
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_sox_id, 'SOX.PD', 'Desenvolvimento de Sistemas', 'SDLC e Projetos.', 'Metodologia de Projeto.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_dev;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.PD.1', 'Metodologia SDLC', 'Uso de metodologia formal para novos sistemas.', 'Documentação de Projeto.', 2, 'ativo', v_dev, v_admin_id, v_admin_id) RETURNING id INTO v_dev_sdlc;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.PD.1.1', 'Requisitos e Design', 'Aprovação de especificações funcionais e técnicas.', 'Design Docs.', 3, 'ativo', v_dev_sdlc, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.PD.1.3', 'Conversão de Dados', 'Validação da integridade na migração de dados.', 'Testes de migração.', 3, 'ativo', v_dev_sdlc, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- DOMAIN 4: COMPUTER OPERATIONS (OPS)
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_sox_id, 'SOX.OPS', 'Operações de Computador', 'Backup e Jobs.', 'Operações.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_ops;

            -- Backup
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.OPS.1', 'Backups e Recuperação', 'Execução e teste de backups.', 'Logs de Backup.', 2, 'ativo', v_ops, v_admin_id, v_admin_id) RETURNING id INTO v_ops_backup;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.OPS.1.1', 'Sucesso do Backup', 'Monitoramento diário de jobs de backup.', 'Monitoramento de falhas.', 3, 'ativo', v_ops_backup, v_admin_id, v_admin_id);
                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.OPS.1.2', 'Testes de Restore', 'Testes periódicos de restauração de dados.', 'Evidência de Restore.', 3, 'ativo', v_ops_backup, v_admin_id, v_admin_id);

            -- Scheduling
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_sox_id, 'SOX.OPS.2', 'Job Scheduling', 'Processamento em lote (Batch).', 'Scheduler logs.', 2, 'ativo', v_ops, v_admin_id, v_admin_id) RETURNING id INTO v_ops_sched;

                INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
                VALUES (v_sox_id, 'SOX.OPS.2.1', 'Falhas de Job', 'Investigação e resolução de falhas de processamento.', 'Incident Mgmt.', 3, 'ativo', v_ops_sched, v_admin_id, v_admin_id);

    END IF;

END $$;
