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
        console.log("Connected. Checking final policies...");

        const tables = ['custom_fonts', 'data_inventory', 'data_subject_requests'];

        for (const t of tables) {
            console.log(`\nTable: ${t}`);
            const res = await client.query(`
          SELECT policyname, cmd, roles, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY policyname
        `, [t]);

            res.rows.forEach(r => {
                console.log(`  [${r.cmd}] ${r.policyname}`);
                console.log(`    USING: ${r.qual}`);
                if (r.with_check) console.log(`    CHECK: ${r.with_check}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
