import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
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
        console.log("Constraints updated successfully");
    } catch (err) {
        console.error("Error updating constraints", err);
    }
}

run().then(() => pool.end()).catch(console.error);
