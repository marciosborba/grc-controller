const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);

if(!dbPassMatch) { process.exit(1); }

const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function investigate() {
  try {
    await client.connect();

    const profile = await client.query("SELECT id, email, tenant_id, user_id FROM profiles WHERE email = 'ajuda@gepriv.com'");
    const { id: profileId, tenant_id: tenantId, user_id: userId, email } = profile.rows[0];

    console.log('Profile:', { profileId, tenantId, userId, email });
    
    // All vulnerability user-related columns
    console.log('\n=== User-related columns in vulnerabilities ===');
    const userCols = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vulnerabilities' ORDER BY ordinal_position"
    );
    userCols.rows.forEach(r => console.log(r.column_name, '-', r.data_type));

    // All vulnerabilities in tenant
    console.log('\n=== All vulnerabilities ===');
    const vulns = await client.query(
      "SELECT id, title, assigned_to, assigned_group_id, status FROM vulnerabilities WHERE tenant_id = $1",
      [tenantId]
    );
    console.log(vulns.rows);

    // Remediation tasks
    console.log('\n=== Remediation Tasks Schema ===');
    const rtcols = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'remediation_tasks' ORDER BY ordinal_position"
    );
    rtcols.rows.forEach(r => console.log(r.column_name, '-', r.data_type));

    console.log('\n=== Remediation Tasks data ===');
    const rts = await client.query("SELECT * FROM remediation_tasks LIMIT 5");
    console.log(rts.rows);

    // Vulnerability steps
    console.log('\n=== vulnerability_remediation_steps columns ===');
    const hasSteps = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'vulnerability_remediation_steps' AND table_schema = 'public'");
    if (hasSteps.rows.length > 0) {
      const stcols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vulnerability_remediation_steps' ORDER BY ordinal_position");
      stcols.rows.forEach(r => console.log(r.column_name, '-', r.data_type));
      const steps = await client.query("SELECT * FROM vulnerability_remediation_steps LIMIT 5");
      console.log('Sample steps:', steps.rows);
    } else {
      console.log('(no vulnerability_remediation_steps table)');
    }

    // Check what ajuda user ID appears in
    console.log('\n=== Checking if ajuda user_id appears anywhere in vulns or tasks ===');
    const byUserId = await client.query(
      "SELECT id, title, assigned_to FROM vulnerabilities WHERE assigned_to::text = $1 OR assigned_to::text = $2",
      [userId, profileId]
    );
    console.log('By user_id/profile_id:', byUserId.rows);
    
    const byEmail = await client.query(
      "SELECT id, title, assigned_to FROM vulnerabilities WHERE assigned_to::text = $1",
      [email]
    );
    console.log('By email:', byEmail.rows);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

investigate();
