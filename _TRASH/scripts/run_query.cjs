const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectionString = `postgres://postgres.myxvxponlmulnjstbjwd:${process.env.SUPABASE_DB_PASSWORD}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

async function run() {
    const query = process.argv[2];
    if (!query) {
        console.error('Please provide a SQL query');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(query);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
