#!/usr/bin/env node
/**
 * Script para criar tabelas diretamente via SQL no Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseKey);

// Criar cada tabela individualmente
async function createTables() {
  try {
    console.log('🚀 Criando tabelas do módulo LGPD...\n');

    // 1. Tabela de bases legais
    console.log('⚖️ Criando tabela legal_bases...');
    const { error: legalBasesError } = await supabase.from('legal_bases').select('id').limit(1);
    
    if (legalBasesError && legalBasesError.code === 'PGRST116') {
      console.log('   Tabela não existe, tentando criar via SQL direto...');
      // A tabela não existe, mas não podemos criar via client normal
      // Vamos assumir que ela será criada via dashboard ou migration
    } else if (legalBasesError) {
      console.log(`   ❌ Erro ao verificar tabela: ${legalBasesError.message}`);
    } else {
      console.log('   ✅ Tabela legal_bases já existe!');
    }

    // 2. Tabela de inventário de dados
    console.log('📋 Criando tabela data_inventory...');
    const { error: inventoryError } = await supabase.from('data_inventory').select('id').limit(1);
    
    if (inventoryError && inventoryError.code === 'PGRST116') {
      console.log('   Tabela não existe');
    } else if (inventoryError) {
      console.log(`   ❌ Erro: ${inventoryError.message}`);
    } else {
      console.log('   ✅ Tabela data_inventory já existe!');
    }

    // 3. Tabela de consentimentos
    console.log('✅ Criando tabela consents...');
    const { error: consentsError } = await supabase.from('consents').select('id').limit(1);
    
    if (consentsError && consentsError.code === 'PGRST116') {
      console.log('   Tabela não existe');
    } else if (consentsError) {
      console.log(`   ❌ Erro: ${consentsError.message}`);
    } else {
      console.log('   ✅ Tabela consents já existe!');
    }

    // 4. Tabela de solicitações
    console.log('👥 Criando tabela data_subject_requests...');
    const { error: requestsError } = await supabase.from('data_subject_requests').select('id').limit(1);
    
    if (requestsError && requestsError.code === 'PGRST116') {
      console.log('   Tabela não existe');
    } else if (requestsError) {
      console.log(`   ❌ Erro: ${requestsError.message}`);
    } else {
      console.log('   ✅ Tabela data_subject_requests já existe!');
    }

    // 5. Tabela de incidentes
    console.log('🚨 Criando tabela privacy_incidents...');
    const { error: incidentsError } = await supabase.from('privacy_incidents').select('id').limit(1);
    
    if (incidentsError && incidentsError.code === 'PGRST116') {
      console.log('   Tabela não existe');
    } else if (incidentsError) {
      console.log(`   ❌ Erro: ${incidentsError.message}`);
    } else {
      console.log('   ✅ Tabela privacy_incidents já existe!');
    }

    // 6. Tabela de atividades de tratamento
    console.log('📝 Criando tabela processing_activities...');
    const { error: activitiesError } = await supabase.from('processing_activities').select('id').limit(1);
    
    if (activitiesError && activitiesError.code === 'PGRST116') {
      console.log('   Tabela não existe');
    } else if (activitiesError) {
      console.log(`   ❌ Erro: ${activitiesError.message}`);
    } else {
      console.log('   ✅ Tabela processing_activities já existe!');
    }

    console.log('\n📋 RESULTADO DA VERIFICAÇÃO:');
    console.log('==========================================');
    console.log('Para criar as tabelas, você pode:');
    console.log('');
    console.log('1. 🌐 OPÇÃO MAIS FÁCIL - Via Dashboard Supabase:');
    console.log('   - Acesse: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd');
    console.log('   - Vá em: SQL Editor');
    console.log('   - Cole o SQL abaixo e execute:');
    console.log('');
    console.log('2. 📄 SQL PARA COLAR NO DASHBOARD:');
    
    const createSQL = `
-- Tabela de bases legais
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
    created_by UUID NOT NULL DEFAULT auth.uid(),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de inventário de dados
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
    created_by UUID NOT NULL DEFAULT auth.uid(),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de consentimentos
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_email VARCHAR(255) NOT NULL,
    data_subject_name VARCHAR(255),
    data_subject_document VARCHAR(50),
    purpose TEXT NOT NULL,
    data_categories JSONB DEFAULT '[]'::jsonb,
    legal_basis_id UUID,
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
    created_by UUID DEFAULT auth.uid(),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de solicitações de titulares
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
    created_by UUID DEFAULT auth.uid(),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de incidentes de privacidade
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
    created_by UUID DEFAULT auth.uid(),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de atividades de tratamento
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
    created_by UUID NOT NULL DEFAULT auth.uid(),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para calcular métricas
CREATE OR REPLACE FUNCTION calculate_privacy_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'data_inventory', json_build_object(
            'total_inventories', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE status = 'active'), 0),
            'needs_review', COALESCE((SELECT COUNT(*) FROM data_inventory WHERE next_review_date < CURRENT_DATE), 0)
        ),
        'consents', json_build_object(
            'total_active', COALESCE((SELECT COUNT(*) FROM consents WHERE status = 'granted'), 0),
            'total_revoked', COALESCE((SELECT COUNT(*) FROM consents WHERE status = 'revoked'), 0),
            'expiring_soon', COALESCE((SELECT COUNT(*) FROM consents WHERE expires_at < CURRENT_DATE + INTERVAL '30 days'), 0)
        ),
        'data_subject_requests', json_build_object(
            'total_requests', COALESCE((SELECT COUNT(*) FROM data_subject_requests), 0),
            'pending_requests', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE status IN ('pendente_verificacao', 'em_processamento')), 0),
            'overdue_requests', COALESCE((SELECT COUNT(*) FROM data_subject_requests WHERE due_date < CURRENT_DATE AND status NOT IN ('concluida', 'rejeitada')), 0)
        ),
        'privacy_incidents', json_build_object(
            'total_incidents', COALESCE((SELECT COUNT(*) FROM privacy_incidents), 0),
            'open_incidents', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE status IN ('reportado', 'investigando', 'em_tratamento')), 0),
            'anpd_notifications_required', COALESCE((SELECT COUNT(*) FROM privacy_incidents WHERE requires_anpd_notification = true AND anpd_notification_date IS NULL), 0)
        ),
        'compliance_overview', json_build_object(
            'processing_activities', COALESCE((SELECT COUNT(*) FROM processing_activities WHERE status = 'active'), 0),
            'legal_bases', COALESCE((SELECT COUNT(*) FROM legal_bases WHERE status = 'active'), 0)
        ),
        'legal_bases', json_build_object(
            'total_bases', COALESCE((SELECT COUNT(*) FROM legal_bases), 0),
            'active_bases', COALESCE((SELECT COUNT(*) FROM legal_bases WHERE status = 'active'), 0),
            'expiring_soon', COALESCE((SELECT COUNT(*) FROM legal_bases WHERE valid_until < CURRENT_DATE + INTERVAL '30 days'), 0)
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
`;
    
    console.log(createSQL);
    
    console.log('\n3. ⚡ DEPOIS DE EXECUTAR O SQL:');
    console.log('   - Execute novamente: node scripts/setup-cloud-database.js');
    console.log('   - Para inserir os dados de exemplo');
    console.log('');
    console.log('🔗 Link direto para SQL Editor:');
    console.log('https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd/sql');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTables();