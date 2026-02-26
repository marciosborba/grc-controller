const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

async function run() {
    try {
        await client.connect();
        console.log("Checking initialization targets policies...");

        const tables = ['ethics_evidence', 'ethics_metrics', 'evidencias_auditoria'];
        const res = await client.query(`
      SELECT tablename, policyname, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = ANY($1)
    `, [tables]);

        res.rows.forEach(r => {
            console.log(`TABLE: ${r.tablename}`);
            console.log(`POLICY: "${r.policyname}"`);
            console.log(`QUAL: ${r.qual}`);
            console.log('---');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
