// Script para limpar estilos inline incorretos
console.log('=== LIMPANDO ESTILOS INLINE ===');

const root = document.documentElement;

// Lista de todas as propriedades CSS que podem ter sido alteradas
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

console.log('Removendo propriedades inline...');
cssProperties.forEach(prop => {
  if (root.style.getPropertyValue(prop)) {
    console.log(`Removendo: ${prop} = ${root.style.getPropertyValue(prop)}`);
    root.style.removeProperty(prop);
  }
});

console.log('Estilos inline removidos. As cores agora devem voltar aos valores originais do CSS.');

// Verificar cores atuais após limpeza
setTimeout(() => {
  console.log('=== CORES APÓS LIMPEZA ===');
  const computedStyles = getComputedStyle(root);
  const currentColors = {
    primary: computedStyles.getPropertyValue('--primary').trim(),
    accent: computedStyles.getPropertyValue('--accent').trim(),
    success: computedStyles.getPropertyValue('--success').trim(),
    background: computedStyles.getPropertyValue('--background').trim(),
    'sidebar-background': computedStyles.getPropertyValue('--sidebar-background').trim()
  };
  console.table(currentColors);
}, 100);