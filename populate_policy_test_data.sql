-- ============================================================================
-- SCRIPT DE POPULAÇÃO DE DADOS DE TESTE - MÓDULO DE POLÍTICAS
-- ============================================================================
-- Este script cria um exemplo completo de processo de política passando por
-- todas as etapas: elaboração, revisão, aprovação, publicação, ciclo de vida

-- Limpar dados existentes (opcional - descomente se necessário)
-- DELETE FROM policy_change_log;
-- DELETE FROM policy_training;
-- DELETE FROM policy_action_items;
-- DELETE FROM policy_reviews;
-- DELETE FROM policy_approvals;
-- DELETE FROM policy_approvers;
-- DELETE FROM policy_attachments;
-- DELETE FROM policies;

-- ============================================================================
-- 1. CRIAR USUÁRIOS DE TESTE (se não existirem)
-- ============================================================================

-- Inserir usuários de teste na tabela profiles (assumindo que existe)
INSERT INTO profiles (user_id, full_name, email, role, department, created_at) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'João Silva', 'joao.silva@empresa.com', 'Analista de Compliance', 'Compliance', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria.santos@empresa.com', 'Gerente de Riscos', 'Gestão de Riscos', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Carlos Oliveira', 'carlos.oliveira@empresa.com', 'Diretor Jurídico', 'Jurídico', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Ana Costa', 'ana.costa@empresa.com', 'Coordenadora de RH', 'Recursos Humanos', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Pedro Almeida', 'pedro.almeida@empresa.com', 'CEO', 'Diretoria', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 2. POLÍTICA EM ELABORAÇÃO
-- ============================================================================

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
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  ARRAY['segurança', 'informação', 'dados', 'confidencialidade'],
  ARRAY['ISO 27001', 'LGPD', 'SOX'],
  ARRAY['TI', 'Operações', 'Recursos Humanos'],
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- 3. POLÍTICA EM REVISÃO
-- ============================================================================

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
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  ARRAY['ética', 'conduta', 'integridade', 'compliance'],
  ARRAY['SOX', 'Código de Ética'],
  ARRAY['Todos os departamentos'],
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '2 days'
);

-- Adicionar revisão para a política de ética
INSERT INTO policy_reviews (
  id,
  policy_id,
  review_type,
  reviewer_id,
  review_date,
  due_date,
  status,
  findings,
  recommendations,
  severity,
  compliance_status,
  created_by,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'periodic',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '3 days',
  'pending',
  'A política está bem estruturada, mas precisa de algumas atualizações para estar em conformidade com as novas regulamentações.',
  'Incluir seções sobre proteção de dados pessoais e whistleblowing. Atualizar referências legais.',
  'medium',
  'partially_compliant',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '1 day'
);

-- Adicionar itens de ação para a revisão
INSERT INTO policy_action_items (
  id,
  policy_review_id,
  description,
  priority,
  assigned_to,
  due_date,
  status,
  created_by,
  created_at
) VALUES 
(
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Adicionar seção sobre proteção de dados pessoais conforme LGPD',
  'high',
  '22222222-2222-2222-2222-222222222222',
  NOW() + INTERVAL '7 days',
  'open',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '1 day'
),
(
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Incluir procedimentos para canal de denúncias (whistleblowing)',
  'medium',
  '44444444-4444-4444-4444-444444444444',
  NOW() + INTERVAL '10 days',
  'open',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- 4. POLÍTICA AGUARDANDO APROVAÇÃO
-- ============================================================================

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
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  ARRAY['fornecedores', 'terceiros', 'contratos', 'due diligence'],
  ARRAY['ISO 9001', 'SOX'],
  ARRAY['Compras', 'Jurídico', 'Operações'],
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '3 days'
);

-- Configurar aprovadores para a política de fornecedores
INSERT INTO policy_approvers (
  id,
  policy_id,
  approver_id,
  approver_role,
  is_required,
  order_sequence,
  can_delegate,
  notification_days_before,
  escalation_days,
  created_by,
  created_at
) VALUES 
(
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '33333333-3333-3333-3333-333333333333',
  'Diretor Jurídico',
  true,
  1,
  false,
  7,
  3,
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '3 days'
),
(
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '55555555-5555-5555-5555-555555555555',
  'CEO',
  true,
  2,
  true,
  5,
  2,
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '3 days'
);

-- Adicionar aprovação pendente
INSERT INTO policy_approvals (
  id,
  policy_id,
  approver_id,
  approver_role,
  status,
  comments,
  created_at
) VALUES (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '33333333-3333-3333-3333-333333333333',
  'Diretor Jurídico',
  'pending',
  'Aguardando análise dos aspectos contratuais e de compliance.',
  NOW() - INTERVAL '2 days'
);

-- ============================================================================
-- 5. POLÍTICA APROVADA E PUBLICADA
-- ============================================================================

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
  '55555555-5555-5555-5555-555555555555',
  NOW() - INTERVAL '10 days',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  ARRAY['recursos humanos', 'pessoas', 'recrutamento', 'desenvolvimento'],
  ARRAY['CLT', 'ISO 9001'],
  ARRAY['Recursos Humanos', 'Gestão'],
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '10 days'
);

-- Histórico de aprovações para a política de RH
INSERT INTO policy_approvals (
  id,
  policy_id,
  approver_id,
  approver_role,
  status,
  comments,
  decision_date,
  created_at
) VALUES 
(
  '50000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  '33333333-3333-3333-3333-333333333333',
  'Diretor Jurídico',
  'approved',
  'Política está em conformidade com a legislação trabalhista vigente.',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '15 days'
),
(
  '50000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '55555555-5555-5555-5555-555555555555',
  'CEO',
  'approved',
  'Aprovado. Política alinhada com os objetivos estratégicos da empresa.',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '12 days'
);

-- Treinamentos realizados para a política de RH
INSERT INTO policy_training (
  id,
  policy_id,
  employee_id,
  trainer_id,
  training_date,
  training_method,
  duration_hours,
  completion_status,
  score,
  certification_date,
  expiration_date,
  notes,
  created_at
) VALUES 
(
  '60000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '5 days',
  'online',
  2.5,
  'completed',
  95,
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '1 year',
  'Excelente participação e compreensão dos conceitos.',
  NOW() - INTERVAL '5 days'
),
(
  '60000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  '22222222-2222-2222-2222-222222222222',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '3 days',
  'classroom',
  3.0,
  'completed',
  88,
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '1 year',
  'Boa participação, algumas dúvidas esclarecidas.',
  NOW() - INTERVAL '3 days'
);

-- ============================================================================
-- 6. POLÍTICA PRÓXIMA DO VENCIMENTO (CICLO DE VIDA)
-- ============================================================================

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
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '2 years 11 months',
  CURRENT_DATE - INTERVAL '2 years 11 months',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '1 month',
  NOW() - INTERVAL '6 months',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  ARRAY['backup', 'recuperação', 'dados', 'continuidade'],
  ARRAY['ISO 27001', 'COBIT'],
  ARRAY['TI', 'Operações'],
  NOW() - INTERVAL '3 years',
  NOW() - INTERVAL '6 months'
);

-- Revisão recente da política de backup
INSERT INTO policy_reviews (
  id,
  policy_id,
  review_type,
  reviewer_id,
  review_date,
  due_date,
  status,
  findings,
  recommendations,
  severity,
  compliance_status,
  created_by,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000005',
  'periodic',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months' + INTERVAL '7 days',
  'completed',
  'Política está funcionando adequadamente, mas precisa de atualização para incluir novos sistemas cloud.',
  'Atualizar procedimentos para incluir backup de sistemas em nuvem. Revisar RPO e RTO.',
  'low',
  'compliant',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '6 months'
);

-- ============================================================================
-- 7. POLÍTICA EXPIRADA (PARA ANALYTICS)
-- ============================================================================

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
  '55555555-5555-5555-5555-555555555555',
  NOW() - INTERVAL '3 years',
  CURRENT_DATE - INTERVAL '3 years',
  CURRENT_DATE - INTERVAL '2 years',
  CURRENT_DATE - INTERVAL '6 months',
  NOW() - INTERVAL '2 years',
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  ARRAY['home office', 'remoto', 'covid', 'temporário'],
  ARRAY['CLT'],
  ARRAY['Recursos Humanos', 'TI'],
  NOW() - INTERVAL '3 years 2 months',
  NOW() - INTERVAL '6 months'
);

-- ============================================================================
-- 8. ANEXOS E DOCUMENTOS
-- ============================================================================

INSERT INTO policy_attachments (
  id,
  policy_id,
  file_name,
  file_path,
  file_size,
  file_type,
  mime_type,
  description,
  category,
  version,
  is_current_version,
  uploaded_by,
  uploaded_at
) VALUES 
(
  '70000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  'Manual_RH_Completo.pdf',
  '/documents/policies/rh/manual_rh_v3.pdf',
  2048576,
  'PDF',
  'application/pdf',
  'Manual completo de procedimentos de Recursos Humanos',
  'document',
  '3.0',
  true,
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '10 days'
),
(
  '70000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  'Formulario_Avaliacao_Desempenho.xlsx',
  '/documents/policies/rh/formulario_avaliacao.xlsx',
  512000,
  'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'Formulário padrão para avaliação de desempenho',
  'template',
  '3.0',
  true,
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- 9. LOG DE MUDANÇAS
-- ============================================================================

INSERT INTO policy_change_log (
  id,
  policy_id,
  change_type,
  field_changed,
  old_value,
  new_value,
  reason,
  impact_assessment,
  stakeholders_notified,
  changed_by,
  changed_at
) VALUES 
(
  '80000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  'created',
  NULL,
  NULL,
  NULL,
  'Criação inicial da política de RH',
  'Impacto positivo na padronização de processos de RH',
  true,
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '45 days'
),
(
  '80000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  'version_updated',
  'version',
  '2.1',
  '3.0',
  'Atualização para conformidade com nova legislação trabalhista',
  'Melhoria na conformidade legal e redução de riscos',
  true,
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '15 days'
),
(
  '80000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  'approved',
  NULL,
  NULL,
  NULL,
  'Aprovação final da versão 3.0',
  'Política pronta para implementação',
  true,
  '55555555-5555-5555-5555-555555555555',
  NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- 10. DADOS PARA ANALYTICS
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
  created_at,
  updated_at
) VALUES 
(
  'Política de Viagens Corporativas',
  'Diretrizes para viagens a trabalho e reembolso de despesas.',
  'Financeiro',
  'Política',
  '1.5',
  'published',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '8 months',
  NOW() - INTERVAL '2 months'
),
(
  'Procedimento de Compras',
  'Processo para aquisição de bens e serviços.',
  'Operacional',
  'Procedimento',
  '2.0',
  'approved',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '3 months',
  NOW() - INTERVAL '1 month'
),
(
  'Manual de Qualidade',
  'Sistema de gestão da qualidade da organização.',
  'Qualidade',
  'Manual',
  '4.1',
  'under_review',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '1 week'
),
(
  'Política de Sustentabilidade',
  'Compromissos ambientais e práticas sustentáveis.',
  'Ambiental',
  'Política',
  '1.0',
  'draft',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '3 days'
);

-- ============================================================================
-- CONFIRMAÇÃO
-- ============================================================================

SELECT 'Dados de teste inseridos com sucesso!' as status,
       COUNT(*) as total_policies
FROM policies;

-- Mostrar resumo por status
SELECT status, COUNT(*) as quantidade
FROM policies 
GROUP BY status
ORDER BY quantidade DESC;

-- Mostrar resumo por categoria
SELECT category, COUNT(*) as quantidade
FROM policies 
GROUP BY category
ORDER BY quantidade DESC;

COMMIT;