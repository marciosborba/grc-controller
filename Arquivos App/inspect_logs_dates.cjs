const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Count total
        const total = await client.query('SELECT count(*) FROM activity_logs');

        // Count last 24h
        const last24h = await client.query(`
            SELECT count(*) FROM activity_logs 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);

        // Count last 30 days
        const last30d = await client.query(`
            SELECT count(*) FROM activity_logs 
            WHERE created_at > NOW() - INTERVAL '30 days'
        `);

        console.log(`Total Logs: ${total.rows[0].count}`);
        console.log(`Last 24h: ${last24h.rows[0].count}`);
        console.log(`Last 30d: ${last30d.rows[0].count}`);

        // Check oldest 5 logs
        const oldest = await client.query('SELECT created_at FROM activity_logs ORDER BY created_at ASC LIMIT 5');
        console.log('Oldest Logs:', oldest.rows);


    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
