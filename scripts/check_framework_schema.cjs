const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Fetching profiles columns...');
        const res = await client.query("SELECT * FROM public.profiles LIMIT 1");
        if (res.rows.length > 0) {
            console.log('Columns:', Object.keys(res.rows[0]));
        } else {
            console.log('No rows found, cannot infer columns.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
