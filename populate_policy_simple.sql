-- ============================================================================
-- SCRIPT SIMPLIFICADO PARA POPULAR SUBPROCESSOS DO MÓDULO DE POLÍTICAS
-- ============================================================================
-- Popula as tabelas relacionadas com a estrutura atual

-- Obter IDs necessários
DO $$
DECLARE
    tenant_uuid UUID;
    user_uuid UUID;
    policy_draft_id UUID;
    policy_review_id UUID;
    policy_published_id UUID;
BEGIN
    -- Obter tenant e usuário
    SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    -- Obter IDs de políticas para diferentes status
    SELECT id INTO policy_draft_id FROM policies WHERE status = 'draft' LIMIT 1;
    SELECT id INTO policy_review_id FROM policies WHERE status = 'review' LIMIT 1;
    SELECT id INTO policy_published_id FROM policies WHERE status = 'published' LIMIT 1;
    
    RAISE NOTICE 'Usando tenant: %, user: %', tenant_uuid, user_uuid;
    RAISE NOTICE 'Política draft: %, review: %, published: %', policy_draft_id, policy_review_id, policy_published_id;
END $$;

-- ============================================================================
-- 1. APROVAÇÕES DE POLÍTICAS
-- ============================================================================

-- Aprovação pendente
INSERT INTO policy_approvals (
    id,
    policy_id,
    approver_id,
    status,
    comments,
    created_at
) VALUES (
    '50000000-0000-0000-0000-000000000001',
    (SELECT id FROM policies WHERE status = 'draft' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'pending',
    'Aguardando análise dos aspectos contratuais e de compliance.',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Aprovação concluída
INSERT INTO policy_approvals (
    id,
    policy_id,
    approver_id,
    status,
    comments,
    approved_at,
    created_at
) VALUES (
    '50000000-0000-0000-0000-000000000002',
    (SELECT id FROM policies WHERE status = 'approved' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'approved',
    'Política está em conformidade e alinhada com objetivos estratégicos.',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '12 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CONFIGURAÇÃO DE APROVADORES
-- ============================================================================

-- Configurar aprovadores para política em draft
INSERT INTO policy_approvers (
    id,
    policy_id,
    approver_id,
    approver_role,
    is_required,
    order_sequence,
    notification_days_before,
    escalation_days,
    created_by,
    created_at
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    (SELECT id FROM policies WHERE status = 'draft' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Diretor Jurídico',
    true,
    1,
    7,
    3,
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. HISTÓRICO DE MUDANÇAS
-- ============================================================================

-- Criação de política
INSERT INTO policy_change_history (
    id,
    policy_id,
    change_type,
    old_value,
    new_value,
    reason,
    impact_assessment,
    stakeholders_notified,
    changed_by,
    changed_at
) VALUES (
    '80000000-0000-0000-0000-000000000001',
    (SELECT id FROM policies WHERE status = 'published' LIMIT 1),
    'created',
    NULL,
    NULL,
    'Criação inicial da política para padronização de processos',
    'Impacto positivo na padronização e redução de riscos',
    true,
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '45 days'
) ON CONFLICT (id) DO NOTHING;

-- Aprovação
INSERT INTO policy_change_history (
    id,
    policy_id,
    change_type,
    old_value,
    new_value,
    reason,
    impact_assessment,
    stakeholders_notified,
    changed_by,
    changed_at
) VALUES (
    '80000000-0000-0000-0000-000000000002',
    (SELECT id FROM policies WHERE status = 'approved' LIMIT 1),
    'approved',
    'pending_approval',
    'approved',
    'Aprovação final após revisão jurídica',
    'Política pronta para implementação',
    true,
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. NOTIFICAÇÕES (com estrutura correta)
-- ============================================================================

-- Notificação de nova política
INSERT INTO policy_notifications (
    id,
    policy_id,
    notification_type,
    title,
    message,
    recipient_id,
    channels,
    status,
    priority,
    action_required,
    action_type,
    scheduled_for,
    created_at
) VALUES (
    '90000000-0000-0000-0000-000000000001',
    (SELECT id FROM policies WHERE status = 'published' LIMIT 1),
    'new_policy',
    'Nova Política Publicada',
    'Uma nova política foi publicada e requer sua atenção.',
    (SELECT id FROM auth.users LIMIT 1),
    '["in_app", "email"]'::jsonb,
    'sent',
    'medium',
    true,
    'read_policy',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- Notificação de revisão pendente
INSERT INTO policy_notifications (
    id,
    policy_id,
    notification_type,
    title,
    message,
    recipient_id,
    channels,
    status,
    priority,
    action_required,
    action_type,
    scheduled_for,
    created_at
) VALUES (
    '90000000-0000-0000-0000-000000000002',
    (SELECT id FROM policies WHERE status = 'review' LIMIT 1),
    'review_required',
    'Revisão de Política Necessária',
    'Uma política requer sua revisão técnica.',
    (SELECT id FROM auth.users LIMIT 1),
    '["in_app", "email"]'::jsonb,
    'pending',
    'high',
    true,
    'review',
    NOW() + INTERVAL '1 hour',
    NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. VERIFICAR INTEGRAÇÃO COM TENANT_ID
-- ============================================================================

-- Atualizar políticas com tenant_id se necessário
UPDATE policies 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- ============================================================================
-- 6. RELATÓRIO FINAL
-- ============================================================================

-- Gerar relatório completo
DO $$
DECLARE
    total_policies INTEGER;
    total_approvals INTEGER := 0;
    total_notifications INTEGER := 0;
    total_changes INTEGER := 0;
    total_approvers INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO total_policies FROM policies;
    SELECT COUNT(*) INTO total_approvals FROM policy_approvals;
    SELECT COUNT(*) INTO total_notifications FROM policy_notifications;
    SELECT COUNT(*) INTO total_changes FROM policy_change_history;
    SELECT COUNT(*) INTO total_approvers FROM policy_approvers;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'POPULAÇÃO DOS SUBPROCESSOS CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Resumo dos dados criados:';
    RAISE NOTICE '📋 Políticas: %', total_policies;
    RAISE NOTICE '✅ Aprovações: %', total_approvals;
    RAISE NOTICE '👥 Aprovadores configurados: %', total_approvers;
    RAISE NOTICE '🔔 Notificações: %', total_notifications;
    RAISE NOTICE '📝 Mudanças registradas: %', total_changes;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Subprocessos populados com sucesso:';
    RAISE NOTICE '  ✓ Elaboração de políticas (% políticas em draft)', (SELECT COUNT(*) FROM policies WHERE status = 'draft');
    RAISE NOTICE '  ✓ Aprovação estruturada (% aprovações)', total_approvals;
    RAISE NOTICE '  ✓ Publicação e comunicação (% políticas publicadas)', (SELECT COUNT(*) FROM policies WHERE status = 'published');
    RAISE NOTICE '  ✓ Notificações e alertas (% notificações)', total_notifications;
    RAISE NOTICE '  ✓ Histórico de mudanças (% registros)', total_changes;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 O módulo está integrado e pronto para uso!';
    RAISE NOTICE '🔗 Acesse o frontend para verificar a integração';
    RAISE NOTICE '============================================================================';
END $$;

-- Mostrar estatísticas finais
SELECT 
    'Políticas por Status' as categoria,
    status,
    COUNT(*) as quantidade
FROM policies 
GROUP BY status
ORDER BY quantidade DESC;

SELECT 
    'Aprovações por Status' as categoria,
    status,
    COUNT(*) as quantidade
FROM policy_approvals 
GROUP BY status;

SELECT 
    'Notificações por Status' as categoria,
    status,
    COUNT(*) as quantidade
FROM policy_notifications 
GROUP BY status;

COMMIT;