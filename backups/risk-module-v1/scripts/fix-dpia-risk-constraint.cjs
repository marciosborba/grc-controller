const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG1qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixDPIARiskConstraint() {
  try {
    console.log('🔧 CORRIGINDO CONSTRAINT dpia_valid_risk\n');

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

    // 2. Verificar constraint atual
    console.log('\n2️⃣ SQL para verificar constraint atual:');
    const checkConstraintSQL = `
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'dpia_assessments' 
AND conname LIKE '%risk%';
    `;
    
    console.log(checkConstraintSQL);
    
    // 3. Testar valores que podem estar causando erro
    console.log('\n3️⃣ Testando valores de risk_level...');
    
    const testValues = [
      'low',
      'medium', 
      'high',
      'very_high',
      'Low',
      'Medium',
      'High',
      'Very_High',
      'critical'
    ];

    console.log('📝 Valores que podem estar sendo enviados:');
    testValues.forEach(val => console.log(`   - "${val}"`));

    // 4. Criar SQL de correção
    console.log('\n4️⃣ SQL de correção (remover e recriar constraint):');
    
    const fixConstraintSQL = `
-- ============================================================================
-- CORREÇÃO DE CONSTRAINT dpia_valid_risk
-- ============================================================================

-- 1. REMOVER constraint problemática
ALTER TABLE dpia_assessments DROP CONSTRAINT IF EXISTS dpia_valid_risk;

-- 2. RECRIAR constraint com valores corretos (case insensitive)
ALTER TABLE dpia_assessments 
ADD CONSTRAINT dpia_valid_risk 
CHECK (risk_level IS NULL OR LOWER(risk_level) IN ('low', 'medium', 'high', 'very_high', 'critical'));

-- Alternativa: Sem case sensitivity (mais restritivo)
-- ALTER TABLE dpia_assessments 
-- ADD CONSTRAINT dpia_valid_risk 
-- CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high', 'very_high'));

-- 3. VERIFICAR constraint criada
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'dpia_assessments' 
AND conname = 'dpia_valid_risk';
    `;

    console.log(fixConstraintSQL);

    // 5. Testar inserção após correção
    console.log('\n5️⃣ Teste após correção:');
    
    const testDPIA = {
      title: 'Teste Risk Level',
      description: 'Teste de constraint corrigida',
      risk_level: 'medium', // Valor que deve funcionar
      created_by: user.id,
      updated_by: user.id
    };

    console.log('Dados de teste:', testDPIA);

    console.log('\n🚨 EXECUTE O SQL ACIMA NO SUPABASE DASHBOARD PRIMEIRO!');
    console.log('Depois execute este script novamente para testar.');

    // Tentar inserção (só funciona se constraint foi corrigida)
    const { data: testData, error: testError } = await supabase
      .from('dpia_assessments')
      .insert([testDPIA])
      .select()
      .single();

    if (testError) {
      console.log('\n❌ TESTE AINDA COM ERRO:', testError.message);
      if (testError.message.includes('dpia_valid_risk')) {
        console.log('🚨 CONSTRAINT ainda não foi corrigida - execute o SQL acima!');
      }
    } else {
      console.log('\n✅ TESTE PASSOU!');
      console.log('DPIA ID:', testData.id);
      
      // Limpar teste
      await supabase.from('dpia_assessments').delete().eq('id', testData.id);
      console.log('🗑️ Dados de teste removidos');
      
      console.log('\n🎉 CONSTRAINT CORRIGIDA COM SUCESSO!');
      console.log('Agora o DPIA deve funcionar sem erros de risk_level');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixDPIARiskConstraint();