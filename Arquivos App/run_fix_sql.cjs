const fs = require('fs');
const { Client } = require('pg');

const sql = fs.readFileSync('fix_rls_performance.sql', 'utf8');

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    console.log('Running SQL file...');
    return client.query(sql);
}).then(() => {
    console.log("Successfully applied fix_rls_performance.sql");
    client.end();
}).catch(err => {
    console.error("Error executing SQL:", err.message);
    client.end();
});
