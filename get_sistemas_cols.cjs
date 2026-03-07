const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();
    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'sistemas';
  `);

    fs.writeFileSync('sistemas_cols.json', JSON.stringify(res.rows, null, 2));
    console.log("Written columns to sistemas_cols.json");
    await client.end();
}

main().catch(console.error);
