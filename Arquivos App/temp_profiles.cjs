const { Client } = require('pg');
const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`SELECT id, user_id, email, full_name, tenant_id, is_active FROM profiles;`);
}).then(res => {
    console.log("=== PROFILES ===");
    console.log(JSON.stringify(res.rows, null, 2));

    return client.query(`SELECT id, name, slug FROM tenants;`);
}).then(res => {
    console.log("=== TENANTS ===");
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
}).catch(err => {
    console.error(err.message);
    client.end();
});
