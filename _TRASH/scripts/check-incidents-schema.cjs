const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkSchema() {
    try {
        await db.connect();
        console.log('Checking columns for incidents table...');

        const sql = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'incidents'
      ORDER BY column_name;
    `;

        const result = await db.executeSQL(sql, "Fetching columns");
        console.log('Result structure:', JSON.stringify(result, null, 2));

        // Try to find rows
        const rows = result.rows || result;
        if (Array.isArray(rows)) {
            console.log('Columns found:', rows.length);
            rows.forEach(row => {
                console.log(`- ${row.column_name} (${row.data_type})`);
            });
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        process.exit(0);
    }
}

checkSchema();
