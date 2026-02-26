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
      AND permissive = 'PERMISSIVE'
      ORDER BY tablename, cmd;
    `;

        const res = await client.query(query);
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
            if (row.cmd === 'ALL') grouped[key].ALL.push(row);
            else grouped[key].OTHER.push(row);
        });

        console.log("Deep scanning for subsumed policies (OR splitting)...");
        let sqlContent = `-- Auto-generated removal of redundant RLS policies (OR clause analysis)\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, groups] of Object.entries(grouped)) {
            if (groups.ALL.length > 0 && groups.OTHER.length > 0) {
                groups.ALL.forEach(allPol => {
                    const normAllQual = normalize(allPol.qual);

                    // Try splitting by )OR( which suggests top-level clauses (heuristically)
                    // We recreate the parens for the split parts to ensure valid comparison
                    // "A)OR(B" -> ["A", "B"] -> Re-wrap: ["(A)", "(B)"]
                    // But normalization might have stripped outer parens of clauses too?
                    // normalized: "(A)OR(B)". Split by ")OR(" -> ["(A", "B)"].
                    // Add ")" to first, "(" to last?
                    // Intermediate parts? ")OR("
                    // Split logic:
                    const clauses = normAllQual.split(')OR(').map((c, i, arr) => {
                        let clause = c;
                        if (i === 0 && arr.length > 1) clause = clause + ')';
                        else if (i === arr.length - 1 && arr.length > 1) clause = '(' + clause;
                        else if (arr.length > 1) clause = '(' + clause + ')';

                        // Also normalize the clause itself ensuring it's balanced/clean
                        return normalize(clause);
                    });

                    // Check if normAllQual itself is a match (base case)
                    clauses.push(normAllQual);

                    groups.OTHER.forEach(otherPol => {
                        // Check Qual
                        let qualSubsumed = false;
                        const normOtherQual = normalize(otherPol.qual);

                        // Check against all clauses
                        if (clauses.includes(normOtherQual)) {
                            qualSubsumed = true;
                        }

                        // If ALL has null qual (true)
                        if (!allPol.qual) qualSubsumed = true;

                        // CHECK
                        let checkSubsumed = false;
                        const normOtherCheck = normalize(otherPol.with_check);
                        const normAllCheck = normalize(allPol.with_check);

                        if (normAllCheck === normOtherCheck) checkSubsumed = true;
                        if (!allPol.with_check) checkSubsumed = true; // ALL check null = allow all?

                        if (otherPol.cmd === 'SELECT') checkSubsumed = true;
                        if (otherPol.cmd === 'INSERT') qualSubsumed = true;

                        if (qualSubsumed && checkSubsumed) {
                            console.log(`Subsumed: "${otherPol.policyname}" (${otherPol.cmd})\n  is covered by "${allPol.policyname}" (ALL)\n  on ${otherPol.tablename}`);
                            sqlContent += `-- Subsumed (OR-clause): ${otherPol.policyname} (${otherPol.cmd}) by ${allPol.policyname} (ALL)\n`;
                            sqlContent += `DROP POLICY IF EXISTS "${otherPol.policyname}" ON public."${otherPol.tablename}";\n\n`;
                            foundCount++;
                        }
                    });
                });
            }
        }

        if (foundCount > 0) {
            fs.writeFileSync('fix_final_redundancy.sql', sqlContent);
            console.log(`Created fix_final_redundancy.sql with ${foundCount} drops.`);
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
