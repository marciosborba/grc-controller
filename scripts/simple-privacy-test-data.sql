-- ============================================================================
-- SCRIPT SIMPLIFICADO DE DADOS DE TESTE PARA MÓDULO DE PRIVACIDADE/LGPD
-- ============================================================================

-- 1. FONTES DE DISCOVERY DE DADOS
INSERT INTO data_discovery_sources (
    name, 
    description, 
    type, 
    location, 
    credentials_stored,
    status,
    scan_frequency,
    data_steward_id,
    created_by,
    updated_by
)
SELECT 
    'Banco de Dados CRM',
    'Sistema de relacionamento com clientes',
    'database',
    'crm-prod.empresa.com:5432/crm_db',
    true,
    'active',
    'monthly',
    u.id,
    u.id,
    u.id
FROM (SELECT id FROM auth.users LIMIT 1) u;

-- 2. BASES LEGAIS
INSERT INTO legal_bases (
    name,
    description,
    legal_basis_type,
    legal_article,
    justification,
    applies_to_categories,
    applies_to_processing,
    valid_from,
    status,
    legal_responsible_id,
    created_by,
    updated_by
)
SELECT 
    'Consentimento para Marketing',
    'Base legal para envio de comunicações promocionais e ofertas comerciais',
    'consentimento',
    'Art. 7º, I da LGPD',
    'Titular forneceu consentimento específico para recebimento de materiais promocionais',
    '{"contato", "comportamental"}',
    '{"marketing_direto", "comunicacao_promocional"}',
    '2024-01-01',
    'active',
    u.id,
    u.id,
    u.id
FROM (SELECT id FROM auth.users LIMIT 1) u;

-- 3. INVENTÁRIO DE DADOS PESSOAIS  
INSERT INTO data_inventory (
    name,
    description,
    data_category,
    data_types,
    system_name,
    database_name,
    table_field_names,
    estimated_volume,
    retention_period_months,
    retention_justification,
    sensitivity_level,
    data_origin,
    data_controller_id,
    data_processor_id,
    data_steward_id,
    status,
    next_review_date,
    created_by,
    updated_by
)
SELECT 
    'Cadastro de Clientes - CRM',
    'Dados básicos de identificação e contato dos clientes para prestação de serviços',
    'identificacao',
    '{"nome", "cpf", "email", "telefone"}',
    'Sistema CRM',
    'crm_production',
    '{"customers.full_name", "customers.document_number", "customers.email"}',
    15000,
    60,
    'Dados mantidos por 5 anos após encerramento do relacionamento comercial',
    'media',
    'coleta_direta',
    u.id,
    u.id,
    u.id,
    'active',
    CURRENT_DATE + INTERVAL '12 months',
    u.id,
    u.id
FROM (SELECT id FROM auth.users LIMIT 1) u;

-- 4. CONSENTIMENTOS
INSERT INTO consents (
    data_subject_email,
    data_subject_name,
    data_subject_document,
    purpose,
    data_categories,
    legal_basis_id,
    status,
    granted_at,
    collection_method,
    collection_source,
    is_informed,
    is_specific,
    is_free,
    is_unambiguous,
    privacy_policy_version,
    terms_of_service_version,
    language
)
SELECT 
    'cliente1@email.com',
    'João da Silva Santos',
    '12345678901',
    'Recebimento de ofertas e promoções por email',
    '{"contato"}',
    lb.id,
    'granted',
    NOW() - INTERVAL '30 days',
    'website_form',
    'https://www.empresa.com.br/newsletter',
    true,
    true,
    true,
    true,
    '2.1',
    '1.8',
    'pt-BR'
FROM legal_bases lb 
WHERE lb.name = 'Consentimento para Marketing';

-- 5. SOLICITAÇÕES DE TITULARES
-- (Skipped for now due to constraint issues - will be added later)

-- 6. INCIDENTES DE PRIVACIDADE
-- (Skipped for now due to table dependency issues)

-- Exibir resumo
SELECT 
    'RESUMO DOS DADOS DE TESTE:' as info
UNION ALL
SELECT 
    '📊 Fontes de Discovery: ' || COUNT(*)::text
FROM data_discovery_sources
UNION ALL
SELECT 
    '📋 Inventário de Dados: ' || COUNT(*)::text
FROM data_inventory
UNION ALL
SELECT 
    '⚖️ Bases Legais: ' || COUNT(*)::text
FROM legal_bases
UNION ALL
SELECT 
    '✅ Consentimentos: ' || COUNT(*)::text
FROM consents;