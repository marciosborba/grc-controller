// Teste de persistência de cores
console.log('🧪 === TESTE DE PERSISTÊNCIA ===');

function testPersistence() {
  console.log('📊 Verificando ordem de carregamento CSS...');
  
  // Verificar cor primária atual
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor primária atual:', currentPrimary);
  
  // Verificar se é fallback ou personalizada
  if (currentPrimary.includes('258 90% 66%')) {
    console.log('🟣 Usando cor de FALLBACK (roxo)');
    console.log('📄 static-colors.css pode não estar carregando ou não tem cores personalizadas');
  } else {
    console.log('🎨 Usando cor PERSONALIZADA');
    console.log('✅ static-colors.css está funcionando');
  }
  
  // Verificar arquivos CSS carregados
  console.log('\n📄 Arquivos CSS carregados:');
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  cssLinks.forEach((link, index) => {
    console.log(`${index + 1}. ${link.href}`);
    if (link.href.includes('static-colors')) {
      console.log('   ⭐ static-colors.css encontrado');
    }
  });
  
  // Verificar estilos inline
  console.log('\n🎨 Estilos dinâmicos ativos:');
  const dynamicStyles = document.querySelectorAll('style[id]');
  dynamicStyles.forEach(style => {
    if (style.textContent.includes('--primary')) {
      console.log(`- ${style.id}: contém --primary`);
      const primaryMatch = style.textContent.match(/--primary:\s*([^;!]+)/);
      if (primaryMatch) {
        console.log(`  └─ Valor: ${primaryMatch[1].trim()}`);
      }
    }
  });
  
  // Teste de aplicação
  console.log('\n🧪 Testando aplicação de cor...');
  
  // Aplicar verde temporariamente
  const originalPrimary = currentPrimary;
  document.documentElement.style.setProperty('--primary', '120 100% 50%', 'important');
  
  setTimeout(() => {
    const testPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log('Cor após teste:', testPrimary);
    
    if (testPrimary.includes('120 100% 50%') || testPrimary.includes('120')) {
      console.log('✅ Aplicação dinâmica FUNCIONA');
      
      // Restaurar cor original
      document.documentElement.style.removeProperty('--primary');
      
      setTimeout(() => {
        const restoredPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        console.log('Cor após restaurar:', restoredPrimary);
        
        if (restoredPrimary === originalPrimary) {
          console.log('✅ Restauração FUNCIONA');
          console.log('🎯 Sistema dinâmico está OK');
        } else {
          console.log('⚠️ Restauração não funcionou perfeitamente');
        }
        
        // Instruções
        console.log('\n📋 DIAGNÓSTICO:');
        if (originalPrimary.includes('258 90% 66%')) {
          console.log('🔧 Usando fallback - static-colors.css não tem cores personalizadas');
          console.log('💡 Para personalizar:');
          console.log('1. Aplique uma cor na interface');
          console.log('2. Execute: simplePersist()');
          console.log('3. Substitua src/styles/static-colors.css');
          console.log('4. Recarregue (F5)');
        } else {
          console.log('✅ static-colors.css tem cores personalizadas');
          console.log('🎨 Para alterar, use a interface de cores estáticas');
        }
        
      }, 500);
      
    } else {
      console.log('❌ Aplicação dinâmica FALHOU');
      console.log('🔧 Há conflito de especificidade CSS');
    }
  }, 500);
}

// Função para verificar conteúdo do static-colors.css
async function checkStaticColorsFile() {
  console.log('\n📄 Verificando conteúdo do static-colors.css...');
  
  try {
    const response = await fetch('/src/styles/static-colors.css');
    const content = await response.text();
    
    // Procurar por --primary
    const primaryMatch = content.match(/--primary:\s*([^;]+);/);
    if (primaryMatch) {
      const primaryValue = primaryMatch[1].trim();
      console.log('📄 static-colors.css --primary:', primaryValue);
      
      if (primaryValue.includes('258 90% 66%')) {
        console.log('🟣 Arquivo tem cor de fallback (roxo)');
      } else {
        console.log('🎨 Arquivo tem cor personalizada');
      }
    } else {
      console.log('❌ --primary não encontrado no arquivo');
    }
    
    // Verificar tamanho do arquivo
    console.log(`📊 Tamanho do arquivo: ${content.length} caracteres`);
    
    if (content.length < 1000) {
      console.log('⚠️ Arquivo muito pequeno, pode estar corrompido');
    }
    
  } catch (error) {
    console.log('❌ Erro ao carregar static-colors.css:', error);
  }
}

// Executar testes
testPersistence();

// Disponibilizar funções
window.testPersistence = testPersistence;
window.checkStaticColorsFile = checkStaticColorsFile;

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- testPersistence() - Testar sistema de persistência');
console.log('- checkStaticColorsFile() - Verificar conteúdo do arquivo CSS');

// Auto-verificar arquivo após 2 segundos
setTimeout(checkStaticColorsFile, 2000);