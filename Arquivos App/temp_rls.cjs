const { Client } = require('pg');
const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM
      pg_policies
    WHERE
      tablename = 'profiles';
  `);
}).then(res => {
    console.log("=== PROFILES RLS POLICIES ===");
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
}).catch(err => {
    console.error(err.message);
    client.end();
});
