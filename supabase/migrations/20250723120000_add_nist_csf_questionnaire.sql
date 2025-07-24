
-- Inserir um novo questionário de avaliação de fornecedor baseado no NIST CSF 2.0

-- 1. Inserir um novo fornecedor (ou usar um existente)
-- Para este exemplo, vamos assumir que um fornecedor já existe.
-- Se necessário, descomente a linha abaixo para inserir um novo fornecedor.
-- INSERT INTO public.vendors (name, category, risk_level, status) VALUES ('Fornecedor de Tecnologia Crítica', 'Tecnologia', 'high', 'active');

-- 2. Inserir a avaliação do fornecedor com o questionário NIST CSF 2.0
INSERT INTO public.vendor_assessments (
    id,
    vendor_id,
    title,
    status,
    questionnaire_data,
    responses,
    score,
    risk_rating,
    created_by
)
SELECT
    'a1b2c3d4-e5f6-7890-1234-567890abcdef', -- ID Fixo para a nova avaliação
    (SELECT id FROM public.vendors ORDER BY created_at LIMIT 1), -- Associa ao primeiro fornecedor
    'Avaliação de Segurança NIST CSF 2.0',
    'sent',
    '{
        "title": "Questionário de Segurança Cibernética NIST CSF 2.0",
        "framework": "NIST CSF 2.0",
        "questions": [
            {
                "id": "nist_gv_1",
                "question": "A organização estabeleceu e comunicou uma estratégia de gerenciamento de riscos de cibersegurança?",
                "type": "boolean",
                "weight": 10,
                "required": true,
                "maturity_level": "defined",
                "category": "Govern"
            },
            {
                "id": "nist_gv_2",
                "question": "Existem políticas e procedimentos para supervisionar a estratégia de cibersegurança?",
                "type": "boolean",
                "weight": 10,
                "required": true,
                "maturity_level": "managed",
                "category": "Govern"
            },
            {
                "id": "nist_id_1",
                "question": "A organização identifica e documenta os ativos (sistemas, dados, etc.) que precisam de proteção?",
                "type": "boolean",
                "weight": 9,
                "required": true,
                "maturity_level": "managed",
                "category": "Identify"
            },
            {
                "id": "nist_id_2",
                "question": "As ameaças e vulnerabilidades aos ativos críticos são identificadas e avaliadas?",
                "type": "select",
                "options": ["Sim, continuamente", "Sim, periodicamente", "Parcialmente", "Não"],
                "weight": 9,
                "required": true,
                "maturity_level": "quantitatively_managed",
                "category": "Identify"
            },
            {
                "id": "nist_pr_1",
                "question": "Controles de acesso (físico e lógico) são implementados para proteger os ativos?",
                "type": "boolean",
                "weight": 8,
                "required": true,
                "maturity_level": "defined",
                "category": "Protect"
            },
            {
                "id": "nist_pr_2",
                "question": "A equipe recebe treinamento de conscientização em segurança cibernética?",
                "type": "select",
                "options": ["Regularmente (anual/semestral)", "Apenas na contratação", "Raramente", "Não"],
                "weight": 8,
                "required": true,
                "maturity_level": "managed",
                "category": "Protect"
            },
            {
                "id": "nist_de_1",
                "question": "A rede e os sistemas são monitorados para detectar eventos de segurança anômalos?",
                "type": "boolean",
                "weight": 9,
                "required": true,
                "maturity_level": "quantitatively_managed",
                "category": "Detect"
            },
            {
                "id": "nist_de_2",
                "question": "Existem processos para analisar e investigar alertas de segurança?",
                "type": "boolean",
                "weight": 9,
                "required": true,
                "maturity_level": "defined",
                "category": "Detect"
            },
            {
                "id": "nist_rs_1",
                "question": "Existe um plano de resposta a incidentes documentado e testado?",
                "type": "boolean",
                "weight": 10,
                "required": true,
                "maturity_level": "defined",
                "category": "Respond"
            },
            {
                "id": "nist_rs_2",
                "question": "As atividades de resposta a incidentes são coordenadas com as partes interessadas internas e externas?",
                "type": "boolean",
                "weight": 8,
                "required": true,
                "maturity_level": "managed",
                "category": "Respond"
            },
            {
                "id": "nist_rc_1",
                "question": "Existe um plano de recuperação de desastres para restaurar sistemas e dados?",
                "type": "boolean",
                "weight": 10,
                "required": true,
                "maturity_level": "defined",
                "category": "Recover"
            },
            {
                "id": "nist_rc_2",
                "question": "Os planos de recuperação são testados e atualizados regularmente?",
                "type": "select",
                "options": ["Sim, anualmente ou mais", "Sim, mas não regularmente", "Não são testados", "Não existe plano"],
                "weight": 9,
                "required": true,
                "maturity_level": "managed",
                "category": "Recover"
            }
        ]
    }',
    '{}', -- Respostas vazias inicialmente
    0, -- Score inicial
    'medium', -- Classificação de risco inicial
    (SELECT id FROM auth.users LIMIT 1) -- Associa ao primeiro usuário como criador
ON CONFLICT (id) DO NOTHING; -- Não faz nada se a avaliação com este ID já existir
