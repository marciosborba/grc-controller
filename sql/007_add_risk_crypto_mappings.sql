-- ============================================================================
-- ADIÇÃO DE MAPEAMENTOS CRIPTOGRÁFICOS PARA TABELAS DE RISCO
-- ============================================================================
-- Adiciona mapeamentos para todas as tabelas relacionadas a gestão de riscos

INSERT INTO crypto_field_mapping (module_name, table_name, field_name, encryption_purpose, description, data_classification, retention_days) VALUES

-- ============================================================================
-- MÓDULO RISK REGISTRATIONS (Registro de Riscos)
-- ============================================================================
('risks', 'risk_registrations', 'risk_title', 'general', 'Título do risco', 'internal', 2555),
('risks', 'risk_registrations', 'risk_description', 'general', 'Descrição detalhada do risco', 'confidential', 2555),
('risks', 'risk_registrations', 'risk_code', 'general', 'Código identificador do risco', 'internal', 2555),
('risks', 'risk_registrations', 'assigned_to_name', 'pii', 'Nome do responsável pelo risco', 'confidential', 2555),
('risks', 'risk_registrations', 'business_area', 'general', 'Área de negócio afetada', 'internal', 2555),
('risks', 'risk_registrations', 'responsible_area', 'general', 'Área responsável pelo risco', 'internal', 2555),
('risks', 'risk_registrations', 'analysis_notes', 'general', 'Notas da análise de risco', 'confidential', 2555),
('risks', 'risk_registrations', 'closure_criteria', 'general', 'Critérios para fechamento', 'internal', 2555),
('risks', 'risk_registrations', 'closure_notes', 'general', 'Notas de fechamento', 'confidential', 2555),
('risks', 'risk_registrations', 'communication_plan', 'general', 'Plano de comunicação', 'confidential', 2555),
('risks', 'risk_registrations', 'methodology_config', 'general', 'Configuração da metodologia', 'internal', 2555),
('risks', 'risk_registrations', 'monitoring_indicators', 'general', 'Indicadores de monitoramento', 'internal', 2555),
('risks', 'risk_registrations', 'monitoring_notes', 'general', 'Notas de monitoramento', 'confidential', 2555),
('risks', 'risk_registrations', 'monitoring_responsible', 'pii', 'Responsável pelo monitoramento', 'confidential', 2555),
('risks', 'risk_registrations', 'kpi_definition', 'general', 'Definição dos KPIs', 'internal', 2555),
('risks', 'risk_registrations', 'treatment_rationale', 'general', 'Justificativa do tratamento', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK ACCEPTANCE LETTERS (Cartas de Aceitação de Risco)
-- ============================================================================
('risks', 'risk_acceptance_letters', 'title', 'compliance', 'Título da carta de aceitação', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'letter_number', 'compliance', 'Número da carta', 'internal', 2555),
('risks', 'risk_acceptance_letters', 'risk_description', 'compliance', 'Descrição do risco aceito', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'acceptance_rationale', 'compliance', 'Justificativa da aceitação', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'business_justification', 'compliance', 'Justificativa de negócio', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'compensating_controls', 'compliance', 'Controles compensatórios', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'conditions_and_limitations', 'compliance', 'Condições e limitações', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'escalation_triggers', 'compliance', 'Gatilhos de escalação', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'monitoring_requirements', 'compliance', 'Requisitos de monitoramento', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'stakeholder_notifications', 'compliance', 'Notificações aos stakeholders', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'manager_comments', 'compliance', 'Comentários do gerente', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'director_comments', 'compliance', 'Comentários do diretor', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'cro_comments', 'compliance', 'Comentários do CRO', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'board_comments', 'compliance', 'Comentários do conselho', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'rejection_reason', 'compliance', 'Motivo da rejeição', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'revocation_reason', 'compliance', 'Motivo da revogação', 'confidential', 2555),
('risks', 'risk_acceptance_letters', 'audit_trail', 'audit', 'Trilha de auditoria', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK ACTION PLANS (Planos de Ação de Risco)
-- ============================================================================
('risks', 'risk_action_plans', 'description', 'general', 'Descrição do plano de ação', 'confidential', 2555),
('risks', 'risk_action_plans', 'treatment_type', 'general', 'Tipo de tratamento', 'internal', 2555),

-- ============================================================================
-- MÓDULO RISK COMMUNICATIONS (Comunicações de Risco)
-- ============================================================================
('risks', 'risk_communications', 'person_name', 'pii', 'Nome da pessoa comunicada', 'confidential', 2555),
('risks', 'risk_communications', 'person_email', 'pii', 'E-mail da pessoa', 'confidential', 2555),
('risks', 'risk_communications', 'justification', 'general', 'Justificativa da comunicação', 'confidential', 2555),
('risks', 'risk_communications', 'decision', 'general', 'Decisão tomada', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK STAKEHOLDERS (Stakeholders de Risco)
-- ============================================================================
('risks', 'risk_stakeholders', 'name', 'pii', 'Nome do stakeholder', 'confidential', 2555),
('risks', 'risk_stakeholders', 'email', 'pii', 'E-mail do stakeholder', 'confidential', 2555),
('risks', 'risk_stakeholders', 'phone', 'pii', 'Telefone do stakeholder', 'confidential', 2555),
('risks', 'risk_stakeholders', 'position', 'pii', 'Cargo do stakeholder', 'confidential', 2555),
('risks', 'risk_stakeholders', 'response_notes', 'general', 'Notas de resposta', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK TEMPLATES (Templates de Risco)
-- ============================================================================
('risks', 'risk_templates', 'name', 'general', 'Nome do template', 'internal', 1825),
('risks', 'risk_templates', 'description', 'general', 'Descrição do template', 'internal', 1825),
('risks', 'risk_templates', 'category', 'general', 'Categoria do template', 'internal', 1825),
('risks', 'risk_templates', 'industry', 'general', 'Indústria aplicável', 'internal', 1825),
('risks', 'risk_templates', 'methodology', 'general', 'Metodologia do template', 'internal', 1825),

-- ============================================================================
-- MÓDULO VENDOR RISKS (Riscos de Fornecedores)
-- ============================================================================
('vendors', 'vendor_risks', 'title', 'general', 'Título do risco do fornecedor', 'confidential', 2555),
('vendors', 'vendor_risks', 'description', 'general', 'Descrição do risco', 'confidential', 2555),
('vendors', 'vendor_risks', 'risk_category', 'general', 'Categoria do risco', 'internal', 2555),
('vendors', 'vendor_risks', 'risk_type', 'general', 'Tipo do risco', 'internal', 2555),
('vendors', 'vendor_risks', 'treatment_strategy', 'general', 'Estratégia de tratamento', 'confidential', 2555),
('vendors', 'vendor_risks', 'alex_analysis', 'general', 'Análise da IA Alex', 'confidential', 1825),
('vendors', 'vendor_risks', 'alex_recommendations', 'general', 'Recomendações da IA Alex', 'confidential', 1825),
('vendors', 'vendor_risks', 'metadata', 'general', 'Metadados do risco', 'internal', 2555),

-- ============================================================================
-- MÓDULO RISK ADVANCED ANALYSES (Análises Avançadas de Risco)
-- ============================================================================
('risks', 'risk_advanced_analyses', 'analysis_data', 'general', 'Dados da análise avançada', 'confidential', 2555),
('risks', 'risk_advanced_analyses', 'methodology_config', 'general', 'Configuração da metodologia', 'internal', 2555),
('risks', 'risk_advanced_analyses', 'results', 'general', 'Resultados da análise', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK BOWTIE ANALYSES (Análises Bowtie)
-- ============================================================================
('risks', 'risk_bowtie_analyses', 'analysis_data', 'general', 'Dados da análise bowtie', 'confidential', 2555),
('risks', 'risk_bowtie_analyses', 'preventive_controls', 'general', 'Controles preventivos', 'confidential', 2555),
('risks', 'risk_bowtie_analyses', 'detective_controls', 'general', 'Controles detectivos', 'confidential', 2555),
('risks', 'risk_bowtie_analyses', 'corrective_controls', 'general', 'Controles corretivos', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK SCENARIO ANALYSES (Análises de Cenário)
-- ============================================================================
('risks', 'risk_scenario_analyses', 'scenario_name', 'general', 'Nome do cenário', 'internal', 2555),
('risks', 'risk_scenario_analyses', 'scenario_description', 'general', 'Descrição do cenário', 'confidential', 2555),
('risks', 'risk_scenario_analyses', 'assumptions', 'general', 'Premissas do cenário', 'confidential', 2555),
('risks', 'risk_scenario_analyses', 'impact_analysis', 'general', 'Análise de impacto', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK QUANTITATIVE MODELS (Modelos Quantitativos)
-- ============================================================================
('risks', 'risk_quantitative_models', 'model_name', 'general', 'Nome do modelo', 'internal', 2555),
('risks', 'risk_quantitative_models', 'model_description', 'general', 'Descrição do modelo', 'confidential', 2555),
('risks', 'risk_quantitative_models', 'parameters', 'general', 'Parâmetros do modelo', 'confidential', 2555),
('risks', 'risk_quantitative_models', 'formulas', 'general', 'Fórmulas do modelo', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK INTELLIGENT ANALYSES (Análises Inteligentes)
-- ============================================================================
('risks', 'risk_intelligent_analyses', 'analysis_type', 'general', 'Tipo de análise inteligente', 'internal', 1825),
('risks', 'risk_intelligent_analyses', 'ai_insights', 'general', 'Insights da IA', 'confidential', 1825),
('risks', 'risk_intelligent_analyses', 'recommendations', 'general', 'Recomendações da análise', 'confidential', 1825),
('risks', 'risk_intelligent_analyses', 'confidence_score', 'general', 'Score de confiança', 'internal', 1825),

-- ============================================================================
-- MÓDULO RISK METHODOLOGIES (Metodologias de Risco)
-- ============================================================================
('risks', 'risk_methodologies', 'name', 'general', 'Nome da metodologia', 'internal', 2555),
('risks', 'risk_methodologies', 'description', 'general', 'Descrição da metodologia', 'internal', 2555),
('risks', 'risk_methodologies', 'configuration', 'general', 'Configuração da metodologia', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK ACCEPTANCE MONITORING (Monitoramento de Aceitação)
-- ============================================================================
('risks', 'risk_acceptance_monitoring', 'monitoring_notes', 'compliance', 'Notas de monitoramento', 'confidential', 2555),
('risks', 'risk_acceptance_monitoring', 'status_change_reason', 'compliance', 'Motivo da mudança de status', 'confidential', 2555),
('risks', 'risk_acceptance_monitoring', 'escalation_notes', 'compliance', 'Notas de escalação', 'confidential', 2555),

-- ============================================================================
-- MÓDULO RISK LIBRARY TEMPLATES (Templates da Biblioteca)
-- ============================================================================
('risks', 'risk_library_templates', 'template_name', 'general', 'Nome do template da biblioteca', 'internal', 1825),
('risks', 'risk_library_templates', 'template_description', 'general', 'Descrição do template', 'internal', 1825),
('risks', 'risk_library_templates', 'template_content', 'general', 'Conteúdo do template', 'confidential', 1825),

-- ============================================================================
-- MÓDULO RISK LETTER TEMPLATES (Templates de Carta)
-- ============================================================================
('risks', 'risk_letter_templates', 'template_name', 'compliance', 'Nome do template de carta', 'internal', 2555),
('risks', 'risk_letter_templates', 'template_content', 'compliance', 'Conteúdo do template', 'confidential', 2555),
('risks', 'risk_letter_templates', 'template_variables', 'compliance', 'Variáveis do template', 'internal', 2555)

ON CONFLICT (table_name, field_name) DO NOTHING;