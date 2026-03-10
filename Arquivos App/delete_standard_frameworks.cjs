const DatabaseManager = require('./database-manager.cjs');

async function deleteStandardFrameworks() {
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) {
            console.error('❌ Failed to connect to database');
            process.exit(1);
        }

        console.log('🗑️ Deleting existing standard frameworks...');

        // Using a direct SQL command to delete standard frameworks
        // This will cascade delete domains, controls, questions, etc. due to ON DELETE CASCADE
        const sql = "DELETE FROM assessment_frameworks WHERE is_standard = true;";

        await db.executeSQL(sql, 'Delete standard frameworks');
        console.log('✅ Standard frameworks deleted. They will be re-seeded on next app load.');

    } catch (error) {
        console.error('❌ Failed to delete frameworks:', error);
    } finally {
        await db.disconnect();
    }
}

deleteStandardFrameworks();
