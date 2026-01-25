-- =====================================================
-- SCRIPT COMPLETO PARA POPULAR TODAS AS ABAS (CORRIGIDO)
-- Gaps, Planos e Itens para TODOS os Assessments
-- Tenant ID: 46b1c048-85a1-423b-96fc-776007c8de1f
-- =====================================================

-- Definir tenant_id como variável
\set tenant_id '46b1c048-85a1-423b-96fc-776007c8de1f'

BEGIN;

-- =====================================================
-- 1. GAPS ADICIONAIS PARA OUTROS ASSESSMENTS
-- =====================================================

-- Gaps para Assessment NIST CSF
INSERT INTO assessment_responses (
    tenant_id, assessment_id, question_id, control_id,
    status_conformidade, percentual_conformidade, gap_identificado,
    criticidade_gap, justificativa, comentarios,
    created_at, updated_at
) VALUES 
-- Gap 6: Framework de Cibersegurança (Crítico)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480', -- Assessment NIST
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 5),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 5),
    'nao_conforme',
    15.0,
    true,
    'critica',
    'Framework de cibersegurança não implementado adequadamente',
    'Falta estrutura formal baseada no NIST CSF para gestão de riscos de cibersegurança',
    NOW(),
    NOW()
),
-- Gap 7: Detecção de Ameaças (Alto)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 6),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 6),
    'parcialmente_conforme',
    45.0,
    true,
    'alta',
    'Capacidade de detecção de ameaças limitada',
    'Ferramentas de detecção básicas implementadas mas sem correlação avançada',
    NOW(),
    NOW()
),
-- Gap 8: Resposta a Incidentes (Médio)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 7),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 7),
    'parcialmente_conforme',
    65.0,
    true,
    'media',
    'Processo de resposta a incidentes precisa de melhorias',
    'Procedimentos existem mas não são testados regularmente',
    NOW(),
    NOW()
);

-- Gaps para outros assessments (usando IDs disponíveis)
INSERT INTO assessment_responses (
    tenant_id, assessment_id, question_id, control_id,
    status_conformidade, percentual_conformidade, gap_identificado,
    criticidade_gap, justificativa, comentarios,
    created_at, updated_at
) VALUES 
-- Gap 9: Assessment adicional
(
    :'tenant_id',
    '9b695417-f8c1-47bb-8435-7d44f83a5e7f', -- Outro assessment
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 0),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 8),
    'nao_conforme',
    20.0,
    true,
    'alta',
    'Controle de segurança física inadequado',
    'Acesso físico aos servidores não é adequadamente controlado',
    NOW(),
    NOW()
),
-- Gap 10: Assessment adicional
(
    :'tenant_id',
    '9b695417-f8c1-47bb-8435-7d44f83a5e7f',
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 9),
    'parcialmente_conforme',
    55.0,
    true,
    'media',
    'Gestão de vulnerabilidades precisa ser aprimorada',
    'Processo de patch management não é sistemático',
    NOW(),
    NOW()
);

-- =====================================================
-- 2. ITENS DE AÇÃO ADICIONAIS
-- =====================================================

-- Itens para Plano NIST CSF
INSERT INTO assessment_action_items (
    tenant_id, action_plan_id, response_id, control_id,
    codigo, titulo, descricao, ordem, tipo_acao, categoria,
    data_inicio_planejada, data_fim_planejada, responsavel, 
    status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    comentarios, observacoes, created_at, updated_at, created_by
) VALUES 
-- Item 8: Implementar Framework NIST CSF
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480' LIMIT 1),
    (SELECT id FROM assessment_responses WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480' AND criticidade_gap = 'critica' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 5),
    'IT-NIST-001',
    'Implementar Framework NIST CSF',
    'Estabelecer framework estruturado de cibersegurança baseado no NIST CSF com todas as funções: Identificar, Proteger, Detectar, Responder e Recuperar',
    1,
    'implementacao',
    'Framework',
    '2024-03-01',
    '2024-09-30',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'pendente',
    0,
    'critica',
    'Estabelecimento de programa estruturado de cibersegurança alinhado com melhores práticas',
    75000.00,
    '{"Framework NIST CSF implementado", "Políticas de cibersegurança atualizadas", "Procedimentos documentados", "Equipe treinada"}',
    '{"Todas as 5 funções do NIST implementadas", "Políticas aprovadas", "Procedimentos testados", "Equipe certificada"}',
    'Aguardando aprovação do orçamento para iniciar implementação.',
    'Projeto estratégico para melhoria da postura de cibersegurança.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 9: Melhorar Detecção de Ameaças
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480' LIMIT 1),
    (SELECT id FROM assessment_responses WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480' AND criticidade_gap = 'alta' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 6),
    'IT-NIST-002',
    'Aprimorar Capacidades de Detecção de Ameaças',
    'Implementar soluções avançadas de detecção de ameaças com correlação de eventos e análise comportamental',
    2,
    'melhoria',
    'Detecção',
    '2024-04-01',
    '2024-07-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'pendente',
    0,
    'alta',
    'Melhoria significativa na capacidade de detectar ameaças avançadas e ataques sofisticados',
    60000.00,
    '{"SIEM avançado configurado", "Regras de correlação implementadas", "Dashboard de ameaças", "Alertas automatizados"}',
    '{"Detecção 24/7 operacional", "Tempo de detecção < 15 minutos", "Falsos positivos < 5%", "Equipe treinada"}',
    'Dependente da implementação do framework NIST CSF.',
    'Integração com ferramentas existentes de segurança.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 10: Otimizar Resposta a Incidentes
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480' LIMIT 1),
    (SELECT id FROM assessment_responses WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480' AND criticidade_gap = 'media' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 7),
    'IT-NIST-003',
    'Otimizar Processo de Resposta a Incidentes',
    'Melhorar procedimentos de resposta a incidentes com automação, playbooks e testes regulares',
    3,
    'melhoria',
    'Resposta',
    '2024-05-01',
    '2024-08-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'pendente',
    0,
    'media',
    'Redução do tempo de resposta a incidentes e melhoria da efetividade da contenção',
    40000.00,
    '{"Playbooks de resposta atualizados", "Automação implementada", "Testes trimestrais realizados", "Métricas de resposta"}',
    '{"Tempo de resposta < 30 minutos", "Contenção < 2 horas", "Testes aprovados", "Equipe certificada"}',
    'Aguardando conclusão das melhorias de detecção.',
    'Foco em automação para reduzir tempo de resposta.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- Itens para outros planos existentes
INSERT INTO assessment_action_items (
    tenant_id, action_plan_id, codigo, titulo, descricao, ordem,
    tipo_acao, categoria, data_inicio_planejada, data_fim_planejada,
    data_inicio_real, responsavel, status, percentual_conclusao,
    prioridade, impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    comentarios, observacoes, created_at, updated_at, created_by
) VALUES 
-- Item 11: Para plano adicional
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND codigo LIKE 'PA-%' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d479' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d482' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d481' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d480' LIMIT 1),
    'IT-GEN-001',
    'Implementar Controles de Segurança Física',
    'Estabelecer controles adequados de segurança física para proteção de ativos críticos',
    1,
    'implementacao',
    'Segurança Física',
    '2024-02-15',
    '2024-04-30',
    '2024-02-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'em_andamento',
    40,
    'alta',
    'Melhoria significativa na proteção física de ativos críticos',
    25000.00,
    '{"Controles de acesso físico", "Câmeras de segurança", "Sistemas de alarme", "Procedimentos de segurança"}',
    '{"Acesso controlado 24/7", "Monitoramento ativo", "Alarmes funcionais", "Procedimentos testados"}',
    'Implementação em andamento. Instalação de equipamentos em curso.',
    'Previsão de conclusão para abril/2024.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 12: Para outro plano
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND codigo LIKE 'PA-%' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d479' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d482' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d481' AND assessment_id != 'a47ac10b-58cc-4372-a567-0e02b2c3d480' LIMIT 1 OFFSET 1),
    'IT-GEN-002',
    'Aprimorar Gestão de Vulnerabilidades',
    'Implementar processo sistemático de gestão de vulnerabilidades com automação e métricas',
    2,
    'melhoria',
    'Vulnerabilidades',
    '2024-03-01',
    '2024-06-30',
    NULL,
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'pendente',
    0,
    'media',
    'Redução do tempo de correção de vulnerabilidades e melhoria da postura de segurança',
    35000.00,
    '{"Scanner de vulnerabilidades", "Processo automatizado", "Dashboard de métricas", "Relatórios executivos"}',
    '{"Scans automatizados", "Correção < 30 dias", "Métricas atualizadas", "Relatórios mensais"}',
    'Aguardando aprovação para aquisição de ferramentas.',
    'Integração com ferramentas existentes de segurança.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

COMMIT;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Contagem final de registros
SELECT 
    'assessment_responses (gaps)' as tabela, 
    COUNT(*) as registros 
FROM assessment_responses 
WHERE tenant_id = :'tenant_id' AND gap_identificado = true

UNION ALL

SELECT 
    'assessment_action_plans' as tabela, 
    COUNT(*) as registros 
FROM assessment_action_plans 
WHERE tenant_id = :'tenant_id'

UNION ALL

SELECT 
    'assessment_action_items' as tabela, 
    COUNT(*) as registros 
FROM assessment_action_items 
WHERE tenant_id = :'tenant_id';

-- =====================================================
-- RESUMO FINAL PARA QA
-- =====================================================

SELECT 
    'DADOS COMPLETOS POPULADOS COM SUCESSO!' as status,
    '10 Gaps identificados para múltiplos assessments' as gaps,
    'Planos de ação para todos os assessments' as planos,
    '12 Itens de ação com status variados' as itens,
    'Dados prontos para teste completo de QA e CRUD' as observacao;