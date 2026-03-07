import pg from 'pg';
const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkUser() {
    try {
        const email = 'marcio.borba@gepriv.com';
        console.log('--- Checking Info for', email, '---');

        let res = await pool.query('SELECT * FROM auth.users WHERE email = $1', [email]);
        const user = res.rows[0];
        console.log('auth.users:', user ? user.id : 'not found');

        if (user) {
            res = await pool.query('SELECT * FROM public.profiles WHERE id = $1', [user.id]);
            console.log('profiles:', res.rows[0] ? res.rows[0].id : 'None');

            res = await pool.query('SELECT * FROM public.user_roles WHERE user_id = $1', [user.id]);
            console.log('user_roles:', res.rows);

            res = await pool.query('SELECT * FROM public.platform_admins WHERE user_id = $1', [user.id]);
            console.log('platform_admins:', res.rows);

            res = await pool.query('SELECT * FROM public.vendor_users WHERE auth_user_id = $1', [user.id]);
            console.log('vendor_users:', res.rows[0] ? res.rows[0].id : 'None');
        }

        res = await pool.query('SELECT * FROM public.vendor_portal_users WHERE email = $1', [email]);
        console.log('vendor_portal_users:', res.rows[0] ? res.rows[0].id : 'None');

    } finally {
        await pool.end();
    }
}
checkUser();
