// CAPTURE INCIDENT LOGS - Script para capturar logs específicos do hook de incidentes
// Execute este script no console do navegador

console.log('🎯 [INCIDENT LOGS] Iniciando captura de logs específicos...');

// Interceptar todos os console.log para capturar logs do hook
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

let incidentLogs = [];

function captureLog(level, args) {
  const logString = args.join(' ');
  const timestamp = new Date().toISOString();
  
  // Verificar se é log relacionado a incidentes
  if (logString.includes('INCIDENT') || 
      logString.includes('incident') ||
      logString.includes('mutation') ||
      logString.includes('tenant_id') ||
      logString.includes('useIncidentManagement') ||
      logString.includes('updateIncident') ||
      logString.includes('createIncident')) {
    
    const logEntry = {
      timestamp,
      level,
      message: logString,
      args: args
    };
    
    incidentLogs.push(logEntry);
    
    console.warn(`🎯 [INCIDENT CAPTURED] [${level}] ${logString}`);
  }
}

// Interceptar logs
console.log = function(...args) {
  captureLog('LOG', args);
  originalLog.apply(console, args);
};

console.warn = function(...args) {
  captureLog('WARN', args);
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  captureLog('ERROR', args);
  originalError.apply(console, args);
};

// Função para mostrar logs capturados
function showCapturedLogs() {
  console.log('\n📋 [INCIDENT LOGS] === LOGS CAPTURADOS ===');
  
  if (incidentLogs.length === 0) {
    console.log('⚠️ [INCIDENT LOGS] Nenhum log de incidente capturado ainda');
    return;
  }
  
  incidentLogs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.level}] ${log.timestamp}: ${log.message}`);
  });
  
  return incidentLogs;
}

// Função para limpar logs capturados
function clearCapturedLogs() {
  incidentLogs = [];
  console.log('🧹 [INCIDENT LOGS] Logs limpos');
}

// Função para verificar estado atual do hook
function checkHookState() {
  console.log('\n🔍 [INCIDENT LOGS] === VERIFICANDO ESTADO DO HOOK ===');
  
  // Verificar se há dados de incidentes no React Query
  try {
    const queryClient = window.queryClient;
    if (queryClient) {
      const queries = queryClient.getQueryCache().getAll();
      const incidentQueries = queries.filter(q => 
        q.queryKey.some(key => typeof key === 'string' && key.includes('incident'))
      );
      
      console.log('📊 [INCIDENT LOGS] Queries de incidentes encontradas:', incidentQueries.length);
      
      incidentQueries.forEach((query, index) => {
        console.log(`  ${index + 1}. Key:`, query.queryKey);
        console.log(`     Status:`, query.state.status);
        console.log(`     Data:`, query.state.data ? `${query.state.data.length} items` : 'Sem dados');
        console.log(`     Error:`, query.state.error?.message || 'Nenhum erro');
      });
      
      // Verificar mutations
      const mutations = queryClient.getMutationCache().getAll();
      const incidentMutations = mutations.filter(m =>
        m.options.mutationKey?.some(key => typeof key === 'string' && key.includes('incident'))
      );
      
      console.log('🔄 [INCIDENT LOGS] Mutations de incidentes:', incidentMutations.length);
      
      incidentMutations.forEach((mutation, index) => {
        console.log(`  ${index + 1}. Key:`, mutation.options.mutationKey);
        console.log(`     Status:`, mutation.state.status);
        console.log(`     Variables:`, mutation.state.variables);
        console.log(`     Error:`, mutation.state.error?.message || 'Nenhum erro');
      });
      
    } else {
      console.log('❌ [INCIDENT LOGS] Query Client não encontrado');
    }
  } catch (e) {
    console.error('❌ [INCIDENT LOGS] Erro ao verificar estado do hook:', e);
  }
}

// Função para forçar logs do hook
function triggerHookLogs() {
  console.log('\n🚀 [INCIDENT LOGS] === FORÇANDO LOGS DO HOOK ===');
  
  // Tentar invalidar queries para forçar reload
  try {
    if (window.queryClient) {
      window.queryClient.invalidateQueries(['incidents']);
      console.log('✅ [INCIDENT LOGS] Queries invalidadas - aguarde logs...');
    }
  } catch (e) {
    console.error('❌ [INCIDENT LOGS] Erro ao invalidar queries:', e);
  }
  
  // Simular clique no botão de novo incidente para ativar o hook
  try {
    const newIncidentButton = document.querySelector('button:contains("Novo Incidente")') ||
                             document.querySelector('[data-testid="new-incident"]') ||
                             Array.from(document.querySelectorAll('button')).find(btn => 
                               btn.textContent.includes('Novo Incidente') || 
                               btn.textContent.includes('Incidente')
                             );
    
    if (newIncidentButton) {
      console.log('🖱️ [INCIDENT LOGS] Simulando clique no botão de novo incidente...');
      newIncidentButton.click();
      
      setTimeout(() => {
        // Fechar modal se abriu
        const closeButton = document.querySelector('[data-testid="close-modal"]') ||
                           document.querySelector('button[aria-label="Close"]') ||
                           Array.from(document.querySelectorAll('button')).find(btn => 
                             btn.textContent.includes('Cancelar') || 
                             btn.textContent.includes('Fechar')
                           );
        
        if (closeButton) {
          closeButton.click();
          console.log('✅ [INCIDENT LOGS] Modal fechado');
        }
      }, 1000);
      
    } else {
      console.log('⚠️ [INCIDENT LOGS] Botão de novo incidente não encontrado');
    }
  } catch (e) {
    console.error('❌ [INCIDENT LOGS] Erro ao simular clique:', e);
  }
}

// Função para verificar dados específicos do usuário
function checkUserData() {
  console.log('\n👤 [INCIDENT LOGS] === DADOS DO USUÁRIO ===');
  
  // Dados do localStorage
  const selectedTenant = localStorage.getItem('grc-selected-tenant-id');
  console.log('🏢 [INCIDENT LOGS] Tenant selecionado:', selectedTenant);
  
  // Dados de auth do Supabase
  const authData = localStorage.getItem('sb-myxvxponlmulnjstbjwd-auth-token');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('🔐 [INCIDENT LOGS] User ID:', parsed.user?.id);
      console.log('🔐 [INCIDENT LOGS] Email:', parsed.user?.email);
    } catch (e) {
      console.log('🔐 [INCIDENT LOGS] Auth data presente mas não parseável');
    }
  }
  
  return {
    selectedTenant,
    hasAuthData: !!authData,
    timestamp: new Date().toISOString()
  };
}

// Função para monitorar network requests
function monitorNetworkRequests() {
  console.log('\n🌐 [INCIDENT LOGS] === MONITORANDO REQUISIÇÕES ===');
  
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const [url, options] = args;
    
    if (url.includes('incidents') || url.includes('supabase')) {
      console.log('🌐 [INCIDENT LOGS] REQUEST:', {
        url,
        method: options?.method || 'GET',
        timestamp: new Date().toISOString()
      });
      
      if (options?.body) {
        try {
          const body = JSON.parse(options.body);
          console.log('📤 [INCIDENT LOGS] REQUEST BODY:', body);
          
          if (body.tenant_id) {
            console.log('✅ [INCIDENT LOGS] tenant_id encontrado:', body.tenant_id);
          } else {
            console.warn('⚠️ [INCIDENT LOGS] tenant_id AUSENTE no body');
          }
        } catch (e) {
          console.log('📤 [INCIDENT LOGS] Body não é JSON:', options.body);
        }
      }
    }
    
    const response = await originalFetch.apply(this, args);
    
    if (url.includes('incidents') || url.includes('supabase')) {
      const clonedResponse = response.clone();
      
      try {
        const responseData = await clonedResponse.json();
        console.log('📥 [INCIDENT LOGS] RESPONSE:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          timestamp: new Date().toISOString()
        });
        
        if (responseData.error) {
          console.error('🚨 [INCIDENT LOGS] ERRO NA RESPOSTA:', responseData.error);
        }
        
      } catch (e) {
        console.log('📥 [INCIDENT LOGS] Response não é JSON');
      }
    }
    
    return response;
  };
  
  console.log('✅ [INCIDENT LOGS] Monitor de rede ativado');
}

// Função principal
function startIncidentLogging() {
  console.log('🚀 [INCIDENT LOGS] === INICIANDO CAPTURA COMPLETA ===');
  
  checkUserData();
  checkHookState();
  monitorNetworkRequests();
  triggerHookLogs();
  
  console.log('\n🎯 [INCIDENT LOGS] === INSTRUÇÕES ===');
  console.log('1. Agora tente editar um incidente');
  console.log('2. Observe os logs que aparecerão com [INCIDENT CAPTURED]');
  console.log('3. Execute showCapturedLogs() para ver todos os logs capturados');
  console.log('4. Execute checkHookState() para verificar estado atual');
  
  return {
    showCapturedLogs,
    clearCapturedLogs,
    checkHookState,
    checkUserData,
    triggerHookLogs
  };
}

// Disponibilizar funções globalmente
window.incidentLogger = {
  start: startIncidentLogging,
  showLogs: showCapturedLogs,
  clearLogs: clearCapturedLogs,
  checkHook: checkHookState,
  checkUser: checkUserData,
  triggerLogs: triggerHookLogs
};

console.log('🎯 [INCIDENT LOGS] Script carregado!');
console.log('🎯 [INCIDENT LOGS] Execute startIncidentLogging() ou window.incidentLogger.start()');

// Auto-iniciar
setTimeout(() => {
  startIncidentLogging();
}, 1000);