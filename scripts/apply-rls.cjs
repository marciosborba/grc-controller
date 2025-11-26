const fs = require('fs');
const path = require('path');
const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function main() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'update_admin_function.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Applying RLS policies...');
        await db.executeSQL(sql);
        console.log('✅ RLS policies applied successfully!');

    } catch (error) {
        console.error('❌ Error applying RLS policies:', error);
    } finally {
        process.exit(0);
    }
}

main();
