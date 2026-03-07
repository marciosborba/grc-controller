const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();
    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vulnerabilities';
  `);

    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

main().catch(console.error);
