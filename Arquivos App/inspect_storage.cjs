const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Check if storage schema exists
        const schemaRes = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'storage'");
        if (schemaRes.rows.length === 0) {
            console.log('Storage schema not found.');
            return;
        }

        // List buckets
        const buckets = await client.query("SELECT id, name FROM storage.buckets");
        console.log('Buckets:', buckets.rows);

        // Sample objects to see path structure
        const objects = await client.query("SELECT bucket_id, name, owner, metadata FROM storage.objects LIMIT 10");
        console.log('Sample Objects:');
        objects.rows.forEach(o => {
            console.log(`Bucket: ${o.bucket_id}, Path: ${o.name}, Owner: ${o.owner}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
