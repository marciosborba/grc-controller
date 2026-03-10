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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'action_plans'
        `);

        let out = 'Action Plans Columns:\n';
        columns.rows.forEach(r => out += `${r.column_name} (${r.data_type})\n`);

        fs.writeFileSync('action_plans_cols.txt', out, 'utf8');
        console.log('Saved columns to action_plans_cols.txt');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
