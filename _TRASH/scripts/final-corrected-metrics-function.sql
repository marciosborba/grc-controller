-- CORREÇÃO FINAL: Função calculate_privacy_metrics
-- Corrige total_expired e adiciona total_consents

DROP FUNCTION IF EXISTS calculate_privacy_metrics();

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
BEGIN
    -- Legal Bases metrics
    SELECT jsonb_build_object(
        'total_bases', COUNT(*),
        'active_bases', COUNT(*) FILTER (WHERE status = 'active'),
        'suspended_bases', COUNT(*) FILTER (WHERE status = 'suspended'),
        'expired_bases', COUNT(*) FILTER (WHERE status = 'expired'),
        'expiring_soon', COUNT(*) FILTER (WHERE status = 'active' AND valid_until IS NOT NULL AND valid_until::date <= CURRENT_DATE + INTERVAL '30 days'),
        'needs_validation', COUNT(*) FILTER (WHERE is_validated = false OR is_validated IS NULL)
    ) INTO legal_bases_data
    FROM legal_bases;

    -- Consents metrics (CORRIGIDO)
    SELECT jsonb_build_object(
        'total_consents', COUNT(*),
        'total_active', COUNT(*) FILTER (WHERE status = 'granted'),
        'total_revoked', COUNT(*) FILTER (WHERE status = 'revoked'),
        'total_expired', COUNT(*) FILTER (WHERE status = 'expired'),
        'expiring_soon', COUNT(*) FILTER (WHERE status = 'granted' AND expires_at IS NOT NULL AND expires_at::date <= CURRENT_DATE + INTERVAL '30 days')
    ) INTO consents_data
    FROM consents;

    -- Data Inventory metrics
    SELECT jsonb_build_object(
        'total_inventories', COUNT(*),
        'active_inventories', COUNT(*) FILTER (WHERE status = 'active'),
        'needs_review', COUNT(*) FILTER (WHERE next_review_date IS NULL OR next_review_date <= CURRENT_DATE),
        'by_sensitivity', jsonb_build_object(
            'alta', COUNT(*) FILTER (WHERE sensitivity_level = 'alta'),
            'media', COUNT(*) FILTER (WHERE sensitivity_level = 'media'),
            'baixa', COUNT(*) FILTER (WHERE sensitivity_level = 'baixa')
        )
    ) INTO inventory_data
    FROM data_inventory;

    -- Data Subject Requests metrics
    SELECT jsonb_build_object(
        'total_requests', COUNT(*),
        'pending_requests', COUNT(*) FILTER (WHERE status IN ('received', 'under_verification', 'in_progress', 'em_processamento')),
        'completed_requests', COUNT(*) FILTER (WHERE status = 'completed'),
        'overdue_requests', COUNT(*) FILTER (WHERE status NOT IN ('completed', 'rejected') AND created_at <= CURRENT_DATE - INTERVAL '15 days'),
        'by_type', jsonb_build_object(
            'acesso', COUNT(*) FILTER (WHERE request_type = 'acesso'),
            'correcao', COUNT(*) FILTER (WHERE request_type = 'correcao'),
            'exclusao', COUNT(*) FILTER (WHERE request_type = 'exclusao'),
            'portabilidade', COUNT(*) FILTER (WHERE request_type = 'portabilidade'),
            'oposicao', COUNT(*) FILTER (WHERE request_type = 'oposicao')
        )
    ) INTO requests_data
    FROM data_subject_requests;

    -- Privacy Incidents metrics
    SELECT jsonb_build_object(
        'total_incidents', COUNT(*),
        'open_incidents', COUNT(*) FILTER (WHERE status IN ('aberto', 'investigando', 'em_remediacao')),
        'closed_incidents', COUNT(*) FILTER (WHERE status IN ('resolvido', 'fechado')),
        'anpd_notifications_required', COUNT(*) FILTER (WHERE requires_anpd_notification = true AND anpd_notified = false),
        'by_severity', jsonb_build_object(
            'critica', COUNT(*) FILTER (WHERE severity = 'critica'),
            'alta', COUNT(*) FILTER (WHERE severity = 'alta'),
            'media', COUNT(*) FILTER (WHERE severity = 'media'),
            'baixa', COUNT(*) FILTER (WHERE severity = 'baixa')
        )
    ) INTO incidents_data
    FROM privacy_incidents;

    -- Processing Activities metrics
    SELECT jsonb_build_object(
        'total_activities', COUNT(*),
        'active_activities', COUNT(*) FILTER (WHERE status = 'active'),
        'suspended_activities', COUNT(*) FILTER (WHERE status = 'suspended'),
        'under_review', COUNT(*) FILTER (WHERE status = 'under_review'),
        'high_risk_activities', COUNT(*) FILTER (WHERE is_high_risk = true),
        'requires_dpia', COUNT(*) FILTER (WHERE requires_dpia = true OR is_high_risk = true)
    ) INTO activities_data
    FROM processing_activities;

    -- Combine all metrics
    result := jsonb_build_object(
        'legal_bases', legal_bases_data,
        'consents', consents_data,
        'data_inventory', inventory_data,
        'data_subject_requests', requests_data,
        'privacy_incidents', incidents_data,
        'processing_activities', activities_data,
        'compliance_overview', jsonb_build_object(
            'legal_bases', (legal_bases_data->>'total_bases')::int,
            'processing_activities', (activities_data->>'total_activities')::int,
            'training_completion_rate', 0
        ),
        'dpia_assessments', jsonb_build_object(
            'total_dpias', 0,
            'pending_dpias', 0,
            'high_risk_dpias', (activities_data->>'high_risk_activities')::int
        )
    );

    RETURN result;
END;
$$;