-- =============================================
-- Data Management & Backup Schema
-- =============================================

-- 1. RPC: Get Tenant Storage Statistics
-- Estimates storage usage based on row counts (approximate)
-- Returns JSON with breakdown by category
DROP FUNCTION IF EXISTS public.get_tenant_storage_stats(uuid);

CREATE OR REPLACE FUNCTION public.get_tenant_storage_stats(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_users_count INT := 0;
    v_logs_count INT := 0;
    v_policies_count INT := 0;
    v_assessments_count INT := 0;
    v_vendors_count INT := 0;
    v_risks_count INT := 0;
    v_incidents_count INT := 0;
    v_audits_count INT := 0;
    v_controls_count INT := 0;
    
    -- Variables for actual size calculation
    v_users_size BIGINT := 0;
    v_logs_size BIGINT := 0;
    v_policies_size BIGINT := 0;
    v_assessments_size BIGINT := 0;
    v_vendors_size BIGINT := 0;
    v_risks_size BIGINT := 0;
    v_incidents_size BIGINT := 0;
    v_audits_size BIGINT := 0;
    v_controls_size BIGINT := 0;

    v_total_rows INT;
    v_est_db_size_mb NUMERIC := 0; 
    v_file_usage_mb NUMERIC := 0; 
BEGIN
    -- 1. Count Rows per Table
    SELECT COUNT(*) INTO v_users_count FROM public.profiles WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_logs_count FROM public.activity_logs WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_policies_count FROM public.policies WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_assessments_count FROM public.assessments WHERE tenant_id = p_tenant_id;
    -- SELECT COUNT(*) INTO v_vendors_count FROM public.vendors WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_risks_count FROM public.risk_registrations WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_incidents_count FROM public.incidents WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_audits_count FROM public.policy_audits WHERE tenant_id = p_tenant_id;
    SELECT COUNT(*) INTO v_controls_count FROM public.biblioteca_controles_sox WHERE tenant_id = p_tenant_id;

    -- 2. Calculate Actual Size (Bytes) using pg_column_size
    -- We sum the size of the whole row record for the filtered tenant
    
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_users_size FROM public.profiles t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_logs_size FROM public.activity_logs t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_policies_size FROM public.policies t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_assessments_size FROM public.assessments t WHERE t.tenant_id = p_tenant_id;
    -- SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_vendors_size FROM public.vendors t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_risks_size FROM public.risk_registrations t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_incidents_size FROM public.incidents t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_audits_size FROM public.policy_audits t WHERE t.tenant_id = p_tenant_id;
    SELECT COALESCE(SUM(pg_column_size(t)), 0) INTO v_controls_size FROM public.biblioteca_controles_sox t WHERE t.tenant_id = p_tenant_id;

    -- 3. Calculate File Usage (Storage Objects)
    -- Assumes objects are stored with path prefix "tenant_id/..."
    SELECT COALESCE(SUM((metadata->>'size')::NUMERIC), 0)
    INTO v_file_usage_mb
    FROM storage.objects
    WHERE name LIKE p_tenant_id::text || '/%';

    v_file_usage_mb := v_file_usage_mb / 1024.0 / 1024.0;
    v_file_usage_mb := ROUND(v_file_usage_mb, 2);

    -- Sum all sizes (in bytes) and convert to MB
    v_est_db_size_mb := (
        v_users_size + 
        v_logs_size + 
        v_policies_size + 
        v_assessments_size + 
        v_vendors_size + 
        v_risks_size + 
        v_incidents_size + 
        v_audits_size + 
        v_controls_size
    ) / 1024.0 / 1024.0;

    v_est_db_size_mb := ROUND(v_est_db_size_mb, 2);

    RETURN jsonb_build_object(
        'database_size_mb', v_est_db_size_mb,
        'files_size_mb', v_file_usage_mb, 
        'total_size_mb', v_est_db_size_mb + v_file_usage_mb,
        'details', jsonb_build_object(
            'users_count', v_users_count,
            'logs_count', v_logs_count,
            'policies_count', v_policies_count,
            'assessments_count', v_assessments_count,
            'vendors_count', v_vendors_count,
            'risks_count', v_risks_count,
            'incidents_count', v_incidents_count,
            'sox_controls_count', v_controls_count
        )
    );
END;
$$;
