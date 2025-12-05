// Script para injetar no console do browser para monitorar o salvamento
// Cole este código no console do browser (F12 > Console) e depois teste o modal

console.log('🔍 MONITOR DE INCIDENTES ATIVADO!');

// Interceptar todas as requisições fetch
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  const isIncidentRequest = typeof url === 'string' && (
    url.includes('/incidents') || 
    url.includes('incidents') ||
    url.includes('/rest/v1/incidents') ||
    (url.includes('supabase') && options?.method !== 'GET')
  );
  
  if (isIncidentRequest) {
    console.log('\n🌐 ===== REQUISIÇÃO INTERCEPTADA =====');
    console.log('📍 URL:', url);
    console.log('🔧 Method:', options?.method || 'GET');
    console.log('📤 Headers:', options?.headers);
    
    if (options?.body) {
      try {
        const bodyData = JSON.parse(options.body);
        console.log('📋 ===== DADOS SENDO ENVIADOS =====');
        console.log('📦 Payload completo:', bodyData);
        
        // Verificar campos específicos
        const importantFields = ['title', 'description', 'severity', 'type', 'category', 'priority', 'status'];
        console.log('🔍 ===== CAMPOS IMPORTANTES =====');
        importantFields.forEach(field => {
          if (bodyData.hasOwnProperty(field)) {
            console.log(`   ✅ ${field}: "${bodyData[field]}"`);
          } else {
            console.log(`   ❌ ${field}: NÃO PRESENTE`);
          }
        });
        
        // Verificar severity especificamente
        if (bodyData.severity !== undefined) {
          console.log(`🎯 ===== SEVERITY ESPECÍFICO =====`);
          console.log(`   Valor: "${bodyData.severity}"`);
          console.log(`   Tipo: ${typeof bodyData.severity}`);
          console.log(`   É string vazia: ${bodyData.severity === ''}`);
          console.log(`   É null: ${bodyData.severity === null}`);
          console.log(`   É undefined: ${bodyData.severity === undefined}`);
        } else {
          console.log('❌ ===== SEVERITY NÃO ESTÁ NO PAYLOAD! =====');
        }
        
      } catch (e) {
        console.log('📋 Body (não JSON):', options.body);
      }
    }
  }
  
  return originalFetch.apply(this, arguments)
    .then(response => {
      if (isIncidentRequest) {
        console.log('\n📥 ===== RESPOSTA RECEBIDA =====');
        console.log('📊 Status:', response.status);
        console.log('✅ OK:', response.ok);
        console.log('🔧 Status Text:', response.statusText);
        
        // Clonar para ler o body
        const clonedResponse = response.clone();
        clonedResponse.text().then(text => {
          try {
            const data = JSON.parse(text);
            console.log('📋 ===== DADOS DA RESPOSTA =====');
            console.log('📦 Resposta completa:', data);
            
            if (Array.isArray(data) && data.length > 0) {
              const savedRecord = data[0];
              console.log('💾 ===== REGISTRO SALVO =====');
              console.log(`   ID: ${savedRecord.id}`);
              console.log(`   Title: "${savedRecord.title}"`);
              console.log(`   Severity: "${savedRecord.severity || 'NÃO SALVO'}"`);
              console.log(`   Type: "${savedRecord.type || 'NÃO SALVO'}"`);
              console.log(`   Category: "${savedRecord.category || 'NÃO SALVO'}"`);
              console.log(`   Priority: "${savedRecord.priority || 'NÃO SALVO'}"`);
              console.log(`   Status: "${savedRecord.status || 'NÃO SALVO'}"`);
              
              // Verificar se severity foi realmente salvo
              if (savedRecord.severity) {
                console.log('🎉 ===== SEVERITY FOI SALVO COM SUCESSO! =====');
              } else {
                console.log('❌ ===== SEVERITY NÃO FOI SALVO! =====');
              }
            } else if (data && typeof data === 'object') {
              // Resposta de objeto único
              console.log('💾 ===== REGISTRO SALVO (OBJETO) =====');
              console.log(`   ID: ${data.id}`);
              console.log(`   Title: "${data.title}"`);
              console.log(`   Severity: "${data.severity || 'NÃO SALVO'}"`);
              
              if (data.severity) {
                console.log('🎉 ===== SEVERITY FOI SALVO COM SUCESSO! =====');
              } else {
                console.log('❌ ===== SEVERITY NÃO FOI SALVO! =====');
              }
            }
          } catch (e) {
            console.log('📋 Resposta (texto):', text.substring(0, 200));
          }
        });
      }
      return response;
    })
    .catch(error => {
      if (isIncidentRequest) {
        console.log('❌ ===== ERRO NA REQUISIÇÃO =====');
        console.log('🚨 Erro:', error);
      }
      throw error;
    });
};

// Monitorar eventos do formulário
function monitorFormEvents() {
  console.log('\n📝 ===== MONITORANDO FORMULÁRIO =====');
  
  // Encontrar o modal
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.log('❌ Modal não encontrado');
    return;
  }
  
  // Encontrar o formulário
  const form = modal.querySelector('form');
  if (!form) {
    console.log('❌ Formulário não encontrado no modal');
    return;
  }
  
  console.log('✅ Formulário encontrado');
  
  // Monitorar submit
  form.addEventListener('submit', function(e) {
    console.log('\n🚀 ===== SUBMIT DO FORMULÁRIO =====');
    
    // Capturar dados do formulário
    const formData = new FormData(form);
    const formObject = {};
    for (let [key, value] of formData.entries()) {
      formObject[key] = value;
    }
    
    console.log('📋 FormData capturado:', formObject);
    
    // Verificar campos específicos nos inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    console.log('🔍 ===== VALORES DOS CAMPOS =====');
    
    inputs.forEach(input => {
      if (input.id || input.name) {
        const fieldName = input.id || input.name;
        let value = input.value;
        
        console.log(`   ${fieldName}: "${value}"`);
        
        if (fieldName === 'severity') {
          console.log(`🎯 ===== SEVERITY NO INPUT =====`);
          console.log(`   Valor: "${value}"`);
          console.log(`   Tipo: ${typeof value}`);
        }
      }
    });
    
    // Verificar selects customizados (Radix UI)
    const severitySelect = form.querySelector('[data-radix-select-trigger]');
    if (severitySelect) {
      console.log('🔍 ===== SELECT CUSTOMIZADO SEVERITY =====');
      console.log('   Trigger text:', severitySelect.textContent);
      console.log('   Data state:', severitySelect.getAttribute('data-state'));
      console.log('   Data value:', severitySelect.getAttribute('data-value'));
    }
    
  }, true);
  
  // Monitorar clique no botão salvar
  const saveButton = modal.querySelector('button[type="submit"]');
  if (saveButton) {
    saveButton.addEventListener('click', function(e) {
      console.log('\n🖱️ ===== CLIQUE NO BOTÃO SALVAR =====');
      console.log('🔧 Botão texto:', e.target.textContent);
      console.log('🔧 Disabled:', e.target.disabled);
      console.log('🔧 Type:', e.target.type);
    }, true);
  }
}

// Aguardar o modal aparecer
function waitForModal() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.querySelector && node.querySelector('[role="dialog"]')) {
          console.log('✅ ===== MODAL DETECTADO =====');
          setTimeout(monitorFormEvents, 1000);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Verificar se já existe
  if (document.querySelector('[role="dialog"]')) {
    console.log('✅ ===== MODAL JÁ PRESENTE =====');
    monitorFormEvents();
  }
}

// Inicializar monitoramento
waitForModal();

console.log('\n📋 ===== INSTRUÇÕES =====');
console.log('1. Abra um incidente para edição');
console.log('2. Modifique o campo severity');
console.log('3. Clique em "Atualizar Incidente"');
console.log('4. Observe os logs detalhados acima');

console.log('\n🎯 ===== MONITORAMENTO ATIVO =====');
console.log('Aguardando ações do usuário...');

// Função para verificar estado atual do severity
window.checkSeverity = function() {
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.log('❌ Modal não encontrado');
    return;
  }
  
  const severitySelect = modal.querySelector('select[name="severity"], input[name="severity"]');
  if (severitySelect) {
    console.log('🔍 Severity atual:', severitySelect.value);
  } else {
    console.log('❌ Campo severity não encontrado');
  }
};

console.log('\n💡 Dica: Digite checkSeverity() no console para verificar o valor atual do severity');