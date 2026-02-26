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
        console.log("Dumping final candidates...");

        const candidates = [
            'ethics_communication_templates',
            'workflow_steps'
        ];

        for (const table of candidates) {
            console.log(`\n=== TABLE: ${table} ===`);
            const res = await client.query(`
          SELECT policyname, roles, cmd
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY cmd
        `, [table]);

            res.rows.forEach(r => {
                console.log(`[${r.cmd}] "${r.policyname}" Roles: ${r.roles}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
