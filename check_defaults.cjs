const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();

    const query = `
    SELECT column_name, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'sistemas' AND column_name IN ('criticidade', 'status', 'tipo');
    `;

    try {
        const res = await client.query(query);
        console.log(JSON.stringify(res.rows, null, 2));

        // Let's also enforce portuguese defaults if they are not already
        const alterQuery = `
          ALTER TABLE public.sistemas ALTER COLUMN criticidade SET DEFAULT 'Média';
          ALTER TABLE public.sistemas ALTER COLUMN status SET DEFAULT 'Ativo';
          ALTER TABLE public.sistemas ALTER COLUMN tipo SET DEFAULT 'Outro';
          NOTIFY pgrst, 'reload schema';
        `;

        await client.query(alterQuery);
        console.log("Updated column defaults successfully just in case.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
