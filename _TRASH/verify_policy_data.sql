-- Script para verificar todos os dados de políticas inseridos
-- e testar as consultas que o módulo React fará

\echo '🔍 === VERIFICAÇÃO COMPLETA DOS DADOS DE POLÍTICAS ==='

\echo '\n📋 1. POLÍTICAS PRINCIPAIS'
SELECT 
    p.title,
    p.version,
    p.status,
    p.priority,
    p.category,
    p.type,
    p.effective_date,
    p.expiry_date,
    p.requires_training,
    p.is_active,
    CASE 
        WHEN p.created_by IS NOT NULL THEN 'Sim'
        ELSE 'Não'
    END as tem_criador
FROM policies p 
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY p.created_at;

\echo '\n📊 2. MÉTRICAS DO DASHBOARD'
SELECT 
    'Total de Políticas' as metrica,
    COUNT(*) as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'

UNION ALL

SELECT 
    'Políticas Ativas' as metrica,
    COUNT(*) as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
AND is_active = true

UNION ALL

SELECT 
    'Políticas Publicadas' as metrica,
    COUNT(*) as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
AND status = 'published'

UNION ALL

SELECT 
    'Políticas em Revisão' as metrica,
    COUNT(*) as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
AND status = 'review'

UNION ALL

SELECT 
    'Políticas Críticas' as metrica,
    COUNT(*) as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
AND priority = 'critical'

UNION ALL

SELECT 
    'Vencendo em 30 dias' as metrica,
    COUNT(*) as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' 
AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

\echo '\n📈 3. DISTRIBUIÇÃO POR STATUS'
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentual
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
GROUP BY status
ORDER BY quantidade DESC;

\echo '\n📈 4. DISTRIBUIÇÃO POR CATEGORIA'
SELECT 
    category,
    COUNT(*) as quantidade,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentual
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
GROUP BY category
ORDER BY quantidade DESC;

\echo '\n📈 5. DISTRIBUIÇÃO POR PRIORIDADE'
SELECT 
    priority,
    COUNT(*) as quantidade,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentual
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
GROUP BY priority
ORDER BY 
    CASE priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

\echo '\n🔔 6. NOTIFICAÇÕES'
SELECT 
    pn.title,
    pn.notification_type,
    pn.priority,
    pn.status,
    pn.action_required,
    pn.recipient_role,
    p.title as policy_title,
    pn.created_at
FROM policy_notifications pn
JOIN policies p ON pn.policy_id = p.id
WHERE pn.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY pn.created_at DESC;

\echo '\n📝 7. HISTÓRICO DE MUDANÇAS'
SELECT 
    pch.change_type,
    pch.change_description,
    pch.reason,
    pch.impact_assessment,
    pch.created_at,
    p.title as policy_title
FROM policy_change_history pch
JOIN policies p ON pch.policy_id = p.id
WHERE pch.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY pch.created_at;

\echo '\n👥 8. APROVADORES'
SELECT 
    pa.approver_role,
    pa.is_required,
    pa.order_sequence,
    p.title as policy_title,
    u.email as approver_email
FROM policy_approvers pa
JOIN policies p ON pa.policy_id = p.id
LEFT JOIN auth.users u ON pa.approver_id = u.id
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY p.title, pa.order_sequence;

\echo '\n✅ 9. APROVAÇÕES'
SELECT 
    pap.status,
    pap.comments,
    pap.approved_at,
    p.title as policy_title,
    u.email as approver_email
FROM policy_approvals pap
JOIN policies p ON pap.policy_id = p.id
LEFT JOIN auth.users u ON pap.approver_id = u.id
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY pap.approved_at DESC NULLS LAST;

\echo '\n🎯 10. POLÍTICAS CRÍTICAS (ALTA PRIORIDADE OU VENCENDO)'
SELECT 
    p.title,
    p.priority,
    p.status,
    p.expiry_date,
    CASE 
        WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Vencendo em breve'
        WHEN p.priority IN ('critical', 'high') THEN 'Alta prioridade'
        ELSE 'Normal'
    END as motivo_critico
FROM policies p
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
AND (
    p.priority IN ('critical', 'high') 
    OR p.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
)
ORDER BY 
    CASE p.priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    p.expiry_date;

\echo '\n📊 11. CONTEÚDO DAS POLÍTICAS (JSONB)'
SELECT 
    p.title,
    jsonb_array_length(p.content->'sections') as num_secoes,
    jsonb_array_length(p.content->'attachments') as num_anexos,
    jsonb_array_length(p.content->'references') as num_referencias,
    p.metadata->'tags' as tags,
    p.metadata->'compliance_frameworks' as frameworks
FROM policies p
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
AND p.content IS NOT NULL;

\echo '\n🔍 12. INSIGHTS ALEX POLICY'
SELECT 
    p.title,
    insight->>'type' as insight_type,
    insight->>'message' as message,
    insight->>'confidence' as confidence,
    insight->>'date' as insight_date
FROM policies p,
     jsonb_array_elements(p.metadata->'alex_policy_insights') as insight
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
AND p.metadata->'alex_policy_insights' IS NOT NULL;

\echo '\n📋 13. TESTE DE CONSULTA PRINCIPAL (COMO O REACT FARÁ)'
SELECT 
    p.*,
    created_by_profile.email as created_by_email,
    updated_by_profile.email as updated_by_email
FROM policies p
LEFT JOIN auth.users created_by_profile ON p.created_by = created_by_profile.id
LEFT JOIN auth.users updated_by_profile ON p.updated_by = updated_by_profile.id
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY p.updated_at DESC;

\echo '\n🎯 14. RESUMO EXECUTIVO'
SELECT 
    'RESUMO EXECUTIVO' as titulo,
    '' as valor
UNION ALL
SELECT 
    '===================' as titulo,
    '' as valor
UNION ALL
SELECT 
    'Total de Políticas:' as titulo,
    COUNT(*)::text as valor
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
UNION ALL
SELECT 
    'Notificações Ativas:' as titulo,
    COUNT(*)::text as valor
FROM policy_notifications 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
AND status IN ('pending', 'sent')
UNION ALL
SELECT 
    'Histórico de Mudanças:' as titulo,
    COUNT(*)::text as valor
FROM policy_change_history 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
UNION ALL
SELECT 
    'Aprovadores Configurados:' as titulo,
    COUNT(*)::text as valor
FROM policy_approvers pa
JOIN policies p ON pa.policy_id = p.id
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
UNION ALL
SELECT 
    'Aprovações Realizadas:' as titulo,
    COUNT(*)::text as valor
FROM policy_approvals pap
JOIN policies p ON pap.policy_id = p.id
WHERE p.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f';

\echo '\n✅ VERIFICAÇÃO CONCLUÍDA!'
\echo 'Todos os dados foram inseridos e estão prontos para teste no módulo React.'