// Teste simples e direto de mudança de cor
console.log('🎨 === TESTE SIMPLES DE MUDANÇA DE COR ===');

// Função para testar mudança de cor
function testColorChange(color, colorName) {
  console.log(`\n🧪 Testando cor: ${colorName} (${color})`);
  
  // 1. Limpar estilos existentes
  const existingStyles = document.querySelectorAll('#test-color, #grc-dynamic-preview, #grc-user-colors');
  existingStyles.forEach(style => style.remove());
  
  // 2. Aplicar cor com máxima especificidade
  const style = document.createElement('style');
  style.id = 'test-color';
  style.textContent = `
    /* TESTE DE COR: ${colorName} */
    html:root,
    html.dark:root,
    :root,
    .dark {
      --primary: ${color} !important;
    }
    
    /* FORÇA APLICAÇÃO EM ELEMENTOS */
    .bg-primary,
    button[class*="bg-primary"],
    [class*="bg-primary"] {
      background-color: hsl(${color}) !important;
    }
    
    .text-primary,
    [class*="text-primary"] {
      color: hsl(${color}) !important;
    }
    
    .border-primary,
    [class*="border-primary"] {
      border-color: hsl(${color}) !important;
    }
  `;
  
  document.head.insertBefore(style, document.head.firstChild);
  
  // 3. Verificar se foi aplicada
  setTimeout(() => {
    const appliedColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log(`Cor aplicada: ${appliedColor}`);
    
    if (appliedColor.includes(color.split(' ')[0])) {
      console.log(`✅ ${colorName} aplicada com SUCESSO!`);
    } else {
      console.log(`❌ ${colorName} FALHOU na aplicação`);
    }
  }, 500);
}

// Testes sequenciais
console.log('🚀 Iniciando testes sequenciais...');

// Teste 1: Vermelho
setTimeout(() => testColorChange('0 100% 50%', 'VERMELHO'), 1000);

// Teste 2: Verde
setTimeout(() => testColorChange('120 100% 50%', 'VERDE'), 3000);

// Teste 3: Azul
setTimeout(() => testColorChange('240 100% 50%', 'AZUL'), 5000);

// Teste 4: Roxo
setTimeout(() => testColorChange('300 100% 50%', 'ROXO'), 7000);

// Teste 5: Laranja
setTimeout(() => testColorChange('30 100% 50%', 'LARANJA'), 9000);

// Limpeza final
setTimeout(() => {
  console.log('\n🧹 Limpando testes...');
  document.getElementById('test-color')?.remove();
  console.log('✅ Testes concluídos!');
  
  console.log('\n📋 RESULTADO:');
  console.log('- Se TODAS as cores funcionaram: Sistema OK, problema na interface');
  console.log('- Se NENHUMA cor funcionou: Problema de CSS/especificidade');
  console.log('- Se ALGUMAS funcionaram: Problema específico de conversão');
}, 11000);

// Disponibilizar função global
window.testColorChange = testColorChange;
console.log('\n💡 Função disponível: testColorChange("0 100% 50%", "VERMELHO")');