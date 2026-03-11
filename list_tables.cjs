const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE 'vulnerability_%' OR table_name LIKE 'remediation_%')"
  );
  console.log('--- Related Tables ---');
  tables.rows.forEach(r => console.log(r.table_name));

  await client.end();
});
