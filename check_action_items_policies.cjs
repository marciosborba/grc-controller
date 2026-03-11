const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const result = await client.query(
    "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'vulnerability_action_items'"
  );
  console.log('--- Action Items Policies ---');
  result.rows.forEach(r => console.log(r));

  await client.end();
});
