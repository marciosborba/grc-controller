import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('Searching for any function that contains INSERT INTO action_plans and "title"');

        const procs = await pool.query(`
            SELECT proname, pg_get_functiondef(oid) as def
            FROM pg_proc 
            WHERE proname NOT LIKE 'RI_%'
        `);

        let found = false;
        procs.rows.forEach(r => {
            if (r.def && r.def.includes('action_plans') && r.def.includes('title')) {
                console.log(`\nFound in function: ${r.proname}`);
                found = true;
            }
        });

        if (!found) console.log('Not found in any function.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
