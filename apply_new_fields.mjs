import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const sql = `
            ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS contract_owner_name text;
            ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS contract_owner_email text;
            ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS risk_override_level text;
            ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS risk_override_reason text;
        `;

        console.log('Applying targeted manual SQL migration with new fields...');
        await pool.query(sql);
        console.log('Targeted migration applied successfully.');
    } catch (err) {
        console.error('Error applying migration:', err.message);
    } finally {
        await pool.end();
    }
}
main();
