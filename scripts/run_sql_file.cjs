const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectionString = `postgres://postgres.myxvxponlmulnjstbjwd:${process.env.SUPABASE_DB_PASSWORD}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

async function run() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a SQL file path');
        process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Executing SQL from ${filePath}...`);

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL, usually
    });

    try {
        await client.connect();
        await client.query(sql);
        console.log('Successfully executed SQL script.');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
