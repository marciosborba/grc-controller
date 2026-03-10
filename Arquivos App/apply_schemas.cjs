const DatabaseManager = require('./database-manager.cjs');

const ssoSchema = `
-- =============================================
-- 1. SSO Configuration Table
-- Stores Identity Provider (IdP) details for each tenant
-- =============================================
CREATE TABLE IF NOT EXISTS public.tenant_sso_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('azure', 'google', 'okta', 'custom')),
    domain TEXT NOT NULL UNIQUE, -- e.g., 'acme.com'
    client_id TEXT, -- For Azure/Google
    tenant_id_azure TEXT, -- specific for Azure AD
    metadata_url TEXT, -- For SAML
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for SSO Settings (Admins only)
ALTER TABLE public.tenant_sso_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'tenant_sso_settings' 
        AND policyname = 'Admins can view SSO settings'
    ) THEN
        CREATE POLICY "Admins can view SSO settings" ON public.tenant_sso_settings
            FOR SELECT
            USING (
                auth.uid() IN (
                    SELECT user_id FROM public.profiles 
                    WHERE tenant_id = tenant_sso_settings.tenant_id 
                    AND role IN ('admin', 'super_admin', 'ciso')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'tenant_sso_settings' 
        AND policyname = 'Admins can update SSO settings'
    ) THEN
        CREATE POLICY "Admins can update SSO settings" ON public.tenant_sso_settings
            FOR UPDATE
            USING (
                auth.uid() IN (
                    SELECT user_id FROM public.profiles 
                    WHERE tenant_id = tenant_sso_settings.tenant_id 
                    AND role IN ('admin', 'super_admin', 'ciso')
                )
            );
    END IF;
END $$;

-- =============================================
-- 2. Brute Force / Account Lockout Tracking
-- Tracks failed login attempts to prevent attacks
-- =============================================
CREATE TABLE IF NOT EXISTS public.auth_lockouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE, -- Track by email (pre-auth)
    failed_attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup during login
CREATE INDEX IF NOT EXISTS idx_auth_lockouts_email ON public.auth_lockouts(email);

-- =============================================
-- 3. RPC: Check Lockout Status
-- Called BEFORE trying to sign in
-- =============================================
CREATE OR REPLACE FUNCTION public.check_account_lockout(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as system to check lockouts freely
AS $func$
DECLARE
    record public.auth_lockouts%ROWTYPE;
BEGIN
    SELECT * INTO record FROM public.auth_lockouts WHERE email = user_email;
    
    -- If no record, not locked
    IF record IS NULL THEN
        RETURN jsonb_build_object('locked', false);
    END IF;

    -- Check if lock is active
    IF record.locked_until IS NOT NULL AND record.locked_until > NOW() THEN
        RETURN jsonb_build_object(
            'locked', true, 
            'until', record.locked_until
        );
    END IF;

    -- If lock expired, reset
    IF record.locked_until IS NOT NULL AND record.locked_until <= NOW() THEN
        UPDATE public.auth_lockouts 
        SET failed_attempts = 0, locked_until = NULL 
        WHERE email = user_email;
    END IF;

    RETURN jsonb_build_object('locked', false);
END;
$func$;

-- =============================================
-- 4. RPC: Increment Failed Login
-- Called AFTER a failed sign in attempt
-- =============================================
CREATE OR REPLACE FUNCTION public.increment_failed_login(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    record public.auth_lockouts%ROWTYPE;
    new_attempts INT;
    lock_duration INTERVAL := INTERVAL '15 minutes';
    max_attempts INT := 5; -- Default, could be fetched from tenant settings ideally
BEGIN
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
$func$;

-- =============================================
-- 5. RPC: Clear Lockout (On Success)
-- Called AFTER a SUCCESSFUL login
-- =============================================
CREATE OR REPLACE FUNCTION public.clear_login_failures(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    DELETE FROM public.auth_lockouts WHERE email = user_email;
END;
$func$;

-- =============================================
-- 6. RPC: Public SSO Discovery
-- Called by Login Page to check if domain has SSO
-- =============================================
CREATE OR REPLACE FUNCTION public.get_sso_provider(domain_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as system to bypass RLS
AS $func$
DECLARE
    sso_record RECORD;
BEGIN
    SELECT provider_type, tenant_id_azure, client_id, metadata_url 
    INTO sso_record
    FROM public.tenant_sso_settings 
    WHERE domain = domain_name AND is_enabled = true;

    IF sso_record IS NOT NULL THEN
        RETURN jsonb_build_object(
            'exists', true,
            'provider', sso_record.provider_type,
            'azure_tenant', sso_record.tenant_id_azure
        );
    ELSE
        RETURN jsonb_build_object('exists', false);
    END IF;
END;
$func$;
`;

const apiTokensSchema = `
-- =============================================
-- API Tokens Schema
-- Allows users to generate Personal Access Tokens (PATs)
-- =============================================

CREATE TABLE IF NOT EXISTS public.api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL, -- We only store the hash, never the plain token
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    scopes TEXT[] DEFAULT ARRAY['read'], -- simple scopes for now
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'api_tokens' 
        AND policyname = 'Users can manage their own tokens'
    ) THEN
        CREATE POLICY "Users can manage their own tokens" ON public.api_tokens
            FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_api_tokens_user ON public.api_tokens(user_id);
`;

async function run() {
    const db = new DatabaseManager();
    try {
        await db.connect();

        console.log('🚀 Applying SSO Schema...');
        await db.executeSQL(ssoSchema, 'SSO and Lockout Schema');

        console.log('🚀 Applying API Tokens Schema...');
        await db.executeSQL(apiTokensSchema, 'API Tokens Schema');

        console.log('✅ All security schemas applied successfully!');
    } catch (error) {
        console.error('❌ Error applying schemas:', error);
    } finally {
        await db.disconnect();
    }
}

run();
