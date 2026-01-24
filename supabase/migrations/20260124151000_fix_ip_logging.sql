-- Update log_activity to automatically capture IP from headers
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
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id uuid;
  v_ip inet;
  v_headers json;
BEGIN
  -- Attempt to extract tenant_id from details
  BEGIN
    v_tenant_id := (p_details->>'tenant_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_tenant_id := NULL;
  END;

  -- Attempt to extract IP from headers if not provided
  IF p_ip_address IS NOT NULL THEN
     v_ip := p_ip_address;
  ELSE
     v_headers := current_setting('request.headers', true)::json;
     BEGIN
       -- Try Cloudflare Header first (most reliable single IP)
       v_ip := (v_headers->>'cf-connecting-ip')::inet;
     EXCEPTION WHEN OTHERS THEN
       BEGIN
         -- Try X-Forwarded-For (might fail if multiple IPs, just take first or ignore)
         -- Simple cast might fail for lists, so we leave it NULL if unsafe
         v_ip := NULL; 
       END;
     END;
  END IF;

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
    v_ip, -- Use the resolved IP
    current_setting('request.headers', true)::json->>'user-agent',
    v_tenant_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION log_activity(text, text, jsonb, uuid, text, inet) TO anon, authenticated, service_role;
