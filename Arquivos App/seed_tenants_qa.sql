-- Script de seed para criar tenants de teste/QA
-- Execute este script após o setup inicial do banco de dados
-- 
-- IMPORTANTE: Este script é apenas para ambientes de teste/desenvolvimento
-- NÃO execute em produção

-- Limpar dados de teste existentes (se necessário)
-- UNCOMMENT apenas se quiser limpar tenants de teste existentes
-- DELETE FROM tenants WHERE slug IN ('acme-corp', 'techsoft-ltd', 'greenfield-bank', 'medicare-health', 'startup-innovate');

-- Inserir tenants de teste
INSERT INTO tenants (
    id,
    name, 
    slug, 
    contact_email, 
    contact_phone, 
    billing_email, 
    max_users, 
    current_users_count,
    subscription_plan, 
    subscription_status, 
    is_active,
    settings
) VALUES 
-- 1. ACME Corporation - Empresa de Tecnologia Grande
(
    'tenant-acme-001'::uuid,
    'ACME Corporation',
    'acme-corp',
    'admin@acmecorp.com',
    '+55 11 99999-0001',
    'billing@acmecorp.com',
    500,
    247,
    'enterprise',
    'active',
    true,
    '{
        "company_data": {
            "corporate_name": "ACME Corporation Ltda",
            "trading_name": "ACME Corp",
            "tax_id": "12.345.678/0001-90",
            "address": "Av. Paulista, 1000, Conjunto 101",
            "city": "São Paulo",
            "state": "SP",
            "zip_code": "01310-100",
            "country": "Brasil",
            "industry": "tecnologia",
            "size": "grande",
            "description": "Empresa líder em soluções tecnológicas corporativas, especializada em desenvolvimento de software e consultoria em transformação digital."
        },
        "risk_matrix": {
            "type": "5x5",
            "impact_labels": ["Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"],
            "probability_labels": ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"],
            "risk_levels": {
                "low": [1, 2, 3, 5, 6],
                "medium": [4, 7, 8, 9, 10, 11],
                "high": [12, 13, 14, 15, 16, 17, 18],
                "critical": [19, 20, 21, 22, 23, 24, 25]
            }
        }
    }'::jsonb
),

-- 2. TechSoft Ltd - Consultoria de TI Média
(
    'tenant-tech-002'::uuid,
    'TechSoft Consultoria',
    'techsoft-ltd',
    'contato@techsoft.com.br',
    '+55 21 98888-0002',
    'financeiro@techsoft.com.br',
    100,
    67,
    'professional',
    'active',
    true,
    '{
        "company_data": {
            "corporate_name": "TechSoft Consultoria em TI Ltda",
            "trading_name": "TechSoft",
            "tax_id": "23.456.789/0001-01",
            "address": "Rua das Flores, 456, Sala 203",
            "city": "Rio de Janeiro",
            "state": "RJ", 
            "zip_code": "20040-020",
            "country": "Brasil",
            "industry": "servicos",
            "size": "media",
            "description": "Consultoria especializada em implementação de sistemas de gestão e compliance para empresas de médio porte."
        },
        "risk_matrix": {
            "type": "4x4",
            "impact_labels": ["Baixo", "Moderado", "Alto", "Crítico"],
            "probability_labels": ["Improvável", "Possível", "Provável", "Muito Provável"],
            "risk_levels": {
                "low": [1, 2, 4],
                "medium": [3, 5, 6, 8],
                "high": [7, 9, 10, 12],
                "critical": [11, 13, 14, 15, 16]
            }
        }
    }'::jsonb
),

-- 3. Greenfield Bank - Instituição Financeira
(
    'tenant-green-003'::uuid,
    'Greenfield Bank',
    'greenfield-bank',
    'compliance@greenfieldbank.com',
    '+55 11 97777-0003',
    'treasury@greenfieldbank.com',
    1000,
    892,
    'enterprise',
    'active',
    true,
    '{
        "company_data": {
            "corporate_name": "Banco Greenfield S.A.",
            "trading_name": "Greenfield Bank",
            "tax_id": "34.567.890/0001-12",
            "address": "Av. Faria Lima, 2500, 15º andar",
            "city": "São Paulo",
            "state": "SP",
            "zip_code": "01451-000", 
            "country": "Brasil",
            "industry": "financeiro",
            "size": "grande",
            "description": "Instituição financeira focada em soluções bancárias digitais e serviços de crédito para PMEs, com forte compromisso com compliance e gestão de riscos."
        },
        "risk_matrix": {
            "type": "5x5",
            "impact_labels": ["Insignificante", "Baixo", "Moderado", "Alto", "Extremo"],
            "probability_labels": ["Remoto", "Improvável", "Possível", "Provável", "Praticamente Certo"],
            "risk_levels": {
                "low": [1, 2, 3, 5],
                "medium": [4, 6, 7, 8, 9, 10],
                "high": [11, 12, 13, 14, 15, 16, 17, 18],
                "critical": [19, 20, 21, 22, 23, 24, 25]
            }
        }
    }'::jsonb
),

-- 4. Medicare Health Solutions - Setor de Saúde
(
    'tenant-med-004'::uuid,
    'Medicare Health Solutions',
    'medicare-health',
    'direcao@medicarehealth.com.br',
    '+55 31 96666-0004',
    'faturamento@medicarehealth.com.br',
    200,
    156,
    'professional',
    'active',
    true,
    '{
        "company_data": {
            "corporate_name": "Medicare Health Solutions Ltda",
            "trading_name": "Medicare Health",
            "tax_id": "45.678.901/0001-23",
            "address": "Rua da Saúde, 789, Bairro Hospitalar",
            "city": "Belo Horizonte",
            "state": "MG",
            "zip_code": "30130-000",
            "country": "Brasil",
            "industry": "saude",
            "size": "media",
            "description": "Prestadora de serviços de saúde especializada em gestão hospitalar e telemedicina, com foco em qualidade e segurança do paciente."
        },
        "risk_matrix": {
            "type": "4x4",
            "impact_labels": ["Mínimo", "Menor", "Moderado", "Maior"],
            "probability_labels": ["Raro", "Pouco Provável", "Provável", "Muito Provável"],
            "risk_levels": {
                "low": [1, 2, 4],
                "medium": [3, 5, 6, 8],
                "high": [7, 9, 10, 12],
                "critical": [11, 13, 14, 15, 16]
            }
        }
    }'::jsonb
),

-- 5. InnovateTech Startup - Startup em Trial
(
    'tenant-innov-005'::uuid,
    'InnovateTech Startup',
    'startup-innovate',
    'founder@innovatetech.startup',
    '+55 41 95555-0005',
    'founder@innovatetech.startup',
    25,
    8,
    'trial',
    'trial',
    true,
    '{
        "company_data": {
            "corporate_name": "InnovateTech Desenvolvimento Ltda ME",
            "trading_name": "InnovateTech",
            "tax_id": "56.789.012/0001-34",
            "address": "Hub de Inovação, Sala 42",
            "city": "Curitiba",
            "state": "PR",
            "zip_code": "80250-000",
            "country": "Brasil",
            "industry": "tecnologia",
            "size": "micro",
            "description": "Startup focada em desenvolvimento de aplicativos móveis e soluções IoT para agricultura de precisão."
        },
        "risk_matrix": {
            "type": "4x4",
            "impact_labels": ["Baixo", "Médio", "Alto", "Muito Alto"],
            "probability_labels": ["Raro", "Ocasional", "Frequente", "Constante"],
            "risk_levels": {
                "low": [1, 2, 4],
                "medium": [3, 5, 6, 8],
                "high": [7, 9, 10, 12],
                "critical": [11, 13, 14, 15, 16]
            }
        }
    }'::jsonb
),

-- 6. EduCorp - Setor de Educação (Suspenso para teste)
(
    'tenant-edu-006'::uuid,
    'EduCorp Educação Digital',
    'educorp-digital',
    'admin@educorp.edu.br',
    '+55 85 94444-0006',
    'financeiro@educorp.edu.br',
    150,
    89,
    'basic',
    'suspended',
    false,
    '{
        "company_data": {
            "corporate_name": "EduCorp Educação Digital S.A.",
            "trading_name": "EduCorp",
            "tax_id": "67.890.123/0001-45",
            "address": "Campus Universitário, Bloco A",
            "city": "Fortaleza",
            "state": "CE",
            "zip_code": "60440-900",
            "country": "Brasil",
            "industry": "educacao",
            "size": "media",
            "description": "Plataforma de educação digital oferecendo cursos online e soluções de e-learning para instituições de ensino."
        },
        "risk_matrix": {
            "type": "5x5",
            "impact_labels": ["Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"],
            "probability_labels": ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"],
            "risk_levels": {
                "low": [1, 2, 3, 5, 6],
                "medium": [4, 7, 8, 9, 10, 11],
                "high": [12, 13, 14, 15, 16, 17, 18],
                "critical": [19, 20, 21, 22, 23, 24, 25]
            }
        }
    }'::jsonb
),

-- 7. RetailMax - Varejo com limite quase atingido
(
    'tenant-retail-007'::uuid,
    'RetailMax Varejo',
    'retailmax-varejo',
    'ti@retailmax.com.br',
    '+55 51 93333-0007',
    'contas@retailmax.com.br',
    50,
    47,
    'basic',
    'active',
    true,
    '{
        "company_data": {
            "corporate_name": "RetailMax Comércio Varejista Ltda",
            "trading_name": "RetailMax",
            "tax_id": "78.901.234/0001-56",
            "address": "Shopping Center Norte, Loja 234",
            "city": "Porto Alegre",
            "state": "RS",
            "zip_code": "91410-000",
            "country": "Brasil",
            "industry": "varejo",
            "size": "pequena",
            "description": "Rede de varejo especializada em eletrônicos e eletrodomésticos com foco no atendimento ao cliente e qualidade."
        },
        "risk_matrix": {
            "type": "4x4",
            "impact_labels": ["Baixo", "Moderado", "Alto", "Crítico"],
            "probability_labels": ["Improvável", "Possível", "Provável", "Muito Provável"],
            "risk_levels": {
                "low": [1, 2, 4],
                "medium": [3, 5, 6, 8],
                "high": [7, 9, 10, 12],
                "critical": [11, 13, 14, 15, 16]
            }
        }
    }'::jsonb
)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    billing_email = EXCLUDED.billing_email,
    max_users = EXCLUDED.max_users,
    current_users_count = EXCLUDED.current_users_count,
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_status = EXCLUDED.subscription_status,
    is_active = EXCLUDED.is_active,
    settings = EXCLUDED.settings,
    updated_at = now();

-- Verificação final
SELECT 
    name,
    slug, 
    subscription_plan,
    subscription_status,
    current_users_count || '/' || max_users as users,
    CASE 
        WHEN is_active THEN 'Ativo' 
        ELSE 'Inativo' 
    END as status,
    settings->>'company_data' is not null as has_company_data,
    settings->>'risk_matrix' is not null as has_risk_matrix
FROM tenants 
WHERE slug IN ('acme-corp', 'techsoft-ltd', 'greenfield-bank', 'medicare-health', 'startup-innovate', 'educorp-digital', 'retailmax-varejo')
ORDER BY created_at;