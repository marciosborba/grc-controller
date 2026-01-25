const DatabaseManager = require('../database-manager.cjs');

async function verifyWrite() {
    const db = new DatabaseManager();
    try {
        await db.connect();

        const testTitle = 'Direct DB Write Test ' + Date.now();
        const targetDate = new Date().toISOString();

        console.log('Attempting to insert incident with target_resolution_date:', targetDate);

        // We need to provide minimal required fields.
        // Based on schema: title is required. tenant_id is likely required by RLS but we are bypassing RLS here (using postgres user).
        // However, foreign keys might be an issue if we don't provide valid IDs for reporter/assignee if they are not nullable?
        // Checking schema: reporter_id and assignee_id are nullable.
        // tenant_id is nullable in schema but usually required by app logic.

        const sql = `
            INSERT INTO incidents (title, target_resolution_date, tenant_id)
            VALUES ($1, $2, $3)
            RETURNING id, title, target_resolution_date;
        `;

        // Use a known tenant ID
        const tenantId = '46b1c048-85a1-423b-96fc-776007c8de1f';

        const result = await db.client.query(sql, [testTitle, targetDate, tenantId]);

        if (result.rows.length > 0) {
            const row = result.rows[0];
            console.log('✅ Insert successful!');
            console.log('   ID:', row.id);
            console.log('   Saved Date:', row.target_resolution_date);

            // Verify date match (ignoring small precision diffs)
            const savedDate = new Date(row.target_resolution_date).toISOString();
            if (savedDate === targetDate) {
                console.log('✅ Date matches exactly.');
            } else {
                console.log('⚠️ Date mismatch (might be timezone/precision):', savedDate, 'vs', targetDate);
            }

            // Cleanup
            await db.client.query('DELETE FROM incidents WHERE id = $1', [row.id]);
            console.log('Cleanup successful.');

        } else {
            console.error('❌ Insert failed (no rows returned).');
        }

    } catch (error) {
        console.error('❌ Error verifying write:', error);
    } finally {
        await db.disconnect();
    }
}

verifyWrite();
