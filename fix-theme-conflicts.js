// Script para resolver conflitos de temas e restaurar funcionamento do dark mode
console.log('=== RESOLVENDO CONFLITOS DE TEMAS ===');

// 1. Limpar todos os estilos inline que podem interferir
const root = document.documentElement;
const cssProperties = [
  '--primary', '--primary-foreground', '--primary-hover', '--primary-glow',
  '--secondary', '--secondary-foreground',
  '--accent', '--accent-foreground',
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--border', '--input', '--ring',
  '--muted', '--muted-foreground',
  '--popover', '--popover-foreground',
  '--success', '--success-foreground', '--success-light',
  '--warning', '--warning-foreground', '--warning-light',
  '--danger', '--danger-foreground', '--danger-light',
  '--destructive', '--destructive-foreground',
  '--sidebar-background', '--sidebar-foreground',
  '--sidebar-primary', '--sidebar-primary-foreground',
  '--sidebar-accent', '--sidebar-accent-foreground',
  '--sidebar-border', '--sidebar-ring',
  '--radius'
];

console.log('Limpando estilos inline...');
let removedCount = 0;
cssProperties.forEach(prop => {
  if (root.style.getPropertyValue(prop)) {
    console.log(`Removendo: ${prop} = ${root.style.getPropertyValue(prop)}`);
    root.style.removeProperty(prop);
    removedCount++;
  }
});

console.log(`${removedCount} propriedades inline removidas.`);

// 2. Verificar se a classe dark está sendo aplicada corretamente
console.log('\n=== VERIFICANDO DARK MODE ===');
console.log('Classe dark no documento:', document.documentElement.classList.contains('dark'));
console.log('Todas as classes:', document.documentElement.className);

// 3. Verificar cores atuais após limpeza
setTimeout(() => {
  console.log('\n=== CORES APÓS LIMPEZA ===');
  const computedStyles = getComputedStyle(root);
  const currentColors = {
    'primary (light)': computedStyles.getPropertyValue('--primary').trim(),
    'background (light)': computedStyles.getPropertyValue('--background').trim(),
    'accent (light)': computedStyles.getPropertyValue('--accent').trim(),
    'sidebar-background': computedStyles.getPropertyValue('--sidebar-background').trim()
  };
  console.table(currentColors);
  
  // 4. Testar toggle dark mode
  console.log('\n=== TESTANDO DARK MODE ===');
  const isDark = document.documentElement.classList.contains('dark');
  
  if (!isDark) {
    console.log('Ativando dark mode...');
    document.documentElement.classList.add('dark');
  } else {
    console.log('Desativando dark mode...');
    document.documentElement.classList.remove('dark');
  }
  
  setTimeout(() => {
    const newColors = {
      'primary (atual)': getComputedStyle(root).getPropertyValue('--primary').trim(),
      'background (atual)': getComputedStyle(root).getPropertyValue('--background').trim(),
      'accent (atual)': getComputedStyle(root).getPropertyValue('--accent').trim()
    };
    console.table(newColors);
    
    // Restaurar estado original
    if (!isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    
    console.log('Dark mode está funcionando:', 
      newColors['primary (atual)'] !== currentColors['primary (light)']
    );
  }, 500);
}, 100);

console.log('\n=== LIMPEZA CONCLUÍDA ===');
console.log('Se o dark mode ainda não funcionar, verifique o ThemeToggle na interface.');