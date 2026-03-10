// Diagnóstico final - copie e cole no console
console.log('🔍 === DIAGNÓSTICO FINAL DE PERSISTÊNCIA ===');

// 1. Estado atual
const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
console.log('🎨 Cor primária atual:', currentPrimary);

// 2. Verificar arquivo static-colors.css
fetch('/src/styles/static-colors.css')
  .then(r => r.text())
  .then(content => {
    console.log('\n📄 CONTEÚDO DO ARQUIVO static-colors.css:');
    console.log('Tamanho:', content.length, 'caracteres');
    
    // Procurar --primary
    const primaryMatch = content.match(/--primary:\s*([^;]+);/);
    if (primaryMatch) {
      const fileValue = primaryMatch[1].trim();
      console.log('📄 --primary no arquivo:', fileValue);
      
      if (fileValue === currentPrimary) {
        console.log('✅ ARQUIVO E APLICAÇÃO COINCIDEM');
        console.log('🎯 Problema pode ser cache do navegador');
      } else {
        console.log('❌ CONFLITO DETECTADO!');
        console.log('   Arquivo tem:', fileValue);
        console.log('   Aplicação tem:', currentPrimary);
        console.log('🔧 Estilos dinâmicos estão sobrescrevendo o arquivo');
      }
    } else {
      console.log('❌ --primary NÃO ENCONTRADO no arquivo!');
    }
    
    // Verificar se arquivo foi atualizado recentemente
    const timestampMatch = content.match(/Última atualização: ([^*]+)/);
    if (timestampMatch) {
      console.log('📅 Última atualização:', timestampMatch[1]);
    }
    
    // Mostrar primeiras linhas do arquivo
    console.log('\n📄 PRIMEIRAS LINHAS DO ARQUIVO:');
    console.log(content.substring(0, 500) + '...');
  })
  .catch(error => {
    console.log('❌ ERRO ao carregar arquivo:', error);
    console.log('🔧 Arquivo pode não existir ou ter problema de permissão');
  });

// 3. Verificar estilos dinâmicos
console.log('\n🎨 ESTILOS DINÂMICOS INTERFERINDO:');
const dynamicStyles = document.querySelectorAll('style[id]');
let foundDynamicPrimary = false;

dynamicStyles.forEach((style, i) => {
  if (style.textContent.includes('--primary')) {
    foundDynamicPrimary = true;
    console.log(`${i+1}. ${style.id}: SOBRESCREVENDO --primary`);
    
    // Extrair valor
    const match = style.textContent.match(/--primary:\s*([^;!]+)/);
    if (match) {
      console.log(`   └─ Valor: ${match[1].trim()}`);
    }
    
    // Mostrar parte do CSS
    console.log(`   └─ CSS: ${style.textContent.substring(0, 100)}...`);
  }
});

if (foundDynamicPrimary) {
  console.log('\n⚠️ PROBLEMA IDENTIFICADO: Estilos dinâmicos estão sobrescrevendo o arquivo!');
  console.log('💡 SOLUÇÃO: Execute cleanAllInterferences() para limpar');
} else {
  console.log('\n✅ Nenhum estilo dinâmico interferindo');
}

// 4. Verificar variáveis inline
const inlinePrimary = document.documentElement.style.getPropertyValue('--primary');
if (inlinePrimary) {
  console.log('\n⚠️ PROBLEMA: Variável --primary inline:', inlinePrimary);
  console.log('💡 SOLUÇÃO: Execute cleanAllInterferences() para limpar');
} else {
  console.log('\n✅ Nenhuma variável --primary inline');
}

// 5. Verificar ordem de carregamento CSS
console.log('\n📄 ORDEM DE CARREGAMENTO CSS:');
const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
cssLinks.forEach((link, i) => {
  console.log(`${i+1}. ${link.href.split('/').pop()}`);
  if (link.href.includes('static-colors')) {
    console.log('   ⭐ static-colors.css (deve ter prioridade)');
  }
});

// Função de limpeza TOTAL
window.cleanAllInterferences = function() {
  console.log('\n🧹 === LIMPEZA TOTAL ===');
  
  // 1. Remover TODOS os estilos dinâmicos
  const allStyles = document.querySelectorAll('style');
  let removedCount = 0;
  
  allStyles.forEach(style => {
    if (style.id && (
      style.id.includes('grc') || 
      style.id.includes('dynamic') || 
      style.id.includes('preview') ||
      style.id.includes('color') ||
      style.textContent.includes('--primary')
    )) {
      console.log(`🗑️ Removendo estilo: ${style.id}`);
      style.remove();
      removedCount++;
    }
  });
  
  console.log(`✅ Removidos ${removedCount} estilos dinâmicos`);
  
  // 2. Remover TODAS as variáveis CSS inline
  const cssVars = [
    'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
    'background', 'foreground', 'card', 'card-foreground', 'border', 
    'muted', 'muted-foreground', 'secondary', 'secondary-foreground'
  ];
  
  let removedVars = 0;
  cssVars.forEach(varName => {
    if (document.documentElement.style.getPropertyValue(`--${varName}`)) {
      document.documentElement.style.removeProperty(`--${varName}`);
      removedVars++;
    }
  });
  
  console.log(`✅ Removidas ${removedVars} variáveis inline`);
  
  // 3. Limpar localStorage
  const storageKeys = [
    'grc-user-colors', 'grc-pending-colors', 'grc-applied-colors', 
    'grc-generated-css', 'grc-color-backup'
  ];
  
  let removedStorage = 0;
  storageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedStorage++;
    }
  });
  
  console.log(`✅ Removidos ${removedStorage} itens do localStorage`);
  
  // 4. Forçar reload do CSS com cache bust
  console.log('🔄 Forçando reload do CSS...');
  
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  cssLinks.forEach(link => {
    if (link.href.includes('static-colors') || link.href.includes('index.css')) {
      const newLink = link.cloneNode();
      newLink.href = link.href.split('?')[0] + '?v=' + Date.now();
      link.parentNode.insertBefore(newLink, link.nextSibling);
      
      setTimeout(() => {
        link.remove();
        console.log(`✅ CSS recarregado: ${newLink.href.split('/').pop()}`);
      }, 200);
    }
  });
  
  // 5. Verificar resultado após limpeza
  setTimeout(() => {
    const finalPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log('\n🎯 RESULTADO APÓS LIMPEZA:');
    console.log('Cor primária agora:', finalPrimary);
    
    if (finalPrimary !== currentPrimary) {
      console.log('✅ COR MUDOU! Agora deve estar usando o arquivo CSS');
    } else {
      console.log('⚠️ Cor não mudou. Pode precisar de hard refresh');
      console.log('💡 Execute: location.reload(true)');
    }
  }, 2000);
};

// Função para hard refresh
window.hardRefresh = function() {
  console.log('🔄 Executando hard refresh...');
  location.reload(true);
};

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- cleanAllInterferences() - Limpar TODAS as interferências');
console.log('- hardRefresh() - Hard refresh da página');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Analise o diagnóstico acima');
console.log('2. Se há interferências, execute: cleanAllInterferences()');
console.log('3. Se não resolver, execute: hardRefresh()');
console.log('4. Verifique se o arquivo static-colors.css foi realmente salvo');