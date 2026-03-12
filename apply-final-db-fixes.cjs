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
    
    console.log('🚀 Running database fixes...');

    // 1. Update trigger function
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260312000007_fix_invitation_trigger.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('✅ Trigger handle_new_user() updated.');

    // 2. Fix the specific user: marcio@gepriv.com
    const email = 'marcio@gepriv.com';
    const tenantId = '46b1c048-85a1-423b-96fc-776007c8de1f';
    const userId = '6846239a-5d51-4a63-861a-5c309767ac68';

    console.log(`🔧 Fixing user ${email}...`);

    // Update profile
    await client.query('UPDATE public.profiles SET tenant_id = $1, system_role = $2 WHERE user_id = $3', [tenantId, 'admin', userId]);
    
    // Update role (ensure it has the tenant_id)
    await client.query('UPDATE public.user_roles SET tenant_id = $1 WHERE user_id = $2 AND role = $3', [tenantId, userId, 'admin']);
    
    // Check if there's a null tenant_id role to cleanup
    await client.query('DELETE FROM public.user_roles WHERE user_id = $1 AND tenant_id IS NULL', [userId]);

    console.log('✅ User marcio@gepriv.com fixed.');

  } catch (err) {
    console.error('❌ Error during database fixes:', err);
  } finally {
    await client.end();
  }
}
run();
