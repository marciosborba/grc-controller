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

        const query = `
      SELECT 
        p.proname,
        pg_get_function_identity_arguments(p.oid) as arguments,
        p.prosecdef,
        p.proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.prokind = 'f' 
      AND (p.proconfig IS NULL OR NOT (p.proconfig::text[] @> ARRAY['search_path=public']::text[]));
    `;

        const res = await client.query(query);

        console.log("Vulnerable Functions Found:", res.rows.length);

        let sqlContent = `-- Auto-generated fix for functions with mutable search_path\n`;
        sqlContent += `-- Generated at ${new Date().toISOString()}\n\n`;

        res.rows.forEach(row => {
            const config = row.proconfig || [];
            const hasSearchPath = config.some(c => c.startsWith('search_path='));

            if (!hasSearchPath) {
                const signature = `${row.proname}(${row.arguments})`;
                // Use public.function_name to be safe and avoid ambiguity
                const sql = `ALTER FUNCTION public.${row.proname}(${row.arguments}) SET search_path = public;\n`;
                sqlContent += sql;
                console.log(`Generated fix for: ${signature}`);
            }
        });

        fs.writeFileSync('fix_all_mutable_functions.sql', sqlContent);
        console.log("Created fix_all_mutable_functions.sql");

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
