import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixCustomPlans() {
    const geprivVendorId = '6302338c-9d89-4489-8bb1-8b6c002dda00';
    const teste5AsmId = '9ec209e3-cccb-4bc3-b9b3-15a515605e90';
    const seqInfAsmId = '60b14cf8-bf89-4749-8381-aee4fb31f8ce';

    console.log("Fixing the 8 'Teste 5' plans...");
    const newMeta = {
        assessment_id: teste5AsmId,
        assessment_name: 'Teste 5'
    };

    await pool.query(`
    UPDATE action_plans 
    SET 
        entidade_origem_id = $1,
        metadados = $2
    WHERE entidade_origem_id = $3
  `, [geprivVendorId, newMeta, teste5AsmId]);

    console.log("Fixing the single 'Segurança da Informação' plan...");
    const newMetaSeqInf = {
        assessment_id: seqInfAsmId,
        assessment_name: 'Segurança da Informação'
    };

    await pool.query(`
    UPDATE action_plans
    SET metadados = $1
    WHERE id = $2
  `, [newMetaSeqInf, '7e1c915b-ac78-453d-b805-0abdcdf5e34f']);

    console.log("Done database updates!");
}

fixCustomPlans().then(() => pool.end()).catch(err => { console.error(err); pool.end(); });
