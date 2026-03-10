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
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'action_plans' 
              AND is_nullable = 'NO'
        `);

        let out = 'NO-NULL Action Plans Columns:\n';
        columns.rows.forEach(r => {
            if (!r.column_default) {
                out += `REQUIRED: ${r.column_name} (${r.data_type})\n`;
            } else {
                out += `Has Default: ${r.column_name} -> ${r.column_default}\n`;
            }
        });

        console.log(out);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
