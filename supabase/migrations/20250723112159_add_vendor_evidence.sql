-- Create storage bucket for vendor assessment evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-evidence', 'vendor-evidence', false);

-- Create policies for vendor evidence storage
CREATE POLICY "Users can view vendor evidence"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vendor-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload vendor evidence"
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'vendor-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update vendor evidence"
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'vendor-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete vendor evidence"
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'vendor-evidence' AND auth.role() = 'authenticated');

-- Add evidence_files column to vendor_assessments table
ALTER TABLE vendor_assessments ADD COLUMN evidence_files jsonb DEFAULT '[]';

-- Insert dummy data for vendor assessments
INSERT INTO vendor_assessments (
    id,
    vendor_id, 
    title, 
    status, 
    questionnaire_data,
    responses,
    score,
    risk_rating,
    created_by,
    evidence_files
) VALUES 
(
    'ac8b2c48-1234-4567-8901-1a2b3c4d5e6f',
    (SELECT id FROM vendors LIMIT 1),
    'Avaliação de Segurança da Informação - Q1 2024',
    'completed',
    '{
        "title": "Questionário de Segurança da Informação",
        "framework": "ISO 27001",
        "questions": [
            {
                "id": "q1",
                "question": "A empresa possui certificação ISO 27001?",
                "type": "boolean",
                "weight": 10,
                "required": true,
                "maturity_level": "optimized"
            },
            {
                "id": "q2", 
                "question": "Qual é a frequência de backup dos dados?",
                "type": "select",
                "options": ["Diário", "Semanal", "Mensal", "Não realiza backup"],
                "weight": 8,
                "required": true,
                "maturity_level": "managed"
            },
            {
                "id": "q3",
                "question": "A empresa possui um plano de continuidade de negócios?", 
                "type": "boolean",
                "weight": 9,
                "required": true,
                "maturity_level": "defined"
            },
            {
                "id": "q4",
                "question": "Quais medidas de controle de acesso são implementadas?",
                "type": "multiple",
                "options": ["Autenticação de dois fatores", "Controle por biometria", "Senhas complexas", "Revisão periódica de acessos"],
                "weight": 7,
                "required": true,
                "maturity_level": "quantitatively_managed"
            },
            {
                "id": "q5",
                "question": "Descreva os procedimentos de resposta a incidentes",
                "type": "text",
                "weight": 6,
                "required": true,
                "maturity_level": "initial"
            }
        ]
    }',
    '{
        "q1": true,
        "q2": "Diário", 
        "q3": true,
        "q4": ["Autenticação de dois fatores", "Senhas complexas", "Revisão periódica de acessos"],
        "q5": "A empresa possui um processo estruturado de resposta a incidentes com equipe dedicada, comunicação clara com stakeholders e documentação detalhada de todas as etapas."
    }',
    85,
    'medium',
    (SELECT id FROM profiles LIMIT 1),
    '[
        {
            "question_id": "q1",
            "files": [
                {
                    "name": "certificado_iso27001.pdf",
                    "type": "application/pdf", 
                    "size": 2048576,
                    "upload_date": "2024-01-15T10:30:00Z"
                }
            ]
        },
        {
            "question_id": "q3", 
            "files": [
                {
                    "name": "plano_continuidade_negocios.docx",
                    "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "size": 1024768,
                    "upload_date": "2024-01-15T11:45:00Z"
                },
                {
                    "name": "teste_dr_2023.xlsx",
                    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    "size": 512384,
                    "upload_date": "2024-01-15T12:15:00Z"
                }
            ]
        }
    ]'
),
(
    'bc9d3e59-2345-5678-9012-2b3c4d5e6f7a',
    (SELECT id FROM vendors LIMIT 1),
    'Avaliação de Compliance LGPD - 2024',
    'in_progress', 
    '{
        "title": "Questionário de Compliance LGPD",
        "framework": "LGPD",
        "questions": [
            {
                "id": "q1",
                "question": "A empresa possui DPO (Data Protection Officer) designado?",
                "type": "boolean",
                "weight": 10,
                "required": true,
                "maturity_level": "defined"
            },
            {
                "id": "q2",
                "question": "É realizada DPIA (Avaliação de Impacto à Proteção de Dados)?",
                "type": "boolean", 
                "weight": 9,
                "required": true,
                "maturity_level": "managed"
            },
            {
                "id": "q3",
                "question": "Qual o tempo máximo para notificação de incidentes à ANPD?",
                "type": "select",
                "options": ["24 horas", "48 horas", "72 horas", "Mais de 72 horas"],
                "weight": 8,
                "required": true,
                "maturity_level": "quantitatively_managed"
            }
        ]
    }',
    '{
        "q1": true,
        "q2": false,
        "q3": "72 horas"
    }',
    68,
    'high',
    (SELECT id FROM profiles LIMIT 1),
    '[
        {
            "question_id": "q1",
            "files": [
                {
                    "name": "termo_nomeacao_dpo.pdf", 
                    "type": "application/pdf",
                    "size": 1536000,
                    "upload_date": "2024-02-10T14:20:00Z"
                }
            ]
        }
    ]'
);