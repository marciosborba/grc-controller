import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const { rows } = await pool.query(`
        SELECT pol.polname, pol.polcmd, pol.polqual, pol.polwithcheck, tab.relname
        FROM pg_policy pol
        JOIN pg_class tab ON pol.polrelid = tab.oid
        WHERE tab.relname IN ('vendor_users', 'vendor_portal_users', 'vendor_registry', 'vendor_assessments', 'vendor_risk_messages')
    `);
    fs.writeFileSync('rls_dump_fixed.json', JSON.stringify(rows, null, 2));
    pool.end();
}
main().catch(console.error);
