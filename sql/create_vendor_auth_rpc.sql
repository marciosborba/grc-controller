-- Function to create a vendor auth user securely from the application
-- This bypasses the client-side session restriction by running with SECURITY DEFINER
-- It requires the caller to be an authenticated user (the admin/GRC user)

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
    -- 1. Check if the caller has permission (must be authenticated)
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Check if user already exists in auth.users by email
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_existing_user_id IS NOT NULL THEN
        -- User exists in auth.users, check if they are already linked to this vendor
        SELECT id INTO v_vendor_user_id
        FROM public.vendor_users
        WHERE auth_user_id = v_existing_user_id AND vendor_id = p_vendor_id;

        IF v_vendor_user_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Usuário já existe e já está vinculado a este fornecedor.'
            );
        END IF;
        
        -- Link existing user to vendor
        v_user_id := v_existing_user_id;

        -- We might also consider updating the password here if requested, 
        -- but usually it's better to let them use "forgot password" if they already had an account.
        -- For simplicity, we just link them.
    ELSE
        -- 3. Create new user in auth.users
        -- Supabase requires using the built-in auth schema functions or direct inserts
        -- This is a simplified direct insert. In production on Supabase cloud, 
        -- you might need to use their admin API or pg_net if direct insert is blocked,
        -- but for many self-hosted/local setups this works if SECURITY DEFINER has grants.
        
        -- To avoid breaking supabase specific triggers on auth.users, we use the postgres extension `pgcrypto`
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

    -- 4. Create the vendor_users record linking the auth user to the vendor
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
        p_name,
        'vendor_admin',
        true
    )
    ON CONFLICT (vendor_id, email) DO UPDATE
    SET 
        auth_user_id = EXCLUDED.auth_user_id,
        name = EXCLUDED.name,
        is_active = true
    RETURNING id INTO v_vendor_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'vendor_user_id', v_vendor_user_id,
        'message', 'Usuário fornecedor criado/vinculado com sucesso'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.create_vendor_auth_user TO authenticated;
