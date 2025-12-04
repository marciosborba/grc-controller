// FORCE HOOK EXECUTION - Script para forçar execução do hook de incidentes
// Execute este script no console do navegador

console.log('⚡ [FORCE HOOK] Iniciando execução forçada do hook...');

// Função para encontrar e clicar em elementos
function findAndClick(selectors, description) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`✅ [FORCE HOOK] ${description} encontrado:`, selector);
      element.click();
      return true;
    }
  }
  
  // Tentar busca por texto
  const buttons = Array.from(document.querySelectorAll('button'));
  for (const button of buttons) {
    if (button.textContent.includes('Novo Incidente') || 
        button.textContent.includes('Incidente') ||
        button.textContent.includes('Editar')) {
      console.log(`✅ [FORCE HOOK] ${description} encontrado por texto:`, button.textContent);
      button.click();
      return true;
    }
  }
  
  console.log(`❌ [FORCE HOOK] ${description} não encontrado`);
  return false;
}

// Função para aguardar elemento aparecer
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
    }, timeout);
  });
}

// Função para simular edição de incidente
async function simulateIncidentEdit() {
  console.log('\n📝 [FORCE HOOK] === SIMULANDO EDIÇÃO DE INCIDENTE ===');
  
  try {
    // 1. Procurar por botão de novo incidente
    const newIncidentSelectors = [
      'button[data-testid="new-incident"]',
      'button:contains("Novo Incidente")',
      '[aria-label="Novo Incidente"]',
      'button[title="Novo Incidente"]'
    ];
    
    if (findAndClick(newIncidentSelectors, 'Botão de Novo Incidente')) {
      console.log('⏳ [FORCE HOOK] Aguardando modal abrir...');
      
      try {
        // 2. Aguardar modal aparecer
        await waitForElement('[role="dialog"]', 3000);
        console.log('✅ [FORCE HOOK] Modal aberto');
        
        // 3. Preencher campos básicos
        const titleInput = document.querySelector('#title, input[placeholder*="título"], input[placeholder*="Título"]');
        if (titleInput) {
          titleInput.value = 'Teste de Edição - ' + new Date().toISOString();
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
          titleInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✅ [FORCE HOOK] Título preenchido');
        }
        
        const descriptionInput = document.querySelector('#description, textarea[placeholder*="descrição"]');
        if (descriptionInput) {
          descriptionInput.value = 'Descrição de teste para verificar hook';
          descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
          descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✅ [FORCE HOOK] Descrição preenchida');
        }
        
        // 4. Aguardar um pouco para o hook processar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 5. Tentar submeter o formulário
        const submitSelectors = [
          'button[type="submit"]',
          'button:contains("Criar")',
          'button:contains("Salvar")',
          'button:contains("Atualizar")'
        ];
        
        if (findAndClick(submitSelectors, 'Botão de Submit')) {
          console.log('✅ [FORCE HOOK] Formulário submetido - aguarde logs do hook...');
          
          // Aguardar resposta
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } else {
          console.log('⚠️ [FORCE HOOK] Botão de submit não encontrado, tentando Enter...');
          
          // Tentar pressionar Enter no formulário
          const form = document.querySelector('form');
          if (form) {
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              bubbles: true
            });
            form.dispatchEvent(enterEvent);
          }
        }
        
      } catch (e) {
        console.error('❌ [FORCE HOOK] Erro ao aguardar modal:', e);
      }
      
    } else {
      // Tentar encontrar incidente existente para editar
      console.log('🔍 [FORCE HOOK] Procurando incidentes existentes para editar...');
      
      const editButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        btn.textContent.includes('Editar') || 
        btn.textContent.includes('Edit') ||
        btn.querySelector('svg') // Botões com ícones
      );
      
      if (editButtons.length > 0) {
        console.log(`✅ [FORCE HOOK] ${editButtons.length} botões de edição encontrados`);
        editButtons[0].click();
        console.log('✅ [FORCE HOOK] Clicou no primeiro botão de edição');
        
        // Aguardar modal e tentar editar
        try {
          await waitForElement('[role="dialog"]', 3000);
          console.log('✅ [FORCE HOOK] Modal de edição aberto');
          
          // Modificar título
          const titleInput = document.querySelector('#title, input[value*=""]');
          if (titleInput) {
            titleInput.value = titleInput.value + ' - EDITADO ' + Date.now();
            titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            titleInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ [FORCE HOOK] Título modificado');
            
            // Tentar salvar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
              btn.textContent.includes('Atualizar') || 
              btn.textContent.includes('Salvar') ||
              btn.type === 'submit'
            );
            
            if (saveButtons.length > 0) {
              saveButtons[0].click();
              console.log('✅ [FORCE HOOK] Botão de atualizar clicado - aguarde logs...');
              
              // Aguardar resposta
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
          
        } catch (e) {
          console.error('❌ [FORCE HOOK] Erro ao editar incidente:', e);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ [FORCE HOOK] Erro na simulação:', error);
  }
}

// Função para verificar se há dados de incidentes
function checkIncidentData() {
  console.log('\n📊 [FORCE HOOK] === VERIFICANDO DADOS DE INCIDENTES ===');
  
  // Verificar se há tabela de incidentes
  const table = document.querySelector('table');
  if (table) {
    const rows = table.querySelectorAll('tbody tr');
    console.log(`📋 [FORCE HOOK] Tabela encontrada com ${rows.length} linhas`);
    
    if (rows.length > 0) {
      console.log('✅ [FORCE HOOK] Há incidentes na tabela');
      return true;
    } else {
      console.log('⚠️ [FORCE HOOK] Tabela vazia');
      return false;
    }
  } else {
    console.log('❌ [FORCE HOOK] Tabela de incidentes não encontrada');
    return false;
  }
}

// Função para verificar estado da página
function checkPageState() {
  console.log('\n🔍 [FORCE HOOK] === VERIFICANDO ESTADO DA PÁGINA ===');
  
  // Verificar URL
  console.log('🌐 [FORCE HOOK] URL atual:', window.location.pathname);
  
  // Verificar se está na página de incidentes
  if (!window.location.pathname.includes('incident')) {
    console.log('⚠️ [FORCE HOOK] Não está na página de incidentes');
    return false;
  }
  
  // Verificar se há elementos de loading
  const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
  if (loadingElements.length > 0) {
    console.log('⏳ [FORCE HOOK] Página ainda carregando...');
    return false;
  }
  
  // Verificar se há mensagens de erro
  const errorElements = document.querySelectorAll('.error, [role="alert"]');
  if (errorElements.length > 0) {
    console.log('❌ [FORCE HOOK] Erros encontrados na página');
    errorElements.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.textContent}`);
    });
  }
  
  console.log('✅ [FORCE HOOK] Página parece estar carregada');
  return true;
}

// Função principal
async function forceHookExecution() {
  console.log('🚀 [FORCE HOOK] === EXECUTANDO TESTE COMPLETO ===');
  
  // 1. Verificar estado da página
  if (!checkPageState()) {
    console.log('❌ [FORCE HOOK] Página não está pronta');
    return;
  }
  
  // 2. Verificar dados existentes
  const hasData = checkIncidentData();
  
  // 3. Simular interação
  await simulateIncidentEdit();
  
  // 4. Aguardar e verificar logs
  console.log('\n⏳ [FORCE HOOK] Aguardando logs do hook...');
  
  setTimeout(() => {
    console.log('\n📋 [FORCE HOOK] === VERIFICAÇÃO FINAL ===');
    
    // Verificar se apareceram logs do hook
    if (window.incidentLogger && window.incidentLogger.showLogs) {
      const logs = window.incidentLogger.showLogs();
      if (logs && logs.length > 0) {
        console.log('✅ [FORCE HOOK] Logs do hook capturados!');
      } else {
        console.log('❌ [FORCE HOOK] Nenhum log do hook capturado');
        console.log('🔍 [FORCE HOOK] Possíveis problemas:');
        console.log('  1. Hook não está sendo executado');
        console.log('  2. Logs não estão sendo emitidos');
        console.log('  3. Interceptor não está funcionando');
      }
    }
    
    // Verificar estado do React Query novamente
    if (window.incidentLogger && window.incidentLogger.checkHook) {
      window.incidentLogger.checkHook();
    }
    
  }, 5000);
}

// Disponibilizar funções
window.forceHookExecution = forceHookExecution;
window.simulateIncidentEdit = simulateIncidentEdit;
window.checkIncidentData = checkIncidentData;
window.checkPageState = checkPageState;

console.log('⚡ [FORCE HOOK] Script carregado!');
console.log('⚡ [FORCE HOOK] Execute forceHookExecution() para iniciar teste');

// Auto-executar após um delay
setTimeout(() => {
  console.log('🚀 [FORCE HOOK] Auto-executando teste...');
  forceHookExecution();
}, 2000);