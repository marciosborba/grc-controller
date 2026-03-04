import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('Checking vendor_assessments_status_check constraint...');

        // Find existing constraint definition
        const constraintQuery = await pool.query(`
            SELECT pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE t.relname = 'vendor_assessments' AND c.conname = 'vendor_assessments_status_check'
        `);

        if (constraintQuery.rows.length > 0) {
            console.log('Current constraint:', constraintQuery.rows[0].def);

            // Drop old constraint
            await pool.query(`ALTER TABLE public.vendor_assessments DROP CONSTRAINT vendor_assessments_status_check`);
            console.log('Dropped old constraint.');

            // Add new constraint allowing all necessary states
            const newConstraint = `CHECK (status IN ('draft', 'sent', 'in_progress', 'pending_validation', 'completed', 'approved', 'rejected', 'expired'))`;
            await pool.query(`ALTER TABLE public.vendor_assessments ADD CONSTRAINT vendor_assessments_status_check ${newConstraint}`);

            console.log('✅ Added new constraint:', newConstraint);
        } else {
            console.log('Constraint vendor_assessments_status_check not found!');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
