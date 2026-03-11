const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const functions = await client.query(
    "SELECT routine_name, routine_definition FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('is_platform_admin', 'get_auth_tenant_id')"
  );
  console.log('--- Functions ---');
  functions.rows.forEach(r => console.log(r));

  await client.end();
});
