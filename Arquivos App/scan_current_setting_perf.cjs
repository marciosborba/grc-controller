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
        console.log("Scanning for unoptimized current_setting() usage...");

        const res = await client.query(`
      SELECT tablename, policyname, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      AND (
           QUAL LIKE '%current_setting%' 
        OR WITH_CHECK LIKE '%current_setting%'
      )
    `);

        let count = 0;
        res.rows.forEach(r => {
            let isUnoptimized = false;
            const definitions = [r.qual, r.with_check].filter(d => d);

            for (const def of definitions) {
                // strict check: has current_setting but NOT (SELECT current_setting
                // Space tolerance: ( SELECT current_setting

                if (def.includes('current_setting') && !def.match(/\(\s*SELECT\s+current_setting/i)) {
                    isUnoptimized = true;
                }
            }

            if (isUnoptimized) {
                console.log(`TABLE: ${r.tablename}`);
                console.log(`POLICY: "${r.policyname}"`);
                console.log(`QUAL: ${r.qual}`);
                console.log('---');
                count++;
            }
        });

        console.log(`Found ${count} unoptimized current_setting policies.`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
