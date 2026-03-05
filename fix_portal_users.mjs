import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    // Rename table
    await pool.query(`ALTER TABLE IF EXISTS vendor_custom_fields RENAME TO custom_field_definitions`);
    console.log('✓ Table renamed to custom_field_definitions');

    // Add target_module column
    await pool.query(`ALTER TABLE custom_field_definitions ADD COLUMN IF NOT EXISTS target_module TEXT DEFAULT 'vendor_registration'`);
    console.log('✓ target_module column added');

    // Add editable column
    await pool.query(`ALTER TABLE custom_field_definitions ADD COLUMN IF NOT EXISTS editable BOOLEAN DEFAULT true`);
    console.log('✓ editable column added');

    // Update RLS policies - drop old ones and create new ones for the renamed table
    // First check existing policies
    const { rows: policies } = await pool.query(`SELECT policyname FROM pg_policies WHERE tablename='custom_field_definitions'`);
    console.log('Existing policies:', policies.map(p => p.policyname).join(', '));

    // If the old policies exist (from vendor_custom_fields), they should have been renamed automatically
    // Let's verify the table structure
    const { rows } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='custom_field_definitions' ORDER BY ordinal_position`);
    console.log('Columns:', rows.map(r => r.column_name).join(', '));

    pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
