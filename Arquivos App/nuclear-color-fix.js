// SOLUÇÃO NUCLEAR - FORÇA MÁXIMA PARA APLICAR CORES
console.log('💥 === SOLUÇÃO NUCLEAR PARA CORES ===');

// 1. Remover TUDO que pode interferir
console.log('🧹 Removendo interferências...');
document.querySelectorAll('style').forEach(style => {
  if (style.id && (style.id.includes('test') || style.id.includes('grc') || style.id.includes('color'))) {
    style.remove();
  }
});

// 2. Aplicar com especificidade NUCLEAR
console.log('💥 Aplicando com força nuclear...');

const nuclearStyle = document.createElement('style');
nuclearStyle.id = 'nuclear-color-fix';
nuclearStyle.textContent = `
  /* FORÇA NUCLEAR - MÁXIMA ESPECIFICIDADE */
  html body * {
    --primary: 0 100% 50% !important;
  }
  
  html body .bg-primary,
  html body button[class*="bg-primary"],
  html body [class*="bg-primary"],
  html body div[class*="bg-primary"],
  html body span[class*="bg-primary"] {
    background-color: #ff0000 !important;
    background: #ff0000 !important;
  }
  
  html body .text-primary,
  html body [class*="text-primary"],
  html body div[class*="text-primary"],
  html body span[class*="text-primary"] {
    color: #ff0000 !important;
  }
  
  html body .border-primary,
  html body [class*="border-primary"] {
    border-color: #ff0000 !important;
  }
  
  /* FORÇA SIDEBAR */
  html body [data-sidebar="sidebar"] [class*="text-primary"],
  html body [data-sidebar="sidebar"] .text-primary {
    color: #ff0000 !important;
  }
  
  /* FORÇA BOTÕES */
  html body button {
    background-color: #ff0000 !important;
  }
`;

document.head.insertBefore(nuclearStyle, document.head.firstChild);

// 3. Aplicar diretamente em TODOS os elementos
console.log('🎯 Aplicando diretamente em elementos...');

// Aplicar na variável CSS
document.documentElement.style.setProperty('--primary', '0 100% 50%', 'important');
document.body.style.setProperty('--primary', '0 100% 50%', 'important');

// Aplicar em TODOS os elementos primários
const primaryElements = document.querySelectorAll('.bg-primary, .text-primary, [class*="bg-primary"], [class*="text-primary"], button');
console.log(`Encontrados ${primaryElements.length} elementos para forçar`);

primaryElements.forEach((el, index) => {
  el.style.setProperty('background-color', '#ff0000', 'important');
  el.style.setProperty('color', '#ff0000', 'important');
  el.style.setProperty('border-color', '#ff0000', 'important');
  
  if (index < 5) {
    console.log(`Elemento ${index + 1} forçado:`, el.className);
  }
});

// 4. Forçar re-render
document.documentElement.offsetHeight;
document.body.offsetHeight;

// 5. Verificar resultado
setTimeout(() => {
  console.log('🔍 Verificando resultado...');
  
  const primaryVar = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Variável --primary:', primaryVar);
  
  const redElements = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = getComputedStyle(el);
    return style.backgroundColor.includes('255, 0, 0') || style.color.includes('255, 0, 0');
  });
  
  console.log(`Elementos vermelhos encontrados: ${redElements.length}`);
  
  if (redElements.length > 0) {
    console.log('✅ SUCESSO! Elementos ficaram vermelhos');
    console.log('🎯 O sistema de cores FUNCIONA');
    console.log('🔧 Problema está na interface do seletor ou persistência');
  } else {
    console.log('❌ FALHOU! Nenhum elemento ficou vermelho');
    console.log('🔧 Problema é de CSS/cache muito profundo');
    console.log('💡 Tente hard refresh (Ctrl+Shift+R)');
  }
  
  // Mostrar alguns elementos que deveriam estar vermelhos
  if (redElements.length > 0) {
    console.log('Primeiros elementos vermelhos:');
    redElements.slice(0, 3).forEach((el, i) => {
      console.log(`${i + 1}.`, el.tagName, el.className);
    });
  }
  
}, 1000);

// 6. Função para testar outras cores
window.nuclearColor = (color, name) => {
  console.log(`💥 Aplicando ${name} com força nuclear...`);
  
  // Atualizar CSS
  nuclearStyle.textContent = nuclearStyle.textContent.replace(/#ff0000/g, color);
  
  // Aplicar diretamente
  document.documentElement.style.setProperty('--primary', color, 'important');
  
  const elements = document.querySelectorAll('.bg-primary, .text-primary, [class*="bg-primary"], [class*="text-primary"], button');
  elements.forEach(el => {
    el.style.setProperty('background-color', color, 'important');
    el.style.setProperty('color', color, 'important');
  });
  
  console.log(`✅ ${name} aplicado com força nuclear!`);
};

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- nuclearColor("#00ff00", "VERDE") - Aplicar verde');
console.log('- nuclearColor("#8b5cf6", "ROXO") - Aplicar roxo');
console.log('- nuclearColor("#ff8800", "LARANJA") - Aplicar laranja');

console.log('\n📋 RESULTADO:');
console.log('Se NADA ficou vermelho: problema de cache muito sério');
console.log('Se ALGO ficou vermelho: sistema funciona, problema na interface');
console.log('');
console.log('🔄 Se não funcionou, tente: Ctrl+Shift+R (hard refresh)');