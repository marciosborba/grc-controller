// COPIE E COLE ESTE CÓDIGO DIRETAMENTE NO CONSOLE DO NAVEGADOR

console.log('🎨 TESTE DIRETO DE CORES');

// Remover estilos antigos
document.querySelectorAll('#test-color-direct').forEach(el => el.remove());

// Criar estilo de teste
const style = document.createElement('style');
style.id = 'test-color-direct';
style.textContent = `
  html, :root, .dark {
    --primary: 0 100% 50% !important;
  }
  .bg-primary, [class*="bg-primary"] {
    background-color: red !important;
  }
  .text-primary, [class*="text-primary"] {
    color: red !important;
  }
`;

document.head.appendChild(style);
document.documentElement.style.setProperty('--primary', '0 100% 50%', 'important');

console.log('✅ Vermelho aplicado! Se não mudou, há problema de cache/CSS');

// Função para testar outras cores
window.testColor = (color, name) => {
  console.log(`🎨 Testando ${name}...`);
  document.documentElement.style.setProperty('--primary', color, 'important');
  
  const elements = document.querySelectorAll('.bg-primary, .text-primary');
  elements.forEach(el => {
    el.style.setProperty('background-color', color, 'important');
    el.style.setProperty('color', color, 'important');
  });
};

console.log('💡 Use: testColor("blue", "azul") para testar outras cores');