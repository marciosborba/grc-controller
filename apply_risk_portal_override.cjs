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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS override_risk_portal BOOLEAN DEFAULT false;

-- Criar a função do trigger para risk_stakeholders
CREATE OR REPLACE FUNCTION public.handle_new_risk_stakeholder()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_id uuid;
BEGIN
    -- Procurar um perfil que tenha o mesmo email do stakeholder (apenas usuários não-fornecedores)
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE email = NEW.email AND system_role != 'vendor'
    LIMIT 1;

    -- Se encontrou um perfil interno/convidado, habilita o acesso ao portal de risco
    IF v_profile_id IS NOT NULL THEN
        UPDATE public.profiles
        SET override_risk_portal = true
        WHERE id = v_profile_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_new_risk_stakeholder ON public.risk_stakeholders;
CREATE TRIGGER trigger_new_risk_stakeholder
    AFTER INSERT OR UPDATE OF email
    ON public.risk_stakeholders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_risk_stakeholder();
`;

client.connect()
    .then(() => {
        console.log('Connected to DB. Executing migration...');
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
