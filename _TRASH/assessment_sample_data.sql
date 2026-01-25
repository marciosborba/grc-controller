-- =====================================================
-- DADOS DE EXEMPLO - MÓDULO DE ASSESSMENT
-- =====================================================
-- Este arquivo contém dados de exemplo para popular
-- o módulo de Assessment com frameworks padrão
-- =====================================================

-- IMPORTANTE: Substitua 'YOUR_TENANT_ID' pelo ID real do tenant
-- Exemplo: SET @tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- =====================================================
-- 1. FRAMEWORK ISO 27001:2022
-- =====================================================

-- Inserir framework ISO 27001
INSERT INTO assessment_framework_templates (
    id,
    nome,
    tipo_framework,
    versao,
    descricao,
    estrutura,
    is_active
) VALUES (
    gen_random_uuid(),
    'ISO/IEC 27001:2022 - Information Security Management',
    'ISO27001',
    '2022',
    'Framework internacional para gestão de segurança da informação baseado na norma ISO/IEC 27001:2022',
    '{
        "framework": {
            "nome": "ISO/IEC 27001:2022 - Information Security Management",
            "tipo_framework": "ISO27001",
            "versao": "2022",
            "descricao": "Framework internacional para gestão de segurança da informação baseado na norma ISO/IEC 27001:2022"
        },
        "domains": [
            {
                "nome": "Information Security Policies",
                "codigo": "A.5",
                "descricao": "Políticas de segurança da informação",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "nome": "Organization of Information Security",
                "codigo": "A.6",
                "descricao": "Organização da segurança da informação",
                "peso": 1.0,
                "ordem": 2
            },
            {
                "nome": "Human Resource Security",
                "codigo": "A.7",
                "descricao": "Segurança de recursos humanos",
                "peso": 1.0,
                "ordem": 3
            },
            {
                "nome": "Asset Management",
                "codigo": "A.8",
                "descricao": "Gestão de ativos",
                "peso": 1.0,
                "ordem": 4
            },
            {
                "nome": "Access Control",
                "codigo": "A.9",
                "descricao": "Controle de acesso",
                "peso": 1.2,
                "ordem": 5
            },
            {
                "nome": "Cryptography",
                "codigo": "A.10",
                "descricao": "Criptografia",
                "peso": 1.1,
                "ordem": 6
            },
            {
                "nome": "Physical and Environmental Security",
                "codigo": "A.11",
                "descricao": "Segurança física e do ambiente",
                "peso": 1.0,
                "ordem": 7
            },
            {
                "nome": "Operations Security",
                "codigo": "A.12",
                "descricao": "Segurança das operações",
                "peso": 1.2,
                "ordem": 8
            },
            {
                "nome": "Communications Security",
                "codigo": "A.13",
                "descricao": "Segurança das comunicações",
                "peso": 1.1,
                "ordem": 9
            },
            {
                "nome": "System Acquisition, Development and Maintenance",
                "codigo": "A.14",
                "descricao": "Aquisição, desenvolvimento e manutenção de sistemas",
                "peso": 1.1,
                "ordem": 10
            },
            {
                "nome": "Supplier Relationships",
                "codigo": "A.15",
                "descricao": "Relacionamento com fornecedores",
                "peso": 1.0,
                "ordem": 11
            },
            {
                "nome": "Information Security Incident Management",
                "codigo": "A.16",
                "descricao": "Gestão de incidentes de segurança da informação",
                "peso": 1.3,
                "ordem": 12
            },
            {
                "nome": "Information Security Aspects of Business Continuity Management",
                "codigo": "A.17",
                "descricao": "Aspectos de segurança da informação na gestão de continuidade de negócios",
                "peso": 1.1,
                "ordem": 13
            },
            {
                "nome": "Compliance",
                "codigo": "A.18",
                "descricao": "Conformidade",
                "peso": 1.2,
                "ordem": 14
            }
        ],
        "controls": [
            {
                "domain_codigo": "A.5",
                "codigo": "A.5.1.1",
                "titulo": "Policies for information security",
                "descricao": "A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "A.5",
                "codigo": "A.5.1.2",
                "titulo": "Review of the policies for information security",
                "descricao": "The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.",
                "tipo_controle": "detectivo",
                "criticidade": "media",
                "peso": 1.0,
                "ordem": 2
            },
            {
                "domain_codigo": "A.9",
                "codigo": "A.9.1.1",
                "titulo": "Access control policy",
                "descricao": "An access control policy shall be established, documented and reviewed based on business and information security requirements.",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "A.9",
                "codigo": "A.9.1.2",
                "titulo": "Access to networks and network services",
                "descricao": "Users shall only be provided with access to the network and network services that they have been specifically authorized to use.",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 2
            },
            {
                "domain_codigo": "A.12",
                "codigo": "A.12.1.1",
                "titulo": "Documented operating procedures",
                "descricao": "Operating procedures shall be documented and made available to all users who need them.",
                "tipo_controle": "preventivo",
                "criticidade": "media",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "A.12",
                "codigo": "A.12.1.2",
                "titulo": "Change management",
                "descricao": "Changes to the organization, business processes, information processing facilities and systems that affect information security shall be controlled.",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 2
            }
        ],
        "questions": [
            {
                "control_codigo": "A.5.1.1",
                "pergunta": "A organização possui políticas de segurança da informação formalmente documentadas?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["documento", "politica"],
                "ordem": 1
            },
            {
                "control_codigo": "A.5.1.1",
                "pergunta": "As políticas de segurança foram aprovadas pela alta direção?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["ata", "aprovacao"],
                "ordem": 2
            },
            {
                "control_codigo": "A.5.1.1",
                "pergunta": "Qual o nível de comunicação das políticas para funcionários e terceiros?",
                "tipo_resposta": "escala_1_5",
                "peso": 1.0,
                "evidencias_requeridas": false,
                "ordem": 3
            },
            {
                "control_codigo": "A.9.1.1",
                "pergunta": "Existe uma política de controle de acesso documentada e aprovada?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["politica", "documento"],
                "ordem": 1
            },
            {
                "control_codigo": "A.9.1.1",
                "pergunta": "A política de controle de acesso é baseada em requisitos de negócio e segurança?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": false,
                "ordem": 2
            },
            {
                "control_codigo": "A.12.1.1",
                "pergunta": "Os procedimentos operacionais estão documentados e disponíveis?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["procedimento", "manual"],
                "ordem": 1
            }
        ]
    }',
    true
);

-- =====================================================
-- 2. FRAMEWORK SOX (Sarbanes-Oxley)
-- =====================================================

INSERT INTO assessment_framework_templates (
    id,
    nome,
    tipo_framework,
    versao,
    descricao,
    estrutura,
    is_active
) VALUES (
    gen_random_uuid(),
    'SOX - Sarbanes-Oxley Act Compliance',
    'SOX',
    '2002',
    'Framework de compliance para a Lei Sarbanes-Oxley, focado em controles internos e governança corporativa',
    '{
        "framework": {
            "nome": "SOX - Sarbanes-Oxley Act Compliance",
            "tipo_framework": "SOX",
            "versao": "2002",
            "descricao": "Framework de compliance para a Lei Sarbanes-Oxley, focado em controles internos e governança corporativa"
        },
        "domains": [
            {
                "nome": "Management Assessment of Internal Controls",
                "codigo": "SOX.302",
                "descricao": "Avaliação da gestão sobre controles internos",
                "peso": 1.3,
                "ordem": 1
            },
            {
                "nome": "Auditor Attestation",
                "codigo": "SOX.404",
                "descricao": "Atestação do auditor sobre controles internos",
                "peso": 1.5,
                "ordem": 2
            },
            {
                "nome": "Corporate Responsibility",
                "codigo": "SOX.906",
                "descricao": "Responsabilidade corporativa e certificação",
                "peso": 1.2,
                "ordem": 3
            },
            {
                "nome": "Enhanced Financial Disclosures",
                "codigo": "SOX.401",
                "descricao": "Divulgações financeiras aprimoradas",
                "peso": 1.1,
                "ordem": 4
            },
            {
                "nome": "Analyst Conflicts of Interest",
                "codigo": "SOX.501",
                "descricao": "Conflitos de interesse de analistas",
                "peso": 1.0,
                "ordem": 5
            }
        ],
        "controls": [
            {
                "domain_codigo": "SOX.302",
                "codigo": "SOX.302.1",
                "titulo": "CEO/CFO Certification",
                "descricao": "CEO and CFO must certify the accuracy of financial statements and internal controls",
                "tipo_controle": "detectivo",
                "criticidade": "critica",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "SOX.404",
                "codigo": "SOX.404.1",
                "titulo": "Management Assessment",
                "descricao": "Management must assess and report on internal control over financial reporting",
                "tipo_controle": "detectivo",
                "criticidade": "critica",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "SOX.404",
                "codigo": "SOX.404.2",
                "titulo": "Auditor Attestation",
                "descricao": "External auditor must attest to management assessment of internal controls",
                "tipo_controle": "detectivo",
                "criticidade": "critica",
                "peso": 1.0,
                "ordem": 2
            }
        ],
        "questions": [
            {
                "control_codigo": "SOX.302.1",
                "pergunta": "O CEO e CFO certificam formalmente a precisão das demonstrações financeiras?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["certificacao", "documento"],
                "ordem": 1
            },
            {
                "control_codigo": "SOX.404.1",
                "pergunta": "A gestão avalia e reporta sobre controles internos de relatórios financeiros?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["relatorio", "avaliacao"],
                "ordem": 1
            }
        ]
    }',
    true
);

-- =====================================================
-- 3. FRAMEWORK NIST CYBERSECURITY
-- =====================================================

INSERT INTO assessment_framework_templates (
    id,
    nome,
    tipo_framework,
    versao,
    descricao,
    estrutura,
    is_active
) VALUES (
    gen_random_uuid(),
    'NIST Cybersecurity Framework',
    'NIST',
    '1.1',
    'Framework de cibersegurança do NIST para identificar, proteger, detectar, responder e recuperar',
    '{
        "framework": {
            "nome": "NIST Cybersecurity Framework",
            "tipo_framework": "NIST",
            "versao": "1.1",
            "descricao": "Framework de cibersegurança do NIST para identificar, proteger, detectar, responder e recuperar"
        },
        "domains": [
            {
                "nome": "Identify (ID)",
                "codigo": "ID",
                "descricao": "Desenvolver compreensão organizacional para gerenciar riscos de cibersegurança",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "nome": "Protect (PR)",
                "codigo": "PR",
                "descricao": "Desenvolver e implementar salvaguardas apropriadas",
                "peso": 1.2,
                "ordem": 2
            },
            {
                "nome": "Detect (DE)",
                "codigo": "DE",
                "descricao": "Desenvolver e implementar atividades apropriadas para identificar eventos de cibersegurança",
                "peso": 1.1,
                "ordem": 3
            },
            {
                "nome": "Respond (RS)",
                "codigo": "RS",
                "descricao": "Desenvolver e implementar atividades apropriadas para responder a eventos de cibersegurança",
                "peso": 1.3,
                "ordem": 4
            },
            {
                "nome": "Recover (RC)",
                "codigo": "RC",
                "descricao": "Desenvolver e implementar atividades apropriadas para manter planos de resiliência",
                "peso": 1.1,
                "ordem": 5
            }
        ],
        "controls": [
            {
                "domain_codigo": "ID",
                "codigo": "ID.AM-1",
                "titulo": "Physical devices and systems within the organization are inventoried",
                "descricao": "Maintain an inventory of physical devices and systems",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "PR",
                "codigo": "PR.AC-1",
                "titulo": "Identities and credentials are issued, managed, verified, revoked, and audited",
                "descricao": "Manage identities and credentials for authorized devices, users and processes",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "DE",
                "codigo": "DE.AE-1",
                "titulo": "A baseline of network operations and expected data flows is established",
                "descricao": "Establish baseline of network operations and expected data flows",
                "tipo_controle": "detectivo",
                "criticidade": "media",
                "peso": 1.0,
                "ordem": 1
            }
        ],
        "questions": [
            {
                "control_codigo": "ID.AM-1",
                "pergunta": "A organização mantém um inventário atualizado de dispositivos físicos e sistemas?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["inventario", "lista"],
                "ordem": 1
            },
            {
                "control_codigo": "PR.AC-1",
                "pergunta": "Existe um processo formal para gerenciar identidades e credenciais?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["processo", "procedimento"],
                "ordem": 1
            }
        ]
    }',
    true
);

-- =====================================================
-- 4. FRAMEWORK LGPD
-- =====================================================

INSERT INTO assessment_framework_templates (
    id,
    nome,
    tipo_framework,
    versao,
    descricao,
    estrutura,
    is_active
) VALUES (
    gen_random_uuid(),
    'LGPD - Lei Geral de Proteção de Dados',
    'LGPD',
    '2020',
    'Framework de compliance para a Lei Geral de Proteção de Dados Pessoais do Brasil',
    '{
        "framework": {
            "nome": "LGPD - Lei Geral de Proteção de Dados",
            "tipo_framework": "LGPD",
            "versao": "2020",
            "descricao": "Framework de compliance para a Lei Geral de Proteção de Dados Pessoais do Brasil"
        },
        "domains": [
            {
                "nome": "Fundamentos e Princípios",
                "codigo": "LGPD.01",
                "descricao": "Fundamentos e princípios da proteção de dados pessoais",
                "peso": 1.2,
                "ordem": 1
            },
            {
                "nome": "Tratamento de Dados Pessoais",
                "codigo": "LGPD.02",
                "descricao": "Regras para o tratamento de dados pessoais",
                "peso": 1.3,
                "ordem": 2
            },
            {
                "nome": "Direitos do Titular",
                "codigo": "LGPD.03",
                "descricao": "Direitos dos titulares de dados pessoais",
                "peso": 1.4,
                "ordem": 3
            },
            {
                "nome": "Agentes de Tratamento",
                "codigo": "LGPD.04",
                "descricao": "Responsabilidades dos agentes de tratamento",
                "peso": 1.1,
                "ordem": 4
            },
            {
                "nome": "Segurança e Boas Práticas",
                "codigo": "LGPD.05",
                "descricao": "Segurança e boas práticas no tratamento de dados",
                "peso": 1.3,
                "ordem": 5
            }
        ],
        "controls": [
            {
                "domain_codigo": "LGPD.01",
                "codigo": "LGPD.01.1",
                "titulo": "Base Legal para Tratamento",
                "descricao": "Verificar se existe base legal válida para o tratamento de dados pessoais",
                "tipo_controle": "preventivo",
                "criticidade": "critica",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "LGPD.03",
                "codigo": "LGPD.03.1",
                "titulo": "Canal de Atendimento ao Titular",
                "descricao": "Disponibilizar canal para exercício dos direitos dos titulares",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 1
            },
            {
                "domain_codigo": "LGPD.05",
                "codigo": "LGPD.05.1",
                "titulo": "Medidas de Segurança",
                "descricao": "Implementar medidas técnicas e administrativas de segurança",
                "tipo_controle": "preventivo",
                "criticidade": "alta",
                "peso": 1.0,
                "ordem": 1
            }
        ],
        "questions": [
            {
                "control_codigo": "LGPD.01.1",
                "pergunta": "A organização identificou e documentou as bases legais para todos os tratamentos de dados pessoais?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["mapeamento", "documento"],
                "ordem": 1
            },
            {
                "control_codigo": "LGPD.03.1",
                "pergunta": "Existe um canal específico para atendimento de solicitações dos titulares de dados?",
                "tipo_resposta": "sim_nao",
                "peso": 1.0,
                "evidencias_requeridas": true,
                "tipos_evidencia": ["canal", "processo"],
                "ordem": 1
            }
        ]
    }',
    true
);

-- =====================================================
-- COMENTÁRIOS E INSTRUÇÕES
-- =====================================================

-- Para usar estes templates:
-- 1. Execute este script no seu banco Supabase
-- 2. Acesse o módulo de Assessment
-- 3. Vá em "Frameworks" > "Templates Disponíveis"
-- 4. Importe os templates desejados
-- 5. Customize conforme necessário

-- Os templates incluem:
-- - Estrutura completa de domínios e controles
-- - Questões de exemplo para cada controle
-- - Pesos e criticidades configurados
-- - Tipos de evidências sugeridos

-- Após importar, você pode:
-- - Adicionar mais questões
-- - Customizar pesos e pontuações
-- - Adaptar para sua organização
-- - Criar assessments baseados nos frameworks