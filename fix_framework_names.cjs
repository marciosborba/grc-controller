const { Client } = require('pg');

const client = new Client({
    connectionString: `postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
    console.log('Running SQL...');
    await client.query(`UPDATE public.vendor_assessment_frameworks SET name = REPLACE(name, ' (Teste de QA)', '') WHERE name LIKE '%(Teste QA)%';`);
    await client.query(`UPDATE public.vendor_assessment_frameworks SET name = REPLACE(name, ' (Teste QA)', '') WHERE name LIKE '%(Teste QA)%';`);
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("Successfully updated names and reloaded schema.");
    client.end();
}).catch(err => {
    console.error("Error executing SQL:", err.message);
    client.end();
});
