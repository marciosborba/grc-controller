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

        // Fetch all permissive policies
        const query = `
      SELECT 
        tablename,
        policyname,
        cmd,
        roles,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      AND permissive = 'PERMISSIVE'
      ORDER BY tablename, cmd;
    `;

        const res = await client.query(query);

        // Group by table and role
        // key: "tablename|roles" -> { ALL: [], SELECT: [], INSERT: [], ... }
        const grouped = {};

        res.rows.forEach(row => {
            let rolesKey = 'public';
            if (row.roles && row.roles.length > 0) {
                rolesKey = Array.isArray(row.roles) ? row.roles.sort().join(',') : row.roles.toString();
            }

            const key = `${row.tablename}|${rolesKey}`;
            if (!grouped[key]) {
                grouped[key] = { ALL: [], OTHER: [] };
            }

            if (row.cmd === 'ALL') {
                grouped[key].ALL.push(row);
            } else {
                grouped[key].OTHER.push(row);
            }
        });

        console.log("Scanning for subsumed policies...");
        let sqlContent = `-- Auto-generated removal of subsumed RLS policies\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, groups] of Object.entries(grouped)) {
            if (groups.ALL.length > 0 && groups.OTHER.length > 0) {
                // Check each ALL policy against OTHER policies
                groups.ALL.forEach(allPol => {
                    groups.OTHER.forEach(otherPol => {
                        // Check if conditions are identical
                        // Note: This is a loose check. Whitespace differences might foil it, but usually standard input is consistent.
                        const qualMatch = (allPol.qual === otherPol.qual) || (!allPol.qual && !otherPol.qual);
                        const checkMatch = (allPol.with_check === otherPol.with_check) || (!allPol.with_check && !otherPol.with_check);

                        // Also consider if ALL has NO check/qual (meaning full access) -> it covers everything.
                        // But usually in RLS 'null' qual means 'true' ?? No, null qual means 'true' (visible).
                        // Wait, pg_policies returns null for qual if it's not set?
                        // Let's assume exact string match for safety first.

                        if (qualMatch && checkMatch) {
                            console.log(`Subsumed: "${otherPol.policyname}" (${otherPol.cmd}) is covered by "${allPol.policyname}" (ALL) on ${otherPol.tablename}`);

                            sqlContent += `-- "${otherPol.policyname}" (${otherPol.cmd}) is identical to ALL policy "${allPol.policyname}"\n`;
                            sqlContent += `DROP POLICY IF EXISTS "${otherPol.policyname}" ON public."${otherPol.tablename}";\n\n`;
                            foundCount++;
                        }
                    });
                });
            }
        }

        if (foundCount > 0) {
            const fs = require('fs');
            fs.writeFileSync('fix_subsumed_policies.sql', sqlContent);
            console.log(`Created fix_subsumed_policies.sql with ${foundCount} drops.`);
        } else {
            console.log("No subsumed policies found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
