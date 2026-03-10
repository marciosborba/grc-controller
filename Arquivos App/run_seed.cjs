const fs = require('fs');
const DatabaseManager = require('./database-manager.cjs');

async function run() {
    try {
        const sql = fs.readFileSync('./src/sql/seed_systems_demo.sql', 'utf8');
        const db = new DatabaseManager();
        const connected = await db.connect();

        if (!connected) {
            console.error('Failed to connect to database');
            process.exit(1);
        }

        console.log('Executing seed script...');
        await db.executeSQL(sql, 'Seeding systems data');
        console.log('Seed script executed successfully!');

        await db.disconnect();
    } catch (error) {
        console.error('Error running seed script:', error);
        process.exit(1);
    }
}

run();
