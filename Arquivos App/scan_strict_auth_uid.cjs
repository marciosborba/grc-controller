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

const client = new Client(config);

async function run() {
    try {
        await client.connect();
        console.log("Scanning for strictly unoptimized auth.uid() usage...");

        // We look for policies where definition contains auth.uid() 
        // BUT does not contain "(SELECT auth.uid()" or "( SELECT auth.uid()" ignoring casing/spacing
        // Actually, Postgres might normalize to "auth.uid()", so we specifically target those without SELECT wrapper.
        const res = await client.query(`
      SELECT tablename, policyname, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      AND (
           (QUAL LIKE '%auth.uid()%' AND QUAL NOT LIKE '%(SELECT auth.uid()%' AND QUAL NOT LIKE '%( SELECT auth.uid()%')
        OR (WITH_CHECK LIKE '%auth.uid()%' AND WITH_CHECK NOT LIKE '%(SELECT auth.uid()%' AND WITH_CHECK NOT LIKE '%( SELECT auth.uid()%')
      )
    `);

        let count = 0;
        res.rows.forEach(r => {
            console.log(`TABLE: ${r.tablename}`);
            console.log(`POLICY: "${r.policyname}"`);
            // console.log(`QUAL: ${r.qual}`);
            console.log('---');
            count++;
        });

        console.log(`Found ${count} remaining unoptimized policies.`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
