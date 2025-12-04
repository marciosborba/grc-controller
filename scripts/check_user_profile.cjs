const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkUserProfile() {
    try {
        await db.connect();
        const userId = '0c5c1433-2682-460c-992a-f4cce57c0d6d'; // Second ID from platform_admins
        console.log(`Checking profile for user: ${userId}`);

        const sql = `
      SELECT * FROM profiles WHERE id = '${userId}';
    `;

        const result = await db.executeSQL(sql, "Fetching profile");
        console.log('Profile:', JSON.stringify(result.rows || result, null, 2));

        // Also check if is_platform_admin function would return true for this user
        // We can't easily call the function with auth.uid() mocked in SQL without set_config
        // But we can manually run the queries inside the function

        console.log('Checking platform_admins table match...');
        const paSql = `SELECT * FROM platform_admins WHERE user_id = '${userId}'`;
        const paResult = await db.executeSQL(paSql, "Checking platform_admins");
        console.log('In platform_admins:', paResult.rows.length > 0);

    } catch (error) {
        console.error('Error checking user profile:', error);
    } finally {
        process.exit(0);
    }
}

checkUserProfile();
