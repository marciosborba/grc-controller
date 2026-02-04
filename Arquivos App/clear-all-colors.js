// Script para limpar TUDO e resetar o sistema de cores
console.log('🧹 === LIMPEZA COMPLETA DO SISTEMA DE CORES ===');

// 1. Remover TODOS os estilos dinâmicos
console.log('\n🗑️ 1. REMOVENDO ESTILOS DINÂMICOS:');
const allDynamicStyles = document.querySelectorAll('style[id]');
console.log(`Encontrados ${allDynamicStyles.length} estilos dinâmicos`);

allDynamicStyles.forEach(style => {
  if (style.id && (
    style.id.includes('grc') || 
    style.id.includes('color') || 
    style.id.includes('theme') || 
    style.id.includes('dynamic') || 
    style.id.includes('preview') ||
    style.id.includes('test') ||
    style.id.includes('force')
  )) {
    console.log(`🗑️ Removendo: ${style.id}`);
    style.remove();
  }
});

// 2. Limpar COMPLETAMENTE o localStorage
console.log('\n🧹 2. LIMPANDO LOCALSTORAGE:');
const allKeys = Object.keys(localStorage);
let removedCount = 0;

allKeys.forEach(key => {
  if (key.includes('grc') || key.includes('color') || key.includes('theme')) {
    console.log(`🗑️ Removendo localStorage: ${key}`);
    localStorage.removeItem(key);
    removedCount++;
  }
});

console.log(`✅ Removidos ${removedCount} itens do localStorage`);

// 3. Remover TODAS as variáveis CSS inline
console.log('\n🧹 3. REMOVENDO VARIÁVEIS CSS INLINE:');
const cssVars = [
  'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
  'background', 'foreground', 'card', 'card-foreground', 'border', 
  'muted', 'muted-foreground', 'secondary', 'secondary-foreground',
  'popover', 'popover-foreground', 'success', 'success-foreground',
  'warning', 'warning-foreground', 'danger', 'danger-foreground',
  'risk-critical', 'risk-high', 'risk-medium', 'risk-low',
  'sidebar-background', 'sidebar-foreground'
];

let removedVars = 0;
cssVars.forEach(varName => {
  if (document.documentElement.style.getPropertyValue(`--${varName}`)) {
    document.documentElement.style.removeProperty(`--${varName}`);
    removedVars++;
  }
});

console.log(`✅ Removidas ${removedVars} variáveis CSS inline`);

// 4. Forçar reload de TODOS os arquivos CSS
console.log('\n🔄 4. FORÇANDO RELOAD DOS ARQUIVOS CSS:');
const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
let reloadedCount = 0;

cssLinks.forEach(link => {
  console.log(`🔄 Recarregando: ${link.href}`);
  
  const newLink = link.cloneNode();
  newLink.href = link.href.split('?')[0] + '?v=' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
  
  setTimeout(() => {
    link.remove();
    reloadedCount++;
  }, 100);
});

console.log(`✅ Recarregados ${cssLinks.length} arquivos CSS`);

// 5. Verificar estado após limpeza
setTimeout(() => {
  console.log('\n📊 5. VERIFICAÇÃO APÓS LIMPEZA:');
  
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor primária atual:', currentPrimary);
  
  // Verificar se voltou para as cores dos arquivos estáticos
  if (currentPrimary.includes('258 90% 66%')) {
    console.log('✅ SUCESSO! Voltou para ROXO do arquivo estático');
  } else if (currentPrimary.includes('173 88% 58%')) {
    console.log('⚠️ Voltou para VERDE TEAL - pode ser do index.css');
  } else {
    console.log('❓ Cor inesperada:', currentPrimary);
  }
  
  // Verificar se há estilos dinâmicos restantes
  const remainingDynamic = document.querySelectorAll('style[id*="grc"], style[id*="color"], style[id*="theme"]');
  if (remainingDynamic.length > 0) {
    console.log('⚠️ Estilos dinâmicos restantes:', remainingDynamic.length);
    remainingDynamic.forEach(style => console.log('- ' + (style.id || 'unnamed')));
  } else {
    console.log('✅ Nenhum estilo dinâmico restante');
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Se a cor não está correta, há problema nos arquivos CSS');
  console.log('2. Verifique se static-colors.css tem a cor desejada');
  console.log('3. Verifique se index.css não está sobrescrevendo');
  console.log('4. Execute um hard refresh (Ctrl+F5)');
  
}, 2000);

// 6. Função para hard refresh
window.hardRefresh = () => {
  console.log('🔄 Executando hard refresh...');
  window.location.reload(true);
};

// 7. Função para verificar arquivos CSS
window.checkCSSFiles = async () => {
  console.log('📄 Verificando conteúdo dos arquivos CSS...');
  
  try {
    // Verificar static-colors.css
    const staticResponse = await fetch('/src/styles/static-colors.css');
    const staticContent = await staticResponse.text();
    
    const staticPrimaryMatch = staticContent.match(/--primary:\s*([^;]+);/);
    if (staticPrimaryMatch) {
      console.log('📄 static-colors.css --primary:', staticPrimaryMatch[1].trim());
    }
    
    // Verificar index.css
    const indexResponse = await fetch('/src/index.css');
    const indexContent = await indexResponse.text();
    
    const indexPrimaryMatch = indexContent.match(/--primary:\s*([^;]+);/);
    if (indexPrimaryMatch) {
      console.log('📄 index.css --primary:', indexPrimaryMatch[1].trim());
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar arquivos CSS:', error);
  }
};

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- hardRefresh() - Hard refresh da página');
console.log('- checkCSSFiles() - Verificar conteúdo dos arquivos CSS');
console.log('');
console.log('🎨 SISTEMA LIMPO! Agora teste novamente o seletor de cores.');