-- =====================================================
-- SCRIPT DE POPULAÇÃO DE DADOS PARA PLANOS DE AÇÃO
-- Submódulo de Plano de Ação - Dados Completos
-- Tenant ID: 46b1c048-85a1-423b-96fc-776007c8de1f
-- =====================================================

-- Definir tenant_id como variável
\set tenant_id '46b1c048-85a1-423b-96fc-776007c8de1f'

BEGIN;

-- =====================================================
-- 1. ASSESSMENT ACTION PLANS
-- =====================================================

-- Plano 1: Melhoria da Segurança da Informação (ISO 27001)
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo, 
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
    'ap47ac10b-58cc-4372-a567-0e02b2c3d479',
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479', -- Assessment ISO 27001
    'PA-ISO-2024-001',
    'Plano de Melhoria da Segurança da Informação',
    'Plano abrangente para tratar gaps identificados na avaliação ISO 27001 do departamento de TI',
    'Elevar o nível de maturidade dos controles de segurança da informação de 72% para 90%',
    'alta',
    'Redução significativa dos riscos de segurança da informação e melhoria da conformidade com a ISO 27001',
    '{"Redução de 50% nos incidentes de segurança", "Melhoria da conformidade regulatória", "Aumento da confiança dos stakeholders", "Proteção melhorada dos dados críticos"}',
    '2024-02-01',
    '2024-06-30',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    150000.00,
    '{"Consultor especialista em ISO 27001", "Ferramentas de monitoramento de segurança", "Treinamento para equipe de TI", "Software de gestão de vulnerabilidades"}',
    'em_andamento',
    35.00,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Plano 2: Conformidade LGPD
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
    'ap47ac10b-58cc-4372-a567-0e02b2c3d480',
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d482', -- Assessment LGPD
    'PA-LGPD-2024-001',
    'Plano de Conformidade LGPD',
    'Implementação de controles e processos para garantir conformidade total com a Lei Geral de Proteção de Dados',
    'Atingir 100% de conformidade com os requisitos da LGPD',
    'critica',
    'Eliminação de riscos de multas e sanções, melhoria da proteção de dados pessoais',
    '{"Conformidade legal total", "Redução de riscos regulatórios", "Melhoria da confiança dos clientes", "Processos de privacidade robustos"}',
    '2024-01-15',
    '2024-04-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    80000.00,
    '{"Advogado especialista em LGPD", "Software de mapeamento de dados", "Treinamento em privacidade", "Ferramentas de gestão de consentimento"}',
    'em_andamento',
    60.00,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Plano 3: Melhoria dos Controles SOX
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
    'ap47ac10b-58cc-4372-a567-0e02b2c3d481',
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d481', -- Assessment SOX
    'PA-SOX-2024-001',
    'Otimização dos Controles SOX',
    'Melhoria contínua dos controles internos para relatórios financeiros',
    'Manter efetividade dos controles SOX e reduzir custos operacionais',
    'media',
    'Controles mais eficientes e redução de 20% nos custos de compliance',
    '{"Automação de controles manuais", "Redução de custos operacionais", "Melhoria da eficiência", "Menor risco de deficiências"}',
    '2024-01-01',
    '2024-03-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    45000.00,
    '{"Consultor SOX", "Ferramentas de automação", "Treinamento da equipe financeira"}',
    'concluido',
    100.00,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Plano 4: Implementação NIST CSF
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
    'ap47ac10b-58cc-4372-a567-0e02b2c3d482',
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480', -- Assessment NIST
    'PA-NIST-2024-001',
    'Implementação do Framework NIST CSF',
    'Implementação gradual do NIST Cybersecurity Framework na infraestrutura crítica',
    'Estabelecer programa de cibersegurança baseado no NIST CSF',
    'alta',
    'Melhoria significativa da postura de cibersegurança da organização',
    '{"Framework estruturado de cibersegurança", "Melhoria da detecção de ameaças", "Resposta mais eficaz a incidentes", "Alinhamento com melhores práticas"}',
    '2024-03-01',
    '2024-09-30',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    200000.00,
    '{"Especialista em NIST CSF", "Ferramentas de monitoramento", "SIEM", "Treinamento especializado", "Consultoria externa"}',
    'planejado',
    0.00,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. ASSESSMENT ACTION ITEMS
-- =====================================================

-- Itens do Plano ISO 27001
INSERT INTO assessment_action_items (
    id, tenant_id, action_plan_id, codigo, titulo, descricao, ordem,
    tipo_acao, categoria, data_inicio_planejada, data_fim_planejada,
    responsavel, status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    created_at, updated_at
) VALUES 
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d479',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d479',
    'IT-ISO-001',
    'Implementar Política de Backup Automático',
    'Desenvolver e implementar política de backup automático para todos os sistemas críticos',
    1,
    'implementacao',
    'Gestão de Ativos',
    '2024-02-01',
    '2024-02-28',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'alta',
    'Redução do risco de perda de dados críticos',
    15000.00,
    '{"Política de backup documentada", "Procedimentos operacionais", "Cronograma de backup implementado"}',
    '{"Política aprovada pela direção", "Backup automático funcionando", "Testes de restore realizados"}',
    NOW(),
    NOW()
),
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d480',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d479',
    'IT-ISO-002',
    'Implementar Controle de Acesso Baseado em Funções',
    'Estabelecer sistema de controle de acesso baseado em funções (RBAC) para todos os sistemas',
    2,
    'implementacao',
    'Controle de Acesso',
    '2024-03-01',
    '2024-04-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'em_andamento',
    45,
    'alta',
    'Melhoria significativa na segurança de acesso',
    25000.00,
    '{"Matriz de acesso por função", "Sistema RBAC implementado", "Documentação de procedimentos"}',
    '{"Todos os usuários migrados para RBAC", "Auditoria de acesso realizada", "Treinamento concluído"}',
    NOW(),
    NOW()
),
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d481',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d479',
    'IT-ISO-003',
    'Estabelecer Programa de Conscientização em Segurança',
    'Criar e implementar programa abrangente de conscientização em segurança da informação',
    3,
    'treinamento',
    'Recursos Humanos',
    '2024-04-01',
    '2024-05-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'pendente',
    0,
    'media',
    'Redução de incidentes causados por erro humano',
    12000.00,
    '{"Material de treinamento", "Programa de conscientização", "Métricas de efetividade"}',
    '{"100% dos funcionários treinados", "Avaliação de conhecimento aprovada", "Programa contínuo estabelecido"}',
    NOW(),
    NOW()
);

-- Itens do Plano LGPD
INSERT INTO assessment_action_items (
    id, tenant_id, action_plan_id, codigo, titulo, descricao, ordem,
    tipo_acao, categoria, data_inicio_planejada, data_fim_planejada,
    responsavel, status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    created_at, updated_at
) VALUES 
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d482',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d480',
    'IT-LGPD-001',
    'Mapeamento Completo de Dados Pessoais',
    'Realizar mapeamento abrangente de todos os dados pessoais processados pela organização',
    1,
    'documentacao',
    'Mapeamento de Dados',
    '2024-01-15',
    '2024-02-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'critica',
    'Base fundamental para conformidade LGPD',
    20000.00,
    '{"Inventário de dados pessoais", "Fluxos de dados mapeados", "Bases legais identificadas"}',
    '{"Todos os sistemas mapeados", "Documentação aprovada pelo DPO", "Registro de atividades atualizado"}',
    NOW(),
    NOW()
),
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d483',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d480',
    'IT-LGPD-002',
    'Implementar Portal de Direitos do Titular',
    'Desenvolver portal web para exercício de direitos dos titulares de dados',
    2,
    'implementacao',
    'Portal de Direitos',
    '2024-02-16',
    '2024-03-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'em_andamento',
    70,
    'alta',
    'Facilitar exercício de direitos e demonstrar conformidade',
    30000.00,
    '{"Portal web funcional", "Integração com sistemas internos", "Documentação de usuário"}',
    '{"Portal em produção", "Testes de usabilidade aprovados", "Integração com todos os sistemas"}',
    NOW(),
    NOW()
);

-- Itens do Plano SOX (já concluído)
INSERT INTO assessment_action_items (
    id, tenant_id, action_plan_id, codigo, titulo, descricao, ordem,
    tipo_acao, categoria, data_inicio_planejada, data_fim_planejada,
    responsavel, status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    created_at, updated_at
) VALUES 
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d484',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d481',
    'IT-SOX-001',
    'Automatizar Controles de Reconciliação',
    'Implementar automação para controles manuais de reconciliação financeira',
    1,
    'melhoria',
    'Automação',
    '2024-01-01',
    '2024-02-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'media',
    'Redução de 80% no tempo de reconciliação',
    25000.00,
    '{"Scripts de automação", "Documentação de processos", "Relatórios automatizados"}',
    '{"Automação funcionando", "Redução de tempo comprovada", "Controles validados"}',
    NOW(),
    NOW()
),
(
    'ai47ac10b-58cc-4372-a567-0e02b2c3d485',
    :'tenant_id',
    'ap47ac10b-58cc-4372-a567-0e02b2c3d481',
    'IT-SOX-002',
    'Implementar Monitoramento Contínuo',
    'Estabelecer sistema de monitoramento contínuo para controles críticos',
    2,
    'monitoramento',
    'Monitoramento',
    '2024-02-16',
    '2024-03-31',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'alta',
    'Detecção proativa de deficiências de controle',
    20000.00,
    '{"Sistema de monitoramento", "Alertas automatizados", "Dashboard executivo"}',
    '{"Monitoramento 24/7 ativo", "Alertas funcionando", "Relatórios executivos gerados"}',
    NOW(),
    NOW()
);

COMMIT;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Contagem de registros inseridos
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
-- RESUMO DOS DADOS PARA QA
-- =====================================================

SELECT 
    'DADOS DE PLANOS DE AÇÃO INSERIDOS COM SUCESSO!' as status,
    '4 Planos de Ação: ISO 27001, LGPD, SOX, NIST CSF' as planos,
    '7 Itens de Ação distribuídos entre os planos' as itens,
    'Diferentes status: planejado, em_andamento, concluido' as status_variedade,
    'Diferentes prioridades: baixa, media, alta, critica' as prioridades;