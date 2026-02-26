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

        // Check FKs for tables missing tenant_id
        const tables = ['remediation_tasks', 'vendor_risk_messages', 'vulnerability_attachments'];

        for (const t of tables) {
            console.log(`\nChecking FKs for ${t}:`);
            const query = `
          SELECT
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM information_schema.key_column_usage AS kcu
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = kcu.constraint_name
          WHERE kcu.table_name = $1
        `;
            const res = await client.query(query, [t]);
            res.rows.forEach(r => {
                console.log(`  ${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
