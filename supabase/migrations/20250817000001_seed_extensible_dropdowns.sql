-- ============================================================================
-- DADOS INICIAIS PARA DROPDOWNS EXTENSÍVEIS
-- ============================================================================
-- Migração para inserir dados iniciais nas tabelas de dropdowns

-- Inserir dados iniciais para cada tenant existente
DO $$
DECLARE
    tenant_record RECORD;
    first_user_id UUID;
BEGIN
    -- Buscar primeiro usuário para usar como created_by
    SELECT user_id INTO first_user_id FROM profiles LIMIT 1;
    
    -- Para cada tenant existente
    FOR tenant_record IN SELECT id FROM tenants LOOP
        -- Departamentos padrão
        INSERT INTO departments (name, description, tenant_id, created_by, is_active)
        VALUES 
            ('Tecnologia da Informação', 'Departamento responsável pela infraestrutura e sistemas', tenant_record.id, first_user_id, true),
            ('Segurança da Informação', 'Departamento responsável pela segurança cibernética', tenant_record.id, first_user_id, true),
            ('Compliance', 'Departamento responsável pela conformidade regulatória', tenant_record.id, first_user_id, true),
            ('Auditoria', 'Departamento responsável por auditorias internas', tenant_record.id, first_user_id, true),
            ('Riscos', 'Departamento responsável pela gestão de riscos', tenant_record.id, first_user_id, true),
            ('Jurídico', 'Departamento jurídico e legal', tenant_record.id, first_user_id, true),
            ('Recursos Humanos', 'Departamento de gestão de pessoas', tenant_record.id, first_user_id, true),
            ('Financeiro', 'Departamento financeiro e contábil', tenant_record.id, first_user_id, true),
            ('Operações', 'Departamento de operações e processos', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, tenant_id) DO NOTHING;

        -- Cargos padrão
        INSERT INTO job_titles (title, description, tenant_id, created_by, is_active)
        VALUES 
            ('Analista de Segurança', 'Responsável por análises de segurança da informação', tenant_record.id, first_user_id, true),
            ('Especialista em Compliance', 'Especialista em conformidade regulatória', tenant_record.id, first_user_id, true),
            ('Auditor Interno', 'Responsável por auditorias internas', tenant_record.id, first_user_id, true),
            ('Analista de Riscos', 'Responsável por análise e gestão de riscos', tenant_record.id, first_user_id, true),
            ('CISO', 'Chief Information Security Officer', tenant_record.id, first_user_id, true),
            ('Gerente de TI', 'Gerente do departamento de tecnologia', tenant_record.id, first_user_id, true),
            ('Coordenador de Compliance', 'Coordenador de atividades de compliance', tenant_record.id, first_user_id, true),
            ('Analista de Dados', 'Responsável por análise de dados e relatórios', tenant_record.id, first_user_id, true)
        ON CONFLICT (title, tenant_id) DO NOTHING;

        -- Frameworks padrão
        INSERT INTO compliance_frameworks (name, description, version, tenant_id, created_by, is_active)
        VALUES 
            ('ISO 27001', 'Sistema de Gestão de Segurança da Informação', '2013', tenant_record.id, first_user_id, true),
            ('LGPD', 'Lei Geral de Proteção de Dados', '2020', tenant_record.id, first_user_id, true),
            ('SOX', 'Sarbanes-Oxley Act', '2002', tenant_record.id, first_user_id, true),
            ('NIST CSF', 'NIST Cybersecurity Framework', '1.1', tenant_record.id, first_user_id, true),
            ('PCI DSS', 'Payment Card Industry Data Security Standard', '4.0', tenant_record.id, first_user_id, true),
            ('COBIT', 'Control Objectives for Information Technologies', '2019', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, version, tenant_id) DO NOTHING;

        -- Categorias de risco padrão
        INSERT INTO risk_categories (name, description, color, tenant_id, created_by, is_active)
        VALUES 
            ('Cibersegurança', 'Riscos relacionados à segurança cibernética', '#ef4444', tenant_record.id, first_user_id, true),
            ('Operacional', 'Riscos operacionais e de processos', '#f97316', tenant_record.id, first_user_id, true),
            ('Financeiro', 'Riscos financeiros e de mercado', '#eab308', tenant_record.id, first_user_id, true),
            ('Compliance', 'Riscos de conformidade regulatória', '#22c55e', tenant_record.id, first_user_id, true),
            ('Reputacional', 'Riscos à reputação da organização', '#8b5cf6', tenant_record.id, first_user_id, true),
            ('Estratégico', 'Riscos estratégicos de negócio', '#06b6d4', tenant_record.id, first_user_id, true),
            ('Tecnológico', 'Riscos relacionados à tecnologia', '#64748b', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, tenant_id) DO NOTHING;

        -- Tipos de incidente padrão
        INSERT INTO incident_types (name, description, severity_default, tenant_id, created_by, is_active)
        VALUES 
            ('Violação de Dados', 'Acesso não autorizado a dados sensíveis', 'high', tenant_record.id, first_user_id, true),
            ('Malware', 'Infecção por software malicioso', 'medium', tenant_record.id, first_user_id, true),
            ('Phishing', 'Tentativa de engenharia social', 'medium', tenant_record.id, first_user_id, true),
            ('Falha de Sistema', 'Indisponibilidade de sistemas críticos', 'high', tenant_record.id, first_user_id, true),
            ('Acesso Não Autorizado', 'Tentativa de acesso não autorizado', 'medium', tenant_record.id, first_user_id, true),
            ('Perda de Dados', 'Perda acidental de dados', 'high', tenant_record.id, first_user_id, true),
            ('Violação de Compliance', 'Não conformidade com regulamentações', 'high', tenant_record.id, first_user_id, true)
        ON CONFLICT (name, tenant_id) DO NOTHING;
    END LOOP;
END $$;