const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function recreateDPIATable() {
  try {
    console.log('🔧 RECRIANDO TABELA dpia_assessments COMPLETAMENTE...\n');

    // Fazer login
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    const user = loginData?.user;
    console.log('✅ Login realizado:', user.email);

    const completeSQL = `
-- ============================================================================
-- EXCLUSÃO TOTAL E RECRIAÇÃO DA TABELA dpia_assessments
-- ============================================================================

-- 1. EXCLUIR TABELA EXISTENTE (se existir)
DROP TABLE IF EXISTS dpia_assessments CASCADE;

-- 2. CRIAR TABELA NOVA E SIMPLIFICADA
CREATE TABLE dpia_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campos básicos obrigatórios
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Campos opcionais para DPIA
    purpose TEXT,
    scope TEXT,
    
    -- Categorias de dados (JSON simples)
    data_categories TEXT[] DEFAULT '{}',
    
    -- Status e risco (campos simples)
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    risk_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Campos booleanos para triggers LGPD
    involves_high_risk BOOLEAN DEFAULT false,
    involves_sensitive_data BOOLEAN DEFAULT false,
    involves_large_scale BOOLEAN DEFAULT false,
    
    -- Avaliação de risco (opcionais)
    likelihood_assessment INTEGER CHECK (likelihood_assessment BETWEEN 1 AND 5),
    impact_assessment INTEGER CHECK (impact_assessment BETWEEN 1 AND 5),
    
    -- Consulta ANPD
    anpd_consultation_required BOOLEAN DEFAULT false,
    anpd_consultation_date DATE,
    
    -- Datas importantes
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Auditoria (OBRIGATÓRIOS para RLS)
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints simples
    CONSTRAINT dpia_valid_status CHECK (status IN ('draft', 'in_progress', 'completed', 'approved', 'rejected')),
    CONSTRAINT dpia_valid_risk CHECK (risk_level IN ('low', 'medium', 'high', 'very_high'))
);

-- 3. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE dpia_assessments DISABLE ROW LEVEL SECURITY;

-- 4. CRIAR ÍNDICES BÁSICOS
CREATE INDEX idx_dpia_status ON dpia_assessments(status);
CREATE INDEX idx_dpia_risk_level ON dpia_assessments(risk_level);
CREATE INDEX idx_dpia_created_by ON dpia_assessments(created_by);
CREATE INDEX idx_dpia_created_at ON dpia_assessments(created_at);

-- 5. COMENTÁRIO DA TABELA
COMMENT ON TABLE dpia_assessments IS 'Avaliações de Impacto à Proteção de Dados (DPIA/AIPD) - LGPD Art. 38';

-- 6. INSERIR DADOS DE TESTE
INSERT INTO dpia_assessments (
    name, 
    description, 
    purpose,
    scope,
    data_categories,
    status,
    risk_level,
    involves_high_risk,
    involves_sensitive_data,
    created_by,
    updated_by
) VALUES 
(
    'DPIA - Sistema de CRM',
    'Avaliação de impacto para o sistema de gestão de relacionamento com clientes',
    'Gestão de dados de clientes para marketing e vendas',
    'Dados de identificação e contato de clientes pessoa física',
    ARRAY['nome', 'email', 'telefone'],
    'draft',
    'medium',
    true,
    false,
    '${user.id}',
    '${user.id}'
),
(
    'DPIA - Portal de RH',
    'Avaliação de impacto para tratamento de dados de funcionários',
    'Gestão de recursos humanos e folha de pagamento',
    'Dados pessoais e sensíveis de colaboradores',
    ARRAY['nome', 'cpf', 'dados_bancarios'],
    'in_progress',
    'high',
    true,
    true,
    '${user.id}',
    '${user.id}'
),
(
    'DPIA - Sistema de Monitoramento',
    'Avaliação para sistema de videomonitoramento',
    'Segurança patrimonial e controle de acesso',
    'Imagens de colaboradores e visitantes',
    ARRAY['imagem', 'biometria'],
    'completed',
    'high',
    true,
    true,
    '${user.id}',
    '${user.id}'
);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
    'TABELA CRIADA COM SUCESSO!' as status,
    COUNT(*) as total_registros
FROM dpia_assessments;
    `;

    console.log('📝 SQL COMPLETO para executar no Supabase:');
    console.log('=' .repeat(80));
    console.log(completeSQL);
    console.log('=' .repeat(80));
    
    console.log('\n🚨 INSTRUÇÕES IMPORTANTES:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd');
    console.log('2. Vá para: SQL Editor');
    console.log('3. Cole TODO o SQL acima');
    console.log('4. Execute o SQL completo');
    console.log('5. Verifique se aparece "TABELA CRIADA COM SUCESSO!" no resultado');
    console.log('6. Depois teste criar DPIA no sistema');

    console.log('\n✨ O QUE SERÁ FEITO:');
    console.log('• ❌ Excluir tabela dpia_assessments existente');
    console.log('• ✅ Criar nova tabela simplificada');
    console.log('• ✅ Desabilitar RLS completamente');
    console.log('• ✅ Inserir 3 registros de exemplo');
    console.log('• ✅ Garantir compatibilidade com hook useDPIA');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

recreateDPIATable();