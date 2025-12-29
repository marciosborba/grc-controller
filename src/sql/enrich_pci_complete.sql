-- Expert Enrichment for PCI-DSS 4.0 (Level 3 Depth)
-- Structure: Goal (L1) -> Requirement (L2) -> Sub-Requirement (L3)

DO $$
DECLARE
    v_pci_id UUID;
    v_admin_id UUID;
    
    -- Level 1: Goals
    v_g1 UUID; v_g2 UUID; v_g3 UUID; v_g4 UUID; v_g5 UUID; v_g6 UUID;

    -- Level 2: Requirements
    v_r1 UUID; v_r2 UUID; v_r3 UUID; v_r4 UUID; v_r5 UUID; v_r6 UUID; 
    v_r7 UUID; v_r8 UUID; v_r9 UUID; v_r10 UUID; v_r11 UUID; v_r12 UUID;

BEGIN
    SELECT id INTO v_pci_id FROM frameworks_compliance WHERE codigo = 'PCI-DSS-4.0' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;

    -- CLEANUP
    DELETE FROM requisitos_compliance WHERE framework_id = v_pci_id;

    IF v_pci_id IS NOT NULL THEN
        
        -------------------------------------------------------------
        -- GOAL 1: Secure Network and Systems
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G1', 'Goal 1: Construir e Manter Redes e Sistemas Seguros', 'Segurança de infraestrutura.', 'Topologia segura.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_g1;

        -- Req 1
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.1', 'Requirement 1: Network Security Controls', 'Instalar e manter controles de segurança de rede (NSC).', 'NSC instalado e configurado.', 2, 'ativo', v_g1, v_admin_id, v_admin_id) RETURNING id INTO v_r1;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.1.2', 'Configuração de NSC', 'As configurações dos controles de segurança de rede são definidas e mantidas.', 'Revisão de regras de firewall a cada 6 meses.', 3, 'ativo', v_r1, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.1.3', 'Acesso à Redes', 'O acesso à rede e o tráfego são restritos ao necessário.', 'Deny-all por padrão.', 3, 'ativo', v_r1, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.1.4', 'Conexões não confiáveis', 'Conexões entre redes confiáveis e não confiáveis são controladas.', 'DMZ implementada.', 3, 'ativo', v_r1, v_admin_id, v_admin_id);

        -- Req 2
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.2', 'Requirement 2: Secure Configurations', 'Aplicar configurações seguras a todos os componentes.', 'Hardening.', 2, 'ativo', v_g1, v_admin_id, v_admin_id) RETURNING id INTO v_r2;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.2.2', 'Parâmetros Padrão', 'Parâmetros padrão de fornecedores (senhas default) são alterados e removidos.', 'Nenhuma senha default ativa.', 3, 'ativo', v_r2, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.2.3', 'Wireless', 'O acesso sem fio ao ambiente CDE é gerenciado e autenticado.', 'Criptografia WPA2/3 Enterprise.', 3, 'ativo', v_r2, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- GOAL 2: Protect Account Data
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G2', 'Goal 2: Proteger Dados da Conta', 'Proteção de CHD e SAD.', 'Criptografia.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_g2;

        -- Req 3
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.3', 'Requirement 3: Protect Stored Account Data', 'Proteger dados da conta armazenados.', 'Criptografia em repouso.', 2, 'ativo', v_g2, v_admin_id, v_admin_id) RETURNING id INTO v_r3;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.3.2', 'Armazenamento de SAD', 'Dados de autenticação sensíveis (CVV, PIN) não são armazenados após autorização.', 'Nenhum SAD em logs ou banco.', 3, 'ativo', v_r3, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.3.3', 'Mascaramento de PAN', 'O PAN é mascarado quando exibido (BIN + last 4).', 'Apenas pessoal autorizado vê PAN completo.', 3, 'ativo', v_r3, v_admin_id, v_admin_id);

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.3.5', 'Criptografia do PAN', 'PAN é protegido por criptografia robusta em qualquer local de armazenamento.', 'AES-256 e gestão de chaves.', 3, 'ativo', v_r3, v_admin_id, v_admin_id);

        -- Req 4
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.4', 'Requirement 4: Protect Data in Transit', 'Proteger dados durante transmissão.', 'TLS.', 2, 'ativo', v_g2, v_admin_id, v_admin_id) RETURNING id INTO v_r4;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.4.2', 'Criptografia em Redes Públicas', 'PAN é criptografado com criptografia forte durante transmissão em redes públicas.', 'Certificados válidos e TLS 1.2+.', 3, 'ativo', v_r4, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- GOAL 3: Vulnerability Management
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G3', 'Goal 3: Gestão de Vulnerabilidades', 'Malware e Softwares.', 'Gestão de patches.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_g3;

        -- Req 5
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.5', 'Requirement 5: Malware Protection', 'Proteger contra malware.', 'Antivírus.', 2, 'ativo', v_g3, v_admin_id, v_admin_id) RETURNING id INTO v_r5;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.5.2', 'Solução Antimalware', 'Malware é detectado e removido/bloqueado.', 'AV ativo, atualizado e não pode ser desativado pelo usuário.', 3, 'ativo', v_r5, v_admin_id, v_admin_id);

        -- Req 6
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.6', 'Requirement 6: Secure Systems & Software', 'Desenvolvimento Seguro.', 'SDLC.', 2, 'ativo', v_g3, v_admin_id, v_admin_id) RETURNING id INTO v_r6;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.6.2', 'Software Personalizado', 'Software customizado é desenvolvido de acordo com padrões seguros (ex: OWASP).', 'Treinamento de dev seguro.', 3, 'ativo', v_r6, v_admin_id, v_admin_id);

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.6.3', 'Vulnerabilidades e Patches', 'Vulnerabilidades de segurança são identificadas e patches são aplicados em até 30 dias (críticos).', 'Processo de gestão de patches.', 3, 'ativo', v_r6, v_admin_id, v_admin_id);

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.6.4', 'Aplicações Web', 'Aplicações web públicas são protegidas contra ataques (WAF ou revisão de código).', 'WAF ativo em modo blocking.', 3, 'ativo', v_r6, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- GOAL 4: Strong Access Control
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G4', 'Goal 4: Controle de Acesso Forte', 'IAM.', 'Autenticação e Autorização.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_g4;

        -- Req 7
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.7', 'Requirement 7: Need-to-Know', 'Restringir acesso por necessidade de saber.', 'Acesso mínimo privilegiado.', 2, 'ativo', v_g4, v_admin_id, v_admin_id) RETURNING id INTO v_r7;

        -- Req 8
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.8', 'Requirement 8: Identification & Authentication', 'Identificar usuários e autenticar.', 'MFA e Senhas.', 2, 'ativo', v_g4, v_admin_id, v_admin_id) RETURNING id INTO v_r8;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.8.2', 'Gestão de Identidade', 'IDs únicos para cada usuário.', 'Proibição de contas genéricas.', 3, 'ativo', v_r8, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.8.3', 'Autenticação Forte (MFA)', 'MFA é exigido para todo acesso ao CDE.', 'MFA implementado para acesso remoto e local ao CDE.', 3, 'ativo', v_r8, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.8.6', 'Complexidade de Senha', 'Senhas atendem a requisitos mínimos de complexidade e troca.', 'mínimo 12 caracteres, alfanumérico.', 3, 'ativo', v_r8, v_admin_id, v_admin_id);

        -- Req 9
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.9', 'Requirement 9: Physical Access', 'Restringir acesso físico.', 'Controle de perímetro.', 2, 'ativo', v_g4, v_admin_id, v_admin_id) RETURNING id INTO v_r9;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.9.2', 'Controle de Visitantes', 'Visitantes são identificados e acompanhados.', 'Crachás de visitante e logs de entrada.', 3, 'ativo', v_r9, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- GOAL 5: Monitor and Test Networks
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G5', 'Goal 5: Monitorar e Testar', 'Vigilância contínua.', 'Logs e Testes.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_g5;

        -- Req 10
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.10', 'Requirement 10: Logging & Monitoring', 'Logar e monitorar acessos.', 'SIEM.', 2, 'ativo', v_g5, v_admin_id, v_admin_id) RETURNING id INTO v_r10;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.10.2', 'Auditoria de Eventos', 'Eventos de segurança são registrados (login, falhas, elevação de privilégio).', 'Logs detalhados de todos sitemas CDE.', 3, 'ativo', v_r10, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.10.5', 'Proteção de Logs', 'Logs são protegidos contra alteração.', 'Logs enviados para servidor central seguro (WORM/SIEM).', 3, 'ativo', v_r10, v_admin_id, v_admin_id);

        -- Req 11
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.11', 'Requirement 11: Security Testing', 'Testar segurança regularmente.', 'Pentest e ASV.', 2, 'ativo', v_g5, v_admin_id, v_admin_id) RETURNING id INTO v_r11;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.11.2', 'Varreduras de Vulnerabilidade', 'Scans internos e externos (ASV) trimestrais.', 'Relatórios ASV passing.', 3, 'ativo', v_r11, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.11.3', 'Testes de Intrusão', 'Pentests internos e externos anuais ou após mudanças significativas.', 'Pentest report e re-test.', 3, 'ativo', v_r11, v_admin_id, v_admin_id);

        -------------------------------------------------------------
        -- GOAL 6: Information Security Policy
        -------------------------------------------------------------
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.G6', 'Goal 6: Política de Segurança', 'Governança.', 'Programa de segurança.', 1, 'ativo', v_admin_id, v_admin_id) RETURNING id INTO v_g6;

        -- Req 12
        INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
        VALUES (v_pci_id, 'PCI.12', 'Requirement 12: Policies & Programs', 'Gestão de segurança organizacional.', 'Programa formal.', 2, 'ativo', v_g6, v_admin_id, v_admin_id) RETURNING id INTO v_r12;

            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.12.3', 'Análise de Risco', 'Análise de risco anual (Risk Assessment).', 'Metodologia de risco formalizada.', 3, 'ativo', v_r12, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.12.6', 'Conscientização', 'Programa de treinamento e conscientização em segurança.', 'Logs de treinamento anual.', 3, 'ativo', v_r12, v_admin_id, v_admin_id);
            
            INSERT INTO requisitos_compliance (framework_id, codigo, titulo, descricao, criterios_conformidade, nivel, status, requisito_pai, created_by, updated_by)
            VALUES (v_pci_id, 'PCI.12.8', 'Gestão de TPSPs', 'Gestão de provedores de serviços terceirizados (TPSPs).', 'Lista de provedores e matriz de responsabilidade.', 3, 'ativo', v_r12, v_admin_id, v_admin_id);

    END IF;

END $$;
