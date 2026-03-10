import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const allowed = ['planejado', 'em_andamento', 'concluido', 'cancelado', 'atrasado', 'vencido'];

        const res1 = await pool.query('SELECT id, status FROM action_plans WHERE status != ALL($1::text[])', [allowed]);
        console.log(`Action Plans with invalid status (${res1.rowCount}):`, JSON.stringify(res1.rows));

        const res2 = await pool.query('SELECT id, status FROM action_plan_activities WHERE status != ALL($1::text[])', [allowed]);
        console.log(`Activities with invalid status (${res2.rowCount}):`, JSON.stringify(res2.rows));

    } catch (err) {
        console.error("Error", err);
    }
}

run().then(() => pool.end()).catch(console.error);
