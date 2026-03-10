const { Client } = require('pg');
const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
    SELECT * FROM auth.mfa_factors WHERE user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d';
  `);
}).then(res => {
    console.log("=== auth.mfa_factors ===");
    console.log(JSON.stringify(res.rows, null, 2));

    return client.query(`
    SELECT id, email, settings FROM profiles WHERE email = 'adm@grc-controller.com';
  `);
}).then(res => {
    console.log("=== profiles ===");
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
}).catch(err => {
    console.error(err.message);
    client.end();
});
