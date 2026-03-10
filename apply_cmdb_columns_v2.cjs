const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();

    const query = `
    -- Alter sistemas table to add missing Asset columns
    ALTER TABLE public.sistemas
    ADD COLUMN IF NOT EXISTS eol_date DATE,
    ADD COLUMN IF NOT EXISTS edr_enabled BOOLEAN DEFAULT false;

    -- Trigger schema reload for postgrest
    NOTIFY pgrst, 'reload schema';
  `;

    try {
        console.log("Applying schema changes...");
        await client.query(query);
        console.log("Successfully added missing eol_date and edr_enabled columns to 'sistemas'.");
    } catch (error) {
        console.error("Error applying migration:", error);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
