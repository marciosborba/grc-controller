// Debug para problema de persistência após atualizar arquivo
console.log('🔍 === DEBUG: PROBLEMA DE PERSISTÊNCIA ===');

function debugPersistenceIssue() {
  console.log('\n📊 1. VERIFICANDO ESTADO ATUAL:');
  
  // Verificar cor primária atual
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor primária atual:', currentPrimary);
  
  // Verificar se há estilos dinâmicos interferindo
  console.log('\n🎨 2. ESTILOS DINÂMICOS ATIVOS:');
  const dynamicStyles = document.querySelectorAll('style[id]');
  let hasDynamicPrimary = false;
  
  dynamicStyles.forEach((style, index) => {
    if (style.textContent.includes('--primary')) {
      console.log(`${index + 1}. ${style.id}: CONTÉM --primary`);
      const primaryMatch = style.textContent.match(/--primary:\s*([^;!]+)/);
      if (primaryMatch) {
        console.log(`   └─ Valor: ${primaryMatch[1].trim()}`);
        hasDynamicPrimary = true;
      }
    } else {
      console.log(`${index + 1}. ${style.id}: sem --primary`);
    }
  });
  
  if (hasDynamicPrimary) {
    console.log('⚠️ PROBLEMA: Estilos dinâmicos estão sobrescrevendo o arquivo CSS!');
  } else {
    console.log('✅ Nenhum estilo dinâmico interferindo');
  }
  
  // Verificar variáveis CSS inline
  console.log('\n🔧 3. VARIÁVEIS CSS INLINE:');
  const inlinePrimary = document.documentElement.style.getPropertyValue('--primary');
  if (inlinePrimary) {
    console.log('⚠️ PROBLEMA: --primary definido inline:', inlinePrimary);
    console.log('Isso sobrescreve o arquivo CSS!');
  } else {
    console.log('✅ Nenhuma variável --primary inline');
  }
  
  // Verificar ordem de carregamento CSS
  console.log('\n📄 4. ORDEM DE CARREGAMENTO CSS:');
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  cssLinks.forEach((link, index) => {
    console.log(`${index + 1}. ${link.href}`);
    if (link.href.includes('static-colors')) {
      console.log('   ⭐ static-colors.css (deve carregar por último)');
    }
  });
  
  // Verificar conteúdo do arquivo static-colors.css
  console.log('\n📄 5. VERIFICANDO ARQUIVO static-colors.css:');
  fetch('/src/styles/static-colors.css')
    .then(response => response.text())
    .then(content => {
      const primaryMatch = content.match(/--primary:\s*([^;]+);/);
      if (primaryMatch) {
        const fileValue = primaryMatch[1].trim();
        console.log('📄 Valor no arquivo:', fileValue);
        
        if (fileValue === currentPrimary) {
          console.log('✅ Arquivo e valor atual COINCIDEM');
        } else {
          console.log('❌ CONFLITO: Arquivo tem valor diferente do aplicado');
          console.log('   Arquivo:', fileValue);
          console.log('   Atual:', currentPrimary);
        }
      } else {
        console.log('❌ --primary não encontrado no arquivo!');
      }
      
      // Verificar se arquivo foi realmente atualizado
      const timestamp = content.match(/Última atualização: ([^*]+)/);
      if (timestamp) {
        console.log('📅 Última atualização do arquivo:', timestamp[1]);
      }
      
      console.log(`📊 Tamanho do arquivo: ${content.length} caracteres`);
    })
    .catch(error => {
      console.log('❌ Erro ao carregar arquivo:', error);
    });
  
  // Verificar localStorage
  console.log('\n💾 6. LOCALSTORAGE:');
  const colorKeys = [
    'grc-user-colors',
    'grc-pending-colors', 
    'grc-applied-colors',
    'grc-generated-css'
  ];
  
  colorKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`${key}: ${value.substring(0, 50)}...`);
    }
  });
  
  // Teste de limpeza
  console.log('\n🧹 7. TESTE DE LIMPEZA:');
  console.log('Execute: cleanAllDynamicStyles() para limpar interferências');
}

// Função para limpar todas as interferências
function cleanAllDynamicStyles() {
  console.log('🧹 Limpando TODAS as interferências...');
  
  // Remover estilos dinâmicos
  const dynamicStyles = document.querySelectorAll('style[id]');
  dynamicStyles.forEach(style => {
    if (style.textContent.includes('--primary') || 
        style.id.includes('grc') || 
        style.id.includes('color') || 
        style.id.includes('dynamic') ||
        style.id.includes('preview')) {
      console.log(`🗑️ Removendo: ${style.id}`);
      style.remove();
    }
  });
  
  // Remover variáveis CSS inline
  const cssVars = [
    'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
    'background', 'foreground', 'card', 'card-foreground', 'border', 
    'muted', 'muted-foreground', 'secondary', 'secondary-foreground'
  ];
  
  cssVars.forEach(varName => {
    if (document.documentElement.style.getPropertyValue(`--${varName}`)) {
      console.log(`🗑️ Removendo variável inline: --${varName}`);
      document.documentElement.style.removeProperty(`--${varName}`);
    }
  });
  
  // Limpar localStorage
  const colorKeys = [
    'grc-user-colors',
    'grc-pending-colors', 
    'grc-applied-colors',
    'grc-generated-css'
  ];
  
  colorKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removido localStorage: ${key}`);
    }
  });
  
  // Forçar reload do CSS
  console.log('🔄 Forçando reload do CSS...');
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  cssLinks.forEach(link => {
    if (link.href.includes('static-colors') || link.href.includes('index.css')) {
      const newLink = link.cloneNode();
      newLink.href = link.href.split('?')[0] + '?v=' + Date.now();
      link.parentNode.insertBefore(newLink, link.nextSibling);
      setTimeout(() => link.remove(), 100);
    }
  });
  
  console.log('✅ Limpeza concluída! Aguarde 2 segundos...');
  
  setTimeout(() => {
    const newPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log('🎨 Cor primária após limpeza:', newPrimary);
    console.log('📄 Esta deve ser a cor do arquivo static-colors.css');
  }, 2000);
}

// Função para forçar hard refresh
function forceHardRefresh() {
  console.log('🔄 Executando hard refresh...');
  window.location.reload(true);
}

// Disponibilizar funções
window.debugPersistenceIssue = debugPersistenceIssue;
window.cleanAllDynamicStyles = cleanAllDynamicStyles;
window.forceHardRefresh = forceHardRefresh;

// Executar debug automaticamente
debugPersistenceIssue();

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- debugPersistenceIssue() - Analisar problema');
console.log('- cleanAllDynamicStyles() - Limpar interferências');
console.log('- forceHardRefresh() - Hard refresh da página');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Analise o debug acima');
console.log('2. Se há interferências, execute: cleanAllDynamicStyles()');
console.log('3. Se não resolver, execute: forceHardRefresh()');
console.log('4. Verifique se o arquivo foi realmente salvo');