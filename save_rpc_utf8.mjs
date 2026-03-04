import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const rpcInfo = await pool.query(`
            SELECT pg_get_functiondef(oid) as def 
            FROM pg_proc 
            WHERE proname = 'submit_vendor_assessment_secure'
        `);

        fs.writeFileSync('current_rpc_utf8.txt', rpcInfo.rows[0].def, 'utf8');
        console.log('Saved to current_rpc_utf8.txt');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
