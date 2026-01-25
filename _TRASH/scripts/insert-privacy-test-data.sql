-- ============================================================================
-- SCRIPT DE DADOS DE TESTE PARA MÓDULO DE PRIVACIDADE/LGPD
-- ============================================================================
-- Este script insere dados de exemplo para testar o módulo de privacidade:
-- - Fontes de Discovery de Dados
-- - Resultados de Discovery
-- - Inventário de Dados Pessoais
-- - Bases Legais
-- - Consentimentos
-- - Atividades de Tratamento (RAT)
-- - DPIAs
-- - Solicitações de Titulares
-- - Incidentes de Privacidade
-- - Treinamentos e Auditorias
--
-- Execute este script após configurar o banco de dados e aplicar as migrações.
-- ============================================================================

-- Verificar se existem usuários para usar como referência
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Nenhum usuário encontrado. Execute primeiro o script de criação de usuários.';
    END IF;
END $$;

-- Variáveis auxiliares para referenciar usuários
WITH user_ids AS (
    SELECT 
        array_agg(id ORDER BY created_at) as ids,
        array_agg(id ORDER BY created_at)[1] as first_user,
        array_agg(id ORDER BY created_at)[2] as second_user,
        array_agg(id ORDER BY created_at)[3] as third_user
    FROM auth.users
    LIMIT 10
)

-- ============================================================================
-- 1. FONTES DE DISCOVERY DE DADOS
-- ============================================================================
INSERT INTO data_discovery_sources (
    name, 
    description, 
    type, 
    location, 
    connection_string,
    credentials_stored,
    status,
    scan_frequency,
    data_steward_id,
    created_by,
    updated_by
)
SELECT 
    nome,
    descricao,
    tipo,
    localizacao,
    conn_string,
    credenciais,
    status_fonte,
    frequencia,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    ('Banco de Dados CRM', 'Sistema de relacionamento com clientes', 'database', 'crm-prod.empresa.com:5432/crm_db', 'host=crm-prod.empresa.com port=5432 dbname=crm_db', true, 'active', 'monthly'),
    ('Sistema ERP', 'Enterprise Resource Planning principal', 'database', 'erp-prod.empresa.com:1433/erp_main', 'server=erp-prod.empresa.com;database=erp_main', true, 'active', 'weekly'),
    ('Website Corporativo', 'Site institucional e formulários', 'application', 'https://www.empresa.com.br', 'api_key=xxxxxxxx', false, 'active', 'weekly'),
    ('Arquivos de RH', 'Documentos de recursos humanos', 'file_system', '\\\\servidor-rh\\dados\\funcionarios', '', false, 'active', 'monthly'),
    ('Sistema de E-mail', 'Microsoft Exchange Server', 'email_system', 'exchange.empresa.com', 'domain=empresa.com', true, 'active', 'quarterly'),
    ('Backup Storage', 'Armazenamento de backups na nuvem', 'cloud_storage', 's3://empresa-backups/dados/', 'region=sa-east-1', true, 'inactive', 'manual'),
    ('Sistema Financeiro', 'Gestão financeira e contábil', 'database', 'financeiro.empresa.com:3306/contabil', 'host=financeiro.empresa.com port=3306', true, 'scanning', 'monthly'),
    ('API de Integração', 'APIs para sistemas terceiros', 'api', 'https://api.empresa.com.br/v1', 'bearer_token=xxxxxxxx', false, 'error', 'weekly')
) AS dados(nome, descricao, tipo, localizacao, conn_string, credenciais, status_fonte, frequencia);

-- ============================================================================
-- 2. RESULTADOS DE DISCOVERY
-- ============================================================================
INSERT INTO data_discovery_results (
    source_id,
    table_name,
    field_name,
    data_category,
    data_type,
    sensitivity_level,
    confidence_score,
    sample_data,
    estimated_records,
    status,
    reviewed_by,
    discovered_at
)
SELECT 
    ds.id,
    tabela,
    campo,
    categoria,
    tipo_dado,
    sensibilidade,
    confianca,
    amostra,
    registros,
    status_result,
    (SELECT first_user FROM user_ids),
    NOW() - (random() * INTERVAL '30 days')
FROM data_discovery_sources ds
CROSS JOIN (VALUES
    ('usuarios', 'email', 'contato', 'email', 'media', 0.95, 'usuario@***.com', 15000, 'validated'),
    ('usuarios', 'nome_completo', 'identificacao', 'nome', 'media', 0.98, 'João ***', 15000, 'validated'),
    ('usuarios', 'cpf', 'identificacao', 'cpf', 'alta', 0.99, '123.456.***-**', 12000, 'classified'),
    ('usuarios', 'telefone', 'contato', 'telefone', 'media', 0.92, '(11) 9****-****', 13500, 'validated'),
    ('clientes', 'endereco_completo', 'localizacao', 'endereco', 'media', 0.89, 'Rua *** 123', 8000, 'discovered'),
    ('funcionarios', 'data_nascimento', 'identificacao', 'data_nascimento', 'alta', 0.96, '01/01/****', 500, 'classified'),
    ('transacoes', 'numero_cartao', 'financeiro', 'cartao_credito', 'critica', 0.94, '**** **** **** 1234', 45000, 'classified'),
    ('funcionarios', 'salario', 'financeiro', 'outros', 'alta', 0.91, 'R$ ****,**', 500, 'validated'),
    ('logs', 'ip_address', 'comportamental', 'outros', 'baixa', 0.87, '192.168.***.***', 100000, 'discovered'),
    ('avaliacoes', 'foto_perfil', 'biometrico', 'fotografia', 'alta', 0.93, '[imagem]', 2500, 'discovered')
) AS resultados(tabela, campo, categoria, tipo_dado, sensibilidade, confianca, amostra, registros, status_result)
WHERE ds.status = 'active'
LIMIT 50;

-- ============================================================================
-- 3. BASES LEGAIS
-- ============================================================================
INSERT INTO legal_bases (
    name,
    description,
    legal_basis_type,
    legal_article,
    justification,
    applies_to_categories,
    applies_to_processing,
    valid_from,
    valid_until,
    status,
    legal_responsible_id,
    created_by,
    updated_by
)
SELECT 
    nome,
    descricao,
    tipo_base,
    artigo,
    justificativa,
    categorias,
    processamentos,
    valido_de::date,
    valido_ate::date,
    status_base,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    (
        'Consentimento para Marketing',
        'Base legal para envio de comunicações promocionais e ofertas comerciais',
        'consentimento',
        'Art. 7º, I da LGPD',
        'Titular forneceu consentimento específico para recebimento de materiais promocionais',
        ARRAY['contato', 'comportamental'],
        ARRAY['marketing_direto', 'comunicacao_promocional'],
        '2024-01-01',
        '2026-12-31',
        'active'
    ),
    (
        'Execução de Contrato - Serviços',
        'Tratamento necessário para execução de contrato de prestação de serviços',
        'contrato',
        'Art. 7º, V da LGPD',
        'Dados necessários para cumprimento de obrigações contratuais de prestação de serviços',
        ARRAY['identificacao', 'contato', 'financeiro'],
        ARRAY['prestacao_servicos', 'cobranca', 'suporte_cliente'],
        '2024-01-01',
        NULL,
        'active'
    ),
    (
        'Obrigação Legal Trabalhista',
        'Cumprimento de obrigações legais e regulamentares trabalhistas',
        'obrigacao_legal',
        'Art. 7º, II da LGPD',
        'Necessário para cumprimento de obrigações previstas na CLT, legislação trabalhista e previdenciária',
        ARRAY['identificacao', 'profissional', 'financeiro'],
        ARRAY['gestao_rh', 'folha_pagamento', 'obrigacoes_trabalhistas'],
        '2024-01-01',
        NULL,
        'active'
    ),
    (
        'Interesse Legítimo - Segurança',
        'Prevenção à fraude e garantia da segurança das operações',
        'interesse_legitimo',
        'Art. 7º, IX da LGPD',
        'Necessário para proteção do crédito e prevenção de fraudes, considerando direitos do titular',
        ARRAY['comportamental', 'localizacao', 'identificacao'],
        ARRAY['prevencao_fraude', 'analise_risco', 'seguranca_operacional'],
        '2024-01-01',
        '2025-12-31',
        'active'
    ),
    (
        'Proteção da Vida - Emergências',
        'Proteção da vida ou da incolumidade física do titular ou terceiros',
        'protecao_vida',
        'Art. 7º, III da LGPD',
        'Utilização em situações de emergência para proteção da vida e segurança',
        ARRAY['identificacao', 'contato', 'localizacao', 'saude'],
        ARRAY['atendimento_emergencial', 'contato_emergencia'],
        '2024-01-01',
        NULL,
        'active'
    ),
    (
        'Interesse Público - Transparência',
        'Execução de políticas públicas e transparência',
        'interesse_publico',
        'Art. 7º, IV da LGPD',
        'Necessário para cumprimento de obrigações de transparência e prestação de contas públicas',
        ARRAY['identificacao', 'profissional'],
        ARRAY['transparencia_publica', 'prestacao_contas'],
        '2024-01-01',
        NULL,
        'suspended'
    )
) AS bases(nome, descricao, tipo_base, artigo, justificativa, categorias, processamentos, valido_de, valido_ate, status_base);

-- ============================================================================
-- 4. INVENTÁRIO DE DADOS PESSOAIS
-- ============================================================================
INSERT INTO data_inventory (
    name,
    description,
    data_category,
    data_types,
    system_name,
    database_name,
    table_field_names,
    file_locations,
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
    nome,
    descricao,
    categoria,
    tipos_dados,
    sistema,
    bd_nome,
    tabelas_campos,
    locais_arquivo,
    volume,
    retencao_meses,
    justificativa_retencao,
    sensibilidade,
    origem,
    (SELECT first_user FROM user_ids),
    (SELECT second_user FROM user_ids),
    (SELECT first_user FROM user_ids),
    status_inv,
    (CURRENT_DATE + INTERVAL '12 months')::date,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    (
        'Cadastro de Clientes - CRM',
        'Dados básicos de identificação e contato dos clientes para prestação de serviços',
        'identificacao',
        ARRAY['nome', 'cpf', 'email', 'telefone'],
        'Sistema CRM',
        'crm_production',
        ARRAY['customers.full_name', 'customers.document_number', 'customers.email', 'customers.phone'],
        NULL,
        15000,
        60,
        'Dados mantidos por 5 anos após encerramento do relacionamento comercial conforme regulamentação setorial',
        'media',
        'coleta_direta',
        'active'
    ),
    (
        'Dados Financeiros - Transações',
        'Informações financeiras de transações e pagamentos realizados pelos clientes',
        'financeiro',
        ARRAY['cartao_credito', 'conta_bancaria', 'historico_compras'],
        'Sistema ERP',
        'erp_main',
        ARRAY['transactions.card_number', 'transactions.bank_account', 'transactions.amount'],
        NULL,
        45000,
        120,
        'Obrigação legal de manutenção de registros financeiros por 10 anos',
        'critica',
        'sistemas_internos',
        'active'
    ),
    (
        'Funcionários - RH',
        'Dados de recursos humanos para gestão de pessoal e cumprimento de obrigações trabalhistas',
        'profissional',
        ARRAY['nome', 'cpf', 'data_nascimento', 'endereco'],
        'Sistema de RH',
        'rh_database',
        ARRAY['employees.full_name', 'employees.cpf', 'employees.birth_date', 'employees.address'],
        ARRAY['\\\\servidor-rh\\contratos', '\\\\servidor-rh\\documentos'],
        500,
        180,
        'Manutenção obrigatória por 15 anos após desligamento conforme legislação trabalhista',
        'alta',
        'coleta_direta',
        'active'
    ),
    (
        'Logs de Acesso - Website',
        'Registros de acesso e navegação no website corporativo para análise de segurança',
        'comportamental',
        ARRAY['localizacao_gps', 'preferencias', 'outros'],
        'Website Corporativo',
        'web_analytics',
        ARRAY['access_logs.ip_address', 'access_logs.user_agent', 'access_logs.session_id'],
        NULL,
        100000,
        12,
        'Logs mantidos por 1 ano para análise de segurança e detecção de fraudes',
        'baixa',
        'cookies',
        'active'
    ),
    (
        'Documentos Digitalizados - Arquivo',
        'Documentos históricos digitalizados do arquivo morto da empresa',
        'identificacao',
        ARRAY['nome', 'rg', 'cpf'],
        'Sistema de Arquivo',
        NULL,
        NULL,
        ARRAY['\\\\backup\\arquivo_morto', '\\\\nas\\documentos_historicos'],
        25000,
        300,
        'Documentos históricos mantidos por 25 anos para fins de auditoria e compliance',
        'media',
        'terceiros',
        'archived'
    ),
    (
        'Pesquisa de Satisfação',
        'Dados coletados em pesquisas de satisfação e feedback de clientes',
        'comportamental',
        ARRAY['email', 'preferencias', 'outros'],
        'Plataforma de Pesquisas',
        'survey_db',
        ARRAY['responses.email', 'responses.rating', 'responses.comments'],
        NULL,
        8500,
        36,
        'Dados de pesquisa mantidos por 3 anos para análise longitudinal de satisfação',
        'media',
        'coleta_direta',
        'active'
    ),
    (
        'Backup de Segurança - Cloud',
        'Cópias de segurança dos dados principais armazenadas em nuvem',
        'identificacao',
        ARRAY['nome', 'cpf', 'email'],
        'AWS S3 Backup',
        NULL,
        NULL,
        ARRAY['s3://empresa-backups/customers/', 's3://empresa-backups/employees/'],
        50000,
        24,
        'Backups mantidos por 2 anos para recuperação de desastres',
        'alta',
        'sistemas_internos',
        'active'
    )
) AS inventario(nome, descricao, categoria, tipos_dados, sistema, bd_nome, tabelas_campos, locais_arquivo, volume, retencao_meses, justificativa_retencao, sensibilidade, origem, status_inv);

-- ============================================================================
-- 5. ATIVIDADES DE TRATAMENTO (RAT)
-- ============================================================================
INSERT INTO processing_activities (
    name,
    description,
    purpose,
    data_categories,
    data_types,
    data_subjects_categories,
    legal_basis_id,
    legal_basis_justification,
    data_controller_name,
    data_controller_contact,
    data_processor_name,
    data_processor_contact,
    data_sharing_third_parties,
    international_transfer,
    international_transfer_countries,
    retention_period_months,
    retention_criteria,
    deletion_procedure,
    security_measures,
    technical_measures,
    organizational_measures,
    responsible_area,
    responsible_person_id,
    status,
    next_review_date,
    created_by,
    updated_by
)
SELECT 
    nome,
    descricao,
    finalidade,
    categorias_dados,
    tipos_dados,
    categorias_titulares,
    lb.id,
    justificativa_base_legal,
    controlador_nome,
    controlador_contato,
    operador_nome,
    operador_contato,
    terceiros,
    transferencia_internacional,
    paises_transferencia,
    periodo_retencao,
    criterio_retencao,
    procedimento_exclusao,
    medidas_seguranca,
    medidas_tecnicas,
    medidas_organizacionais,
    area_responsavel,
    (SELECT first_user FROM user_ids),
    status_atividade,
    (CURRENT_DATE + INTERVAL '12 months')::date,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    (
        'Gestão de Relacionamento com Clientes',
        'Tratamento de dados pessoais para prestação de serviços e gestão do relacionamento comercial',
        'Prestação de serviços contratados e manutenção do relacionamento comercial',
        ARRAY['identificacao', 'contato', 'financeiro'],
        ARRAY['nome', 'cpf', 'email', 'telefone'],
        ARRAY['clientes', 'prospects'],
        'Execução de Contrato - Serviços',
        'Dados necessários para execução dos serviços contratados e comunicação com clientes',
        'Empresa LTDA',
        'privacidade@empresa.com.br',
        'Processadora de Dados S/A',
        'contato@processadora.com.br',
        ARRAY['Empresa de Cobrança XYZ', 'Correios'],
        false,
        NULL,
        60,
        'Manutenção até 5 anos após encerramento do contrato para eventual necessidade de comprovação',
        'Exclusão automática após período de retenção, com log de auditoria',
        ARRAY['Criptografia AES-256', 'Controle de acesso baseado em perfis', 'Backup diário'],
        'Dados criptografados em repouso e em trânsito, acesso via VPN',
        'Treinamento periódico da equipe, políticas de segurança, controles de acesso',
        'Departamento Comercial',
        'active'
    ),
    (
        'Gestão de Recursos Humanos',
        'Administração de pessoal e cumprimento de obrigações trabalhistas e previdenciárias',
        'Gestão da relação de trabalho e cumprimento de obrigações legais',
        ARRAY['identificacao', 'profissional', 'financeiro'],
        ARRAY['nome', 'cpf', 'data_nascimento', 'endereco'],
        ARRAY['funcionarios', 'ex_funcionarios', 'candidatos'],
        'Obrigação Legal Trabalhista',
        'Cumprimento da CLT e legislação trabalhista e previdenciária',
        'Empresa LTDA',
        'privacidade@empresa.com.br',
        NULL,
        NULL,
        ARRAY['INSS', 'Receita Federal', 'Sindicatos'],
        false,
        NULL,
        180,
        'Manutenção por 15 anos após desligamento conforme legislação trabalhista',
        'Arquivamento físico após período legal, destruição após aprovação jurídica',
        ARRAY['Controle de acesso restrito', 'Cofre físico para documentos', 'Sistema com auditoria'],
        'Sistema RH com logs de auditoria, backup seguro',
        'Acesso restrito ao RH, capacitação em LGPD, controle de documentos',
        'Recursos Humanos',
        'active'
    ),
    (
        'Marketing Digital e Comunicação',
        'Envio de comunicações promocionais e análise de efetividade de campanhas',
        'Divulgação de produtos e serviços e análise de efetividade do marketing',
        ARRAY['contato', 'comportamental'],
        ARRAY['email', 'telefone', 'preferencias'],
        ARRAY['clientes', 'prospects', 'leads'],
        'Consentimento para Marketing',
        'Titular forneceu consentimento específico para recebimento de comunicações',
        'Empresa LTDA',
        'privacidade@empresa.com.br',
        'Agência de Marketing Digital',
        'lgpd@agenciamarketing.com.br',
        ARRAY['Plataforma de E-mail Marketing', 'Google Analytics'],
        true,
        ARRAY['Estados Unidos'],
        36,
        'Manutenção até revogação do consentimento ou 3 anos sem interação',
        'Exclusão automática dos sistemas e notificação ao titular',
        ARRAY['Opt-out em todas as comunicações', 'Criptografia de dados', 'Acesso logado'],
        'Sistemas com certificação ISO 27001, dados pseudonimizados quando possível',
        'Política de consentimento clara, treinamento em marketing responsável',
        'Marketing',
        'active'
    )
) AS atividades(nome, descricao, finalidade, categorias_dados, tipos_dados, categorias_titulares, base_legal_nome, justificativa_base_legal, controlador_nome, controlador_contato, operador_nome, operador_contato, terceiros, transferencia_internacional, paises_transferencia, periodo_retencao, criterio_retencao, procedimento_exclusao, medidas_seguranca, medidas_tecnicas, medidas_organizacionais, area_responsavel, status_atividade)
JOIN legal_bases lb ON lb.name = atividades.base_legal_nome;

-- ============================================================================
-- 6. CONSENTIMENTOS
-- ============================================================================
INSERT INTO consents (
    data_subject_email,
    data_subject_name,
    data_subject_document,
    purpose,
    data_categories,
    legal_basis_id,
    status,
    granted_at,
    revoked_at,
    expired_at,
    collection_method,
    collection_source,
    evidence_url,
    is_informed,
    is_specific,
    is_free,
    is_unambiguous,
    privacy_policy_version,
    terms_of_service_version,
    language
)
SELECT 
    email,
    nome,
    documento,
    finalidade,
    categorias,
    (SELECT id FROM legal_bases WHERE name = 'Consentimento para Marketing' LIMIT 1),
    status_consentimento,
    concedido_em,
    revogado_em,
    expira_em,
    metodo_coleta,
    fonte_coleta,
    evidencia,
    informado,
    especifico,
    livre,
    inequivoco,
    versao_politica,
    versao_termos,
    idioma
FROM (VALUES
    ('cliente1@email.com', 'João da Silva Santos', '12345678901', 'Recebimento de ofertas e promoções por email', ARRAY['contato'], 'granted', NOW() - INTERVAL '30 days', NULL, NOW() + INTERVAL '2 years', 'website_form', 'https://www.empresa.com.br/newsletter', 'https://evidencias.empresa.com.br/consent/001', true, true, true, true, '2.1', '1.8', 'pt-BR'),
    ('maria.oliveira@email.com', 'Maria Oliveira Costa', '98765432109', 'Marketing personalizado e comunicações promocionais', ARRAY['contato', 'comportamental'], 'granted', NOW() - INTERVAL '15 days', NULL, NOW() + INTERVAL '2 years', 'mobile_app', 'App Empresa Mobile v2.3', NULL, true, true, true, true, '2.1', '1.8', 'pt-BR'),
    ('pedro.souza@email.com', 'Pedro Souza Lima', '11122233344', 'Newsletter semanal e ofertas especiais', ARRAY['contato'], 'revoked', NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days', NULL, 'website_form', 'https://www.empresa.com.br/contato', 'https://evidencias.empresa.com.br/consent/003', true, true, true, true, '2.0', '1.7', 'pt-BR'),
    ('ana.ferreira@email.com', 'Ana Ferreira Rodrigues', '55566677788', 'Comunicações sobre produtos e serviços', ARRAY['contato'], 'granted', NOW() - INTERVAL '90 days', NULL, NOW() + INTERVAL '1 year', 'email', 'Campanha Email Marketing Set/2024', NULL, true, true, true, true, '2.1', '1.8', 'pt-BR'),
    ('carlos.mendes@email.com', 'Carlos Mendes Pereira', '99988877766', 'Ofertas personalizadas baseadas em histórico', ARRAY['contato', 'comportamental'], 'granted', NOW() - INTERVAL '120 days', NULL, NOW() + INTERVAL '2 years', 'phone_call', 'Telemarketing Ativo', NULL, true, true, false, true, '2.0', '1.7', 'pt-BR'),
    ('lucia.santos@email.com', 'Lucia Santos Almeida', '33344455566', 'Newsletter e comunicações institucionais', ARRAY['contato'], 'expired', NOW() - INTERVAL '800 days', NULL, NOW() - INTERVAL '30 days', 'website_form', 'Site antigo (descontinuado)', NULL, true, true, true, true, '1.5', '1.2', 'pt-BR'),
    ('roberto.silva@email.com', 'Roberto Silva Nunes', '77788899900', 'Promoções e descontos exclusivos', ARRAY['contato'], 'granted', NOW() - INTERVAL '180 days', NULL, NOW() + INTERVAL '18 months', 'api', 'Integração Sistema Terceiro', NULL, true, true, true, true, '2.1', '1.8', 'pt-BR'),
    ('fernanda.costa@email.com', 'Fernanda Costa Barbosa', '12312312312', 'Marketing por email e SMS', ARRAY['contato'], 'pending', NOW() - INTERVAL '2 days', NULL, NULL, 'import', 'Importação Lista Externa', NULL, false, true, true, false, '2.1', '1.8', 'pt-BR')
) AS consentimentos(email, nome, documento, finalidade, categorias, status_consentimento, concedido_em, revogado_em, expira_em, metodo_coleta, fonte_coleta, evidencia, informado, especifico, livre, inequivoco, versao_politica, versao_termos, idioma);

-- ============================================================================
-- 7. DPIAs (DATA PROTECTION IMPACT ASSESSMENT)
-- ============================================================================
INSERT INTO dpia_assessments (
    title,
    description,
    processing_activity_id,
    involves_high_risk,
    involves_sensitive_data,
    involves_large_scale,
    involves_profiling,
    involves_automated_decisions,
    involves_vulnerable_individuals,
    involves_new_technology,
    dpia_required,
    dpia_justification,
    privacy_risks,
    risk_level,
    likelihood_assessment,
    impact_assessment,
    mitigation_measures,
    residual_risk_level,
    anpd_consultation_required,
    conducted_by,
    reviewed_by,
    status,
    started_at,
    created_by,
    updated_by
)
SELECT 
    titulo,
    descricao,
    pa.id,
    alto_risco,
    dados_sensiveis,
    grande_escala,
    perfilamento,
    decisoes_automatizadas,
    individuos_vulneraveis,
    nova_tecnologia,
    dpia_obrigatoria,
    justificativa,
    riscos_privacidade,
    nivel_risco,
    avaliacao_probabilidade,
    avaliacao_impacto,
    medidas_mitigacao,
    risco_residual,
    consulta_anpd,
    (SELECT first_user FROM user_ids),
    (SELECT second_user FROM user_ids),
    status_dpia,
    inicio,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    (
        'DPIA - Sistema de CRM com IA',
        'Avaliação do novo sistema de CRM que utiliza inteligência artificial para perfilamento de clientes',
        'Gestão de Relacionamento com Clientes',
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        'Sistema envolve tratamento em grande escala, perfilamento automatizado e nova tecnologia de IA',
        ARRAY['Perfilamento inadequado de clientes', 'Decisões automatizadas discriminatórias', 'Vazamento de dados por vulnerabilidade de IA'],
        'high',
        4,
        4,
        ARRAY['Revisão humana de decisões automatizadas', 'Auditoria regular do algoritmo', 'Criptografia avançada', 'Controles de acesso granulares'],
        'medium',
        false,
        'approved',
        NOW() - INTERVAL '60 days'
    ),
    (
        'DPIA - Monitoramento de Funcionários',
        'Análise de impacto para sistema de monitoramento eletrônico de atividades dos funcionários',
        'Gestão de Recursos Humanos',
        true,
        true,
        false,
        false,
        false,
        true,
        false,
        true,
        'Monitoramento contínuo de funcionários pode gerar alto impacto na privacidade',
        ARRAY['Monitoramento excessivo', 'Impacto psicológico nos funcionários', 'Uso inadequado das informações coletadas'],
        'high',
        3,
        5,
        ARRAY['Política clara de monitoramento', 'Limitação do escopo de coleta', 'Transparência total com funcionários', 'Revisão periódica da necessidade'],
        'low',
        true,
        'pending_approval',
        NOW() - INTERVAL '30 days'
    ),
    (
        'DPIA - Plataforma de Marketing Comportamental',
        'Avaliação para implementação de plataforma que analisa comportamento online para marketing direcionado',
        'Marketing Digital e Comunicação',
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        'Envolve perfilamento comportamental em larga escala e decisões automatizadas de marketing',
        ARRAY['Perfilamento invasivo', 'Falta de transparência nos algoritmos', 'Dificuldade de exercício de direitos pelo titular'],
        'medium',
        3,
        3,
        ARRAY['Interface clara para opt-out', 'Dashboard de transparência para o titular', 'Revisão humana periódica', 'Pseudonimização dos dados'],
        'low',
        false,
        'in_progress',
        NOW() - INTERVAL '15 days'
    )
) AS dpias(titulo, descricao, atividade_nome, alto_risco, dados_sensiveis, grande_escala, perfilamento, decisoes_automatizadas, individuos_vulneraveis, nova_tecnologia, dpia_obrigatoria, justificativa, riscos_privacidade, nivel_risco, avaliacao_probabilidade, avaliacao_impacto, medidas_mitigacao, risco_residual, consulta_anpd, status_dpia, inicio)
JOIN processing_activities pa ON pa.name = dpias.atividade_nome;

-- ============================================================================
-- 8. SOLICITAÇÕES DE TITULARES
-- ============================================================================
INSERT INTO data_subject_requests (
    requester_name,
    requester_email,
    requester_document,
    requester_phone,
    request_type,
    request_description,
    specific_data_requested,
    data_categories,
    identity_verified,
    verification_method,
    verified_by,
    verified_at,
    status,
    assigned_to,
    due_date,
    response,
    response_method,
    responded_at,
    responded_by,
    internal_notes,
    escalated,
    received_at
)
SELECT 
    nome_requerente,
    email_requerente,
    documento_requerente,
    telefone_requerente,
    tipo_solicitacao,
    descricao_solicitacao,
    dados_especificos,
    categorias_dados,
    identidade_verificada,
    metodo_verificacao,
    (SELECT first_user FROM user_ids),
    verificado_em,
    status_solicitacao,
    (SELECT second_user FROM user_ids),
    prazo_resposta,
    resposta,
    metodo_resposta,
    respondido_em,
    (SELECT first_user FROM user_ids),
    notas_internas,
    escalado,
    recebido_em
FROM (VALUES
    (
        'João da Silva Santos',
        'joao.silva@email.com',
        '12345678901',
        '(11) 98765-4321',
        'acesso',
        'Solicito acesso a todos os meus dados pessoais tratados pela empresa',
        'Todos os dados cadastrais, histórico de compras e comunicações',
        ARRAY['identificacao', 'contato', 'financeiro'],
        true,
        'document_upload',
        NOW() - INTERVAL '25 days',
        'completed',
        (CURRENT_DATE - INTERVAL '28 days')::date + INTERVAL '15 days',
        'Dados fornecidos conforme solicitado via portal do titular. Incluídos: dados cadastrais, histórico de transações dos últimos 2 anos e log de comunicações.',
        'portal',
        NOW() - INTERVAL '18 days',
        'Processamento padrão conforme procedimento LGPD',
        false,
        NOW() - INTERVAL '28 days'
    ),
    (
        'Maria Oliveira Costa',
        'maria.oliveira@email.com',
        '98765432109',
        '(11) 91234-5678',
        'correcao',
        'Preciso corrigir meu endereço cadastrado no sistema',
        'Endereço residencial atual',
        ARRAY['localizacao'],
        true,
        'email_confirmation',
        NOW() - INTERVAL '8 days',
        'completed',
        (CURRENT_DATE - INTERVAL '10 days')::date + INTERVAL '15 days',
        'Endereço atualizado com sucesso no sistema. Confirmação enviada por email.',
        'email',
        NOW() - INTERVAL '5 days',
        'Correção simples, processada diretamente pelo atendimento',
        false,
        NOW() - INTERVAL '10 days'
    ),
    (
        'Pedro Souza Lima',
        'pedro.souza@email.com',
        '11122233344',
        '(11) 95555-1234',
        'eliminacao',
        'Desejo que todos os meus dados sejam excluídos dos sistemas da empresa',
        'Todos os dados pessoais incluindo backup',
        ARRAY['identificacao', 'contato', 'financeiro', 'comportamental'],
        true,
        'video_call',
        NOW() - INTERVAL '5 days',
        'in_progress',
        (CURRENT_DATE - INTERVAL '7 days')::date + INTERVAL '15 days',
        NULL,
        NULL,
        NULL,
        'Análise jurídica necessária devido a obrigações contratuais em vigor',
        false,
        NOW() - INTERVAL '7 days'
    ),
    (
        'Ana Ferreira Rodrigues',
        'ana.ferreira@email.com',
        '55566677788',
        '(11) 94444-9876',
        'portabilidade',
        'Solicito a portabilidade dos meus dados em formato estruturado',
        'Dados cadastrais e histórico de uso dos serviços',
        ARRAY['identificacao', 'comportamental'],
        false,
        NULL,
        NULL,
        'under_verification',
        (CURRENT_DATE - INTERVAL '3 days')::date + INTERVAL '15 days',
        NULL,
        NULL,
        NULL,
        'Aguardando documentos adicionais para verificação de identidade',
        false,
        NOW() - INTERVAL '3 days'
    ),
    (
        'Carlos Mendes Pereira',
        'carlos.mendes@email.com',
        '99988877766',
        '(11) 93333-5555',
        'revogacao_consentimento',
        'Desejo revogar meu consentimento para recebimento de comunicações de marketing',
        'Consentimento para marketing e promoções',
        ARRAY['contato'],
        true,
        'phone_verification',
        NOW() - INTERVAL '1 day',
        'completed',
        (CURRENT_DATE - INTERVAL '2 days')::date + INTERVAL '15 days',
        'Consentimento revogado com sucesso. O titular foi removido de todas as listas de comunicação de marketing.',
        'email',
        NOW() - INTERVAL '1 day',
        'Processamento automático via sistema de opt-out',
        false,
        NOW() - INTERVAL '2 days'
    ),
    (
        'Lucia Santos Almeida',
        'lucia.santos@email.com',
        '33344455566',
        '(11) 92222-7777',
        'informacao_uso_compartilhamento',
        'Gostaria de saber com quem meus dados são compartilhados e para quais finalidades',
        'Informações sobre compartilhamento com terceiros',
        ARRAY['identificacao', 'contato'],
        true,
        'document_upload',
        NOW() - INTERVAL '20 days',
        'overdue',
        (CURRENT_DATE - INTERVAL '22 days')::date + INTERVAL '15 days',
        NULL,
        NULL,
        NULL,
        'URGENTE: Solicitação vencida há 7 dias. Escalar para supervisor.',
        true,
        NOW() - INTERVAL '22 days'
    ),
    (
        'Roberto Silva Nunes',
        'roberto.silva@email.com',
        '77788899900',
        '(11) 91111-8888',
        'oposicao',
        'Me oponho ao tratamento dos meus dados para finalidades de marketing direto',
        'Dados utilizados para marketing e prospecção',
        ARRAY['contato', 'comportamental'],
        true,
        'in_person',
        NOW() - INTERVAL '12 days',
        'completed',
        (CURRENT_DATE - INTERVAL '14 days')::date + INTERVAL '15 days',
        'Oposição registrada. Dados removidos dos sistemas de marketing direto conforme solicitado.',
        'mail',
        NOW() - INTERVAL '8 days',
        'Cliente compareceu pessoalmente. Processo documentado em ata.',
        false,
        NOW() - INTERVAL '14 days'
    ),
    (
        'Fernanda Costa Barbosa',
        'fernanda.costa@email.com',
        '12312312312',
        '(11) 90000-9999',
        'revisao_decisoes_automatizadas',
        'Contesto a decisão automatizada que negou meu crédito',
        'Algoritmo de análise de crédito e score',
        ARRAY['financeiro', 'comportamental'],
        true,
        'digital_certificate',
        NOW() - INTERVAL '6 days',
        'escalated',
        (CURRENT_DATE - INTERVAL '8 days')::date + INTERVAL '15 days',
        NULL,
        NULL,
        NULL,
        'Caso complexo. Encaminhado para equipe especializada em revisão de algoritmos.',
        true,
        NOW() - INTERVAL '8 days'
    )
) AS solicitacoes(nome_requerente, email_requerente, documento_requerente, telefone_requerente, tipo_solicitacao, descricao_solicitacao, dados_especificos, categorias_dados, identidade_verificada, metodo_verificacao, verificado_em, status_solicitacao, prazo_resposta, resposta, metodo_resposta, respondido_em, notas_internas, escalado, recebido_em);

-- ============================================================================
-- 9. INCIDENTES DE PRIVACIDADE
-- ============================================================================
INSERT INTO privacy_incidents (
    title,
    description,
    incident_type,
    severity_level,
    affected_data_categories,
    estimated_affected_individuals,
    discovered_at,
    discovered_by,
    occurred_at,
    contained_at,
    root_cause,
    incident_source,
    impact_description,
    financial_impact,
    containment_measures,
    investigation_findings,
    corrective_actions,
    internal_notification_sent,
    internal_notified_at,
    anpd_notification_required,
    anpd_notified,
    anpd_notification_date,
    data_subjects_notification_required,
    data_subjects_notified,
    data_subjects_notification_date,
    notification_method,
    incident_manager_id,
    dpo_id,
    legal_team_notified,
    status,
    created_by,
    updated_by
)
SELECT 
    titulo,
    descricao,
    tipo_incidente,
    severidade,
    categorias_afetadas,
    individuos_afetados,
    descoberto_em,
    (SELECT first_user FROM user_ids),
    ocorreu_em,
    contido_em,
    causa_raiz,
    fonte_incidente,
    descricao_impacto,
    impacto_financeiro,
    medidas_contencao,
    resultados_investigacao,
    acoes_corretivas,
    notificacao_interna_enviada,
    notificado_internamente_em,
    notificacao_anpd_obrigatoria,
    anpd_notificada,
    data_notificacao_anpd,
    notificacao_titulares_obrigatoria,
    titulares_notificados,
    data_notificacao_titulares,
    metodo_notificacao,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids),
    time_juridico_notificado,
    status_incidente,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    (
        'Vazamento de Email de Clientes - Configuração SMTP',
        'Configuração incorreta do servidor SMTP permitiu acesso não autorizado a base de emails de clientes',
        'data_breach',
        'medium',
        ARRAY['contato'],
        1200,
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '16 days',
        NOW() - INTERVAL '10 days',
        'Configuração incorreta do servidor de email permitiu acesso externo não autorizado',
        'Sistema de Email',
        'Exposição de lista de emails de clientes ativos, sem exposição de outros dados pessoais',
        5000.00,
        ARRAY['Correção imediata da configuração SMTP', 'Alteração de senhas de acesso', 'Auditoria completa dos logs de acesso'],
        'Configuração padrão não foi alterada durante migração do servidor. Acesso não autorizado durou aproximadamente 6 dias.',
        ARRAY['Implementação de checklist para configurações de segurança', 'Revisão de todos os servidores similares', 'Treinamento da equipe de TI'],
        true,
        NOW() - INTERVAL '15 days',
        false,
        false,
        NULL,
        true,
        true,
        NOW() - INTERVAL '12 days',
        'email',
        true,
        'resolved'
    ),
    (
        'Acesso Não Autorizado - Sistema RH',
        'Funcionário terceirizado acessou dados de outros funcionários além de sua alçada',
        'unauthorized_access',
        'high',
        ARRAY['identificacao', 'profissional', 'financeiro'],
        45,
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '9 days',
        NOW() - INTERVAL '7 days',
        'Falha no controle de acesso baseado em perfil permitiu acesso a dados de outros departamentos',
        'Sistema RH',
        'Acesso não autorizado a dados pessoais de 45 funcionários incluindo salários e informações pessoais',
        15000.00,
        ARRAY['Suspensão imediata dos acessos do usuário', 'Revisão de todos os perfis de acesso', 'Auditoria das atividades do usuário'],
        'Perfil de acesso configurado incorretamente durante integração do sistema. Acesso inadequado por aproximadamente 2 dias.',
        ARRAY['Revisão completa da matriz de acesso', 'Implementação de auditoria contínua', 'Treinamento sobre controles de acesso'],
        true,
        NOW() - INTERVAL '8 days',
        true,
        false,
        NULL,
        true,
        false,
        NULL,
        NULL,
        true,
        'investigating'
    ),
    (
        'Perda de Backup com Dados Pessoais',
        'HD externo contendo backup de dados de clientes foi perdido durante transporte',
        'data_loss',
        'high',
        ARRAY['identificacao', 'contato', 'financeiro'],
        8500,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '20 days',
        'HD externo não criptografado perdido durante mudança de escritório',
        'Processo de Backup',
        'Perda de backup contendo dados pessoais de 8.500 clientes sem criptografia adequada',
        25000.00,
        ARRAY['Cancelamento imediato do backup perdido', 'Implementação de criptografia obrigatória', 'Revisão de todos os processos de backup'],
        'Backup realizado em mídia não criptografada contrariando política interna. Processo de transporte não seguiu procedimentos de segurança.',
        ARRAY['Criptografia obrigatória para todos os backups', 'Procedimento formal para transporte de mídias', 'Auditoria mensal dos processos de backup'],
        true,
        NOW() - INTERVAL '25 days',
        true,
        true,
        NOW() - INTERVAL '22 days',
        true,
        true,
        NOW() - INTERVAL '20 days',
        'mail',
        true,
        'closed'
    ),
    (
        'Ataque de Phishing - Credenciais Comprometidas',
        'Funcionários tiveram credenciais comprometidas via ataque de phishing direcionado',
        'phishing',
        'critical',
        ARRAY['identificacao', 'contato'],
        25000,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '4 days',
        NULL,
        'Ataque de phishing direcionado comprometeu credenciais de 3 funcionários com acesso a dados de clientes',
        'Ataque Externo',
        'Possível acesso não autorizado a base completa de clientes via credenciais comprometidas',
        50000.00,
        ARRAY['Alteração imediata de todas as senhas comprometidas', 'Implementação de autenticação multifator obrigatória', 'Monitoramento reforçado de acessos'],
        'Investigação em andamento. Evidências de acesso não autorizado aos sistemas de CRM.',
        ARRAY['MFA obrigatório para todos os usuários', 'Treinamento anti-phishing reforçado', 'Implementação de solução anti-phishing'],
        true,
        NOW() - INTERVAL '3 days',
        true,
        false,
        NULL,
        false,
        false,
        NULL,
        NULL,
        true,
        'open'
    )
) AS incidentes(titulo, descricao, tipo_incidente, severidade, categorias_afetadas, individuos_afetados, descoberto_em, ocorreu_em, contido_em, causa_raiz, fonte_incidente, descricao_impacto, impacto_financeiro, medidas_contencao, resultados_investigacao, acoes_corretivas, notificacao_interna_enviada, notificado_internamente_em, notificacao_anpd_obrigatoria, anpd_notificada, data_notificacao_anpd, notificacao_titulares_obrigatoria, titulares_notificados, data_notificacao_titulares, metodo_notificacao, time_juridico_notificado, status_incidente);

-- ============================================================================
-- 10. TREINAMENTOS DE PRIVACIDADE
-- ============================================================================
INSERT INTO privacy_training (
    title,
    description,
    training_type,
    target_audience,
    content_topics,
    training_materials,
    duration_hours,
    participant_id,
    instructor_id,
    scheduled_date,
    completed_date,
    completion_method,
    assessment_score,
    certification_issued,
    certificate_url,
    certificate_valid_until,
    status,
    created_by,
    updated_by
)
SELECT 
    titulo,
    descricao,
    tipo_treinamento,
    publico_alvo,
    topicos_conteudo,
    materiais_treinamento,
    duracao_horas,
    u.id as participant_id,
    (SELECT first_user FROM user_ids) as instructor_id,
    agendado_para,
    completado_em,
    metodo_conclusao,
    pontuacao_avaliacao,
    certificacao_emitida,
    url_certificado,
    certificado_valido_ate,
    status_treinamento,
    (SELECT first_user FROM user_ids),
    (SELECT first_user FROM user_ids)
FROM (VALUES
    (
        'LGPD Fundamentals - Introdução Geral',
        'Curso introdutório sobre os princípios fundamentais da Lei Geral de Proteção de Dados',
        'lgpd_awareness',
        ARRAY['todos_funcionarios', 'novos_contratados'],
        ARRAY['Princípios da LGPD', 'Direitos dos titulares', 'Bases legais', 'Penalidades'],
        ARRAY['Presentation LGPD v2.1.pdf', 'Video Aula LGPD.mp4', 'Quiz Interativo'],
        4.0,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '25 days',
        'online',
        87,
        true,
        'https://certificados.empresa.com.br/lgpd/001',
        (CURRENT_DATE + INTERVAL '1 year')::date,
        'completed'
    ),
    (
        'Data Protection Officer - Certificação',
        'Curso avançado para certificação de Encarregados de Proteção de Dados',
        'dpo_certification',
        ARRAY['encarregados_dados', 'lideranca'],
        ARRAY['Responsabilidades do DPO', 'Gestão de incidentes', 'Auditoria de compliance', 'Relacionamento com ANPD'],
        ARRAY['Manual DPO v3.0.pdf', 'Cases Práticos.docx', 'Simulador ANPD'],
        16.0,
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '40 days',
        'classroom',
        92,
        true,
        'https://certificados.empresa.com.br/dpo/001',
        (CURRENT_DATE + INTERVAL '2 years')::date,
        'completed'
    ),
    (
        'Privacidade by Design para Desenvolvedores',
        'Treinamento técnico sobre implementação de privacidade desde o projeto',
        'technical_privacy',
        ARRAY['desenvolvedores', 'arquitetos_sistemas'],
        ARRAY['Privacy by Design', 'Criptografia', 'Minimização de dados', 'Pseudonimização'],
        ARRAY['Guia Técnico LGPD.pdf', 'Exemplos de Código', 'Ferramentas de Auditoria'],
        8.0,
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '55 days',
        'workshop',
        89,
        true,
        'https://certificados.empresa.com.br/tech/001',
        (CURRENT_DATE + INTERVAL '1 year')::date,
        'completed'
    ),
    (
        'Resposta a Incidentes de Privacidade',
        'Procedimentos para identificação, contenção e comunicação de incidentes',
        'incident_response',
        ARRAY['equipe_seguranca', 'gestores'],
        ARRAY['Identificação de incidentes', 'Contenção e investigação', 'Comunicação ANPD', 'Comunicação aos titulares'],
        ARRAY['Playbook Incidentes v1.2.pdf', 'Checklist Resposta.docx'],
        6.0,
        NOW() + INTERVAL '15 days',
        NULL,
        'video_conference',
        NULL,
        false,
        NULL,
        NULL,
        'scheduled'
    )
) AS treinamentos(titulo, descricao, tipo_treinamento, publico_alvo, topicos_conteudo, materiais_treinamento, duracao_horas, agendado_para, completado_em, metodo_conclusao, pontuacao_avaliacao, certificacao_emitida, url_certificado, certificado_valido_ate, status_treinamento)
CROSS JOIN (SELECT id FROM auth.users ORDER BY created_at LIMIT 4) u;

-- ============================================================================
-- FINALIZAÇÃO E VERIFICAÇÃO
-- ============================================================================

-- Exibir resumo dos dados inseridos
SELECT 
    'RESUMO DOS DADOS DE TESTE INSERIDOS:' as info,
    '' as espacamento
UNION ALL
SELECT 
    '📊 Fontes de Discovery: ' || COUNT(*)::text,
    ''
FROM data_discovery_sources
UNION ALL
SELECT 
    '🔍 Resultados de Discovery: ' || COUNT(*)::text,
    ''
FROM data_discovery_results
UNION ALL
SELECT 
    '📋 Inventário de Dados: ' || COUNT(*)::text,
    ''
FROM data_inventory
UNION ALL
SELECT 
    '⚖️  Bases Legais: ' || COUNT(*)::text,
    ''
FROM legal_bases
UNION ALL
SELECT 
    '✅ Consentimentos: ' || COUNT(*)::text,
    ''
FROM consents
UNION ALL
SELECT 
    '📄 Atividades de Tratamento: ' || COUNT(*)::text,
    ''
FROM processing_activities
UNION ALL
SELECT 
    '🛡️  DPIAs: ' || COUNT(*)::text,
    ''
FROM dpia_assessments
UNION ALL
SELECT 
    '📝 Solicitações de Titulares: ' || COUNT(*)::text,
    ''
FROM data_subject_requests
UNION ALL
SELECT 
    '🚨 Incidentes de Privacidade: ' || COUNT(*)::text,
    ''
FROM privacy_incidents
UNION ALL
SELECT 
    '📚 Treinamentos: ' || COUNT(*)::text,
    ''
FROM privacy_training
UNION ALL
SELECT 
    '',
    '🎉 DADOS DE TESTE INSERIDOS COM SUCESSO!';