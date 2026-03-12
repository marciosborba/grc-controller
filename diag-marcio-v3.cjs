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
    
    console.log('--- Checking profiles for marcio@gepriv.com ---');
    const profiles = await client.query('SELECT * FROM public.profiles WHERE email ILIKE $1', ['marcio@gepriv.com']);
    console.log('Count:', profiles.rows.length);
    console.log(JSON.stringify(profiles.rows, null, 2));

    for (const p of profiles.rows) {
        console.log(`\n--- Roles for user_id ${p.user_id} ---`);
        const roles = await client.query('SELECT * FROM public.user_roles WHERE user_id = $1', [p.user_id]);
        console.log(JSON.stringify(roles.rows, null, 2));
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
