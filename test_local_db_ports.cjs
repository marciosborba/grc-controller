
const { Client } = require('pg');

async function testLocal() {
    // Supabase local often uses 54322 for direct DB access
    const ports = [54322, 54321, 5432];

    for (const port of ports) {
        console.log(`Trying port ${port}...`);
        const client = new Client({
            host: 'localhost',
            port: port,
            database: 'postgres',
            user: 'postgres',
            password: 'postgres'
        });

        try {
            await client.connect();
            console.log(`✅ Local PostgreSQL connected on port ${port}!`);

            const res = await client.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\' ORDER BY tablename;');
            console.log('Tables:', res.rows.map(r => r.tablename));

            await client.end();
            return;
        } catch (err) {
            console.error(`❌ Port ${port} failed:`, err.message);
        }
    }
}

testLocal();
