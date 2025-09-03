-- ============================================================================
-- ADIÇÃO DE MAPEAMENTOS CRIPTOGRÁFICOS PARA TABELAS IMPORTANTES
-- ============================================================================
-- Adiciona mapeamentos para tabelas críticas que estavam faltando

INSERT INTO crypto_field_mapping (module_name, table_name, field_name, encryption_purpose, description, data_classification, retention_days) VALUES

-- ============================================================================
-- MÓDULO VENDORS (Fornecedores)
-- ============================================================================
('vendors', 'vendors', 'name', 'general', 'Nome do fornecedor', 'internal', 2555),
('vendors', 'vendors', 'contact_person', 'pii', 'Pessoa de contato do fornecedor', 'confidential', 2555),
('vendors', 'vendors', 'email', 'pii', 'E-mail do fornecedor', 'confidential', 2555),
('vendors', 'vendors', 'phone', 'pii', 'Telefone do fornecedor', 'confidential', 2555),
('vendors', 'vendors', 'address', 'pii', 'Endereço do fornecedor', 'confidential', 2555),

-- Contatos de Fornecedores
('vendors', 'vendor_contacts', 'name', 'pii', 'Nome do contato do fornecedor', 'confidential', 2555),
('vendors', 'vendor_contacts', 'email', 'pii', 'E-mail do contato', 'confidential', 2555),
('vendors', 'vendor_contacts', 'phone', 'pii', 'Telefone do contato', 'confidential', 2555),
('vendors', 'vendor_contacts', 'department', 'general', 'Departamento do contato', 'internal', 1825),
('vendors', 'vendor_contacts', 'role', 'general', 'Função do contato', 'internal', 1825),
('vendors', 'vendor_contacts', 'notes', 'general', 'Notas sobre o contato', 'internal', 1095),

-- ============================================================================
-- MÓDULO PRIVACY (Privacidade/LGPD)
-- ============================================================================

-- Atividades de Processamento
('privacy', 'processing_activities', 'name', 'compliance', 'Nome da atividade de processamento', 'confidential', 2555),
('privacy', 'processing_activities', 'description', 'compliance', 'Descrição da atividade', 'confidential', 2555),
('privacy', 'processing_activities', 'purpose', 'compliance', 'Finalidade do processamento', 'confidential', 2555),
('privacy', 'processing_activities', 'data_categories', 'pii', 'Categorias de dados pessoais', 'restricted', 2555),
('privacy', 'processing_activities', 'data_subjects', 'pii', 'Titulares dos dados', 'restricted', 2555),
('privacy', 'processing_activities', 'data_recipients', 'pii', 'Destinatários dos dados', 'restricted', 2555),
('privacy', 'processing_activities', 'retention_criteria', 'compliance', 'Critérios de retenção', 'confidential', 2555),
('privacy', 'processing_activities', 'security_measures', 'compliance', 'Medidas de segurança', 'confidential', 2555),
('privacy', 'processing_activities', 'transfer_countries', 'compliance', 'Países de transferência', 'confidential', 2555),
('privacy', 'processing_activities', 'transfer_safeguards', 'compliance', 'Salvaguardas de transferência', 'confidential', 2555),
('privacy', 'processing_activities', 'automated_decision_description', 'compliance', 'Descrição de decisão automatizada', 'confidential', 2555),

-- Solicitações de Titulares
('privacy', 'data_subject_requests', 'data_subject_name', 'pii', 'Nome do titular dos dados', 'restricted', 2555),
('privacy', 'data_subject_requests', 'data_subject_email', 'pii', 'E-mail do titular', 'restricted', 2555),
('privacy', 'data_subject_requests', 'data_subject_phone', 'pii', 'Telefone do titular', 'restricted', 2555),
('privacy', 'data_subject_requests', 'data_subject_document', 'pii', 'Documento do titular', 'restricted', 2555),
('privacy', 'data_subject_requests', 'description', 'compliance', 'Descrição da solicitação', 'confidential', 2555),
('privacy', 'data_subject_requests', 'response_details', 'compliance', 'Detalhes da resposta', 'confidential', 2555),
('privacy', 'data_subject_requests', 'verification_code', 'compliance', 'Código de verificação', 'restricted', 2555),

-- Incidentes de Privacidade
('privacy', 'privacy_incidents', 'title', 'compliance', 'Título do incidente de privacidade', 'confidential', 2555),
('privacy', 'privacy_incidents', 'description', 'compliance', 'Descrição do incidente', 'confidential', 2555),
('privacy', 'privacy_incidents', 'data_categories', 'pii', 'Categorias de dados afetadas', 'restricted', 2555),
('privacy', 'privacy_incidents', 'potential_impact', 'compliance', 'Impacto potencial', 'confidential', 2555),
('privacy', 'privacy_incidents', 'containment_measures', 'compliance', 'Medidas de contenção', 'confidential', 2555),
('privacy', 'privacy_incidents', 'corrective_actions', 'compliance', 'Ações corretivas', 'confidential', 2555),
('privacy', 'privacy_incidents', 'risk_assessment', 'compliance', 'Avaliação de risco', 'confidential', 2555),
('privacy', 'privacy_incidents', 'lessons_learned', 'compliance', 'Lições aprendidas', 'confidential', 2555),

-- ============================================================================
-- MÓDULO SECURITY (Segurança)
-- ============================================================================

-- Incidentes de Segurança
('security', 'security_incidents', 'title', 'audit', 'Título do incidente de segurança', 'confidential', 2555),
('security', 'security_incidents', 'description', 'audit', 'Descrição do incidente', 'confidential', 2555),
('security', 'security_incidents', 'affected_systems', 'audit', 'Sistemas afetados', 'confidential', 2555),

-- ============================================================================
-- MÓDULO POLICIES (Políticas)
-- ============================================================================
('policies', 'policies', 'title', 'compliance', 'Título da política', 'internal', 2555),
('policies', 'policies', 'description', 'compliance', 'Descrição da política', 'internal', 2555),
('policies', 'policies', 'content', 'compliance', 'Conteúdo da política', 'confidential', 2555),
('policies', 'policies', 'metadata', 'general', 'Metadados da política', 'internal', 1825),

-- ============================================================================
-- MÓDULO ASSESSMENTS (Avaliações)
-- ============================================================================
('assessments', 'assessments', 'name', 'general', 'Nome da avaliação', 'internal', 1825),

-- Evidências de Avaliação
('assessments', 'assessment_evidence', 'evidence_data', 'audit', 'Dados da evidência', 'confidential', 2555),
('assessments', 'assessment_evidence', 'description', 'audit', 'Descrição da evidência', 'confidential', 2555),

-- Respostas de Avaliação
('assessments', 'assessment_responses', 'response_data', 'audit', 'Dados da resposta', 'confidential', 2555),
('assessments', 'assessment_responses', 'comments', 'audit', 'Comentários da resposta', 'confidential', 2555),

-- ============================================================================
-- MÓDULO AI (Inteligência Artificial)
-- ============================================================================

-- Logs de Chat AI
('ai', 'ai_chat_logs', 'user_message', 'general', 'Mensagem do usuário', 'internal', 365),
('ai', 'ai_chat_logs', 'ai_response', 'general', 'Resposta da IA', 'internal', 365),
('ai', 'ai_chat_logs', 'context_data', 'general', 'Dados de contexto', 'internal', 365),

-- Configurações de IA
('ai', 'ai_configurations', 'configuration_data', 'general', 'Dados de configuração da IA', 'internal', 1095),
('ai', 'ai_configurations', 'api_keys', 'general', 'Chaves de API (já criptografadas)', 'restricted', 1095),

-- ============================================================================
-- MÓDULO INTEGRATIONS (Integrações)
-- ============================================================================

-- Conexões de API
('integrations', 'api_connections', 'connection_name', 'general', 'Nome da conexão', 'internal', 1095),
('integrations', 'api_connections', 'api_key', 'general', 'Chave da API (já criptografada)', 'restricted', 1095),
('integrations', 'api_connections', 'configuration', 'general', 'Configuração da conexão', 'confidential', 1095),

-- Provedores de E-mail
('integrations', 'email_providers', 'provider_name', 'general', 'Nome do provedor', 'internal', 1095),
('integrations', 'email_providers', 'smtp_username', 'general', 'Usuário SMTP', 'confidential', 1095),
('integrations', 'email_providers', 'smtp_password', 'general', 'Senha SMTP (já criptografada)', 'restricted', 1095),
('integrations', 'email_providers', 'api_key', 'general', 'Chave da API (já criptografada)', 'restricted', 1095),

-- Provedores SSO
('integrations', 'sso_providers', 'provider_name', 'general', 'Nome do provedor SSO', 'internal', 1095),
('integrations', 'sso_providers', 'client_id', 'general', 'ID do cliente', 'confidential', 1095),
('integrations', 'sso_providers', 'client_secret', 'general', 'Segredo do cliente (já criptografado)', 'restricted', 1095),
('integrations', 'sso_providers', 'configuration', 'general', 'Configuração do SSO', 'confidential', 1095),

-- ============================================================================
-- MÓDULO ACTIVITY LOGS (Logs de Atividade)
-- ============================================================================
('activity', 'activity_logs', 'user_agent', 'audit', 'User agent do navegador', 'internal', 1095),
('activity', 'activity_logs', 'ip_address', 'audit', 'Endereço IP', 'confidential', 1095),
('activity', 'activity_logs', 'details', 'audit', 'Detalhes da atividade', 'confidential', 1095),

-- ============================================================================
-- MÓDULO CONSENTS (Consentimentos)
-- ============================================================================
('privacy', 'consents', 'consent_data', 'pii', 'Dados do consentimento', 'restricted', 2555),
('privacy', 'consents', 'purpose_description', 'compliance', 'Descrição da finalidade', 'confidential', 2555),

-- ============================================================================
-- MÓDULO LEGAL BASES (Bases Legais)
-- ============================================================================
('privacy', 'legal_bases', 'description', 'compliance', 'Descrição da base legal', 'confidential', 2555),
('privacy', 'legal_bases', 'legal_text', 'compliance', 'Texto legal', 'confidential', 2555),

-- ============================================================================
-- MÓDULO DPIA (Avaliação de Impacto)
-- ============================================================================
('privacy', 'dpia_assessments', 'assessment_data', 'compliance', 'Dados da avaliação DPIA', 'confidential', 2555),
('privacy', 'dpia_assessments', 'risk_analysis', 'compliance', 'Análise de risco', 'confidential', 2555),
('privacy', 'dpia_assessments', 'mitigation_measures', 'compliance', 'Medidas de mitigação', 'confidential', 2555)

ON CONFLICT (table_name, field_name) DO NOTHING;