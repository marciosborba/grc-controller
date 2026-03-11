const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const triggers = await client.query(
    "SELECT tgname, tgenabled, tgtype FROM pg_trigger WHERE tgrelid = 'remediation_tasks'::regclass"
  );
  console.log('--- Triggers on remediation_tasks ---');
  triggers.rows.forEach(r => console.log(r));

  await client.end();
});
