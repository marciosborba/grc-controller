// Script de diagnóstico para o problema atual
console.log('🔍 === DIAGNÓSTICO DO PROBLEMA ATUAL ===');

// 1. Verificar estado atual das cores
console.log('\n📊 1. ESTADO ATUAL DAS CORES:');
const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
const currentPrimaryHover = getComputedStyle(document.documentElement).getPropertyValue('--primary-hover').trim();
const currentPrimaryGlow = getComputedStyle(document.documentElement).getPropertyValue('--primary-glow').trim();

console.log('Cor primária atual:', currentPrimary);
console.log('Cor primária hover:', currentPrimaryHover);
console.log('Cor primária glow:', currentPrimaryGlow);

// Verificar se é roxo (esperado) ou outra cor
if (currentPrimary.includes('258 90% 66%')) {
  console.log('✅ Cor está ROXA (conforme esperado)');
} else if (currentPrimary.includes('173 88% 58%')) {
  console.log('❌ Cor voltou para VERDE TEAL (problema)');
} else {
  console.log('❓ Cor inesperada:', currentPrimary);
}

// 2. Verificar modo atual
console.log('\n🌓 2. MODO ATUAL:');
const isDark = document.documentElement.classList.contains('dark');
console.log('Modo detectado:', isDark ? 'dark' : 'light');

// 3. Verificar estilos dinâmicos ativos
console.log('\n🎨 3. ESTILOS DINÂMICOS ATIVOS:');
const dynamicStyles = document.querySelectorAll('style[id]');
console.log(`Total de estilos dinâmicos: ${dynamicStyles.length}`);

dynamicStyles.forEach((style, index) => {
  if (style.id) {
    console.log(`${index + 1}. ${style.id}: ${style.textContent.length} caracteres`);
    
    // Verificar se contém cores primárias
    if (style.textContent.includes('--primary:')) {
      const primaryMatch = style.textContent.match(/--primary:\s*([^;!]+)/);
      if (primaryMatch) {
        console.log(`   └─ Contém --primary: ${primaryMatch[1].trim()}`);
      }
    }
  }
});

// 4. Verificar localStorage
console.log('\n💾 4. LOCALSTORAGE:');
const colorKeys = [
  'grc-user-colors',
  'grc-pending-colors', 
  'grc-applied-colors',
  'grc-color-backup',
  'tenant-theme-applied',
  'lastThemeChangeTime'
];

let hasColorStorage = false;
colorKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`${key}: ${value.substring(0, 100)}...`);
    hasColorStorage = true;
  }
});

if (!hasColorStorage) {
  console.log('✅ Nenhum localStorage de cores encontrado');
}

// 5. Verificar CSS files carregados
console.log('\n📄 5. ARQUIVOS CSS CARREGADOS:');
const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
cssLinks.forEach((link, index) => {
  console.log(`${index + 1}. ${link.href}`);
  if (link.href.includes('static-colors') || link.href.includes('index.css')) {
    console.log(`   └─ ⭐ Arquivo importante de cores`);
  }
});

// 6. Testar aplicação de cor diretamente
console.log('\n🧪 6. TESTE DE APLICAÇÃO DIRETA:');
console.log('Tentando aplicar vermelho puro...');

// Backup da cor atual
const originalPrimary = currentPrimary;

// Aplicar vermelho
document.documentElement.style.setProperty('--primary', '0 100% 50%', 'important');

// Verificar se mudou
setTimeout(() => {
  const newPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor após teste:', newPrimary);
  
  if (newPrimary.includes('0 100% 50%') || newPrimary.includes('255, 0, 0')) {
    console.log('✅ APLICAÇÃO DIRETA FUNCIONA');
    
    // Restaurar cor original
    if (originalPrimary) {
      document.documentElement.style.setProperty('--primary', originalPrimary, 'important');
      console.log('🔄 Cor original restaurada');
    }
  } else {
    console.log('❌ APLICAÇÃO DIRETA FALHOU');
    console.log('Esperado: 0 100% 50%');
    console.log('Obtido:', newPrimary);
  }
}, 500);

// 7. Verificar se há elementos com cor primária visíveis
console.log('\n👁️ 7. ELEMENTOS COM COR PRIMÁRIA:');
const primaryElements = document.querySelectorAll('.bg-primary, .text-primary, [class*="bg-primary"], [class*="text-primary"]');
console.log(`Encontrados ${primaryElements.length} elementos com cor primária`);

if (primaryElements.length > 0) {
  primaryElements.forEach((el, index) => {
    if (index < 3) { // Mostrar apenas os primeiros 3
      const computedStyle = getComputedStyle(el);
      const bgColor = computedStyle.backgroundColor;
      const textColor = computedStyle.color;
      console.log(`Elemento ${index + 1}: bg=${bgColor}, color=${textColor}`);
    }
  });
}

// 8. Verificar se há conflitos de especificidade
console.log('\n⚔️ 8. VERIFICAÇÃO DE CONFLITOS:');

// Verificar se há !important conflitantes
const allStyles = Array.from(document.styleSheets);
let conflictCount = 0;

try {
  allStyles.forEach((sheet, sheetIndex) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach((rule, ruleIndex) => {
        if (rule.style && rule.style.getPropertyValue('--primary')) {
          const primaryValue = rule.style.getPropertyValue('--primary');
          const priority = rule.style.getPropertyPriority('--primary');
          console.log(`Conflito ${++conflictCount}: Folha ${sheetIndex}, Regra ${ruleIndex}`);
          console.log(`  └─ --primary: ${primaryValue} ${priority ? '!important' : ''}`);
        }
      });
    } catch (e) {
      // Ignorar erros de CORS
    }
  });
} catch (e) {
  console.log('⚠️ Não foi possível verificar todas as folhas de estilo (CORS)');
}

if (conflictCount === 0) {
  console.log('✅ Nenhum conflito de --primary encontrado');
}

// 9. Instruções para o usuário
console.log('\n📋 9. PRÓXIMOS PASSOS:');
console.log('1. Verifique se a aplicação direta funcionou (vermelho temporário)');
console.log('2. Se funcionou, o problema é na interface do seletor');
console.log('3. Se não funcionou, há conflito de CSS');
console.log('');
console.log('🔧 Para testar o seletor:');
console.log('1. Vá para Configurações > Cores estáticas');
console.log('2. Selecione uma cor bem diferente');
console.log('3. Clique "Aplicar Cores"');
console.log('4. Observe o console para logs de debug');
console.log('');
console.log('💡 Funções disponíveis:');
console.log('- testColorChange("120 100% 50%", "VERDE") - Testar cor específica');
console.log('- forceStaticColors() - Limpar interferências');

// Disponibilizar função de teste rápido
window.quickColorTest = (hsl, name) => {
  console.log(`🧪 Teste rápido: ${name} (${hsl})`);
  document.documentElement.style.setProperty('--primary', hsl, 'important');
  
  setTimeout(() => {
    const applied = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log(`Resultado: ${applied}`);
    
    if (applied.includes(hsl.split(' ')[0])) {
      console.log(`✅ ${name} aplicado com sucesso!`);
    } else {
      console.log(`❌ ${name} falhou na aplicação`);
    }
  }, 200);
};

console.log('');
console.log('🎯 Teste rápido disponível: quickColorTest("120 100% 50%", "VERDE")');