import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        const { rows } = await pool.query(`SELECT pg_get_functiondef(oid) as def FROM pg_proc WHERE proname = 'update_vendor_assessment_public';`);
        if (rows.length > 0) {
            fs.writeFileSync('C:/tmp/rpc_update.sql', rows[0].def);
            console.log('Saved to C:/tmp/rpc_update.sql');
        } else {
            console.log('Function not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
