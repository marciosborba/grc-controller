// Script para debug das cores CSS
console.log('=== DEBUGGING CORES CSS ===');

const root = document.documentElement;
const computedStyles = getComputedStyle(root);

const cssColors = {
  primary: computedStyles.getPropertyValue('--primary').trim(),
  'primary-foreground': computedStyles.getPropertyValue('--primary-foreground').trim(),
  secondary: computedStyles.getPropertyValue('--secondary').trim(),
  'secondary-foreground': computedStyles.getPropertyValue('--secondary-foreground').trim(),
  accent: computedStyles.getPropertyValue('--accent').trim(),
  'accent-foreground': computedStyles.getPropertyValue('--accent-foreground').trim(),
  background: computedStyles.getPropertyValue('--background').trim(),
  foreground: computedStyles.getPropertyValue('--foreground').trim(),
  border: computedStyles.getPropertyValue('--border').trim(),
  success: computedStyles.getPropertyValue('--success').trim(),
  warning: computedStyles.getPropertyValue('--warning').trim(),
  danger: computedStyles.getPropertyValue('--danger').trim(),
  'sidebar-background': computedStyles.getPropertyValue('--sidebar-background').trim(),
  'sidebar-foreground': computedStyles.getPropertyValue('--sidebar-foreground').trim(),
  'sidebar-primary': computedStyles.getPropertyValue('--sidebar-primary').trim(),
};

console.log('Cores CSS atualmente aplicadas:');
console.table(cssColors);

// Verificar se as cores estão definidas inline no :root
const inlineStyles = root.style;
console.log('\nCores inline no :root:');
const inlineColors = {};
for (let i = 0; i < inlineStyles.length; i++) {
  const prop = inlineStyles[i];
  if (prop.startsWith('--')) {
    inlineColors[prop] = inlineStyles.getPropertyValue(prop);
  }
}
console.table(inlineColors);