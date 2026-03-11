const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    await client.query("INSERT INTO remediation_tasks (vulnerability_id, status) VALUES ('11111111-1111-1111-1111-111111111111', 'open')");
  } catch (e) {
    console.log('PG Insert error:', e.message);
  }
  await client.end();
});
