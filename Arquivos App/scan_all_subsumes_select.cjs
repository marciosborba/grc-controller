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
    return s.replace(/\s+/g, '');
}

function stripOuterParens(s) {
    let c = s;
    while (c.startsWith('(') && c.endsWith(')')) {
        let depth = 0;
        let balanced = true;
        for (let i = 0; i < c.length; i++) {
            if (c[i] === '(') depth++;
            else if (c[i] === ')') depth--;
            if (depth === 0 && i < c.length - 1) { balanced = false; break; }
        }
        if (balanced && depth === 0) c = c.substring(1, c.length - 1);
        else break;
    }
    return c;
}

function getTopLevelOrClauses(s) {
    let content = stripOuterParens(s);
    const clauses = [];
    let depth = 0;
    let lastIndex = 0;
    for (let i = 0; i < content.length; i++) {
        if (content[i] === '(') depth++;
        else if (content[i] === ')') depth--;
        if (depth === 0) {
            if (content.substring(i, i + 2) === 'OR') {
                clauses.push(content.substring(lastIndex, i));
                lastIndex = i + 2;
                i++;
            }
        }
    }
    clauses.push(content.substring(lastIndex));
    return clauses.map(c => normalize(c));
}

function findDiff(s1, s2) {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) i++;
    return { index: i, char1: s1.charCodeAt(i), char2: s2.charCodeAt(i) };
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
                grouped[key] = { ALL: [], SELECT: [] };
            }
            if (row.cmd === 'ALL') grouped[key].ALL.push(row);
            else if (row.cmd === 'SELECT') grouped[key].SELECT.push(row);
        });

        console.log("Scanning for ALL subsuming SELECT via OR clauses...");
        let sqlContent = `-- Auto-generated removal of SELECT policies subsumed by ALL policies (OR logic)\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, groups] of Object.entries(grouped)) {
            if (groups.ALL.length > 0 && groups.SELECT.length > 0) {
                groups.ALL.forEach(allPol => {
                    const normAllQual = normalize(allPol.qual);
                    const clauses = getTopLevelOrClauses(normAllQual);
                    if (!clauses.includes(normAllQual)) clauses.push(normAllQual);

                    groups.SELECT.forEach(selPol => {
                        let qualSubsumed = false;
                        let normSelQual = normalize(selPol.qual);
                        const strippedSel = stripOuterParens(normSelQual);

                        if (allPol.tablename === 'ai_grc_providers') {
                            console.log(`Debug table: ${allPol.tablename}`);
                            clauses.forEach(c => {
                                const strippedC = stripOuterParens(c);
                                if (strippedC !== strippedSel) {
                                    const diff = findDiff(strippedC, strippedSel);
                                    console.log(`  Diff: index ${diff.index}, C:${diff.char1}, S:${diff.char2}`);
                                    // log regex safe strings
                                    console.log(`  C: ${strippedC.substring(diff.index - 5, diff.index + 5)}`);
                                    console.log(`  S: ${strippedSel.substring(diff.index - 5, diff.index + 5)}`);
                                }
                            });
                        }

                        if (clauses.some(c => stripOuterParens(c) === strippedSel)) {
                            qualSubsumed = true;
                        }

                        if (!allPol.qual) qualSubsumed = true;

                        if (qualSubsumed) {
                            console.log(`Subsumed: "${selPol.policyname}" (SELECT) is covered by "${allPol.policyname}" (ALL) on ${selPol.tablename}`);
                            sqlContent += `-- Subsumed (OR-logic): ${selPol.policyname} (SELECT) by ${allPol.policyname} (ALL)\n`;
                            sqlContent += `DROP POLICY IF EXISTS "${selPol.policyname}" ON public."${selPol.tablename}";\n\n`;
                            foundCount++;
                        }
                    });
                });
            }
        }

        if (foundCount > 0) {
            fs.writeFileSync('fix_all_subsumes_select.sql', sqlContent);
            console.log(`Created fix_all_subsumes_select.sql with ${foundCount} drops.`);
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
