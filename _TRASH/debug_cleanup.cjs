const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

async function cleanup() {
    const client = new Client(config);
    await client.connect();

    try {
        console.log('--- Attempting to delete orphaned profiles ---');
        // Identify orphans first
        const findSql = `
        SELECT id, user_id FROM profiles 
        WHERE user_id NOT IN (SELECT id FROM auth.users)
        LIMIT 5;
    `;
        const orphans = await client.query(findSql);
        console.log(`Found ${orphans.rowCount} sample orphans.`);

        if (orphans.rowCount > 0) {
            const targetId = orphans.rows[0].id;
            console.log(`Attempting to delete profile ${targetId}...`);

            try {
                await client.query('DELETE FROM profiles WHERE id = $1', [targetId]);
                console.log('Delete successful!');
            } catch (delErr) {
                console.error('Delete failed!');
                console.error('Error code:', delErr.code);
                console.error('Message:', delErr.message);
                console.error('Detail:', delErr.detail);
                console.error('Table:', delErr.table);
                console.error('Constraint:', delErr.constraint);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

cleanup();
