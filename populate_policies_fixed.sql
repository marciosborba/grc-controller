-- Script corrigido para popular o banco com dados de políticas
-- Executar no banco PostgreSQL do Supabase

-- Inserir histórico de mudanças para a Política de Segurança
INSERT INTO policy_change_history (
    id,
    policy_id,
    change_type,
    change_description,
    old_values,
    new_values,
    changed_fields,
    reason,
    impact_assessment,
    changed_by,
    change_source,
    tenant_id
) VALUES 
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    'creation',
    'Criação inicial da política de segurança da informação',
    '{}',
    '{"version": "1.0", "status": "draft"}',
    '["version", "status"]',
    'Nova política necessária para compliance',
    'Impacto positivo na segurança organizacional',
    '2091d567-3891-4755-88df-4aa5f068a205',
    'manual',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
),
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    'major_revision',
    'Atualização para conformidade com LGPD e inclusão de novos controles de acesso',
    '{"version": "1.0", "status": "published"}',
    '{"version": "2.0", "status": "published"}',
    '["version", "content"]',
    'Adequação à LGPD e melhores práticas',
    'Melhoria significativa nos controles de segurança',
    '2091d567-3891-4755-88df-4aa5f068a205',
    'manual',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
),
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    'minor_revision',
    'Correções menores e atualização de procedimentos de backup',
    '{"version": "2.0"}',
    '{"version": "2.1"}',
    '["version", "content"]',
    'Melhorias nos procedimentos de backup',
    'Impacto baixo - melhorias operacionais',
    '2091d567-3891-4755-88df-4aa5f068a205',
    'manual',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
);

-- Inserir aprovadores para as políticas
INSERT INTO policy_approvers (
    id,
    policy_id,
    approver_id,
    approver_role,
    is_required,
    order_sequence,
    created_by
) VALUES 
-- Aprovadores para Política de Segurança (já aprovada)
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com (CISO)
    'CISO',
    true,
    1,
    '2091d567-3891-4755-88df-4aa5f068a205'
),
-- Aprovadores para Política de Riscos (pendente)
(
    gen_random_uuid(),
    '22222222-3333-4444-5555-666666666666',
    'ed99c0cc-53cf-4500-a216-8649bc509905', -- risk@cyberguard.com (CRO)
    'CRO',
    true,
    1,
    'ed99c0cc-53cf-4500-a216-8649bc509905'
),
(
    gen_random_uuid(),
    '22222222-3333-4444-5555-666666666666',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com (CEO)
    'CEO',
    true,
    2,
    'ed99c0cc-53cf-4500-a216-8649bc509905'
);

-- Inserir aprovações para a Política de Segurança
INSERT INTO policy_approvals (
    id,
    policy_id,
    approver_id,
    status,
    comments,
    approved_at
) VALUES (
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    '2091d567-3891-4755-88df-4aa5f068a205',
    'approved',
    'Política aprovada. Excelente alinhamento com frameworks internacionais e requisitos regulatórios. Implementação imediata recomendada.',
    '2024-01-10 14:30:00+00'
);

-- Inserir notificações relacionadas às políticas
INSERT INTO policy_notifications (
    id,
    policy_id,
    notification_type,
    title,
    message,
    priority,
    recipient_id,
    recipient_role,
    status,
    action_required,
    action_url,
    tenant_id,
    sent_at
) VALUES 
-- Notificação de política publicada
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    'policy_published',
    'Nova Política de Segurança da Informação Publicada',
    'A Política de Segurança da Informação v2.1 foi oficialmente publicada e está em vigor. Todos os colaboradores devem revisar e confirmar o entendimento.',
    'high',
    NULL,
    'all_users',
    'sent',
    true,
    '/policies/11111111-2222-3333-4444-555555555555',
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    '2024-01-15 09:30:00+00'
),
-- Notificação de treinamento obrigatório
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    'training_required',
    'Treinamento Obrigatório - Segurança da Informação',
    'É obrigatório completar o treinamento sobre a nova Política de Segurança da Informação até 31/01/2024. Acesse o portal de treinamentos.',
    'urgent',
    NULL,
    'all_users',
    'sent',
    true,
    '/training/security-policy-2024',
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    '2024-01-16 08:00:00+00'
),
-- Notificação de política pendente de aprovação
(
    gen_random_uuid(),
    '22222222-3333-4444-5555-666666666666',
    'approval_needed',
    'Política de Gestão de Riscos Aguarda Aprovação',
    'A Política de Gestão de Riscos Corporativos v1.3 está pendente de sua aprovação. Prazo para análise: 5 dias úteis.',
    'high',
    'ed99c0cc-53cf-4500-a216-8649bc509905',
    'cro',
    'pending',
    true,
    '/policies/22222222-3333-4444-5555-666666666666/approve',
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    '2024-01-20 10:15:00+00'
),
-- Notificação de revisão próxima
(
    gen_random_uuid(),
    '11111111-2222-3333-4444-555555555555',
    'review_due',
    'Revisão da Política de Segurança Programada',
    'A Política de Segurança da Informação está programada para revisão em 15/11/2024. Inicie o processo de avaliação e atualização.',
    'medium',
    '2091d567-3891-4755-88df-4aa5f068a205',
    'admin',
    'pending',
    true,
    '/policies/11111111-2222-3333-4444-555555555555/review',
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    '2024-01-21 14:00:00+00'
);

-- Verificar os dados inseridos
SELECT 
    p.title,
    p.version,
    p.status,
    p.priority,
    p.category,
    p.effective_date,
    p.expiry_date,
    CASE 
        WHEN p.created_by IS NOT NULL THEN 'Sim'
        ELSE 'Não'
    END as tem_criador
FROM policies p 
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY p.created_at;

-- Verificar notificações
SELECT 
    pn.title,
    pn.notification_type,
    pn.priority,
    pn.status,
    pn.action_required,
    p.title as policy_title
FROM policy_notifications pn
JOIN policies p ON pn.policy_id = p.id
WHERE pn.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY pn.created_at DESC;

-- Verificar histórico de mudanças
SELECT 
    pch.change_type,
    pch.change_description,
    pch.created_at,
    p.title as policy_title
FROM policy_change_history pch
JOIN policies p ON pch.policy_id = p.id
WHERE pch.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY pch.created_at;

-- Verificar aprovadores
SELECT 
    pa.approver_role,
    pa.is_required,
    pa.order_sequence,
    p.title as policy_title
FROM policy_approvers pa
JOIN policies p ON pa.policy_id = p.id
ORDER BY p.title, pa.order_sequence;

-- Verificar aprovações
SELECT 
    pap.status,
    pap.comments,
    pap.approved_at,
    p.title as policy_title
FROM policy_approvals pap
JOIN policies p ON pap.policy_id = p.id
ORDER BY pap.approved_at;