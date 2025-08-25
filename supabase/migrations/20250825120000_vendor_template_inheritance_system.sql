-- ================================================
-- VENDOR TEMPLATE INHERITANCE SYSTEM
-- Implementa sistema de 3 níveis: Padrão > Tenant > Fornecedor
-- Data: 2025-08-25
-- ================================================

-- ================================================
-- 1. TEMPLATES PADRÃO (GLOBAIS/MASTER)
-- ================================================
create table public.vendor_assessment_master_templates (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    framework_type text not null check (framework_type in ('iso27001', 'soc2', 'nist', 'pci_dss', 'lgpd', 'gdpr', 'custom')),
    industry text,
    version text,
    is_active boolean default true,
    questions jsonb not null default '[]',
    scoring_model jsonb not null default '{}',
    alex_recommendations jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid
);

-- ================================================
-- 2. TEMPLATES PERSONALIZADOS POR TENANT
-- ================================================
-- Esta tabela já existe (vendor_assessment_frameworks), mas vamos adicionar referência ao master
alter table public.vendor_assessment_frameworks 
add column if not exists master_template_id uuid references public.vendor_assessment_master_templates(id) on delete set null;

alter table public.vendor_assessment_frameworks 
add column if not exists is_inherited boolean default false;

alter table public.vendor_assessment_frameworks 
add column if not exists customization_level text check (customization_level in ('full_copy', 'questions_modified', 'scoring_modified', 'fully_customized')) default 'full_copy';

-- ================================================
-- 3. ASSESSMENTS POR FORNECEDOR
-- ================================================
-- Esta tabela já existe (vendor_assessments) e está correta

-- ================================================
-- 4. INSERIR TEMPLATES PADRÃO
-- ================================================

-- Template NIST CSF
INSERT INTO public.vendor_assessment_master_templates (
    id,
    name,
    description,
    framework_type,
    industry,
    version,
    questions,
    scoring_model
) VALUES (
    'nist-csf-master-template',
    'NIST Cybersecurity Framework - Template Padrão',
    'Framework padrão do NIST para avaliação de segurança cibernética de fornecedores',
    'nist',
    'geral',
    '2.0',
    '[
        {
            "id": "ID.AM-1",
            "category": "Identify",
            "subcategory": "Asset Management",
            "question": "A organização mantém inventário atualizado de ativos físicos?",
            "description": "Verificar se existe inventário completo e atualizado de todos os ativos físicos",
            "weight": 3,
            "required_evidence": true
        },
        {
            "id": "ID.AM-2", 
            "category": "Identify",
            "subcategory": "Asset Management",
            "question": "A organização mantém inventário atualizado de ativos de software?",
            "description": "Verificar inventário de software e licenças",
            "weight": 3,
            "required_evidence": true
        },
        {
            "id": "PR.AC-1",
            "category": "Protect", 
            "subcategory": "Access Control",
            "question": "Existem políticas de controle de acesso documentadas?",
            "description": "Verificar existência e aplicação de políticas de controle de acesso",
            "weight": 4,
            "required_evidence": true
        }
    ]'::jsonb,
    '{
        "scale": "1-5",
        "levels": {
            "1": "Inexistente",
            "2": "Iniciante",
            "3": "Em Desenvolvimento", 
            "4": "Gerenciado",
            "5": "Otimizado"
        },
        "weights": {
            "critical": 5,
            "high": 4,
            "medium": 3,
            "low": 2
        }
    }'::jsonb
);

-- Template ISO 27001/27701
INSERT INTO public.vendor_assessment_master_templates (
    id,
    name,
    description,
    framework_type,
    industry,
    version,
    questions,
    scoring_model
) VALUES (
    'iso-27001-27701-master-template',
    'ISO 27001/27701 - Template Padrão',
    'Template padrão baseado na ISO 27001 e ISO 27701 para avaliação de fornecedores',
    'iso27001',
    'geral',
    '2022',
    '[
        {
            "id": "A.5.1",
            "category": "Organizational",
            "subcategory": "Information Security Policies",
            "question": "Existem políticas de segurança da informação documentadas e aprovadas?",
            "description": "Verificar existência, documentação e aprovação de políticas de segurança",
            "weight": 5,
            "required_evidence": true
        },
        {
            "id": "A.6.1",
            "category": "Organizational",
            "subcategory": "Organization of Information Security",
            "question": "Há responsabilidades definidas para segurança da informação?",
            "description": "Verificar estrutura organizacional de segurança da informação",
            "weight": 4,
            "required_evidence": false
        },
        {
            "id": "A.8.1",
            "category": "Technical",
            "subcategory": "Asset Management", 
            "question": "Todos os ativos são identificados e têm responsável designado?",
            "description": "Verificar inventário e responsabilidade por ativos",
            "weight": 4,
            "required_evidence": true
        }
    ]'::jsonb,
    '{
        "scale": "1-4",
        "levels": {
            "1": "Não Implementado",
            "2": "Parcialmente Implementado",
            "3": "Implementado",
            "4": "Totalmente Implementado"
        },
        "compliance_threshold": 75
    }'::jsonb
);

-- ================================================
-- 5. FUNÇÃO DE HERANÇA DE TEMPLATES
-- ================================================

create or replace function inherit_master_templates_for_tenant(p_tenant_id uuid)
returns void as $$
declare
    template_record record;
begin
    -- Inserir cópias de todos os master templates para a tenant
    for template_record in 
        select * from vendor_assessment_master_templates where is_active = true
    loop
        insert into vendor_assessment_frameworks (
            tenant_id,
            master_template_id,
            name,
            description,
            framework_type,
            industry,
            version,
            is_active,
            questions,
            scoring_model,
            alex_recommendations,
            is_inherited,
            customization_level
        ) values (
            p_tenant_id,
            template_record.id,
            template_record.name,
            template_record.description,
            template_record.framework_type,
            template_record.industry,
            template_record.version,
            template_record.is_active,
            template_record.questions,
            template_record.scoring_model,
            template_record.alex_recommendations,
            true,
            'full_copy'
        ) on conflict (tenant_id, name) do nothing;
    end loop;
    
    raise notice 'Templates herdados com sucesso para tenant %', p_tenant_id;
end;
$$ language plpgsql;

-- ================================================
-- 6. TRIGGER PARA HERANÇA AUTOMÁTICA
-- ================================================

create or replace function auto_inherit_templates_on_tenant_creation()
returns trigger as $$
begin
    -- Quando um novo tenant é criado, automaticamente herdar templates
    perform inherit_master_templates_for_tenant(new.id);
    return new;
end;
$$ language plpgsql;

-- Trigger na tabela tenants (assumindo que existe)
-- create trigger auto_inherit_templates_trigger
--     after insert on public.tenants
--     for each row
--     execute function auto_inherit_templates_on_tenant_creation();

-- ================================================
-- 7. RLS POLICIES PARA MASTER TEMPLATES
-- ================================================

alter table public.vendor_assessment_master_templates enable row level security;

-- Apenas admins podem ver master templates
create policy "Only system admins can access master templates" on public.vendor_assessment_master_templates
    for all using (
        exists (
            select 1 from user_roles 
            where user_id = auth.uid() 
            and role = 'admin'
        )
    );

-- ================================================
-- 8. FUNÇÃO PARA SINCRONIZAR ATUALIZAÇÕES
-- ================================================

create or replace function sync_master_template_updates(p_master_template_id uuid)
returns void as $$
declare
    template_record record;
    tenant_framework_record record;
begin
    -- Buscar o master template
    select * into template_record 
    from vendor_assessment_master_templates 
    where id = p_master_template_id;
    
    if not found then
        raise exception 'Master template não encontrado: %', p_master_template_id;
    end if;
    
    -- Atualizar todos os frameworks herdados que não foram customizados
    for tenant_framework_record in
        select * from vendor_assessment_frameworks
        where master_template_id = p_master_template_id
        and is_inherited = true
        and customization_level = 'full_copy'
    loop
        update vendor_assessment_frameworks set
            name = template_record.name,
            description = template_record.description,
            framework_type = template_record.framework_type,
            industry = template_record.industry,
            version = template_record.version,
            questions = template_record.questions,
            scoring_model = template_record.scoring_model,
            alex_recommendations = template_record.alex_recommendations,
            updated_at = now()
        where id = tenant_framework_record.id;
    end loop;
    
    raise notice 'Templates sincronizados para master template %', p_master_template_id;
end;
$$ language plpgsql;

-- ================================================
-- 9. APLICAR HERANÇA PARA TENANTS EXISTENTES
-- ================================================

-- Aplicar herança para todos os tenants existentes
do $$
declare
    tenant_record record;
begin
    for tenant_record in select id from tenants where is_active = true
    loop
        perform inherit_master_templates_for_tenant(tenant_record.id);
    end loop;
end $$;

-- ================================================
-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ================================================

comment on table public.vendor_assessment_master_templates is 'Templates padrão globais que são herdados por todas as tenants';
comment on column public.vendor_assessment_frameworks.master_template_id is 'Referência ao template padrão do qual este framework foi herdado';
comment on column public.vendor_assessment_frameworks.is_inherited is 'Indica se este framework foi herdado de um master template';
comment on column public.vendor_assessment_frameworks.customization_level is 'Nível de customização aplicado ao template herdado';