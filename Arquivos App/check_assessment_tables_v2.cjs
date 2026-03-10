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

async function run() {
    try {
        await client.connect();

        // Check remaining assessment tables reported by user
        const tables = ['assessment_domains', 'assessment_questions', 'assessment_responses', 'assessments'];

        for (const t of tables) {
            console.log(`\nChecking ${t}:`);
            const query = `
          SELECT policyname, cmd, qual
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY policyname
        `;
            const res = await client.query(query, [t]);
            res.rows.forEach(r => {
                console.log(`  Policy: ${r.policyname}`);
                console.log(`  Qual: ${r.qual}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
