-- Ultimate Enrichment for PCI-DSS 4.0
-- Covering all 6 Goals and 12 Principal Requirements with core sub-requirements

DO $$
DECLARE
    v_pci_id UUID;
    v_admin_id UUID;
    v_goal1 UUID;
    v_goal2 UUID;
    v_goal3 UUID;
    v_goal4 UUID;
    v_goal5 UUID;
    v_goal6 UUID;
BEGIN
    SELECT id INTO v_pci_id FROM frameworks_compliance WHERE codigo = 'PCI-DSS-4.0' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_pci_id;

    IF v_pci_id IS NOT NULL THEN
        
        -- GOAL 1: Build and Maintain a Secure Network and Systems
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G1', 'Goal 1: Construir e Manter Redes e Sistemas Seguros', 'Segurança de infraestrutura de rede.', 'Topologia segura.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_goal1;
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.1', 'Req 1: Segurança de Rede (NSC)', 'Instalar e manter controles de segurança de rede (antigos Firewalls).', 'Regras de firewall restritivas e documentadas.', 2, 'ativo', v_goal1, v_admin_id, v_admin_id);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.2', 'Req 2: Configurações Seguras', 'Aplicar configurações seguras a todos os componentes do sistema. Não usar padrões de fornecedor.', 'Hardening, remoção de contas default.', 2, 'ativo', v_goal1, v_admin_id, v_admin_id);

        -- GOAL 2: Protect Account Data
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G2', 'Goal 2: Proteger Dados da Conta', 'Proteção de dados em repouso e trânsito.', 'Criptografia forte.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_goal2;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.3', 'Req 3: Proteção de Dados Armazenados', 'Proteger dados da conta armazenados (SAD vs PAN).', 'Retenção mínima, Mascaramento, Criptografia.', 2, 'ativo', v_goal2, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.4', 'Req 4: Proteção em Transmissão', 'Proteger dados da conta durante transmissão em redes públicas.', 'TLS atualizado (v1.2+), WPA3.', 2, 'ativo', v_goal2, v_admin_id, v_admin_id);

        -- GOAL 3: Maintain a Vulnerability Management Program
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G3', 'Goal 3: Gestão de Vulnerabilidades', 'Proteção contra ameaças e desenvolvimento seguro.', 'Scan e Patch.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_goal3;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.5', 'Req 5: Proteção contra Malware', 'Proteger todos os sistemas e redes contra software malicioso.', 'Antivírus atualizado, varredura ativa.', 2, 'ativo', v_goal3, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.6', 'Req 6: Sistemas e Softwares Seguros', 'Desenvolver e manter sistemas e softwares seguros.', 'Correção de vulnerabilidades (Patching), OWASP Top 10.', 2, 'ativo', v_goal3, v_admin_id, v_admin_id);

        -- GOAL 4: Implement Strong Access Control Measures
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G4', 'Goal 4: Controle de Acesso Forte', 'Identidade e acesso físico/lógico.', 'IAM e MFA.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_goal4;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.7', 'Req 7: Need-to-Know', 'Restringir acesso aos componentes do sistema e dados da conta conforme a necessidade de saber.', 'RBAC rigoroso.', 2, 'ativo', v_goal4, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.8', 'Req 8: Identificação e Autenticação', 'Identificar usuários e autenticar o acesso.', 'MFA para todo acesso não-console CDE.', 2, 'ativo', v_goal4, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.9', 'Req 9: Acesso Físico', 'Restringir o acesso físico aos dados da conta e instalações.', 'Controle de visitantes, câmeras, proteção de mídia.', 2, 'ativo', v_goal4, v_admin_id, v_admin_id);

        -- GOAL 5: Regularly Monitor and Test Networks
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G5', 'Goal 5: Monitorar e Testar Redes', 'Monitoramento contínuo e testes de segurança.', 'SIEM e Pentest.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_goal5;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.10', 'Req 10: Logs e Monitoramento', 'Logar e monitorar todo o acesso aos componentes do sistema e dados da conta.', 'Logs centralizados, audit trails revisados.', 2, 'ativo', v_goal5, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.11', 'Req 11: Testes de Segurança', 'Testar a segurança de sistemas e redes regularmente.', 'Varreduras ASV trimestrais, Pentest anual ou a cada mudança.', 2, 'ativo', v_goal5, v_admin_id, v_admin_id);

        -- GOAL 6: Maintain an Information Security Policy
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G6', 'Goal 6: Política de Segurança', 'Gerenciamento de governança e políticas.', 'Política viva e gerenciada.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_goal6;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.12', 'Req 12: Gestão da Política', 'Suportar a segurança da informação com políticas e programas organizacionais.', 'Análise de risco anual, programa de conscientização, gestão de terceiros.', 2, 'ativo', v_goal6, v_admin_id, v_admin_id);

    END IF;

END $$;
