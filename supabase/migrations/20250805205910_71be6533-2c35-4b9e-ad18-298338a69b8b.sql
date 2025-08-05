-- Inserir mais controles para o framework ISO 27001 existente
INSERT INTO framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.5.2', 'Revisão da política de segurança da informação', 'Políticas de Segurança', 'A.5.2.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.6.1', 'Organização interna', 'Organização da Segurança', 'A.6.1.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.6.2', 'Dispositivos móveis e trabalho remoto', 'Organização da Segurança', 'A.6.2.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.7.1', 'Antes da contratação', 'Segurança de RH', 'A.7.1.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.7.2', 'Durante a contratação', 'Segurança de RH', 'A.7.2.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.8.1', 'Responsabilidade pelos ativos', 'Gestão de Ativos', 'A.8.1.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.8.2', 'Classificação da informação', 'Gestão de Ativos', 'A.8.2.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.9.1', 'Gerenciamento de acesso', 'Controle de Acesso', 'A.9.1.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.9.2', 'Gerenciamento de privilégios', 'Controle de Acesso', 'A.9.2.1'),
  ('7795f29f-365a-47bd-91c0-fa2adba5a71e', 'A.10.1', 'Controles criptográficos', 'Criptografia', 'A.10.1.1');

-- Inserir mais controles para o framework ISO/IEC 27001:2022
INSERT INTO framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
  ('2339d593-8e6c-4322-99df-7748dcaf4031', 'A.5.2', 'Papéis e responsabilidades de segurança da informação', 'Políticas de Segurança', 'A.5.2'),
  ('2339d593-8e6c-4322-99df-7748dcaf4031', 'A.5.3', 'Segregação de funções', 'Políticas de Segurança', 'A.5.3'),
  ('2339d593-8e6c-4322-99df-7748dcaf4031', 'A.8.2', 'Classificação da informação', 'Gestão de Ativos', 'A.8.2'),
  ('2339d593-8e6c-4322-99df-7748dcaf4031', 'A.8.3', 'Tratamento de mídias', 'Gestão de Ativos', 'A.8.3'),
  ('2339d593-8e6c-4322-99df-7748dcaf4031', 'A.9.1', 'Controle de acesso à informação e outros ativos associados', 'Controle de Acesso', 'A.9.1'),
  ('2339d593-8e6c-4322-99df-7748dcaf4031', 'A.9.2', 'Gerenciamento de acesso de usuário', 'Controle de Acesso', 'A.9.2');

-- Inserir controles para NIST-CSF
INSERT INTO framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'ID.AM-1', 'Inventário de dispositivos físicos e sistemas', 'Identificar', 'ID.AM-1'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'ID.AM-2', 'Inventário de plataformas de software e aplicações', 'Identificar', 'ID.AM-2'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'ID.AM-3', 'Fluxos de comunicação e dados organizacionais', 'Identificar', 'ID.AM-3'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'PR.AC-1', 'Identidades e credenciais são emitidas e gerenciadas', 'Proteger', 'PR.AC-1'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'PR.AC-2', 'Acesso físico aos ativos é gerenciado e protegido', 'Proteger', 'PR.AC-2'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'DE.AE-1', 'Linha de base de atividades de rede e eventos', 'Detectar', 'DE.AE-1'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'DE.AE-2', 'Eventos detectados são analisados', 'Detectar', 'DE.AE-2'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'RS.RP-1', 'Plano de resposta a incidentes é executado', 'Responder', 'RS.RP-1'),
  ('08467e75-de58-4b25-be11-3bda22ecd6ad', 'RC.RP-1', 'Plano de recuperação é executado', 'Recuperar', 'RC.RP-1');

-- Inserir controles para LGPD
INSERT INTO framework_controls (framework_id, control_code, control_text, domain, control_reference) VALUES
  ('9a2c01e5-74de-418b-8582-7e629a29183e', 'Art.7', 'Tratamento de dados pessoais deve ter base legal', 'Fundamentos', 'Art.7'),
  ('9a2c01e5-74de-418b-8582-7e629a29183e', 'Art.8', 'Consentimento deve ser livre, informado e inequívoco', 'Consentimento', 'Art.8'),
  ('9a2c01e5-74de-418b-8582-7e629a29183e', 'Art.9', 'Consentimento deve ser por escrito ou meio equivalente', 'Consentimento', 'Art.9'),
  ('9a2c01e5-74de-418b-8582-7e629a29183e', 'Art.46', 'Controlador deve adotar medidas de segurança técnicas e administrativas', 'Segurança', 'Art.46'),
  ('9a2c01e5-74de-418b-8582-7e629a29183e', 'Art.47', 'Operadores devem realizar tratamento conforme instruções do controlador', 'Segurança', 'Art.47'),
  ('9a2c01e5-74de-418b-8582-7e629a29183e', 'Art.48', 'Comunicação de incidente de segurança à autoridade nacional', 'Incidentes', 'Art.48');

-- Criar alguns assessments adicionais de exemplo
INSERT INTO assessments (name, framework_id_on_creation, status, due_date, progress, created_by_user_id) VALUES
  ('Assessment NIST CSF 2025', '08467e75-de58-4b25-be11-3bda22ecd6ad', 'Em Andamento', '2025-12-31', 25, '6c2adffe-d2e2-4368-a3a5-7024ae208427'),
  ('Conformidade LGPD Q1', '9a2c01e5-74de-418b-8582-7e629a29183e', 'Não Iniciado', '2025-03-31', 0, '6c2adffe-d2e2-4368-a3a5-7024ae208427'),
  ('ISO 27001:2022 Completo', '2339d593-8e6c-4322-99df-7748dcaf4031', 'Em Revisão', '2025-06-30', 75, '6c2adffe-d2e2-4368-a3a5-7024ae208427');