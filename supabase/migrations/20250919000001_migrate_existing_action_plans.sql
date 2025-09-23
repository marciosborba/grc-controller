-- =====================================================
-- MIGRAÇÃO DE DADOS EXISTENTES PARA PLANOS DE AÇÃO CENTRALIZADOS
-- Criado em: 2025-09-19
-- Descrição: Migra dados dos planos de ação existentes nos diferentes módulos para o sistema centralizado
-- =====================================================

-- Função para gerar código único para planos de ação
CREATE OR REPLACE FUNCTION generate_action_plan_code(
    p_tenant_id UUID,
    p_module VARCHAR,
    p_sequence INTEGER DEFAULT NULL
) RETURNS VARCHAR AS $$
DECLARE
    module_prefix VARCHAR(10);
    year_part VARCHAR(4);
    sequence_part VARCHAR(6);
    final_code VARCHAR(50);
BEGIN
    -- Definir prefixos por módulo
    CASE p_module
        WHEN 'risk_management' THEN module_prefix := 'RISK';
        WHEN 'compliance' THEN module_prefix := 'COMP';
        WHEN 'assessments' THEN module_prefix := 'ASES';
        WHEN 'privacy' THEN module_prefix := 'PRIV';
        WHEN 'audit' THEN module_prefix := 'AUDT';
        WHEN 'vendor_risk' THEN module_prefix := 'VEND';
        ELSE module_prefix := 'PLAN';
    END CASE;
    
    -- Ano atual
    year_part := EXTRACT(YEAR FROM NOW())::VARCHAR;
    
    -- Sequencial (se não fornecido, gerar baseado no count existente)
    IF p_sequence IS NULL THEN
        SELECT COALESCE(MAX(
            CASE 
                WHEN codigo ~ ('^' || module_prefix || '-' || year_part || '-[0-9]+$') 
                THEN SUBSTRING(codigo FROM LENGTH(module_prefix || '-' || year_part || '-') + 1)::INTEGER
                ELSE 0
            END
        ), 0) + 1
        INTO p_sequence
        FROM action_plans 
        WHERE tenant_id = p_tenant_id;
    END IF;
    
    sequence_part := LPAD(p_sequence::VARCHAR, 6, '0');
    
    final_code := module_prefix || '-' || year_part || '-' || sequence_part;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRAÇÃO DE PLANOS DE AÇÃO DO MÓDULO DE RISCOS
-- =====================================================

INSERT INTO action_plans (
    tenant_id,
    category_id,
    codigo,
    titulo,
    descricao,
    modulo_origem,
    entidade_origem_tipo,
    entidade_origem_id,
    contexto_adicional,
    prioridade,
    responsavel_plano,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    created_at,
    updated_at,
    created_by
)
SELECT DISTINCT
    rr.tenant_id,
    (SELECT id FROM action_plan_categories WHERE tenant_id = rr.tenant_id AND codigo = 'RISK_MGMT' LIMIT 1),
    generate_action_plan_code(rr.tenant_id, 'risk_management'),
    COALESCE(rr.risk_title, 'Plano de Ação para Risco') || ' - ' || COALESCE(rr.risk_category, 'Categoria não definida'),
    'Plano de ação gerado automaticamente para tratamento do risco: ' || COALESCE(rr.risk_description, ''),
    'risk_management',
    'risk_registration',
    rr.id,
    jsonb_build_object(
        'risk_level', rr.risk_level,
        'risk_score', rr.risk_score,
        'treatment_strategy', rr.treatment_strategy,
        'treatment_cost', rr.treatment_cost,
        'business_area', rr.business_area
    ),
    CASE 
        WHEN rr.risk_level ILIKE '%critical%' OR rr.risk_level ILIKE '%critico%' THEN 'critica'
        WHEN rr.risk_level ILIKE '%high%' OR rr.risk_level ILIKE '%alto%' THEN 'alta'
        WHEN rr.risk_level ILIKE '%medium%' OR rr.risk_level ILIKE '%medio%' THEN 'media'
        WHEN rr.risk_level ILIKE '%low%' OR rr.risk_level ILIKE '%baixo%' THEN 'baixa'
        ELSE 'media'
    END,
    rr.created_by,
    COALESCE(rr.identified_date, rr.created_at::DATE),
    COALESCE(rr.treatment_timeline, rr.created_at::DATE + INTERVAL '90 days'),
    CASE 
        WHEN rr.status = 'completed' THEN 'concluido'
        WHEN rr.status = 'in_progress' THEN 'em_execucao'
        WHEN rr.status = 'cancelled' THEN 'cancelado'
        ELSE 'planejado'
    END,
    rr.completion_percentage::INTEGER,
    rr.created_at,
    rr.updated_at,
    rr.created_by
FROM risk_registrations rr
WHERE EXISTS (
    SELECT 1 FROM risk_action_plans rap 
    WHERE rap.risk_registration_id = rr.id
)
AND NOT EXISTS (
    SELECT 1 FROM action_plans ap 
    WHERE ap.entidade_origem_tipo = 'risk_registration' 
    AND ap.entidade_origem_id = rr.id
);

-- Migrar atividades dos planos de risco
INSERT INTO action_plan_activities (
    tenant_id,
    action_plan_id,
    codigo,
    titulo,
    descricao,
    responsavel_execucao,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    created_at,
    updated_at
)
SELECT 
    (SELECT tenant_id FROM risk_registrations WHERE id = rap.risk_registration_id),
    ap.id,
    'ACT-' || LPAD(ROW_NUMBER() OVER (PARTITION BY ap.id ORDER BY rap.created_at)::VARCHAR, 3, '0'),
    rap.activity_name,
    rap.activity_description,
    rap.responsible_user_id,
    COALESCE(rap.start_date, rap.due_date - INTERVAL '30 days'),
    rap.due_date,
    CASE 
        WHEN rap.status = 'completed' THEN 'concluido'
        WHEN rap.status = 'in_progress' THEN 'em_execucao'
        WHEN rap.status = 'cancelled' THEN 'cancelado'
        ELSE 'nao_iniciado'
    END,
    COALESCE(rap.completion_percentage, 0),
    rap.created_at,
    rap.updated_at
FROM risk_action_plans rap
JOIN action_plans ap ON (
    ap.entidade_origem_tipo = 'risk_registration' 
    AND ap.entidade_origem_id = rap.risk_registration_id
);

-- =====================================================
-- MIGRAÇÃO DE PLANOS DE AÇÃO DO MÓDULO DE COMPLIANCE
-- =====================================================

INSERT INTO action_plans (
    tenant_id,
    category_id,
    codigo,
    titulo,
    descricao,
    modulo_origem,
    entidade_origem_tipo,
    entidade_origem_id,
    contexto_adicional,
    prioridade,
    responsavel_plano,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    created_at,
    updated_at,
    created_by
)
SELECT 
    pac.tenant_id,
    (SELECT id FROM action_plan_categories WHERE tenant_id = pac.tenant_id AND codigo = 'COMPLIANCE' LIMIT 1),
    generate_action_plan_code(pac.tenant_id, 'compliance'),
    pac.titulo,
    pac.descricao,
    'compliance',
    'nao_conformidade',
    pac.nao_conformidade_id,
    jsonb_build_object(
        'criticidade', pac.criticidade,
        'tipo_acao', pac.tipo_acao,
        'impacto_financeiro', pac.impacto_financeiro,
        'risco_residual', pac.risco_residual
    ),
    CASE 
        WHEN pac.criticidade = 'critica' THEN 'critica'
        WHEN pac.criticidade = 'alta' THEN 'alta'
        WHEN pac.criticidade = 'media' THEN 'media'
        WHEN pac.criticidade = 'baixa' THEN 'baixa'
        ELSE 'media'
    END,
    pac.responsavel_execucao,
    pac.data_inicio_planejada,
    pac.data_fim_planejada,
    CASE 
        WHEN pac.status = 'concluido' THEN 'concluido'
        WHEN pac.status = 'em_execucao' THEN 'em_execucao'
        WHEN pac.status = 'cancelado' THEN 'cancelado'
        WHEN pac.status = 'suspenso' THEN 'pausado'
        ELSE 'planejado'
    END,
    pac.percentual_conclusao,
    pac.created_at,
    pac.updated_at,
    pac.created_by
FROM planos_acao_conformidade pac
WHERE NOT EXISTS (
    SELECT 1 FROM action_plans ap 
    WHERE ap.entidade_origem_tipo = 'nao_conformidade' 
    AND ap.entidade_origem_id = pac.nao_conformidade_id
);

-- =====================================================
-- MIGRAÇÃO DE PLANOS DE AÇÃO DO MÓDULO DE ASSESSMENTS
-- =====================================================

INSERT INTO action_plans (
    tenant_id,
    category_id,
    codigo,
    titulo,
    descricao,
    modulo_origem,
    entidade_origem_tipo,
    entidade_origem_id,
    contexto_adicional,
    prioridade,
    responsavel_plano,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    created_at,
    updated_at,
    created_by
)
SELECT 
    aap.tenant_id,
    (SELECT id FROM action_plan_categories WHERE tenant_id = aap.tenant_id AND codigo = 'ASSESSMENTS' LIMIT 1),
    COALESCE(aap.codigo, generate_action_plan_code(aap.tenant_id, 'assessments')),
    aap.titulo,
    aap.descricao,
    'assessments',
    'assessment',
    aap.assessment_id,
    jsonb_build_object(
        'objetivo', aap.objetivo,
        'criterios_aceitacao', aap.criterios_aceitacao,
        'beneficios_esperados', aap.beneficios_esperados
    ),
    CASE 
        WHEN aap.prioridade = 'critica' THEN 'critica'
        WHEN aap.prioridade = 'alta' THEN 'alta'
        WHEN aap.prioridade = 'media' THEN 'media'
        WHEN aap.prioridade = 'baixa' THEN 'baixa'
        ELSE 'media'
    END,
    aap.responsavel_plano,
    aap.data_inicio_planejada,
    aap.data_fim_planejada,
    CASE 
        WHEN aap.status = 'concluido' THEN 'concluido'
        WHEN aap.status = 'em_execucao' THEN 'em_execucao'
        WHEN aap.status = 'cancelado' THEN 'cancelado'
        WHEN aap.status = 'suspenso' THEN 'pausado'
        ELSE 'planejado'
    END,
    aap.percentual_conclusao,
    aap.created_at,
    aap.updated_at,
    aap.created_by
FROM assessment_action_plans aap
WHERE NOT EXISTS (
    SELECT 1 FROM action_plans ap 
    WHERE ap.entidade_origem_tipo = 'assessment' 
    AND ap.entidade_origem_id = aap.assessment_id
    AND ap.codigo = COALESCE(aap.codigo, '')
);

-- Migrar atividades dos assessments
INSERT INTO action_plan_activities (
    tenant_id,
    action_plan_id,
    codigo,
    titulo,
    descricao,
    responsavel_execucao,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    prioridade,
    created_at,
    updated_at
)
SELECT 
    aai.tenant_id,
    ap.id,
    COALESCE(aai.codigo, 'ACT-' || LPAD(ROW_NUMBER() OVER (PARTITION BY ap.id ORDER BY aai.created_at)::VARCHAR, 3, '0')),
    aai.titulo,
    aai.descricao,
    aai.responsavel,
    aai.data_inicio_planejada,
    aai.data_fim_planejada,
    CASE 
        WHEN aai.status = 'concluido' THEN 'concluido'
        WHEN aai.status = 'em_execucao' THEN 'em_execucao'
        WHEN aai.status = 'cancelado' THEN 'cancelado'
        WHEN aai.status = 'pausado' THEN 'pausado'
        ELSE 'nao_iniciado'
    END,
    aai.percentual_conclusao,
    CASE 
        WHEN aai.prioridade = 'critica' THEN 'critica'
        WHEN aai.prioridade = 'alta' THEN 'alta'
        WHEN aai.prioridade = 'media' THEN 'media'
        WHEN aai.prioridade = 'baixa' THEN 'baixa'
        ELSE 'media'
    END,
    aai.created_at,
    aai.updated_at
FROM assessment_action_items aai
JOIN assessment_action_plans aap ON aai.action_plan_id = aap.id
JOIN action_plans ap ON (
    ap.entidade_origem_tipo = 'assessment' 
    AND ap.entidade_origem_id = aap.assessment_id
);

-- =====================================================
-- ATUALIZAÇÃO DO PROGRESSO DOS PLANOS MIGRADOS
-- =====================================================

-- Atualizar progresso baseado nas atividades
DO $$
DECLARE
    plan_record RECORD;
BEGIN
    FOR plan_record IN 
        SELECT id FROM action_plans WHERE percentual_conclusao = 0
    LOOP
        PERFORM update_action_plan_progress(plan_record.id);
    END LOOP;
END $$;

-- =====================================================
-- INSERIR DADOS DE EXEMPLO PARA DEMONSTRAÇÃO
-- =====================================================

-- Inserir planos de ação de exemplo para demonstração (apenas para tenant específico)
INSERT INTO action_plans (
    tenant_id,
    category_id,
    codigo,
    titulo,
    descricao,
    modulo_origem,
    prioridade,
    responsavel_plano,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    gut_gravidade,
    gut_urgencia,
    gut_tendencia,
    orcamento_planejado,
    frequencia_relatorios
)
SELECT 
    '46b1c048-85a1-423b-96fc-776007c8de1f'::UUID,
    (SELECT id FROM action_plan_categories WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' AND codigo = 'RISK_MGMT' LIMIT 1),
    'RISK-2025-000001',
    'Implementação de Controles de Segurança Cibernética',
    'Plano abrangente para fortalecer a postura de segurança cibernética da organização através da implementação de controles técnicos e administrativos',
    'risk_management',
    'alta',
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    '2025-01-15',
    '2025-06-30',
    'em_execucao',
    35,
    4, 4, 3, -- GUT: Gravidade=4, Urgência=4, Tendência=3
    150000.00,
    'semanal'
WHERE NOT EXISTS (
    SELECT 1 FROM action_plans WHERE codigo = 'RISK-2025-000001'
);

INSERT INTO action_plans (
    tenant_id,
    category_id,
    codigo,
    titulo,
    descricao,
    modulo_origem,
    prioridade,
    responsavel_plano,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    gut_gravidade,
    gut_urgencia,
    gut_tendencia,
    orcamento_planejado,
    frequencia_relatorios
)
SELECT 
    '46b1c048-85a1-423b-96fc-776007c8de1f'::UUID,
    (SELECT id FROM action_plan_categories WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' AND codigo = 'COMPLIANCE' LIMIT 1),
    'COMP-2025-000001',
    'Adequação à Nova Regulamentação Setorial',
    'Projeto de adequação aos novos requisitos regulamentares específicos do setor, incluindo revisão de processos e treinamento',
    'compliance',
    'critica',
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    '2025-02-01',
    '2025-08-31',
    'planejado',
    0,
    5, 5, 4, -- GUT: Gravidade=5, Urgência=5, Tendência=4
    250000.00,
    'quinzenal'
WHERE NOT EXISTS (
    SELECT 1 FROM action_plans WHERE codigo = 'COMP-2025-000001'
);

INSERT INTO action_plans (
    tenant_id,
    category_id,
    codigo,
    titulo,
    descricao,
    modulo_origem,
    prioridade,
    responsavel_plano,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    gut_gravidade,
    gut_urgencia,
    gut_tendencia,
    orcamento_planejado,
    frequencia_relatorios
)
SELECT 
    '46b1c048-85a1-423b-96fc-776007c8de1f'::UUID,
    (SELECT id FROM action_plan_categories WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' AND codigo = 'PRIVACY' LIMIT 1),
    'PRIV-2025-000001',
    'Fortalecimento do Programa de Privacidade',
    'Iniciativa para aprimorar o programa de privacidade e proteção de dados pessoais, incluindo mapeamento de dados e revisão de políticas',
    'privacy',
    'alta',
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    '2025-01-10',
    '2025-05-15',
    'em_execucao',
    60,
    3, 4, 3, -- GUT: Gravidade=3, Urgência=4, Tendência=3
    75000.00,
    'semanal'
WHERE NOT EXISTS (
    SELECT 1 FROM action_plans WHERE codigo = 'PRIV-2025-000001'
);

-- Inserir atividades de exemplo
INSERT INTO action_plan_activities (
    tenant_id,
    action_plan_id,
    codigo,
    titulo,
    descricao,
    tipo_atividade,
    responsavel_execucao,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    prioridade,
    ordem_execucao
)
SELECT 
    ap.tenant_id,
    ap.id,
    'ACT-001',
    'Análise de Gap de Segurança',
    'Realizar análise detalhada dos gaps de segurança existentes e priorizar ações',
    'task',
    ap.responsavel_plano,
    ap.data_inicio_planejada,
    ap.data_inicio_planejada + INTERVAL '21 days',
    'concluido',
    100,
    'alta',
    1
FROM action_plans ap 
WHERE ap.codigo = 'RISK-2025-000001'
AND NOT EXISTS (
    SELECT 1 FROM action_plan_activities 
    WHERE action_plan_id = ap.id AND codigo = 'ACT-001'
);

INSERT INTO action_plan_activities (
    tenant_id,
    action_plan_id,
    codigo,
    titulo,
    descricao,
    tipo_atividade,
    responsavel_execucao,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    prioridade,
    ordem_execucao
)
SELECT 
    ap.tenant_id,
    ap.id,
    'ACT-002',
    'Implementação de Firewall de Nova Geração',
    'Configurar e implementar solução de firewall de nova geração para perímetro de rede',
    'task',
    ap.responsavel_plano,
    ap.data_inicio_planejada + INTERVAL '22 days',
    ap.data_inicio_planejada + INTERVAL '45 days',
    'em_execucao',
    75,
    'critica',
    2
FROM action_plans ap 
WHERE ap.codigo = 'RISK-2025-000001'
AND NOT EXISTS (
    SELECT 1 FROM action_plan_activities 
    WHERE action_plan_id = ap.id AND codigo = 'ACT-002'
);

INSERT INTO action_plan_activities (
    tenant_id,
    action_plan_id,
    codigo,
    titulo,
    descricao,
    tipo_atividade,
    responsavel_execucao,
    data_inicio_planejada,
    data_fim_planejada,
    status,
    percentual_conclusao,
    prioridade,
    ordem_execucao
)
SELECT 
    ap.tenant_id,
    ap.id,
    'ACT-003',
    'Treinamento em Segurança da Informação',
    'Programa de conscientização e treinamento para todos os colaboradores',
    'training',
    ap.responsavel_plano,
    ap.data_inicio_planejada + INTERVAL '46 days',
    ap.data_inicio_planejada + INTERVAL '90 days',
    'nao_iniciado',
    0,
    'media',
    3
FROM action_plans ap 
WHERE ap.codigo = 'RISK-2025-000001'
AND NOT EXISTS (
    SELECT 1 FROM action_plan_activities 
    WHERE action_plan_id = ap.id AND codigo = 'ACT-003'
);

-- =====================================================
-- LIMPEZA E COMENTÁRIOS FINAIS
-- =====================================================

-- Atualizar próximas notificações para planos ativos
UPDATE action_plans 
SET proxima_notificacao = calculate_next_notification_date(id, frequencia_relatorios)
WHERE status IN ('em_execucao', 'planejado', 'aprovado');

-- Comentário informativo
SELECT 'Migração de planos de ação concluída com sucesso!' as status,
       COUNT(*) as total_planos_migrados
FROM action_plans;