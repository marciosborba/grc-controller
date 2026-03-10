const { Client } = require('pg');
const fs = require('fs');
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
        console.log("Connected. Executing statements sequentially...");

        const sqlContent = fs.readFileSync('C:\\Users\\marci\\.gemini\\antigravity\\brain\\8b97270b-b1ad-4e4d-86b2-38535a43fac6\\fix_all_auth_uid_perf.sql', 'utf8');
        // Split by semicolon, but handle comments roughly (this assumes standard formatting from my file)
        // My file has comments staring with -- and statements ending with ;
        // I'll just split by ; and trim.
        const statements = sqlContent.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            console.log(`Preview: ${stmt.substring(0, 50)}...`);
            try {
                await client.query(stmt);
                console.log("Success.");
            } catch (err) {
                console.error(`FAILED on statement ${i + 1}:`);
                console.error(stmt);
                console.error("Error:", err.message);
                // We continue to see other failures? Or stop?
                // The user wants "all" fixed. Let's try to fix as many as possible.
                // But let's verify if the error is indeed column missing.
            }
        }

        console.log("Finished execution loop.");

    } catch (err) {
        console.error("Global Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();
