-- ============================================================================
-- CORREÇÃO DE EMERGÊNCIA: DPIA não aparece na função
-- ============================================================================

-- 1. TESTAR ACESSO DIRETO à tabela dpia_assessments
SELECT 'TESTE DE ACESSO DIRETO' as teste;
SELECT COUNT(*) as dpia_count FROM dpia_assessments;

-- 2. TESTAR query específica do DPIA isoladamente
SELECT 'TESTE QUERY DPIA ISOLADA' as teste;
SELECT jsonb_build_object(
    'total_dpias', COALESCE(COUNT(*), 0),
    'pending_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('draft', 'in_progress', 'pending_approval')), 0),
    'completed_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('completed', 'approved')), 0),
    'high_risk_dpias', COALESCE(COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')), 0)
) as dpia_metrics_isolated
FROM dpia_assessments;

-- 3. CRIAR FUNÇÃO SIMPLES SÓ PARA DPIA (teste)
CREATE OR REPLACE FUNCTION test_dpia_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    dpia_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_dpias', COALESCE(COUNT(*), 0),
        'pending_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('draft', 'in_progress', 'pending_approval')), 0),
        'completed_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('completed', 'approved')), 0),
        'high_risk_dpias', COALESCE(COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')), 0)
    ) INTO dpia_result
    FROM dpia_assessments;
    
    RETURN dpia_result;
END;
$$;

-- 4. TESTAR função simples
SELECT 'TESTE FUNÇÃO SIMPLES DPIA' as teste;
SELECT test_dpia_metrics();

-- 5. RECRIAR função principal com debug
DROP FUNCTION IF EXISTS calculate_privacy_metrics() CASCADE;

CREATE OR REPLACE FUNCTION calculate_privacy_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    dpia_data jsonb := '{"total_dpias": 0, "pending_dpias": 0}'::jsonb;
    other_data jsonb;
BEGIN
    -- PRIMEIRO: Tentar buscar DPIA com tratamento de erro
    BEGIN
        SELECT jsonb_build_object(
            'total_dpias', COALESCE(COUNT(*), 0),
            'pending_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('draft', 'in_progress', 'pending_approval')), 0),
            'completed_dpias', COALESCE(COUNT(*) FILTER (WHERE status IN ('completed', 'approved')), 0),
            'high_risk_dpias', COALESCE(COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')), 0),
            'requires_anpd_consultation', COALESCE(COUNT(*) FILTER (WHERE anpd_consultation_required = true), 0)
        ) INTO dpia_data
        FROM dpia_assessments;
    EXCEPTION WHEN OTHERS THEN
        dpia_data := '{"error": "Cannot access dpia_assessments table", "total_dpias": 0}'::jsonb;
    END;

    -- SEGUNDO: Buscar outros dados (versão simplificada)
    other_data := jsonb_build_object(
        'legal_bases', jsonb_build_object('total_bases', (SELECT COALESCE(COUNT(*), 0) FROM legal_bases)),
        'consents', jsonb_build_object('total_active', (SELECT COALESCE(COUNT(*), 0) FROM consents WHERE status = 'granted')),
        'data_inventory', jsonb_build_object('total_inventories', (SELECT COALESCE(COUNT(*), 0) FROM data_inventory)),
        'data_subject_requests', jsonb_build_object('total_requests', (SELECT COALESCE(COUNT(*), 0) FROM data_subject_requests)),
        'privacy_incidents', jsonb_build_object('total_incidents', (SELECT COALESCE(COUNT(*), 0) FROM privacy_incidents)),
        'processing_activities', jsonb_build_object('total_activities', (SELECT COALESCE(COUNT(*), 0) FROM processing_activities))
    );

    -- TERCEIRO: Combinar GARANTINDO que dpia_assessments esteja incluído
    result := other_data || jsonb_build_object('dpia_assessments', dpia_data);

    RETURN result;
END;
$$;

-- 6. TESTAR função principal corrigida
SELECT 'TESTE FUNÇÃO PRINCIPAL CORRIGIDA' as teste;
SELECT calculate_privacy_metrics() -> 'dpia_assessments' as dpia_section_check;

-- 7. TESTE FINAL COMPLETO
SELECT 'RESULTADO FINAL' as teste;
SELECT calculate_privacy_metrics();