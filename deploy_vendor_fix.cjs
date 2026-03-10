
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployMigration() {
    const migrationPath = path.join('supabase', 'migrations', '20260304000000_fix_vendor_rls_for_platform_admins.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`🚀 Connecting to DB to deploy: ${migrationPath}`);

    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB.');

        // Execute line by line
        const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
        let successCount = 0;
        let failCount = 0;

        for (let cmd of commands) {
            try {
                await client.query(cmd);
                successCount++;
            } catch (e) {
                if (e.code === '42P01') {
                    console.warn(`⚠️ Table not found, skipping: ${e.message}`);
                } else if (e.code === '42704') {
                    console.warn(`⚠️ Object not found (probably policy), skipping: ${e.message}`);
                } else {
                    console.error(`❌ Error in command: \n${cmd}\n`);
                    console.error(`ERROR DETAILS: ${e.message}`);
                }
                failCount++;
            }
        }

        console.log(`\n✅ Finished deployment.`);
        console.log(`Summary: ${successCount} successful, ${failCount} skipped/failed.`);
    } catch (err) {
        console.error("Critical error:", err);
    } finally {
        await client.end();
    }
}

deployMigration();
