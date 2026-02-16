const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT table_type FROM information_schema.tables WHERE table_name = 'incidents'");
        console.log('Table Type:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
