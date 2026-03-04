import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const columns = await pool.query(`
            SELECT column_name, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'action_plans' AND column_name = 'codigo'
        `);

        console.log('Codigo default:', columns.rows[0]?.column_default);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
