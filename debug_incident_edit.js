// DEBUG SCRIPT - Incident Edit Flow
// Execute este script no console do navegador para debugar o problema de edição de incidentes

console.log('🔍 [DEBUG] Iniciando debug do fluxo de edição de incidentes...');

// 1. Verificar contexto de autenticação
function debugAuthContext() {
  console.log('\n📋 [DEBUG] === CONTEXTO DE AUTENTICAÇÃO ===');
  
  // Verificar se há contexto de auth disponível
  const authContext = window.React?.useContext ? 'React disponível' : 'React não disponível';
  console.log('React Context:', authContext);
  
  // Verificar localStorage para dados de auth
  const supabaseAuth = localStorage.getItem('sb-myxvxponlmulnjstbjwd-auth-token');
  console.log('Supabase Auth Token:', supabaseAuth ? 'Presente' : 'Ausente');
  
  // Verificar sessionStorage
  const sessionData = Object.keys(sessionStorage).filter(key => key.includes('supabase') || key.includes('auth'));
  console.log('Session Storage Keys:', sessionData);
  
  return {
    hasAuth: !!supabaseAuth,
    sessionKeys: sessionData
  };
}

// 2. Verificar contexto de tenant
function debugTenantContext() {
  console.log('\n🏢 [DEBUG] === CONTEXTO DE TENANT ===');
  
  // Verificar localStorage para tenant selecionado
  const selectedTenant = localStorage.getItem('grc-selected-tenant-id');
  console.log('Selected Tenant ID:', selectedTenant);
  
  // Verificar se há dados de tenant no sessionStorage
  const tenantData = Object.keys(localStorage).filter(key => key.includes('tenant'));
  console.log('Tenant-related keys:', tenantData);
  
  return {
    selectedTenantId: selectedTenant,
    tenantKeys: tenantData
  };
}

// 3. Interceptar chamadas de API
function setupAPIInterceptor() {
  console.log('\n🌐 [DEBUG] === CONFIGURANDO INTERCEPTOR DE API ===');
  
  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [url, options] = args;
    
    if (url.includes('incidents') || url.includes('supabase')) {
      console.log('🔗 [API] Intercepted request:', {
        url,
        method: options?.method || 'GET',
        headers: options?.headers,
        body: options?.body
      });
    }
    
    const response = await originalFetch.apply(this, args);
    
    if (url.includes('incidents') || url.includes('supabase')) {
      const clonedResponse = response.clone();
      try {
        const responseData = await clonedResponse.json();
        console.log('📥 [API] Response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
      } catch (e) {
        console.log('📥 [API] Response (non-JSON):', {
          url,
          status: response.status,
          statusText: response.statusText
        });
      }
    }
    
    return response;
  };
  
  console.log('✅ [DEBUG] API Interceptor configurado');
}

// 4. Verificar estado do formulário
function debugFormState() {
  console.log('\n📝 [DEBUG] === ESTADO DO FORMULÁRIO ===');
  
  // Procurar por elementos do formulário de incidente
  const modal = document.querySelector('[role="dialog"]');
  const form = document.querySelector('form');
  const titleInput = document.querySelector('#title, input[placeholder*="título"], input[placeholder*="Título"]');
  const submitButton = document.querySelector('button[type="submit"], button:contains("Atualizar"), button:contains("Salvar")');
  
  console.log('Modal encontrado:', !!modal);
  console.log('Form encontrado:', !!form);
  console.log('Title input encontrado:', !!titleInput);
  console.log('Submit button encontrado:', !!submitButton);
  
  if (titleInput) {
    console.log('Valor do título:', titleInput.value);
  }
  
  // Verificar se há dados no formulário
  const inputs = document.querySelectorAll('input, textarea, select');
  const formData = {};
  inputs.forEach(input => {
    if (input.id || input.name) {
      formData[input.id || input.name] = input.value;
    }
  });
  
  console.log('Dados do formulário:', formData);
  
  return {
    hasModal: !!modal,
    hasForm: !!form,
    formData
  };
}

// 5. Verificar console errors
function debugConsoleErrors() {
  console.log('\n❌ [DEBUG] === MONITORAMENTO DE ERROS ===');
  
  // Interceptar console.error
  const originalError = console.error;
  console.error = function(...args) {
    console.log('🚨 [ERROR INTERCEPTED]:', args);
    originalError.apply(console, args);
  };
  
  // Interceptar window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    console.log('🚨 [WINDOW ERROR]:', {
      message,
      source,
      lineno,
      colno,
      error
    });
  };
  
  // Interceptar unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.log('🚨 [UNHANDLED PROMISE REJECTION]:', event.reason);
  });
  
  console.log('✅ [DEBUG] Error monitoring configurado');
}

// 6. Verificar network requests específicos
function debugNetworkRequests() {
  console.log('\n🌍 [DEBUG] === MONITORAMENTO DE REDE ===');
  
  // Verificar se há requests pendentes
  const performanceEntries = performance.getEntriesByType('navigation');
  console.log('Performance entries:', performanceEntries);
  
  // Monitorar XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url, ...args) {
      if (url.includes('incidents') || url.includes('supabase')) {
        console.log('📡 [XHR] Opening request:', { method, url });
      }
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    xhr.send = function(data) {
      if (this.responseURL && (this.responseURL.includes('incidents') || this.responseURL.includes('supabase'))) {
        console.log('📤 [XHR] Sending data:', data);
        
        this.addEventListener('load', function() {
          console.log('📥 [XHR] Response received:', {
            status: this.status,
            statusText: this.statusText,
            response: this.response
          });
        });
        
        this.addEventListener('error', function() {
          console.log('🚨 [XHR] Request failed:', {
            status: this.status,
            statusText: this.statusText
          });
        });
      }
      
      return originalSend.apply(this, [data]);
    };
    
    return xhr;
  };
  
  console.log('✅ [DEBUG] Network monitoring configurado');
}

// 7. Função principal de debug
function runFullDebug() {
  console.log('🚀 [DEBUG] === EXECUTANDO DEBUG COMPLETO ===');
  
  const authInfo = debugAuthContext();
  const tenantInfo = debugTenantContext();
  const formInfo = debugFormState();
  
  setupAPIInterceptor();
  debugConsoleErrors();
  debugNetworkRequests();
  
  console.log('\n📊 [DEBUG] === RESUMO ===');
  console.log('Auth Status:', authInfo);
  console.log('Tenant Status:', tenantInfo);
  console.log('Form Status:', formInfo);
  
  console.log('\n🎯 [DEBUG] === PRÓXIMOS PASSOS ===');
  console.log('1. Tente editar um incidente agora');
  console.log('2. Observe os logs que aparecerão');
  console.log('3. Verifique especialmente:');
  console.log('   - Se o tenant_id está sendo enviado');
  console.log('   - Se há erros de RLS');
  console.log('   - Se a resposta da API é bem-sucedida');
  
  return {
    auth: authInfo,
    tenant: tenantInfo,
    form: formInfo,
    timestamp: new Date().toISOString()
  };
}

// 8. Função para verificar estado específico do Supabase
function debugSupabaseState() {
  console.log('\n🔧 [DEBUG] === ESTADO DO SUPABASE ===');
  
  // Verificar se o Supabase está disponível globalmente
  const supabaseClient = window.supabase || window._supabase;
  console.log('Supabase Client:', supabaseClient ? 'Disponível' : 'Não disponível');
  
  if (supabaseClient) {
    console.log('Supabase URL:', supabaseClient.supabaseUrl);
    console.log('Supabase Key:', supabaseClient.supabaseKey ? 'Presente' : 'Ausente');
  }
  
  // Verificar auth state
  try {
    if (supabaseClient?.auth) {
      supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
        console.log('Supabase Session:', session ? 'Ativa' : 'Inativa');
        console.log('Session Error:', error);
        if (session) {
          console.log('User ID:', session.user.id);
          console.log('User Email:', session.user.email);
        }
      });
    }
  } catch (e) {
    console.log('Erro ao verificar sessão:', e);
  }
}

// 9. Função para simular uma atualização de incidente
function simulateIncidentUpdate() {
  console.log('\n🧪 [DEBUG] === SIMULAÇÃO DE ATUALIZAÇÃO ===');
  
  const testData = {
    id: 'test-incident-id',
    title: 'Teste de Atualização',
    description: 'Descrição de teste',
    tenant_id: localStorage.getItem('grc-selected-tenant-id') || 'test-tenant-id'
  };
  
  console.log('Dados de teste:', testData);
  console.log('Tenant ID selecionado:', testData.tenant_id);
  
  // Verificar se há função de update disponível
  if (window.updateIncident) {
    console.log('Função updateIncident encontrada, testando...');
    try {
      window.updateIncident(testData);
    } catch (e) {
      console.log('Erro ao executar updateIncident:', e);
    }
  } else {
    console.log('Função updateIncident não encontrada no escopo global');
  }
}

// Executar debug automaticamente
console.log('🔍 [DEBUG] Script carregado. Execute runFullDebug() para iniciar o debug completo.');
console.log('🔍 [DEBUG] Ou execute debugSupabaseState() para verificar o estado do Supabase.');
console.log('🔍 [DEBUG] Ou execute simulateIncidentUpdate() para simular uma atualização.');

// Auto-executar debug básico
setTimeout(() => {
  runFullDebug();
  debugSupabaseState();
}, 1000);

// Exportar funções para uso manual
window.debugIncidentEdit = {
  runFullDebug,
  debugAuthContext,
  debugTenantContext,
  debugFormState,
  debugSupabaseState,
  simulateIncidentUpdate,
  setupAPIInterceptor,
  debugConsoleErrors,
  debugNetworkRequests
};

console.log('✅ [DEBUG] Todas as funções de debug disponíveis em window.debugIncidentEdit');