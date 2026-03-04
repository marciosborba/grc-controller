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
    p_vendor_id UUID,
    p_tenant_id UUID
) RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
    v_existing_user_id UUID;
    v_vendor_user_id UUID;
BEGIN
    -- Check if user already exists in auth.users by email
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_existing_user_id IS NOT NULL THEN
        v_user_id := v_existing_user_id;

        -- Update password
        UPDATE auth.users 
        SET encrypted_password = crypt(p_password, gen_salt('bf')),
            updated_at = now()
        WHERE id = v_user_id;
    ELSE
        -- Create new user in auth.users with ALL required GoTrue fields
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf')),
            now(),
            NULL,
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object('name', p_name, 'is_vendor', true),
            false,
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO v_user_id;
        
        -- IMPORTANT: For email provider, sub must be the email (not UUID)
        -- Also include email_verified=true and phone_verified=false to match GoTrue format
        INSERT INTO auth.identities (
            id,
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            p_email,
            v_user_id,
            jsonb_build_object('sub', p_email, 'email', p_email, 'email_verified', true, 'phone_verified', false),
            'email',
            NULL,
            now(),
            now()
        );
    END IF;

    -- Create or update vendor_users record
    INSERT INTO public.vendor_users (
        vendor_id,
        auth_user_id,
        email,
        name,
        role,
        is_active
    ) VALUES (
        p_vendor_id,
        v_user_id,
        p_email,
        COALESCE(p_name, 'Fornecedor'),
        'vendor_admin',
        true
    )
    ON CONFLICT (vendor_id, email) DO UPDATE
    SET 
        auth_user_id = EXCLUDED.auth_user_id,
        name = COALESCE(EXCLUDED.name, public.vendor_users.name),
        is_active = true
    RETURNING id INTO v_vendor_user_id;

    -- Create or update vendor_portal_users
    INSERT INTO public.vendor_portal_users (
        vendor_id,
        email,
        tenant_id,
        force_password_change,
        created_at
    ) VALUES (
        p_vendor_id,
        p_email,
        p_tenant_id,
        true,
        now()
    ) ON CONFLICT (email) DO UPDATE
    SET force_password_change = true;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'vendor_user_id', v_vendor_user_id,
        'message', 'Usuário fornecedor criado com sucesso'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_vendor_auth_user(text, text, text, uuid, uuid) TO authenticated;
        `);
        console.log('✅ create_vendor_auth_user RPC updated with all required GoTrue fields');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
