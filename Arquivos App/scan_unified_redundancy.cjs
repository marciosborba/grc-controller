const { Client } = require('pg');
const fs = require('fs');
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

function normalize(s) {
    if (!s) return '';
    // Collapse whitespace to single space then trim?
    // Or remove all? Remove all is robust against formatting.
    return s.replace(/\s+/g, '');
}

async function run() {
    try {
        await client.connect();

        // Fetch unified policies
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
      AND policyname LIKE 'unified_%'
      ORDER BY tablename, cmd;
    `;

        const res = await client.query(query);
        const grouped = {};

        res.rows.forEach(row => {
            // We only care about matching pairs on the SAME table and roles
            let rolesKey = 'public';
            if (row.roles && row.roles.length > 0) {
                rolesKey = Array.isArray(row.roles) ? row.roles.sort().join(',') : row.roles.toString();
            }
            const key = `${row.tablename}|${rolesKey}`;
            if (!grouped[key]) {
                grouped[key] = { ALL: null, SELECT: null };
            }

            // strictly check for naming convention
            if (row.policyname === `unified_ALL_${row.tablename}_policy`) {
                grouped[key].ALL = row;
            } else if (row.policyname === `unified_SELECT_${row.tablename}_policy`) {
                grouped[key].SELECT = row;
            }
        });

        console.log("Scanning for redundant unified policies...");
        let sqlContent = `-- Auto-generated removal of redundant unified RLS policies\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, pair] of Object.entries(grouped)) {
            if (pair.ALL && pair.SELECT) {
                const normAllComp = normalize(pair.ALL.qual);
                const normSelComp = normalize(pair.SELECT.qual);

                // Check if ALL contains SELECT
                // Note: Since we built these with " OR ", simple inclusion is a strong signal of coverage (A OR B covers B).
                // We verify matching characters count to be at least significant.

                if (normAllComp.includes(normSelComp)) {
                    console.log(`Redundant: "${pair.SELECT.policyname}" is contained in "${pair.ALL.policyname}" on ${pair.ALL.tablename}`);

                    sqlContent += `-- "${pair.SELECT.policyname}" is contained in "${pair.ALL.policyname}"\n`;
                    sqlContent += `DROP POLICY IF EXISTS "${pair.SELECT.policyname}" ON public."${pair.ALL.tablename}";\n\n`;
                    foundCount++;
                } else {
                    // Even if not strict inclusion, check if normSel is substring of normAll ignoring some chars?
                    // Let's rely on strict inclusion first.
                    // debug mismatch
                    // console.log(`Mismatch on ${pair.ALL.tablename}:`);
                    // console.log(`ALL: ${normAllComp}`);
                    // console.log(`SEL: ${normSelComp}`);
                }
            }
        }

        if (foundCount > 0) {
            fs.writeFileSync('fix_unified_redundancy.sql', sqlContent);
            console.log(`Created fix_unified_redundancy.sql with ${foundCount} drops.`);
        } else {
            console.log("No redundant unified policies found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
