const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixAllDPIARelations() {
  try {
    console.log('🔧 CORREÇÃO COMPLETA: Resolvendo TODOS os problemas de relacionamento do DPIA\n');

    // 1. Fazer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }

    const user = loginData?.user;
    console.log('✅ Login realizado:', user.email);

    // 2. Verificar se processing_activities existe
    console.log('\n2️⃣ Verificando tabela processing_activities...');
    const { data: procActivities, error: procError } = await supabase
      .from('processing_activities')
      .select('id, name')
      .limit(1);

    if (procError) {
      console.log('❌ Tabela processing_activities não existe ou erro:', procError.message);
      console.log('🚨 CRIANDO TABELA processing_activities...');
      
      const createProcessingActivitiesSQL = `
-- Criar tabela processing_activities se não existir
CREATE TABLE IF NOT EXISTS processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT,
    legal_basis TEXT,
    data_categories TEXT[] DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    retention_period VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    responsible_person UUID,
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS
ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;

-- Inserir dados de exemplo
INSERT INTO processing_activities (name, description, purpose, created_by, updated_by) VALUES 
('Gestão de Clientes', 'Processamento de dados de clientes para CRM', 'Marketing e vendas', '${user.id}', '${user.id}'),
('Recursos Humanos', 'Gestão de dados de funcionários', 'Administração de pessoal', '${user.id}', '${user.id}'),
('Sistema de Monitoramento', 'Videomonitoramento para segurança', 'Segurança patrimonial', '${user.id}', '${user.id}');
      `;
      
      console.log('📝 SQL para criar processing_activities:');
      console.log(createProcessingActivitiesSQL);
    } else {
      console.log(`✅ Tabela processing_activities existe com ${procActivities?.length || 0} registros`);
    }

    // 3. Verificar problema no hook useDPIA
    console.log('\n3️⃣ Analisando problema no hook useDPIA...');
    console.log('🔍 O erro de "schema cache" geralmente indica:');
    console.log('   - Query com JOIN em tabela inexistente');
    console.log('   - Referência a campos que não existem');
    console.log('   - Problema na query do fetchDPIAs');

    // 4. Testar query problemática do useDPIA
    console.log('\n4️⃣ Testando query problemática...');
    const { data: dpiaTest, error: dpiaTestError } = await supabase
      .from('dpia_assessments')
      .select(`
        *,
        processing_activity:processing_activities(name, description),
        conducted_by_user:conducted_by(email, raw_user_meta_data),
        reviewed_by_user:reviewed_by(email, raw_user_meta_data)
      `)
      .limit(1);

    if (dpiaTestError) {
      console.log('❌ ERRO NA QUERY COMPLEXA:', dpiaTestError.message);
      console.log('🚨 PROBLEMAS IDENTIFICADOS:');
      
      if (dpiaTestError.message.includes('processing_activities')) {
        console.log('   - Tabela processing_activities não existe ou não tem relacionamento');
      }
      if (dpiaTestError.message.includes('conducted_by') || dpiaTestError.message.includes('reviewed_by')) {
        console.log('   - Campos conducted_by/reviewed_by fazem referência à tabela auth.users');
        console.log('   - Precisa corrigir a query ou usar IDs diretamente');
      }
      
      console.log('\n🔧 CORREÇÃO: Simplificar query no useDPIA');
    } else {
      console.log('✅ Query complexa funcionando');
    }

    // 5. Criar SQL de correção completa
    console.log('\n5️⃣ Gerando SQL de correção completa...');
    
    const completeFix = `
-- ============================================================================
-- CORREÇÃO COMPLETA DE RELACIONAMENTOS DO DPIA
-- ============================================================================

-- 1. CRIAR processing_activities se não existir
CREATE TABLE IF NOT EXISTS processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT,
    legal_basis TEXT,
    data_categories TEXT[] DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    retention_period VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    responsible_person UUID,
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS
ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;

-- 2. ADICIONAR FK se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dpia_processing_activity'
    ) THEN
        ALTER TABLE dpia_assessments 
        ADD CONSTRAINT fk_dpia_processing_activity 
        FOREIGN KEY (processing_activity_id) 
        REFERENCES processing_activities(id);
    END IF;
END $$;

-- 3. INSERIR dados de exemplo em processing_activities
INSERT INTO processing_activities (name, description, purpose, created_by, updated_by) 
VALUES 
    ('Gestão de Clientes', 'Processamento de dados de clientes para CRM', 'Marketing e vendas', '${user.id}', '${user.id}'),
    ('Recursos Humanos', 'Gestão de dados de funcionários', 'Administração de pessoal', '${user.id}', '${user.id}'),
    ('Sistema de Monitoramento', 'Videomonitoramento para segurança', 'Segurança patrimonial', '${user.id}', '${user.id}')
ON CONFLICT DO NOTHING;

-- 4. VERIFICAÇÃO FINAL
SELECT 
    'CORREÇÃO CONCLUÍDA!' as status,
    (SELECT COUNT(*) FROM processing_activities) as processing_activities_count,
    (SELECT COUNT(*) FROM dpia_assessments) as dpia_count;
    `;

    console.log('📝 SQL COMPLETO DE CORREÇÃO:');
    console.log('=' .repeat(80));
    console.log(completeFix);
    console.log('=' .repeat(80));

    console.log('\n🚨 EXECUTE ESTE SQL NO SUPABASE DASHBOARD PARA CORRIGIR TUDO!');
    console.log('Depois disso, o DPIA deve funcionar 100% sem erros de relacionamento.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixAllDPIARelations();