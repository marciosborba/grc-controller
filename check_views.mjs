import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows: profilesViews } = await pool.query(`
            SELECT pg_get_viewdef('public.profiles'::regclass, true);
        `);
        console.log("Profiles view def:", profilesViews[0]?.pg_get_viewdef);
    } catch (err) {
        console.log("Profiles is not a view.");
    }

    try {
        const { rows: adminViews } = await pool.query(`
            SELECT pg_get_viewdef('public.platform_admins'::regclass, true);
        `);
        console.log("Platform_admins view def:", adminViews[0]?.pg_get_viewdef);
    } catch (err) {
        console.log("Platform_admins is not a view.");
    }

    try {
        const { rows: policies } = await pool.query(`
            SELECT tablename, policyname, qual, with_check 
            FROM pg_policies 
            WHERE tablename IN ('profiles', 'platform_admins')
            AND (qual LIKE '%users%' OR with_check LIKE '%users%');
        `);
        fs.writeFileSync('admin_fn_out.txt', JSON.stringify(policies, null, 2), 'utf8');
    } catch (err) {
        console.error(err);
    }

    await pool.end();
}
main();
