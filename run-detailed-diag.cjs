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

async function run() {
  try {
    await client.connect();
    
    const email = 'marcio@gepriv.com';
    
    // 1. Get user and profile details
    const userRes = await client.query('SELECT * FROM auth.users WHERE email = $1', [email]);
    const profileRes = await client.query('SELECT * FROM public.profiles WHERE email = $1', [email]);
    
    let result = {
        user: userRes.rows[0],
        profile: profileRes.rows[0],
        user_roles: [],
        rls_policies: []
    };

    if (result.user) {
        const rolesRes = await client.query('SELECT * FROM public.user_roles WHERE user_id = $1', [result.user.id]);
        result.user_roles = rolesRes.rows;
    }

    // 2. Get RLS policies
    const rlsRes = await client.query(`
        SELECT tablename, policyname, roles, cmd, qual, with_check 
        FROM pg_policies 
        WHERE schemaname = 'public' AND (tablename = 'profiles' OR tablename = 'user_roles')
    `);
    result.rls_policies = rlsRes.rows;

    // 3. Get triggers on auth.users
    const triggerRes = await client.query(`
        SELECT trigger_name, action_statement 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' AND event_object_schema = 'auth'
    `);
    result.triggers = triggerRes.rows;

    require('fs').writeFileSync('detailed-diag.json', JSON.stringify(result, null, 2));
    console.log('✅ Diagnostic results saved to detailed-diag.json');

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
