import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const { rows } = await pool.query(`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name = 'vendor_risk_messages' AND table_schema = 'public'
        ORDER BY ordinal_position
    `);
    fs.writeFileSync('messages_schema.txt', JSON.stringify(rows, null, 2));
    console.log('Done');
    pool.end();
}
main().catch(console.error);
