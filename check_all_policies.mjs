import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows: policies } = await pool.query(`
            SELECT tablename, policyname, qual, with_check 
            FROM pg_policies 
            WHERE qual LIKE '%users%' OR with_check LIKE '%users%' OR qual LIKE '%auth.users%' OR with_check LIKE '%auth.users%';
        `);
        fs.writeFileSync('admin_fn_out.txt', JSON.stringify(policies, null, 2), 'utf8');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();
