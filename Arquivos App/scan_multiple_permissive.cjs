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
        console.log("Connected. Scanning for Multiple Permissive Policies...");

        // Find tables/cmds with > 1 permissive policy for the same role (group by table, cmd, role)
        // Note: Roles is an array, we'll simplify by checking overlap conceptually or just count per table/cmd/role combo if possible.
        // Easier: Just list all permissive policies for the reported tables to inspect them manually first.

        // Tables reported by user/likely suspects
        const tables = ['privacy_incidents', 'consents', 'custom_fonts', 'assessment_domains', 'assessment_questions', 'assessment_responses'];
        // added assessment_* just in case, though fixed in V2. user screenshot showed consents/custom_fonts.

        for (const t of tables) {
            console.log(`\nTable: ${t}`);
            const res = await client.query(`
          SELECT policyname, cmd, roles, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY cmd, policyname
        `, [t]);

            if (res.rows.length === 0) console.log("  (No policies found)");

            res.rows.forEach(r => {
                console.log(`  [${r.cmd}] ${r.policyname} (Roles: ${r.roles})`);
                if (r.qual) console.log(`    USING: ${r.qual}`);
                if (r.with_check) console.log(`    CHECK: ${r.with_check}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
