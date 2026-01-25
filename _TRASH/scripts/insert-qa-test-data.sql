-- ============================================================================
-- SCRIPT DE DADOS DE TESTE PARA QA
-- ============================================================================
-- Este script insere dados de exemplo para testar os módulos de:
-- - Compliance (Conformidade)
-- - Audit (Auditoria)  
-- - Vendor Risk (Gestão de Fornecedores)
--
-- Execute este script após configurar o banco de dados e criar as tabelas necessárias.
-- ============================================================================

-- Primeiro, vamos criar alguns usuários de teste se não existirem
-- (Assumindo que existe uma tabela profiles para informações dos usuários)

-- ============================================================================
-- DADOS DE TESTE - COMPLIANCE
-- ============================================================================

-- Inserir registros de compliance de exemplo
INSERT INTO compliance_assessments (
    id,
    title,
    description,
    assessment_type,
    compliance_framework,
    status,
    priority,
    current_phase,
    overall_maturity_level,
    lead_assessor,
    business_owner,
    planned_start_date,
    planned_completion_date,
    actual_start_date,
    scope_description,
    assessment_methodology,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'Avaliação LGPD - Sistema de CRM',
    'Avaliação de conformidade com a Lei Geral de Proteção de Dados para o sistema de Customer Relationship Management',
    'Privacy Impact Assessment',
    'LGPD',
    'In Progress',
    'High',
    'Data Collection',
    3,
    'Maria Silva',
    'João Santos',
    '2024-01-15',
    '2024-03-30',
    '2024-01-18',
    'Avaliação completa dos processos de coleta, armazenamento e processamento de dados pessoais no sistema CRM',
    'Questionários estruturados, entrevistas com stakeholders, análise documental e testes técnicos',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Assessment ISO 27001 - Segurança da Informação',
    'Avaliação de conformidade com os controles da ISO 27001:2022 para certificação',
    'Certification Assessment',
    'ISO 27001',
    'Planning',
    'Critical',
    'Planning',
    2,
    'Carlos Pereira',
    'Ana Costa',
    '2024-02-01',
    '2024-06-15',
    NULL,
    'Avaliação de todos os 93 controles da ISO 27001 aplicáveis à organização',
    'Gap analysis, documentação de evidências, testes de controles e preparação para auditoria externa',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Compliance SOX - Controles Financeiros',
    'Avaliação de conformidade com os controles internos da Lei Sarbanes-Oxley',
    'Financial Controls Assessment',
    'SOX',
    'Completed',
    'Medium',
    'Reporting',
    4,
    'Roberto Lima',
    'Patricia Oliveira',
    '2023-10-01',
    '2024-01-31',
    '2023-10-05',
    'Avaliação dos controles internos sobre demonstrações financeiras conforme seção 404 da SOX',
    'Walkthrough de processos, testes de efetividade operacional e documentação de deficiências',
    NOW() - INTERVAL '3 months',
    NOW()
);

-- Inserir evidências de compliance
INSERT INTO compliance_records (
    id,
    compliance_assessment_id,
    control_reference,
    control_description,
    compliance_status,
    maturity_level,
    evidence_description,
    gaps_identified,
    remediation_plan,
    responsible_person,
    target_completion_date,
    actual_completion_date,
    created_at,
    updated_at
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM compliance_assessments WHERE title LIKE 'Avaliação LGPD%' LIMIT 1),
    'LGPD-Art.6',
    'Base legal para tratamento de dados pessoais',
    'Partially Compliant',
    3,
    'Política de privacidade publicada, termo de consentimento implementado, mas falta documentação de outras bases legais',
    'Ausência de documentação formal para bases legais além do consentimento (interesse legítimo, execução de contrato)',
    'Criar documentação formal das bases legais utilizadas para cada finalidade de tratamento',
    'Maria Silva',
    '2024-02-15',
    NULL,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM compliance_assessments WHERE title LIKE '%ISO 27001%' LIMIT 1),
    'A.5.1',
    'Políticas para segurança da informação',
    'Compliant',
    4,
    'Política de segurança da informação aprovada pela alta direção, comunicada e implementada',
    'Nenhuma deficiência identificada',
    'Manutenção da conformidade através de revisões periódicas',
    'Carlos Pereira',
    '2024-06-01',
    '2024-01-20',
    NOW(),
    NOW()
);

-- ============================================================================
-- DADOS DE TESTE - AUDIT
-- ============================================================================

-- Inserir auditorias de exemplo
INSERT INTO audit_reports (
    id,
    title,
    description,
    audit_type,
    audit_scope,
    scope_description,
    status,
    priority,
    current_phase,
    lead_auditor,
    auditor_id,
    planned_start_date,
    planned_end_date,
    fieldwork_start_date,
    fieldwork_end_date,
    report_due_date,
    budgeted_hours,
    actual_hours,
    estimated_cost,
    actual_cost,
    overall_opinion,
    overall_rating,
    executive_summary,
    key_findings_summary,
    objectives,
    audit_criteria,
    auditee_contacts,
    auditors,
    confidentiality_level,
    follow_up_required,
    follow_up_date,
    created_at,
    updated_at
) VALUES
(
    gen_random_uuid(),
    'Auditoria Interna - Processo de Compras',
    'Auditoria do processo de compras e contratações para verificar aderência aos controles internos',
    'Internal Audit',
    'Process Specific',
    'Processos de solicitação, aprovação, compra e recebimento de bens e serviços',
    'Fieldwork',
    'High',
    'Control Testing',
    'Sandra Martins',
    (SELECT id FROM profiles WHERE email LIKE '%audit%' LIMIT 1),
    '2024-01-10',
    '2024-02-28',
    '2024-01-15',
    '2024-02-20',
    '2024-03-05',
    160,
    120,
    25000.00,
    18500.00,
    NULL,
    3,
    NULL,
    'Identificadas oportunidades de melhoria nos controles de aprovação e segregação de funções',
    ARRAY['Avaliar a efetividade dos controles no processo de compras', 'Verificar conformidade com políticas internas', 'Identificar oportunidades de melhoria'],
    ARRAY['Política de Compras v2.1', 'Norma de Alçadas Financeiras', 'Código de Ética'],
    ARRAY['Fernando Costa - Gerente de Compras', 'Lucia Santos - Coordenadora Financeira'],
    ARRAY['Sandra Martins - Auditora Líder', 'Paulo Ribeiro - Auditor Sênior'],
    'Internal',
    true,
    '2024-06-01',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Auditoria Externa - Demonstrações Financeiras 2023',
    'Auditoria independente das demonstrações financeiras do exercício de 2023',
    'External Audit',
    'Organization-wide',
    'Demonstrações financeiras consolidadas da empresa e subsidiárias',
    'Review',
    'Critical',
    'Reporting',
    'KPMG Auditores',
    NULL,
    '2024-01-02',
    '2024-03-31',
    '2024-02-01',
    '2024-03-15',
    '2024-04-15',
    480,
    465,
    150000.00,
    148200.00,
    'Unqualified Opinion',
    5,
    'As demonstrações financeiras apresentam adequadamente a posição patrimonial e financeira da Companhia',
    'Não foram identificadas deficiências significativas nos controles internos sobre demonstrações financeiras',
    ARRAY['Emitir opinião sobre as demonstrações financeiras', 'Avaliar controles internos relevantes', 'Verificar conformidade com normas contábeis'],
    ARRAY['CPC - Comitê de Pronunciamentos Contábeis', 'Lei 6.404/76', 'Instruções CVM'],
    ARRAY['Ana Rodrigues - CFO', 'Marcos Alves - Controller', 'Beatriz Silva - Gerente Contábil'],
    ARRAY['João Mendes - Sócio KPMG', 'Patricia Lemos - Gerente KPMG', 'Rafael Costa - Supervisor KPMG'],
    'Confidential',
    false,
    NULL,
    NOW(),
    NOW()
);

-- Inserir achados de auditoria
-- Nota: Esta tabela pode não existir ainda, então criamos condicionalmente
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_findings') THEN
        INSERT INTO audit_findings (
            id,
            audit_id,
            title,
            description,
            finding_type,
            severity,
            condition,
            criteria,
            cause,
            effect,
            audit_area,
            likelihood,
            impact,
            responsible_person,
            target_resolution_date,
            status,
            created_at,
            updated_at
        ) VALUES
        (
            gen_random_uuid(),
            (SELECT id FROM audit_reports WHERE title LIKE '%Processo de Compras%' LIMIT 1),
            'Ausência de segregação de funções',
            'Identificado que a mesma pessoa que solicita compras também aprova pedidos de até R$ 10.000',
            'Control Deficiency',
            'Medium',
            'João Silva acumula função de solicitante e aprovador de compras até R$ 10.000',
            'Política de Compras estabelece que solicitante e aprovador devem ser pessoas diferentes',
            'Falta de recursos humanos no departamento de compras',
            'Risco de fraude e erro, conflito de interesse',
            'Processo de Aprovação de Compras',
            'Medium',
            'Medium',
            'Fernando Costa',
            '2024-04-30',
            'Open',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- ============================================================================
-- DADOS DE TESTE - VENDOR RISK MANAGEMENT
-- ============================================================================

-- Inserir fornecedores de exemplo
-- Nota: Assumindo que existe uma tabela vendors, criamos dados condicionalmente
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
        INSERT INTO vendors (
            id,
            name,
            legal_name,
            tax_id,
            vendor_type,
            vendor_category,
            status,
            overall_risk_level,
            business_criticality,
            data_access_level,
            primary_contact_name,
            primary_contact_email,
            primary_contact_phone,
            relationship_manager,
            annual_revenue,
            employee_count,
            contract_start_date,
            contract_end_date,
            contract_value,
            annual_spend,
            monitoring_frequency,
            website,
            industry_sector,
            notes,
            address,
            created_at,
            updated_at
        ) VALUES
        (
            gen_random_uuid(),
            'TechCorp Solutions',
            'TechCorp Solutions Ltda',
            '12.345.678/0001-90',
            'Technology Provider',
            'Software & IT Services',
            'Active',
            'Medium',
            'High',
            'Confidential',
            'Maria Fernandes',
            'maria.fernandes@techcorp.com.br',
            '+55 11 3456-7890',
            'Carlos Silva',
            15000000.00,
            250,
            '2023-01-01',
            '2025-12-31',
            2400000.00,
            800000.00,
            'Quarterly',
            'https://www.techcorp.com.br',
            'Tecnologia da Informação',
            'Principal fornecedor de software de gestão empresarial',
            '{"street": "Av. Paulista, 1000", "city": "São Paulo", "state": "SP", "postal_code": "01310-100", "country": "Brasil"}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'CloudServices Inc',
            'CloudServices Tecnologia S.A.',
            '98.765.432/0001-11',
            'Cloud Service Provider',
            'Infrastructure Services',
            'Active',
            'High',
            'Critical',
            'Restricted',
            'John Smith',
            'john.smith@cloudservices.com',
            '+1 555-123-4567',
            'Ana Santos',
            50000000.00,
            1200,
            '2022-06-01',
            '2024-05-31',
            1800000.00,
            600000.00,
            'Monthly',
            'https://www.cloudservices.com',
            'Cloud Computing',
            'Fornecedor crítico de infraestrutura em nuvem, armazena dados sensíveis da empresa',
            '{"street": "123 Tech Street", "city": "San Francisco", "state": "CA", "postal_code": "94105", "country": "USA"}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Consultoria Jurídica Azevedo',
            'Azevedo & Associados Advogados',
            '11.222.333/0001-44',
            'Professional Services',
            'Legal Services',
            'Active',
            'Low',
            'Medium',
            'Internal',
            'Dr. Roberto Azevedo',
            'roberto@azevedoadvogados.com.br',
            '+55 11 2345-6789',
            'Patricia Lima',
            5000000.00,
            45,
            '2023-03-01',
            '2026-02-28',
            450000.00,
            150000.00,
            'Annually',
            'https://www.azevedoadvogados.com.br',
            'Serviços Jurídicos',
            'Suporte jurídico especializado em direito corporativo e compliance',
            '{"street": "Rua da Consolação, 500", "city": "São Paulo", "state": "SP", "postal_code": "01302-000", "country": "Brasil"}'::jsonb,
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- Inserir assessments de fornecedores
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendor_assessments') THEN
        INSERT INTO vendor_assessments (
            id,
            vendor_id,
            title,
            assessment_type,
            status,
            planned_start_date,
            planned_completion_date,
            actual_start_date,
            actual_completion_date,
            lead_assessor,
            scope_description,
            assessment_areas,
            overall_score,
            risk_rating,
            executive_summary,
            key_findings,
            recommendations,
            created_at,
            updated_at
        ) VALUES
        (
            gen_random_uuid(),
            (SELECT id FROM vendors WHERE name = 'TechCorp Solutions' LIMIT 1),
            'Risk Assessment - TechCorp Solutions',
            'Risk Assessment',
            'Completed',
            '2024-01-08',
            '2024-01-25',
            '2024-01-10',
            '2024-01-24',
            'Sandra Oliveira',
            'Avaliação completa de riscos relacionados aos serviços de TI fornecidos',
            ARRAY['Security', 'Data Privacy', 'Business Continuity', 'Financial Stability'],
            75,
            'Medium',
            'TechCorp apresenta controles adequados, mas com oportunidades de melhoria em segurança cibernética',
            ARRAY['Política de backup implementada', 'Certificação ISO 27001 válida', 'Necessita melhorar controles de acesso'],
            ARRAY['Implementar autenticação multifator', 'Revisar política de retenção de dados', 'Realizar pentest anual'],
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            (SELECT id FROM vendors WHERE name = 'CloudServices Inc' LIMIT 1),
            'Due Diligence - CloudServices Inc',
            'Due Diligence',
            'In Progress',
            '2024-02-01',
            '2024-02-29',
            '2024-02-01',
            NULL,
            'Carlos Mendes',
            'Due diligence detalhada para renovação de contrato crítico',
            ARRAY['Compliance', 'Financial Health', 'Operational Resilience', 'Data Governance'],
            NULL,
            NULL,
            NULL,
            ARRAY['Análise financeira em andamento', 'Questionário de compliance enviado'],
            NULL,
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- ============================================================================
-- DADOS ADICIONAIS PARA INTEGRAÇÃO ENTRE MÓDULOS
-- ============================================================================

-- Inserir alguns registros de atividade/log para rastreabilidade
INSERT INTO activity_logs (
    id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
    'CREATE',
    'compliance_assessment',
    (SELECT id FROM compliance_assessments WHERE title LIKE 'Avaliação LGPD%' LIMIT 1),
    '{"title": "Avaliação LGPD - Sistema de CRM", "framework": "LGPD"}'::json,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email LIKE '%audit%' LIMIT 1),
    'UPDATE',
    'audit_report',
    (SELECT id FROM audit_reports WHERE title LIKE '%Processo de Compras%' LIMIT 1),
    '{"field": "status", "old_value": "Planning", "new_value": "Fieldwork"}'::json,
    NOW() - INTERVAL '5 days'
);

-- ============================================================================
-- VIEWS PARA RELATÓRIOS E DASHBOARDS
-- ============================================================================

-- View para dashboard de compliance
CREATE OR REPLACE VIEW compliance_dashboard AS
SELECT
    COUNT(*) as total_assessments,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_assessments,
    COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_assessments,
    COUNT(CASE WHEN status = 'Planning' THEN 1 END) as planned_assessments,
    COUNT(CASE WHEN priority = 'Critical' THEN 1 END) as critical_assessments,
    AVG(overall_maturity_level) as avg_maturity_level,
    COUNT(CASE WHEN planned_completion_date < CURRENT_DATE AND status != 'Completed' THEN 1 END) as overdue_assessments
FROM compliance_assessments;

-- View para dashboard de auditorias
CREATE OR REPLACE VIEW audit_dashboard AS
SELECT
    COUNT(*) as total_audits,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_audits,
    COUNT(CASE WHEN status IN ('Planning', 'Fieldwork', 'Review') THEN 1 END) as active_audits,
    AVG(actual_hours) as avg_hours_per_audit,
    AVG(actual_cost) as avg_cost_per_audit,
    COUNT(CASE WHEN follow_up_required = true THEN 1 END) as audits_requiring_followup,
    COUNT(CASE WHEN audit_type = 'Internal Audit' THEN 1 END) as internal_audits,
    COUNT(CASE WHEN audit_type = 'External Audit' THEN 1 END) as external_audits
FROM audit_reports;

-- View para dashboard de fornecedores (somente se a tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
        EXECUTE '
        CREATE OR REPLACE VIEW vendor_dashboard AS
        SELECT
            COUNT(*) as total_vendors,
            COUNT(CASE WHEN status = ''Active'' THEN 1 END) as active_vendors,
            COUNT(CASE WHEN overall_risk_level IN (''Critical'', ''High'') THEN 1 END) as high_risk_vendors,
            COUNT(CASE WHEN business_criticality = ''Critical'' THEN 1 END) as critical_vendors,
            SUM(annual_spend) as total_annual_spend,
            AVG(annual_spend) as avg_annual_spend_per_vendor,
            COUNT(CASE WHEN contract_end_date <= CURRENT_DATE + INTERVAL ''90 days'' THEN 1 END) as contracts_expiring_soon
        FROM vendors;
        ';
    END IF;
END $$;

-- ============================================================================
-- FUNÇÕES AUXILIARES PARA RELATÓRIOS
-- ============================================================================

-- Função para calcular métricas de compliance
CREATE OR REPLACE FUNCTION get_compliance_metrics(assessment_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_controls', COUNT(*),
        'compliant_controls', COUNT(CASE WHEN compliance_status = 'Compliant' THEN 1 END),
        'partially_compliant_controls', COUNT(CASE WHEN compliance_status = 'Partially Compliant' THEN 1 END),
        'non_compliant_controls', COUNT(CASE WHEN compliance_status = 'Non-Compliant' THEN 1 END),
        'not_assessed_controls', COUNT(CASE WHEN compliance_status = 'Not Assessed' THEN 1 END),
        'avg_maturity_level', ROUND(AVG(maturity_level), 2),
        'compliance_percentage', ROUND(
            (COUNT(CASE WHEN compliance_status = 'Compliant' THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0)) * 100, 2
        )
    )
    FROM compliance_records
    WHERE assessment_id IS NULL OR compliance_assessment_id = assessment_id
    INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FINALIZAÇÃO E VERIFICAÇÃO
-- ============================================================================

-- Verificar se os dados foram inseridos corretamente
SELECT 
    'COMPLIANCE' as module,
    COUNT(*) as records_inserted
FROM compliance_assessments
UNION ALL
SELECT 
    'AUDIT' as module,
    COUNT(*) as records_inserted
FROM audit_reports
UNION ALL
SELECT 
    'VENDOR' as module,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') 
        THEN (SELECT COUNT(*)::text FROM vendors)
        ELSE '0 (table not found)'
    END as records_inserted;

-- Comentário de sucesso
SELECT 'Dados de teste para QA inseridos com sucesso!' as status,
       'Execute as views e funções criadas para verificar os dashboards' as next_steps;