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
            const key = `${row.tablename}|${rolesKey}|${row.cmd}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(row);
        });

        console.log("Scanning for redundant standard access policies...");
        let sqlContent = `-- Auto-generated removal of redundant standard access policies\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;
        let foundCount = 0;

        for (const [key, policies] of Object.entries(grouped)) {
            if (policies.length > 1) {

                let broadPolicy = null;

                for (const p of policies) {
                    const normQual = normalize(p.qual);
                    const clauses = getTopLevelOrClauses(normQual);

                    if (p.tablename === 'assessment_controls') {
                        // console.log(`Debug Assessment Controls: ${p.policyname}`);
                        // console.log(`Clauses: `, clauses);
                        clauses.forEach(c => {
                            // console.log(`  Stripped: ${stripOuterParens(c)}`);
                        });
                    }

                    if (clauses.some(c => stripOuterParens(c) === 'tenant_idISNULL')) {
                        broadPolicy = p;
                        if (p.tablename === 'assessment_controls') {
                            console.log(`Found Broad Policy: ${p.policyname} on ${p.tablename}`);
                        }
                        break;
                    }
                }

                if (broadPolicy) {
                    policies.forEach(p => {
                        if (p.policyname === broadPolicy.policyname) return;

                        const normQual = normalize(p.qual);
                        const stripped = stripOuterParens(normQual);

                        if (p.tablename === 'assessment_controls') {
                            console.log(`Checking ${p.policyname} against broad policy`);
                            console.log(`Norm: ${normQual}`);
                            console.log(`Stripped: ${stripped}`);
                            console.log(`Starts with (tenant_idISNULL)? ${stripped.startsWith('(tenant_idISNULL)')}`);
                            console.log(`Starts with tenant_idISNULL? ${stripped.startsWith('tenant_idISNULL')}`);
                        }

                        if (stripped.startsWith('tenant_idISNULL')
                            || stripped.startsWith('(tenant_idISNULL)')) {

                            console.log(`Subsumed: "${p.policyname}" is covered by "${broadPolicy.policyname}" (Global Null Access) on ${p.tablename}`);
                            sqlContent += `-- Subsumed (Standard Access): ${p.policyname} by ${broadPolicy.policyname}\n`;
                            sqlContent += `DROP POLICY IF EXISTS "${p.policyname}" ON public."${p.tablename}";\n\n`;
                            foundCount++;
                        }
                    });
                }
            }
        }

        if (foundCount > 0) {
            fs.writeFileSync('fix_standard_access_redundancy.sql', sqlContent);
            console.log(`Created fix_standard_access_redundancy.sql with ${foundCount} drops.`);
        } else {
            console.log("No redundant standard access policies found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
