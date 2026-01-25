// Script para monitorar exatamente onde os dados do modal estão sendo salvos
console.log('🔍 MONITORANDO SALVAMENTO DO MODAL DE INCIDENTES...');

// Interceptar todas as requisições fetch
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  const isIncidentRequest = typeof url === 'string' && (
    url.includes('/incidents') || 
    url.includes('incidents') ||
    url.includes('/rest/v1/incidents') ||
    url.includes('supabase')
  );
  
  if (isIncidentRequest) {
    console.log('\n🌐 REQUISIÇÃO INTERCEPTADA:');
    console.log('📍 URL:', url);
    console.log('🔧 Method:', options?.method || 'GET');
    console.log('📤 Headers:', options?.headers);
    
    if (options?.body) {
      try {
        const bodyData = JSON.parse(options.body);
        console.log('📋 DADOS SENDO ENVIADOS:', bodyData);
        
        // Verificar campos específicos
        const importantFields = ['title', 'description', 'severity', 'type', 'category', 'priority', 'status'];
        console.log('🔍 CAMPOS IMPORTANTES:');
        importantFields.forEach(field => {
          if (bodyData.hasOwnProperty(field)) {
            console.log(`   ✅ ${field}: ${bodyData[field]}`);
          } else {
            console.log(`   ❌ ${field}: NÃO PRESENTE`);
          }
        });
        
        // Verificar se severity está sendo enviado
        if (bodyData.severity) {
          console.log(`🎯 SEVERITY SENDO ENVIADO: ${bodyData.severity}`);
        } else {
          console.log('❌ SEVERITY NÃO ESTÁ SENDO ENVIADO!');
        }
        
      } catch (e) {
        console.log('📋 Body (não JSON):', options.body);
      }
    }
  }
  
  return originalFetch.apply(this, arguments)
    .then(response => {
      if (isIncidentRequest) {
        console.log('\n📥 RESPOSTA RECEBIDA:');
        console.log('📊 Status:', response.status);
        console.log('✅ OK:', response.ok);
        
        // Clonar para ler o body
        const clonedResponse = response.clone();
        clonedResponse.text().then(text => {
          try {
            const data = JSON.parse(text);
            console.log('📋 DADOS DA RESPOSTA:', data);
            
            if (Array.isArray(data) && data.length > 0) {
              const savedRecord = data[0];
              console.log('💾 REGISTRO SALVO:');
              console.log(`   ID: ${savedRecord.id}`);
              console.log(`   Title: ${savedRecord.title}`);
              console.log(`   Severity: ${savedRecord.severity || 'NÃO SALVO'}`);
              console.log(`   Type: ${savedRecord.type || 'NÃO SALVO'}`);
              console.log(`   Category: ${savedRecord.category || 'NÃO SALVO'}`);
              console.log(`   Priority: ${savedRecord.priority || 'NÃO SALVO'}`);
              console.log(`   Status: ${savedRecord.status || 'NÃO SALVO'}`);
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
        console.log('❌ ERRO NA REQUISIÇÃO:', error);
      }
      throw error;
    });
};

// Interceptar XMLHttpRequest também
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
  const xhr = new originalXHR();
  const originalSend = xhr.send;
  const originalOpen = xhr.open;
  
  let requestUrl = '';
  let requestMethod = '';
  
  xhr.open = function(method, url, ...args) {
    requestUrl = url;
    requestMethod = method;
    return originalOpen.apply(this, [method, url, ...args]);
  };
  
  xhr.send = function(data) {
    const isIncidentRequest = requestUrl.includes('incidents') || requestUrl.includes('supabase');
    
    if (isIncidentRequest) {
      console.log('\n🌐 XHR INTERCEPTADO:');
      console.log('📍 URL:', requestUrl);
      console.log('🔧 Method:', requestMethod);
      
      if (data) {
        try {
          const bodyData = JSON.parse(data);
          console.log('📋 XHR DADOS:', bodyData);
        } catch (e) {
          console.log('📋 XHR Body:', data);
        }
      }
    }
    
    return originalSend.apply(this, [data]);
  };
  
  return xhr;
};

// Monitorar eventos do formulário
function monitorFormEvents() {
  console.log('\n📝 MONITORANDO EVENTOS DO FORMULÁRIO...');
  
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
    console.log('\n🚀 SUBMIT DO FORMULÁRIO DETECTADO!');
    
    // Capturar dados do formulário
    const formData = new FormData(form);
    const formObject = {};
    for (let [key, value] of formData.entries()) {
      formObject[key] = value;
    }
    
    console.log('📋 DADOS DO FORMULÁRIO NO SUBMIT:', formObject);
    
    // Verificar campos específicos nos inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    console.log('🔍 VALORES DOS CAMPOS:');
    
    inputs.forEach(input => {
      if (input.id || input.name) {
        const fieldName = input.id || input.name;
        let value = input.value;
        
        // Para selects customizados, pegar o valor do atributo data-value ou similar
        if (input.getAttribute('role') === 'combobox') {
          const hiddenInput = form.querySelector(`input[name="${fieldName}"]`);
          if (hiddenInput) {
            value = hiddenInput.value;
          }
        }
        
        console.log(`   ${fieldName}: ${value}`);
        
        if (fieldName === 'severity') {
          console.log(`🎯 SEVERITY NO FORMULÁRIO: ${value}`);
        }
      }
    });
    
    // Verificar selects customizados (Radix UI)
    const customSelects = form.querySelectorAll('[data-radix-select-trigger]');
    console.log('🔍 SELECTS CUSTOMIZADOS:');
    customSelects.forEach((select, index) => {
      const value = select.getAttribute('data-state') || select.textContent;
      console.log(`   Select ${index + 1}: ${value}`);
    });
    
  }, true);
  
  // Monitorar clique no botão salvar
  const saveButton = modal.querySelector('button[type="submit"]');
  if (saveButton) {
    saveButton.addEventListener('click', function(e) {
      console.log('\n🖱️ CLIQUE NO BOTÃO SALVAR DETECTADO!');
      console.log('🔧 Botão:', e.target.textContent);
      console.log('🔧 Disabled:', e.target.disabled);
    }, true);
  }
}

// Aguardar o modal aparecer
function waitForModal() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.querySelector && node.querySelector('[role="dialog"]')) {
          console.log('✅ Modal detectado!');
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
    console.log('✅ Modal já presente');
    monitorFormEvents();
  }
}

// Inicializar monitoramento
waitForModal();

console.log('\n📋 INSTRUÇÕES:');
console.log('1. Abra um incidente para edição');
console.log('2. Modifique alguns campos (incluindo severity)');
console.log('3. Clique em "Atualizar Incidente"');
console.log('4. Observe os logs no console');

console.log('\n🎯 MONITORAMENTO ATIVO - aguardando ações do usuário...');