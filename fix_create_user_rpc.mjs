import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await pool.query(`
CREATE OR REPLACE FUNCTION public.create_vendor_auth_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_vendor_id TEXT, -- changed to TEXT to match UUID/String from frontend
    p_tenant_id TEXT
) RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
    v_existing_user_id UUID;
    v_vendor_user_id UUID;
    v_vendor_uuid UUID;
    v_tenant_uuid UUID;
BEGIN
    v_vendor_uuid := p_vendor_id::uuid;
    IF p_tenant_id IS NOT NULL AND p_tenant_id != '' THEN
        v_tenant_uuid := p_tenant_id::uuid;
    END IF;

    -- 2. Check if user already exists in auth.users by email
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_existing_user_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário já existe'
        );
    ELSE
        -- 3. Create new user in auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object('name', p_name, 'is_vendor', true),
            now(),
            now()
        ) RETURNING id INTO v_user_id;
        
        -- Insert identity for the email
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            format('{"sub": "%s", "email": "%s"}', v_user_id, p_email)::jsonb,
            'email',
            now(),
            now(),
            now()
        );
    END IF;

    -- Create or update in vendor_portal_users
    INSERT INTO public.vendor_portal_users (
        vendor_id,
        email,
        tenant_id,
        force_password_change,
        created_at
    ) VALUES (
        v_vendor_uuid,
        p_email,
        v_tenant_uuid,
        true,
        now()
    ) ON CONFLICT (email) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', 'Usuário fornecedor criado com sucesso'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        console.log('✅ create_vendor_auth_user RPC created');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
