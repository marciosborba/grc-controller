-- =====================================================
-- SCRIPT SIMPLES PARA POPULAR GAPS E ITENS ADICIONAIS
-- Tenant ID: 46b1c048-85a1-423b-96fc-776007c8de1f
-- =====================================================

-- Definir tenant_id como variável
\set tenant_id '46b1c048-85a1-423b-96fc-776007c8de1f'

BEGIN;

-- =====================================================
-- 1. GAPS ADICIONAIS
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

-- =====================================================
-- 2. ITENS DE AÇÃO ADICIONAIS PARA PLANOS EXISTENTES
-- =====================================================

-- Itens para Plano NIST CSF (usando plano existente)
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
    'iniciado',
    25,
    'alta',
    'Melhoria significativa na capacidade de detectar ameaças avançadas e ataques sofisticados',
    60000.00,
    '{"SIEM avançado configurado", "Regras de correlação implementadas", "Dashboard de ameaças", "Alertas automatizados"}',
    '{"Detecção 24/7 operacional", "Tempo de detecção < 15 minutos", "Falsos positivos < 5%", "Equipe treinada"}',
    'Implementação iniciada. Configuração do SIEM em andamento.',
    'Integração com ferramentas existentes de segurança.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- Itens adicionais para planos ISO 27001 e LGPD
INSERT INTO assessment_action_items (
    tenant_id, action_plan_id, codigo, titulo, descricao, ordem,
    tipo_acao, categoria, data_inicio_planejada, data_fim_planejada,
    responsavel, status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    comentarios, observacoes, created_at, updated_at, created_by
) VALUES 
-- Item 10: Para plano ISO adicional
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d479' LIMIT 1),
    'IT-ISO-004',
    'Implementar Gestão de Incidentes de Segurança',
    'Estabelecer processo formal de gestão de incidentes de segurança da informação',
    4,
    'implementacao',
    'Incidentes',
    '2024-06-01',
    '2024-08-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'pendente',
    0,
    'alta',
    'Melhoria na capacidade de resposta e gestão de incidentes de segurança',
    30000.00,
    '{"Processo de gestão documentado", "Equipe de resposta treinada", "Ferramentas de gestão", "Métricas de incidentes"}',
    '{"Processo operacional", "Equipe certificada", "Ferramentas integradas", "Relatórios mensais"}',
    'Aguardando conclusão dos itens anteriores.',
    'Integração com monitoramento existente.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 11: Para plano LGPD adicional
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d482' LIMIT 1),
    'IT-LGPD-004',
    'Implementar Programa de Treinamento em Privacidade',
    'Desenvolver e implementar programa abrangente de treinamento em privacidade e proteção de dados',
    4,
    'treinamento',
    'Capacitação',
    '2024-04-01',
    '2024-06-30',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'em_andamento',
    50,
    'media',
    'Aumento da conscientização e competência da equipe em proteção de dados',
    20000.00,
    '{"Programa de treinamento", "Material didático", "Avaliações de conhecimento", "Certificações"}',
    '{"100% da equipe treinada", "Avaliações aprovadas", "Certificações obtidas", "Programa contínuo"}',
    'Treinamento em andamento. Primeira turma concluída.',
    'Programa será contínuo com atualizações regulares.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 12: Para plano SOX adicional
(
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE tenant_id = :'tenant_id' AND assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d481' LIMIT 1),
    'IT-SOX-003',
    'Implementar Controles de Segregação de Funções',
    'Estabelecer controles adequados de segregação de funções em processos financeiros críticos',
    3,
    'implementacao',
    'Controles',
    '2024-01-15',
    '2024-03-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'alta',
    'Redução de riscos de fraude e melhoria dos controles internos',
    15000.00,
    '{"Matriz de segregação", "Controles implementados", "Documentação atualizada", "Testes realizados"}',
    '{"Segregação adequada", "Controles efetivos", "Documentação aprovada", "Testes bem-sucedidos"}',
    'Implementação concluída com sucesso. Controles validados.',
    'Controles operacionais e efetivos desde março/2024.',
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
    'DADOS ADICIONAIS INSERIDOS COM SUCESSO!' as status,
    '8 Gaps identificados (3 novos para NIST)' as gaps,
    '7 Planos de ação existentes' as planos,
    '12 Itens de ação (5 novos adicionados)' as itens,
    'Status variados: pendente, iniciado, em_andamento, concluido' as status_variedade,
    'Dados completos para teste de QA e CRUD' as observacao;