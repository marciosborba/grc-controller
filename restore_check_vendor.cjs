const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE OR REPLACE FUNCTION public.check_is_vendor(
    check_uid uuid DEFAULT NULL,
    check_email text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active boolean;
    v_uid uuid := check_uid;
    v_email text := check_email;
BEGIN
    -- Cross-lookup if one is missing
    IF v_uid IS NULL AND v_email IS NOT NULL THEN
        SELECT id INTO v_uid FROM auth.users WHERE email = v_email;
    ELSIF v_email IS NULL AND v_uid IS NOT NULL THEN
        SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
    END IF;

    -- Check in vendor_users (by ID priority)
    IF v_uid IS NOT NULL THEN
        SELECT is_active INTO v_active FROM public.vendor_users WHERE auth_user_id = v_uid LIMIT 1;
        IF v_active IS NOT NULL THEN
            RETURN CASE WHEN v_active THEN 'active' ELSE 'inactive' END;
        END IF;
    END IF;

    -- Check in vendor_portal_users (by Email fallback)
    IF v_email IS NOT NULL THEN
        SELECT is_active INTO v_active FROM public.vendor_portal_users WHERE email = v_email LIMIT 1;
        IF v_active IS NOT NULL THEN
            RETURN CASE WHEN v_active THEN 'active' ELSE 'inactive' END;
        END IF;
    END IF;

    RETURN 'not_found';
END;
$$;
`;

client.connect()
    .then(() => client.query(sql))
    .then(res => {
        console.log('RPC check_is_vendor restored to production state.');
        client.end();
    })
    .catch(console.error);
