const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createDPIATable() {
  try {
    console.log('🔧 CRIANDO TABELA dpia_assessments NO SUPABASE...\n');

    // Fazer login
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    const createTableSQL = `
      -- Criar tabela dpia_assessments se não existir
      CREATE TABLE IF NOT EXISTS dpia_assessments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          
          -- Identificação
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255),
          description TEXT NOT NULL,
          purpose TEXT,
          scope TEXT,
          processing_activity_id UUID,
          
          -- Triggers para DPIA (Art. 38 LGPD)
          involves_high_risk BOOLEAN NOT NULL DEFAULT false,
          involves_sensitive_data BOOLEAN NOT NULL DEFAULT false,
          involves_large_scale BOOLEAN NOT NULL DEFAULT false,
          involves_profiling BOOLEAN NOT NULL DEFAULT false,
          involves_automated_decisions BOOLEAN NOT NULL DEFAULT false,
          involves_vulnerable_individuals BOOLEAN NOT NULL DEFAULT false,
          involves_new_technology BOOLEAN NOT NULL DEFAULT false,
          
          -- Categorias de dados
          data_categories TEXT[] DEFAULT '{}',
          
          -- Avaliação de necessidade
          dpia_required BOOLEAN NOT NULL DEFAULT false,
          dpia_justification TEXT,
          
          -- Avaliação de risco
          privacy_risks TEXT[],
          risk_level VARCHAR(20) DEFAULT 'medium',
          likelihood_assessment INTEGER, -- 1-5
          impact_assessment INTEGER, -- 1-5
          
          -- Medidas mitigadoras
          mitigation_measures TEXT[],
          residual_risk_level VARCHAR(20),
          
          -- Consulta à ANPD
          anpd_consultation_required BOOLEAN DEFAULT false,
          anpd_consultation_date DATE,
          anpd_response_date DATE,
          anpd_recommendation TEXT,
          
          -- Status e datas
          status VARCHAR(30) NOT NULL DEFAULT 'draft',
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ,
          approved_at TIMESTAMPTZ,
          
          -- Controle de auditoria
          created_by UUID,
          updated_by UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          -- Constraints
          CONSTRAINT valid_status CHECK (status IN ('draft', 'in_progress', 'pending_approval', 'approved', 'rejected', 'pending_anpd_consultation')),
          CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
          CONSTRAINT valid_likelihood CHECK (likelihood_assessment BETWEEN 1 AND 5),
          CONSTRAINT valid_impact CHECK (impact_assessment BETWEEN 1 AND 5)
      );

      -- Desabilitar RLS por enquanto
      ALTER TABLE dpia_assessments DISABLE ROW LEVEL SECURITY;

      -- Criar índices
      CREATE INDEX IF NOT EXISTS idx_dpia_status ON dpia_assessments(status);
      CREATE INDEX IF NOT EXISTS idx_dpia_risk_level ON dpia_assessments(risk_level);
      CREATE INDEX IF NOT EXISTS idx_dpia_created_by ON dpia_assessments(created_by);
      
      -- Comentário da tabela
      COMMENT ON TABLE dpia_assessments IS 'Avaliações de Impacto à Proteção de Dados conforme Art. 38 LGPD';
    `;

    console.log('📝 SQL a ser executado:');
    console.log(createTableSQL);
    
    console.log('\n⚠️  EXECUTE MANUALMENTE NO PAINEL SUPABASE:');
    console.log('1. Acesse https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o SQL acima');
    console.log('4. Depois execute o teste novamente');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createDPIATable();