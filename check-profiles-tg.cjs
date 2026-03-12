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
    
    // Check triggers on profiles
    const res = await client.query(`
        SELECT tgname 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE c.relname = 'profiles'
    `);
    console.log('Triggers on profiles:', res.rows.map(r => r.tgname));

    // Check existing data for marcio@gepriv.com with more focus
    const p = await client.query("SELECT id, user_id, full_name, system_role, custom_role_id FROM public.profiles WHERE email = 'marcio@gepriv.com'");
    console.log('Profile:', p.rows[0]);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
