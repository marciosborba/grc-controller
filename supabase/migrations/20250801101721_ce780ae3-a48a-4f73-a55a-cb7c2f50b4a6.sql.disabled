-- Inserir dados fictícios para frameworks
INSERT INTO public.frameworks (name, short_name, category, version, description, created_by_user_id, tenant_id) VALUES
('ISO/IEC 27001:2022', 'ISO27001', 'Segurança da Informação', '2022', 'Framework internacional para sistemas de gestão de segurança da informação', (SELECT id FROM auth.users LIMIT 1), '550e8400-e29b-41d4-a716-446655440000'),
('NIST Cybersecurity Framework', 'NIST-CSF', 'Cibersegurança', '1.1', 'Framework de cibersegurança do Instituto Nacional de Padrões e Tecnologia', (SELECT id FROM auth.users LIMIT 1), '550e8400-e29b-41d4-a716-446655440000'),
('LGPD - Lei Geral de Proteção de Dados', 'LGPD', 'Proteção de Dados', '2020', 'Lei brasileira de proteção de dados pessoais', (SELECT id FROM auth.users LIMIT 1), '550e8400-e29b-41d4-a716-446655440000'),
('COBIT 2019', 'COBIT', 'Governança de TI', '2019', 'Framework para governança e gerenciamento de TI empresarial', (SELECT id FROM auth.users LIMIT 1), '550e8400-e29b-41d4-a716-446655440000'),
('SOC 2 Type II', 'SOC2', 'Auditoria', '2017', 'Relatório de controles sobre sistemas e organizações', (SELECT id FROM auth.users LIMIT 1), '550e8400-e29b-41d4-a716-446655440000');

-- Inserir controles fictícios para ISO 27001
INSERT INTO public.framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.5.1', 'Política de Segurança da Informação', 'Políticas de Segurança', 'A.5.1.1'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.5.2', 'Revisão da Política de Segurança', 'Políticas de Segurança', 'A.5.1.2'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.8.1', 'Inventário de Ativos', 'Gestão de Ativos', 'A.8.1.1'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.8.2', 'Propriedade dos Ativos', 'Gestão de Ativos', 'A.8.1.2'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.8.3', 'Uso Aceitável dos Ativos', 'Gestão de Ativos', 'A.8.1.3'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.9.1', 'Controle de Acesso', 'Controle de Acesso', 'A.9.1.1'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.9.2', 'Gerenciamento de Acesso do Usuário', 'Controle de Acesso', 'A.9.2.1'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.12.1', 'Procedimentos Operacionais Seguros', 'Segurança Operacional', 'A.12.1.1'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.12.2', 'Proteção contra Malware', 'Segurança Operacional', 'A.12.2.1'),
((SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), 'A.12.3', 'Backup', 'Segurança Operacional', 'A.12.3.1');

-- Inserir controles fictícios para NIST CSF
INSERT INTO public.framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'ID.AM-1', 'Inventário de ativos físicos', 'Identificar', 'ID.AM-1'),
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'ID.AM-2', 'Inventário de ativos de software', 'Identificar', 'ID.AM-2'),
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'PR.AC-1', 'Identidades e credenciais são gerenciadas', 'Proteger', 'PR.AC-1'),
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'PR.AC-3', 'Acesso remoto é gerenciado', 'Proteger', 'PR.AC-3'),
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'DE.CM-1', 'A rede é monitorada', 'Detectar', 'DE.CM-1'),
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'RS.RP-1', 'Plano de resposta é executado', 'Responder', 'RS.RP-1'),
((SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), 'RC.RP-1', 'Plano de recuperação é executado', 'Recuperar', 'RC.RP-1');

-- Inserir controles fictícios para LGPD
INSERT INTO public.framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
((SELECT id FROM public.frameworks WHERE short_name = 'LGPD' LIMIT 1), 'Art.6', 'Princípios da Proteção de Dados', 'Princípios', 'Art. 6º'),
((SELECT id FROM public.frameworks WHERE short_name = 'LGPD' LIMIT 1), 'Art.7', 'Bases Legais para Tratamento', 'Tratamento', 'Art. 7º'),
((SELECT id FROM public.frameworks WHERE short_name = 'LGPD' LIMIT 1), 'Art.8', 'Consentimento', 'Consentimento', 'Art. 8º'),
((SELECT id FROM public.frameworks WHERE short_name = 'LGPD' LIMIT 1), 'Art.46', 'Medidas de Segurança', 'Segurança', 'Art. 46º'),
((SELECT id FROM public.frameworks WHERE short_name = 'LGPD' LIMIT 1), 'Art.48', 'Comunicação de Incidentes', 'Incidentes', 'Art. 48º');

-- Inserir assessments fictícios (corrigindo os valores do enum)
INSERT INTO public.assessments (name, status, framework_id_on_creation, created_by_user_id, due_date, progress, tenant_id) VALUES
('Assessment ISO 27001 - Q1 2024', 'Em Andamento'::assessment_status, (SELECT id FROM public.frameworks WHERE short_name = 'ISO27001' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-03-31', 45, '550e8400-e29b-41d4-a716-446655440000'),
('Avaliação LGPD - Anual', 'Não Iniciado'::assessment_status, (SELECT id FROM public.frameworks WHERE short_name = 'LGPD' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-06-30', 0, '550e8400-e29b-41d4-a716-446655440000'),
('NIST Cybersecurity Framework - 2024', 'Concluído'::assessment_status, (SELECT id FROM public.frameworks WHERE short_name = 'NIST-CSF' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-02-28', 100, '550e8400-e29b-41d4-a716-446655440000'),
('COBIT 2019 - Governança TI', 'Em Andamento'::assessment_status, (SELECT id FROM public.frameworks WHERE short_name = 'COBIT' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-08-31', 25, '550e8400-e29b-41d4-a716-446655440000');

-- Inserir algumas respostas fictícias para o assessment em progresso
INSERT INTO public.assessment_responses (assessment_id, control_id, maturity_level, assessee_response, assessor_analysis, last_updated_by_user_id) VALUES
((SELECT id FROM public.assessments WHERE name = 'Assessment ISO 27001 - Q1 2024'), (SELECT id FROM public.framework_controls WHERE control_code = 'A.5.1' LIMIT 1), 3, 'Temos uma política de segurança documentada e aprovada pela diretoria.', 'Política existe mas precisa ser revisada e atualizada.', (SELECT id FROM auth.users LIMIT 1)),
((SELECT id FROM public.assessments WHERE name = 'Assessment ISO 27001 - Q1 2024'), (SELECT id FROM public.framework_controls WHERE control_code = 'A.8.1' LIMIT 1), 2, 'Inventário parcial dos ativos está sendo mantido.', 'Inventário incompleto, necessário incluir todos os ativos críticos.', (SELECT id FROM auth.users LIMIT 1)),
((SELECT id FROM public.assessments WHERE name = 'Assessment ISO 27001 - Q1 2024'), (SELECT id FROM public.framework_controls WHERE control_code = 'A.9.1' LIMIT 1), 4, 'Controles de acesso implementados com autenticação multifator.', 'Controle bem implementado, recomenda-se manter monitoramento.', (SELECT id FROM auth.users LIMIT 1));

-- Inserir dados de fornecedores fictícios
INSERT INTO public.vendors (name, category, contact_person, email, phone, address, status, risk_level, contract_start_date, contract_end_date, created_by) VALUES
('TechSolutions Corp', 'Tecnologia da Informação', 'João Silva', 'joao.silva@techsolutions.com', '+55 11 99999-0001', 'Av. Paulista, 1000 - São Paulo, SP', 'active', 'medium', '2023-01-15', '2025-01-14', (SELECT id FROM auth.users LIMIT 1)),
('CloudServices Ltd', 'Computação em Nuvem', 'Maria Santos', 'maria.santos@cloudservices.com', '+55 11 99999-0002', 'Rua da Consolação, 500 - São Paulo, SP', 'active', 'high', '2023-06-01', '2024-05-31', (SELECT id FROM auth.users LIMIT 1)),
('SecureData Inc', 'Segurança Cibernética', 'Carlos Oliveira', 'carlos.oliveira@securedata.com', '+55 11 99999-0003', 'Av. Faria Lima, 2000 - São Paulo, SP', 'active', 'low', '2024-01-01', '2026-12-31', (SELECT id FROM auth.users LIMIT 1)),
('DataBackup Solutions', 'Backup e Recuperação', 'Ana Costa', 'ana.costa@databackup.com', '+55 11 99999-0004', 'Rua Augusta, 1500 - São Paulo, SP', 'inactive', 'medium', '2022-03-15', '2023-03-14', (SELECT id FROM auth.users LIMIT 1));

-- Inserir riscos fictícios
INSERT INTO public.risk_assessments (title, description, risk_category, severity, probability, status, impact_score, likelihood_score, assigned_to, created_by, due_date) VALUES
('Vazamento de Dados Pessoais', 'Risco de exposição não autorizada de dados pessoais de clientes devido a falhas de segurança.', 'Segurança da Informação', 'Alto', 'Médio', 'open', 4, 3, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-04-30'),
('Interrupção de Serviços de TI', 'Possível indisponibilidade dos sistemas críticos por falha de infraestrutura.', 'Operacional', 'Muito Alto', 'Baixo', 'open', 5, 2, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-05-15'),
('Não Conformidade LGPD', 'Risco de multas e sanções por descumprimento da Lei Geral de Proteção de Dados.', 'Compliance', 'Alto', 'Alto', 'open', 4, 4, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-03-31'),
('Ataque de Ransomware', 'Possibilidade de ataque cibernético que criptografe dados críticos da organização.', 'Cibersegurança', 'Muito Alto', 'Médio', 'mitigated', 5, 3, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1), '2024-06-30');

-- Inserir incidentes de segurança fictícios
INSERT INTO public.security_incidents (title, description, incident_type, severity, status, detection_date, affected_systems, reported_by, assigned_to) VALUES
('Tentativa de Phishing Detectada', 'E-mails suspeitos de phishing foram detectados e bloqueados pelo sistema de segurança.', 'Phishing', 'Médio', 'resolved', '2024-01-15 09:30:00', 'Sistema de Email, Firewall', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('Acesso Não Autorizado ao Sistema', 'Tentativa de acesso não autorizado ao sistema de gestão foi detectada e bloqueada.', 'Acesso Não Autorizado', 'Alto', 'investigating', '2024-01-20 14:45:00', 'Sistema de Gestão, Active Directory', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('Malware Detectado em Workstation', 'Software malicioso foi detectado e removido de uma estação de trabalho.', 'Malware', 'Baixo', 'resolved', '2024-01-18 11:20:00', 'Workstation - WS001', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1));

-- Inserir políticas fictícias
INSERT INTO public.policies (title, description, category, version, status, document_type, effective_date, review_date, owner_id, created_by) VALUES
('Política de Segurança da Informação', 'Política corporativa que define diretrizes e responsabilidades para proteção da informação.', 'Segurança', '2.1', 'approved', 'Política', '2023-01-01', '2024-12-31', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('Política de Uso de Recursos de TI', 'Define as regras para uso adequado dos recursos tecnológicos da empresa.', 'Tecnologia', '1.5', 'approved', 'Política', '2023-06-01', '2024-05-31', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('Política de Proteção de Dados Pessoais', 'Estabelece procedimentos para proteção de dados pessoais conforme LGPD.', 'Privacidade', '1.2', 'draft', 'Política', NULL, NULL, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('Procedimento de Resposta a Incidentes', 'Procedimentos detalhados para resposta e tratamento de incidentes de segurança.', 'Segurança', '1.8', 'approved', 'Procedimento', '2023-03-15', '2024-03-14', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1));

-- Inserir relatórios de auditoria fictícios
INSERT INTO public.audit_reports (title, audit_type, scope, findings, recommendations, status, start_date, end_date, auditor_id) VALUES
('Auditoria de Segurança da Informação - 2023', 'Interna', 'Avaliação dos controles de segurança da informação conforme ISO 27001', 'Identificadas 12 não conformidades menores e 3 oportunidades de melhoria nos controles de acesso.', 'Implementar autenticação multifator em todos os sistemas críticos e revisar matriz de acesso.', 'published', '2023-10-01', '2023-11-15', (SELECT id FROM auth.users LIMIT 1)),
('Auditoria de Conformidade LGPD', 'Externa', 'Verificação do atendimento aos requisitos da Lei Geral de Proteção de Dados', 'Empresa está 85% conforme com os requisitos da LGPD. Necessário ajustes nos processos de consentimento.', 'Atualizar formulários de consentimento e implementar portal de direitos do titular.', 'draft', '2024-01-08', '2024-02-20', (SELECT id FROM auth.users LIMIT 1)),
('Auditoria de Fornecedores Críticos', 'Interna', 'Avaliação dos controles de segurança de fornecedores classificados como alto risco', 'Dois fornecedores apresentaram gaps significativos nos controles de proteção de dados.', 'Solicitar planos de ação corretiva dos fornecedores e revisar contratos.', 'published', '2023-09-01', '2023-10-30', (SELECT id FROM auth.users LIMIT 1));