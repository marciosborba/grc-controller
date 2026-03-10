import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const { rows: cols } = await pool.query(`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name='vendor_risk_messages' AND table_schema='public'
        ORDER BY ordinal_position
    `);
    console.log('vendor_risk_messages columns:', cols.map(r => `${r.column_name}(${r.data_type})`).join(', '));
    pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
