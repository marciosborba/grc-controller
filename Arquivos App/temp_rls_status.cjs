const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'profiles';
  `);
}).then(res => {
    fs.writeFileSync('Arquivos App/temp_rls3.json', JSON.stringify({
        rls_enabled: res.rows[0].relrowsecurity
    }, null, 2));
    client.end();
}).catch(err => {
    console.error(err.message);
    client.end();
});
