const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const columns = await client.query(
    "SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_name = 'remediation_tasks'"
  );
  console.log('--- Columns Schema ---');
  columns.rows.forEach(r => console.log(r));

  const vulnPols = await client.query(
    "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'vulnerabilities'"
  );
  console.log('--- Vulnerabilities Policies ---');
  vulnPols.rows.forEach(r => console.log(r));

  await client.end();
});
