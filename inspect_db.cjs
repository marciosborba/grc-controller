const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

async function inspect() {
    const client = new Client(config);
    await client.connect();

    try {
        console.log('--- Policies on platform_admins ---');
        const res1 = await client.query(`
      SELECT policyname, qual, cmd FROM pg_policies WHERE tablename = 'platform_admins';
    `);
        console.table(res1.rows);

        console.log('--- Policies on tenants ---');
        const res2 = await client.query(`
      SELECT policyname, qual, cmd FROM pg_policies WHERE tablename = 'tenants';
    `);
        console.table(res2.rows);

        console.log('--- Function is_platform_admin ---');
        const res3 = await client.query(`
      SELECT proname, prosrc, prosecdef FROM pg_proc WHERE proname = 'is_platform_admin';
    `);
        console.table(res3.rows);

        console.log('--- Auth Users Count (Direct) ---');
        const res4 = await client.query(`SELECT count(*) FROM auth.users`);
        console.log(res4.rows[0]);

        console.log('--- Executing get_diagnostic_stats ---');
        const res5 = await client.query(`SELECT get_diagnostic_stats()`);
        console.log(JSON.stringify(res5.rows[0], null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

inspect();
