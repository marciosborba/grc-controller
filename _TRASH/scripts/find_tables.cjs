const { Client } = require('pg');
require('dotenv').config();

async function findTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Searching for tables...');
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%control%'");
        if (res.rows.length > 0) {
            console.log('Found tables:', res.rows.map(r => r.table_name));
        } else {
            console.log('No tables found matching "control".');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

findTables();
