
const { Client } = require('pg');

async function testLocal() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres'
    });

    try {
        await client.connect();
        console.log('✅ Local PostgreSQL connected!');

        const res = await client.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\';');
        console.log('Tables:', res.rows.map(r => r.tablename));

        await client.end();
    } catch (err) {
        console.error('❌ Local connection failed:', err.message);
    }
}

testLocal();
