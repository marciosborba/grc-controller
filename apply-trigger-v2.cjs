const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'db.myxvxponlmulnjstbjwd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    console.log('🚀 Applying trigger v2 fix...');
    const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20260312000008_fix_trigger_v2.sql'), 'utf8');
    await client.query(sql);
    console.log('✅ Trigger handle_new_user() v2 applied.');

    // Verify the trigger source
    const verify = await client.query("SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user'");
    if (verify.rows[0]?.prosrc?.includes('v_existing_profile_id')) {
      console.log('✅ Verification passed: trigger uses new logic.');
    } else {
      console.log('❌ Verification failed: trigger may not have updated.');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();
