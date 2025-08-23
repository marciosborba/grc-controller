-- ============================================================================
-- SCRIPT DE POPULAÇÃO DO MÓDULO DE GESTÃO DE POLÍTICAS
-- ============================================================================
-- Popula o banco com exemplos de todos os subprocessos do módulo de políticas

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'policies') THEN
        RAISE NOTICE 'Tabela policies não encontrada. Execute primeiro o script de criação das tabelas.';
    ELSE
        RAISE NOTICE 'Tabela policies encontrada. Prosseguindo com a população...';
    END IF;
END $$;

-- Obter tenant_id
DO $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
    
    IF tenant_uuid IS NULL THEN
        RAISE NOTICE 'Nenhum tenant encontrado. Criando tenant de exemplo...';
        INSERT INTO tenants (name, slug, contact_email) 
        VALUES ('Empresa Exemplo', 'empresa-exemplo', 'admin@empresa.com')
        RETURNING id INTO tenant_uuid;
    END IF;
    
    RAISE NOTICE 'Usando tenant: %', tenant_uuid;
END $$;

-- ============================================================================
-- 1. SUBPROCESSO: ELABORAÇÃO DE POLÍTICAS
-- ============================================================================

-- Política em elaboração
INSERT INTO policies (
    id,
    title,
    description,
    category,
    document_type,
    version,
    status,
    effective_date,
    review_date,
    expiration_date,
    owner_id,
    created_by,
    updated_by,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    'Política de Segurança da Informação',
    'Esta política estabelece as diretrizes e procedimentos para garantir a segurança das informações corporativas, incluindo dados pessoais, informações confidenciais e sistemas críticos da organização.',
    'Segurança da Informação',
    'Política',
    '1.0',
    'draft',
    CURRENT_DATE + INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '3 years',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['segurança', 'informação', 'dados', 'confidencialidade', 'ISO27001'],
    ARRAY['ISO 27001', 'LGPD', 'SOX'],
    ARRAY['TI', 'Operações', 'Recursos Humanos', 'Todos os departamentos'],
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. SUBPROCESSO: REVISÃO DE POLÍTICAS
-- ============================================================================

-- Política em revisão
INSERT INTO policies (
    id,
    title,
    description,
    category,
    document_type,
    version,
    status,
    effective_date,
    review_date,
    expiration_date,
    owner_id,
    created_by,
    updated_by,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000002',
    'Código de Ética Corporativa',
    'Define os princípios éticos e de conduta que devem nortear o comportamento de todos os colaboradores, fornecedores e parceiros da organização.',
    'Ética',
    'Código',
    '2.1',
    'under_review',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '2 years',
    CURRENT_DATE + INTERVAL '5 years',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['ética', 'conduta', 'integridade', 'compliance', 'valores'],
    ARRAY['SOX', 'Código de Ética'],
    ARRAY['Todos os departamentos'],
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. SUBPROCESSO: APROVAÇÃO DE POLÍTICAS
-- ============================================================================

-- Política aguardando aprovação
INSERT INTO policies (
    id,
    title,
    description,
    category,
    document_type,
    version,
    status,
    effective_date,
    review_date,
    expiration_date,
    owner_id,
    created_by,
    updated_by,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000003',
    'Política de Gestão de Fornecedores',
    'Estabelece critérios e procedimentos para seleção, avaliação, contratação e monitoramento de fornecedores e prestadores de serviços.',
    'Operacional',
    'Política',
    '1.2',
    'pending_approval',
    CURRENT_DATE + INTERVAL '20 days',
    CURRENT_DATE + INTERVAL '18 months',
    CURRENT_DATE + INTERVAL '3 years',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['fornecedores', 'terceiros', 'contratos', 'due diligence', 'supply chain'],
    ARRAY['ISO 9001', 'SOX'],
    ARRAY['Compras', 'Jurídico', 'Operações', 'Financeiro'],
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. SUBPROCESSO: POLÍTICAS APROVADAS E PUBLICADAS
-- ============================================================================

-- Política aprovada e publicada
INSERT INTO policies (
    id,
    title,
    description,
    category,
    document_type,
    version,
    status,
    approved_by,
    approved_at,
    effective_date,
    review_date,
    expiration_date,
    owner_id,
    created_by,
    updated_by,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000004',
    'Política de Recursos Humanos',
    'Define diretrizes para gestão de pessoas, incluindo recrutamento, seleção, desenvolvimento, avaliação de desempenho e desligamento de colaboradores.',
    'Recursos Humanos',
    'Política',
    '3.0',
    'published',
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '10 days',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '3 years',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['recursos humanos', 'pessoas', 'recrutamento', 'desenvolvimento', 'performance'],
    ARRAY['CLT', 'ISO 9001'],
    ARRAY['Recursos Humanos', 'Gestão', 'Todos os departamentos'],
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. SUBPROCESSO: GESTÃO DE VALIDADE E CICLO DE VIDA
-- ============================================================================

-- Política próxima do vencimento
INSERT INTO policies (
    id,
    title,
    description,
    category,
    document_type,
    version,
    status,
    approved_by,
    approved_at,
    effective_date,
    review_date,
    expiration_date,
    last_reviewed_at,
    owner_id,
    created_by,
    updated_by,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000005',
    'Política de Backup e Recuperação',
    'Estabelece procedimentos para backup, armazenamento e recuperação de dados críticos da organização.',
    'Segurança da Informação',
    'Procedimento',
    '2.3',
    'published',
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '2 years 11 months',
    CURRENT_DATE - INTERVAL '2 years 11 months',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '1 month',
    NOW() - INTERVAL '6 months',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['backup', 'recuperação', 'dados', 'continuidade', 'disaster recovery'],
    ARRAY['ISO 27001', 'COBIT'],
    ARRAY['TI', 'Operações'],
    NOW() - INTERVAL '3 years',
    NOW() - INTERVAL '6 months'
) ON CONFLICT (id) DO NOTHING;

-- Política expirada (para analytics)
INSERT INTO policies (
    id,
    title,
    description,
    category,
    document_type,
    version,
    status,
    approved_by,
    approved_at,
    effective_date,
    review_date,
    expiration_date,
    last_reviewed_at,
    owner_id,
    created_by,
    updated_by,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000006',
    'Política de Home Office (COVID-19)',
    'Diretrizes temporárias para trabalho remoto durante a pandemia de COVID-19.',
    'Recursos Humanos',
    'Diretriz',
    '1.0',
    'expired',
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '3 years',
    CURRENT_DATE - INTERVAL '3 years',
    CURRENT_DATE - INTERVAL '2 years',
    CURRENT_DATE - INTERVAL '6 months',
    NOW() - INTERVAL '2 years',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['home office', 'remoto', 'covid', 'temporário', 'trabalho híbrido'],
    ARRAY['CLT'],
    ARRAY['Recursos Humanos', 'TI'],
    NOW() - INTERVAL '3 years 2 months',
    NOW() - INTERVAL '6 months'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. DADOS ADICIONAIS PARA ANALYTICS
-- ============================================================================

-- Inserir mais políticas para ter dados estatísticos
INSERT INTO policies (
    title,
    description,
    category,
    document_type,
    version,
    status,
    owner_id,
    created_by,
    updated_by,
    effective_date,
    review_date,
    expiration_date,
    tags,
    compliance_frameworks,
    impact_areas,
    created_at,
    updated_at
) VALUES 
(
    'Política de Viagens Corporativas',
    'Diretrizes para viagens a trabalho, reembolso de despesas e prestação de contas.',
    'Financeiro',
    'Política',
    '1.5',
    'published',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    CURRENT_DATE - INTERVAL '8 months',
    CURRENT_DATE + INTERVAL '4 months',
    CURRENT_DATE + INTERVAL '2 years',
    ARRAY['viagens', 'despesas', 'reembolso', 'prestação de contas'],
    ARRAY['Controles Internos'],
    ARRAY['Financeiro', 'Recursos Humanos'],
    NOW() - INTERVAL '8 months',
    NOW() - INTERVAL '2 months'
),
(
    'Procedimento de Compras',
    'Processo para aquisição de bens e serviços, incluindo aprovações e controles.',
    'Operacional',
    'Procedimento',
    '2.0',
    'approved',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    CURRENT_DATE + INTERVAL '1 week',
    CURRENT_DATE + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '3 years',
    ARRAY['compras', 'aquisições', 'aprovações', 'controles'],
    ARRAY['ISO 9001', 'Controles Internos'],
    ARRAY['Compras', 'Financeiro', 'Operações'],
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '1 month'
),
(
    'Manual de Qualidade',
    'Sistema de gestão da qualidade da organização conforme ISO 9001.',
    'Qualidade',
    'Manual',
    '4.1',
    'under_review',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    CURRENT_DATE + INTERVAL '2 months',
    CURRENT_DATE + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '3 years',
    ARRAY['qualidade', 'ISO 9001', 'processos', 'melhoria contínua'],
    ARRAY['ISO 9001'],
    ARRAY['Qualidade', 'Operações', 'Todos os departamentos'],
    NOW() - INTERVAL '6 months',
    NOW() - INTERVAL '1 week'
),
(
    'Política de Sustentabilidade',
    'Compromissos ambientais e práticas sustentáveis da organização.',
    'Ambiental',
    'Política',
    '1.0',
    'draft',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    CURRENT_DATE + INTERVAL '3 months',
    CURRENT_DATE + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '5 years',
    ARRAY['sustentabilidade', 'meio ambiente', 'ESG', 'responsabilidade social'],
    ARRAY['ISO 14001'],
    ARRAY['Operações', 'Compras', 'Facilities'],
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '3 days'
);

-- ============================================================================
-- 7. RELATÓRIO FINAL
-- ============================================================================

-- Gerar relatório de população
SELECT 
    'Total de Políticas' as metric_name,
    COUNT(*) as metric_value,
    'Número total de políticas criadas' as description
FROM policies

UNION ALL

SELECT 
    'Políticas por Status' as metric_name,
    COUNT(*) as metric_value,
    CONCAT('Status: ', status) as description
FROM policies 
GROUP BY status

UNION ALL

SELECT 
    'Políticas por Categoria' as metric_name,
    COUNT(*) as metric_value,
    CONCAT('Categoria: ', category) as description
FROM policies 
GROUP BY category;

-- Relatório de status das políticas
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM policies), 2) as percentual
FROM policies 
GROUP BY status
ORDER BY quantidade DESC;

-- Relatório de categorias
SELECT 
    category,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM policies), 2) as percentual
FROM policies 
GROUP BY category
ORDER BY quantidade DESC;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'POPULAÇÃO DO MÓDULO DE POLÍTICAS CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Dados criados:';
    RAISE NOTICE '- % políticas em diferentes estágios do ciclo de vida', (SELECT COUNT(*) FROM policies);
    RAISE NOTICE '';
    RAISE NOTICE 'Subprocessos populados com dados de exemplo:';
    RAISE NOTICE '✓ Elaboração de políticas';
    RAISE NOTICE '✓ Revisão técnica e de compliance';
    RAISE NOTICE '✓ Aprovação estruturada';
    RAISE NOTICE '✓ Publicação e comunicação';
    RAISE NOTICE '✓ Gestão de validade e ciclo de vida';
    RAISE NOTICE '✓ Métricas e analytics';
    RAISE NOTICE '';
    RAISE NOTICE 'O módulo está pronto para testes de integração!';
    RAISE NOTICE '============================================================================';
END $$;

COMMIT;