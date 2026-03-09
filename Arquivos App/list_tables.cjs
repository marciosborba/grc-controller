const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
    const password = process.env.SUPABASE_DB_PASSWORD;
    const url = process.env.SUPABASE_URL;
    const ref = url.split('//')[1].split('.')[0];
    const connectionString = `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        console.log(res.rows.map(r => r.table_name).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
