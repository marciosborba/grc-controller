const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkTables() {
    try {
        await db.connect();
        console.log('Checking tables...');

        const tables = ['platform_admins', 'user_roles', 'profiles'];

        for (const table of tables) {
            const sql = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${table}'
            );
        `;
            const result = await db.executeSQL(sql, `Checking ${table}`);
            console.log(`${table} exists:`, result.rows[0].exists);
        }

        console.log('Checking is_platform_admin column in profiles...');
        const colSql = `
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'is_platform_admin'
        );
    `;
        const colResult = await db.executeSQL(colSql, "Checking column");
        console.log('profiles.is_platform_admin exists:', colResult.rows[0].exists);

    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        process.exit(0);
    }
}

checkTables();
