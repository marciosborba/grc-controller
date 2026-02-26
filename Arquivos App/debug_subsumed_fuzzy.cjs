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

        // Select ONLY ai_grc_prompt_templates for debugging
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
      AND tablename = 'ai_grc_prompt_templates'
      AND permissive = 'PERMISSIVE'
      ORDER BY tablename, cmd;
    `;

        const res = await client.query(query);
        const rows = res.rows;

        const allPols = rows.filter(r => r.cmd === 'ALL');
        const otherPols = rows.filter(r => r.cmd !== 'ALL');

        console.log(`ALL policies: ${allPols.length}`);
        console.log(`Other policies: ${otherPols.length}`);

        allPols.forEach(allPol => {
            const normAllQual = normalize(allPol.qual);
            console.log(`\nALL Policy: ${allPol.policyname}`);
            console.log(`Norm ALL Qual: ${normAllQual}`);

            otherPols.forEach(otherPol => {
                console.log(`\n  Comparing against: ${otherPol.policyname} (${otherPol.cmd})`);
                const normOtherQual = normalize(otherPol.qual);
                console.log(`  Norm Other Qual: ${normOtherQual}`);

                if (normAllQual === normOtherQual) {
                    console.log("  MATCH: Exact match");
                } else {
                    if (otherPol.qual && otherPol.qual.includes('OR')) {
                        const escaped = normAllQual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escaped, 'g');
                        const remainder = normOtherQual.replace(regex, '').replace(/OR/g, '');
                        console.log(`  Fuzzy Check:`);
                        console.log(`    Escaped ALL: ${escaped}`);
                        console.log(`    Remainder: '${remainder}'`);
                        if (remainder === '') {
                            console.log("  MATCH: Fuzzy match");
                        } else {
                            console.log("  FAIL: Remainder not empty");
                        }
                    } else {
                        console.log("  FAIL: No match and no OR");
                    }
                }
            });
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
