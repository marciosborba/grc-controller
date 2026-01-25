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

async function checkNulls() {
    const client = new Client(config);
    await client.connect();

    try {
        const res = await client.query('SELECT count(*) FROM profiles WHERE user_id IS NULL');
        console.log('Profiles with NULL user_id:', res.rows[0].count);

        // Also try delete one
        if (res.rows[0].count > 0) {
            console.log('Deleting profiles with NULL user_id...');
            const del = await client.query('DELETE FROM profiles WHERE user_id IS NULL');
            console.log('Deleted:', del.rowCount);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

checkNulls();
