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

const client = new Client(config);

function normalize(s) {
    if (!s) return '';
    return s.replace(/\s+/g, '');
}

async function run() {
    try {
        await client.connect();

        // Fetch unified policies
        const query = `
      SELECT 
        tablename,
        policyname,
        cmd,
        qual
      FROM pg_policies
      WHERE schemaname = 'public'
      AND permissive = 'PERMISSIVE'
      AND policyname LIKE 'unified_%'
      ORDER BY tablename, cmd;
    `;

        const res = await client.query(query);
        const grouped = {};

        res.rows.forEach(row => {
            if (!grouped[row.tablename]) {
                grouped[row.tablename] = { ALL: null, SELECT: null };
            }
            if (row.cmd === 'ALL') grouped[row.tablename].ALL = row;
            else if (row.cmd === 'SELECT') grouped[row.tablename].SELECT = row;
        });

        console.log("Checking Unified Pairs:");
        let found = 0;
        for (const [table, pair] of Object.entries(grouped)) {
            if (pair.ALL && pair.SELECT) {
                found++;
                console.log(`Table: ${table}`);
                console.log(`  ALL: ${pair.ALL.policyname}`);
                console.log(`       ${normalize(pair.ALL.qual).substring(0, 100)}...`);
                console.log(`  SEL: ${pair.SELECT.policyname}`);
                console.log(`       ${normalize(pair.SELECT.qual).substring(0, 100)}...`);
                console.log('---');
            }
        }

        console.log(`Found ${found} pairs.`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
