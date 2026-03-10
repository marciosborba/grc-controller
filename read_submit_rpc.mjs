import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const res = await pool.query(`
            SELECT pg_get_functiondef(oid)
            FROM pg_proc
            WHERE proname = 'submit_vendor_assessment_secure'
        `);

        if (res.rows.length > 0) {
            const fs = await import('fs');
            fs.writeFileSync('rpc_def.txt', res.rows[0].pg_get_functiondef, 'utf8');
            console.log('Saved to rpc_def.txt');
        } else {
            console.log('RPC submit_vendor_assessment_secure not found!');

            // Search for similarly named functions
            const search = await pool.query(`
                SELECT proname FROM pg_proc WHERE proname LIKE '%submit%vendor%'
            `);
            console.log('\nSimilar functions:', search.rows.map(r => r.proname).join(', '));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
