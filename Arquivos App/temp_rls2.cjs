const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
    SELECT
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
    fs.writeFileSync('Arquivos App/temp_rls.json', JSON.stringify(res.rows, null, 2));
    client.end();
}).catch(err => {
    console.error(err.message);
    client.end();
});
