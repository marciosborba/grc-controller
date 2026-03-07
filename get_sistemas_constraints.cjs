const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();

    // Get check constraints for table 'sistemas'
    const res = await client.query(`
        SELECT
            conname AS constraint_name,
            pg_get_constraintdef(c.oid) AS constraint_definition
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'sistemas' AND c.contype = 'c';
    `);

    fs.writeFileSync('sistemas_constraints.json', JSON.stringify(res.rows, null, 2));
    console.log("Written constraints to sistemas_constraints.json");

    await client.end();
}

main().catch(console.error);
