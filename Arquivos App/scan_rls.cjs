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

async function run() {
    try {
        await client.connect();

        // Query to find policies that use auth.uid(), auth.jwt(), current_setting() 
        // BUT do not appear to wrap them in a subquery (select ...).

        const query = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      AND (
        (qual ILIKE '%auth.uid()%' AND qual NOT ILIKE '%(select auth.uid())%') OR
        (qual ILIKE '%auth.jwt()%' AND qual NOT ILIKE '%(select auth.jwt())%') OR
        (with_check ILIKE '%auth.uid()%' AND with_check NOT ILIKE '%(select auth.uid())%') OR
        (with_check ILIKE '%auth.jwt()%' AND with_check NOT ILIKE '%(select auth.jwt())%')
      )
    `;

        const res = await client.query(query);

        console.log("Inefficient Policies Found:", res.rows.length);

        let sqlContent = `-- Auto-generated optimization for RLS policies\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;

        res.rows.forEach(row => {
            let newQual = row.qual;
            let newCheck = row.with_check;
            let modified = false;

            const replacements = [
                { from: /auth\.uid\(\)/gi, to: '(select auth.uid())' },
                { from: /auth\.jwt\(\)/gi, to: '(select auth.jwt())' }
            ];

            replacements.forEach(rep => {
                if (newQual && newQual.match(rep.from) && !newQual.includes(rep.to)) {
                    newQual = newQual.replace(rep.from, rep.to);
                    modified = true;
                }
                if (newCheck && newCheck.match(rep.from) && !newCheck.includes(rep.to)) {
                    newCheck = newCheck.replace(rep.from, rep.to);
                    modified = true;
                }
            });

            if (modified) {
                console.log(`Generating optimization for: ${row.policyname} ON ${row.tablename}`);

                sqlContent += `
-- Optimizing policy: ${row.policyname} ON ${row.tablename}
DROP POLICY IF EXISTS "${row.policyname}" ON public."${row.tablename}";
CREATE POLICY "${row.policyname}" ON public."${row.tablename}"
AS ${row.permissive}
FOR ${row.cmd}
TO ${row.roles ? row.roles.toString().replace('{', '').replace('}', '') : 'public'}
${newQual ? `USING (${newQual})` : ''}
${newCheck ? `WITH CHECK (${newCheck})` : ''};
\n`;
            }
        });

        fs.writeFileSync('fix_rls_performance.sql', sqlContent);
        console.log("Created fix_rls_performance.sql");

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
