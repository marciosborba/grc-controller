const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

const sql = `
-- Adicionar coluna na tabela profiles se não existir
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS override_vulnerability_portal BOOLEAN DEFAULT false;

-- Opcional: Aqui poderíamos ter um trigger futuro para conceder acesso baseado no assigned_to da tabela vulnerabilities,
-- mas por enquanto, manteremos o processo manual e focado nas decisões do administrador ou atribuições futuras via UI.
`;

client.connect()
    .then(() => {
        console.log('Connected to DB. Executing Vulnerability Portal migration...');
        return client.query(sql);
    })
    .then(() => {
        console.log('Migration executed successfully.');
        client.end();
    })
    .catch(err => {
        console.error('Error executing migration:', err);
        client.end();
    });
