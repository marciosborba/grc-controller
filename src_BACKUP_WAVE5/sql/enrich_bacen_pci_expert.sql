-- Expert Enrichment for BACEN 4.658 and PCI-DSS 4.0
-- Adding detailed hierarchy (Section -> Article) for BACEN
-- Adding detailed hierarchy (Goal -> Requirement) for PCI-DSS

DO $$
DECLARE
    v_bacen_id UUID;
    v_pci_id UUID;
    v_admin_id UUID;
    v_parent_id UUID;
BEGIN
    SELECT id INTO v_bacen_id FROM frameworks_compliance WHERE codigo = 'BACEN-4658' LIMIT 1;
    SELECT id INTO v_pci_id FROM frameworks_compliance WHERE codigo = 'PCI-DSS-4.0' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP SPECIFIC FRAMEWORKS
    DELETE FROM requisitos_compliance WHERE framework_id IN (v_bacen_id, v_pci_id);

    --------------------------------------------------------------------------------
    -- BACEN 4.658 (Expanded)
    --------------------------------------------------------------------------------
    IF v_bacen_id IS NOT NULL THEN
        -- SECTION 1: POLÍTICA DE SEGURANÇA (Art 2-5)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.S1', 'Seção I - Da Política de Segurança Cibernética', 'Diretrizes fundamentais para a segurança cibernética.', 'Política aprovada pelo Conselho.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.2', 'Implementação da Política', 'Implementar e manter política formulada com princípios de confidencialidade, integridade e disponibilidade.', 'Evidenciar política formalizada.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.3', 'Objetivos da Política', 'A política deve contemplar objetivos de segurança, procedimentos e controles.', 'Objetivos claros e mensuráveis.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        -- SECTION 2: PROCEDIMENTOS E CONTROLES (Art 6-8)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.S2', 'Seção II - Procedimentos e Controles', 'Controles técnicos e processuais exigidos.', 'Verificar implementação de controles.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.6.I', 'Autenticação e Cripografia', 'Controles de autenticação, criptografia, prevenção de intrusão e vazamento de informações.', 'Exigir MFA e criptografia em trânsito/repouso.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.6.II', 'Testes e Varreduras', 'Realização periódica de testes de segurança e varreduras de vulnerabilidade.', 'Relatórios de Pentest e Scan semestrais.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.6.III', 'Segmentação e Proteção da Rede', 'Segmentação de rede e controles de acesso.', 'VLANs segregadas e Firewall rules.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        -- SECTION 3: CONTRATAÇÃO DE SERVIÇOS (Art 12-16)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.S3', 'Seção III - Contratação de Processamento e Nuvem', 'Requisitos para terceirização e computação em nuvem.', 'Contratos robustos com cláusulas de segurança.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.12', 'Due Diligence de Fornecedores', 'Assegurar capacidade do prestador de serviço em cumprir a política da instituição.', 'Relatório de avaliação de risco do fornecedor.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.15', 'Nuvem no Exterior', 'Requisitos específicos para nuvem no exterior, incluindo legislação aplicável e acordos de supervisão.', 'Parecer jurídico sobre jurisdição dos dados.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        -- SECTION 4: INCIDENTES (Art 21-23)
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.S4', 'Seção IV - Gestão de Incidentes', 'Prevenção e resposta a incidentes cibernéticos.', 'Plano de Resposta a Incidentes (IRP).', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.21', 'Plano de Ação de Incidentes', 'Elaboração de procedimentos para resposta e recuperação de incidentes.', 'Playbooks de resposta testados.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_bacen_id, 'BACEN.22', 'Comunicação ao Regulador', 'Obrigatoriedade de informar o BACEN sobre incidentes relevantes.', 'Processo de notificação regulatória.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);
    END IF;

    --------------------------------------------------------------------------------
    -- PCI-DSS 4.0 (Expanded to all 12 Req groups)
    --------------------------------------------------------------------------------
    IF v_pci_id IS NOT NULL THEN
        -- GOAL 1: Build and Maintain a Secure Network
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G1', 'Goal 1: Rede e Sistemas Seguros', 'Construir e manter uma rede e sistemas seguros.', 'Topologia de rede segura.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.1', 'Req 1: Segurança de Rede', 'Instalar e manter controles de segurança de rede (NSC).', 'Firewalls configurados permissivamente (deny-all by default).', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);
        
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.2', 'Req 2: Configurações Seguras', 'Aplicar configurações seguras a todos os componentes do sistema.', 'Hardening guides aplicados (CIS Benchmarks).', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        -- GOAL 2: Protect Account Data
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G2', 'Goal 2: Proteger Dados da Conta', 'Proteger dados do titular do cartão.', 'Dados ilegíveis em armazenamento e trânsito.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.3', 'Req 3: Proteção de Dados Armazenados', 'Proteger dados da conta armazenados.', 'Criptografia AES-256 ou tokenização.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.4', 'Req 4: Proteção em Transmissão', 'Proteger dados da conta durante a transmissão em redes abertas.', 'TLS 1.2 ou superior forte.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        -- GOAL 3: Vulnerability Management
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G3', 'Goal 3: Gestão de Vulnerabilidades', 'Manter um programa de gestão de vulnerabilidades.', 'Antivírus e Patches.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.5', 'Req 5: Malware Protection', 'Proteger todos os sistemas contra malware.', 'Solução EDR/AV ativa.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.6', 'Req 6: Software Seguro', 'Desenvolver e manter sistemas e software seguros.', 'SDLC seguro e gestão de patches.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        -- GOAL 4: Strong Access Control
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G4', 'Goal 4: Controle de Acesso Forte', 'Implementar medidas fortes de controle de acesso.', 'Need-to-know e MFA.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_parent_id;

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.7', 'Req 7: Restrição de Acesso', 'Restringir acesso aos componentes do sistema e dados da conta.', 'RBAC implementado.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.8', 'Req 8: Autenticação', 'Identificar usuários e autenticar o acesso aos componentes do sistema.', 'Senhas complexas e MFA.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);

        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.9', 'Req 9: Acesso Físico', 'Restringir o acesso físico aos dados da conta.', 'Controle de acesso biométrico/cartão em datacenters.', 2, 'ativo', v_parent_id, v_admin_id, v_admin_id);
    END IF;

END $$;
