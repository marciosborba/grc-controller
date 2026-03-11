const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const result = await client.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('vulnerabilities', 'applications', 'assets')
      AND column_name IN ('custom_fields', 'metadata', 'extra_fields')
    ORDER BY table_name, column_name
  `);
  console.log('--- Custom Fields Columns ---');
  result.rows.forEach(r => console.log(r));
  await client.end();
});
