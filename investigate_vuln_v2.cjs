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

    console.log('\n=== Profile for ajuda@gepriv.com ===');
    const profile = await client.query("SELECT id, email, tenant_id, user_id FROM profiles WHERE email = 'ajuda@gepriv.com'");
    console.log(profile.rows);

    if (profile.rows.length > 0) {
      const tenantId = profile.rows[0].tenant_id;
      const userId = profile.rows[0].user_id;
      const profileId = profile.rows[0].id;
      const email = profile.rows[0].email;

      console.log('\nProfile ID:', profileId);
      console.log('User ID (auth.uid):', userId);
      console.log('Email:', email);
      console.log('Tenant:', tenantId);

      console.log('\n=== ALL Vulnerabilities in tenant ===');
      const vulns = await client.query(
        "SELECT id, title, assigned_to FROM vulnerabilities WHERE tenant_id = $1",
        [tenantId]
      );
      console.log(vulns.rows);

      // Check all user-related columns in vulnerabilities table
      console.log('\n=== User-related columns ===');
      const userCols = await client.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vulnerabilities' AND (column_name ILIKE '%assign%' OR column_name ILIKE '%owner%' OR column_name ILIKE '%respons%' OR column_name ILIKE '%team%' OR column_name ILIKE '%user%' OR column_name ILIKE '%email%' OR column_name ILIKE '%analyst%' OR column_name ILIKE '%contact%')"
      );
      console.log(userCols.rows);

      // Check remediation tasks table structure if it exists
      const rtExists = await client.query(
        "SELECT 1 FROM information_schema.tables WHERE table_name = 'remediation_tasks' AND table_schema = 'public'"
      );
      if (rtExists.rows.length > 0) {
        console.log('\n=== remediation_tasks columns ===');
        const rtcols = await client.query(
          "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'remediation_tasks' ORDER BY ordinal_position"
        );
        console.log(rtcols.rows.map(r => r.column_name).join(', '));
        
        console.log('\n=== remediation_tasks linked to ajuda@gepriv.com ===');
        const rts = await client.query(
          "SELECT * FROM remediation_tasks WHERE assigned_to = $1 OR assigned_to = $2 OR assigned_to = $3 LIMIT 5",
          [email, userId, profileId]
        );
        console.log(rts.rows);
      } else {
        console.log('\n(no remediation_tasks table found)');
      }
    }

  } catch (e) {
    console.error('Error:', e.message, e.detail);
  } finally {
    await client.end();
  }
}

investigate();
