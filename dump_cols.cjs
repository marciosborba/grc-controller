const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function dumpColumns() {
    try {
        await client.connect();
        let output = '';

        const tables = ['risk_registration_action_plans', 'risk_registrations'];

        for (const table of tables) {
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);

            output += `--- COLUMNS IN ${table} ---\n`;
            res.rows.forEach(r => {
                output += `${r.column_name} (${r.data_type})\n`;
            });
            output += '\n';
        }

        fs.writeFileSync('table_columns_dump.txt', output);
        console.log('Dump written to table_columns_dump.txt');
    } catch (err) {
        console.error('FAIL: ' + err.message);
    } finally {
        await client.end();
    }
}

dumpColumns();
