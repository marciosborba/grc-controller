// Teste específico do sistema de modal
console.log('🔍 === TESTE DO SISTEMA DE MODAL ===');

function testModalSystem() {
  console.log('\n🎯 TESTANDO SISTEMA DE MODAL...');
  
  // 1. Verificar se há função de aplicação de cores disponível
  console.log('1. Verificando funções disponíveis...');
  
  // Procurar por elementos do React que podem ter a função
  const buttons = document.querySelectorAll('button');
  let applyButton = null;
  
  buttons.forEach(button => {
    if (button.textContent.includes('Aplicar Cores')) {
      applyButton = button;
      console.log('✅ Botão "Aplicar Cores" encontrado');
    }
  });
  
  if (!applyButton) {
    console.log('❌ Botão "Aplicar Cores" NÃO encontrado');
    console.log('🔧 Verifique se está na página de Cores Estáticas');
    return;
  }
  
  // 2. Verificar se há modal no DOM
  console.log('\n2. Verificando modal no DOM...');
  const modals = document.querySelectorAll('[role="dialog"], .modal, [data-radix-dialog-content]');
  console.log(`Modais encontrados: ${modals.length}`);
  
  modals.forEach((modal, i) => {
    console.log(`Modal ${i + 1}:`, modal.className);
    if (modal.textContent.includes('CSS') || modal.textContent.includes('Código')) {
      console.log('  ⭐ Modal de CSS detectado');
    }
  });
  
  // 3. Verificar localStorage para CSS gerado
  console.log('\n3. Verificando localStorage...');
  const keys = Object.keys(localStorage);
  const colorKeys = keys.filter(key => key.includes('color') || key.includes('css') || key.includes('grc'));
  
  if (colorKeys.length > 0) {
    console.log('✅ Chaves relacionadas a cores encontradas:');
    colorKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`- ${key}: ${value ? value.substring(0, 50) + '...' : 'vazio'}`);
    });
  } else {
    console.log('⚠️ Nenhuma chave de cor no localStorage');
  }
  
  // 4. Simular clique no botão (se encontrado)
  if (applyButton && !applyButton.disabled) {
    console.log('\n4. Simulando clique no botão "Aplicar Cores"...');
    console.log('⚠️ ATENÇÃO: Isso vai executar a função real!');
    
    // Aguardar confirmação
    setTimeout(() => {
      console.log('🔥 Clicando no botão...');
      applyButton.click();
      
      // Verificar se modal apareceu após clique
      setTimeout(() => {
        const newModals = document.querySelectorAll('[role="dialog"], .modal, [data-radix-dialog-content]');
        const visibleModals = Array.from(newModals).filter(modal => {
          const style = getComputedStyle(modal);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });
        
        console.log(`\n📊 RESULTADO APÓS CLIQUE:`);
        console.log(`Modais visíveis: ${visibleModals.length}`);
        
        if (visibleModals.length > 0) {
          console.log('✅ MODAL APARECEU!');
          visibleModals.forEach((modal, i) => {
            console.log(`Modal ${i + 1}:`, modal.textContent.substring(0, 100) + '...');
          });
          
          // Verificar se tem CSS
          const hasCSS = visibleModals.some(modal => 
            modal.textContent.includes('--primary') || 
            modal.textContent.includes('CSS') ||
            modal.textContent.includes('static-colors')
          );
          
          if (hasCSS) {
            console.log('✅ Modal contém CSS!');
          } else {
            console.log('❌ Modal NÃO contém CSS');
          }
          
        } else {
          console.log('❌ MODAL NÃO APARECEU');
          console.log('🔧 Possíveis causas:');
          console.log('- Estado showCSSModal não foi alterado');
          console.log('- CSS gerado está vazio');
          console.log('- Erro na função applyColors');
        }
        
        // Verificar função downloadCSS
        if (typeof window.downloadCSS === 'function') {
          console.log('✅ Função downloadCSS disponível após clique');
        } else {
          console.log('❌ Função downloadCSS ainda NÃO disponível');
        }
        
      }, 2000);
      
    }, 1000);
    
  } else {
    console.log('\n4. ❌ Não foi possível simular clique');
    console.log('Botão desabilitado ou não encontrado');
  }
}

// Função para verificar estado do React
function checkReactState() {
  console.log('\n🔍 VERIFICANDO ESTADO DO REACT...');
  
  // Tentar encontrar componente React
  const reactElements = document.querySelectorAll('[data-reactroot], #root, [id*="react"]');
  console.log(`Elementos React encontrados: ${reactElements.length}`);
  
  // Verificar se há erros no console
  const originalError = console.error;
  let errorCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} erros detectados no console`);
    } else {
      console.log('✅ Nenhum erro detectado');
    }
  }, 1000);
}

// Função para forçar abertura do modal (debug)
function forceOpenModal() {
  console.log('\n🔧 TENTANDO FORÇAR ABERTURA DO MODAL...');
  
  // Procurar por elementos que podem ser o modal
  const possibleModals = document.querySelectorAll('[data-radix-dialog-content], [role="dialog"]');
  
  possibleModals.forEach((modal, i) => {
    console.log(`Tentando mostrar modal ${i + 1}...`);
    
    // Tentar diferentes métodos para mostrar
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '9999';
    
    // Remover classes que podem esconder
    modal.classList.remove('hidden', 'invisible');
    modal.classList.add('visible');
  });
  
  // Verificar se algum modal ficou visível
  setTimeout(() => {
    const visibleModals = Array.from(possibleModals).filter(modal => {
      const style = getComputedStyle(modal);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    if (visibleModals.length > 0) {
      console.log('✅ Modal forçado a aparecer!');
    } else {
      console.log('❌ Não foi possível forçar modal');
    }
  }, 500);
}

// Disponibilizar funções
window.testModalSystem = testModalSystem;
window.checkReactState = checkReactState;
window.forceOpenModal = forceOpenModal;

// Executar verificação inicial
checkReactState();

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- testModalSystem() - Testar sistema completo do modal');
console.log('- checkReactState() - Verificar estado do React');
console.log('- forceOpenModal() - Forçar abertura do modal (debug)');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: testModalSystem()');
console.log('2. Observe se o modal abre após clicar');
console.log('3. Se não abrir, verifique os logs de erro');