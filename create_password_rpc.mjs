import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await pool.query(`
CREATE OR REPLACE FUNCTION public.update_vendor_portal_password(p_email text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find the user in auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update password 
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = v_user_id;

  -- Set force_password_change to true in vendor_portal_users so they must change it upon next login
  UPDATE public.vendor_portal_users 
  SET force_password_change = true 
  WHERE email = p_email;

  RETURN true;
END;
$$;
        `);
        console.log('✅ update_vendor_portal_password RPC created');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
