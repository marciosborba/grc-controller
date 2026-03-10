const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Count logs total
        const count = await client.query('SELECT count(*) FROM activity_logs');
        console.log('Total Logs:', count.rows[0].count);

        // Show recent logs with tenant_id and dates
        const res = await client.query(`
            SELECT id, tenant_id, created_at, action 
            FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log('Recent Logs:', res.rows);

        // Check RLS policies
        const policies = await client.query(`
            SELECT policyname, cmd, roles, qual
            FROM pg_policies 
            WHERE tablename = 'activity_logs'
        `);
        console.log('RLS Policies:', policies.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
