
-- Seed data for Systems/Applications integration testing
-- Uses a dummy UUID for tenant_id if not replaced, but ideally should be run with the user's tenant context.
-- Since we are running this in SQL Editor, we assume the user might need to set the tenant_id.
-- However, for simplicity, we will try to fetch the first available tenant ID or use a placeholder that matches the user's RLS visibility if possible (RLS usually filters by auth.uid(), so inserting with a random tenant_id might hide it).

-- IMPORTANT: Replace 'YOUR-TENANT-UUID-HERE' with your actual Tenant ID if known.
-- If running in Supabase SQL Editor as a superuser/service_role, these might appear if you select * from sistemas.

-- Let's try to grab a valid user ID for 'responsavel_tecnico' just to make it look real.
-- This uses a subquery to pick the first user found in auth.users.

WITH current_tenant AS (
    -- Try to select a tenant ID if any exists, otherwise fallback to a generic one
    SELECT id FROM public.tenants LIMIT 1
),
tech_user AS (
    SELECT id FROM auth.users ORDER BY created_at LIMIT 1
)
INSERT INTO public.sistemas (
    nome, 
    fornecedor, 
    versao, 
    tipo, 
    status, 
    criticidade, 
    dados_sensiveis, 
    internet_facing, 
    autenticacao_sso, 
    documentacao_link, 
    descricao,
    tenant_id,
    responsavel_tecnico
)
VALUES
(
    'Portal Web Corporativo', 
    'Internal / React', 
    '2.5.0', 
    'SaaS', 
    'Ativo', 
    'Alta', 
    true, 
    true, 
    true, 
    'https://confluence.corp/display/PORTAL',
    'Portal principal para acesso dos clientes aos serviços da empresa.',
    (SELECT id FROM current_tenant),
    (SELECT id FROM tech_user)
),
(
    'API Pagamentos (Gateway)', 
    'Stripe / Custom', 
    '1.2.0', 
    'PaaS', 
    'Ativo', 
    'Crítica', 
    true, 
    true, 
    false, 
    'https://api.gateway.internal/docs',
    'Gateway de processamento de pagamentos e transações financeiras.',
    (SELECT id FROM current_tenant),
    (SELECT id FROM tech_user)
),
(
    'Sistema de RH (Legacy)', 
    'Oracle', 
    '11g', 
    'Legacy', 
    'Em Implementação', 
    'Média', 
    true, 
    false, 
    false, 
    'http://legacy-hr-docs.local',
    'Sistema legado de gestão de recursos humanos, em processo de migração.',
    (SELECT id FROM current_tenant),
    (SELECT id FROM tech_user)
),
(
    'Microserviço de Notificações', 
    'AWS Lambda', 
    'v41', 
    'Outro', 
    'Ativo', 
    'Baixa', 
    false, 
    false, 
    true, 
    'https://github.com/org/notifications-service',
    'Serviço responsável pelo envio de e-mails e push notifications.',
    (SELECT id FROM current_tenant),
    (SELECT id FROM tech_user)
),
(
    'Data Warehouse', 
    'Snowflake', 
    'N/A', 
    'SaaS', 
    'Ativo', 
    'Alta', 
    true, 
    false, 
    true, 
    'https://snowflake.console.com',
    'Armazém de dados central para Analytics e BI.',
    (SELECT id FROM current_tenant),
    (SELECT id FROM tech_user)
);
