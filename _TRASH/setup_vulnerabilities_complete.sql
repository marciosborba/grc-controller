-- =====================================================
-- SCRIPT COMPLETO PARA CONFIGURAR VULNERABILIDADES
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Criar tabela de vulnerabilidades se não existir
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    cvss_score DECIMAL(3,1),
    cve_id VARCHAR(50),
    asset_name VARCHAR(255) NOT NULL,
    asset_ip INET,
    source_tool VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    port INTEGER,
    protocol VARCHAR(20),
    first_found_date TIMESTAMP WITH TIME ZONE,
    last_found_date TIMESTAMP WITH TIME ZONE,
    solution TEXT,
    references TEXT[],
    assigned_to VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    sla_breach BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    exploit_available BOOLEAN DEFAULT FALSE,
    asset_type VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_id ON vulnerabilities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_source_type ON vulnerabilities(source_type);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_asset_name ON vulnerabilities(asset_name);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_created_at ON vulnerabilities(created_at);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cvss_score ON vulnerabilities(cvss_score);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_status ON vulnerabilities(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_severity ON vulnerabilities(tenant_id, severity);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS para isolamento por tenant
DROP POLICY IF EXISTS vulnerabilities_tenant_isolation ON vulnerabilities;
CREATE POLICY vulnerabilities_tenant_isolation ON vulnerabilities
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 5. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vulnerabilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vulnerabilities_updated_at ON vulnerabilities;
CREATE TRIGGER update_vulnerabilities_updated_at
    BEFORE UPDATE ON vulnerabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_vulnerabilities_updated_at();

-- 6. Verificar se existem tenants e obter o primeiro
DO $$
DECLARE
    tenant_uuid UUID;
    vuln_count INTEGER;
BEGIN
    -- Buscar o primeiro tenant disponível
    SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
    
    IF tenant_uuid IS NULL THEN
        RAISE NOTICE 'AVISO: Nenhum tenant encontrado. Crie um tenant primeiro.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usando tenant: %', tenant_uuid;
    
    -- Verificar se já existem vulnerabilidades para este tenant
    SELECT COUNT(*) INTO vuln_count FROM vulnerabilities WHERE tenant_id = tenant_uuid;
    
    IF vuln_count > 0 THEN
        RAISE NOTICE 'Já existem % vulnerabilidades para este tenant.', vuln_count;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Criando vulnerabilidades de exemplo...';
    
    -- 7. Inserir dados de exemplo realistas
    INSERT INTO vulnerabilities (
        tenant_id, title, description, severity, status, cvss_score, cve_id,
        asset_name, asset_ip, source_tool, source_type, port, protocol,
        first_found_date, last_found_date, solution, references, assigned_to,
        due_date, sla_breach, exploit_available, asset_type, resolved_at
    ) VALUES
    -- Vulnerabilidade Crítica 1
    (tenant_uuid, 'SQL Injection in Login Form', 
     'The login form is vulnerable to SQL injection attacks through the username parameter. Attackers can bypass authentication and access sensitive data.',
     'Critical', 'Open', 9.8, 'CVE-2024-0001',
     'Web Portal', '192.168.1.100', 'OWASP ZAP', 'DAST', 443, 'HTTPS',
     NOW() - INTERVAL '7 days', NOW(), 
     'Use parameterized queries and input validation. Implement prepared statements.',
     ARRAY['https://owasp.org/www-community/attacks/SQL_Injection', 'https://cwe.mitre.org/data/definitions/89.html'],
     'dev@empresa.com', NOW() + INTERVAL '3 days', false, true, 'Web Application', NULL),
    
    -- Vulnerabilidade Crítica 2
    (tenant_uuid, 'Insecure Direct Object Reference',
     'Users can access other users data by manipulating object references in API calls.',
     'Critical', 'Open', 9.1, NULL,
     'Customer Portal', '192.168.1.106', 'Manual Testing', 'Pentest', 443, 'HTTPS',
     NOW() - INTERVAL '2 days', NOW(),
     'Implement proper authorization checks for all object access.',
     ARRAY['https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control'],
     'dev@empresa.com', NOW() + INTERVAL '1 day', false, true, 'Web Application', NULL),
    
    -- Vulnerabilidade Alta 1
    (tenant_uuid, 'Cross-Site Scripting (XSS) in Search',
     'Reflected XSS vulnerability in the search functionality allows execution of malicious scripts.',
     'High', 'In_Progress', 7.5, 'CVE-2024-0002',
     'API Gateway', '192.168.1.101', 'Burp Suite', 'SAST', 8080, 'HTTP',
     NOW() - INTERVAL '5 days', NOW(),
     'Implement proper output encoding and Content Security Policy.',
     ARRAY['https://owasp.org/www-community/attacks/xss/'],
     'security@empresa.com', NOW() + INTERVAL '7 days', false, false, 'API', NULL),
    
    -- Vulnerabilidade Alta 2
    (tenant_uuid, 'Outdated Software Components',
     'Multiple third-party libraries with known vulnerabilities detected.',
     'High', 'Open', 8.2, 'CVE-2024-0003',
     'E-commerce Platform', '192.168.1.105', 'OWASP Dependency Check', 'SCA', 443, 'HTTPS',
     NOW() - INTERVAL '21 days', NOW(),
     'Update all dependencies to latest secure versions.',
     ARRAY['https://owasp.org/www-project-dependency-check/'],
     'dev@empresa.com', NOW() + INTERVAL '7 days', true, true, 'Web Application', NULL),
    
    -- Vulnerabilidade Média 1
    (tenant_uuid, 'Insecure Data Storage',
     'Sensitive data stored without encryption in mobile application local storage.',
     'Medium', 'Testing', 5.3, NULL,
     'Mobile App', NULL, 'MobSF', 'Manual', NULL, NULL,
     NOW() - INTERVAL '3 days', NOW(),
     'Implement proper encryption for sensitive data storage.',
     ARRAY['https://owasp.org/www-project-mobile-top-10/'],
     'mobile@empresa.com', NOW() + INTERVAL '14 days', false, false, 'Mobile Application', NULL),
    
    -- Vulnerabilidade Média 2
    (tenant_uuid, 'Weak Password Policy',
     'System allows weak passwords that do not meet security standards.',
     'Medium', 'Open', 4.8, NULL,
     'User Management System', '192.168.1.104', 'Manual Review', 'Manual', 443, 'HTTPS',
     NOW() - INTERVAL '14 days', NOW(),
     'Implement strong password policy with complexity requirements.',
     ARRAY['https://owasp.org/www-community/controls/Password_Policy'],
     'security@empresa.com', NOW() + INTERVAL '21 days', false, false, 'Web Application', NULL),
    
    -- Vulnerabilidade Baixa (Resolvida)
    (tenant_uuid, 'Missing Security Headers',
     'Web application missing important security headers like X-Frame-Options, X-XSS-Protection.',
     'Low', 'Resolved', 3.1, NULL,
     'Admin Portal', '192.168.1.102', 'Nessus', 'DAST', 443, 'HTTPS',
     NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days',
     'Configure security headers in web server.',
     ARRAY['https://owasp.org/www-project-secure-headers/'],
     'devops@empresa.com', NOW() - INTERVAL '1 day', false, false, 'Web Application', NOW() - INTERVAL '1 day'),
    
    -- Vulnerabilidade Informativa
    (tenant_uuid, 'Information Disclosure',
     'API endpoint exposing sensitive system information in error messages.',
     'Info', 'Open', 2.1, NULL,
     'Internal API', '192.168.1.103', 'Custom Script', 'Pentest', 8443, 'HTTPS',
     NOW() - INTERVAL '1 day', NOW(),
     'Remove or restrict access to debug endpoints.',
     ARRAY['https://owasp.org/www-community/Improper_Error_Handling'],
     NULL, NOW() + INTERVAL '30 days', false, false, 'API', NULL),
    
    -- Vulnerabilidades adicionais para estatísticas mais robustas
    (tenant_uuid, 'Broken Authentication',
     'Session management vulnerabilities allow session hijacking.',
     'High', 'Open', 7.8, 'CVE-2024-0004',
     'Portal do Cliente', '192.168.1.107', 'OWASP ZAP', 'DAST', 443, 'HTTPS',
     NOW() - INTERVAL '4 days', NOW(),
     'Implement secure session management and token validation.',
     ARRAY['https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication'],
     'dev@empresa.com', NOW() + INTERVAL '5 days', false, true, 'Web Application', NULL),
    
    (tenant_uuid, 'Sensitive Data Exposure',
     'Credit card data transmitted without proper encryption.',
     'Critical', 'Open', 9.5, 'CVE-2024-0005',
     'Payment Gateway', '192.168.1.108', 'Manual Testing', 'Pentest', 443, 'HTTPS',
     NOW() - INTERVAL '1 day', NOW(),
     'Implement end-to-end encryption for all sensitive data.',
     ARRAY['https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure'],
     'security@empresa.com', NOW() + INTERVAL '2 days', false, true, 'Web Application', NULL),
    
    (tenant_uuid, 'XML External Entity (XXE)',
     'XML parser vulnerable to XXE attacks allowing file disclosure.',
     'High', 'In_Progress', 8.0, 'CVE-2024-0006',
     'Document Processing API', '192.168.1.109', 'Burp Suite', 'SAST', 8080, 'HTTP',
     NOW() - INTERVAL '6 days', NOW(),
     'Disable XML external entity processing and use secure parsers.',
     ARRAY['https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing'],
     'dev@empresa.com', NOW() + INTERVAL '10 days', false, false, 'API', NULL),
    
    (tenant_uuid, 'Insufficient Logging & Monitoring',
     'Critical security events are not properly logged or monitored.',
     'Medium', 'Open', 4.5, NULL,
     'All Systems', NULL, 'Security Audit', 'Manual', NULL, NULL,
     NOW() - INTERVAL '30 days', NOW(),
     'Implement comprehensive logging and monitoring solution.',
     ARRAY['https://owasp.org/www-project-top-ten/2017/A10_2017-Insufficient_Logging%2526Monitoring'],
     'security@empresa.com', NOW() + INTERVAL '45 days', true, false, 'Infrastructure', NULL);
    
    RAISE NOTICE 'Vulnerabilidades de exemplo criadas com sucesso!';
    
END $$;

-- 8. Verificar dados inseridos
DO $$
DECLARE
    tenant_uuid UUID;
    total_count INTEGER;
    critical_count INTEGER;
    high_count INTEGER;
    medium_count INTEGER;
    low_count INTEGER;
    info_count INTEGER;
    open_count INTEGER;
    resolved_count INTEGER;
BEGIN
    SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
    
    IF tenant_uuid IS NULL THEN
        RAISE NOTICE 'Nenhum tenant encontrado para verificação.';
        RETURN;
    END IF;
    
    SELECT COUNT(*) INTO total_count FROM vulnerabilities WHERE tenant_id = tenant_uuid;
    SELECT COUNT(*) INTO critical_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND severity = 'Critical';
    SELECT COUNT(*) INTO high_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND severity = 'High';
    SELECT COUNT(*) INTO medium_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND severity = 'Medium';
    SELECT COUNT(*) INTO low_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND severity = 'Low';
    SELECT COUNT(*) INTO info_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND severity = 'Info';
    SELECT COUNT(*) INTO open_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND status != 'Resolved';
    SELECT COUNT(*) INTO resolved_count FROM vulnerabilities WHERE tenant_id = tenant_uuid AND status = 'Resolved';
    
    RAISE NOTICE '=== ESTATÍSTICAS FINAIS ===';
    RAISE NOTICE 'Total de vulnerabilidades: %', total_count;
    RAISE NOTICE 'Críticas: %, Altas: %, Médias: %, Baixas: %, Info: %', 
                 critical_count, high_count, medium_count, low_count, info_count;
    RAISE NOTICE 'Abertas: %, Resolvidas: %', open_count, resolved_count;
    RAISE NOTICE 'Tenant ID: %', tenant_uuid;
    RAISE NOTICE '=========================';
END $$;

-- 9. Mostrar algumas vulnerabilidades criadas
SELECT 
    id,
    title,
    severity,
    status,
    asset_name,
    source_type,
    created_at
FROM vulnerabilities 
WHERE tenant_id = (SELECT id FROM tenants LIMIT 1)
ORDER BY 
    CASE severity 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
        WHEN 'Info' THEN 5 
    END,
    created_at DESC
LIMIT 10;