// Let's create a script to check if the vendor user was created correctly
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("=== Checking Vendor Portal Users ===");
        const { rows: users } = await pool.query(`SELECT * FROM vendor_portal_users ORDER BY created_at DESC LIMIT 5`);
        console.table(users);

        console.log("\n=== Checking Vendor Assessments ===");
        const { rows: assessments } = await pool.query(`SELECT id, assessment_name, status, public_link, vendor_emails FROM vendor_assessments ORDER BY created_at DESC LIMIT 3`);
        console.table(assessments);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
