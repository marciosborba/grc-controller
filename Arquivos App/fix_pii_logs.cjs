const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Try to load dotenv if available, otherwise manual parse
try {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch (e) {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                process.env[key] = value;
            }
        });
    }
}

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

if (!config.password) {
    console.error("Missing SUPABASE_DB_PASSWORD in .env");
    process.exit(1);
}

const client = new Client(config);

async function sanitizeLogs() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL.");

        // Fetch logs that have details (we'll filter in JS for regex match since SQL regex is tricky with jsonb)
        // fetching more recent logs to be safe
        const res = await client.query(`
            SELECT id, details 
            FROM activity_logs 
            WHERE details IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 500
        `);

        console.log(`Scanning ${res.rowCount} logs for PII patterns...`);

        // Regex used by scanner: /\+?[1-9]\d{1,14}|\(\d{3}\)\s?\d{3}-\d{4}/g
        const phoneRegex = /\+?[1-9]\d{1,14}|\(\d{3}\)\s?\d{3}-\d{4}/g;

        let fixedCount = 0;

        for (const log of res.rows) {
            let detailsStr = JSON.stringify(log.details);

            // Check if string matches pii pattern
            if (phoneRegex.test(detailsStr)) {

                // Redact by text replacement on the stringified JSON to catch all occurrences
                const newDetailsStr = detailsStr.replace(phoneRegex, '[REDACTED]');

                try {
                    const sanitized = JSON.parse(newDetailsStr);

                    await client.query(
                        'UPDATE activity_logs SET details = $1 WHERE id = $2',
                        [sanitized, log.id]
                    );
                    console.log(`Sanitized log ${log.id} (matched regex)`);
                    fixedCount++;
                } catch (jsonErr) {
                    console.error(`Failed to parse/update log ${log.id}`, jsonErr);
                }
            }
        }

        console.log(`Sanitization complete. Fixed ${fixedCount} logs.`);

    } catch (err) {
        console.error("Error executing script:", err);
    } finally {
        await client.end();
    }
}

sanitizeLogs();
