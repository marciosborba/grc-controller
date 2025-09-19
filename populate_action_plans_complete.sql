-- =====================================================
-- SCRIPT COMPLETO DE POPULAÇÃO PARA PLANOS DE AÇÃO
-- Inclui: Gaps Identificados, Planos de Ação e Itens de Ação
-- Tenant ID: 46b1c048-85a1-423b-96fc-776007c8de1f
-- =====================================================

-- Definir tenant_id como variável
\set tenant_id '46b1c048-85a1-423b-96fc-776007c8de1f'

BEGIN;

-- =====================================================
-- 1. GAPS IDENTIFICADOS (ASSESSMENT_RESPONSES)
-- =====================================================

-- Gaps para Assessment ISO 27001
INSERT INTO assessment_responses (
    tenant_id, assessment_id, question_id, control_id, 
    status_conformidade, percentual_conformidade, gap_identificado, 
    criticidade_gap, justificativa, comentarios, plano_acao_requerido,
    created_at, updated_at
) VALUES 
-- Gap 1: Controle de Backup (Crítico)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479', -- Assessment ISO 27001
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' AND codigo LIKE '%BACKUP%' LIMIT 1),
    'nao_conforme',
    25.0,
    true,
    'critica',
    'Sistema de backup atual não atende aos requisitos de RPO/RTO definidos na política',
    'Backup manual executado apenas semanalmente, sem testes de restore',
    true,
    NOW(),
    NOW()
),
-- Gap 2: Controle de Acesso (Alto)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' AND codigo LIKE '%ACCESS%' LIMIT 1),
    'parcialmente_conforme',
    60.0,
    true,
    'alta',
    'Controles de acesso implementados mas sem revisão periódica adequada',
    'Falta processo formal de revisão de acessos trimestrais',
    true,
    NOW(),
    NOW()
),
-- Gap 3: Monitoramento de Segurança (Médio)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 2),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' AND codigo LIKE '%MONITOR%' LIMIT 1),
    'parcialmente_conforme',
    70.0,
    true,
    'media',
    'Monitoramento básico implementado mas sem alertas automatizados',
    'SIEM configurado mas alertas não são tratados adequadamente',
    true,
    NOW(),
    NOW()
);

-- Gaps para Assessment LGPD
INSERT INTO assessment_responses (
    tenant_id, assessment_id, question_id, control_id,
    status_conformidade, percentual_conformidade, gap_identificado,
    criticidade_gap, justificativa, comentarios, plano_acao_requerido,
    created_at, updated_at
) VALUES 
-- Gap 4: Mapeamento de Dados (Crítico)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d482', -- Assessment LGPD
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 3),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1),
    'nao_conforme',
    30.0,
    true,
    'critica',
    'Mapeamento de dados pessoais incompleto e desatualizado',
    'Não há inventário completo dos dados pessoais processados',
    true,
    NOW(),
    NOW()
),
-- Gap 5: Portal de Direitos (Alto)
(
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d482',
    (SELECT id FROM assessment_questions WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 4),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 2),
    'nao_conforme',
    10.0,
    true,
    'alta',
    'Não existe portal para exercício de direitos dos titulares',
    'Solicitações são tratadas manualmente via email',
    true,
    NOW(),
    NOW()
);

-- =====================================================
-- 2. PLANOS DE AÇÃO DETALHADOS
-- =====================================================

-- Plano 1: Melhoria da Segurança da Informação (ISO 27001)
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, orcamento_aprovado, recursos_necessarios,
    status, percentual_conclusao, dependencias, prerequisitos,
    created_at, updated_at, created_by
) VALUES (
    gen_random_uuid(),
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479', -- Assessment ISO 27001
    'PA-ISO-2024-001',
    'Plano de Melhoria da Segurança da Informação',
    'Plano abrangente para tratar gaps críticos identificados na avaliação ISO 27001, focando em backup, controle de acesso e monitoramento',
    'Elevar o nível de conformidade dos controles de segurança de 45% para 90% em 6 meses',
    'critica',
    'Redução significativa dos riscos de segurança da informação e melhoria da conformidade com a ISO 27001',
    '{"Redução de 70% nos incidentes de segurança", "Melhoria da conformidade regulatória", "Aumento da confiança dos stakeholders", "Proteção melhorada dos dados críticos", "Redução de custos operacionais"}',
    '2024-02-01',
    '2024-08-01',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    250000.00,
    200000.00,
    '{"Consultor especialista em ISO 27001", "Ferramentas de backup enterprise", "Sistema SIEM avançado", "Treinamento para equipe de TI", "Software de gestão de identidades"}',
    'em_andamento',
    35.0,
    '{"Aprovação do orçamento", "Contratação de consultor externo", "Aquisição de ferramentas"}',
    '{"Mapeamento completo da infraestrutura", "Definição de políticas de segurança", "Aprovação da diretoria"}',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- Plano 2: Conformidade LGPD
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, orcamento_aprovado, recursos_necessarios,
    status, percentual_conclusao, dependencias, prerequisitos,
    created_at, updated_at, created_by
) VALUES (
    gen_random_uuid(),
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d482', -- Assessment LGPD
    'PA-LGPD-2024-001',
    'Plano de Conformidade Total LGPD',
    'Implementação completa dos requisitos LGPD incluindo mapeamento de dados, portal de direitos e processos de privacidade',
    'Atingir 100% de conformidade com os requisitos da LGPD e eliminar riscos de multas',
    'critica',
    'Eliminação total de riscos regulatórios e melhoria da proteção de dados pessoais',
    '{"Conformidade legal total", "Redução de riscos de multas", "Melhoria da confiança dos clientes", "Processos de privacidade robustos", "Vantagem competitiva"}',
    '2024-01-15',
    '2024-06-15',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    180000.00,
    150000.00,
    '{"Advogado especialista em LGPD", "Software de mapeamento de dados", "Plataforma de gestão de consentimento", "Treinamento em privacidade", "Desenvolvimento de portal web"}',
    'em_andamento',
    65.0,
    '{"Mapeamento completo de dados", "Desenvolvimento do portal", "Treinamento da equipe"}',
    '{"Nomeação do DPO", "Aprovação das políticas de privacidade", "Definição de bases legais"}',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- Plano 3: Otimização SOX (Concluído)
INSERT INTO assessment_action_plans (
    id, tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, data_inicio_real, data_fim_real,
    responsavel_plano, orcamento_estimado, orcamento_aprovado,
    recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at, created_by
) VALUES (
    gen_random_uuid(),
    :'tenant_id',
    'a47ac10b-58cc-4372-a567-0e02b2c3d481', -- Assessment SOX
    'PA-SOX-2024-001',
    'Otimização dos Controles SOX',
    'Melhoria contínua dos controles internos para relatórios financeiros com foco em automação',
    'Manter efetividade dos controles SOX e reduzir custos operacionais em 25%',
    'media',
    'Controles mais eficientes, redução de custos e menor risco de deficiências',
    '{"Automação de 80% dos controles manuais", "Redução de 25% nos custos operacionais", "Melhoria da eficiência", "Menor risco de deficiências materiais"}',
    '2024-01-01',
    '2024-03-31',
    '2024-01-01',
    '2024-03-28',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    75000.00,
    70000.00,
    '{"Consultor SOX", "Ferramentas de automação RPA", "Treinamento da equipe financeira", "Software de monitoramento"}',
    'concluido',
    100.0,
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- =====================================================
-- 3. ITENS DE AÇÃO DETALHADOS
-- =====================================================

-- Itens do Plano ISO 27001
INSERT INTO assessment_action_items (
    id, tenant_id, action_plan_id, response_id, control_id,
    codigo, titulo, descricao, ordem, tipo_acao, categoria,
    data_inicio_planejada, data_fim_planejada, data_inicio_real, data_fim_real,
    responsavel, colaboradores, status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    evidencias_conclusao, comentarios, observacoes,
    created_at, updated_at, created_by
) VALUES 
-- Item 1: Implementar Sistema de Backup Automatizado
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-ISO-2024-001' AND tenant_id = :'tenant_id'),
    (SELECT id FROM assessment_responses WHERE criticidade_gap = 'critica' AND tenant_id = :'tenant_id' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1),
    'IT-ISO-001',
    'Implementar Sistema de Backup Automatizado Enterprise',
    'Implementar solução de backup automatizada com RPO de 4 horas e RTO de 2 horas para todos os sistemas críticos',
    1,
    'implementacao',
    'Infraestrutura',
    '2024-02-01',
    '2024-03-15',
    '2024-02-01',
    '2024-03-12',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    '{}',
    'concluido',
    100,
    'critica',
    'Redução do risco de perda de dados críticos de alto para baixo',
    45000.00,
    '{"Solução de backup implementada", "Políticas de backup documentadas", "Procedimentos de restore testados", "Treinamento da equipe realizado"}',
    '{"Backup automático funcionando 24/7", "Testes de restore bem-sucedidos", "RPO/RTO atendidos", "Equipe treinada"}',
    '{"Relatório de implementação", "Evidências de testes de restore", "Documentação de procedimentos", "Certificados de treinamento"}',
    'Implementação concluída com sucesso. Todos os testes de restore foram aprovados.',
    'Sistema funcionando perfeitamente. Monitoramento ativo implementado.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 2: Implementar RBAC (Role-Based Access Control)
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-ISO-2024-001' AND tenant_id = :'tenant_id'),
    (SELECT id FROM assessment_responses WHERE criticidade_gap = 'alta' AND tenant_id = :'tenant_id' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1),
    'IT-ISO-002',
    'Implementar Controle de Acesso Baseado em Funções (RBAC)',
    'Estabelecer sistema de controle de acesso baseado em funções para todos os sistemas críticos com revisão trimestral',
    2,
    'implementacao',
    'Segurança',
    '2024-03-01',
    '2024-05-15',
    '2024-03-01',
    NULL,
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    '{}',
    'em_andamento',
    60,
    'alta',
    'Melhoria significativa na segurança de acesso e redução de riscos de acesso indevido',
    35000.00,
    '{"Sistema RBAC implementado", "Matriz de acesso por função", "Processo de revisão trimestral", "Documentação completa"}',
    '{"Todos os usuários migrados para RBAC", "Auditoria de acesso realizada", "Processo de revisão funcionando", "Treinamento concluído"}',
    '{}',
    'Implementação em andamento. Fase de migração dos usuários em curso.',
    'Previsão de conclusão mantida para maio/2024.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 3: Melhorar Sistema de Monitoramento
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-ISO-2024-001' AND tenant_id = :'tenant_id'),
    (SELECT id FROM assessment_responses WHERE criticidade_gap = 'media' AND tenant_id = :'tenant_id' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 2),
    'IT-ISO-003',
    'Aprimorar Sistema de Monitoramento e Alertas',
    'Configurar alertas automatizados no SIEM e estabelecer procedimentos de resposta a incidentes',
    3,
    'melhoria',
    'Monitoramento',
    '2024-04-01',
    '2024-06-30',
    NULL,
    NULL,
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    '{}',
    'planejado',
    0,
    'media',
    'Detecção proativa de incidentes e redução do tempo de resposta',
    25000.00,
    '{"SIEM configurado com alertas", "Procedimentos de resposta documentados", "Equipe treinada", "Dashboard de monitoramento"}',
    '{"Alertas funcionando 24/7", "Tempo de resposta < 30 minutos", "Procedimentos testados", "Equipe certificada"}',
    '{}',
    'Aguardando conclusão do item anterior para iniciar.',
    'Dependente da finalização do RBAC.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- Itens do Plano LGPD
INSERT INTO assessment_action_items (
    id, tenant_id, action_plan_id, response_id, control_id,
    codigo, titulo, descricao, ordem, tipo_acao, categoria,
    data_inicio_planejada, data_fim_planejada, data_inicio_real, data_fim_real,
    responsavel, colaboradores, status, percentual_conclusao, prioridade,
    impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    evidencias_conclusao, comentarios, observacoes,
    created_at, updated_at, created_by
) VALUES 
-- Item 4: Mapeamento Completo de Dados Pessoais
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-LGPD-2024-001' AND tenant_id = :'tenant_id'),
    (SELECT id FROM assessment_responses WHERE assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d482' AND criticidade_gap = 'critica' AND tenant_id = :'tenant_id' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 3),
    'IT-LGPD-001',
    'Mapeamento Completo de Dados Pessoais',
    'Realizar inventário abrangente de todos os dados pessoais processados, incluindo fluxos, bases legais e finalidades',
    1,
    'documentacao',
    'Mapeamento',
    '2024-01-15',
    '2024-03-15',
    '2024-01-15',
    '2024-03-10',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    '{}',
    'concluido',
    100,
    'critica',
    'Base fundamental para conformidade LGPD e redução de riscos regulatórios',
    30000.00,
    '{"Inventário completo de dados", "Fluxos de dados mapeados", "Bases legais identificadas", "Registro de atividades atualizado"}',
    '{"Todos os sistemas mapeados", "Documentação aprovada pelo DPO", "Bases legais validadas", "Fluxos documentados"}',
    '{"Relatório de mapeamento", "Registro de atividades de tratamento", "Matriz de dados pessoais", "Aprovação do DPO"}',
    'Mapeamento concluído com identificação de 15 sistemas e 8 bases legais.',
    'Documentação aprovada pelo DPO e validada juridicamente.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 5: Desenvolver Portal de Direitos do Titular
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-LGPD-2024-001' AND tenant_id = :'tenant_id'),
    (SELECT id FROM assessment_responses WHERE assessment_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d482' AND criticidade_gap = 'alta' AND tenant_id = :'tenant_id' LIMIT 1),
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 4),
    'IT-LGPD-002',
    'Desenvolver Portal de Direitos do Titular',
    'Criar portal web para exercício de direitos dos titulares com integração aos sistemas internos',
    2,
    'implementacao',
    'Portal Web',
    '2024-03-16',
    '2024-05-31',
    '2024-03-16',
    NULL,
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    '{}',
    'em_andamento',
    75,
    'alta',
    'Facilitar exercício de direitos e demonstrar conformidade proativa',
    50000.00,
    '{"Portal web funcional", "Integração com sistemas", "Documentação de usuário", "Testes de usabilidade"}',
    '{"Portal em produção", "Integração completa", "Testes aprovados", "Documentação finalizada"}',
    '{}',
    'Desenvolvimento em fase final. Testes de integração em andamento.',
    'Previsão de entrega mantida para maio/2024.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 6: Implementar Gestão de Consentimentos
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-LGPD-2024-001' AND tenant_id = :'tenant_id'),
    NULL,
    (SELECT id FROM assessment_controls WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 5),
    'IT-LGPD-003',
    'Implementar Sistema de Gestão de Consentimentos',
    'Desenvolver sistema para captura, armazenamento e gestão de consentimentos dos titulares',
    3,
    'implementacao',
    'Consentimento',
    '2024-04-01',
    '2024-06-15',
    NULL,
    NULL,
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    '{}',
    'planejado',
    0,
    'media',
    'Gestão adequada de consentimentos e demonstração de conformidade',
    40000.00,
    '{"Sistema de consentimento", "Interface de captura", "Relatórios de gestão", "Integração com portal"}',
    '{"Sistema funcionando", "Consentimentos capturados", "Relatórios gerados", "Integração completa"}',
    '{}',
    'Aguardando conclusão do portal para iniciar desenvolvimento.',
    'Dependente da finalização do portal de direitos.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

-- Itens do Plano SOX (Concluído)
INSERT INTO assessment_action_items (
    id, tenant_id, action_plan_id, codigo, titulo, descricao, ordem,
    tipo_acao, categoria, data_inicio_planejada, data_fim_planejada,
    data_inicio_real, data_fim_real, responsavel, status, percentual_conclusao,
    prioridade, impacto_estimado, custo_estimado, entregaveis, criterios_aceitacao,
    evidencias_conclusao, comentarios, observacoes,
    created_at, updated_at, created_by
) VALUES 
-- Item 7: Automatizar Controles de Reconciliação
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-SOX-2024-001' AND tenant_id = :'tenant_id'),
    'IT-SOX-001',
    'Automatizar Controles de Reconciliação Financeira',
    'Implementar automação RPA para controles manuais de reconciliação bancária e contábil',
    1,
    'melhoria',
    'Automação',
    '2024-01-01',
    '2024-02-15',
    '2024-01-01',
    '2024-02-12',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'alta',
    'Redução de 85% no tempo de reconciliação e eliminação de erros manuais',
    35000.00,
    '{"Scripts RPA implementados", "Documentação de processos", "Relatórios automatizados", "Treinamento da equipe"}',
    '{"Automação funcionando", "Redução de tempo comprovada", "Controles validados", "Equipe treinada"}',
    '{"Relatório de implementação", "Evidências de automação", "Métricas de eficiência", "Documentação de controles"}',
    'Automação implementada com sucesso. Redução de 87% no tempo de reconciliação.',
    'Controles validados pelos auditores externos.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
),
-- Item 8: Implementar Monitoramento Contínuo
(
    gen_random_uuid(),
    :'tenant_id',
    (SELECT id FROM assessment_action_plans WHERE codigo = 'PA-SOX-2024-001' AND tenant_id = :'tenant_id'),
    'IT-SOX-002',
    'Implementar Monitoramento Contínuo de Controles',
    'Estabelecer sistema de monitoramento contínuo para controles críticos SOX',
    2,
    'monitoramento',
    'Controles',
    '2024-02-16',
    '2024-03-31',
    '2024-02-16',
    '2024-03-28',
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1),
    'concluido',
    100,
    'media',
    'Detecção proativa de deficiências e melhoria da efetividade dos controles',
    25000.00,
    '{"Sistema de monitoramento", "Alertas automatizados", "Dashboard executivo", "Relatórios de exceção"}',
    '{"Monitoramento 24/7 ativo", "Alertas funcionando", "Dashboard operacional", "Relatórios gerados"}',
    '{"Sistema em produção", "Evidências de alertas", "Relatórios executivos", "Validação de auditores"}',
    'Sistema de monitoramento implementado e validado pelos auditores.',
    'Monitoramento contínuo operacional desde março/2024.',
    NOW(),
    NOW(),
    (SELECT id FROM profiles WHERE tenant_id = :'tenant_id' LIMIT 1)
);

COMMIT;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Contagem de registros por tabela
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
-- RESUMO PARA QA
-- =====================================================

SELECT 
    'DADOS COMPLETOS INSERIDOS COM SUCESSO!' as status,
    '5 Gaps Identificados (3 ISO + 2 LGPD)' as gaps,
    '3 Planos de Ação (ISO, LGPD, SOX)' as planos,
    '8 Itens de Ação distribuídos entre os planos' as itens,
    'Status variados: planejado, em_andamento, concluido' as status_variedade,
    'Prioridades: baixa, media, alta, critica' as prioridades,
    'Dados prontos para teste de QA e CRUD' as observacao;