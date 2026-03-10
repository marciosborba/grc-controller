// DEBUG SCRIPT - Hook State Analysis
// Execute este script no console para analisar o estado dos hooks

console.log('🔧 [HOOK DEBUG] Iniciando análise do estado dos hooks...');

// Função para interceptar e monitorar chamadas do hook
function interceptHookCalls() {
  console.log('\n🎣 [HOOK DEBUG] === INTERCEPTANDO CHAMADAS DE HOOK ===');
  
  // Interceptar console.log para capturar logs do hook
  const originalLog = console.log;
  console.log = function(...args) {
    // Verificar se é log do hook de incidentes
    const logString = args.join(' ');
    if (logString.includes('INCIDENT_UPDATE') || 
        logString.includes('useIncidentManagement') ||
        logString.includes('mutation') ||
        logString.includes('tenant_id')) {
      console.warn('🎣 [HOOK INTERCEPTED]:', ...args);
    }
    originalLog.apply(console, args);
  };
  
  console.log('✅ [HOOK DEBUG] Interceptor de logs configurado');
}

// Função para verificar estado do React Query
function debugReactQuery() {
  console.log('\n⚛️ [HOOK DEBUG] === ESTADO DO REACT QUERY ===');
  
  // Verificar se React Query está disponível
  const queryClient = window.queryClient || window.__REACT_QUERY_CLIENT__;
  
  if (queryClient) {
    console.log('✅ [HOOK DEBUG] React Query Client encontrado');
    
    // Verificar cache de queries
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    console.log('📊 [HOOK DEBUG] Total de queries no cache:', queries.length);
    
    // Filtrar queries relacionadas a incidentes
    const incidentQueries = queries.filter(query => 
      query.queryKey.some(key => 
        typeof key === 'string' && key.includes('incident')
      )
    );
    
    console.log('🎯 [HOOK DEBUG] Queries de incidentes:', incidentQueries.length);
    
    incidentQueries.forEach((query, index) => {
      console.log(`  ${index + 1}. Key:`, query.queryKey);
      console.log(`     State:`, query.state.status);
      console.log(`     Data:`, query.state.data ? 'Presente' : 'Ausente');
      console.log(`     Error:`, query.state.error);
    });
    
    // Verificar mutation cache
    const mutationCache = queryClient.getMutationCache();
    const mutations = mutationCache.getAll();
    
    console.log('🔄 [HOOK DEBUG] Total de mutations no cache:', mutations.length);
    
    const incidentMutations = mutations.filter(mutation =>
      mutation.options.mutationKey?.some(key =>
        typeof key === 'string' && key.includes('incident')
      )
    );
    
    console.log('🎯 [HOOK DEBUG] Mutations de incidentes:', incidentMutations.length);
    
    incidentMutations.forEach((mutation, index) => {
      console.log(`  ${index + 1}. Key:`, mutation.options.mutationKey);
      console.log(`     State:`, mutation.state.status);
      console.log(`     Variables:`, mutation.state.variables);
      console.log(`     Error:`, mutation.state.error);
    });
    
  } else {
    console.warn('⚠️ [HOOK DEBUG] React Query Client não encontrado');
  }
}

// Função para verificar contextos React
function debugReactContexts() {
  console.log('\n🌐 [HOOK DEBUG] === CONTEXTOS REACT ===');
  
  // Tentar acessar contextos através do React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ [HOOK DEBUG] React DevTools disponível');
    
    // Verificar se há componentes montados
    const reactInstances = [];
    
    // Procurar por elementos React no DOM
    const reactElements = document.querySelectorAll('[data-reactroot], #root');
    
    reactElements.forEach(element => {
      const reactInstance = element._reactInternalInstance || 
                           element._reactInternals ||
                           element.__reactInternalInstance;
      
      if (reactInstance) {
        reactInstances.push(reactInstance);
      }
    });
    
    console.log('⚛️ [HOOK DEBUG] Instâncias React encontradas:', reactInstances.length);
    
  } else {
    console.warn('⚠️ [HOOK DEBUG] React DevTools não disponível');
  }
  
  // Verificar localStorage para dados de contexto
  const contextKeys = Object.keys(localStorage).filter(key =>
    key.includes('auth') || 
    key.includes('tenant') || 
    key.includes('user') ||
    key.includes('context')
  );
  
  console.log('💾 [HOOK DEBUG] Chaves de contexto no localStorage:', contextKeys);
  
  contextKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, value ? JSON.parse(value) : value);
    } catch (e) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  });
}

// Função para simular chamada do hook
function simulateHookCall() {
  console.log('\n🧪 [HOOK DEBUG] === SIMULAÇÃO DE CHAMADA DO HOOK ===');
  
  // Dados de teste para simular uma atualização
  const mockIncidentId = 'test-incident-id';
  const mockUpdates = {
    title: 'Título Atualizado - ' + new Date().toISOString(),
    description: 'Descrição atualizada via simulação',
    tenant_id: localStorage.getItem('grc-selected-tenant-id') || 'mock-tenant-id'
  };
  
  console.log('📝 [HOOK DEBUG] Dados de simulação:', {
    id: mockIncidentId,
    updates: mockUpdates
  });
  
  // Verificar se há função de update disponível no escopo global
  const possibleUpdateFunctions = [
    'updateIncident',
    'useIncidentManagement',
    'incidentMutation',
    'mutateAsync'
  ];
  
  possibleUpdateFunctions.forEach(funcName => {
    if (window[funcName]) {
      console.log(`✅ [HOOK DEBUG] Função ${funcName} encontrada no escopo global`);
      
      if (typeof window[funcName] === 'function') {
        console.log(`🔧 [HOOK DEBUG] Tentando executar ${funcName}...`);
        try {
          const result = window[funcName](mockIncidentId, mockUpdates);
          console.log(`✅ [HOOK DEBUG] Resultado de ${funcName}:`, result);
        } catch (e) {
          console.error(`❌ [HOOK DEBUG] Erro ao executar ${funcName}:`, e);
        }
      }
    } else {
      console.log(`⚠️ [HOOK DEBUG] Função ${funcName} não encontrada`);
    }
  });
}

// Função para verificar network requests relacionados ao hook
function debugHookNetworkRequests() {
  console.log('\n🌐 [HOOK DEBUG] === MONITORAMENTO DE REDE DO HOOK ===');
  
  // Interceptar fetch para capturar requests do hook
  const originalFetch = window.fetch;
  let requestCount = 0;
  
  window.fetch = async function(...args) {
    const [url, options] = args;
    requestCount++;
    
    if (url.includes('incidents') || url.includes('supabase')) {
      console.log(`🌐 [HOOK DEBUG] Request #${requestCount}:`, {
        url,
        method: options?.method || 'GET',
        headers: options?.headers,
        body: options?.body ? JSON.parse(options.body) : null,
        timestamp: new Date().toISOString()
      });
      
      // Verificar se o tenant_id está sendo enviado
      if (options?.body) {
        try {
          const bodyData = JSON.parse(options.body);
          if (bodyData.tenant_id) {
            console.log(`✅ [HOOK DEBUG] tenant_id encontrado no body:`, bodyData.tenant_id);
          } else {
            console.warn(`⚠️ [HOOK DEBUG] tenant_id NÃO encontrado no body`);
          }
        } catch (e) {
          console.log(`ℹ️ [HOOK DEBUG] Body não é JSON válido`);
        }
      }
    }
    
    const response = await originalFetch.apply(this, args);
    
    if (url.includes('incidents') || url.includes('supabase')) {
      const clonedResponse = response.clone();
      try {
        const responseData = await clonedResponse.json();
        console.log(`📥 [HOOK DEBUG] Response #${requestCount}:`, {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          timestamp: new Date().toISOString()
        });
        
        // Verificar se há erros de RLS na resposta
        if (responseData.message && responseData.message.includes('RLS')) {
          console.error(`🚫 [HOOK DEBUG] ERRO DE RLS DETECTADO:`, responseData);
        }
        
      } catch (e) {
        console.log(`📥 [HOOK DEBUG] Response #${requestCount} (non-JSON):`, {
          status: response.status,
          statusText: response.statusText
        });
      }
    }
    
    return response;
  };
  
  console.log('✅ [HOOK DEBUG] Interceptor de rede configurado');
}

// Função para verificar estado específico do tenant
function debugTenantState() {
  console.log('\n🏢 [HOOK DEBUG] === ESTADO DO TENANT ===');
  
  // Verificar tenant selecionado
  const selectedTenant = localStorage.getItem('grc-selected-tenant-id');
  console.log('🎯 [HOOK DEBUG] Tenant selecionado:', selectedTenant);
  
  // Verificar se há dados de tenant no sessionStorage
  const tenantSessionData = Object.keys(sessionStorage).filter(key =>
    key.includes('tenant')
  );
  
  console.log('💾 [HOOK DEBUG] Dados de tenant no sessionStorage:', tenantSessionData);
  
  // Verificar se há função de tenant context disponível
  if (window.useTenantSelector) {
    console.log('✅ [HOOK DEBUG] useTenantSelector encontrado');
    try {
      const tenantInfo = window.useTenantSelector();
      console.log('🏢 [HOOK DEBUG] Informações do tenant:', tenantInfo);
    } catch (e) {
      console.error('❌ [HOOK DEBUG] Erro ao acessar useTenantSelector:', e);
    }
  }
  
  // Verificar se há função de current tenant ID
  if (window.useCurrentTenantId) {
    console.log('✅ [HOOK DEBUG] useCurrentTenantId encontrado');
    try {
      const currentTenantId = window.useCurrentTenantId();
      console.log('🆔 [HOOK DEBUG] Current Tenant ID:', currentTenantId);
    } catch (e) {
      console.error('❌ [HOOK DEBUG] Erro ao acessar useCurrentTenantId:', e);
    }
  }
}

// Função principal de debug do hook
function runHookDebug() {
  console.log('🚀 [HOOK DEBUG] === EXECUTANDO DEBUG COMPLETO DO HOOK ===');
  
  interceptHookCalls();
  debugReactQuery();
  debugReactContexts();
  debugTenantState();
  debugHookNetworkRequests();
  
  console.log('\n🎯 [HOOK DEBUG] === PRÓXIMOS PASSOS ===');
  console.log('1. Execute simulateHookCall() para simular uma chamada do hook');
  console.log('2. Tente editar um incidente e observe os logs');
  console.log('3. Verifique se o tenant_id está sendo incluído nas requisições');
  console.log('4. Observe se há erros de RLS nas respostas');
  
  return {
    timestamp: new Date().toISOString(),
    selectedTenant: localStorage.getItem('grc-selected-tenant-id'),
    hasReactQuery: !!window.queryClient,
    hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  };
}

// Disponibilizar funções globalmente
window.debugHookState = {
  runHookDebug,
  interceptHookCalls,
  debugReactQuery,
  debugReactContexts,
  simulateHookCall,
  debugHookNetworkRequests,
  debugTenantState
};

console.log('🔧 [HOOK DEBUG] Scripts carregados. Execute runHookDebug() para iniciar.');
console.log('🔧 [HOOK DEBUG] Ou use window.debugHookState para acessar funções específicas.');

// Auto-executar debug básico
setTimeout(() => {
  runHookDebug();
}, 1500);