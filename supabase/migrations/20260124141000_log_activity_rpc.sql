-- Function to log activity securely (bypass RLS for anon users if needed, e.g. login failures)
CREATE OR REPLACE FUNCTION log_activity(
  p_action text,
  p_resource_type text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_user_id uuid DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as owner (postgres)
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- Attempt to extract tenant_id from details
  BEGIN
    v_tenant_id := (p_details->>'tenant_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_tenant_id := NULL;
  END;

  -- BYPASS TRIGGERS (specifically ensure_tenant_id) for system logging
  -- allowing NULL tenant_id for global/failed login events
  -- 'replica' mode disables triggers.
  SET LOCAL session_replication_role = 'replica';

  INSERT INTO activity_logs (
    action,
    resource_type,
    details,
    user_id,
    resource_id,
    ip_address,
    user_agent,
    tenant_id
  ) VALUES (
    p_action,
    p_resource_type,
    p_details,
    p_user_id,
    p_resource_id,
    p_ip_address,
    current_setting('request.headers', true)::json->>'user-agent',
    v_tenant_id
  );

  -- Reset to default (though LOCAL resets at end of transaction anyway)
  SET LOCAL session_replication_role = 'origin';
END;
$$;

GRANT EXECUTE ON FUNCTION log_activity(text, text, jsonb, uuid, text, inet) TO anon, authenticated, service_role;
