import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        const { rows } = await pool.query(`SELECT pg_get_functiondef(oid) as def FROM pg_proc WHERE proname = 'get_public_assessment_data';`);
        fs.writeFileSync('C:/tmp/rpc.sql', rows[0].def);
        console.log('Written to C:/tmp/rpc.sql. Length:', rows[0].def.length);

        // Show the part with status and public_link filter
        const def = rows[0].def;
        console.log('\n--- FROM and WHERE area ---');
        const fromIdx = def.indexOf('FROM vendor_assessments');
        const fromIdx2 = def.indexOf('FROM assessment_frameworks');
        console.log('FROM vendor_assessments at index:', fromIdx);
        console.log('FROM assessment_frameworks at index:', fromIdx2);

        // Find WHERE that filters by link
        const linkFilterIdx = def.indexOf('public_link');
        console.log('\nContext around public_link filter:');
        console.log(def.substring(linkFilterIdx - 100, linkFilterIdx + 300));

        // Find status filter
        const statusIdx = def.indexOf("'sent'");
        console.log('\nContext around status filter:');
        console.log(def.substring(statusIdx - 100, statusIdx + 200));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
