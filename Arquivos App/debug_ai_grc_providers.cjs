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

function normalize(s) {
    if (!s) return '';
    let n = s.replace(/\s+/g, '');
    while (n.startsWith('(') && n.endsWith(')')) {
        let depth = 0;
        let balancedAtEnd = true;
        for (let i = 0; i < n.length; i++) {
            if (n[i] === '(') depth++;
            else if (n[i] === ')') depth--;
            if (depth === 0 && i < n.length - 1) {
                balancedAtEnd = false;
                break;
            }
        }
        if (balancedAtEnd && depth === 0) {
            n = n.substring(1, n.length - 1);
        } else {
            break;
        }
    }
    return n;
}

async function run() {
    try {
        await client.connect();

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
      AND tablename = 'ai_grc_providers'
      AND permissive = 'PERMISSIVE';
    `;

        const res = await client.query(query);
        const rows = res.rows;

        const allPols = rows.filter(r => r.cmd === 'ALL');
        const selPols = rows.filter(r => r.cmd === 'SELECT');

        console.log(`ALL policies: ${allPols.length}`);
        console.log(`SELECT policies: ${selPols.length}`);

        allPols.forEach(allPol => {
            const normAllQual = normalize(allPol.qual);
            const normAllCheck = normalize(allPol.with_check);

            console.log(`\nALL Policy: ${allPol.policyname}`);
            console.log(`Qual: ${allPol.qual}`);
            console.log(`Norm Qual: ${normAllQual}`);
            console.log(`Check: ${allPol.with_check}`);
            console.log(`Norm Check: ${normAllCheck}`);

            selPols.forEach(selPol => {
                console.log(`\n  Comparing against SELECT: ${selPol.policyname}`);
                const normSelQual = normalize(selPol.qual);
                console.log(`  Qual: ${selPol.qual}`);
                console.log(`  Norm Qual: ${normSelQual}`);

                if (normAllQual === normSelQual) {
                    console.log("  MATCH: Quals are identical (Subsumed!)");
                } else {
                    console.log("  FAIL: Quals differ");
                    // Diff check
                    console.log("  Diff index:", findDiff(normAllQual, normSelQual));
                }

                // Check check
                let checkSubsumed = false;
                if (selPol.cmd === 'SELECT') checkSubsumed = true; // Select policies don't have check usually, so covered.
                console.log(`  Check subsumed? ${checkSubsumed}`);
            });
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

function findDiff(s1, s2) {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) i++;
    return i;
}

run();
