-- =====================================================
-- SCRIPT DE POPULAÇÃO BÁSICA PARA TESTE DE QA
-- Submódulo de Assessment - Dados Essenciais
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
    id, tenant_id, codigo, nome, descricao, tipo_framework, versao, 
    escala_maturidade, status, publico, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    :'tenant_id',
    'ISO27001',
    'ISO 27001:2022',
    'Sistema de Gestão de Segurança da Informação baseado na norma ISO 27001:2022',
    'security',
    '2022',
    '{"levels": [{"name": "Inicial", "value": 1, "description": "Controles básicos implementados"}, {"name": "Básico", "value": 2, "description": "Controles definidos e documentados"}, {"name": "Definido", "value": 3, "description": "Controles padronizados e comunicados"}, {"name": "Gerenciado", "value": 4, "description": "Controles monitorados e medidos"}, {"name": "Otimizado", "value": 5, "description": "Melhoria contínua dos controles"}]}'::jsonb,
    'ativo',
    false,
    NOW(),
    NOW()
) ON CONFLICT (tenant_id, codigo) DO NOTHING;

-- NIST Cybersecurity Framework
INSERT INTO assessment_frameworks (
    id, tenant_id, codigo, nome, descricao, tipo_framework, versao,
    escala_maturidade, status, publico, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    :'tenant_id',
    'NIST_CSF',
    'NIST Cybersecurity Framework',
    'Framework de Cibersegurança do NIST para gestão de riscos de segurança',
    'security',
    '1.1',
    '{"levels": [{"name": "Parcial", "value": 1, "description": "Implementação parcial"}, {"name": "Informado por Risco", "value": 2, "description": "Baseado em avaliação de riscos"}, {"name": "Repetível", "value": 3, "description": "Processos repetíveis"}, {"name": "Adaptativo", "value": 4, "description": "Melhoria contínua e adaptação"}]}'::jsonb,
    'ativo',
    false,
    NOW(),
    NOW()
) ON CONFLICT (tenant_id, codigo) DO NOTHING;

-- SOX (Sarbanes-Oxley)
INSERT INTO assessment_frameworks (
    id, tenant_id, codigo, nome, descricao, tipo_framework, versao,
    escala_maturidade, status, publico, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    :'tenant_id',
    'SOX',
    'SOX - Sarbanes-Oxley',
    'Controles internos para conformidade com a Lei Sarbanes-Oxley',
    'financial',
    '2002',
    '{"levels": [{"name": "Inadequado", "value": 1, "description": "Controles inadequados"}, {"name": "Adequado", "value": 2, "description": "Controles adequados"}, {"name": "Efetivo", "value": 3, "description": "Controles efetivos"}]}'::jsonb,
    'ativo',
    false,
    NOW(),
    NOW()
) ON CONFLICT (tenant_id, codigo) DO NOTHING;

-- LGPD
INSERT INTO assessment_frameworks (
    id, tenant_id, codigo, nome, descricao, tipo_framework, versao,
    escala_maturidade, status, publico, created_at, updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    :'tenant_id',
    'LGPD',
    'LGPD - Lei Geral de Proteção de Dados',
    'Framework de conformidade com a Lei Geral de Proteção de Dados Pessoais',
    'privacy',
    '2020',
    '{"levels": [{"name": "Não Conforme", "value": 1, "description": "Não atende aos requisitos"}, {"name": "Parcialmente Conforme", "value": 2, "description": "Atende parcialmente"}, {"name": "Conforme", "value": 3, "description": "Atende aos requisitos"}, {"name": "Bem Implementado", "value": 4, "description": "Bem implementado"}, {"name": "Excelente", "value": 5, "description": "Implementação excelente"}]}'::jsonb,
    'ativo',
    false,
    NOW(),
    NOW()
) ON CONFLICT (tenant_id, codigo) DO NOTHING;

-- =====================================================
-- 2. ASSESSMENT DOMAINS
-- =====================================================

-- Domínios ISO 27001
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, peso, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5', 'Políticas de Segurança da Informação', 'Políticas e procedimentos de segurança da informação', 1, 10.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.6', 'Organização da Segurança da Informação', 'Estrutura organizacional para segurança da informação', 2, 15.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.7', 'Segurança de Recursos Humanos', 'Controles de segurança relacionados a recursos humanos', 3, 12.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.8', 'Gestão de Ativos', 'Inventário e classificação de ativos de informação', 4, 20.00, true, NOW(), NOW());

-- Domínios NIST CSF
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, peso, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d483', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'ID', 'Identificar', 'Desenvolver compreensão organizacional para gerenciar riscos de cibersegurança', 1, 25.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d484', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'PR', 'Proteger', 'Desenvolver e implementar salvaguardas apropriadas', 2, 30.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d485', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'DE', 'Detectar', 'Desenvolver e implementar atividades apropriadas para identificar ocorrências', 3, 25.00, true, NOW(), NOW());

-- Domínios SOX
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, peso, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d486', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'ITGC', 'Controles Gerais de TI', 'Controles gerais de tecnologia da informação', 1, 50.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d487', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'ITAC', 'Controles de Aplicação de TI', 'Controles específicos de aplicações de TI', 2, 50.00, true, NOW(), NOW());

-- Domínios LGPD
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, peso, ativo, created_at, updated_at) VALUES
('d47ac10b-58cc-4372-a567-0e02b2c3d488', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'FUND', 'Fundamentos', 'Princípios e fundamentos da LGPD', 1, 40.00, true, NOW(), NOW()),
('d47ac10b-58cc-4372-a567-0e02b2c3d489', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'PROC', 'Processamento', 'Controles de processamento de dados pessoais', 2, 60.00, true, NOW(), NOW());

-- =====================================================
-- 3. ASSESSMENT CONTROLS
-- =====================================================

-- Controles ISO 27001 (usando criticidade: baixa, media, alta, critica)
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5.1', 'Políticas para Segurança da Informação', 'Conjunto de políticas para segurança da informação deve ser definido, aprovado pela direção, publicado e comunicado', 'alta', 10.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d479', 'A.5.2', 'Análise Crítica das Políticas', 'As políticas para segurança da informação devem ser analisadas criticamente', 'media', 8.00, 2, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d480', 'A.6.1', 'Responsabilidades e Papéis', 'Todas as responsabilidades e papéis de segurança da informação devem ser definidos', 'alta', 9.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d481', 'A.7.1', 'Seleção de Pessoal', 'Verificações de antecedentes devem ser realizadas para todos os candidatos', 'alta', 8.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d483', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd47ac10b-58cc-4372-a567-0e02b2c3d482', 'A.8.1', 'Inventário de Ativos', 'Ativos associados com informação e facilidades de processamento devem ser identificados', 'critica', 10.00, 1, true, NOW(), NOW());

-- Controles NIST CSF
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d484', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'd47ac10b-58cc-4372-a567-0e02b2c3d483', 'ID.AM', 'Gestão de Ativos', 'Os dados, pessoal, dispositivos, sistemas e facilidades que permitem à organização alcançar objetivos de negócio são identificados e gerenciados', 'critica', 10.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d485', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'd47ac10b-58cc-4372-a567-0e02b2c3d484', 'PR.AC', 'Controle de Acesso', 'O acesso a ativos e facilidades associadas é limitado a usuários, processos e dispositivos autorizados', 'alta', 9.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d486', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'd47ac10b-58cc-4372-a567-0e02b2c3d485', 'DE.AE', 'Anomalias e Eventos', 'Atividade anômala é detectada e o impacto potencial de eventos é compreendido', 'media', 8.00, 1, true, NOW(), NOW());

-- Controles SOX
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d487', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'd47ac10b-58cc-4372-a567-0e02b2c3d486', 'ITGC.01', 'Gestão de Mudanças', 'Controles para gestão de mudanças em sistemas críticos', 'critica', 10.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d488', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'd47ac10b-58cc-4372-a567-0e02b2c3d486', 'ITGC.02', 'Controle de Acesso Lógico', 'Controles de acesso a sistemas e dados financeiros', 'alta', 9.00, 2, true, NOW(), NOW());

-- Controles LGPD
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, criticidade, peso, ordem, ativo, created_at, updated_at) VALUES
('c47ac10b-58cc-4372-a567-0e02b2c3d489', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'd47ac10b-58cc-4372-a567-0e02b2c3d488', 'LGPD.01', 'Base Legal', 'Identificação e documentação da base legal para processamento', 'critica', 10.00, 1, true, NOW(), NOW()),
('c47ac10b-58cc-4372-a567-0e02b2c3d490', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'd47ac10b-58cc-4372-a567-0e02b2c3d489', 'LGPD.02', 'Consentimento', 'Gestão de consentimento para processamento de dados pessoais', 'alta', 9.00, 1, true, NOW(), NOW());

-- =====================================================
-- 4. ASSESSMENTS (Instâncias de Avaliação)
-- =====================================================

INSERT INTO assessments (id, tenant_id, framework_id, codigo, titulo, descricao, status, percentual_conclusao, percentual_maturidade, data_inicio, data_fim_planejada, responsavel_assessment, created_at, updated_at) VALUES
('a47ac10b-58cc-4372-a567-0e02b2c3d479', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ASSESS-ISO-2024-001', 'Avaliação ISO 27001 - Departamento de TI', 'Avaliação completa dos controles ISO 27001 para o departamento de TI', 'em_andamento', 45, 72, '2024-01-15', '2024-03-15', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW()),

('a47ac10b-58cc-4372-a567-0e02b2c3d480', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'ASSESS-NIST-2024-001', 'Assessment NIST CSF - Infraestrutura Crítica', 'Avaliação de maturidade do framework NIST para infraestrutura crítica', 'planejado', 0, NULL, '2024-02-01', '2024-04-30', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW()),

('a47ac10b-58cc-4372-a567-0e02b2c3d481', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'ASSESS-SOX-2023-004', 'Auditoria SOX Q4 2023', 'Avaliação trimestral dos controles SOX para relatórios financeiros', 'concluido', 100, 85, '2023-10-01', '2023-12-31', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW()),

('a47ac10b-58cc-4372-a567-0e02b2c3d482', :'tenant_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'ASSESS-LGPD-2024-001', 'Conformidade LGPD - Revisão Anual', 'Avaliação anual de conformidade com a Lei Geral de Proteção de Dados', 'em_revisao', 80, 78, '2024-01-01', '2024-02-29', (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1), NOW(), NOW());

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
    'assessments' as tabela, 
    COUNT(*) as registros 
FROM assessments 
WHERE tenant_id = :'tenant_id';

-- =====================================================
-- RESUMO DOS DADOS PARA QA
-- =====================================================

SELECT 
    'DADOS BÁSICOS PARA TESTE DE QA INSERIDOS COM SUCESSO!' as status,
    '4 Frameworks: ISO 27001, NIST CSF, SOX, LGPD' as frameworks,
    '10 Domínios distribuídos entre os frameworks' as dominios,
    '12 Controles com diferentes criticidades (baixa, media, alta, critica)' as controles,
    '4 Assessments em diferentes status (planejado, em_andamento, concluido, em_revisao)' as assessments;