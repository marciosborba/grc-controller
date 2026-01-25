const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDPIATableStructure() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA ATUAL DA TABELA dpia_assessments\n');

    // 1. Fazer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado');

    // 2. Testar SELECT para ver estrutura
    console.log('\n2️⃣ Estrutura atual da tabela:');
    const { data: existing, error: selectError } = await supabase
      .from('dpia_assessments')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log('❌ Erro ao acessar tabela:', selectError.message);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('📋 Colunas encontradas:');
      Object.keys(existing[0]).forEach((column, index) => {
        console.log(`   ${index + 1}. ${column}`);
      });
    }

    // 3. SQL para verificar constraints da tabela
    const checkConstraintsSQL = `
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'dpia_assessments' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    console.log('\n3️⃣ SQL para verificar constraints:');
    console.log(checkConstraintsSQL);
    
    console.log('\n4️⃣ Execute este SQL no Supabase Dashboard para ver a estrutura detalhada');

    // 4. Testar o que acontece ao criar um DPIA simples
    console.log('\n5️⃣ Testando inserção simples...');
    
    const user = loginData?.user;
    const testDPIA = {
      title: 'Teste Estrutura',
      description: 'Apenas teste',
      created_by: user?.id,
      updated_by: user?.id
    };

    console.log('Dados enviados:', testDPIA);

    const { data: insertData, error: insertError } = await supabase
      .from('dpia_assessments')
      .insert([testDPIA])
      .select()
      .single();

    if (insertError) {
      console.log('❌ ERRO AO INSERIR:', insertError.message);
      console.log('Código:', insertError.code);
      console.log('Detalhes:', insertError);
      
      if (insertError.message.includes('violates not-null constraint')) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO:');
        console.log('- A tabela ainda tem campo "name" como NOT NULL');
        console.log('- O SQL de correção não foi executado ou não funcionou');
        console.log('- Precisa executar DROP TABLE e CREATE novamente');
      }
    } else {
      console.log('✅ INSERÇÃO OK:', insertData.id);
      // Limpar teste
      await supabase.from('dpia_assessments').delete().eq('id', insertData.id);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDPIATableStructure();