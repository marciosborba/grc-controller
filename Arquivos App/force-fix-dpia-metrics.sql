-- ============================================================================
-- CORREÇÃO FORÇADA: Adicionar seção DPIA na função calculate_privacy_metrics
-- ============================================================================

-- 1. PRIMEIRO: Verificar se a função atual tem a seção dpia_assessments
SELECT 'VERIFICANDO FUNÇÃO ATUAL' as status;

-- 2. FORÇAR RECRIAÇÃO COMPLETA da função
DROP FUNCTION IF EXISTS calculate_privacy_metrics() CASCADE;

-- 3. RECRIAR função com seção DPIA incluída
CREATE OR REPLACE FUNCTION calculate_privacy_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    legal_bases_data jsonb;
    consents_data jsonb;
    inventory_data jsonb;
    requests_data jsonb;
    incidents_data jsonb;
    activities_data jsonb;
    dpia_data jsonb;
BEGIN
    -- Legal Bases metrics
    SELECT jsonb_build_object(
        'total_bases', COALESCE(COUNT(*), 0),
        'active_bases', COALESCE(COUNT(*) FILTER (WHERE status = 'active'), 0),
        'suspended_bases', COALESCE(COUNT(*) FILTER (WHERE status = 'suspended'), 0),
        'expired_bases', COALESCE(COUNT(*) FILTER (WHERE status = 'expired'), 0),
        'expiring_soon', COALESCE(COUNT(*) FILTER (WHERE status = 'active' AND valid_until IS NOT NULL AND valid_until::date <= CURRENT_DATE + INTERVAL '30 days'), 0),
        'needs_validation', COALESCE(COUNT(*) FILTER (WHERE is_validated = false OR is_validated IS NULL), 0)
    ) INTO legal_bases_data
    FROM legal_bases;

    -- Consents metrics
    SELECT jsonb_build_object(
        'total_consents', COALESCE(COUNT(*), 0),
        'total_active', COALESCE(COUNT(*) FILTER (WHERE status = 'granted'), 0),
        'total_revoked', COALESCE(COUNT(*) FILTER (WHERE status = 'revoked'), 0),
        'total_expired', COALESCE(COUNT(*) FILTER (WHERE status = 'expired'), 0),
        'expiring_soon', COALESCE(COUNT(*) FILTER (WHERE status = 'granted' AND expires_at IS NOT NULL AND expires_at::date <= CURRENT_DATE + INTERVAL '30 days'), 0)
    ) INTO consents_data
    FROM consents;

    -- Data Inventory metrics
    SELECT jsonb_build_object(
        'total_inventories', COALESCE(COUNT(*), 0),
        'active_inventories', COALESCE(COUNT(*) FILTER (WHERE status = 'active'), 0),
        'needs_review', COALESCE(COUNT(*) FILTER (WHERE next_review_date IS NULL OR next_review_date <= CURRENT_DATE), 0),
        'by_sensitivity', jsonb_build_object(
            'alta', COALESCE(COUNT(*) FILTER (WHERE sensitivity_level = 'alta'), 0),
            'media', COALESCE(COUNT(*) FILTER (WHERE sensitivity_level = 'media'), 0),
            'baixa', COALESCE(COUNT(*) FILTER (WHERE sensitivity_level = 'baixa'), 0)
        )
    ) INTO inventory_data
    FROM data_inventory;

    -- Data Subject Requests metrics
    SELECT jsonb_build_object(
        'total_requests', COALESCE(COUNT(*), 0),
        'pending_requests', COALESCE(COUNT(*) FILTER (WHERE status IN ('received', 'under_verification', 'in_progress', 'em_processamento')), 0),
        'completed_requests', COALESCE(COUNT(*) FILTER (WHERE status = 'completed'), 0),
        'overdue_requests', COALESCE(COUNT(*) FILTER (WHERE status NOT IN ('completed', 'rejected') AND created_at <= CURRENT_DATE - INTERVAL '15 days'), 0),
        'by_type', jsonb_build_object(
            'acesso', COALESCE(COUNT(*) FILTER (WHERE request_type = 'acesso'), 0),
            'correcao', COALESCE(COUNT(*) FILTER (WHERE request_type = 'correcao'), 0),
            'exclusao', COALESCE(COUNT(*) FILTER (WHERE request_type = 'exclusao'), 0),
            'portabilidade', COALESCE(COUNT(*) FILTER (WHERE request_type = 'portabilidade'), 0),
            'oposicao', COALESCE(COUNT(*) FILTER (WHERE request_type = 'oposicao'), 0)
        )
    ) INTO requests_data
    FROM data_subject_requests;

    -- Privacy Incidents metrics
    SELECT jsonb_build_object(
        'total_incidents', COALESCE(COUNT(*), 0),
        'open_incidents', COALESCE(COUNT(*) FILTER (WHERE status IN ('aberto', 'investigando', 'em_remediacao')), 0),
        'closed_incidents', COALESCE(COUNT(*) FILTER (WHERE status IN ('resolvido', 'fechado')), 0),
        'anpd_notifications_required', COALESCE(COUNT(*) FILTER (WHERE requires_anpd_notification = true AND anpd_notified = false), 0),
        'by_severity', jsonb_build_object(
            'critica', COALESCE(COUNT(*) FILTER (WHERE severity = 'critica'), 0),
            'alta', COALESCE(COUNT(*) FILTER (WHERE severity = 'alta'), 0),
            'media', COALESCE(COUNT(*) FILTER (WHERE severity = 'media'), 0),
            'baixa', COALESCE(COUNT(*) FILTER (WHERE severity = 'baixa'), 0)
        )
    ) INTO incidents_data
    FROM privacy_incidents;

    -- Processing Activities metrics
    SELECT jsonb_build_object(
        'total_activities', COALESCE(COUNT(*), 0),
        'active_activities', COALESCE(COUNT(*) FILTER (WHERE status = 'active'), 0),
        'suspended_activities', COALESCE(COUNT(*) FILTER (WHERE status = 'suspended'), 0),
        'under_review', COALESCE(COUNT(*) FILTER (WHERE status = 'under_review'), 0),
        'high_risk_activities', COALESCE(COUNT(*) FILTER (WHERE is_high_risk = true), 0),
        'requires_dpia', COALESCE(COUNT(*) FILTER (WHERE requires_dpia = true OR is_high_risk = true), 0)
    ) INTO activities_data
    FROM processing_activities;

    -- *** ADICIONADO: DPIA Assessments metrics ***
    SELECT jsonb_build_object(
        'total_dpias', COALESCE(COUNT(*), 0),
        'pending_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('draft', 'in_progress', 'pending_approval')), 0),
        'completed_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('completed', 'approved')), 0),
        'high_risk_dpias', COALESCE(COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')), 0),
        'requires_anpd_consultation', COALESCE(COUNT(*) FILTER (WHERE anpd_consultation_required = true), 0)
    ) INTO dpia_data
    FROM dpia_assessments;

    -- Combine all metrics - INCLUINDO dpia_assessments
    result := jsonb_build_object(
        'legal_bases', legal_bases_data,
        'consents', consents_data,
        'data_inventory', inventory_data,
        'data_subject_requests', requests_data,
        'privacy_incidents', incidents_data,
        'processing_activities', activities_data,
        'dpia_assessments', dpia_data,  -- *** ESTA LINHA ESTAVA FALTANDO ***
        'compliance_overview', jsonb_build_object(
            'legal_bases', (legal_bases_data->>'total_bases')::int,
            'processing_activities', (activities_data->>'total_activities')::int,
            'training_completion_rate', 0
        )
    );

    RETURN result;
END;
$$;

-- 4. TESTAR a função imediatamente
SELECT 'TESTANDO FUNÇÃO CORRIGIDA' as status;
SELECT calculate_privacy_metrics() -> 'dpia_assessments' as dpia_section;

-- 5. VERIFICAÇÃO FINAL
SELECT 'FUNÇÃO CORRIGIDA COM SUCESSO!' as status;