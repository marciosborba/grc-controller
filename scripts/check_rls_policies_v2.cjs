const { Client } = require('pg');
require('dotenv').config();

async function checkPolicies() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Checking RLS policies for vendor_registry...');
        const res = await client.query("SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'vendor_registry'");

        if (res.rows.length === 0) {
            console.log('No policies found for vendor_registry.');
        } else {
            res.rows.forEach(p => {
                console.log(`\nPolicy: ${p.policyname}`);
                console.log(`- Command: ${p.cmd}`);
                console.log(`- USING (qual): ${p.qual}`);
                console.log(`- WITH CHECK: ${p.with_check}`);
            });
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkPolicies();
