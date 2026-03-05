import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await pool.query(`
            SET SESSION AUTHORIZATION authenticated;
            SET request.jwt.claims = '{"sub": "678c706b-1a23-43d0-a46f-1a0e26251967", "role": "authenticated", "email": "teste5@mail.com"}';
        `);

        // Now run the query
        const { rows } = await pool.query(`SELECT id FROM public.vendor_users WHERE auth_user_id = '678c706b-1a23-43d0-a46f-1a0e26251967'`);
        console.log("Success:", rows);

    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        await pool.end();
    }
}
main();
