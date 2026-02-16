const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const t1 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'assessments'");
        console.log('Assessments:', t1.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
