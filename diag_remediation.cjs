const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);

const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });

client.connect().then(async () => {
  // Check RLS for remediation_tasks
  const policies = await client.query(
    "SELECT tablename, policyname, cmd, roles, qual FROM pg_policies WHERE tablename IN ('remediation_tasks', 'vulnerability_action_items', 'vulnerability_attachments') ORDER BY tablename, cmd"
  );
  console.log('Policies:');
  policies.rows.forEach(r => console.log(`[${r.tablename}] ${r.policyname} (${r.cmd}) roles:${JSON.stringify(r.roles)}`));
  console.log('\nRLS enabled status:');
  const rlsStatus = await client.query(
    "SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('remediation_tasks', 'vulnerability_action_items', 'vulnerability_attachments')"
  );
  rlsStatus.rows.forEach(r => console.log(`${r.relname}: RLS=${r.relrowsecurity}`));

  // Also check remediation_tasks schema again to see if there's a NOT NULL column missing
  const cols = await client.query(
    "SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'remediation_tasks' ORDER BY ordinal_position"
  );
  console.log('\nremediation_tasks schema (nullable/defaults):');
  cols.rows.forEach(r => console.log(`${r.column_name}: nullable=${r.is_nullable} default=${r.column_default}`));
  
  await client.end();
})
