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
    
    // Auth users
    const authRes = await client.query('SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 50');
    
    // Profiles
    const profileRes = await client.query('SELECT user_id, full_name, tenant_id, is_active FROM public.profiles');

    // Roles
    const rolesRes = await client.query('SELECT user_id, role FROM public.user_roles');

    const data = {
        auth_users: authRes.rows,
        profiles: profileRes.rows,
        user_roles: rolesRes.rows
    };

    require('fs').writeFileSync('db-dump.json', JSON.stringify(data, null, 2));
    console.log('✅ Dumped DB state to db-dump.json');

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
