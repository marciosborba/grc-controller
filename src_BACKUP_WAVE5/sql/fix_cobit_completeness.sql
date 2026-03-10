-- Fix COBIT Completeness: Restore missing 18 Objectives

DO $$
DECLARE
    v_cobit_id UUID;
    v_admin_id UUID;
    v_apo UUID; v_bai UUID; v_dss UUID; v_mea UUID;
BEGIN
    SELECT id INTO v_cobit_id FROM frameworks_compliance WHERE codigo = 'COBIT-2019' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- Get Domain IDs
    SELECT id INTO v_apo FROM requisitos_compliance WHERE framework_id = v_cobit_id AND codigo = 'APO' LIMIT 1;
    SELECT id INTO v_bai FROM requisitos_compliance WHERE framework_id = v_cobit_id AND codigo = 'BAI' LIMIT 1;
    SELECT id INTO v_dss FROM requisitos_compliance WHERE framework_id = v_cobit_id AND codigo = 'DSS' LIMIT 1;
    SELECT id INTO v_mea FROM requisitos_compliance WHERE framework_id = v_cobit_id AND codigo = 'MEA' LIMIT 1;

    IF v_cobit_id IS NOT NULL THEN
        -- APO Missing
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'APO04', 'Gerenciar Inovação', 'Manter o conhecimento sobre tecnologias emergentes.', 'Plano de Inovação.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO05', 'Gerenciar Portfólio', 'Otimizar o desempenho do portfólio de investimentos.', 'Gestão de Portfólio.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO06', 'Gerenciar Orçamento e Custos', 'Gerenciar as finanças de TI.', 'Orçamento de TI.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO07', 'Gerenciar Recursos Humanos', 'Otimizar as capacidades dos recursos humanos.', 'Gestão de RH.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO08', 'Gerenciar Relacionamentos', 'Gerenciar relacionamento com o negócio.', 'Business Partnering.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO09', 'Gerenciar Acordos de Serviço', 'Gerenciar acordos de nível de serviço (SLA).', 'Catálogo de Serviços e SLAs.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO10', 'Gerenciar Fornecedores', 'Gerenciar serviços prestados por terceiros.', 'Gestão de Contratos.', 2, 'ativo', v_apo, v_admin_id, v_admin_id),
        (v_cobit_id, 'APO11', 'Gerenciar Qualidade', 'Gerenciar requisitos de qualidade.', 'QMS.', 2, 'ativo', v_apo, v_admin_id, v_admin_id);

        -- BAI Missing
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'BAI04', 'Gerenciar Disponibilidade e Capacidade', 'Equilibrar disponibilidade e capacidade de recursos.', 'Capacity Planning.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI05', 'Gerenciar Mudança Organizacional', 'Maximizar a probabilidade de implementação bem-sucedida de mudanças organizacionais.', 'Gestão de Mudança (OCM).', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI07', 'Gerenciar Aceite e Transição', 'Aceitar e tornar operacionais as novas soluções.', 'Termo de Aceite.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI08', 'Gerenciar Conhecimento', 'Manter a disponibilidade de conhecimento relevante.', 'Base de Conhecimento.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI09', 'Gerenciar Ativos', 'Gerenciar ativos de TI.', 'Inventário de Ativos.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI10', 'Gerenciar Configuração', 'Definir e manter descrições de configurações.', 'CMDB.', 2, 'ativo', v_bai, v_admin_id, v_admin_id),
        (v_cobit_id, 'BAI11', 'Gerenciar Projetos', 'Gerenciar todos os projetos.', 'Gestão de Projetos.', 2, 'ativo', v_bai, v_admin_id, v_admin_id);

        -- DSS Missing
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'DSS04', 'Gerenciar Continuidade', 'Estabelecer e manter plano de continuidade.', 'BCP/DRP.', 2, 'ativo', v_dss, v_admin_id, v_admin_id),
        (v_cobit_id, 'DSS06', 'Gerenciar Controles de Processo de Negócio', 'Manter controle sobre processos de negócio.', 'Controles de Negócio.', 2, 'ativo', v_dss, v_admin_id, v_admin_id);

        -- MEA Missing
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by) VALUES 
        (v_cobit_id, 'MEA04', 'Gerenciar Asseguração', 'Planejar e executar iniciativas de auditoria.', 'Auditoria.', 2, 'ativo', v_mea, v_admin_id, v_admin_id);

    END IF;

END $$;
