import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

import fs from 'fs';

async function run() {
    try {
        console.log("Checking plans for GePriv vendor...");
        const res = await pool.query(`
            SELECT id, titulo, status, entidade_origem_id, entidade_origem_tipo, metadados
            FROM action_plans
            WHERE entidade_origem_id = '6302338c-9d89-4489-8bb1-8b6c002dda00'
        `);

        fs.writeFileSync('gepriv_plans.json', JSON.stringify(res.rows, null, 2));
        console.log("Wrote fully to gepriv_plans.json");
    } catch (err) {
        console.error("Error", err);
    }
}

run().then(() => pool.end()).catch(console.error);
