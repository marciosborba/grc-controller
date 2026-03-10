// TEST SCRIPT - Direct Incident Update Test
// Execute este script no console do navegador para testar a atualização diretamente

console.log('🧪 [TEST] Iniciando teste direto de atualização de incidente...');

// Função para testar atualização de incidente
async function testIncidentUpdate() {
  console.log('\n🔬 [TEST] === TESTE DE ATUALIZAÇÃO DE INCIDENTE ===');
  
  try {
    // 1. Verificar se o Supabase está disponível
    const supabase = window.supabase || window._supabase;
    if (!supabase) {
      console.error('❌ [TEST] Supabase client não encontrado');
      return;
    }
    
    console.log('✅ [TEST] Supabase client encontrado');
    
    // 2. Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ [TEST] Erro ao obter sessão:', sessionError);
      return;
    }
    
    if (!session) {
      console.error('❌ [TEST] Usuário não autenticado');
      return;
    }
    
    console.log('✅ [TEST] Usuário autenticado:', session.user.email);
    console.log('🆔 [TEST] User ID:', session.user.id);
    
    // 3. Verificar se é platform admin
    const { data: platformAdmin, error: adminError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    const isPlatformAdmin = !adminError && platformAdmin;
    console.log('👑 [TEST] É Platform Admin:', isPlatformAdmin);
    
    // 4. Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ [TEST] Erro ao obter perfil:', profileError);
    } else {
      console.log('👤 [TEST] Perfil do usuário:', profile);
      console.log('🏢 [TEST] Tenant ID do perfil:', profile.tenant_id);
    }
    
    // 5. Verificar tenant selecionado
    const selectedTenantId = localStorage.getItem('grc-selected-tenant-id');
    console.log('🎯 [TEST] Tenant selecionado:', selectedTenantId);
    
    // 6. Determinar tenant_id efetivo
    const effectiveTenantId = selectedTenantId || profile?.tenant_id;
    console.log('🎯 [TEST] Tenant ID efetivo:', effectiveTenantId);
    
    // 7. Listar incidentes disponíveis
    console.log('\n📋 [TEST] Listando incidentes disponíveis...');
    const { data: incidents, error: listError } = await supabase
      .from('incidents')
      .select('*')
      .limit(5);
    
    if (listError) {
      console.error('❌ [TEST] Erro ao listar incidentes:', listError);
      return;
    }
    
    console.log('📋 [TEST] Incidentes encontrados:', incidents.length);
    incidents.forEach((incident, index) => {
      console.log(`  ${index + 1}. ${incident.title} (ID: ${incident.id}, Tenant: ${incident.tenant_id})`);
    });
    
    if (incidents.length === 0) {
      console.log('⚠️ [TEST] Nenhum incidente encontrado. Criando um incidente de teste...');
      
      // Criar incidente de teste
      const testIncident = {
        title: 'Incidente de Teste - ' + new Date().toISOString(),
        description: 'Incidente criado para teste de atualização',
        status: 'open',
        priority: 'medium',
        category: 'Other',
        tenant_id: effectiveTenantId,
        reporter_id: session.user.id
      };
      
      const { data: newIncident, error: createError } = await supabase
        .from('incidents')
        .insert(testIncident)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ [TEST] Erro ao criar incidente de teste:', createError);
        return;
      }
      
      console.log('✅ [TEST] Incidente de teste criado:', newIncident);
      incidents.push(newIncident);
    }
    
    // 8. Testar atualização do primeiro incidente
    const incidentToUpdate = incidents[0];
    console.log('\n🔄 [TEST] Testando atualização do incidente:', incidentToUpdate.id);
    
    const updateData = {
      title: incidentToUpdate.title + ' - ATUALIZADO ' + new Date().toLocaleTimeString(),
      description: (incidentToUpdate.description || '') + '\n\nAtualização de teste em ' + new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Se for platform admin, incluir tenant_id
    if (isPlatformAdmin && effectiveTenantId) {
      updateData.tenant_id = effectiveTenantId;
      console.log('👑 [TEST] Incluindo tenant_id para platform admin:', effectiveTenantId);
    }
    
    console.log('📝 [TEST] Dados de atualização:', updateData);
    
    // Executar atualização
    const { data: updatedIncident, error: updateError } = await supabase
      .from('incidents')
      .update(updateData)
      .eq('id', incidentToUpdate.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ [TEST] ERRO NA ATUALIZAÇÃO:', updateError);
      console.error('❌ [TEST] Detalhes do erro:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      
      // Verificar se é erro de RLS
      if (updateError.message.includes('RLS') || updateError.message.includes('policy')) {
        console.error('🚫 [TEST] ERRO DE RLS DETECTADO!');
        console.error('🚫 [TEST] As políticas RLS estão bloqueando a atualização');
        console.error('🚫 [TEST] Execute o script fix_incidents_rls.sql no banco de dados');
      }
      
      return;
    }
    
    console.log('✅ [TEST] ATUALIZAÇÃO BEM-SUCEDIDA!');
    console.log('✅ [TEST] Incidente atualizado:', updatedIncident);
    
    // 9. Verificar se a atualização foi persistida
    console.log('\n🔍 [TEST] Verificando persistência da atualização...');
    const { data: verifyIncident, error: verifyError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentToUpdate.id)
      .single();
    
    if (verifyError) {
      console.error('❌ [TEST] Erro ao verificar atualização:', verifyError);
      return;
    }
    
    console.log('🔍 [TEST] Incidente após atualização:', verifyIncident);
    
    // Comparar timestamps
    const originalUpdatedAt = new Date(incidentToUpdate.updated_at);
    const newUpdatedAt = new Date(verifyIncident.updated_at);
    
    if (newUpdatedAt > originalUpdatedAt) {
      console.log('✅ [TEST] TIMESTAMP ATUALIZADO CORRETAMENTE!');
      console.log('✅ [TEST] Original:', originalUpdatedAt.toISOString());
      console.log('✅ [TEST] Novo:', newUpdatedAt.toISOString());
    } else {
      console.error('❌ [TEST] TIMESTAMP NÃO FOI ATUALIZADO!');
      console.error('❌ [TEST] Isso indica que a atualização pode não ter sido persistida');
    }
    
    return {
      success: true,
      originalIncident: incidentToUpdate,
      updatedIncident: verifyIncident,
      updateData,
      isPlatformAdmin,
      effectiveTenantId
    };
    
  } catch (error) {
    console.error('💥 [TEST] ERRO INESPERADO:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para testar políticas RLS especificamente
async function testRLSPolicies() {
  console.log('\n🛡️ [TEST] === TESTE DE POLÍTICAS RLS ===');
  
  try {
    const supabase = window.supabase || window._supabase;
    if (!supabase) {
      console.error('❌ [TEST] Supabase client não encontrado');
      return;
    }
    
    // Testar SELECT
    console.log('🔍 [TEST] Testando política SELECT...');
    const { data: selectData, error: selectError } = await supabase
      .from('incidents')
      .select('id, title, tenant_id')
      .limit(1);
    
    if (selectError) {
      console.error('❌ [TEST] Erro na política SELECT:', selectError);
    } else {
      console.log('✅ [TEST] Política SELECT OK:', selectData.length, 'incidentes retornados');
    }
    
    // Testar INSERT
    console.log('🔍 [TEST] Testando política INSERT...');
    const testInsertData = {
      title: 'Teste RLS INSERT - ' + Date.now(),
      description: 'Teste de política RLS para INSERT',
      status: 'open',
      priority: 'low',
      category: 'Other',
      tenant_id: localStorage.getItem('grc-selected-tenant-id') || 'test-tenant'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('incidents')
      .insert(testInsertData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ [TEST] Erro na política INSERT:', insertError);
    } else {
      console.log('✅ [TEST] Política INSERT OK:', insertData.id);
      
      // Testar UPDATE no incidente recém-criado
      console.log('🔍 [TEST] Testando política UPDATE...');
      const { data: updateData, error: updateError } = await supabase
        .from('incidents')
        .update({ 
          title: insertData.title + ' - UPDATED',
          tenant_id: testInsertData.tenant_id // Incluir tenant_id explicitamente
        })
        .eq('id', insertData.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ [TEST] Erro na política UPDATE:', updateError);
      } else {
        console.log('✅ [TEST] Política UPDATE OK:', updateData.title);
      }
      
      // Limpar incidente de teste
      await supabase.from('incidents').delete().eq('id', insertData.id);
      console.log('🧹 [TEST] Incidente de teste removido');
    }
    
  } catch (error) {
    console.error('💥 [TEST] Erro no teste de RLS:', error);
  }
}

// Função para verificar configuração do hook
function testHookConfiguration() {
  console.log('\n⚙️ [TEST] === VERIFICAÇÃO DO HOOK ===');
  
  // Verificar se há React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ [TEST] React DevTools detectado');
    
    // Tentar encontrar componentes React
    const reactFiber = document.querySelector('#root')._reactInternalInstance || 
                      document.querySelector('#root')._reactInternals;
    
    if (reactFiber) {
      console.log('✅ [TEST] React Fiber encontrado');
    }
  }
  
  // Verificar se há contextos disponíveis
  const contexts = ['AuthContext', 'TenantContext', 'IncidentContext'];
  contexts.forEach(contextName => {
    if (window[contextName]) {
      console.log(`✅ [TEST] ${contextName} encontrado`);
    } else {
      console.log(`⚠️ [TEST] ${contextName} não encontrado`);
    }
  });
}

// Executar testes
console.log('🧪 [TEST] Scripts de teste carregados.');
console.log('🧪 [TEST] Execute testIncidentUpdate() para testar atualização');
console.log('🧪 [TEST] Execute testRLSPolicies() para testar políticas RLS');
console.log('🧪 [TEST] Execute testHookConfiguration() para verificar hooks');

// Disponibilizar funções globalmente
window.testIncidentUpdate = testIncidentUpdate;
window.testRLSPolicies = testRLSPolicies;
window.testHookConfiguration = testHookConfiguration;

// Auto-executar teste básico
setTimeout(() => {
  console.log('\n🚀 [TEST] Executando teste automático...');
  testIncidentUpdate();
}, 2000);