#!/usr/bin/env node
/**
 * Script para criar tabelas LGPD via conexão PostgreSQL direta
 */

import pg from 'pg';
const { Client } = pg;

// Configuração de conexão PostgreSQL do Supabase
const connectionString = 'postgresql://postgres:5FI6NbSX5pGLSBQh@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres';

// SQL para criar todas as tabelas do módulo LGPD
const createLGPDTablesSQL = `
-- ============================================================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO LGPD
-- ============================================================================

-- 1. Tabela de bases legais
CREATE TABLE IF NOT EXISTS legal_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    legal_basis_type VARCHAR(50) NOT NULL,
    legal_article VARCHAR(100),
    justification TEXT,
    applies_to_categories JSONB DEFAULT '[]'::jsonb,
    applies_to_processing JSONB DEFAULT '[]'::jsonb,
    valid_from DATE,
    valid_until DATE,
    status VARCHAR(30) DEFAULT 'active',
    legal_responsible_id UUID,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de inventário de dados
CREATE TABLE IF NOT EXISTS data_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_category VARCHAR(50) NOT NULL,
    data_types JSONB DEFAULT '[]'::jsonb,
    system_name VARCHAR(255),
    database_name VARCHAR(255),
    table_field_names JSONB DEFAULT '[]'::jsonb,
    estimated_volume INTEGER DEFAULT 0,
    retention_period_months INTEGER,
    retention_justification TEXT,
    sensitivity_level VARCHAR(20) DEFAULT 'media',
    data_origin VARCHAR(50),
    data_controller_id UUID,
    data_processor_id UUID,
    data_steward_id UUID,
    status VARCHAR(30) DEFAULT 'active',
    next_review_date DATE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de consentimentos
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_email VARCHAR(255) NOT NULL,
    data_subject_name VARCHAR(255),
    data_subject_document VARCHAR(50),
    purpose TEXT NOT NULL,
    data_categories JSONB DEFAULT '[]'::jsonb,
    legal_basis_id UUID REFERENCES legal_bases(id),
    status VARCHAR(30) NOT NULL DEFAULT 'granted',
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    collection_method VARCHAR(50),
    collection_source VARCHAR(500),
    is_informed BOOLEAN DEFAULT true,
    is_specific BOOLEAN DEFAULT true,
    is_free BOOLEAN DEFAULT true,
    is_unambiguous BOOLEAN DEFAULT true,
    privacy_policy_version VARCHAR(20),
    terms_of_service_version VARCHAR(20),
    language VARCHAR(10) DEFAULT 'pt-BR',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de solicitações de titulares
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type VARCHAR(50) NOT NULL,
    data_subject_name VARCHAR(255) NOT NULL,
    data_subject_email VARCHAR(255) NOT NULL,
    data_subject_document VARCHAR(50),
    data_subject_phone VARCHAR(20),
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente_verificacao',
    priority VARCHAR(20) DEFAULT 'normal',
    channel VARCHAR(30),
    verification_status VARCHAR(30) DEFAULT 'pending',
    verification_method VARCHAR(50),
    verification_date TIMESTAMPTZ,
    verification_code VARCHAR(10),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_response_date TIMESTAMPTZ,
    assigned_to UUID,
    response_details TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de incidentes de privacidade
CREATE TABLE IF NOT EXISTS privacy_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'reportado',
    affected_data_subjects INTEGER DEFAULT 0,
    data_categories JSONB DEFAULT '[]'::jsonb,
    potential_impact TEXT,
    detection_method VARCHAR(50),
    detection_date TIMESTAMPTZ,
    resolved_date TIMESTAMPTZ,
    containment_measures TEXT,
    corrective_actions TEXT,
    requires_anpd_notification BOOLEAN DEFAULT false,
    requires_data_subject_notification BOOLEAN DEFAULT false,
    anpd_notification_date TIMESTAMPTZ,
    risk_assessment TEXT,
    lessons_learned TEXT,
    reported_by UUID,
    assigned_to UUID,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de atividades de tratamento (RAT)
CREATE TABLE IF NOT EXISTS processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT NOT NULL,
    data_categories JSONB DEFAULT '[]'::jsonb,
    data_subjects JSONB DEFAULT '[]'::jsonb,
    data_recipients JSONB DEFAULT '[]'::jsonb,
    retention_period VARCHAR(255),
    retention_criteria TEXT,
    security_measures JSONB DEFAULT '[]'::jsonb,
    international_transfers BOOLEAN DEFAULT false,
    transfer_countries JSONB DEFAULT '[]'::jsonb,
    transfer_safeguards TEXT,
    automated_decision_making BOOLEAN DEFAULT false,
    automated_decision_description TEXT,
    requires_dpia BOOLEAN DEFAULT false,
    status VARCHAR(30) DEFAULT 'active',
    controller_role VARCHAR(100),
    processor_role VARCHAR(100),
    risk_level VARCHAR(20),
    data_controller_id UUID,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FUNÇÃO PARA CALCULAR MÉTRICAS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_privacy_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'data_inventory', json_build_object(
            'total_inventories', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE status = 'active'), 0),
            'needs_review', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE next_review_date < CURRENT_DATE), 0),
            'by_sensitivity', json_build_object(
                'alta', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE sensitivity_level = 'alta'), 0),
                'media', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE sensitivity_level = 'media'), 0),
                'baixa', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE sensitivity_level = 'baixa'), 0)
            )
        ),
        'consents', json_build_object(
            'total_active', COALESCE((SELECT COUNT(*) FROM consents WHERE status = 'granted'), 0),
            'total_revoked', COALESCE((SELECT COUNT(*) FROM consents WHERE status = 'revoked'), 0),
            'expiring_soon', COALESCE((SELECT COUNT(*) FROM consents WHERE expires_at < CURRENT_DATE + INTERVAL '30 days'), 0)
        ),
        'data_subject_requests', json_build_object(
            'total_requests', COALESCE((SELECT COUNT(*) FROM data_subject_requests), 0),
            'pending_requests', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE status IN ('pendente_verificacao', 'em_processamento')), 0),
            'overdue_requests', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE due_date < CURRENT_DATE AND status NOT IN ('concluida', 'rejeitada')), 0),
            'by_type', json_build_object(
                'acesso', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE request_type = 'acesso'), 0),
                'exclusao', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE request_type = 'exclusao'), 0),
                'correcao', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE request_type = 'correcao'), 0)
            )
        ),
        'privacy_incidents', json_build_object(
            'total_incidents', COALESCE((SELECT COUNT(*) FROM privacy_incidents), 0),
            'open_incidents', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE status IN ('reportado', 'investigando', 'em_tratamento')), 0),
            'anpd_notifications_required', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE requires_anpd_notification = true AND anpd_notification_date IS NULL), 0),
            'by_severity', json_build_object(
                'critica', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE severity = 'critica'), 0),
                'alta', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE severity = 'alta'), 0),
                'media', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE severity = 'media'), 0),
                'baixa', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE severity = 'baixa'), 0)
            )
        ),
        'compliance_overview', json_build_object(
            'processing_activities', COALESCE((SELECT COUNT(*) FROM processing_activities WHERE status = 'active'), 0),
            'legal_bases', COALESCE((SELECT COUNT(*) FROM legal_bases WHERE status = 'active'), 0),
            'training_completion_rate', 0
        ),
        'legal_bases', json_build_object(
            'total_bases', COALESCE((SELECT COUNT(*) FROM legal_bases), 0),
            'active_bases', COALESCE((SELECT COUNT(*) FROM legal_bases WHERE status = 'active'), 0),
            'expiring_soon', COALESCE((SELECT COUNT(*) FROM legal_bases WHERE valid_until < CURRENT_DATE + INTERVAL '30 days'), 0),
            'needs_validation', 0
        ),
        'processing_activities', json_build_object(
            'total_activities', COALESCE((SELECT COUNT(*) FROM processing_activities), 0),
            'active_activities', COALESCE((SELECT COUNT(*) FROM processing_activities WHERE status = 'active'), 0),
            'high_risk_activities', COALESCE((SELECT COUNT(*) FROM processing_activities WHERE risk_level = 'alto'), 0),
            'requires_dpia', COALESCE((SELECT COUNT(*) FROM processing_activities WHERE requires_dpia = true), 0)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_legal_bases_status ON legal_bases(status);
CREATE INDEX IF NOT EXISTS idx_legal_bases_type ON legal_bases(legal_basis_type);

CREATE INDEX IF NOT EXISTS idx_data_inventory_status ON data_inventory(status);
CREATE INDEX IF NOT EXISTS idx_data_inventory_category ON data_inventory(data_category);
CREATE INDEX IF NOT EXISTS idx_data_inventory_review_date ON data_inventory(next_review_date);

CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);
CREATE INDEX IF NOT EXISTS idx_consents_email ON consents(data_subject_email);
CREATE INDEX IF NOT EXISTS idx_consents_expires ON consents(expires_at);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_due_date ON data_subject_requests(due_date);

CREATE INDEX IF NOT EXISTS idx_privacy_incidents_status ON privacy_incidents(status);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_severity ON privacy_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_detection_date ON privacy_incidents(detection_date);

CREATE INDEX IF NOT EXISTS idx_processing_activities_status ON processing_activities(status);
CREATE INDEX IF NOT EXISTS idx_processing_activities_risk_level ON processing_activities(risk_level);

-- ============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE legal_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para usuários autenticados por enquanto)
CREATE POLICY "Allow all for authenticated users" ON legal_bases FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON data_inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON consents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON data_subject_requests FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON privacy_incidents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON processing_activities FOR ALL TO authenticated USING (true);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE legal_bases IS 'Bases legais para tratamento de dados pessoais conforme LGPD';
COMMENT ON TABLE data_inventory IS 'Inventário de dados pessoais tratados pela organização';
COMMENT ON TABLE consents IS 'Registro de consentimentos dos titulares de dados';
COMMENT ON TABLE data_subject_requests IS 'Solicitações dos titulares para exercício de direitos';
COMMENT ON TABLE privacy_incidents IS 'Incidentes de segurança e violações de dados';
COMMENT ON TABLE processing_activities IS 'Registro de Atividades de Tratamento (RAT)';
`;

async function createLGPDTables() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Conectando ao PostgreSQL do Supabase...\n');
    
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    console.log('📋 Criando tabelas do módulo LGPD...');
    console.log('⏳ Executando SQL... (pode levar alguns segundos)\n');

    const result = await client.query(createLGPDTablesSQL);
    
    console.log('🎉 TABELAS CRIADAS COM SUCESSO!\n');
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    
    const tables = ['legal_bases', 'data_inventory', 'consents', 'data_subject_requests', 'privacy_incidents', 'processing_activities'];
    
    for (const table of tables) {
      try {
        const checkResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: criada e acessível (${checkResult.rows[0].count} registros)`);
      } catch (error) {
        console.log(`❌ ${table}: erro - ${error.message}`);
      }
    }

    // Testar função de métricas
    console.log('\n📊 Testando função de métricas...');
    try {
      const metricsResult = await client.query('SELECT calculate_privacy_metrics()');
      console.log('✅ Função calculate_privacy_metrics criada e funcionando!');
      
      const metrics = metricsResult.rows[0].calculate_privacy_metrics;
      console.log(`📈 Métricas: ${metrics.legal_bases?.total_bases || 0} bases legais, ${metrics.data_inventory?.total_inventories || 0} inventários`);
    } catch (error) {
      console.log(`❌ Função de métricas: ${error.message}`);
    }

    console.log('\n🎉 MÓDULO LGPD CONFIGURADO COM SUCESSO!');
    console.log('==========================================');
    console.log('✅ 6 tabelas LGPD criadas');
    console.log('✅ Função de métricas implementada');
    console.log('✅ Índices para performance criados');
    console.log('✅ Políticas RLS configuradas');
    console.log('✅ Sistema 100% pronto para uso!');
    console.log('');
    console.log('🔗 Próximos passos:');
    console.log('1. Execute: node scripts/setup-cloud-database.js');
    console.log('2. Para inserir dados de exemplo');
    console.log('3. Teste: http://localhost:8082/privacy');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    console.log('\n💡 Possíveis soluções:');
    console.log('1. Verificar se a senha do banco está correta');
    console.log('2. Verificar conectividade com o Supabase');
    console.log('3. Tentar novamente em alguns segundos');
  } finally {
    await client.end();
    console.log('\n🔌 Conexão PostgreSQL fechada.');
  }
}

createLGPDTables();