require('dotenv').config();
const { Client } = require('pg');

const sql = `
CREATE OR REPLACE FUNCTION public.get_audit_data(p_pattern text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
    v_results json;
BEGIN
    SELECT json_build_object(
        'auth_users', (SELECT json_agg(t) FROM (SELECT id, email, created_at, last_sign_in_at FROM auth.users WHERE email ILIKE p_pattern) t),
        'profiles', (SELECT json_agg(t) FROM (SELECT * FROM public.profiles WHERE email ILIKE p_pattern) t),
        'vendor_users', (SELECT json_agg(t) FROM (SELECT * FROM public.vendor_users WHERE email ILIKE p_pattern) t),
        'vendor_portal_users', (SELECT json_agg(t) FROM (SELECT * FROM public.vendor_portal_users WHERE email ILIKE p_pattern) t),
        'sessions', (SELECT json_agg(t) FROM (SELECT id, user_id, created_at FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE p_pattern)) t)
    ) INTO v_results;
    RETURN v_results;
END;
$$;
`;

// Tentar conectar em 5432 primeiro, se falhar tenta 6543
async function runQuery(port = 5432) {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${new URL(process.env.SUPABASE_URL).hostname}:${port}/postgres?sslmode=require`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sql);
        console.log(`✅ Audit RPC created successfully on port ${port}.`);
        await client.end();
        return true;
    } catch (err) {
        console.error(`❌ Failed on port ${port}:`, err.message);
        await client.end();
        return false;
    }
}

async function start() {
    if (await runQuery(5432)) return;
    if (await runQuery(6543)) return;
    console.error('Final failure: Could not connect to database.');
}

start();
