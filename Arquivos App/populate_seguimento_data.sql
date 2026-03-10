-- Script para popular dados fictícios completos para o relatório de seguimento
-- Tenant: GRC-Controller (46b1c048-85a1-423b-96fc-776007c8de1f)

DO $$
DECLARE
    tenant_id UUID := '46b1c048-85a1-423b-96fc-776007c8de1f';
    projeto_id UUID;
    user_id UUID := '00000000-0000-0000-0000-000000000001'; -- ID fictício para created_by
BEGIN
    -- Buscar ou criar projeto de auditoria
    SELECT id INTO projeto_id 
    FROM projetos_auditoria 
    WHERE tenant_id = tenant_id 
    LIMIT 1;
    
    -- Se não existir projeto, criar um
    IF projeto_id IS NULL THEN
        INSERT INTO projetos_auditoria (
            id, tenant_id, codigo, titulo, descricao, area_auditada,
            data_inicio, data_fim_prevista, status, auditor_lider,
            chefe_auditoria, created_by, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            tenant_id,
            'AUD-2024-001',
            'Auditoria de Controles Internos - Segurança da Informação',
            'Avaliação abrangente dos controles de segurança da informação e governança de TI',
            'Tecnologia da Informação',
            '2024-01-15',
            '2024-03-15',
            'em_andamento',
            'João Silva - Auditor Sênior',
            'Maria Santos - Gerente de Auditoria',
            user_id,
            NOW() - INTERVAL '60 days',
            NOW() - INTERVAL '1 day'
        ) RETURNING id INTO projeto_id;
    END IF;
    
    -- Limpar planos de ação existentes para este projeto
    DELETE FROM planos_acao WHERE projeto_id = projeto_id;
    
    -- Inserir planos de ação detalhados para o relatório de seguimento
    INSERT INTO planos_acao (
        id, tenant_id, projeto_id, codigo, titulo, descricao, objetivo,
        responsavel, prazo, status, prioridade, percentual_conclusao,
        custo, progresso, marcos, indicadores, status_detalhado,
        data_inicio, duracao, created_by, created_at, updated_at
    ) VALUES 
    
    -- PLANO 1 - CONCLUÍDO
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-001',
        'Implementação de Autenticação Multifator (MFA)',
        'Implementar sistema de autenticação de dois fatores para todos os usuários com acesso administrativo aos sistemas críticos da organização',
        'Fortalecer a segurança de acesso aos sistemas críticos, reduzindo riscos de acesso não autorizado e atendendo às melhores práticas de segurança',
        'Carlos Oliveira - Coordenador de TI',
        '2024-02-28',
        'concluido',
        'alta',
        100,
        15000.00,
        'Implementação concluída com sucesso. Sistema MFA operacional em todos os ambientes críticos. Todos os usuários administrativos foram migrados e treinados.',
        'Análise de requisitos técnicos, seleção de fornecedor, implementação em ambiente de teste, rollout em produção, treinamento de usuários, documentação de procedimentos',
        'Taxa de adoção: 100%, Redução de incidentes de segurança: 80%, Tempo médio de login: <30 segundos, Satisfação dos usuários: 8.5/10',
        'Sistema MFA totalmente implementado e operacional. Todos os 45 usuários administrativos estão utilizando autenticação de dois fatores. Políticas de segurança atualizadas.',
        '2024-01-20',
        '40 dias',
        user_id,
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '5 days'
    ),
    
    -- PLANO 2 - EM ANDAMENTO
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-002',
        'Atualização de Políticas de Backup e Recuperação',
        'Revisar e atualizar as políticas de backup e recuperação de dados para atender aos novos requisitos regulatórios e melhorar o RTO/RPO',
        'Assegurar conformidade com requisitos regulatórios de retenção de dados e melhorar a capacidade de recuperação em caso de incidentes',
        'Ana Costa - Especialista em Infraestrutura',
        '2024-03-30',
        'em_andamento',
        'media',
        65,
        8000.00,
        'Políticas revisadas e aprovadas pela diretoria. Implementação em andamento nos servidores de produção. Scripts de backup atualizados e em teste.',
        'Revisão de políticas existentes, análise de requisitos regulatórios, aprovação da diretoria, atualização de scripts, implementação em produção, testes de recuperação',
        'Tempo de backup: <4 horas, Taxa de sucesso: >99%, RTO: <2 horas, RPO: <1 hora, Conformidade regulatória: 100%',
        'Políticas atualizadas e aprovadas. Implementação 65% concluída. Testes de recuperação programados para próxima semana. Documentação em atualização.',
        '2024-02-01',
        '60 dias',
        user_id,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '2 days'
    ),
    
    -- PLANO 3 - EM ANDAMENTO
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-003',
        'Segregação de Ambientes de Desenvolvimento',
        'Implementar segregação adequada entre ambientes de desenvolvimento, teste e produção para reduzir riscos de alterações não autorizadas',
        'Reduzir riscos de alterações não autorizadas em ambiente produtivo e melhorar a qualidade dos deploys através de pipeline estruturado',
        'Roberto Lima - Arquiteto DevOps',
        '2024-04-15',
        'em_andamento',
        'alta',
        40,
        25000.00,
        'Ambiente de desenvolvimento completamente segregado. Trabalhando na segregação do ambiente de teste. Configuração de pipelines de CI/CD em andamento.',
        'Análise de arquitetura atual, criação de novos ambientes, migração de aplicações, configuração de controles de acesso, implementação de pipelines automatizados',
        'Ambientes isolados: 3, Controles de acesso implementados: 100%, Deploys automatizados: 80%, Redução de incidentes em produção: 60%',
        'Segregação de desenvolvimento 100% concluída. Ambiente de teste 70% configurado. Produção será o último ambiente a ser segregado conforme cronograma.',
        '2024-02-15',
        '60 dias',
        user_id,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '1 day'
    ),
    
    -- PLANO 4 - PENDENTE
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-004',
        'Implementação de Sistema de Log Centralizado (SIEM)',
        'Implementar sistema centralizado de coleta, análise e correlação de logs de segurança para melhorar a capacidade de detecção de ameaças',
        'Melhorar significativamente a capacidade de detecção e resposta a incidentes de segurança através de monitoramento proativo e análise de logs',
        'Fernanda Silva - Analista de Segurança',
        '2024-05-30',
        'pendente',
        'media',
        0,
        35000.00,
        'Aguardando aprovação orçamentária final para aquisição da solução de SIEM. Fornecedor selecionado e proposta técnica aprovada pelo comitê de TI.',
        'Levantamento de requisitos técnicos, análise de mercado, seleção de fornecedor, aprovação orçamentária, implementação da solução, configuração de regras, treinamento da equipe',
        'Logs centralizados: 100% dos sistemas críticos, Alertas configurados: >50 regras, Tempo de detecção: <15 minutos, Redução de falsos positivos: >80%',
        'Projeto em fase de aprovação orçamentária. Fornecedor Splunk selecionado. Proposta técnica aprovada. Aguardando liberação de recursos financeiros.',
        NULL,
        '90 dias',
        user_id,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '1 day'
    ),
    
    -- PLANO 5 - CONCLUÍDO
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-005',
        'Programa de Treinamento em Segurança da Informação',
        'Realizar programa abrangente de treinamento obrigatório em segurança da informação para todos os colaboradores da organização',
        'Aumentar a conscientização sobre riscos de segurança, promover boas práticas e reduzir incidentes causados por erro humano',
        'Luciana Pereira - Coordenadora de RH',
        '2024-03-15',
        'concluido',
        'baixa',
        100,
        12000.00,
        'Programa de treinamento concluído com excelente participação (98%). Avaliações finais aplicadas com média geral de 8.5/10. Certificados emitidos.',
        'Desenvolvimento de conteúdo personalizado, agendamento de turmas presenciais e online, execução do treinamento, aplicação de avaliações, emissão de certificados',
        'Participação: >95%, Nota média das avaliações: >8.0, Certificados emitidos: 100%, Redução de incidentes por erro humano: 45%',
        'Programa de treinamento concluído com sucesso. 142 colaboradores treinados e certificados. Material disponibilizado na intranet para consulta contínua.',
        '2024-02-20',
        '25 dias',
        user_id,
        NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '10 days'
    ),
    
    -- PLANO 6 - PENDENTE
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-006',
        'Revisão Completa de Privilégios de Acesso',
        'Realizar revisão abrangente dos privilégios de acesso aos sistemas críticos, aplicando o princípio do menor privilégio necessário',
        'Assegurar que todos os usuários possuam apenas os acessos estritamente necessários para suas funções, reduzindo a superfície de ataque',
        'Paulo Santos - Especialista em Segurança',
        '2024-04-30',
        'pendente',
        'alta',
        0,
        5000.00,
        'Aguardando definição de cronograma detalhado com as áreas de negócio para início da revisão. Metodologia de revisão já definida e aprovada.',
        'Inventário completo de sistemas, mapeamento de usuários e perfis, revisão de acessos por área, remoção de privilégios desnecessários, documentação de mudanças',
        'Usuários revisados: 100%, Privilégios desnecessários removidos: >20%, Conformidade com políticas: 100%, Redução de riscos de acesso: 70%',
        'Projeto em fase de planejamento detalhado. Aguardando alinhamento com gestores de área para definição de cronograma que minimize impacto operacional.',
        NULL,
        '45 dias',
        user_id,
        NOW() - INTERVAL '5 days',
        NOW()
    ),
    
    -- PLANO 7 - EM ANDAMENTO
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-007',
        'Implementação de Controles de Monitoramento de Rede',
        'Implementar solução de monitoramento contínuo de tráfego de rede para detecção de anomalias e atividades suspeitas',
        'Melhorar a visibilidade sobre o tráfego de rede e capacidade de detecção precoce de atividades maliciosas ou não autorizadas',
        'Ricardo Alves - Analista de Redes',
        '2024-04-20',
        'em_andamento',
        'media',
        30,
        18000.00,
        'Solução de monitoramento selecionada e adquirida. Instalação em andamento nos pontos críticos da rede. Configuração inicial realizada.',
        'Análise de requisitos de monitoramento, seleção de solução, aquisição e instalação, configuração de alertas, integração com SIEM, treinamento da equipe',
        'Pontos de monitoramento: 15 locais críticos, Alertas configurados: >30 tipos, Tempo de detecção: <5 minutos, Cobertura da rede: >90%',
        'Instalação 30% concluída. Equipamentos instalados em 5 dos 15 pontos críticos. Configuração de alertas em andamento. Integração com SIEM planejada.',
        '2024-03-01',
        '50 dias',
        user_id,
        NOW() - INTERVAL '20 days',
        NOW()
    ),
    
    -- PLANO 8 - CONCLUÍDO
    (
        gen_random_uuid(),
        tenant_id,
        projeto_id,
        'PA-008',
        'Atualização de Políticas de Senha e Controle de Acesso',
        'Atualizar e implementar novas políticas de senha mais robustas e controles de acesso baseados em risco',
        'Fortalecer a segurança de autenticação através de políticas de senha mais rigorosas e controles adaptativos de acesso',
        'Marcos Ferreira - Administrador de Sistemas',
        '2024-02-15',
        'concluido',
        'alta',
        100,
        3000.00,
        'Novas políticas implementadas em todos os sistemas. Migração de usuários concluída. Controles adaptativos configurados e operacionais.',
        'Revisão de políticas existentes, definição de novos critérios, implementação em sistemas, migração de usuários, configuração de controles adaptativos',
        'Complexidade de senhas: 100% conforme, Rotação automática: implementada, Controles adaptativos: ativos, Redução de tentativas de força bruta: 90%',
        'Políticas de senha atualizadas e implementadas com sucesso. Todos os 180 usuários migrados. Controles adaptativos detectando e bloqueando tentativas suspeitas.',
        '2024-01-25',
        '22 dias',
        user_id,
        NOW() - INTERVAL '40 days',
        NOW() - INTERVAL '15 days'
    );
    
    RAISE NOTICE 'Dados fictícios completos inseridos com sucesso para o projeto %', projeto_id;
    RAISE NOTICE 'Total de planos de ação criados: 8';
    RAISE NOTICE 'Status: 3 Concluídos, 3 Em Andamento, 2 Pendentes';
    
END $$;