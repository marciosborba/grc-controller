const fs = require('fs');
const DatabaseManager = require('./database-manager.cjs');

async function run() {
    try {
        const db = new DatabaseManager();
        const connected = await db.connect();

        if (!connected) {
            console.error('Failed to connect to database');
            process.exit(1);
        }

        console.log('--- Phase 1: Applying Schema Enhancements ---');
        const schemaSql = fs.readFileSync('./src/sql/enhance_sistemas_schema.sql', 'utf8');
        await db.executeSQL(schemaSql, 'Applying systems schema migration');
        console.log('✅ Schema applied successfully.');

        console.log('\n--- Phase 2: Seeding Data ---');
        const seedSql = fs.readFileSync('./src/sql/seed_systems_demo.sql', 'utf8');
        await db.executeSQL(seedSql, 'Seeding systems demo data');
        console.log('✅ Data seeded successfully.');

        await db.disconnect();
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
}

run();
