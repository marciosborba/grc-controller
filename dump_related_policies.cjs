const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const result = await client.query(
    "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('vulnerability_comments', 'vulnerability_action_items', 'vulnerability_attachments')"
  );
  fs.writeFileSync('related_policies.json', JSON.stringify(result.rows, null, 2));
  await client.end();
});
