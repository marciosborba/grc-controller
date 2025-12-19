const fs = require('fs');
const path = require('path');
const DatabaseManager = require('../database-manager.cjs');

async function main() {
    const db = new DatabaseManager();

    try {
        console.log('Connecting to database...');
        const connected = await db.connect();
        if (!connected) {
            console.error('Failed to connect to database');
            process.exit(1);
        }

        const sqlPath = path.join(__dirname, 'setup_chat_attachments.sql');
        console.log(`Reading SQL from ${sqlPath}...`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await db.executeSQL(sql, 'Setup Chat Attachments');

        console.log('✅ SQL executed successfully!');
    } catch (error) {
        console.error('❌ Error applying migration:', error);
        process.exit(1);
    } finally {
        await db.disconnect();
    }
}

main();
