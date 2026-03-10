const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relname = 'incidents';
    `);
}).then((res) => {
    console.log("=== RLS Status for 'incidents' table ===");
    console.table(res.rows);
    client.end();
}).catch(err => {
    console.error("Erro:", err.message);
    client.end();
});
