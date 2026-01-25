const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkAdmins() {
    try {
        await db.connect();
        console.log('Checking for admin users...');

        // Check profiles with is_platform_admin = true
        const sql = `
      SELECT id, email, full_name, is_platform_admin, tenant_id
      FROM profiles
      WHERE is_platform_admin = true;
    `;

        const result = await db.executeSQL(sql, "Fetching admin profiles");
        console.log('Admin Profiles:', JSON.stringify(result.rows || result, null, 2));

        // Check platform_admins table
        const paSql = `SELECT * FROM platform_admins`;
        const paResult = await db.executeSQL(paSql, "Fetching platform_admins");
        console.log('Platform Admins Table:', JSON.stringify(paResult.rows || paResult, null, 2));

    } catch (error) {
        console.error('Error checking admins:', error);
    } finally {
        process.exit(0);
    }
}

checkAdmins();
