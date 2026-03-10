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
        console.log("Scanning for suboptimal RLS policies (auth.* / current_setting)...");

        // Look for policies using auth.uid(), auth.jwt(), or current_setting() 
        // that might NOT be wrapped in (SELECT ...).
        // Note: This regex-like check in storage is rough. 
        // A simple heuristic: if it contains "auth.uid()" but NOT "(SELECT auth.uid())" it *might* be unoptimized.
        // However, strict regex is hard in SQL. We'll list them and filter in JS or just inspect.

        const res = await client.query(`
      SELECT schemaname, tablename, policyname, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      AND (
           QUAL LIKE '%auth.%' OR QUAL LIKE '%current_setting%' 
        OR WITH_CHECK LIKE '%auth.%' OR WITH_CHECK LIKE '%current_setting%'
      )
    `);

        let count = 0;
        res.rows.forEach(r => {
            let needsFix = false;
            const definitions = [r.qual, r.with_check].filter(d => d);

            for (const def of definitions) {
                // Check for direct usage without SELECT wrapper
                // This is a naive check. "auth.uid()" exists, but "(SELECT auth.uid())" doesn't?
                // Or "current_setting" exists but "(SELECT current_setting" doesn't?

                // We want to find cases where it is NOT (select ...)
                // But we must be careful.

                // Simplest check: The user specifically mentioned current_setting() re-evaluation.
                // Let's flag anything with `current_setting` that doesn't look like `(SELECT current_setting`

                if (def.includes('current_setting') && !def.includes('(SELECT current_setting') && !def.includes('( SELECT current_setting')) {
                    needsFix = true;
                }

                // Same for auth.uid() if requested, though auth.uid() is often fine. 
                // User said "auth.<function>".
                if (def.includes('auth.uid()') && !def.includes('(SELECT auth.uid())') && !def.includes('( SELECT auth.uid())')) {
                    needsFix = true;
                }
            }

            if (needsFix) {
                console.log(`TABLE: ${r.tablename}`);
                console.log(`POLICY: "${r.policyname}"`);
                console.log(`QUAL: ${r.qual}`);
                console.log(`CHECK: ${r.with_check}`);
                console.log('---');
                count++;
            }
        });

        console.log(`Found ${count} potentially unoptimized policies.`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
