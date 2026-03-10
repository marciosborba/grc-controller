// Script para forçar aplicação da cor verde teal
console.log('🎨 === FORÇANDO COR VERDE TEAL ===');

// 1. Limpar COMPLETAMENTE o localStorage
console.log('🧹 Limpando localStorage...');
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  if (key.includes('color') || key.includes('theme') || key.includes('grc')) {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido: ${key}`);
  }
});

// 2. Remover TODOS os estilos dinâmicos
console.log('🗑️ Removendo estilos dinâmicos...');
const dynamicStyles = document.querySelectorAll('style[id], style[data-theme], style[data-vite-dev-id]');
dynamicStyles.forEach(style => {
  if (style.id && (style.id.includes('color') || style.id.includes('theme') || style.id.includes('grc'))) {
    console.log(`🗑️ Removendo estilo: ${style.id}`);
    style.remove();
  }
});

// 3. Aplicar cores verde teal DIRETAMENTE com máxima prioridade
console.log('🎨 Aplicando verde teal com máxima prioridade...');

const style = document.createElement('style');
style.id = 'FORCE-GREEN-TEAL';
style.textContent = `
  /* FORÇA VERDE TEAL COM MÁXIMA PRIORIDADE */
  html:root,
  html.dark:root,
  :root,
  .dark {
    --primary: 173 88% 58% !important;
    --primary-hover: 173 88% 54% !important;
    --primary-glow: 173 95% 78% !important;
  }
  
  /* FORÇA APLICAÇÃO EM TODOS OS ELEMENTOS PRIMÁRIOS */
  .bg-primary,
  button[class*="bg-primary"],
  [class*="bg-primary"],
  .text-primary,
  [class*="text-primary"],
  .border-primary,
  [class*="border-primary"] {
    --primary: 173 88% 58% !important;
    background-color: hsl(173 88% 58%) !important;
    color: hsl(173 88% 58%) !important;
    border-color: hsl(173 88% 58%) !important;
  }
  
  /* FORÇA HOVER */
  .bg-primary:hover,
  button[class*="bg-primary"]:hover,
  [class*="bg-primary"]:hover {
    background-color: hsl(173 88% 54%) !important;
  }
  
  /* FORÇA SIDEBAR ATIVO */
  [data-sidebar="sidebar"] [class*="text-primary"],
  [data-sidebar="sidebar"] .text-primary {
    color: hsl(173 88% 58%) !important;
  }
  
  /* FORÇA ÍCONES PRIMÁRIOS */
  .text-primary svg,
  [class*="text-primary"] svg {
    color: hsl(173 88% 58%) !important;
  }
`;

document.head.insertBefore(style, document.head.firstChild);

// 4. Aplicar diretamente nas variáveis CSS
console.log('🎨 Aplicando variáveis CSS diretamente...');
document.documentElement.style.setProperty('--primary', '173 88% 58%', 'important');
document.documentElement.style.setProperty('--primary-hover', '173 88% 54%', 'important');
document.documentElement.style.setProperty('--primary-glow', '173 95% 78%', 'important');

// 5. Forçar re-render
document.documentElement.offsetHeight;
window.dispatchEvent(new Event('resize'));

console.log('✅ VERDE TEAL APLICADO COM FORÇA MÁXIMA!');
console.log('🎨 Cor primária agora deve estar VERDE/TEAL em toda a aplicação');
console.log('');
console.log('📋 Para tornar permanente:');
console.log('1. Os arquivos CSS já foram alterados');
console.log('2. Recarregue a página (F5)');
console.log('3. A cor deve persistir');

// 6. Função para verificar se funcionou
setTimeout(() => {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('🔍 Verificação - Cor primária atual:', primaryColor);
  
  if (primaryColor.includes('173')) {
    console.log('✅ SUCESSO! Verde teal aplicado corretamente');
  } else {
    console.log('❌ FALHA! Cor ainda não é verde teal');
    console.log('🔄 Tentando novamente...');
    
    // Tentar novamente com mais força
    document.documentElement.style.setProperty('--primary', '173 88% 58%', 'important');
    
    // Aplicar em todos os elementos primários diretamente
    const primaryElements = document.querySelectorAll('.bg-primary, .text-primary, [class*="bg-primary"], [class*="text-primary"]');
    primaryElements.forEach(el => {
      el.style.setProperty('background-color', 'hsl(173 88% 58%)', 'important');
      el.style.setProperty('color', 'hsl(173 88% 58%)', 'important');
    });
  }
}, 1000);