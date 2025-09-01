// Script para forçar aplicação das cores do arquivo estático
console.log('🔧 === FORÇANDO CORES DO ARQUIVO ESTÁTICO ===');

// 1. Remover TODOS os estilos dinâmicos
console.log('🧹 Removendo estilos dinâmicos...');
const dynamicStyles = document.querySelectorAll('#grc-dynamic-preview, #grc-user-colors, #grc-temp-colors, #dynamic-colors, #preview-colors, #test-color, #FORCE-GREEN-TEAL, #grc-force-fallback, style[data-theme]');
dynamicStyles.forEach(style => {
  console.log(`🗑️ Removendo: ${style.id || 'unnamed'}`);
  style.remove();
});

// 2. Limpar localStorage
console.log('🧹 Limpando localStorage...');
const colorKeys = [
  'grc-user-colors',
  'grc-pending-colors', 
  'grc-applied-colors',
  'grc-color-backup',
  'tenant-theme-applied',
  'lastThemeChangeTime'
];

colorKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido localStorage: ${key}`);
  }
});

// 3. Remover variáveis CSS inline
console.log('🧹 Removendo variáveis CSS inline...');
const cssVars = [
  'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
  'background', 'foreground', 'card', 'card-foreground', 'border', 
  'muted', 'muted-foreground', 'secondary', 'secondary-foreground',
  'popover', 'popover-foreground', 'success', 'success-foreground',
  'warning', 'warning-foreground', 'danger', 'danger-foreground',
  'risk-critical', 'risk-high', 'risk-medium', 'risk-low',
  'sidebar-background', 'sidebar-foreground'
];

cssVars.forEach(varName => {
  document.documentElement.style.removeProperty(`--${varName}`);
});

// 4. Forçar re-carregamento do CSS estático
console.log('🔄 Forçando re-carregamento do CSS estático...');

// Encontrar o link do CSS estático
const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
const staticCssLink = cssLinks.find(link => link.href.includes('static-colors') || link.href.includes('index.css'));

if (staticCssLink) {
  console.log('📄 CSS estático encontrado:', staticCssLink.href);
  
  // Forçar reload do CSS
  const newLink = staticCssLink.cloneNode();
  newLink.href = staticCssLink.href + '?v=' + Date.now();
  staticCssLink.parentNode.insertBefore(newLink, staticCssLink.nextSibling);
  staticCssLink.remove();
  
  console.log('🔄 CSS recarregado com cache bust');
} else {
  console.log('⚠️ CSS estático não encontrado, forçando reload da página...');
}

// 5. Verificar cores após limpeza
setTimeout(() => {
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('🎨 Cor primária após limpeza:', currentPrimary);
  
  if (currentPrimary.includes('258 90% 66%')) {
    console.log('✅ SUCESSO! Cor roxa do arquivo estático aplicada');
  } else if (currentPrimary.includes('173 88% 58%')) {
    console.log('⚠️ Ainda mostrando verde teal - pode ser cache do navegador');
    console.log('💡 Tente: Ctrl+F5 (hard refresh) ou Ctrl+Shift+R');
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
}, 1000);

// 6. Função para hard refresh
window.forceHardRefresh = () => {
  console.log('🔄 Forçando hard refresh...');
  window.location.reload(true);
};

console.log('');
console.log('📋 INSTRUÇÕES:');
console.log('1. Se a cor não mudou, execute: forceHardRefresh()');
console.log('2. Ou pressione Ctrl+F5 para hard refresh');
console.log('3. Verifique se o arquivo static-colors.css foi salvo corretamente');
console.log('');
console.log('🎨 Cor esperada no arquivo: 258 90% 66% (roxa)');
console.log('🔍 Para verificar: getComputedStyle(document.documentElement).getPropertyValue("--primary")');

// Disponibilizar globalmente
window.forceStaticColors = () => {
  eval(document.querySelector('script[src*="force-static"]')?.textContent || 'console.log("Script não encontrado")');
};