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
            SELECT proname, prosrc
            FROM pg_proc 
            WHERE prokind = 'f' 
              AND proname NOT LIKE 'RI_%'
        `);

        let found = false;
        procs.rows.forEach(r => {
            if (r.prosrc && r.prosrc.includes('action_plans') && r.prosrc.includes('title')) {
                console.log(`\nFound in function body: ${r.proname}`);
                found = true;
            }
            if (r.prosrc && r.prosrc.includes('vendor_assessments') && r.prosrc.includes('title')) {
                console.log(`\nFound 'title' in vendor function body: ${r.proname}`);
                found = true;
            }
        });

        if (!found) console.log('Not found in any function body.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
