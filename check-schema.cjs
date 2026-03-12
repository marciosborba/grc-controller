const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);
        let output = 'Columns in public.profiles:\n';
        res.rows.forEach(row => {
            output += `${row.column_name} (${row.data_type})\n`;
        });
        fs.writeFileSync('schema_log.txt', output, 'utf8');
        console.log('✅ Schema written to schema_log.txt');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
