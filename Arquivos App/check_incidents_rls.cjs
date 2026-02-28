const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
        SELECT pol.policyname, pol.permissive, pol.roles, pol.cmd, pol.qual, pol.with_check 
        FROM pg_policies pol 
        WHERE pol.tablename = 'incidents';
    `);
}).then((res) => {
    console.log("=== RLS Policies for 'incidents' table ===");
    console.table(res.rows);
    client.end();
}).catch(err => {
    console.error("Erro:", err.message);
    client.end();
});
