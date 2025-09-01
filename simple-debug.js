// Debug simples - copie e cole no console
console.log('🔍 === DEBUG SIMPLES DE PERSISTÊNCIA ===');

// 1. Verificar cor atual
const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
console.log('🎨 Cor primária atual:', currentPrimary);

// 2. Verificar estilos dinâmicos
const dynamicStyles = document.querySelectorAll('style[id]');
console.log(`\n🎨 Estilos dinâmicos encontrados: ${dynamicStyles.length}`);
dynamicStyles.forEach((style, i) => {
  if (style.textContent.includes('--primary')) {
    console.log(`${i+1}. ${style.id}: CONTÉM --primary`);
    const match = style.textContent.match(/--primary:\s*([^;!]+)/);
    if (match) console.log(`   └─ Valor: ${match[1].trim()}`);
  }
});

// 3. Verificar variáveis inline
const inlinePrimary = document.documentElement.style.getPropertyValue('--primary');
if (inlinePrimary) {
  console.log(`\n⚠️ PROBLEMA: Variável --primary inline: ${inlinePrimary}`);
} else {
  console.log('\n✅ Nenhuma variável --primary inline');
}

// 4. Verificar arquivo CSS
fetch('/src/styles/static-colors.css')
  .then(r => r.text())
  .then(content => {
    const match = content.match(/--primary:\s*([^;]+);/);
    if (match) {
      const fileValue = match[1].trim();
      console.log(`\n📄 Valor no arquivo static-colors.css: ${fileValue}`);
      
      if (fileValue === currentPrimary) {
        console.log('✅ Arquivo e valor atual COINCIDEM');
      } else {
        console.log('❌ CONFLITO detectado!');
        console.log(`   Arquivo: ${fileValue}`);
        console.log(`   Atual: ${currentPrimary}`);
        console.log('\n🔧 CAUSA: Estilos dinâmicos ou inline sobrescrevendo o arquivo');
      }
    }
  });

console.log('\n💡 Para limpar interferências, execute:');
console.log('cleanInterferences()');

// Função de limpeza
window.cleanInterferences = function() {
  console.log('🧹 Limpando interferências...');
  
  // Remover estilos dinâmicos
  document.querySelectorAll('style[id]').forEach(style => {
    if (style.textContent.includes('--primary') || 
        style.id.includes('grc') || 
        style.id.includes('dynamic') ||
        style.id.includes('preview')) {
      console.log(`🗑️ Removendo: ${style.id}`);
      style.remove();
    }
  });
  
  // Remover variáveis inline
  ['primary', 'primary-hover', 'primary-glow'].forEach(varName => {
    if (document.documentElement.style.getPropertyValue(`--${varName}`)) {
      console.log(`🗑️ Removendo --${varName} inline`);
      document.documentElement.style.removeProperty(`--${varName}`);
    }
  });
  
  // Forçar reload CSS
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (link.href.includes('static-colors')) {
      const newLink = link.cloneNode();
      newLink.href = link.href.split('?')[0] + '?v=' + Date.now();
      link.parentNode.insertBefore(newLink, link.nextSibling);
      setTimeout(() => link.remove(), 100);
    }
  });
  
  setTimeout(() => {
    const newPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log(`✅ Cor após limpeza: ${newPrimary}`);
  }, 1000);
};