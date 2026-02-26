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
        console.log("Connected. Listing assessment tables...");

        const query = `
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE tablename LIKE 'assessment%'
      ORDER BY tablename;
    `;

        const res = await client.query(query);
        res.rows.forEach(row => {
            console.log(`${row.schemaname}.${row.tablename}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
