
const { Client } = require('pg');
require('dotenv').config();

async function checkSchemas() {
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

        const tables = ['vendor_portal_users', 'vendor_users'];

        for (const table of tables) {
            console.log(`\n--- Columns in ${table} ---`);
            const res = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${table}' 
        ORDER BY ordinal_position;
      `);
            if (res.rows.length === 0) {
                console.log(`Table ${table} not found or no columns.`);
            } else {
                res.rows.forEach(r => {
                    console.log(`- ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
                });
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkSchemas();
