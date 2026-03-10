import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    // Check vendor_registry JSONB columns
    const { rows: cols } = await pool.query(`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name='vendor_registry' AND data_type='jsonb'
    `);
    console.log('vendor_registry JSONB columns:', cols.map(c => c.column_name).join(', '));

    // Check if there's already metadata col
    const { rows: allCols } = await pool.query(`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name='vendor_registry' 
        ORDER BY ordinal_position
    `);
    console.log('\nAll vendor_registry columns:');
    allCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
