const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Check column type
        const res = await client.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_roles' AND column_name = 'role'
        `);
        console.log('Column Type:', res.rows);

        // If it is an enum, get values
        if (res.rows.length > 0 && res.rows[0].data_type === 'USER-DEFINED') {
            const enumName = res.rows[0].udt_name;
            const enumRes = await client.query(`
                SELECT e.enumlabel
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = $1
            `, [enumName]);
            console.log('Enum Values:', enumRes.rows.map(r => r.enumlabel));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
