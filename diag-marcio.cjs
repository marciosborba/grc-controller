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
    console.log(`🔍 Checking data for ${email}...`);

    // 1. Get Auth User
    const authUser = await client.query("SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = $1", [email]);
    if (authUser.rows.length === 0) {
      console.log('❌ User not found in auth.users');
      return;
    }
    const uid = authUser.rows[0].id;
    console.log('Auth UID:', uid);
    console.log('Auth Metadata:', JSON.stringify(authUser.rows[0].raw_user_meta_data, null, 2));

    // 2. Get Profile
    const profile = await client.query("SELECT * FROM public.profiles WHERE user_id = $1", [uid]);
    console.log('\n--- Profile ---');
    console.log(JSON.stringify(profile.rows[0], null, 2));

    // 3. Get User Roles
    const roles = await client.query("SELECT * FROM public.user_roles WHERE user_id = $1", [uid]);
    console.log('\n--- User Roles ---');
    console.log(roles.rows);

    // 4. Get User Tenant Roles
    const tenantRoles = await client.query(`
      SELECT utr.*, tr.name as role_name 
      FROM public.user_tenant_roles utr
      JOIN public.tenant_roles tr ON utr.tenant_role_id = tr.id
      WHERE utr.user_id = $1
    `, [uid]);
    console.log('\n--- User Tenant Roles ---');
    console.log(tenantRoles.rows);

    // 5. Get Tenant Info if any
    if (profile.rows[0]?.tenant_id) {
        const tenant = await client.query("SELECT name FROM public.tenants WHERE id = $1", [profile.rows[0].tenant_id]);
        console.log('\n--- Tenant ---');
        console.log(tenant.rows[0]?.name);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
