-- Script para popular o framework ISO 27001 com dados de exemplo
-- Framework ID: 885440f4-7444-477f-b761-2947e5188271
-- Tenant ID: 46b1c048-85a1-423b-96fc-776007c8de1f

-- Limpar dados existentes para este framework
DELETE FROM assessment_questions WHERE control_id IN (
    SELECT id FROM assessment_controls WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271'
);
DELETE FROM assessment_controls WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271';
DELETE FROM assessment_domains WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271';

-- Inserir domínios do ISO 27001
INSERT INTO assessment_domains (id, tenant_id, framework_id, codigo, nome, descricao, ordem, peso) VALUES
('11111111-1111-1111-1111-111111111111', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.5', 'Políticas de Segurança da Informação', 'Estabelecimento de políticas de segurança da informação', 1, 10.0),
('22222222-2222-2222-2222-222222222222', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.6', 'Organização da Segurança da Informação', 'Estrutura organizacional para segurança da informação', 2, 15.0),
('33333333-3333-3333-3333-333333333333', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.7', 'Segurança de Recursos Humanos', 'Controles de segurança relacionados a recursos humanos', 3, 12.0),
('44444444-4444-4444-4444-444444444444', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.8', 'Gestão de Ativos', 'Identificação e proteção de ativos de informação', 4, 18.0),
('55555555-5555-5555-5555-555555555555', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.9', 'Controle de Acesso', 'Gestão de acesso a sistemas e informações', 5, 20.0),
('66666666-6666-6666-6666-666666666666', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.10', 'Criptografia', 'Uso adequado de controles criptográficos', 6, 15.0),
('77777777-7777-7777-7777-777777777777', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', 'A.11', 'Segurança Física e do Ambiente', 'Proteção física de instalações e equipamentos', 7, 10.0);

-- Inserir controles para o domínio A.5 (Políticas de Segurança)
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, ordem, tipo_controle, criticidade, peso) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', '11111111-1111-1111-1111-111111111111', 'A.5.1', 'Políticas para Segurança da Informação', 'Um conjunto de políticas para segurança da informação deve ser definido, aprovado pela direção, publicado e comunicado aos funcionários e partes externas relevantes.', 1, 'diretivo', 'alta', 5.0),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', '11111111-1111-1111-1111-111111111111', 'A.5.2', 'Análise Crítica das Políticas para Segurança da Informação', 'As políticas para segurança da informação devem ser analisadas criticamente a intervalos planejados ou quando mudanças significativas ocorrerem.', 2, 'diretivo', 'media', 5.0);

-- Inserir controles para o domínio A.6 (Organização)
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, ordem, tipo_controle, criticidade, peso) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', '22222222-2222-2222-2222-222222222222', 'A.6.1', 'Responsabilidades e Papéis pela Segurança da Informação', 'Todas as responsabilidades e papéis pela segurança da informação devem ser definidos e atribuídos.', 1, 'diretivo', 'alta', 7.5),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', '22222222-2222-2222-2222-222222222222', 'A.6.2', 'Segregação de Funções', 'Funções conflitantes e áreas de responsabilidade devem ser segregadas para reduzir as oportunidades de modificação não autorizada ou não intencional.', 2, 'preventivo', 'alta', 7.5);

-- Inserir controles para o domínio A.9 (Controle de Acesso)
INSERT INTO assessment_controls (id, tenant_id, framework_id, domain_id, codigo, titulo, descricao, ordem, tipo_controle, criticidade, peso) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', '55555555-5555-5555-5555-555555555555', 'A.9.1', 'Política de Controle de Acesso', 'Uma política de controle de acesso deve ser estabelecida, documentada e analisada criticamente.', 1, 'diretivo', 'critica', 10.0),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '46b1c048-85a1-423b-96fc-776007c8de1f', '885440f4-7444-477f-b761-2947e5188271', '55555555-5555-5555-5555-555555555555', 'A.9.2', 'Gestão de Acesso do Usuário', 'Um processo formal de registro e cancelamento de usuário deve ser implementado para conceder e revogar acesso a todos os sistemas de informação e serviços.', 2, 'preventivo', 'critica', 10.0);

-- Inserir questões para o controle A.5.1
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, ordem, tipo_pergunta, obrigatoria, peso, opcoes_resposta, mapeamento_pontuacao, texto_ajuda) VALUES
('10000000-0000-0000-0000-000000000001', '46b1c048-85a1-423b-96fc-776007c8de1f', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Q.A.5.1.1', 'A organização possui políticas de segurança da informação formalmente documentadas?', 'Verificar se existem políticas escritas e aprovadas pela direção', 1, 'sim_nao', true, 2.5, 
'{"options": [{"value": true, "label": "Sim", "points": 5}, {"value": false, "label": "Não", "points": 0}]}',
'{"type": "binary", "yes_points": 5, "no_points": 0}',
'Procure por documentos formais de política de segurança aprovados pela alta direção.'),

('10000000-0000-0000-0000-000000000002', '46b1c048-85a1-423b-96fc-776007c8de1f', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Q.A.5.1.2', 'As políticas de segurança foram aprovadas pela alta direção?', 'Verificar aprovação formal das políticas', 2, 'sim_nao', true, 2.5,
'{"options": [{"value": true, "label": "Sim", "points": 5}, {"value": false, "label": "Não", "points": 0}]}',
'{"type": "binary", "yes_points": 5, "no_points": 0}',
'Verifique assinaturas ou aprovações formais da diretoria executiva.');

-- Inserir questões para o controle A.6.1
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, ordem, tipo_pergunta, obrigatoria, peso, opcoes_resposta, mapeamento_pontuacao, texto_ajuda) VALUES
('10000000-0000-0000-0000-000000000003', '46b1c048-85a1-423b-96fc-776007c8de1f', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Q.A.6.1.1', 'Qual o nível de maturidade da definição de papéis e responsabilidades de segurança?', 'Avalie o grau de formalização dos papéis de segurança', 1, 'escala', true, 3.75,
'{"levels": [{"value": 1, "name": "Inicial", "description": "Papéis não definidos"}, {"value": 2, "name": "Básico", "description": "Papéis informalmente definidos"}, {"value": 3, "name": "Intermediário", "description": "Papéis documentados"}, {"value": 4, "name": "Avançado", "description": "Papéis bem definidos e comunicados"}, {"value": 5, "name": "Otimizado", "description": "Papéis integrados e revisados regularmente"}]}',
'{"type": "linear", "scale": {"min": 1, "max": 5}}',
'Considere documentação, comunicação e atualização dos papéis de segurança.'),

('10000000-0000-0000-0000-000000000004', '46b1c048-85a1-423b-96fc-776007c8de1f', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Q.A.6.1.2', 'Existe um responsável formal pela segurança da informação na organização?', 'Verificar se há um CISO ou responsável designado', 2, 'sim_nao', true, 3.75,
'{"options": [{"value": true, "label": "Sim", "points": 5}, {"value": false, "label": "Não", "points": 0}]}',
'{"type": "binary", "yes_points": 5, "no_points": 0}',
'Procure por organograma ou designação formal de um Chief Information Security Officer (CISO).');

-- Inserir questões para o controle A.9.1
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, ordem, tipo_pergunta, obrigatoria, peso, opcoes_resposta, mapeamento_pontuacao, texto_ajuda) VALUES
('10000000-0000-0000-0000-000000000005', '46b1c048-85a1-423b-96fc-776007c8de1f', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Q.A.9.1.1', 'Qual o nível de maturidade da política de controle de acesso?', 'Avalie a completude e implementação da política de acesso', 1, 'escala', true, 5.0,
'{"levels": [{"value": 1, "name": "Inicial", "description": "Sem política formal"}, {"value": 2, "name": "Básico", "description": "Política básica existente"}, {"value": 3, "name": "Intermediário", "description": "Política documentada e comunicada"}, {"value": 4, "name": "Avançado", "description": "Política implementada e monitorada"}, {"value": 5, "name": "Otimizado", "description": "Política integrada e continuamente melhorada"}]}',
'{"type": "linear", "scale": {"min": 1, "max": 5}}',
'Considere documentação, implementação, comunicação e revisão da política de acesso.'),

('10000000-0000-0000-0000-000000000006', '46b1c048-85a1-423b-96fc-776007c8de1f', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Q.A.9.1.2', 'A política de controle de acesso é revisada periodicamente?', 'Verificar se há processo de revisão estabelecido', 2, 'multipla_escolha', true, 5.0,
'{"opcoes": ["Nunca é revisada", "Revisada quando há problemas", "Revisada anualmente", "Revisada semestralmente", "Revisada continuamente"]}',
'{"type": "custom", "options": [{"value": "Nunca é revisada", "points": 0}, {"value": "Revisada quando há problemas", "points": 1}, {"value": "Revisada anualmente", "points": 3}, {"value": "Revisada semestralmente", "points": 4}, {"value": "Revisada continuamente", "points": 5}]}',
'Verifique registros de revisões e cronograma estabelecido para atualizações.');

-- Inserir questões para o controle A.9.2
INSERT INTO assessment_questions (id, tenant_id, control_id, codigo, texto, descricao, ordem, tipo_pergunta, obrigatoria, peso, opcoes_resposta, mapeamento_pontuacao, texto_ajuda) VALUES
('10000000-0000-0000-0000-000000000007', '46b1c048-85a1-423b-96fc-776007c8de1f', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Q.A.9.2.1', 'Existe um processo formal para criação de contas de usuário?', 'Verificar se há procedimento documentado para criação de acessos', 1, 'sim_nao', true, 5.0,
'{"options": [{"value": true, "label": "Sim", "points": 5}, {"value": false, "label": "Não", "points": 0}]}',
'{"type": "binary", "yes_points": 5, "no_points": 0}',
'Procure por procedimentos documentados, formulários de solicitação e fluxos de aprovação.'),

('10000000-0000-0000-0000-000000000008', '46b1c048-85a1-423b-96fc-776007c8de1f', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Q.A.9.2.2', 'Existe um processo formal para revogação de acessos quando funcionários saem da empresa?', 'Verificar processo de offboarding de segurança', 2, 'sim_nao', true, 5.0,
'{"options": [{"value": true, "label": "Sim", "points": 5}, {"value": false, "label": "Não", "points": 0}]}',
'{"type": "binary", "yes_points": 5, "no_points": 0}',
'Verifique se há checklist de desligamento incluindo revogação de todos os acessos.');

-- Atualizar estatísticas do assessment
UPDATE assessments SET 
    dominios_avaliados = 7,
    controles_avaliados = 6,
    updated_at = NOW()
WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271';

-- Verificar dados inseridos
SELECT 'Domínios inseridos:' as info, COUNT(*) as count FROM assessment_domains WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271'
UNION ALL
SELECT 'Controles inseridos:', COUNT(*) FROM assessment_controls WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271'
UNION ALL
SELECT 'Questões inseridas:', COUNT(*) FROM assessment_questions WHERE control_id IN (
    SELECT id FROM assessment_controls WHERE framework_id = '885440f4-7444-477f-b761-2947e5188271'
);