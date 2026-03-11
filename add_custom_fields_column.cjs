const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    await client.query(`
      ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb;
      ALTER TABLE assets ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb;
    `);
    console.log('✅ custom_fields columns added/verified on all 3 tables');
  } catch(e) { console.error('❌', e.message); }
  await client.end();
});
