import pg from 'pg';
const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        let res = await pool.query("SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE tablename IN ('vendor_users', 'vendor_portal_users')");
        console.log('--- Policies ---');
        for (const row of res.rows) {
            console.log(row.tablename, '->', row.policyname, '(', row.cmd, ')');
            console.log('  ', row.qual);
        }
    } finally {
        await pool.end();
    }
}
check();
