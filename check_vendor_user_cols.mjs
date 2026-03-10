import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const { rows: vuCols } = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='vendor_users' AND table_schema='public' ORDER BY ordinal_position
    `);
    console.log('vendor_users:', vuCols.map(r => r.column_name).join(', '));

    const { rows: vpuCols } = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='vendor_portal_users' AND table_schema='public' ORDER BY ordinal_position
    `);
    console.log('vendor_portal_users:', vpuCols.map(r => r.column_name).join(', '));

    // Check auth_vendor_ids function
    const { rows: funcInfo } = await pool.query(`
        SELECT pg_get_functiondef(oid) as def FROM pg_proc WHERE proname = 'auth_vendor_ids'
    `);
    if (funcInfo.length > 0) console.log('auth_vendor_ids:', funcInfo[0].def);
    else console.log('auth_vendor_ids: NOT FOUND');

    pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
