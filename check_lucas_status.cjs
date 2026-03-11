require('dotenv').config();
const { Client } = require('pg');

async function check() {
  const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const email = 'lucas.alcantara@gepriv.com';
    
    // Auth user
    const resAuth = await client.query('SELECT id, email, last_sign_in_at FROM auth.users WHERE email = $1', [email]);
    console.log('--- auth.users ---');
    console.table(resAuth.rows);
    
    const user_id = resAuth.rows[0]?.id;

    if (user_id) {
        // sessions
        const resSess = await client.query('SELECT id, created_at FROM auth.sessions WHERE user_id = $1', [user_id]);
        console.log('--- auth.sessions ---');
        console.table(resSess.rows);
    }

    // vendor_users
    const resVu = await client.query('SELECT is_active, auth_user_id FROM public.vendor_users WHERE email = $1', [email]);
    console.log('--- public.vendor_users ---');
    console.table(resVu.rows);

    // vendor_portal_users
    const resVpu = await client.query('SELECT is_active FROM public.vendor_portal_users WHERE email = $1', [email]);
    console.log('--- public.vendor_portal_users ---');
    console.table(resVpu.rows);

    // profiles
    const resProf = await client.query('SELECT is_active, locked_until FROM public.profiles WHERE email = $1', [email]);
    console.log('--- public.profiles ---');
    console.table(resProf.rows);

    // Test RPC
    const resRpc = await client.query('SELECT public.check_is_vendor($1, $2)', [user_id, email]);
    console.log('--- check_is_vendor RPC ---');
    console.table(resRpc.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
check();
