const { createClient } = require('@supabase/supabase-js');
const DatabaseManager = require('../database-manager.cjs');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);
const db = new DatabaseManager();

async function verifyAccess() {
  const token = 'NDk3YWFkZjQtMDE1_mj0o2p2d';
  console.log(`Verifying access for token: ${token}`);

  // 1. Check DB directly for expiration
  await db.connect();
  const sql = `
    SELECT id, public_link, public_link_expires_at, status, now() as current_db_time
    FROM vendor_assessments
    WHERE public_link = '${token}';
  `;
  const result = await db.executeSQL(sql, "Checking DB record");
  const record = result.rows[0];
  console.log('DB Record:', record);

  if (!record) {
    console.error('❌ Record not found in DB (via admin)');
    return;
  }

  const expiresAt = new Date(record.public_link_expires_at);
  const now = new Date(record.current_db_time);

  console.log('Expires At:', expiresAt.toISOString());
  console.log('Current DB Time:', now.toISOString());

  if (expiresAt < now) {
    console.error('❌ Link EXPIRED');
  } else {
    console.log('✅ Link is VALID (time-wise)');
  }

  // 2. Check via Supabase Anon Client with EXACT query from component
  console.log('Attempting fetch via Anon Client with JOINs...');
  const { data, error } = await supabase
    .from('vendor_assessments')
    .select(`
      *,
      vendor_registry:vendor_id (
        name,
        primary_contact_name
      ),
      vendor_assessment_frameworks:framework_id (
        name:nome,
        framework_type:tipo_framework
      )
    `)
    .eq('public_link', token)
    .single();

  if (error) {
    console.error('❌ Anon Fetch Failed:', error);
  } else {
    console.log('✅ Anon Fetch Success:', data);
  }

  process.exit(0);
}

verifyAccess();
