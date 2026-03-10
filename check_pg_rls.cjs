const { Client } = require('pg');

async function main() {
    const client = new Client({
        user: 'postgres.myxvxponlmulnjstbjwd',
        password: 'GEv123!!@@',
        host: 'aws-0-sa-east-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
      SELECT tablename, policyname, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename IN ('vendor_users', 'vendor_portal_users', 'vendor_registry', 'vendor_assessments', 'action_plans')
      ORDER BY tablename, policyname;
    `);

        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

main();
