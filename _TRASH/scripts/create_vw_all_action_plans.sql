DROP VIEW IF EXISTS public.vw_action_plans_unified;
CREATE OR REPLACE VIEW public.vw_action_plans_unified AS
WITH unified_plans AS (
    -- 1. Action Plans (Módulo Geral / Genérico)
    SELECT
        ap.id,
        ap.codigo,
        ap.titulo as title,
        ap.descricao as description,
        CASE 
            WHEN ap.modulo_origem = 'vendor_risk' THEN 'tprm'
            ELSE COALESCE(ap.modulo_origem, 'action_plans')
        END as module,
        ap.entidade_origem_id::text as origin_id,
        CASE
            WHEN ap.entidade_origem_tipo = 'assessment' THEN a.titulo
            WHEN ap.entidade_origem_tipo = 'vendor' THEN v.name
            ELSE NULL
        END as origin_name,
        ap.status,
        ap.prioridade as priority,
        ap.data_fim_planejada as due_date,
        ap.responsavel_plano::uuid as responsible_id,
        NULL::text as direct_responsible_name,
        NULL::text as direct_responsible_email,
        ap.created_at,
        ap.tenant_id,
        ap.percentual_conclusao
    FROM public.action_plans ap
    LEFT JOIN public.assessments a ON ap.entidade_origem_id::text = a.id::text AND ap.entidade_origem_tipo = 'assessment'
    LEFT JOIN public.vendors v ON ap.entidade_origem_id::text = v.id::text AND ap.entidade_origem_tipo = 'vendor'

    UNION ALL

    -- 2. Risk Action Plans
    SELECT
        rap.id,
        ('R-' || rap.risk_registration_id) as codigo,
        rap.activity_name as title,
        rap.activity_description as description,
        'risk_management' as module,
        rap.risk_registration_id::text as origin_id,
        rr.risk_title as origin_name,
        CASE
            WHEN rap.status = 'pendente' THEN 'pending'
            WHEN rap.status = 'em_andamento' THEN 'in_progress'
            WHEN rap.status = 'concluido' THEN 'completed'
            WHEN rap.status = 'cancelado' THEN 'cancelled'
            ELSE rap.status
        END as status,
        CASE
            WHEN rap.priority = 'baixa' THEN 'low'
            WHEN rap.priority = 'media' THEN 'medium'
            WHEN rap.priority = 'alta' THEN 'high'
            WHEN rap.priority = 'critica' THEN 'critical'
            ELSE rap.priority
        END as priority,
        rap.due_date,
        NULL::uuid as responsible_id,
        rap.responsible_name as direct_responsible_name,
        rap.responsible_email as direct_responsible_email,
        rap.created_at,
        rap.tenant_id,
        0 as percentual_conclusao
    FROM public.risk_registration_action_plans rap
    LEFT JOIN public.risk_registrations rr ON rap.risk_registration_id = rr.id

    UNION ALL

    -- 3. Vendor Action Plans
    SELECT
        vap.id,
        ('V-' || vap.vendor_id) as codigo,
        vap.title,
        vap.description,
        'tprm' as module,
        vap.vendor_id::text as origin_id,
        v.name as origin_name,
        CASE
            WHEN vap.status = 'Aberto' THEN 'open'
            WHEN vap.status = 'Em Andamento' THEN 'in_progress'
            WHEN vap.status = 'Concluído' THEN 'completed'
            ELSE 'pending'
        END as status,
        CASE
            WHEN vap.priority = 'Baixa' THEN 'low'
            WHEN vap.priority = 'Média' THEN 'medium'
            WHEN vap.priority = 'Alta' THEN 'high'
            ELSE 'medium'
        END as priority,
        vap.due_date,
        vap.assigned_to::uuid as responsible_id,
        NULL::text as direct_responsible_name,
        NULL::text as direct_responsible_email,
        vap.created_at,
        vap.tenant_id,
        vap.progress_percentage as percentual_conclusao
    FROM public.vendor_risk_action_plans vap
    LEFT JOIN public.vendors v ON vap.vendor_id = v.id

    UNION ALL

    -- 4. Assessment Action Plans
    SELECT
        aap.id,
        ('A-' || aap.assessment_id) as codigo,
        aap.titulo as title,
        aap.descricao as description,
        'assessments' as module,
        aap.assessment_id::text as origin_id,
        a.titulo as origin_name,
        CASE
            WHEN aap.status = 'pendente' THEN 'pending'
            WHEN aap.status = 'em_progresso' THEN 'in_progress'
            WHEN aap.status = 'concluido' THEN 'completed'
            ELSE aap.status
        END as status,
        CASE
            WHEN aap.prioridade = 'baixa' THEN 'low'
            WHEN aap.prioridade = 'media' THEN 'medium'
            WHEN aap.prioridade = 'alta' THEN 'high'
            ELSE 'medium'
        END as priority,
        aap.data_fim_planejada as due_date,
        aap.responsavel_plano::uuid as responsible_id,
        NULL::text as direct_responsible_name,
        NULL::text as direct_responsible_email,
        aap.created_at,
        aap.tenant_id,
        aap.percentual_conclusao
    FROM public.assessment_action_plans aap
    LEFT JOIN public.assessments a ON aap.assessment_id = a.id
)
SELECT
    u.id,
    u.codigo,
    u.title,
    u.description,
    u.module,
    u.origin_id,
    u.origin_name,
    u.status,
    u.priority,
    u.due_date,
    u.responsible_id,
    COALESCE(p.full_name, u.direct_responsible_name) as responsible_name,
    COALESCE(p.email, u.direct_responsible_email) as responsible_email,
    p.avatar_url as responsible_avatar,
    u.created_at,
    u.tenant_id,
    u.percentual_conclusao
FROM unified_plans u
LEFT JOIN public.users p ON u.responsible_id = p.id;

-- Grant permissions
GRANT SELECT ON public.vw_action_plans_unified TO authenticated;
GRANT SELECT ON public.vw_action_plans_unified TO service_role;
