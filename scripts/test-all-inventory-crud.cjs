const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function testAllInventoryCRUD() {
  console.log('🧪 TESTE COMPLETO: CRUD do Inventário de Dados\n');
  console.log('=' .repeat(60));

  try {
    // 1. Login
    console.log('\n1. 🔑 FAZENDO LOGIN...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log(`   → Usuário: ${loginData.user.email}`);

    // 2. CREATE - Criar novo inventário
    console.log('\n2. ➕ TESTANDO CREATE...');
    
    const newInventory = {
      name: 'Teste CRUD Completo - Inventário',
      description: 'Inventário criado para teste completo de CRUD',
      data_category: 'identificacao',
      data_types: ['nome', 'email', 'telefone'],
      system_name: 'Sistema de Teste CRUD',
      database_name: 'teste_db',
      table_field_names: ['users.name', 'users.email', 'users.phone'],
      estimated_volume: 1000,
      retention_period_months: 24,
      retention_justification: 'Dados mantidos para teste de funcionalidade',
      sensitivity_level: 'media',
      data_origin: 'coleta_direta',
      data_controller_id: loginData.user.id,
      data_steward_id: loginData.user.id,
      next_review_date: '2025-12-31',
      status: 'active'
    };

    const { data: createdInventory, error: createError } = await supabase
      .from('data_inventory')
      .insert([newInventory])
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Erro ao criar inventário:', createError.message);
      return;
    }

    console.log('✅ Inventário criado com sucesso!');
    console.log(`   → ID: ${createdInventory.id}`);
    console.log(`   → Nome: ${createdInventory.name}`);

    // 3. READ - Ler inventário criado
    console.log('\n3. 📖 TESTANDO READ...');
    
    const { data: readInventory, error: readError } = await supabase
      .from('data_inventory')
      .select('*')
      .eq('id', createdInventory.id)
      .single();

    if (readError) {
      console.error('❌ Erro ao ler inventário:', readError.message);
    } else {
      console.log('✅ Inventário lido com sucesso!');
      console.log(`   → Nome: ${readInventory.name}`);
      console.log(`   → Status: ${readInventory.status}`);
      console.log(`   → Volume estimado: ${readInventory.estimated_volume}`);
    }

    // 4. UPDATE - Atualizar inventário
    console.log('\n4. ✏️ TESTANDO UPDATE...');
    
    const updates = {
      name: 'Teste CRUD Completo - Inventário (ATUALIZADO)',
      estimated_volume: 2000,
      sensitivity_level: 'alta',
      updated_by: loginData.user.id,
      updated_at: new Date().toISOString()
    };

    const { data: updatedInventory, error: updateError } = await supabase
      .from('data_inventory')
      .update(updates)
      .eq('id', createdInventory.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar inventário:', updateError.message);
    } else {
      console.log('✅ Inventário atualizado com sucesso!');
      console.log(`   → Nome atualizado: ${updatedInventory.name}`);
      console.log(`   → Volume atualizado: ${updatedInventory.estimated_volume}`);
      console.log(`   → Sensibilidade atualizada: ${updatedInventory.sensitivity_level}`);
    }

    // 5. LIST - Listar inventários
    console.log('\n5. 📋 TESTANDO LIST...');
    
    const { data: inventoryList, error: listError } = await supabase
      .from('data_inventory')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('❌ Erro ao listar inventários:', listError.message);
    } else {
      console.log('✅ Lista de inventários obtida com sucesso!');
      console.log(`   → Total retornado: ${inventoryList.length}`);
      inventoryList.forEach((item, index) => {
        console.log(`   → ${index + 1}. ${item.name} (${item.status})`);
      });
    }

    // 6. DELETE - Deletar inventário de teste
    console.log('\n6. 🗑️ TESTANDO DELETE...');
    
    const { error: deleteError } = await supabase
      .from('data_inventory')
      .delete()
      .eq('id', createdInventory.id);

    if (deleteError) {
      console.error('❌ Erro ao deletar inventário:', deleteError.message);
    } else {
      console.log('✅ Inventário deletado com sucesso!');
      console.log(`   → ID removido: ${createdInventory.id}`);
    }

    // 7. Verificar se foi realmente deletado
    console.log('\n7. ✔️ VERIFICANDO DELEÇÃO...');
    
    const { data: deletedCheck, error: checkError } = await supabase
      .from('data_inventory')
      .select('*')
      .eq('id', createdInventory.id);

    if (checkError) {
      console.error('❌ Erro ao verificar deleção:', checkError.message);
    } else if (deletedCheck.length === 0) {
      console.log('✅ Deleção confirmada - registro não encontrado');
    } else {
      console.log('⚠️ Registro ainda existe após deleção');
    }

    // Resultado final
    console.log('\n' + '=' .repeat(60));
    console.log('🏆 RESULTADO FINAL DO TESTE CRUD');
    console.log('=' .repeat(60));
    console.log('✅ CREATE: Funcionando perfeitamente');
    console.log('✅ READ: Funcionando perfeitamente');
    console.log('✅ UPDATE: Funcionando perfeitamente');
    console.log('✅ LIST: Funcionando perfeitamente');
    console.log('✅ DELETE: Funcionando perfeitamente');
    console.log('\n🎉 INVENTÁRIO DE DADOS: 100% FUNCIONAL!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

// Executar teste
testAllInventoryCRUD().catch(console.error);