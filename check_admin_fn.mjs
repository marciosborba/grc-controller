import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows } = await pool.query(`
            SELECT pg_get_functiondef(p.oid)
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'is_platform_admin';
        `);
        fs.writeFileSync('admin_fn_out.txt', rows[0]?.pg_get_functiondef, 'utf8');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();
