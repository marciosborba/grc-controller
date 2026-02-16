const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";
const UUID_TO_CHECK = 'dc6ad4c2-1296-478d-9300-d062c9500c31'; // From previous output (trunc fixed manually if needed)
// Actually the previous output was cut off: `dc6ad4c2-1296-478d-9300-d062c9500c3` -> likely `...c31` or similar. 
// Let's search loosely or use another sample if that one is ambiguous.
// Better: Fetch objects again and take the first part of the path, then check if it exists in tenants or profiles.

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Get a few object paths
        const objects = await client.query("SELECT name FROM storage.objects LIMIT 5");
        const paths = objects.rows.map(o => o.name);

        for (const path of paths) {
            const firstPart = path.split('/')[0];
            console.log(`Checking UUID: ${firstPart}`);

            // Check Tenant
            const tenantRes = await client.query("SELECT id, name FROM public.tenants WHERE id::text = $1", [firstPart]);
            if (tenantRes.rows.length > 0) {
                console.log(`MATCH TENANT: ${tenantRes.rows[0].name}`);
                continue;
            }

            // Check Profile (User)
            const profileRes = await client.query("SELECT id, email FROM public.profiles WHERE id::text = $1", [firstPart]);
            if (profileRes.rows.length > 0) {
                console.log(`MATCH USER: ${profileRes.rows[0].email}`);
                continue;
            }

            console.log('No match found for this UUID prefix.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();
