-- Script para popular o banco com dois exemplos completos de políticas
-- Executar no banco PostgreSQL do Supabase

-- Limpar dados existentes de políticas (se houver)
DELETE FROM policy_notifications WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f';
DELETE FROM policy_change_history WHERE policy_id IN (SELECT id FROM policies WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f');
DELETE FROM policy_approvals WHERE policy_id IN (SELECT id FROM policies WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f');
DELETE FROM policy_approvers WHERE policy_id IN (SELECT id FROM policies WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f');
DELETE FROM policies WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f';

-- Inserir Política 1: Política de Segurança da Informação (Completa - Publicada)
INSERT INTO policies (
    id,
    title,
    description,
    category,
    version,
    status,
    document_type,
    effective_date,
    review_date,
    expiry_date,
    next_review_date,
    owner_id,
    approved_by,
    approved_at,
    published_by,
    published_at,
    created_by,
    updated_by,
    tenant_id,
    type,
    workflow_stage,
    is_current_version,
    priority,
    requires_approval,
    requires_training,
    is_template,
    is_active,
    content,
    metadata
) VALUES (
    '11111111-2222-3333-4444-555555555555',
    'Política de Segurança da Informação',
    'Estabelece diretrizes e procedimentos para proteção das informações corporativas, garantindo confidencialidade, integridade e disponibilidade dos dados organizacionais.',
    'security',
    '2.1',
    'published',
    'policy',
    '2024-01-15',
    '2024-12-15',
    '2025-01-15',
    '2024-11-15',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com
    '2024-01-10 14:30:00+00',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com
    '2024-01-15 09:00:00+00',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com
    '46b1c048-85a1-423b-96fc-776007c8de1f', -- GRC-Controller tenant
    'policy',
    'published',
    true,
    'critical',
    true,
    true,
    false,
    true,
    '{
        "sections": [
            {
                "id": "1",
                "title": "Objetivo",
                "content": "Esta política tem como objetivo estabelecer diretrizes para proteção das informações corporativas, garantindo a confidencialidade, integridade e disponibilidade dos dados da organização."
            },
            {
                "id": "2", 
                "title": "Escopo",
                "content": "Esta política aplica-se a todos os colaboradores, terceiros, fornecedores e parceiros que tenham acesso às informações da GRC-Controller, independentemente do formato ou meio de armazenamento."
            },
            {
                "id": "3",
                "title": "Responsabilidades",
                "content": "Todos os usuários são responsáveis por: proteger informações confidenciais, utilizar senhas seguras, reportar incidentes de segurança, manter software atualizado e seguir as diretrizes estabelecidas."
            },
            {
                "id": "4",
                "title": "Classificação da Informação",
                "content": "As informações são classificadas em: Pública, Interna, Confidencial e Restrita. Cada classificação possui controles específicos de acesso e proteção."
            },
            {
                "id": "5",
                "title": "Controles de Acesso",
                "content": "O acesso às informações deve seguir o princípio do menor privilégio, com autenticação multifator obrigatória para sistemas críticos e revisão periódica de permissões."
            },
            {
                "id": "6",
                "title": "Backup e Recuperação",
                "content": "Backups devem ser realizados diariamente para dados críticos, com testes de recuperação mensais e armazenamento em local seguro e geograficamente separado."
            },
            {
                "id": "7",
                "title": "Incidentes de Segurança",
                "content": "Todos os incidentes devem ser reportados imediatamente ao time de segurança através do canal oficial, com documentação completa e análise de causa raiz."
            },
            {
                "id": "8",
                "title": "Treinamento e Conscientização",
                "content": "Todos os colaboradores devem participar de treinamentos anuais de segurança da informação, com avaliações periódicas de conhecimento."
            },
            {
                "id": "9",
                "title": "Monitoramento e Auditoria",
                "content": "Atividades de acesso e uso de sistemas são monitoradas continuamente, com auditorias regulares para verificar conformidade com esta política."
            },
            {
                "id": "10",
                "title": "Sanções",
                "content": "O descumprimento desta política pode resultar em medidas disciplinares, incluindo advertência, suspensão ou demissão, conforme a gravidade da violação."
            }
        ],
        "attachments": [
            {
                "name": "Procedimento de Classificação de Informações",
                "type": "procedure",
                "url": "/documents/proc-classificacao-info.pdf"
            },
            {
                "name": "Formulário de Incidente de Segurança",
                "type": "form",
                "url": "/documents/form-incidente-seguranca.pdf"
            }
        ],
        "references": [
            "ISO 27001:2013",
            "LGPD - Lei Geral de Proteção de Dados",
            "Marco Civil da Internet"
        ]
    }',
    '{
        "tags": ["segurança", "informação", "ISO27001", "LGPD", "crítica"],
        "compliance_frameworks": ["ISO27001", "LGPD", "SOX"],
        "business_impact": "critical",
        "geographic_scope": ["Brasil"],
        "departments": ["TI", "Segurança", "Todos"],
        "review_cycle": "annual",
        "training_required": true,
        "training_frequency": "annual",
        "approval_matrix": {
            "level1": "CISO",
            "level2": "CEO",
            "level3": "Conselho"
        },
        "metrics": {
            "compliance_rate": 95.5,
            "training_completion": 98.2,
            "incident_count": 2,
            "last_audit_score": 92
        },
        "alex_policy_insights": [
            {
                "type": "compliance",
                "message": "Política alinhada com melhores práticas ISO 27001",
                "confidence": 0.95,
                "date": "2024-01-15"
            },
            {
                "type": "improvement",
                "message": "Considere adicionar seção sobre IA e Machine Learning",
                "confidence": 0.78,
                "date": "2024-01-15"
            }
        ]
    }'
),

-- Inserir Política 2: Política de Gestão de Riscos (Em Revisão)
(
    '22222222-3333-4444-5555-666666666666',
    'Política de Gestão de Riscos Corporativos',
    'Define a estrutura e metodologia para identificação, avaliação, tratamento e monitoramento de riscos corporativos, garantindo a continuidade dos negócios e proteção dos stakeholders.',
    'governance',
    '1.3',
    'review',
    'policy',
    '2024-02-01',
    '2024-12-01',
    '2025-02-01',
    '2024-10-01',
    'ed99c0cc-53cf-4500-a216-8649bc509905', -- risk@cyberguard.com
    NULL, -- Ainda não aprovada
    NULL,
    NULL, -- Ainda não publicada
    NULL,
    'ed99c0cc-53cf-4500-a216-8649bc509905', -- risk@cyberguard.com
    'ed99c0cc-53cf-4500-a216-8649bc509905', -- risk@cyberguard.com
    '46b1c048-85a1-423b-96fc-776007c8de1f', -- GRC-Controller tenant
    'policy',
    'review',
    true,
    'high',
    true,
    true,
    false,
    true,
    '{
        "sections": [
            {
                "id": "1",
                "title": "Objetivo e Finalidade",
                "content": "Estabelecer uma estrutura robusta de gestão de riscos que permita à organização identificar, avaliar e gerenciar riscos de forma proativa, garantindo a continuidade dos negócios e a proteção dos stakeholders."
            },
            {
                "id": "2",
                "title": "Escopo de Aplicação",
                "content": "Esta política aplica-se a todos os processos, projetos, atividades e decisões da GRC-Controller, abrangendo riscos operacionais, estratégicos, financeiros, de compliance e reputacionais."
            },
            {
                "id": "3",
                "title": "Estrutura de Governança",
                "content": "A gestão de riscos é supervisionada pelo Comitê de Riscos, com responsabilidades distribuídas entre primeira linha (operações), segunda linha (gestão de riscos) e terceira linha (auditoria interna)."
            },
            {
                "id": "4",
                "title": "Metodologia de Avaliação",
                "content": "Utiliza-se matriz de riscos 5x5 considerando probabilidade e impacto, com critérios quantitativos e qualitativos para classificação em baixo, médio, alto e crítico."
            },
            {
                "id": "5",
                "title": "Processo de Identificação",
                "content": "Riscos são identificados através de workshops, análise de cenários, benchmarking, indicadores de performance e feedback de stakeholders, com revisão trimestral."
            },
            {
                "id": "6",
                "title": "Estratégias de Tratamento",
                "content": "Para cada risco identificado, define-se estratégia de: aceitar, mitigar, transferir ou evitar, com planos de ação específicos e responsáveis designados."
            },
            {
                "id": "7",
                "title": "Monitoramento Contínuo",
                "content": "Implementação de KRIs (Key Risk Indicators) para monitoramento em tempo real, com dashboards executivos e alertas automáticos para desvios."
            },
            {
                "id": "8",
                "title": "Comunicação e Reporte",
                "content": "Relatórios mensais para gestão executiva, trimestrais para conselho e anuais para stakeholders externos, com comunicação imediata de riscos críticos."
            },
            {
                "id": "9",
                "title": "Cultura de Riscos",
                "content": "Promoção de cultura organizacional que valoriza a gestão proativa de riscos, com treinamentos regulares e incentivos para identificação de riscos."
            },
            {
                "id": "10",
                "title": "Revisão e Melhoria",
                "content": "Avaliação anual da efetividade do framework de riscos, com atualizações baseadas em lições aprendidas e melhores práticas do mercado."
            }
        ],
        "attachments": [
            {
                "name": "Matriz de Riscos Corporativos",
                "type": "template",
                "url": "/documents/matriz-riscos.xlsx"
            },
            {
                "name": "Procedimento de Avaliação de Riscos",
                "type": "procedure", 
                "url": "/documents/proc-avaliacao-riscos.pdf"
            },
            {
                "name": "Formulário de Identificação de Riscos",
                "type": "form",
                "url": "/documents/form-identificacao-riscos.pdf"
            }
        ],
        "references": [
            "COSO ERM Framework",
            "ISO 31000:2018",
            "Basileia III",
            "Solvência II"
        ]
    }',
    '{
        "tags": ["riscos", "governança", "COSO", "ISO31000", "ERM"],
        "compliance_frameworks": ["COSO", "ISO31000", "Basileia", "Solvencia"],
        "business_impact": "high",
        "geographic_scope": ["Brasil", "América Latina"],
        "departments": ["Riscos", "Compliance", "Auditoria", "Executivo"],
        "review_cycle": "annual",
        "training_required": true,
        "training_frequency": "biannual",
        "approval_matrix": {
            "level1": "CRO",
            "level2": "CEO", 
            "level3": "Conselho"
        },
        "metrics": {
            "risk_coverage": 87.3,
            "mitigation_effectiveness": 82.1,
            "kri_alerts": 5,
            "training_completion": 94.7
        },
        "alex_policy_insights": [
            {
                "type": "review_pending",
                "message": "Política em revisão - aguardando aprovação do CRO",
                "confidence": 1.0,
                "date": "2024-01-20"
            },
            {
                "type": "enhancement",
                "message": "Considere incluir riscos ESG e climáticos",
                "confidence": 0.85,
                "date": "2024-01-18"
            },
            {
                "type": "compliance",
                "message": "Alinhamento com ISO 31000 verificado",
                "confidence": 0.92,
                "date": "2024-01-15"
            }
        ]
    }'
);

-- Inserir histórico de mudanças para a Política de Segurança
INSERT INTO policy_change_history (
    id,
    policy_id,
    version,
    change_type,
    change_description,
    changed_by,
    changed_at,
    tenant_id
) VALUES 
(
    '11111111-aaaa-bbbb-cccc-111111111111',
    '11111111-2222-3333-4444-555555555555',
    '1.0',
    'creation',
    'Criação inicial da política de segurança da informação',
    '2091d567-3891-4755-88df-4aa5f068a205',
    '2023-06-15 10:00:00+00',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
),
(
    '22222222-aaaa-bbbb-cccc-222222222222',
    '11111111-2222-3333-4444-555555555555',
    '2.0',
    'major_revision',
    'Atualização para conformidade com LGPD e inclusão de novos controles de acesso',
    '2091d567-3891-4755-88df-4aa5f068a205',
    '2023-12-10 14:30:00+00',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
),
(
    '33333333-aaaa-bbbb-cccc-333333333333',
    '11111111-2222-3333-4444-555555555555',
    '2.1',
    'minor_revision',
    'Correções menores e atualização de procedimentos de backup',
    '2091d567-3891-4755-88df-4aa5f068a205',
    '2024-01-05 09:15:00+00',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
);

-- Inserir aprovadores para as políticas
INSERT INTO policy_approvers (
    id,
    policy_id,
    approver_id,
    approval_level,
    is_required,
    tenant_id
) VALUES 
-- Aprovadores para Política de Segurança (já aprovada)
(
    '11111111-dddd-eeee-ffff-111111111111',
    '11111111-2222-3333-4444-555555555555',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com (CISO)
    1,
    true,
    '46b1c048-85a1-423b-96fc-776007c8de1f'
),
-- Aprovadores para Política de Riscos (pendente)
(
    '22222222-dddd-eeee-ffff-222222222222',
    '22222222-3333-4444-5555-666666666666',
    'ed99c0cc-53cf-4500-a216-8649bc509905', -- risk@cyberguard.com (CRO)
    1,
    true,
    '46b1c048-85a1-423b-96fc-776007c8de1f'
),
(
    '33333333-dddd-eeee-ffff-333333333333',
    '22222222-3333-4444-5555-666666666666',
    '2091d567-3891-4755-88df-4aa5f068a205', -- admin@cyberguard.com (CEO)
    2,
    true,
    '46b1c048-85a1-423b-96fc-776007c8de1f'
);

-- Inserir aprovações para a Política de Segurança
INSERT INTO policy_approvals (
    id,
    policy_id,
    approver_id,
    approval_level,
    status,
    comments,
    approved_at,
    tenant_id
) VALUES (
    '11111111-ffff-gggg-hhhh-111111111111',
    '11111111-2222-3333-4444-555555555555',
    '2091d567-3891-4755-88df-4aa5f068a205',
    1,
    'approved',
    'Política aprovada. Excelente alinhamento com frameworks internacionais e requisitos regulatórios. Implementação imediata recomendada.',
    '2024-01-10 14:30:00+00',
    '46b1c048-85a1-423b-96fc-776007c8de1f'
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
    created_at
) VALUES 
-- Notificação de política publicada
(
    '11111111-hhhh-iiii-jjjj-111111111111',
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
    '22222222-hhhh-iiii-jjjj-222222222222',
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
    '33333333-hhhh-iiii-jjjj-333333333333',
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
    '44444444-hhhh-iiii-jjjj-444444444444',
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
    pch.version,
    pch.change_type,
    pch.change_description,
    pch.changed_at,
    p.title as policy_title
FROM policy_change_history pch
JOIN policies p ON pch.policy_id = p.id
WHERE pch.tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY pch.changed_at;