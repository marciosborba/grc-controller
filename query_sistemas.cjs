const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  await client.query(`NOTIFY pgrst, 'reload schema';`);
  console.log("Schema reloaded");

  await client.end();
}

main().catch(console.error);
