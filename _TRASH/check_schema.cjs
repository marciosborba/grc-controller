const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();

    const query = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'sistemas' AND column_name IN ('ip_address', 'edr_enabled', 'eol_date');
    `;

    try {
        const res = await client.query(query);
        console.log("Current columns in DB:", res.rows);

        // Ensure all are there
        await client.query(`
            ALTER TABLE public.sistemas 
            ADD COLUMN IF NOT EXISTS ip_address VARCHAR(255),
            ADD COLUMN IF NOT EXISTS edr_enabled BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS eol_date DATE;
        `);

        console.log("Ensured columns exist.");

        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log("Reloaded schema cache.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
