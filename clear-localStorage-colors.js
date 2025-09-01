// Limpar todas as cores do localStorage que podem estar interferindo
console.log('🧹 === LIMPANDO CORES DO LOCALSTORAGE ===');

function clearAllColorStorage() {
  console.log('🗑️ Limpando todas as cores armazenadas...');
  
  const colorKeys = [
    'grc-pending-colors',
    'grc-applied-colors', 
    'grc-user-colors',
    'grc-color-backup',
    'grc-generated-css',
    'tenant-theme-applied',
    'lastThemeChangeTime',
    'grc-theme',
    'theme'
  ];
  
  let removedCount = 0;
  
  colorKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
      removedCount++;
    }
  });
  
  console.log(`\n📊 Total removido: ${removedCount} itens`);
  
  // Verificar se ainda há algo relacionado a cores
  const allKeys = Object.keys(localStorage);
  const remainingColorKeys = allKeys.filter(key => 
    key.toLowerCase().includes('color') || 
    key.toLowerCase().includes('theme') ||
    key.toLowerCase().includes('grc')
  );
  
  if (remainingColorKeys.length > 0) {
    console.log('\n⚠️ Ainda há chaves relacionadas a cores:');
    remainingColorKeys.forEach(key => {
      console.log(`- ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    });
  } else {
    console.log('\n✅ Nenhuma chave de cor restante');
  }
  
  // Remover estilos dinâmicos
  console.log('\n🎨 Removendo estilos dinâmicos...');
  const dynamicStyles = document.querySelectorAll('style[id]');
  let removedStyles = 0;
  
  dynamicStyles.forEach(style => {
    if (style.id.includes('grc') || 
        style.id.includes('color') || 
        style.id.includes('dynamic') ||
        style.textContent.includes('--primary')) {
      console.log(`🗑️ Removendo estilo: ${style.id}`);
      style.remove();
      removedStyles++;
    }
  });
  
  console.log(`📊 Estilos removidos: ${removedStyles}`);
  
  // Remover variáveis CSS inline
  console.log('\n🔧 Removendo variáveis CSS inline...');
  const cssVars = [
    'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
    'background', 'foreground', 'card', 'card-foreground', 'border'
  ];
  
  let removedVars = 0;
  cssVars.forEach(varName => {
    if (document.documentElement.style.getPropertyValue(`--${varName}`)) {
      document.documentElement.style.removeProperty(`--${varName}`);
      removedVars++;
    }
  });
  
  console.log(`📊 Variáveis CSS removidas: ${removedVars}`);
  
  // Forçar reload do CSS
  console.log('\n🔄 Forçando reload do CSS...');
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
  
  console.log('\n🎯 LIMPEZA CONCLUÍDA!');
  console.log('📋 Próximos passos:');
  console.log('1. Aguarde 2 segundos para reload do CSS');
  console.log('2. Verifique se a cor mudou para laranja');
  console.log('3. Se não mudou, faça hard refresh (Ctrl+Shift+R)');
  
  // Verificar cor após limpeza
  setTimeout(() => {
    const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log(`\n🎨 Cor primária após limpeza: ${currentPrimary}`);
    
    if (currentPrimary.includes('24 95% 53%') || currentPrimary.includes('24')) {
      console.log('✅ SUCESSO! Cor laranja detectada!');
    } else {
      console.log('⚠️ Cor ainda não mudou. Execute: location.reload(true)');
    }
  }, 3000);
}

// Executar automaticamente
clearAllColorStorage();

// Disponibilizar função
window.clearAllColorStorage = clearAllColorStorage;