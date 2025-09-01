// Script para corrigir problema de persistência
console.log('🔧 === CORRIGINDO PROBLEMA DE PERSISTÊNCIA ===');

// 1. Verificar estado atual
console.log('\n📊 1. VERIFICANDO ESTADO ATUAL:');
const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
console.log('Cor primária atual:', currentPrimary);

// 2. Verificar se há CSS dinâmico ativo
console.log('\n🎨 2. VERIFICANDO CSS DINÂMICO:');
const dynamicStyles = document.querySelectorAll('#grc-dynamic-preview, #grc-user-colors, #grc-temp-colors, #dynamic-colors, #preview-colors');
console.log(`Estilos dinâmicos encontrados: ${dynamicStyles.length}`);

dynamicStyles.forEach(style => {
  console.log(`- ${style.id}: ${style.textContent.length} caracteres`);
  
  // Extrair cor primária do estilo dinâmico
  const primaryMatch = style.textContent.match(/--primary:\s*([^;!]+)/);
  if (primaryMatch) {
    console.log(`  └─ Cor primária no estilo: ${primaryMatch[1].trim()}`);
  }
});

// 3. Função para extrair cor do CSS dinâmico e aplicar no estático
function extractAndApplyToStatic() {
  console.log('\n🔄 3. EXTRAINDO COR DO CSS DINÂMICO:');
  
  // Encontrar o estilo dinâmico com a cor atual
  let extractedColor = null;
  
  dynamicStyles.forEach(style => {
    const primaryMatch = style.textContent.match(/--primary:\s*([^;!]+)/);
    if (primaryMatch) {
      extractedColor = primaryMatch[1].trim().replace('!important', '').trim();
      console.log(`✅ Cor extraída: ${extractedColor}`);
    }
  });
  
  // Se não encontrou no CSS dinâmico, usar a cor computada atual
  if (!extractedColor) {
    extractedColor = currentPrimary;
    console.log(`📋 Usando cor computada atual: ${extractedColor}`);
  }
  
  if (extractedColor) {
    // Aplicar no CSS estático via fetch e replace
    applyToStaticFile(extractedColor);
  } else {
    console.log('❌ Não foi possível extrair cor para aplicar');
  }
}

// 4. Função para aplicar cor no arquivo estático
async function applyToStaticFile(colorHsl) {
  console.log('\n📝 4. APLICANDO NO ARQUIVO ESTÁTICO:');
  console.log(`Cor a aplicar: ${colorHsl}`);
  
  try {
    // Buscar o arquivo CSS atual
    const response = await fetch('/src/styles/static-colors.css');
    const cssContent = await response.text();
    
    console.log('📄 Arquivo CSS carregado, tamanho:', cssContent.length);
    
    // Substituir as cores primárias
    let updatedCSS = cssContent;
    
    // Substituir no light mode
    updatedCSS = updatedCSS.replace(
      /--primary:\s*[^;]+;/g,
      `--primary: ${colorHsl};`
    );
    
    // Substituir hover (calcular uma versão mais escura)
    const hslParts = colorHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (hslParts) {
      const [, h, s, l] = hslParts;
      const darkerL = Math.max(0, parseInt(l) - 4); // 4% mais escuro
      const lighterL = Math.min(100, parseInt(l) + 20); // 20% mais claro
      
      const hoverColor = `${h} ${s}% ${darkerL}%`;
      const glowColor = `${h} ${Math.min(100, parseInt(s) + 5)}% ${lighterL}%`;
      
      updatedCSS = updatedCSS.replace(
        /--primary-hover:\s*[^;]+;/g,
        `--primary-hover: ${hoverColor};`
      );
      
      updatedCSS = updatedCSS.replace(
        /--primary-glow:\s*[^;]+;/g,
        `--primary-glow: ${glowColor};`
      );
      
      console.log(`🎨 Cores calculadas:`);
      console.log(`  Primary: ${colorHsl}`);
      console.log(`  Hover: ${hoverColor}`);
      console.log(`  Glow: ${glowColor}`);
    }
    
    // Mostrar o CSS atualizado para o usuário copiar
    console.log('\n📋 5. CSS ATUALIZADO PARA COPIAR:');
    console.log('Copie o código abaixo e substitua o conteúdo de src/styles/static-colors.css:');
    console.log('');
    console.log('='.repeat(80));
    console.log(updatedCSS);
    console.log('='.repeat(80));
    
    // Criar download automático
    const blob = new Blob([updatedCSS], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'static-colors-updated.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('\n💾 Arquivo baixado automaticamente!');
    console.log('📁 Substitua src/styles/static-colors.css pelo arquivo baixado');
    
    // Também salvar no localStorage para backup
    localStorage.setItem('grc-updated-css', updatedCSS);
    console.log('💾 CSS salvo no localStorage como backup');
    
  } catch (error) {
    console.error('❌ Erro ao processar arquivo CSS:', error);
    
    // Fallback: mostrar instruções manuais
    console.log('\n🔧 INSTRUÇÕES MANUAIS:');
    console.log('1. Abra o arquivo src/styles/static-colors.css');
    console.log(`2. Substitua todas as ocorrências de "--primary:" por "--primary: ${colorHsl};"`);
    console.log('3. Salve o arquivo');
    console.log('4. Recarregue a aplicação (F5)');
  }
}

// 5. Função para forçar reload do CSS
function forceReloadCSS() {
  console.log('\n🔄 6. FORÇANDO RELOAD DO CSS:');
  
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  cssLinks.forEach(link => {
    if (link.href.includes('static-colors') || link.href.includes('index.css')) {
      console.log(`🔄 Recarregando: ${link.href}`);
      
      const newLink = link.cloneNode();
      newLink.href = link.href.split('?')[0] + '?v=' + Date.now();
      link.parentNode.insertBefore(newLink, link.nextSibling);
      
      setTimeout(() => {
        link.remove();
        console.log(`✅ CSS recarregado: ${newLink.href}`);
      }, 100);
    }
  });
}

// 6. Executar correção
console.log('\n🚀 EXECUTANDO CORREÇÃO:');

if (dynamicStyles.length > 0) {
  console.log('✅ CSS dinâmico encontrado, extraindo cor...');
  extractAndApplyToStatic();
} else {
  console.log('⚠️ Nenhum CSS dinâmico encontrado');
  console.log('💡 Vá para "Cores estáticas", selecione uma cor e clique "Aplicar Cores"');
  console.log('💡 Depois execute este script novamente');
}

// 7. Disponibilizar funções globalmente
window.fixPersistence = extractAndApplyToStatic;
window.reloadCSS = forceReloadCSS;

console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
console.log('- fixPersistence() - Extrair cor dinâmica e gerar CSS estático');
console.log('- reloadCSS() - Forçar reload dos arquivos CSS');
console.log('');
console.log('📋 PROCESSO RECOMENDADO:');
console.log('1. Selecione uma cor na interface');
console.log('2. Clique "Aplicar Cores"');
console.log('3. Execute: fixPersistence()');
console.log('4. Substitua o arquivo CSS baixado');
console.log('5. Recarregue a página (F5)');