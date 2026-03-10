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

        const grouped = {};

        res.rows.forEach(row => {
            let rolesKey = 'public';
            if (row.roles && row.roles.length > 0) {
                rolesKey = Array.isArray(row.roles) ? row.roles.sort().join(',') : row.roles.toString();
            }

            const key = `${row.tablename}|${rolesKey}`;
            if (!grouped[key]) {
                grouped[key] = { ALL: [], SELECT: [] };
            }

            if (row.cmd === 'ALL') {
                grouped[key].ALL.push(row);
            } else if (row.cmd === 'SELECT') {
                grouped[key].SELECT.push(row);
            }
        });

        console.log("Scanning for ALL policies overlapped by SELECT...");
        let sqlContent = `-- Auto-generated splitting of ALL policies overlapped by specific SELECT policies\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, groups] of Object.entries(grouped)) {
            if (groups.ALL.length > 0 && groups.SELECT.length > 0) {
                groups.ALL.forEach(allPol => {
                    const normAllQual = normalize(allPol.qual);
                    const normAllCheck = normalize(allPol.with_check); // ALL usually has check

                    groups.SELECT.forEach(selPol => {
                        // Check if SELECT qual subsumes ALL qual
                        // Logic: If selQual contains allQual (string fuzzy match)
                        const normSelQual = normalize(selPol.qual);

                        let subsumes = false;

                        if (normAllQual === normSelQual) {
                            subsumes = true; // Identical
                        } else if (selPol.qual && selPol.qual.includes('OR')) {
                            const escaped = normAllQual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(escaped, 'g');
                            // If selQual is roughly `...ALL...` 
                            if (normSelQual.includes(normAllQual)) {
                                subsumes = true;
                            }
                        }

                        // Specific case: if ALL has qual and SELECT has NO qual (true), SELECT subsumes.
                        if (allPol.qual && !selPol.qual) subsumes = true;

                        if (subsumes) {
                            console.log(`Overlapped: ALL Policy "${allPol.policyname}" on ${allPol.tablename}\n  is covered for SELECT by "${selPol.policyname}"`);

                            // Action: Split ALL policy into INSERT, UPDATE, DELETE
                            sqlContent += `-- ALL Policy "${allPol.policyname}" is redundant for SELECT (covered by "${selPol.policyname}")\n`;
                            sqlContent += `-- Converting to explicit INSERT/UPDATE/DELETE policies\n`;

                            // DROP original
                            sqlContent += `DROP POLICY IF EXISTS "${allPol.policyname}" ON public."${allPol.tablename}";\n`;

                            // Get roles formatted
                            const roles = allPol.roles ? (Array.isArray(allPol.roles) ? allPol.roles.join(', ') : allPol.roles.toString().replace('{', '').replace('}', '')) : 'public';

                            // CREATE INSERT
                            sqlContent += `CREATE POLICY "${allPol.policyname}_insert" ON public."${allPol.tablename}"\n`;
                            sqlContent += `AS PERMISSIVE FOR INSERT TO ${roles}\n`;
                            if (allPol.with_check) sqlContent += `WITH CHECK (${allPol.with_check})\n`;
                            else if (allPol.qual) sqlContent += `WITH CHECK (${allPol.qual})\n`; // Fallback if with_check missing but qual present? usually INSERT uses with_check. 
                            // Note: PG policies for ALL: USING implies check for insert if WITH CHECK not specified? 
                            // "If WITH CHECK is not specified, the USING expression is used also for WITH CHECK... except for INSERT"
                            // Wait, for INSERT, only WITH CHECK is used. If not specified, default is true (allow all).
                            // If ALL policy was `USING (cond)`, does it apply to INSERT?
                            // "For INSERT, only WITH CHECK is enforced." "If WITH CHECK is not specified, it defaults to true"?
                            // Actually, "If the WITH CHECK clause is omitted, the USING clause is used..." regarding UPDATE.
                            // "New rows (INSERT...): only WITH CHECK..."
                            // "ALL": "USING clause used for CAS cases... WITH CHECK used for...".
                            // Use original props.
                            sqlContent += `;\n`;

                            // CREATE UPDATE
                            sqlContent += `CREATE POLICY "${allPol.policyname}_update" ON public."${allPol.tablename}"\n`;
                            sqlContent += `AS PERMISSIVE FOR UPDATE TO ${roles}\n`;
                            if (allPol.qual) sqlContent += `USING (${allPol.qual})\n`;
                            if (allPol.with_check) sqlContent += `WITH CHECK (${allPol.with_check})\n`;
                            else if (allPol.qual) sqlContent += `WITH CHECK (${allPol.qual})\n`;
                            sqlContent += `;\n`;

                            // CREATE DELETE
                            sqlContent += `CREATE POLICY "${allPol.policyname}_delete" ON public."${allPol.tablename}"\n`;
                            sqlContent += `AS PERMISSIVE FOR DELETE TO ${roles}\n`;
                            if (allPol.qual) sqlContent += `USING (${allPol.qual})\n`;
                            sqlContent += `;\n\n`;

                            foundCount++;
                        }
                    });
                });
            }
        }

        if (foundCount > 0) {
            fs.writeFileSync('fix_overlapping_all_policies.sql', sqlContent);
            console.log(`Created fix_overlapping_all_policies.sql with ${foundCount} replacements.`);
        } else {
            console.log("No overlapping ALL policies found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
