const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();
    const sql = fs.readFileSync('add_sistemas_flags.sql', 'utf8');
    await client.query(sql);
    console.log("SQL executado com sucesso.");
    await client.end();
}

main().catch(console.error);
