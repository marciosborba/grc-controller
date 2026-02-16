-- =============================================
-- SQL Update: Connect Security UI to Logic
-- =============================================

-- 1. Helper Function: Get Security Settings (Public)
-- Used by AuthContext to check IP Whitelist before login
CREATE OR REPLACE FUNCTION public.get_tenant_security_settings(domain_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as system to access tenant settings
AS $$
DECLARE
    v_settings JSONB;
BEGIN
    SELECT settings->'security' INTO v_settings
    FROM public.tenants
    WHERE domain = domain_name;

    IF v_settings IS NOT NULL THEN
        -- Return only safe public parts of the settings
        RETURN jsonb_build_object(
            'accessControl', v_settings->'accessControl',
            'passwordPolicy', v_settings->'passwordPolicy'
        );
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

-- 2. Update Increment Failed Login (Dynamic Settings)
-- Now reads max_attempts and lockout_duration from tenant settings
CREATE OR REPLACE FUNCTION public.increment_failed_login(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    record public.auth_lockouts%ROWTYPE;
    new_attempts INT;
    
    -- Dynamic variables with defaults
    lock_duration INTERVAL := INTERVAL '15 minutes';
    max_attempts INT := 5; 
    
    v_domain TEXT;
    v_lockout_minutes INT;
    v_failed_limit INT;
BEGIN
    -- Extract domain from email
    v_domain := split_part(user_email, '@', 2);

    -- Try to find tenant settings for this domain
    SELECT 
        (settings->'security'->'accessControl'->>'lockoutDurationMinutes')::INT,
        (settings->'security'->'accessControl'->>'failedLoginLimit')::INT
    INTO v_lockout_minutes, v_failed_limit
    FROM public.tenants
    WHERE domain = v_domain;

    -- Override defaults if tenant settings exist
    IF v_lockout_minutes IS NOT NULL THEN
        lock_duration := (v_lockout_minutes || ' minutes')::INTERVAL;
    END IF;

    IF v_failed_limit IS NOT NULL THEN
        max_attempts := v_failed_limit;
    END IF;

    -- Rest of logic remains the same
    SELECT * INTO record FROM public.auth_lockouts WHERE email = user_email;

    IF record IS NULL THEN
        INSERT INTO public.auth_lockouts (email, failed_attempts, last_attempt_at)
        VALUES (user_email, 1, NOW())
        RETURNING * INTO record;
        new_attempts := 1;
    ELSE
        -- If previous attempt was long ago, reset
        IF record.last_attempt_at < NOW() - INTERVAL '1 hour' THEN
            new_attempts := 1;
        ELSE
            new_attempts := record.failed_attempts + 1;
        END IF;

        -- Check if should lock
        IF new_attempts >= max_attempts THEN
            UPDATE public.auth_lockouts 
            SET failed_attempts = new_attempts, 
                last_attempt_at = NOW(),
                locked_until = NOW() + lock_duration
            WHERE email = user_email;
            
            RETURN jsonb_build_object('locked', true, 'until', NOW() + lock_duration);
        ELSE
             UPDATE public.auth_lockouts 
            SET failed_attempts = new_attempts, 
                last_attempt_at = NOW()
            WHERE email = user_email;
        END IF;
    END IF;

    RETURN jsonb_build_object('locked', false, 'attempts', new_attempts);
END;
$$;
