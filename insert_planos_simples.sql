-- Inserir planos de ação fictícios para teste do relatório de seguimento
-- Assumindo que existe um projeto de auditoria

INSERT INTO planos_acao (
    id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
    responsavel, prazo, status, prioridade, percentual_conclusao,
    custo, progresso, created_by, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    proj.id,
    'PA-001',
    'Implementação de Autenticação Multifator (MFA)',
    'Implementar sistema de autenticação de dois fatores para todos os usuários administrativos',
    'Fortalecer a segurança de acesso aos sistemas críticos',
    'Carlos Oliveira - Coordenador de TI',
    '2024-02-28',
    'concluido',
    'alta',
    100,
    15000.00,
    'Implementação concluída com sucesso. Sistema MFA operacional em todos os ambientes críticos.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '5 days'
FROM projetos_auditoria proj 
WHERE proj.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
LIMIT 1;

INSERT INTO planos_acao (
    id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
    responsavel, prazo, status, prioridade, percentual_conclusao,
    custo, progresso, created_by, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    proj.id,
    'PA-002',
    'Atualização de Políticas de Backup',
    'Revisar e atualizar as políticas de backup e recuperação de dados',
    'Assegurar conformidade com requisitos regulatórios',
    'Ana Costa - Especialista em Infraestrutura',
    '2024-03-30',
    'em_andamento',
    'media',
    65,
    8000.00,
    'Políticas revisadas e aprovadas. Implementação em andamento nos servidores de produção.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
FROM projetos_auditoria proj 
WHERE proj.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
LIMIT 1;

INSERT INTO planos_acao (
    id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
    responsavel, prazo, status, prioridade, percentual_conclusao,
    custo, progresso, created_by, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    proj.id,
    'PA-003',
    'Segregação de Ambientes de Desenvolvimento',
    'Implementar segregação adequada entre ambientes de desenvolvimento, teste e produção',
    'Reduzir riscos de alterações não autorizadas em ambiente produtivo',
    'Roberto Lima - Arquiteto DevOps',
    '2024-04-15',
    'em_andamento',
    'alta',
    40,
    25000.00,
    'Ambiente de desenvolvimento segregado. Trabalhando na segregação do ambiente de teste.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '1 day'
FROM projetos_auditoria proj 
WHERE proj.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
LIMIT 1;

INSERT INTO planos_acao (
    id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
    responsavel, prazo, status, prioridade, percentual_conclusao,
    custo, progresso, created_by, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    proj.id,
    'PA-004',
    'Implementação de Sistema de Log Centralizado',
    'Implementar sistema centralizado de coleta e análise de logs de segurança',
    'Melhorar capacidade de detecção e resposta a incidentes',
    'Fernanda Silva - Analista de Segurança',
    '2024-05-30',
    'pendente',
    'media',
    0,
    35000.00,
    'Aguardando aprovação orçamentária para aquisição da solução de SIEM.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 day'
FROM projetos_auditoria proj 
WHERE proj.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
LIMIT 1;

INSERT INTO planos_acao (
    id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
    responsavel, prazo, status, prioridade, percentual_conclusao,
    custo, progresso, created_by, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    proj.id,
    'PA-005',
    'Treinamento em Segurança da Informação',
    'Realizar treinamento obrigatório em segurança da informação para todos os colaboradores',
    'Aumentar conscientização sobre riscos de segurança',
    'Luciana Pereira - Coordenadora de RH',
    '2024-03-15',
    'concluido',
    'baixa',
    100,
    12000.00,
    'Treinamento concluído com 98% de participação. Avaliações finais aplicadas.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '10 days'
FROM projetos_auditoria proj 
WHERE proj.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
LIMIT 1;

INSERT INTO planos_acao (
    id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
    responsavel, prazo, status, prioridade, percentual_conclusao,
    custo, progresso, created_by, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    proj.id,
    'PA-006',
    'Revisão de Privilégios de Acesso',
    'Realizar revisão completa dos privilégios de acesso aos sistemas críticos',
    'Assegurar que usuários possuam apenas os acessos necessários',
    'Paulo Santos - Especialista em Segurança',
    '2024-04-30',
    'pendente',
    'alta',
    0,
    5000.00,
    'Aguardando definição de cronograma com as áreas de negócio.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '5 days',
    NOW()
FROM projetos_auditoria proj 
WHERE proj.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
LIMIT 1;