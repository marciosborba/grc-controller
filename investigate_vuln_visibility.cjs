const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);

if(!dbPassMatch) {
  console.log('No DB pass found');
  process.exit(1);
}

const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function investigate() {
  try {
    await client.connect();

    console.log('\n=== SCHEMA: vulnerabilities ===');
    const cols = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vulnerabilities' ORDER BY ordinal_position"
    );
    console.log(cols.rows.map(r => r.column_name).join(', '));

    console.log('\n=== ALL TABLES containing user-linked fields ===');
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%vuln%' OR table_name LIKE '%remediat%') ORDER BY table_name"
    );
    console.log(tables.rows.map(r => r.table_name).join(', '));

    console.log('\n=== Profile for ajuda@gepriv.com ===');
    const profile = await client.query("SELECT id, email, tenant_id, user_id FROM profiles WHERE email = 'ajuda@gepriv.com'");
    console.log(profile.rows);

    if (profile.rows.length > 0) {
      const tenantId = profile.rows[0].tenant_id;
      const userId = profile.rows[0].user_id;
      const profileId = profile.rows[0].id;
      const email = profile.rows[0].email;

      console.log('\n=== ALL Vulnerabilities in this tenant ===');
      const vulns = await client.query(
        "SELECT id, title, assigned_to, tenant_id FROM vulnerabilities WHERE tenant_id = $1",
        [tenantId]
      );
      console.log(vulns.rows);

      console.log('\n=== Vulnerabilities where assigned_to = user email or id ===');
      const matched = await client.query(
        "SELECT id, title, assigned_to FROM vulnerabilities WHERE tenant_id = $1 AND (assigned_to = $2 OR assigned_to = $3 OR assigned_to = $4)",
        [tenantId, email, userId, profileId]
      );
      console.log(matched.rows);

      console.log('\n=== Checking vulnerability_remediation_steps for user ===');
      const stepTables = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%step%' OR table_name LIKE '%remediat%'"
      );
      console.log('Step-like tables:', stepTables.rows.map(r => r.table_name));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

investigate();
