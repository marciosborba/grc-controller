const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();

    const query = `
    -- Migrate 'criticidade'
    UPDATE public.sistemas SET criticidade = 'Baixa' WHERE criticidade IN ('Low', 'Baixo');
    UPDATE public.sistemas SET criticidade = 'Média' WHERE criticidade IN ('Medium', 'Médio');
    UPDATE public.sistemas SET criticidade = 'Alta' WHERE criticidade IN ('High', 'Alto');
    UPDATE public.sistemas SET criticidade = 'Crítica' WHERE criticidade IN ('Critical', 'Crítico');
    
    -- Migrate 'status'
    UPDATE public.sistemas SET status = 'Ativo' WHERE status = 'Active';
    UPDATE public.sistemas SET status = 'Em Implementação' WHERE status = 'Implementing';
    UPDATE public.sistemas SET status = 'Descontinuado' WHERE status = 'Discontinued';

    -- Migrate 'tipo'
    UPDATE public.sistemas SET tipo = 'On-Premise' WHERE tipo IN ('Server', 'Appliance');
    UPDATE public.sistemas SET tipo = 'SaaS' WHERE tipo = 'Service';
  `;

    try {
        console.log("Applying data migration for sistemas...");
        const res = await client.query(query);
        console.log("Successfully migrated legacy data in 'sistemas'.");
    } catch (error) {
        console.error("Error applying migration:", error);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
