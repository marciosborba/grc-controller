import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

import fs from 'fs';

async function run() {
    let out = "";
    out += "--- VENDORS ---\n";
    const vendors = await pool.query(`SELECT id, name FROM vendor_registry WHERE name ILIKE '%GePriv%' OR name ILIKE '%Desconhecido%'`);
    vendors.rows.forEach(r => out += JSON.stringify(r) + "\n");

    out += "\n--- ASSESSMENTS ---\n";
    const asms = await pool.query(`SELECT id, vendor_id, assessment_name FROM vendor_assessments WHERE assessment_name ILIKE '%Teste 5%' OR assessment_name ILIKE '%Segurança da Informação%' OR vendor_id IN (SELECT id FROM vendor_registry WHERE name ILIKE '%GePriv%')`);
    asms.rows.forEach(r => out += JSON.stringify(r) + "\n");

    out += "\n--- ACTION PLANS ---\n";
    const plans = await pool.query(`SELECT id, titulo, entidade_origem_id, metadados FROM action_plans WHERE modulo_origem = 'vendor_risk'`);
    plans.rows.forEach(r => {
        out += `Plan ID: ${r.id}\n`;
        out += `  Title: ${r.titulo}\n`;
        out += `  Vendor ID: ${r.entidade_origem_id}\n`;
        out += `  Meta asm: ${r.metadados?.assessment_name}\n`;
        out += `  Meta id: ${r.metadados?.assessment_id}\n`;
    });

    fs.writeFileSync('inspect_map_out.txt', out);
    console.log('Wrote to inspect_map_out.txt');
}

run().then(() => pool.end()).catch(e => { console.error(e); pool.end(); });
