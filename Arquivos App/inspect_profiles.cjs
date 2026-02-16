const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'profiles'
        `);
        console.log('Profiles Columns:', res.rows);

        const pks = await client.query(`
            SELECT a.attname
            FROM   pg_index i
            JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                AND a.attnum = ANY(i.indkey)
            WHERE  i.indrelid = 'public.profiles'::regclass
            AND    i.indisprimary;
        `);
        console.log('Primary Key:', pks.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
