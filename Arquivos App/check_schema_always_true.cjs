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

        const tables = ['auth_lockouts', 'ethics_evidence', 'risk_registrations', 'consents', 'data_inventory'];

        for (const t of tables) {
            console.log(`\nChecking ${t}:`);
            const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position
        `, [t]);

            const cols = res.rows.map(r => r.column_name);
            console.log(cols.join(', '));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
