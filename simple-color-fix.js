// Solução simples e direta para o problema de cores
console.log('🎨 === SOLUÇÃO SIMPLES PARA CORES ===');

// Função para aplicar cor diretamente
function applyColorDirectly(colorHex) {
  console.log(`🎨 Aplicando cor: ${colorHex}`);
  
  // Converter HEX para HSL
  function hexToHsl(hex) {
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }
  
  const hslColor = hexToHsl(colorHex);
  console.log(`HSL: ${hslColor}`);
  
  // Remover estilos dinâmicos antigos
  const oldStyles = document.querySelectorAll('#simple-color-fix, #grc-dynamic-preview, #grc-user-colors');
  oldStyles.forEach(style => style.remove());
  
  // Criar novo estilo com máxima prioridade
  const style = document.createElement('style');
  style.id = 'simple-color-fix';
  style.textContent = `
    /* APLICAÇÃO SIMPLES E DIRETA */
    html, html.dark, :root, .dark {
      --primary: ${hslColor} !important;
    }
    
    /* FORÇA APLICAÇÃO EM ELEMENTOS */
    .bg-primary, [class*="bg-primary"] {
      background-color: ${colorHex} !important;
    }
    
    .text-primary, [class*="text-primary"] {
      color: ${colorHex} !important;
    }
    
    .border-primary, [class*="border-primary"] {
      border-color: ${colorHex} !important;
    }
  `;
  
  document.head.insertBefore(style, document.head.firstChild);
  
  // Aplicar também diretamente
  document.documentElement.style.setProperty('--primary', hslColor, 'important');
  
  console.log('✅ Cor aplicada!');
  
  // Verificar se funcionou
  setTimeout(() => {
    const applied = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    console.log('Verificação:', applied);
    
    if (applied.includes(hslColor.split(' ')[0])) {
      console.log('✅ SUCESSO! Cor aplicada corretamente');
    } else {
      console.log('❌ FALHOU! Cor não foi aplicada');
    }
  }, 500);
}

// Cores de teste rápido
const testColors = {
  vermelho: '#ff0000',
  verde: '#00ff00',
  azul: '#0000ff',
  roxo: '#8b5cf6',
  laranja: '#ff8800',
  rosa: '#ff69b4'
};

console.log('🎨 CORES DE TESTE DISPONÍVEIS:');
Object.entries(testColors).forEach(([nome, hex]) => {
  console.log(`${nome}: ${hex}`);
});

console.log('\n💡 COMO USAR:');
console.log('1. applyColorDirectly("#ff0000") - Aplicar vermelho');
console.log('2. applyColorDirectly("#8b5cf6") - Aplicar roxo');
console.log('3. testRed() - Teste rápido vermelho');
console.log('4. testPurple() - Teste rápido roxo');

// Funções de teste rápido
window.applyColorDirectly = applyColorDirectly;

window.testRed = () => applyColorDirectly('#ff0000');
window.testGreen = () => applyColorDirectly('#00ff00');
window.testBlue = () => applyColorDirectly('#0000ff');
window.testPurple = () => applyColorDirectly('#8b5cf6');
window.testOrange = () => applyColorDirectly('#ff8800');

// Teste automático
console.log('\n🧪 EXECUTANDO TESTE AUTOMÁTICO...');
console.log('Aplicando vermelho em 2 segundos...');

setTimeout(() => {
  applyColorDirectly('#ff0000');
  
  console.log('\nAplicando roxo em 4 segundos...');
  setTimeout(() => {
    applyColorDirectly('#8b5cf6');
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('Se as cores mudaram, o sistema está funcionando!');
    console.log('Se não mudaram, há um problema mais profundo.');
    
  }, 2000);
}, 2000);

console.log('\n📋 INSTRUÇÕES:');
console.log('1. Observe se as cores mudam automaticamente');
console.log('2. Se mudaram: sistema funciona, problema é na interface');
console.log('3. Se não mudaram: problema de CSS/cache');
console.log('4. Use as funções testRed(), testPurple(), etc. para testar');