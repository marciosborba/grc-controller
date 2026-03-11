const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const result1 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'remediation_tasks'");
  console.log('remediation_tasks columns:');
  result1.rows.forEach(r => console.log(' - ' + r.column_name));
  await client.end();
});
