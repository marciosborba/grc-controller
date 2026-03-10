
const { Client } = require('pg');
require('dotenv').config();

async function getFullPolicies() {
    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('--- ALL POLICIES FOR vendor_portal_users ---');
        const res = await client.query("SELECT policyname, qual, with_check FROM pg_policies WHERE tablename = 'vendor_portal_users';");
        res.rows.forEach(p => {
            console.log(`POLICY: ${p.policyname}`);
            console.log(`QUAL: ${p.qual}`);
            console.log(`WITH_CHECK: ${p.with_check}`);
            console.log('-------------------');
        });

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

getFullPolicies();
