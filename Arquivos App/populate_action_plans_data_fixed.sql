-- =====================================================
-- SCRIPT DE POPULAÇÃO DE DADOS PARA PLANOS DE AÇÃO
-- Submódulo de Plano de Ação - Dados Completos (CORRIGIDO)
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
    tenant_id, assessment_id, codigo, titulo, descricao, objetivo, 
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
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
);

-- Plano 2: Conformidade LGPD
INSERT INTO assessment_action_plans (
    tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
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
);

-- Plano 3: Melhoria dos Controles SOX
INSERT INTO assessment_action_plans (
    tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
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
);

-- Plano 4: Implementação NIST CSF
INSERT INTO assessment_action_plans (
    tenant_id, assessment_id, codigo, titulo, descricao, objetivo,
    prioridade, impacto_esperado, beneficios_esperados,
    data_inicio_planejada, data_fim_planejada, responsavel_plano,
    orcamento_estimado, recursos_necessarios, status, percentual_conclusao,
    created_at, updated_at
) VALUES (
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
WHERE tenant_id = :'tenant_id';

-- =====================================================
-- RESUMO DOS DADOS PARA QA
-- =====================================================

SELECT 
    'DADOS DE PLANOS DE AÇÃO INSERIDOS COM SUCESSO!' as status,
    '4 Planos de Ação: ISO 27001, LGPD, SOX, NIST CSF' as planos,
    'Diferentes status: planejado, em_andamento, concluido' as status_variedade,
    'Diferentes prioridades: media, alta, critica' as prioridades;