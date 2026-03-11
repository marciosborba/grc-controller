const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const result = await client.query(
    "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_tenant_security_settings'"
  );
  console.log('get_tenant_security_settings exists:', result.rows.length > 0);
  await client.end();
});
