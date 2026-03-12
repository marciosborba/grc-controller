const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');

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
    const r = await client.query('SELECT id, name FROM public.tenant_roles WHERE tenant_id = $1', ['46b1c048-85a1-423b-96fc-776007c8de1f']);
    fs.writeFileSync('clean_roles.json', JSON.stringify(r.rows, null, 2));
    console.log('✅ Wrote roles to clean_roles.json');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
