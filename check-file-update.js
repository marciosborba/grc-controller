// Verificar se arquivo está sendo realmente atualizado
console.log('🔍 === VERIFICANDO ATUALIZAÇÃO DO ARQUIVO ===');

async function checkFileUpdate() {
  try {
    // 1. Verificar conteúdo atual do arquivo
    const response = await fetch('/src/styles/static-colors.css?v=' + Date.now());
    const content = await response.text();
    
    console.log('📄 ARQUIVO ATUAL:');
    console.log('Tamanho:', content.length, 'caracteres');
    
    // Procurar --primary
    const primaryMatch = content.match(/--primary:\s*([^;]+);/g);
    if (primaryMatch) {
      console.log('🎨 Todas as ocorrências de --primary encontradas:');
      primaryMatch.forEach((match, i) => {
        console.log(`${i + 1}. ${match}`);
      });
      
      // Pegar a primeira ocorrência (light mode)
      const firstPrimary = primaryMatch[0].match(/--primary:\s*([^;]+);/);
      if (firstPrimary) {
        const primaryValue = firstPrimary[1].trim();
        console.log(`\n📄 Cor primária no arquivo: ${primaryValue}`);
        
        // Verificar se é verde ou outra cor
        if (primaryValue.includes('173 88% 58%')) {
          console.log('✅ Arquivo tem COR VERDE (173 88% 58%)');
        } else if (primaryValue.includes('258 90% 66%')) {
          console.log('✅ Arquivo tem COR ROXA (258 90% 66%)');
        } else {
          console.log(`🎨 Arquivo tem COR PERSONALIZADA: ${primaryValue}`);
        }
      }
    } else {
      console.log('❌ --primary NÃO ENCONTRADO no arquivo!');
    }
    
    // Verificar timestamp
    const timestampMatch = content.match(/Última atualização: ([^*\n]+)/);
    if (timestampMatch) {
      console.log(`📅 Última atualização: ${timestampMatch[1]}`);
    }
    
    // 2. Verificar cor aplicada atualmente
    const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log(`\n🎨 Cor aplicada atualmente: ${currentPrimary}`);
    
    // 3. Comparar arquivo vs aplicado
    const filePrimary = primaryMatch ? primaryMatch[0].match(/--primary:\s*([^;]+);/)[1].trim() : 'não encontrado';
    
    if (filePrimary === currentPrimary) {
      console.log('✅ ARQUIVO E APLICAÇÃO COINCIDEM');
      console.log('🎯 Sistema funcionando corretamente');
    } else {
      console.log('❌ CONFLITO DETECTADO!');
      console.log(`   📄 Arquivo: ${filePrimary}`);
      console.log(`   🎨 Aplicado: ${currentPrimary}`);
      console.log('');
      console.log('🔧 POSSÍVEIS CAUSAS:');
      console.log('1. Arquivo não foi salvo corretamente');
      console.log('2. Cache do navegador/Vite');
      console.log('3. Estilos dinâmicos ainda ativos');
      console.log('4. Ordem de carregamento CSS');
    }
    
    // 4. Verificar se há estilos dinâmicos
    console.log('\n🎨 VERIFICANDO ESTILOS DINÂMICOS:');
    const dynamicStyles = document.querySelectorAll('style[id]');
    let foundDynamic = false;
    
    dynamicStyles.forEach((style, i) => {
      if (style.textContent.includes('--primary')) {
        foundDynamic = true;
        console.log(`${i + 1}. ${style.id}: CONTÉM --primary`);
        const match = style.textContent.match(/--primary:\s*([^;!]+)/);
        if (match) {
          console.log(`   └─ Valor: ${match[1].trim()}`);
        }
      }
    });
    
    if (!foundDynamic) {
      console.log('✅ Nenhum estilo dinâmico com --primary');
    }
    
    // 5. Verificar ordem de carregamento
    console.log('\n📄 ORDEM DE CARREGAMENTO CSS:');
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    cssLinks.forEach((link, i) => {
      const fileName = link.href.split('/').pop().split('?')[0];
      console.log(`${i + 1}. ${fileName}`);
      if (fileName.includes('static-colors')) {
        console.log('   ⭐ static-colors.css');
      }
      if (fileName.includes('index.css')) {
        console.log('   ⭐ index.css');
      }
    });
    
    // 6. Mostrar primeiras linhas do arquivo para debug
    console.log('\n📄 PRIMEIRAS LINHAS DO ARQUIVO:');
    const lines = content.split('\n').slice(0, 15);
    lines.forEach((line, i) => {
      if (line.includes('--primary')) {
        console.log(`${i + 1}. ⭐ ${line.trim()}`);
      } else if (line.trim()) {
        console.log(`${i + 1}. ${line.trim()}`);
      }
    });
    
  } catch (error) {
    console.log('❌ ERRO ao verificar arquivo:', error);
  }
}

// Função para forçar reload do CSS
function forceReloadCSS() {
  console.log('\n🔄 FORÇANDO RELOAD DO CSS...');
  
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  cssLinks.forEach(link => {
    if (link.href.includes('static-colors')) {
      console.log('🔄 Recarregando static-colors.css...');
      const newLink = link.cloneNode();
      newLink.href = link.href.split('?')[0] + '?v=' + Date.now();
      link.parentNode.insertBefore(newLink, link.nextSibling);
      
      setTimeout(() => {
        link.remove();
        console.log('✅ static-colors.css recarregado');
        
        // Verificar cor após reload
        setTimeout(() => {
          const newPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
          console.log(`🎨 Cor após reload: ${newPrimary}`);
        }, 500);
      }, 200);
    }
  });
}

// Disponibilizar funções
window.checkFileUpdate = checkFileUpdate;
window.forceReloadCSS = forceReloadCSS;

// Executar verificação automaticamente
checkFileUpdate();

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- checkFileUpdate() - Verificar estado do arquivo');
console.log('- forceReloadCSS() - Forçar reload do CSS');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Analise o resultado acima');
console.log('2. Se há conflito, verifique se arquivo foi salvo');
console.log('3. Execute forceReloadCSS() se necessário');
console.log('4. Faça hard refresh (Ctrl+Shift+R) se persistir');