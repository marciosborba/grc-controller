import pg from 'pg';
const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        let res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE '%pref%';
        `);
        console.log('--- Pref Tables ---');
        for (const row of res.rows) {
            console.log(row.table_name);
        }

        res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles';
        `);
        console.log('\n--- Profiles Columns ---');
        for (const row of res.rows) {
            console.log(row.column_name, row.data_type);
        }

        res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'notifications';
        `);
        console.log('\n--- Notifications Columns ---');
        for (const row of res.rows) {
            console.log(row.column_name, row.data_type);
        }
    } finally {
        await pool.end();
    }
}
check();
