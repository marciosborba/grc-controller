import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('Checking why the column "title" is still being searched for...');

        // Check triggers on action_plans
        const triggers = await pool.query(`
            SELECT tgname, pg_get_triggerdef(oid) as def 
            FROM pg_trigger 
            WHERE tgrelid = 'action_plans'::regclass
        `);
        let output = 'Triggers on action_plans:\n';
        triggers.rows.forEach(r => output += `${r.tgname} => ${r.def}\n`);

        // Double check the RPC body AGAIN to make absolutely sure it updated
        const rpc = await pool.query(`
            SELECT pg_get_functiondef(oid) as def
            FROM pg_proc 
            WHERE proname = 'submit_vendor_assessment_secure'
        `);
        output += '\nRPC body snippet:\n';
        if (rpc.rows.length > 0) {
            const def = rpc.rows[0].def;
            const insertPart = def.substring(def.indexOf('INSERT INTO action_plans'), def.indexOf('END LOOP;'));
            output += insertPart;
        }

        const fs = await import('fs');
        fs.writeFileSync('triggers_utf8.txt', output, 'utf8');
        console.log('Saved to triggers_utf8.txt');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
