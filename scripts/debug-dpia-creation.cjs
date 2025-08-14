const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugDPIACreation() {
  try {
    console.log('🔍 DEBUG DETALHADO: Criação de DPIA\n');

    // 1. Fazer login com o usuário admin
    console.log('1️⃣ Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Admin@2024!GRC'
    });

    let user;
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      // Tentar com o usuário de teste
      console.log('Tentando com usuário de teste...');
      const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
        email: 'test@exemplo.com',
        password: 'testpassword123'
      });
      
      if (testError) {
        console.log('❌ Erro no login de teste:', testError.message);
        return;
      }
      console.log('✅ Login realizado com usuário de teste');
      user = testLogin?.user;
    } else {
      console.log('✅ Login realizado com admin');
      user = loginData?.user;
    }

    // 2. Verificar se a tabela existe
    console.log('\n2️⃣ Verificando se tabela dpia_assessments existe...');
    const { count, error: countError } = await supabase
      .from('dpia_assessments')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Tabela não existe ou erro de acesso:', countError.message);
      console.log('Código:', countError.code);
      
      // Verificar se é problema de permissão/RLS
      if (countError.code === '42P01') {
        console.log('🚨 PROBLEMA: Tabela dpia_assessments não existe no banco!');
      } else if (countError.code === '42501' || countError.message.includes('RLS')) {
        console.log('🚨 PROBLEMA: RLS bloqueando acesso à tabela dpia_assessments');
      }
      return;
    }

    console.log(`✅ Tabela existe com ${count || 0} registros`);

    // 3. Tentar listar registros existentes para ver a estrutura
    console.log('\n3️⃣ Tentando listar registros existentes...');
    const { data: existingRecords, error: listError } = await supabase
      .from('dpia_assessments')
      .select('*')
      .limit(1);

    if (listError) {
      console.log('❌ Erro ao listar:', listError.message);
    } else if (existingRecords && existingRecords.length > 0) {
      console.log('✅ Estrutura da tabela (baseada em registro existente):');
      Object.keys(existingRecords[0]).forEach((key, index) => {
        console.log(`   ${index + 1}. ${key}`);
      });
    } else {
      console.log('⚠️ Tabela vazia, não é possível ver estrutura');
    }

    // 4. Tentar criar um DPIA com dados mínimos
    console.log('\n4️⃣ Tentando criar DPIA com dados mínimos...');
    const minimalDPIA = {
      name: 'DPIA Teste Debug',
      description: 'Teste para debug',
      created_by: user?.id,
      updated_by: user?.id,
      started_at: new Date().toISOString()
    };

    console.log('Dados a inserir:', minimalDPIA);

    const { data: createData, error: createError } = await supabase
      .from('dpia_assessments')
      .insert([minimalDPIA])
      .select()
      .single();

    if (createError) {
      console.log('❌ ERRO AO CRIAR:', createError.message);
      console.log('Código:', createError.code);
      console.log('Detalhes completos:', createError);
      
      // Análise específica dos erros
      if (createError.message.includes('violates not-null constraint')) {
        console.log('🚨 PROBLEMA: Campos obrigatórios estão faltando');
        const field = createError.message.match(/"([^"]+)"/)?.[1];
        if (field) {
          console.log(`Campo obrigatório: ${field}`);
        }
      } else if (createError.message.includes('does not exist')) {
        console.log('🚨 PROBLEMA: Tabela ou coluna não existe');
      }
    } else {
      console.log('🎉 SUCESSO! DPIA criado:');
      console.log('ID:', createData.id);
      console.log('Estrutura criada:', Object.keys(createData));
      
      // Limpar o teste
      await supabase.from('dpia_assessments').delete().eq('id', createData.id);
      console.log('🗑️ Registro de teste removido');
    }

    // 5. Se o minimal falhou, tentar descobrir campos obrigatórios
    if (createError && createError.message.includes('not-null constraint')) {
      console.log('\n5️⃣ Descobrindo campos obrigatórios...');
      
      const fieldsToTry = [
        'purpose',
        'scope', 
        'status',
        'risk_level',
        'data_categories'
      ];

      for (const field of fieldsToTry) {
        console.log(`Tentando adicionar: ${field}`);
        const testData = {
          ...minimalDPIA,
          [field]: field === 'data_categories' ? ['identificacao'] : 
                  field === 'status' ? 'draft' :
                  field === 'risk_level' ? 'medium' : 
                  `Valor para ${field}`
        };

        const { data, error } = await supabase
          .from('dpia_assessments')
          .insert([testData])
          .select()
          .single();

        if (!error) {
          console.log(`✅ Sucesso adicionando ${field}!`);
          await supabase.from('dpia_assessments').delete().eq('id', data.id);
          break;
        } else {
          console.log(`❌ Ainda erro com ${field}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral no debug:', error);
  }
}

debugDPIACreation();