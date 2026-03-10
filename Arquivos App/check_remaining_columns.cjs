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
        console.log("Checking columns...");

        const tables = [
            'legal_bases',
            'policies',
            'processing_activities',
            'vendor_risk_messages',
            'vulnerability_attachments',
            'remediation_tasks',
            'risk_registrations'
        ];

        for (const table of tables) {
            const res = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [table]);

            const cols = res.rows.map(r => r.column_name);
            console.log(`TABLE: ${table}`);
            console.log(`Has tenant_id: ${cols.includes('tenant_id')}`);
            // console.log(`Columns: ${cols.join(', ')}`);
            console.log('-');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
