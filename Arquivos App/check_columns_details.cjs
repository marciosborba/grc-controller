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
        console.log("Checking columns details...");

        const tables = [
            'vendor_risk_messages',
            'vulnerability_attachments',
            'remediation_tasks'
        ];

        for (const table of tables) {
            console.log(`\nTABLE: ${table}`);
            const res = await client.query(`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [table]);

            const cols = res.rows.map(r => r.column_name);
            console.log(`Columns: ${cols.join(', ')}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
