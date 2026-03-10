const DatabaseManager = require('./database-manager.cjs');

async function checkSchema() {
    const dbManager = new DatabaseManager();
    const connected = await dbManager.connect();

    if (!connected) {
        console.error('Failed to connect to database');
        return;
    }

    try {
        const res = await dbManager.client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assessment_questions';
        `);
        console.log('Columns in assessment_questions:');
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    } catch (err) {
        console.error('Error querying schema:', err);
    } finally {
        await dbManager.disconnect();
    }
}

checkSchema();
