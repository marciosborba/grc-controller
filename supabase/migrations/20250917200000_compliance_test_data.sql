-- =====================================================
-- DADOS DE TESTE PARA MÓDULO DE CONFORMIDADE
-- Criado em: 2025-09-17
-- Descrição: População completa com dados realistas para teste e QA
-- =====================================================

-- Variável do tenant para facilitar manutenção
DO $$
DECLARE
    tenant_uuid UUID := '46b1c048-85a1-423b-96fc-776007c8de1f';
    admin_user_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- Buscar usuários do tenant
    SELECT id INTO admin_user_id FROM profiles WHERE tenant_id = tenant_uuid ORDER BY created_at LIMIT 1;
    SELECT id INTO user1_id FROM profiles WHERE tenant_id = tenant_uuid ORDER BY created_at OFFSET 1 LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE tenant_id = tenant_uuid ORDER BY created_at OFFSET 2 LIMIT 1;
    SELECT id INTO user3_id FROM profiles WHERE tenant_id = tenant_uuid ORDER BY created_at OFFSET 3 LIMIT 1;
    
    -- Se não encontrar usuários suficientes, usar o admin para todos
    IF user1_id IS NULL THEN user1_id := admin_user_id; END IF;
    IF user2_id IS NULL THEN user2_id := admin_user_id; END IF;
    IF user3_id IS NULL THEN user3_id := admin_user_id; END IF;
    
    -- 1. FRAMEWORKS DE COMPLIANCE
    INSERT INTO frameworks_compliance (
        tenant_id, codigo, nome, descricao, tipo, origem, versao,
        categoria, subcategoria, nivel_aplicabilidade, jurisdicao,
        escopo_aplicacao, data_vigencia, data_atualizacao,
        url_referencia, tags, status,
        created_by, updated_by
    ) VALUES 
    (
        tenant_uuid, 'LGPD-2018', 'Lei Geral de Proteção de Dados',
        'Lei brasileira que regula as atividades de tratamento de dados pessoais e estabelece diretrizes para proteção da privacidade',
        'regulatorio', 'Lei Federal nº 13.709/2018', '1.0',
        'Privacidade e Proteção de Dados', 'Dados Pessoais', 'obrigatorio', 'Brasil',
        ARRAY['Todas as áreas', 'TI', 'Jurídico', 'RH'], '2020-09-18', '2024-01-01',
        'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
        ARRAY['privacidade', 'dados pessoais', 'consentimento', 'ANPD'], 'ativo',
        admin_user_id, admin_user_id
    ),
    (
        tenant_uuid, 'ISO27001-2022', 'ISO/IEC 27001:2022',
        'Norma internacional para sistemas de gestão de segurança da informação',
        'normativo', 'ISO/IEC 27001:2022', '2022',
        'Segurança da Informação', 'SGSI', 'recomendado', 'Internacional',
        ARRAY['TI', 'Segurança', 'Todas as áreas'], '2022-10-25', '2024-01-01',
        'https://www.iso.org/standard/27001',
        ARRAY['segurança', 'informação', 'ISO', 'SGSI'], 'ativo',
        admin_user_id, admin_user_id
    ),
    (
        tenant_uuid, 'SOX-2002', 'Sarbanes-Oxley Act',
        'Lei americana que estabelece padrões de governança corporativa e transparência financeira',
        'regulatorio', 'Public Law 107-204', '1.0',
        'Financeiro e Contábil', 'Controles Internos', 'obrigatorio', 'Estados Unidos',
        ARRAY['Financeiro', 'Controladoria', 'Auditoria'], '2002-07-30', '2024-01-01',
        'https://www.sec.gov/about/laws/soa2002.pdf',
        ARRAY['governança', 'controles internos', 'financeiro', 'transparência'], 'ativo',
        admin_user_id, admin_user_id
    ),
    (
        tenant_uuid, 'BACEN-4557', 'Resolução BACEN 4.557/2017',
        'Estrutura de gerenciamento de riscos e controles internos',
        'regulatorio', 'Resolução BACEN nº 4.557', '1.0',
        'Financeiro e Contábil', 'Gestão de Riscos', 'obrigatorio', 'Brasil',
        ARRAY['Riscos', 'Controles Internos', 'Compliance'], '2017-02-23', '2024-01-01',
        'https://www.bcb.gov.br/pre/normativos/busca/normativo.asp?numero=4557',
        ARRAY['banco central', 'riscos', 'controles'], 'ativo',
        admin_user_id, admin_user_id
    );

    -- 2. REQUISITOS DE COMPLIANCE
    INSERT INTO requisitos_compliance (
        tenant_id, framework_id, codigo, titulo, descricao,
        categoria, subcategoria, tipo_controle, criticidade,
        nivel_risco_nao_conformidade, frequencia_avaliacao,
        tipos_evidencia_esperada, documentacao_necessaria, criterios_conformidade,
        responsavel_conformidade, responsavel_avaliacao, status,
        created_by, updated_by
    ) 
    SELECT 
        tenant_uuid,
        fw.id,
        req_data.codigo,
        req_data.titulo,
        req_data.descricao,
        req_data.categoria,
        req_data.subcategoria,
        req_data.tipo_controle,
        req_data.criticidade,
        req_data.nivel_risco,
        req_data.frequencia,
        req_data.evidencias,
        req_data.documentacao,
        req_data.criterios,
        CASE (random() * 3)::int WHEN 0 THEN admin_user_id WHEN 1 THEN user1_id ELSE user2_id END,
        CASE (random() * 3)::int WHEN 0 THEN admin_user_id WHEN 1 THEN user2_id ELSE user3_id END,
        'ativo',
        admin_user_id,
        admin_user_id
    FROM frameworks_compliance fw
    CROSS JOIN (
        VALUES 
        -- Requisitos LGPD
        ('LGPD-ART5', 'Bases Legais para Tratamento', 'Definir e documentar bases legais para todos os tratamentos de dados pessoais', 'Bases Legais', 'Consentimento', 'preventivo', 'critica', 5, 'semestral', 
         ARRAY['Registro de bases legais', 'Políticas de privacidade', 'Termos de consentimento'], 
         ARRAY['Registro de atividades de tratamento', 'Política de privacidade', 'Procedimento de consentimento'], 
         'Todas as atividades de tratamento devem ter base legal identificada e documentada'),
        
        ('LGPD-ART9', 'Consentimento dos Titulares', 'Obter e gerenciar consentimento de forma livre, informada e inequívoca', 'Consentimento', 'Gestão', 'preventivo', 'alta', 4, 'trimestral',
         ARRAY['Logs de consentimento', 'Interface de gestão', 'Evidências de revogação'],
         ARRAY['Sistema de gestão de consentimento', 'Logs de atividade', 'Termos de consentimento'],
         'Consentimento deve ser livre, informado, inequívoco e para finalidades específicas'),
         
        ('LGPD-ART18', 'Direitos dos Titulares', 'Implementar mecanismos para atendimento dos direitos dos titulares', 'Direitos', 'Atendimento', 'corretivo', 'alta', 4, 'trimestral',
         ARRAY['Canal de atendimento', 'Logs de solicitações', 'Evidências de resposta'],
         ARRAY['Procedimento de atendimento', 'Sistema de gestão de solicitações', 'Controles de prazo'],
         'Atendimento completo e tempestivo de todas as solicitações de titulares'),
         
        ('LGPD-ART30', 'Registro de Atividades', 'Manter registro atualizado das atividades de tratamento', 'Inventário', 'Documentação', 'detectivo', 'critica', 5, 'semestral',
         ARRAY['Registro de atividades', 'Inventário de dados', 'Mapeamento de fluxos'],
         ARRAY['Template de registro', 'Inventário de sistemas', 'Mapeamento de processos'],
         'Registro completo, atualizado e detalhado de todas as atividades de tratamento'),
         
        ('LGPD-ART48', 'Notificação de Incidentes', 'Notificar ANPD sobre incidentes de segurança em prazo adequado', 'Incidentes', 'Notificação', 'corretivo', 'critica', 5, 'anual',
         ARRAY['Procedimento de notificação', 'Logs de incidentes', 'Comprovantes de notificação'],
         ARRAY['Plano de resposta a incidentes', 'Modelo de notificação', 'Controles de prazo'],
         'Notificação à ANPD em até 72 horas para incidentes de alto risco'),

        -- Requisitos ISO 27001
        ('ISO27001-A5.1', 'Políticas de Segurança', 'Estabelecer e manter políticas de segurança da informação', 'Políticas', 'Governança', 'diretivo', 'critica', 5, 'anual',
         ARRAY['Política de segurança aprovada', 'Procedimentos de implementação', 'Evidências de comunicação'],
         ARRAY['Política de segurança da informação', 'Procedimentos operacionais', 'Plano de comunicação'],
         'Política aprovada pela alta direção, comunicada e implementada em toda organização'),
         
        ('ISO27001-A8.2', 'Controle de Acesso', 'Implementar controles adequados de acesso aos sistemas', 'Acesso', 'Controles', 'preventivo', 'alta', 4, 'trimestral',
         ARRAY['Matriz de acesso', 'Logs de autenticação', 'Revisões periódicas'],
         ARRAY['Procedimento de gestão de acesso', 'Matriz de perfis', 'Logs do sistema'],
         'Acesso baseado no princípio do menor privilégio com revisões regulares'),
         
        ('ISO27001-A12.6', 'Gestão de Vulnerabilidades', 'Identificar e tratar vulnerabilidades técnicas', 'Vulnerabilidades', 'Gestão', 'detectivo', 'alta', 4, 'mensal',
         ARRAY['Relatórios de scan', 'Planos de correção', 'Evidências de implementação'],
         ARRAY['Política de gestão de vulnerabilidades', 'Cronograma de correções', 'Relatórios de status'],
         'Identificação regular, priorização e correção tempestiva de vulnerabilidades'),

        -- Requisitos SOX
        ('SOX-302', 'Certificação dos Executivos', 'Executivos devem certificar a adequação dos controles internos', 'Certificação', 'Executiva', 'diretivo', 'critica', 5, 'trimestral',
         ARRAY['Certificações assinadas', 'Relatórios de avaliação', 'Documentação de suporte'],
         ARRAY['Procedimento de certificação', 'Check-lists de avaliação', 'Relatórios de controles'],
         'Certificação executiva sobre adequação e efetividade dos controles'),
         
        ('SOX-404', 'Avaliação de Controles Internos', 'Avaliar anualmente a efetividade dos controles internos', 'Controles', 'Avaliação', 'detectivo', 'critica', 5, 'anual',
         ARRAY['Relatório de avaliação', 'Testes de controles', 'Documentação de deficiências'],
         ARRAY['Matriz de controles', 'Procedimentos de teste', 'Documentação de gaps'],
         'Avaliação completa e documentada da efetividade de todos os controles internos')
    ) AS req_data(codigo, titulo, descricao, categoria, subcategoria, tipo_controle, criticidade, nivel_risco, frequencia, evidencias, documentacao, criterios)
    WHERE fw.tenant_id = tenant_uuid;

    -- 3. AVALIAÇÕES DE CONFORMIDADE
    INSERT INTO avaliacoes_conformidade (
        tenant_id, requisito_id, codigo, titulo, descricao,
        tipo_avaliacao, data_planejada, data_inicio, data_conclusao,
        avaliador_responsavel, equipe_avaliacao, metodologia,
        amostra_testada, populacao_total, criterios_amostragem,
        status, resultado_conformidade, score_conformidade,
        pontos_conformes, pontos_nao_conformes, total_pontos_avaliados,
        evidencias_coletadas, observacoes, recomendacoes,
        created_by, updated_by
    )
    SELECT 
        tenant_uuid,
        req.id,
        'AVAL-' || to_char(NOW(), 'YYYY') || '-' || LPAD((row_number() OVER())::text, 3, '0'),
        'Avaliação ' || req.titulo,
        'Avaliação periódica do requisito ' || req.codigo,
        CASE (random() * 3)::int 
            WHEN 0 THEN 'auto_avaliacao'
            WHEN 1 THEN 'avaliacao_interna' 
            ELSE 'auditoria_externa'
        END,
        CURRENT_DATE - INTERVAL '30 days' + (random() * 60)::int * INTERVAL '1 day',
        CASE WHEN random() > 0.3 THEN CURRENT_DATE - INTERVAL '25 days' + (random() * 50)::int * INTERVAL '1 day' ELSE NULL END,
        CASE WHEN random() > 0.5 THEN CURRENT_DATE - INTERVAL '20 days' + (random() * 40)::int * INTERVAL '1 day' ELSE NULL END,
        CASE (random() * 3)::int WHEN 0 THEN admin_user_id WHEN 1 THEN user1_id ELSE user2_id END,
        ARRAY[user1_id, user2_id],
        CASE (random() * 3)::int 
            WHEN 0 THEN 'Análise documental'
            WHEN 1 THEN 'Teste de controles'
            ELSE 'Entrevista + Observação'
        END,
        (random() * 50 + 10)::int,
        (random() * 100 + 50)::int,
        'Amostragem aleatória estratificada',
        CASE 
            WHEN random() > 0.7 THEN 'concluida'
            WHEN random() > 0.5 THEN 'em_andamento'
            ELSE 'planejada'
        END,
        CASE 
            WHEN random() > 0.8 THEN 'conforme'
            WHEN random() > 0.6 THEN 'parcialmente_conforme'
            WHEN random() > 0.3 THEN 'nao_conforme'
            ELSE 'nao_aplicavel'
        END,
        (random() * 40 + 60)::int,
        (random() * 30 + 10)::int,
        (random() * 10)::int,
        (random() * 40 + 20)::int,
        ARRAY['Documentação de políticas', 'Evidências de implementação', 'Logs de sistema'],
        'Avaliação conduzida conforme metodologia estabelecida. ' || 
        CASE WHEN random() > 0.5 THEN 'Alguns pontos de melhoria identificados.' ELSE 'Conformidade adequada observada.' END,
        CASE WHEN random() > 0.6 THEN 'Recomenda-se melhoria na documentação dos procedimentos.' ELSE 'Manter práticas atuais.' END,
        admin_user_id,
        admin_user_id
    FROM requisitos_compliance req
    WHERE req.tenant_id = tenant_uuid
    AND random() > 0.2; -- Criar avaliações para ~80% dos requisitos

    -- 4. NÃO CONFORMIDADES
    INSERT INTO nao_conformidades (
        tenant_id, requisito_id, codigo, titulo,
        o_que, onde, quem, por_que, como_identificado, quanto_impacto,
        categoria, tipo_nao_conformidade, origem_identificacao, criticidade,
        impacto_operacional, impacto_financeiro, impacto_reputacional, impacto_regulatorio,
        responsavel_tratamento, data_identificacao, prazo_resolucao,
        status, justificativa_status, e_recorrente, quantidade_recorrencias,
        evidencias_nao_conformidade, impacto_detalhado, acoes_imediatas_tomadas,
        created_by, updated_by
    )
    SELECT 
        tenant_uuid,
        req.id,
        'NC-' || to_char(NOW(), 'YYYY') || '-' || LPAD((row_number() OVER())::text, 3, '0'),
        nc_data.titulo,
        nc_data.o_que,
        nc_data.onde,
        nc_data.quem,
        nc_data.por_que,
        nc_data.como_identificado,
        nc_data.quanto_impacto,
        req.categoria,
        nc_data.tipo_nao_conformidade,
        nc_data.origem_identificacao,
        nc_data.criticidade,
        nc_data.impacto_operacional,
        nc_data.impacto_financeiro,
        nc_data.impacto_reputacional,
        nc_data.impacto_regulatorio,
        CASE (random() * 3)::int WHEN 0 THEN admin_user_id WHEN 1 THEN user1_id ELSE user2_id END,
        CURRENT_DATE - (random() * 90)::int * INTERVAL '1 day',
        CURRENT_DATE + (random() * 60 + 30)::int * INTERVAL '1 day',
        nc_data.status,
        nc_data.justificativa,
        nc_data.e_recorrente,
        nc_data.quantidade_recorrencias,
        nc_data.evidencias,
        nc_data.impacto_detalhado,
        nc_data.acoes_imediatas,
        admin_user_id,
        admin_user_id
    FROM requisitos_compliance req
    CROSS JOIN (
        VALUES 
        ('Ausência de Base Legal Documentada', 
         'Identificadas atividades de tratamento de dados sem base legal formalmente documentada',
         'Sistema CRM - módulo de marketing',
         'Equipe de Marketing',
         'Falta de procedimento formal para identificação e documentação das bases legais',
         'Auditoria interna - revisão de conformidade LGPD',
         'Possível aplicação de multa pela ANPD - até 2% do faturamento',
         'sistemica', 'auditoria_interna', 'critica', 4, 500000.00, 5, 5,
         'aberta', 'Aguardando definição do plano de ação detalhado', false, 0,
         ARRAY['Print de tela do sistema CRM', 'Relatório de auditoria interna', 'Levantamento de dados pessoais'],
         'Impacto regulatório alto devido à possibilidade de sanções da ANPD. Impacto reputacional significativo.',
         'Suspensão temporária das atividades de marketing digital até regularização'),
         
        ('Controles de Acesso Inadequados',
         'Usuários com privilégios excessivos nos sistemas críticos, violando o princípio do menor privilégio',
         'Sistema ERP - módulo financeiro',
         'Administrador de TI',
         'Ausência de revisão periódica de acessos e processo de aprovação inadequado',
         'Revisão mensal de segurança da informação',
         'Risco de fraude interna estimado em R$ 200.000',
         'sistemica', 'avaliacao_interna', 'alta', 3, 200000.00, 4, 3,
         'em_tratamento', 'Plano de ação em execução - revisão de acessos iniciada', false, 0,
         ARRAY['Relatório de auditoria de acessos', 'Screenshots de permissões', 'Matriz atual de acessos'],
         'Exposição a riscos de fraude e acesso indevido a informações confidenciais.',
         'Bloqueio temporário de acessos excessivos identificados como críticos'),
         
        ('Falta de Treinamento em Privacidade',
         'Colaboradores não receberam treinamento adequado sobre LGPD e proteção de dados',
         'Departamento de Recursos Humanos',
         'Gestor de RH',
         'Programa de treinamento não contempla adequadamente os aspectos de privacidade',
         'Avaliação de efetividade de treinamentos',
         'Risco de incidentes por desconhecimento - impacto estimado R$ 50.000',
         'pontual', 'auto_avaliacao', 'media', 2, 50000.00, 3, 2,
         'planejada', 'Plano de treinamento sendo desenvolvido', false, 0,
         ARRAY['Registros de treinamento', 'Conteúdo programático atual', 'Avaliação de conhecimento'],
         'Risco de incidentes de privacidade por falha humana e não conformidade com LGPD.',
         'Comunicado imediato sobre boas práticas e cuidados básicos'),
         
        ('Documentação de Controles Desatualizada',
         'Procedimentos e políticas de controles internos não refletem as práticas atuais',
         'Departamento de Controladoria',
         'Controller',
         'Mudanças nos processos não foram acompanhadas de atualização da documentação',
         'Auditoria externa anual',
         'Impacto na certificação SOX e possível ressalva de auditoria',
         'sistemica', 'auditoria_externa', 'alta', 4, 0.00, 4, 4,
         'aguardando_evidencia', 'Aguardando entrega da documentação atualizada', false, 0,
         ARRAY['Relatório de auditoria externa', 'Versões desatualizadas de procedimentos', 'Atas de mudanças de processo'],
         'Impacto na governança corporativa e compliance regulatório.',
         'Início imediato do processo de atualização da documentação crítica')
    ) AS nc_data(titulo, o_que, onde, quem, por_que, como_identificado, quanto_impacto, 
                 tipo_nao_conformidade, origem_identificacao, criticidade, 
                 impacto_operacional, impacto_financeiro, impacto_reputacional, impacto_regulatorio,
                 status, justificativa, e_recorrente, quantidade_recorrencias,
                 evidencias, impacto_detalhado, acoes_imediatas)
    WHERE req.tenant_id = tenant_uuid 
    AND random() > 0.7; -- Criar não conformidades para ~30% dos requisitos

    -- 5. PLANOS DE AÇÃO
    INSERT INTO planos_acao_conformidade (
        tenant_id, nao_conformidade_id, codigo, titulo, descricao_acao,
        tipo_acao, categoria_acao, causa_raiz_endereçada, objetivo_acao, resultados_esperados,
        responsavel_execucao, responsavel_aprovacao, responsavel_monitoramento,
        data_inicio_planejada, data_fim_planejada, data_inicio_real,
        orcamento_estimado, orcamento_realizado, recursos_necessarios, dependencias,
        status, percentual_conclusao, marcos_principais, entregas_esperadas,
        frequencia_monitoramento, data_proximo_monitoramento,
        created_by, updated_by
    )
    SELECT 
        tenant_uuid,
        nc.id,
        'PA-' || to_char(NOW(), 'YYYY') || '-' || LPAD((row_number() OVER())::text, 3, '0'),
        pa_data.titulo,
        pa_data.descricao_acao,
        pa_data.tipo_acao,
        pa_data.categoria_acao,
        pa_data.causa_raiz,
        pa_data.objetivo_acao,
        pa_data.resultados_esperados,
        CASE (random() * 3)::int WHEN 0 THEN admin_user_id WHEN 1 THEN user1_id ELSE user2_id END,
        admin_user_id,
        user3_id,
        CURRENT_DATE + (random() * 15)::int * INTERVAL '1 day',
        CURRENT_DATE + (random() * 60 + 30)::int * INTERVAL '1 day',
        CASE WHEN random() > 0.6 THEN CURRENT_DATE + (random() * 10)::int * INTERVAL '1 day' ELSE NULL END,
        pa_data.orcamento_estimado,
        CASE WHEN random() > 0.7 THEN pa_data.orcamento_estimado * (0.5 + random() * 0.4) ELSE 0 END,
        pa_data.recursos_necessarios,
        pa_data.dependencias,
        CASE 
            WHEN random() > 0.7 THEN 'em_execucao'
            WHEN random() > 0.5 THEN 'aprovada'
            WHEN random() > 0.3 THEN 'planejada'
            ELSE 'suspensa'
        END,
        (random() * 80 + 10)::int,
        pa_data.marcos_principais,
        pa_data.entregas_esperadas,
        pa_data.frequencia_monitoramento,
        CURRENT_DATE + INTERVAL '7 days',
        admin_user_id,
        admin_user_id
    FROM nao_conformidades nc
    CROSS JOIN (
        VALUES 
        ('Implementação de Registro de Bases Legais',
         'Desenvolver e implementar sistema de registro e documentação de bases legais para todas as atividades de tratamento de dados pessoais',
         'corretiva', 'Documentação',
         'Ausência de procedimento formal para identificação e documentação das bases legais para tratamento de dados',
         'Garantir compliance total com LGPD através da documentação adequada de todas as bases legais utilizadas',
         'Sistema de registro implementado, procedimento documentado, equipe treinada e conformidade com Art. 5º da LGPD',
         45000.00,
         ARRAY['Analista de Privacy', 'Desenvolvedor', 'Consultor jurídico'],
         ARRAY['Aprovação do orçamento', 'Definição de template legal', 'Homologação do sistema'],
         '[{"fase": "Análise", "prazo": "15 dias"}, {"fase": "Desenvolvimento", "prazo": "30 dias"}, {"fase": "Implementação", "prazo": "15 dias"}]'::jsonb,
         ARRAY['Procedimento documentado', 'Sistema de registro', 'Relatório de inventário', 'Treinamento da equipe'],
         'mensal'),
         
        ('Revisão e Adequação de Controles de Acesso',
         'Implementar processo sistemático de revisão de acessos e adequação de privilégios conforme princípio do menor privilégio',
         'corretiva', 'Tecnologia',
         'Ausência de revisão periódica de acessos e processo de aprovação inadequado para concessão de privilégios',
         'Estabelecer controles adequados de acesso aos sistemas críticos, reduzindo riscos de fraude e acesso indevido',
         'Matriz de acesso atualizada, processo de revisão implementado, acessos excessivos removidos e conformidade com ISO 27001',
         25000.00,
         ARRAY['Administrador de TI', 'Analista de Segurança', 'Gestores de área'],
         ARRAY['Levantamento de sistemas críticos', 'Definição de perfis de acesso', 'Aprovação dos gestores'],
         '[{"fase": "Levantamento", "prazo": "10 dias"}, {"fase": "Adequação", "prazo": "20 days"}, {"fase": "Implementação", "prazo": "10 days"}]'::jsonb,
         ARRAY['Matriz de acesso atualizada', 'Procedimento de revisão', 'Relatório de adequação', 'Treinamento de gestores'],
         'quinzenal'),
         
        ('Programa de Treinamento em Privacidade',
         'Desenvolver e implementar programa abrangente de treinamento em LGPD e proteção de dados pessoais',
         'preventiva', 'Pessoas',
         'Programa de treinamento atual não contempla adequadamente os aspectos de privacidade e proteção de dados',
         'Capacitar toda a organização em práticas de privacidade, reduzindo riscos de incidentes por falha humana',
         'Programa de treinamento implementado, colaboradores capacitados, avaliações periódicas e conformidade cultural estabelecida',
         15000.00,
         ARRAY['Especialista em Privacy', 'Analista de RH', 'Designer instrucional'],
         ARRAY['Conteúdo técnico validado', 'Plataforma de EAD disponível', 'Cronograma de liberação de pessoal'],
         '[{"fase": "Desenvolvimento", "prazo": "20 dias"}, {"fase": "Piloto", "prazo": "10 days"}, {"fase": "Rollout", "prazo": "30 days"}]'::jsonb,
         ARRAY['Conteúdo programático', 'Material didático', 'Avaliações de conhecimento', 'Certificados de conclusão'],
         'mensal'),
         
        ('Atualização de Documentação de Controles',
         'Atualizar integralmente a documentação de controles internos para refletir as práticas atuais',
         'corretiva', 'Processo',
         'Mudanças nos processos não foram acompanhadas de atualização da documentação de controles internos',
         'Garantir que a documentação reflita fidedignamente os controles implementados, assegurando compliance SOX',
         'Documentação atualizada, processos mapeados, controles validados e conformidade com requirements de auditoria',
         35000.00,
         ARRAY['Analista de Processos', 'Controller', 'Consultor externo'],
         ARRAY['Mapeamento de mudanças', 'Validação com auditores', 'Aprovação da alta administração'],
         '[{"fase": "Mapeamento", "prazo": "15 dias"}, {"fase": "Documentação", "prazo": "25 days"}, {"fase": "Validação", "prazo": "15 days"}]'::jsonb,
         ARRAY['Procedimentos atualizados', 'Matriz de controles', 'Evidências de implementação', 'Relatório de validação'],
         'mensal')
    ) AS pa_data(titulo, descricao_acao, tipo_acao, categoria_acao, causa_raiz, objetivo_acao, resultados_esperados,
                 orcamento_estimado, recursos_necessarios, dependencias, marcos_principais, entregas_esperadas, frequencia_monitoramento)
    WHERE nc.tenant_id = tenant_uuid;

    -- 6. CONTROLES DE CONFORMIDADE
    INSERT INTO controles_conformidade (
        tenant_id, requisito_id, codigo, titulo, descricao, objetivo_controle,
        tipo, natureza, nivel, frequencia, momento_execucao,
        proprietario_controle, executor_controle, revisor_controle,
        atividades_controle, evidencias_funcionamento, sistemas_utilizados,
        metodo_teste, ultima_data_teste, proximo_teste_planejado, resultado_ultimo_teste,
        nivel_maturidade, score_efetividade, status,
        created_by, updated_by
    )
    SELECT 
        tenant_uuid,
        req.id,
        'CTRL-' || LPAD((row_number() OVER())::text, 3, '0'),
        ctrl_data.titulo,
        ctrl_data.descricao,
        ctrl_data.objetivo,
        ctrl_data.tipo,
        ctrl_data.natureza,
        ctrl_data.nivel,
        ctrl_data.frequencia,
        ctrl_data.momento_execucao,
        CASE (random() * 3)::int WHEN 0 THEN admin_user_id WHEN 1 THEN user1_id ELSE user2_id END,
        CASE (random() * 3)::int WHEN 0 THEN user1_id WHEN 1 THEN user2_id ELSE user3_id END,
        admin_user_id,
        ctrl_data.atividades,
        ctrl_data.evidencias,
        ctrl_data.sistemas,
        CASE (random() * 3)::int 
            WHEN 0 THEN 'Inquiry'
            WHEN 1 THEN 'Observation'
            ELSE 'Inspection'
        END,
        CURRENT_DATE - (random() * 90)::int * INTERVAL '1 day',
        CURRENT_DATE + (random() * 60 + 30)::int * INTERVAL '1 day',
        CASE 
            WHEN random() > 0.8 THEN 'efetivo'
            WHEN random() > 0.6 THEN 'parcialmente_efetivo'
            WHEN random() > 0.3 THEN 'inefetivo'
            ELSE 'nao_testado'
        END,
        (random() * 2 + 3)::int, -- Maturidade entre 3-5
        (random() * 40 + 60)::int, -- Score entre 60-100
        'ativo',
        admin_user_id,
        admin_user_id
    FROM requisitos_compliance req
    CROSS JOIN (
        VALUES 
        ('Revisão de Consentimentos', 
         'Revisão periódica dos consentimentos coletados para verificar validade e adequação',
         'Garantir que todos os consentimentos sejam válidos, atualizados e adequados às finalidades',
         'detectivo', 'manual', 'operacional', 'mensal', 'Durante o processo',
         'Verificar registros de consentimento, validar termos utilizados, identificar consentimentos vencidos ou inadequados',
         ARRAY['Relatório de revisão', 'Log de consentimentos', 'Documentação de adequações'],
         ARRAY['Sistema de gestão de consentimento', 'CRM', 'Ferramentas de analytics']),
         
        ('Backup de Dados Críticos',
         'Execução e verificação de backups de dados críticos conforme política estabelecida',
         'Garantir disponibilidade e recuperabilidade de dados críticos em caso de incidente',
         'preventivo', 'automatico', 'operacional', 'diario', 'Fora do horário comercial',
         'Executar backup automático, verificar integridade, testar restauração, documentar resultados',
         ARRAY['Logs de backup', 'Relatórios de verificação', 'Testes de restauração'],
         ARRAY['Sistema de backup', 'Storage', 'Ferramentas de monitoramento']),
         
        ('Segregação de Funções',
         'Verificação da adequada segregação de funções em processos críticos',
         'Prevenir fraudes e erros através da segregação adequada de responsabilidades',
         'preventivo', 'manual', 'estrategico', 'trimestral', 'Antes da execução',
         'Analisar matriz de responsabilidades, verificar conflitos de interesse, validar aprovações',
         ARRAY['Matriz de segregação', 'Aprovações documentadas', 'Relatório de análise'],
         ARRAY['ERP', 'Sistema de workflow', 'Controles de acesso']),
         
        ('Monitoramento de Acessos',
         'Monitoramento contínuo de acessos aos sistemas críticos para detectar anomalias',
         'Detectar rapidamente acessos não autorizados ou comportamentos suspeitos',
         'detectivo', 'automatico', 'operacional', 'continuo', 'Durante todo o processo',
         'Monitorar logs de acesso, analisar padrões, identificar anomalias, gerar alertas',
         ARRAY['Dashboards de monitoramento', 'Alertas de segurança', 'Relatórios de investigação'],
         ARRAY['SIEM', 'Active Directory', 'Sistemas de log'])
    ) AS ctrl_data(titulo, descricao, objetivo, tipo, natureza, nivel, frequencia, momento_execucao,
                   atividades, evidencias, sistemas)
    WHERE req.tenant_id = tenant_uuid
    AND random() > 0.4; -- Criar controles para ~60% dos requisitos

    -- 7. RELATÓRIOS DE CONFORMIDADE
    INSERT INTO relatorios_conformidade (
        tenant_id, codigo, titulo, descricao, tipo_relatorio, categoria,
        frequencia_geracao, formato_saida, automatico, 
        frameworks_incluidos, nivel_confidencialidade,
        template_relatorio, created_by, updated_by
    )
    SELECT 
        tenant_uuid,
        rel_data.codigo,
        rel_data.titulo,
        rel_data.descricao,
        rel_data.tipo_relatorio,
        rel_data.categoria,
        rel_data.frequencia_geracao,
        rel_data.formato_saida,
        rel_data.automatico,
        ARRAY[fw.id],
        rel_data.nivel_confidencialidade,
        rel_data.template_relatorio,
        admin_user_id,
        admin_user_id
    FROM frameworks_compliance fw
    CROSS JOIN (
        VALUES 
        ('REL-LGPD-001', 'Relatório Mensal LGPD', 
         'Relatório executivo mensal sobre conformidade com LGPD incluindo métricas de consentimento, solicitações de titulares e incidentes',
         'executivo', 'LGPD', 'mensal', 'pdf', true, 'restrito',
         '{"sections": [{"type": "summary", "title": "Resumo Executivo"}, {"type": "consent_metrics", "title": "Métricas de Consentimento"}, {"type": "data_subject_requests", "title": "Solicitações de Titulares"}, {"type": "incidents", "title": "Incidentes de Privacidade"}]}'::jsonb),
         
        ('REL-ISO-001', 'Dashboard ISO 27001',
         'Dashboard interativo com status de conformidade ISO 27001, incluindo controles implementados e gaps identificados',
         'dashboard', 'Segurança da Informação', 'semanal', 'html', true, 'interno',
         '{"sections": [{"type": "controls_status", "title": "Status dos Controles"}, {"type": "risk_assessment", "title": "Avaliação de Riscos"}, {"type": "incidents", "title": "Incidentes de Segurança"}, {"type": "compliance_score", "title": "Score de Conformidade"}]}'::jsonb),
         
        ('REL-SOX-001', 'Relatório Trimestral SOX',
         'Relatório trimestral para certificação SOX incluindo avaliação de controles internos e deficiências identificadas',
         'regulatorio', 'Controles Internos', 'trimestral', 'pdf', false, 'confidencial',
         '{"sections": [{"type": "executive_certification", "title": "Certificação Executiva"}, {"type": "controls_testing", "title": "Testes de Controles"}, {"type": "deficiencies", "title": "Deficiências Identificadas"}, {"type": "remediation", "title": "Planos de Remedição"}]}'::jsonb)
    ) AS rel_data(codigo, titulo, descricao, tipo_relatorio, categoria, frequencia_geracao, 
                  formato_saida, automatico, nivel_confidencialidade, template_relatorio)
    WHERE fw.tenant_id = tenant_uuid;

    -- 8. INSTÂNCIAS DE RELATÓRIOS (histórico)
    INSERT INTO instancias_relatorios_conformidade (
        tenant_id, relatorio_id, codigo_instancia, titulo,
        data_inicio_periodo, data_fim_periodo, status_geracao,
        arquivo_relatorio, tamanho_arquivo, gerado_por, distribuido
    )
    SELECT 
        tenant_uuid,
        rel.id,
        rel.codigo || '-' || to_char(CURRENT_DATE - (series * 30)::int * INTERVAL '1 day', 'YYYY-MM'),
        rel.titulo || ' - ' || to_char(CURRENT_DATE - (series * 30)::int * INTERVAL '1 day', 'MM/YYYY'),
        CURRENT_DATE - (series * 30 + 30)::int * INTERVAL '1 day',
        CURRENT_DATE - (series * 30)::int * INTERVAL '1 day',
        'concluido',
        '/reports/' || rel.codigo || '_' || to_char(CURRENT_DATE - (series * 30)::int * INTERVAL '1 day', 'YYYY_MM') || '.pdf',
        (random() * 5000000 + 1000000)::bigint,
        admin_user_id,
        true
    FROM relatorios_conformidade rel
    CROSS JOIN generate_series(1, 6) AS series -- Criar 6 meses de histórico
    WHERE rel.tenant_id = tenant_uuid;

    RAISE NOTICE 'Dados de teste criados com sucesso para o tenant: %', tenant_uuid;
    
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Erro ao criar dados de teste: %', SQLERRM;
        RAISE;
END $$;

-- =====================================================
-- FUNÇÃO PARA CALCULAR ESTATÍSTICAS GERAIS
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_estatisticas_compliance(tenant_uuid UUID)
RETURNS TABLE (
    total_frameworks INTEGER,
    total_requisitos INTEGER,
    total_avaliacoes INTEGER,
    total_nao_conformidades INTEGER,
    nao_conformidades_criticas INTEGER,
    total_planos_acao INTEGER,
    planos_em_execucao INTEGER,
    taxa_conformidade DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::int FROM frameworks_compliance WHERE tenant_id = tenant_uuid AND status = 'ativo'),
        (SELECT COUNT(*)::int FROM requisitos_compliance WHERE tenant_id = tenant_uuid AND status = 'ativo'),
        (SELECT COUNT(*)::int FROM avaliacoes_conformidade WHERE tenant_id = tenant_uuid),
        (SELECT COUNT(*)::int FROM nao_conformidades WHERE tenant_id = tenant_uuid AND status IN ('aberta', 'em_tratamento')),
        (SELECT COUNT(*)::int FROM nao_conformidades WHERE tenant_id = tenant_uuid AND criticidade = 'critica' AND status IN ('aberta', 'em_tratamento')),
        (SELECT COUNT(*)::int FROM planos_acao_conformidade WHERE tenant_id = tenant_uuid),
        (SELECT COUNT(*)::int FROM planos_acao_conformidade WHERE tenant_id = tenant_uuid AND status = 'em_execucao'),
        COALESCE(
            (SELECT AVG(score_conformidade) 
             FROM avaliacoes_conformidade 
             WHERE tenant_id = tenant_uuid 
             AND status = 'concluida' 
             AND resultado_conformidade != 'nao_aplicavel'), 
            0
        )::decimal;
END;
$$ LANGUAGE plpgsql;

-- Testar a função para ver estatísticas
SELECT * FROM calcular_estatisticas_compliance('46b1c048-85a1-423b-96fc-776007c8de1f');

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON FUNCTION calcular_estatisticas_compliance IS 'Calcula estatísticas gerais de conformidade para um tenant específico';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================