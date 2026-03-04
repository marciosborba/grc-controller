import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixPlans() {
    console.log("Fetching plans without assessment info...");
    const resPlans = await pool.query(`
    SELECT id, entidade_origem_id, metadados 
    FROM action_plans 
    WHERE modulo_origem = 'vendor_risk'
  `);

    const plans = resPlans.rows;
    const plansToFix = plans.filter(p => !p.metadados || !p.metadados.assessment_id || !p.metadados.assessment_name);
    console.log(`Found ${plansToFix.length} plans to fix.`);

    for (const plan of plansToFix) {
        const vendorId = plan.entidade_origem_id;
        if (!vendorId) continue;

        console.log(`Finding latest assessment for vendor ${vendorId}`);
        const resAsm = await pool.query(`
      SELECT id, assessment_name 
      FROM vendor_assessments 
      WHERE vendor_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [vendorId]);

        if (resAsm.rows.length > 0) {
            const asm = resAsm.rows[0];
            const newMeta = {
                ...(plan.metadados || {}),
                assessment_id: asm.id,
                assessment_name: asm.assessment_name,
                fixed_by_script: true
            };

            console.log(`Updating plan ${plan.id} to assessment ${asm.assessment_name}...`);
            await pool.query(`
        UPDATE action_plans 
        SET metadados = $1 
        WHERE id = $2
      `, [newMeta, plan.id]);
            console.log(`Plan ${plan.id} updated successfully.`);
        } else {
            console.log(`No assessments found for vendor ${vendorId}. Skipping.`);
        }
    }
}

fixPlans().then(() => {
    console.log('Done');
    pool.end();
}).catch(err => {
    console.error(err);
    pool.end();
});
