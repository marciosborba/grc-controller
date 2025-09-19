-- =====================================================
-- SCRIPT DE POPULAÇÃO DE DADOS PARA TESTE DE QA
-- Submódulo de Assessment - Dados Completos
-- Tenant ID: 46b1c048-85a1-423b-96fc-776007c8de1f
-- =====================================================

-- Definir tenant_id como variável
\set tenant_id '46b1c048-85a1-423b-96fc-776007c8de1f'

BEGIN;

-- =====================================================
-- 1. ASSESSMENT FRAMEWORKS
-- =====================================================

-- ISO 27001
INSERT INTO assessment_frameworks (
    id, tenant_id, nome, descricao, tipo_framework, versao, 
    escala_maturidade, ativo, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    :'tenant_id',
    'ISO 27001:2022',
    'Sistema de Gestão de Segurança da Informação baseado na norma ISO 27001:2022',
    'ISO_27001',
    '2022',
    '{"escala": "1-5", "niveis": ["1-Inicial", "2-Básico", "3-Definido", "4-Gerenciado", "5-Otimizado"]}'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- NIST Cybersecurity Framework
INSERT INTO assessment_frameworks (
    id, tenant_id, nome, descricao, tipo_framework, versao,
    escala_maturidade, ativo, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    :'tenant_id',
    'NIST Cybersecurity Framework',
    'Framework de Cibersegurança do NIST para gestão de riscos de segurança',
    'NIST_CSF',
    '1.1',
    '{"escala": "1-4", "niveis": ["1-Parcial", "2-Informado por Risco", "3-Repetível", "4-Adaptativo"]}'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- SOX (Sarbanes-Oxley)
INSERT INTO assessment_frameworks (
    id, tenant_id, nome, descricao, tipo_framework, versao,
    escala_maturidade, ativo, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    :'tenant_id',
    'SOX - Sarbanes-Oxley',
    'Controles internos para conformidade com a Lei Sarbanes-Oxley',
    'SOX',
    '2002',
    '{"escala": "1-3", "niveis": ["1-Inadequado", "2-Adequado", "3-Efetivo"]}'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- LGPD
INSERT INTO assessment_frameworks (
    id, tenant_id, nome, descricao, tipo_framework, versao,
    escala_maturidade, ativo, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    :'tenant_id',
    'LGPD - Lei Geral de Proteção de Dados',
    'Framework de conformidade com a Lei Geral de Proteção de Dados Pessoais',
    'LGPD',
    '2020',
    '{"escala": "1-5", "niveis": ["1-Não Conforme", "2-Parcialmente Conforme", "3-Conforme", "4-Bem Implementado", "5-Excelente"]}'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. ASSESSMENT DOMAINS
-- =====================================================

-- Domínios ISO 27001
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5', 'Políticas de Segurança da Informação', 'Políticas e procedimentos de segurança da informação', 1, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.6', 'Organização da Segurança da Informação', 'Estrutura organizacional para segurança da informação', 2, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.7', 'Segurança de Recursos Humanos', 'Controles de segurança relacionados a recursos humanos', 3, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.8', 'Gestão de Ativos', 'Inventário e classificação de ativos de informação', 4, true, NOW(), NOW());

-- Domínios NIST CSF
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d483', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'ID', 'Identificar', 'Desenvolver compreensão organizacional para gerenciar riscos de cibersegurança', 1, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d484', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'PR', 'Proteger', 'Desenvolver e implementar salvaguardas apropriadas', 2, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d485', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'DE', 'Detectar', 'Desenvolver e implementar atividades apropriadas para identificar ocorrências', 3, true, NOW(), NOW());

-- Domínios SOX
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d486', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'ITGC', 'Controles Gerais de TI', 'Controles gerais de tecnologia da informação', 1, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d487', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'ITAC', 'Controles de Aplicação de TI', 'Controles específicos de aplicações de TI', 2, true, NOW(), NOW());

-- Domínios LGPD
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d488', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'FUND', 'Fundamentos', 'Princípios e fundamentos da LGPD', 1, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d489', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'PROC', 'Processamento', 'Controles de processamento de dados pessoais', 2, true, NOW(), NOW());

-- =====================================================
-- 3. ASSESSMENT CONTROLS
-- =====================================================

-- Controles ISO 27001
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5.1', 'Políticas para Segurança da Informação', 'Conjunto de políticas para segurança da informação deve ser definido, aprovado pela direção, publicado e comunicado', 'ALTA', 10, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5.2', 'Análise Crítica das Políticas', 'As políticas para segurança da informação devem ser analisadas criticamente', 'MEDIA', 8, 2, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d480', 'A.6.1', 'Responsabilidades e Papéis', 'Todas as responsabilidades e papéis de segurança da informação devem ser definidos', 'ALTA', 9, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d481', 'A.7.1', 'Seleção de Pessoal', 'Verificações de antecedentes devem ser realizadas para todos os candidatos', 'ALTA', 8, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d483', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d482', 'A.8.1', 'Inventário de Ativos', 'Ativos associados com informação e facilidades de processamento devem ser identificados', 'ALTA', 10, 1, true, NOW(), NOW());

-- Controles NIST CSF
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d484', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'd47ac10b-58cc-4372-a567-0e02b2c3d483', 'ID.AM', 'Gestão de Ativos', 'Os dados, pessoal, dispositivos, sistemas e facilidades que permitem à organização alcançar objetivos de negócio são identificados e gerenciados', 'ALTA', 10, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d485', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'd47ac10b-58cc-4372-a567-0e02b2c3d484', 'PR.AC', 'Controle de Acesso', 'O acesso a ativos e facilidades associadas é limitado a usuários, processos e dispositivos autorizados', 'ALTA', 9, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d486', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'd47ac10b-58cc-4372-a567-0e02b2c3d485', 'DE.AE', 'Anomalias e Eventos', 'Atividade anômala é detectada e o impacto potencial de eventos é compreendido', 'MEDIA', 8, 1, true, NOW(), NOW());

-- Controles SOX
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d487', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'd47ac10b-58cc-4372-a567-0e02b2c3d486', 'ITGC.01', 'Gestão de Mudanças', 'Controles para gestão de mudanças em sistemas críticos', 'ALTA', 10, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d488', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'd47ac10b-58cc-4372-a567-0e02b2c3d486', 'ITGC.02', 'Controle de Acesso Lógico', 'Controles de acesso a sistemas e dados financeiros', 'ALTA', 9, 2, true, NOW(), NOW());

-- Controles LGPD
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d489', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'd47ac10b-58cc-4372-a567-0e02b2c3d488', 'LGPD.01', 'Base Legal', 'Identificação e documentação da base legal para processamento', 'ALTA', 10, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d490', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'd47ac10b-58cc-4372-a567-0e02b2c3d489', 'LGPD.02', 'Consentimento', 'Gestão de consentimento para processamento de dados pessoais', 'ALTA', 9, 1, true, NOW(), NOW());

-- =====================================================
-- 4. ASSESSMENT QUESTIONS
-- =====================================================

-- Questões ISO 27001 (diferentes tipos)
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, tipo_pergunta, opcoes_resposta, obrigatoria, peso, ordem, texto_ajuda, exemplos, ativa, created_at, updated_at) VALUES
('q47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5.1.Q1', 'A organização possui políticas de segurança da informação formalmente documentadas?', 'Verificar se existem políticas escritas e aprovadas', 'sim_nao', NULL, true, 10, 1, 'Procure por documentos oficiais de política de segurança aprovados pela alta direção', '["Política de Segurança da Informação", "Política de Uso Aceitável", "Política de Classificação da Informação"]', true, NOW(), NOW()),

('q47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5.1.Q2', 'Avalie o nível de maturidade das políticas de segurança da informação (1-5)', 'Escala de maturidade das políticas', 'escala', '{"min": 1, "max": 5, "labels": {"1": "Inexistente", "2": "Inicial", "3": "Definido", "4": "Gerenciado", "5": "Otimizado"}}', true, 8, 2, 'Considere completude, atualização, comunicação e aderência às políticas', '["1 - Não há políticas", "3 - Políticas existem mas não são atualizadas", "5 - Políticas completas e regularmente revisadas"]', true, NOW(), NOW()),

('q47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d480', 'A.5.2.Q1', 'Quais são os métodos utilizados para análise crítica das políticas?', 'Descreva os processos de revisão', 'texto_livre', NULL, true, 7, 1, 'Descreva detalhadamente como as políticas são revisadas, por quem e com que frequência', '["Revisão anual pelo comitê de segurança", "Análise após incidentes", "Revisão por auditoria interna"]', true, NOW(), NOW()),

('q47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d481', 'A.6.1.Q1', 'Quais papéis de segurança estão definidos na organização?', 'Selecione todos os papéis existentes', 'multipla_escolha', '{"opcoes": ["CISO - Chief Information Security Officer", "Oficial de Proteção de Dados", "Administrador de Segurança", "Analista de Segurança", "Gestor de Riscos", "Auditor Interno", "Responsável por Continuidade de Negócios"]}', true, 9, 1, 'Marque todos os papéis formalmente definidos com responsabilidades documentadas', '["CISO com responsabilidades definidas", "Comitê de segurança estabelecido"]', true, NOW(), NOW()),

('q47ac10b-58cc-4372-a567-0e02b2c3d483', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d482', 'A.7.1.Q1', 'Qual é o percentual de funcionários que passaram por verificação de antecedentes?', 'Informe o percentual numérico', 'numerica', '{"min": 0, "max": 100, "unidade": "%"}', true, 8, 1, 'Considere apenas funcionários em posições sensíveis ou com acesso a informações críticas', '["100% para cargos de TI", "80% para todos os funcionários"]', true, NOW(), NOW()),

('q47ac10b-58cc-4372-a567-0e02b2c3d484', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d483', 'A.8.1.Q1', 'Quando foi realizada a última atualização do inventário de ativos?', 'Data da última atualização completa', 'data', NULL, true, 9, 1, 'Considere a data da última revisão completa do inventário de ativos de TI', '["Inventário atualizado mensalmente", "Revisão trimestral completa"]', true, NOW(), NOW());

-- Questões NIST CSF
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, tipo_pergunta, opcoes_resposta, obrigatoria, peso, ordem, texto_ajuda, exemplos, ativa, created_at, updated_at) VALUES
('q47ac10b-58cc-4372-a567-0e02b2c3d485', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d484', 'ID.AM.Q1', 'A organização mantém um inventário atualizado de todos os ativos de TI?', 'Verificar existência e atualização do inventário', 'sim_nao', NULL, true, 10, 1, 'Verifique se há um inventário formal e atualizado de hardware, software e dados', '["CMDB atualizado", "Planilha de inventário", "Ferramenta de descoberta automática"]', true, NOW(), NOW()),

('q47ac10b-58cc-4372-a567-0e02b2c3d486', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d485', 'PR.AC.Q1', 'Avalie a maturidade dos controles de acesso (1-4)', 'Nível de maturidade NIST', 'escala', '{"min": 1, "max": 4, "labels": {"1": "Parcial", "2": "Informado por Risco", "3": "Repetível", "4": "Adaptativo"}}', true, 9, 1, 'Considere políticas, implementação, monitoramento e melhoria contínua', '["1 - Controles básicos", "4 - Controles adaptativos baseados em risco"]', true, NOW(), NOW());

-- Questões SOX
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, tipo_pergunta, opcoes_resposta, obrigatoria, peso, ordem, texto_ajuda, exemplos, ativa, created_at, updated_at) VALUES
('q47ac10b-58cc-4372-a567-0e02b2c3d487', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d487', 'ITGC.01.Q1', 'O processo de gestão de mudanças está adequadamente implementado?', 'Avaliação da efetividade dos controles', 'escala', '{"min": 1, "max": 3, "labels": {"1": "Inadequado", "2": "Adequado", "3": "Efetivo"}}', true, 10, 1, 'Considere aprovações, testes, documentação e rollback', '["Processo formal com aprovações", "Testes obrigatórios", "Documentação completa"]', true, NOW(), NOW());

-- Questões LGPD
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, tipo_pergunta, opcoes_resposta, obrigatoria, peso, ordem, texto_ajuda, exemplos, ativa, created_at, updated_at) VALUES
('q47ac10b-58cc-4372-a567-0e02b2c3d488', :'tenant_id', 'c47ac10b-58cc-4372-a567-0e02b2c3d489', 'LGPD.01.Q1', 'Quais bases legais são utilizadas para processamento de dados pessoais?', 'Selecione todas as bases aplicáveis', 'multipla_escolha', '{"opcoes": ["Consentimento do titular", "Cumprimento de obrigação legal", "Execução de contrato", "Exercício regular de direitos", "Proteção da vida", "Tutela da saúde", "Interesse legítimo", "Proteção do crédito"]}', true, 10, 1, 'Identifique todas as bases legais utilizadas pela organização conforme Art. 7º da LGPD', '["Consentimento para marketing", "Obrigação legal para retenção fiscal"]', true, NOW(), NOW());

-- =====================================================
-- 5. ASSESSMENTS (Instâncias de Avaliação)
-- =====================================================

INSERT INTO assessments (id, tenant_id, framework_id, codigo, titulo, descricao, status, percentual_conclusao, percentual_maturidade, data_inicio, data_fim_planejada, responsavel_assessment, created_at, updated_at) VALUES
('a47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ASSESS-ISO-2024-001', 'Avaliação ISO 27001 - Departamento de TI', 'Avaliação completa dos controles ISO 27001 para o departamento de TI', 'em_andamento', 45, 72, '2024-01-15', '2024-03-15', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW()),

('a47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'ASSESS-NIST-2024-001', 'Assessment NIST CSF - Infraestrutura Crítica', 'Avaliação de maturidade do framework NIST para infraestrutura crítica', 'planejado', 0, NULL, '2024-02-01', '2024-04-30', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW()),

('a47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'ASSESS-SOX-2023-004', 'Auditoria SOX Q4 2023', 'Avaliação trimestral dos controles SOX para relatórios financeiros', 'concluido', 100, 85, '2023-10-01', '2023-12-31', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW()),

('a47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'ASSESS-LGPD-2024-001', 'Conformidade LGPD - Revisão Anual', 'Avaliação anual de conformidade com a Lei Geral de Proteção de Dados', 'em_revisao', 80, 78, '2024-01-01', '2024-02-29', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW());

-- =====================================================
-- 6. ASSESSMENT RESPONSES (Respostas de Exemplo)
-- =====================================================

-- Respostas para Assessment ISO 27001
INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_booleana, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d479', 'q47ac10b-58cc-4372-a567-0e02b2c3d479', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', true, 5, 5, 100, 'conforme', 'Políticas de segurança documentadas e aprovadas pela diretoria em Janeiro/2024', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW(), NOW());

INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_numerica, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d479', 'q47ac10b-58cc-4372-a567-0e02b2c3d480', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', 4, 4, 5, 80, 'conforme', 'Políticas bem estruturadas mas necessitam de revisão mais frequente', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW(), NOW());

INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_texto, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d479', 'q47ac10b-58cc-4372-a567-0e02b2c3d481', 'c47ac10b-58cc-4372-a567-0e02b2c3d480', 'Revisão anual pelo comitê de segurança, análise após incidentes significativos e revisão por auditoria interna a cada 18 meses. Processo documentado no procedimento PS-001.', 4, 5, 80, 'conforme', 'Processo bem definido mas poderia ser mais frequente', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW(), NOW());

INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_multipla_escolha, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d479', 'q47ac10b-58cc-4372-a567-0e02b2c3d482', 'c47ac10b-58cc-4372-a567-0e02b2c3d481', '["CISO - Chief Information Security Officer", "Administrador de Segurança", "Analista de Segurança", "Gestor de Riscos"]', 4, 5, 80, 'conforme', 'Principais papéis definidos, falta apenas Oficial de Proteção de Dados', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW(), NOW());

INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_numerica, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d483', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d479', 'q47ac10b-58cc-4372-a567-0e02b2c3d483', 'c47ac10b-58cc-4372-a567-0e02b2c3d482', 85, 4, 5, 80, 'conforme', '85% dos funcionários em posições críticas passaram por verificação. Meta é chegar a 100% até Q2/2024', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW(), NOW());

INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_data, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d484', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d479', 'q47ac10b-58cc-4372-a567-0e02b2c3d484', 'c47ac10b-58cc-4372-a567-0e02b2c3d483', '2024-01-10', 5, 5, 100, 'conforme', 'Inventário atualizado mensalmente através de ferramenta automatizada', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW(), NOW());

-- Respostas para Assessment SOX (concluído)
INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_numerica, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d485', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d481', 'q47ac10b-58cc-4372-a567-0e02b2c3d487', 'c47ac10b-58cc-4372-a567-0e02b2c3d487', 3, 3, 3, 100, 'conforme', 'Processo de gestão de mudanças totalmente efetivo com aprovações, testes e documentação completa', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), '2023-12-15', NOW(), NOW());

-- Respostas para Assessment LGPD
INSERT INTO assessment_responses (id, tenant_id, assessment_id, question_id, control_id, resposta_multipla_escolha, pontuacao_obtida, pontuacao_maxima, percentual_conformidade, status_conformidade, justificativa, respondido_por, data_resposta, created_at, updated_at) VALUES
('r47ac10b-58cc-4372-a567-0e02b2c3d486', :'tenant_id', 'a47ac10b-58cc-4372-a567-0e02b2c3d482', 'q47ac10b-58cc-4372-a567-0e02b2c3d488', 'c47ac10b-58cc-4372-a567-0e02b2c3d489', '["Consentimento do titular", "Cumprimento de obrigação legal", "Execução de contrato", "Interesse legítimo"]', 4, 5, 80, 'conforme', 'Principais bases legais mapeadas e documentadas. Necessário revisar alguns casos de interesse legítimo', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), '2024-01-20', NOW(), NOW());

COMMIT;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Contagem de registros inseridos
SELECT 
    'assessment_frameworks' as tabela, 
    COUNT(*) as registros 
FROM assessment_frameworks 
WHERE tenant_id = :'tenant_id'

UNION ALL

SELECT 
    'assessment_domains' as tabela, 
    COUNT(*) as registros 
FROM assessment_domains 
WHERE tenant_id = :'tenant_id'

UNION ALL

SELECT 
    'assessment_controls' as tabela, 
    COUNT(*) as registros 
FROM assessment_controls 
WHERE tenant_id = :'tenant_id'

UNION ALL

SELECT 
    'assessment_questions' as tabela, 
    COUNT(*) as registros 
FROM assessment_questions 
WHERE tenant_id = :'tenant_id'

UNION ALL

SELECT 
    'assessments' as tabela, 
    COUNT(*) as registros 
FROM assessments 
WHERE tenant_id = :'tenant_id'

UNION ALL

SELECT 
    'assessment_responses' as tabela, 
    COUNT(*) as registros 
FROM assessment_responses 
WHERE tenant_id = :'tenant_id';

-- =====================================================
-- RESUMO DOS DADOS PARA QA
-- =====================================================

SELECT 
    'RESUMO DOS DADOS PARA TESTE DE QA' as info,
    '4 Frameworks: ISO 27001, NIST CSF, SOX, LGPD' as frameworks,
    '9 Domínios distribuídos entre os frameworks' as dominios,
    '10 Controles com diferentes criticidades' as controles,
    '9 Questões de diferentes tipos (sim/não, escala, texto, múltipla escolha, numérica, data)' as questoes,
    '4 Assessments em diferentes status (planejado, em_andamento, concluido, em_revisao)' as assessments,
    '8 Respostas de exemplo para demonstrar CRUD' as respostas;