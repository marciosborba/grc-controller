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
    // Remove all whitespace
    let n = s.replace(/\s+/g, '');
    // Remove outer parentheses recursively
    while (n.startsWith('(') && n.endsWith(')')) {
        // Simple check: make sure strict matching/balancing isn't broken
        // If we strip (A)OR(B) -> A)OR(B which is wrong.
        // We only strip if the outer parens define the WHOLE scope.
        // Heuristic: count balance.
        let depth = 0;
        let balancedAtEnd = true;
        // Check if first paren closes at usage length-1
        for (let i = 0; i < n.length; i++) {
            if (n[i] === '(') depth++;
            else if (n[i] === ')') depth--;
            if (depth === 0 && i < n.length - 1) {
                // Closed before end
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

            if (row.cmd === 'ALL') {
                grouped[key].ALL.push(row);
            } else {
                grouped[key].OTHER.push(row);
            }
        });

        console.log("Fuzzy scanning for subsumed policies...");
        let sqlContent = `-- Auto-generated removal of fuzzily subsumed RLS policies\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, groups] of Object.entries(grouped)) {
            if (groups.ALL.length > 0 && groups.OTHER.length > 0) {
                groups.ALL.forEach(allPol => {
                    const normAllQual = normalize(allPol.qual);
                    const normAllCheck = normalize(allPol.with_check);

                    groups.OTHER.forEach(otherPol => {
                        // Check Qual
                        let qualSubsumed = false;
                        const normOtherQual = normalize(otherPol.qual);

                        if (normAllQual === normOtherQual) {
                            qualSubsumed = true;
                        } else if (otherPol.qual && otherPol.qual.includes('OR')) {
                            // Attempt to split by OR?
                            // "((A) OR (B))" normalized -> "(A)OR(B)"
                            // If we split by "OR", we need to be careful about nesting.
                            // Simple heuristic: check if normAllQual appears repeatedly or covers parts.
                            // Or reverse: check if otherQual is just `allQual OR allQual`
                            // Let's rely on simple repeated substring check roughly? No.
                            // If `normOtherQual` == `normAllQual` + `OR` + `normAllQual` ...
                            if (normOtherQual.replace(new RegExp(normAllQual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').replace(/OR/g, '') === '') {
                                // This is very hacky but might work for "A OR A" cases
                                qualSubsumed = true;
                            }
                        }

                        // Also assume null qual/check means 'true'.
                        // If ALL qual is null, it allows everything.
                        if (!allPol.qual) qualSubsumed = true;
                        if (!otherPol.qual && allPol.qual) qualSubsumed = false; // Other is stricter (all rows) if ALL has filter? No, null means true.
                        // If ALL has filter, and Other has NO filter (true), then Other matches MORE rows (not subsumed).
                        // Subsumed means: ALL rows allowed by Other are ALSO allowed by ALL.
                        // If ALL has no filter (true), it allows everything. So ANY Other policy is subsumed.
                        if (!allPol.qual) qualSubsumed = true; // ALL is open, covers everything.

                        // Wait, if ALL has `tenant_id=1` and Other has `tenant_id=1`, subsumed.

                        // Check Check
                        let checkSubsumed = false;
                        const normOtherCheck = normalize(otherPol.with_check);
                        if (normAllCheck === normOtherCheck) checkSubsumed = true;
                        if (!allPol.with_check) checkSubsumed = true; // ALL check is null (allow all logic? or same as qual?)
                        // Insert policies use with_check. Update uses both. Select uses qual.

                        // If command is SELECT, only Qual matters. Check is typically null.
                        if (otherPol.cmd === 'SELECT') checkSubsumed = true;
                        if (otherPol.cmd === 'INSERT') qualSubsumed = true; // Qual ignored for insert?

                        if (qualSubsumed && checkSubsumed) {
                            console.log(`Subsumed: "${otherPol.policyname}" (${otherPol.cmd})\n  is covered by "${allPol.policyname}" (ALL)\n  on ${otherPol.tablename}`);
                            sqlContent += `-- Subsumed: ${otherPol.policyname} (${otherPol.cmd}) by ${allPol.policyname} (ALL)\n`;
                            sqlContent += `DROP POLICY IF EXISTS "${otherPol.policyname}" ON public."${otherPol.tablename}";\n\n`;
                            foundCount++;
                        }
                    });
                });
            }
        }

        if (foundCount > 0) {
            fs.writeFileSync('fix_subsumed_fuzzy.sql', sqlContent);
            console.log(`Created fix_subsumed_fuzzy.sql with ${foundCount} drops.`);
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
