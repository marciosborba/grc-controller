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
    
    const tenantId = '46b1c048-85a1-423b-96fc-776007c8de1f';
    console.log(`🔍 Roles for tenant ${tenantId}...`);

    const roles = await client.query("SELECT id, name FROM public.tenant_roles WHERE tenant_id = $1", [tenantId]);
    console.log(JSON.stringify(roles.rows, null, 2));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
