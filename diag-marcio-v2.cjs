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
    } else {
        const uid = authUser.rows[0].id;
        console.log('Auth UID:', uid);
        console.log('Auth Metadata:', JSON.stringify(authUser.rows[0].raw_user_meta_data, null, 2));

        // 2. Get Profile
        const profile = await client.query("SELECT * FROM public.profiles WHERE user_id = $1", [uid]);
        console.log('\n--- Profile ---');
        console.log(JSON.stringify(profile.rows[0], null, 2));

        // 3. Get User Roles (System Roles)
        const roles = await client.query("SELECT * FROM public.user_roles WHERE user_id = $1", [uid]);
        console.log('\n--- User Roles (user_roles table) ---');
        console.log(roles.rows);

        // 4. Check if custom_role_id points to something
        if (profile.rows[0]?.custom_role_id) {
            const tr = await client.query("SELECT * FROM public.tenant_roles WHERE id = $1", [profile.rows[0].custom_role_id]);
            console.log('\n--- Custom Role Info (from profiles.custom_role_id) ---');
            console.log(tr.rows[0]);
        }
    }

    // 5. List all tables to see if we have user_tenant_roles or similar
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%role%'");
    console.log('\n--- Role related tables ---');
    console.log(tables.rows.map(t => t.table_name));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
