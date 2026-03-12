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
    console.log(`🔍 Checking user: ${email}`);

    // Check auth.users
    const authRes = await client.query('SELECT id, email, created_at, last_sign_in_at FROM auth.users WHERE email = $1', [email]);
    console.log('\n--- auth.users ---');
    console.table(authRes.rows);

    if (authRes.rows.length > 0) {
        const userId = authRes.rows[0].id;

        // Check public.profiles
        const profileRes = await client.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);
        console.log('\n--- public.profiles ---');
        console.table(profileRes.rows);

        // Check user_roles
        const rolesRes = await client.query('SELECT * FROM public.user_roles WHERE user_id = $1', [userId]);
        console.log('\n--- public.user_roles ---');
        console.table(rolesRes.rows);

        // Check tenants
        if (profileRes.rows.length > 0 && profileRes.rows[0].tenant_id) {
            const tenantRes = await client.query('SELECT name, slug FROM public.tenants WHERE id = $1', [profileRes.rows[0].tenant_id]);
            console.log('\n--- Tenant ---');
            console.table(tenantRes.rows);
        }
    } else {
        console.log('❌ User not found in auth.users');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
