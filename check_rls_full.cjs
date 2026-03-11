const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const tableStatus = await client.query(
    "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'remediation_tasks'"
  );
  console.log('--- Table Security Status ---');
  tableStatus.rows.forEach(r => console.log(r));

  const policies = await client.query(
    "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'remediation_tasks'"
  );
  console.log('--- Table Policies ---');
  policies.rows.forEach(r => console.log(r));

  await client.end();
});
