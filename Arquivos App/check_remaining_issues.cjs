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
        console.log("Connected. Checking remaining policies...");

        const tables = ['custom_fonts', 'data_inventory'];

        for (const t of tables) {
            console.log(`\nTable: ${t}`);
            const res = await client.query(`
          SELECT policyname, cmd, roles, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY policyname
        `, [t]);

            if (res.rows.length === 0) console.log("  (No policies)");

            res.rows.forEach(r => {
                console.log(`  [${r.cmd}] ${r.policyname}`);
                console.log(`    USING: ${r.qual}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
