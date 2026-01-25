// Test script to demonstrate color updating
import { updateColors } from './scripts/update-colors.js';

// Sample palette with blue primary color
const testPalette = {
  light: {
    primary: {
      hsl: '220 100% 50%',
      hex: '#0080ff',
      name: 'Primary',
      description: 'Cor primária azul para teste',
      category: 'core'
    },
    'primary-hover': {
      hsl: '220 100% 45%',
      hex: '#0073e6',
      name: 'Primary Hover',
      description: 'Estado hover azul',
      category: 'core'
    },
    'primary-glow': {
      hsl: '220 100% 80%',
      hex: '#99ccff',
      name: 'Primary Glow',
      description: 'Efeito glow azul',
      category: 'core'
    },
    background: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Background',
      description: 'Fundo principal',
      category: 'layout'
    },
    foreground: {
      hsl: '225 71% 12%',
      hex: '#0a0f1c',
      name: 'Foreground',
      description: 'Texto principal',
      category: 'layout'
    },
    card: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Card',
      description: 'Cards',
      category: 'layout'
    },
    'card-foreground': {
      hsl: '225 71% 12%',
      hex: '#0a0f1c',
      name: 'Card Foreground',
      description: 'Texto dos cards',
      category: 'layout'
    },
    border: {
      hsl: '214 32% 91%',
      hex: '#e1e8ed',
      name: 'Border',
      description: 'Bordas',
      category: 'layout'
    },
    muted: {
      hsl: '210 20% 96%',
      hex: '#f4f6f8',
      name: 'Muted',
      description: 'Neutro',
      category: 'layout'
    },
    success: {
      hsl: '142 76% 36%',
      hex: '#22c55e',
      name: 'Success',
      description: 'Sucesso',
      category: 'status'
    },
    warning: {
      hsl: '38 92% 50%',
      hex: '#f97316',
      name: 'Warning',
      description: 'Aviso',
      category: 'status'
    },
    danger: {
      hsl: '0 84% 60%',
      hex: '#ef4444',
      name: 'Danger',
      description: 'Perigo',
      category: 'status'
    },
    'risk-critical': {
      hsl: '0 84% 60%',
      hex: '#ef4444',
      name: 'Risk Critical',
      description: 'Risco crítico',
      category: 'risk'
    },
    'risk-high': {
      hsl: '24 95% 53%',
      hex: '#f97316',
      name: 'Risk High',
      description: 'Risco alto',
      category: 'risk'
    },
    'risk-medium': {
      hsl: '38 92% 50%',
      hex: '#eab308',
      name: 'Risk Medium',
      description: 'Risco médio',
      category: 'risk'
    },
    'risk-low': {
      hsl: '142 76% 36%',
      hex: '#22c55e',
      name: 'Risk Low',
      description: 'Risco baixo',
      category: 'risk'
    },
    'sidebar-background': {
      hsl: '0 0% 98%',
      hex: '#fafafa',
      name: 'Sidebar Background',
      description: 'Fundo da sidebar',
      category: 'sidebar'
    },
    'sidebar-foreground': {
      hsl: '240 5.3% 26.1%',
      hex: '#3f3f46',
      name: 'Sidebar Foreground',
      description: 'Texto da sidebar',
      category: 'sidebar'
    }
  },
  dark: {
    primary: {
      hsl: '220 100% 50%',
      hex: '#0080ff',
      name: 'Primary',
      description: 'Cor primária azul para teste',
      category: 'core'
    },
    'primary-hover': {
      hsl: '220 100% 45%',
      hex: '#0073e6',
      name: 'Primary Hover',
      description: 'Estado hover azul',
      category: 'core'
    },
    'primary-glow': {
      hsl: '220 100% 80%',
      hex: '#99ccff',
      name: 'Primary Glow',
      description: 'Efeito glow azul',
      category: 'core'
    },
    background: {
      hsl: '222 18% 4%',
      hex: '#0a0a0b',
      name: 'Background',
      description: 'Fundo dark',
      category: 'layout'
    },
    foreground: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Foreground',
      description: 'Texto dark',
      category: 'layout'
    },
    card: {
      hsl: '215 8% 12%',
      hex: '#1a1d23',
      name: 'Card',
      description: 'Cards dark',
      category: 'layout'
    },
    'card-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Card Foreground',
      description: 'Texto cards dark',
      category: 'layout'
    },
    border: {
      hsl: '215 10% 22%',
      hex: '#2d3748',
      name: 'Border',
      description: 'Bordas dark',
      category: 'layout'
    },
    muted: {
      hsl: '215 12% 16%',
      hex: '#1f2937',
      name: 'Muted',
      description: 'Neutro dark',
      category: 'layout'
    },
    success: {
      hsl: '142 76% 46%',
      hex: '#34d399',
      name: 'Success',
      description: 'Sucesso dark',
      category: 'status'
    },
    warning: {
      hsl: '38 92% 60%',
      hex: '#fbbf24',
      name: 'Warning',
      description: 'Aviso dark',
      category: 'status'
    },
    danger: {
      hsl: '0 84% 70%',
      hex: '#f87171',
      name: 'Danger',
      description: 'Perigo dark',
      category: 'status'
    },
    'risk-critical': {
      hsl: '0 84% 70%',
      hex: '#f87171',
      name: 'Risk Critical',
      description: 'Risco crítico dark',
      category: 'risk'
    },
    'risk-high': {
      hsl: '24 95% 63%',
      hex: '#fb923c',
      name: 'Risk High',
      description: 'Risco alto dark',
      category: 'risk'
    },
    'risk-medium': {
      hsl: '38 92% 60%',
      hex: '#fbbf24',
      name: 'Risk Medium',
      description: 'Risco médio dark',
      category: 'risk'
    },
    'risk-low': {
      hsl: '142 76% 46%',
      hex: '#34d399',
      name: 'Risk Low',
      description: 'Risco baixo dark',
      category: 'risk'
    },
    'sidebar-background': {
      hsl: '215 8% 12%',
      hex: '#1a1d23',
      name: 'Sidebar Background',
      description: 'Fundo sidebar dark',
      category: 'sidebar'
    },
    'sidebar-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Sidebar Foreground',
      description: 'Texto sidebar dark',
      category: 'sidebar'
    }
  }
};

console.log('🧪 Testando atualização de cores...');
console.log('🎨 Aplicando paleta de teste (azul)...');

const success = updateColors(testPalette);

if (success) {
  console.log('✅ Teste concluído com sucesso!');
  console.log('💡 Verifique o arquivo src/styles/static-colors.css');
  console.log('🔄 Reinicie o servidor para ver as mudanças (npm run dev)');
} else {
  console.log('❌ Teste falhou!');
}