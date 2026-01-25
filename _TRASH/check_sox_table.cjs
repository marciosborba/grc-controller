
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.cvwawzsdwiacfrfsuylp.supabase.co:5432/postgres`,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    await client.connect();
    const res = await client.query("SELECT * FROM information_schema.tables WHERE table_name = 'biblioteca_controles_sox';");
    console.log(res.rows);
    await client.end();
}

check();
