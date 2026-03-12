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
    const r = await client.query(`
        SELECT ur.role, ur.tenant_id 
        FROM public.user_roles ur 
        JOIN public.profiles p ON ur.user_id = p.user_id 
        WHERE p.email = $1
    `, ['marcio@gepriv.com']);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
