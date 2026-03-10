import pg from 'pg';
const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function applyRPC() {
    try {
        const sql = `
CREATE OR REPLACE FUNCTION public.check_is_vendor(check_uid uuid, check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_vendor boolean := false;
BEGIN
    -- Check vendor_users by uid
    IF EXISTS (SELECT 1 FROM public.vendor_users WHERE auth_user_id = check_uid) THEN
        is_vendor := true;
    END IF;
    
    -- Check vendor_portal_users by email
    IF NOT is_vendor AND EXISTS (SELECT 1 FROM public.vendor_portal_users WHERE lower(email) = lower(check_email)) THEN
        is_vendor := true;
    END IF;
    
    RETURN is_vendor;
END;
$$;
`;
        await pool.query(sql);
        console.log('✅ check_is_vendor RPC created successfully!');
    } catch (e) {
        console.error('❌ Error creating RPC:', e);
    } finally {
        await pool.end();
    }
}
applyRPC();
