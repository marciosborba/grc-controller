// Teste completo do fluxo de persistência de cores
console.log('🧪 === TESTE COMPLETO DE PERSISTÊNCIA ===');

// Simular o processo completo
function testColorPersistence() {
  console.log('\n🎯 SIMULANDO PROCESSO COMPLETO:');
  console.log('1. Usuário seleciona nova cor');
  console.log('2. Clica "Aplicar Cores"');
  console.log('3. Vê preview dinâmico');
  console.log('4. Modal abre com CSS');
  console.log('5. Copia CSS e cola no arquivo');
  console.log('6. Recarrega página');
  console.log('7. Cor deve persistir');
  
  // Verificar estado atual
  console.log('\n📊 ESTADO ATUAL:');
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor primária atual:', currentPrimary);
  
  // Simular aplicação de nova cor (azul)
  console.log('\n🎨 SIMULANDO APLICAÇÃO DE COR AZUL...');
  const newColor = '240 100% 50%'; // Azul
  
  // Aplicar dinamicamente (simular preview)
  document.documentElement.style.setProperty('--primary', newColor, 'important');
  
  setTimeout(() => {
    const appliedColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log('Cor após aplicação dinâmica:', appliedColor);
    
    if (appliedColor.includes('240 100% 50%') || appliedColor.includes('240')) {
      console.log('✅ PREVIEW DINÂMICO FUNCIONOU');
      
      // Simular geração de CSS
      console.log('\n📝 SIMULANDO GERAÇÃO DE CSS...');
      
      const generatedCSS = generateTestCSS(newColor);
      console.log('CSS gerado (primeiras linhas):');
      console.log(generatedCSS.substring(0, 300) + '...');
      
      // Verificar se CSS contém a cor correta
      if (generatedCSS.includes('240 100% 50%')) {
        console.log('✅ CSS GERADO CONTÉM A COR CORRETA');
        
        // Simular cópia para arquivo
        console.log('\n📄 SIMULANDO ATUALIZAÇÃO DO ARQUIVO...');
        console.log('⚠️ ATENÇÃO: Este é apenas um teste - arquivo não será alterado');
        console.log('');
        console.log('🎯 RESULTADO ESPERADO APÓS COLAR NO ARQUIVO:');
        console.log('- Arquivo static-colors.css terá --primary: 240 100% 50%');
        console.log('- Após reload, cor deve ser azul');
        console.log('- Cor deve persistir em ambos os modos (light/dark)');
        
      } else {
        console.log('❌ CSS GERADO NÃO CONTÉM A COR CORRETA');
        console.log('🔧 Problema na geração de CSS');
      }
      
    } else {
      console.log('❌ PREVIEW DINÂMICO FALHOU');
      console.log('🔧 Problema na aplicação dinâmica');
    }
    
    // Restaurar cor original
    setTimeout(() => {
      document.documentElement.style.removeProperty('--primary');
      console.log('\n🔄 Cor original restaurada');
    }, 2000);
    
  }, 500);
}

// Função para gerar CSS de teste
function generateTestCSS(primaryColor) {
  const hslParts = primaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!hslParts) return '';
  
  const [, h, s, l] = hslParts;
  const hoverL = Math.max(0, parseInt(l) - 4);
  const glowL = Math.min(100, parseInt(l) + 20);
  const glowS = Math.min(100, parseInt(s) + 5);
  
  const hoverColor = `${h} ${s}% ${hoverL}%`;
  const glowColor = `${h} ${glowS}% ${glowL}%`;
  
  return `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo gerado automaticamente pelo Static Color Controller */
/* Última atualização: ${new Date().toLocaleString('pt-BR')} */

/* CORES ESTÁTICAS - SEM @layer utilities para evitar conflitos com Tailwind */
  /* ========================================================================== */
  /* LIGHT MODE - CORES PRINCIPAIS */
  /* ========================================================================== */
  :root {
    --primary: ${primaryColor};
    --primary-hover: ${hoverColor};
    --primary-glow: ${glowColor};
    --background: 0 0% 100%;
    --foreground: 225 71% 12%;
    /* ... outras cores ... */
  }

  /* ========================================================================== */
  /* DARK MODE - CORES PRINCIPAIS */  
  /* ========================================================================== */
  .dark {
    --primary: ${primaryColor};
    --primary-hover: ${hoverColor};
    --primary-glow: ${glowColor};
    --background: 222 18% 4%;
    --foreground: 0 0% 100%;
    /* ... outras cores ... */
  }
  
  /* ... resto do CSS ... */`;
}

// Função para verificar se modal está funcionando
function checkModalSystem() {
  console.log('\n🔍 VERIFICANDO SISTEMA DE MODAL:');
  
  // Verificar se há função de aplicação de cores
  if (typeof window.downloadCSS === 'function') {
    console.log('✅ Função downloadCSS disponível');
  } else {
    console.log('❌ Função downloadCSS NÃO disponível');
    console.log('🔧 Modal pode não estar gerando CSS corretamente');
  }
  
  // Verificar localStorage
  const generatedCSS = localStorage.getItem('grc-generated-css');
  if (generatedCSS) {
    console.log('✅ CSS gerado encontrado no localStorage');
    console.log('Tamanho:', generatedCSS.length, 'caracteres');
    
    // Verificar se contém --primary
    if (generatedCSS.includes('--primary:')) {
      console.log('✅ CSS contém --primary');
    } else {
      console.log('❌ CSS NÃO contém --primary');
    }
  } else {
    console.log('⚠️ Nenhum CSS gerado no localStorage');
    console.log('💡 Tente aplicar uma cor primeiro');
  }
}

// Função para verificar arquivo atual
async function checkCurrentFile() {
  console.log('\n📄 VERIFICANDO ARQUIVO ATUAL:');
  
  try {
    const response = await fetch('/src/styles/static-colors.css?v=' + Date.now());
    const content = await response.text();
    
    const primaryMatch = content.match(/--primary:\s*([^;]+);/);
    if (primaryMatch) {
      const fileColor = primaryMatch[1].trim();
      console.log('📄 Cor no arquivo:', fileColor);
      
      const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      console.log('🎨 Cor aplicada:', currentColor);
      
      if (fileColor === currentColor) {
        console.log('✅ ARQUIVO E APLICAÇÃO COINCIDEM');
      } else {
        console.log('❌ ARQUIVO E APLICAÇÃO DIFERENTES');
        console.log('🔧 Pode haver cache ou estilos dinâmicos interferindo');
      }
    }
    
    // Verificar timestamp
    const timestampMatch = content.match(/Última atualização: ([^*\n]+)/);
    if (timestampMatch) {
      console.log('📅 Última atualização:', timestampMatch[1]);
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar arquivo:', error);
  }
}

// Disponibilizar funções
window.testColorPersistence = testColorPersistence;
window.checkModalSystem = checkModalSystem;
window.checkCurrentFile = checkCurrentFile;

// Executar verificações
console.log('🔍 EXECUTANDO VERIFICAÇÕES INICIAIS...');
checkModalSystem();
checkCurrentFile();

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- testColorPersistence() - Testar fluxo completo');
console.log('- checkModalSystem() - Verificar sistema de modal');
console.log('- checkCurrentFile() - Verificar arquivo atual');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: testColorPersistence()');
console.log('2. Teste o fluxo real na interface');
console.log('3. Compare os resultados');