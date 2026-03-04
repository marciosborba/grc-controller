import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query('BEGIN');

        console.log("Fixing invalid Action Plans statuses...");
        await pool.query(`UPDATE action_plans SET status = 'em_andamento' WHERE status = 'em_execucao'`);
        await pool.query(`UPDATE action_plans SET status = 'aguardando_validacao' WHERE status = 'aprovacao_pendente'`);
        await pool.query(`UPDATE action_plans SET status = 'planejado' WHERE status = 'nao_iniciado'`);

        console.log("Fixing invalid Activities statuses...");
        await pool.query(`UPDATE action_plan_activities SET status = 'em_andamento' WHERE status = 'em_execucao'`);
        await pool.query(`UPDATE action_plan_activities SET status = 'planejado' WHERE status = 'nao_iniciado'`);

        console.log("Adding the expanded check constraint...");
        await pool.query(`
            ALTER TABLE public.action_plans 
            DROP CONSTRAINT IF EXISTS action_plans_status_check;
            
            ALTER TABLE public.action_plans 
            ADD CONSTRAINT action_plans_status_check 
            CHECK (status::text = ANY (ARRAY['planejado'::character varying, 'em_andamento'::character varying, 'concluido'::character varying, 'cancelado'::character varying, 'atrasado'::character varying, 'vencido'::character varying, 'aguardando_validacao'::character varying, 'disponivel_fornecedor'::character varying]::text[]));

            ALTER TABLE public.action_plan_activities 
            DROP CONSTRAINT IF EXISTS action_plan_activities_status_check;
            
            ALTER TABLE public.action_plan_activities 
            ADD CONSTRAINT action_plan_activities_status_check 
            CHECK (status::text = ANY (ARRAY['planejado'::character varying, 'em_andamento'::character varying, 'concluido'::character varying, 'cancelado'::character varying, 'atrasado'::character varying, 'vencido'::character varying, 'aguardando_validacao'::character varying, 'disponivel_fornecedor'::character varying]::text[]));
        `);

        await pool.query('COMMIT');
        console.log("All fixes and constraints applied successfully!");
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error applying updates", err);
    }
}

run().then(() => pool.end()).catch(console.error);
