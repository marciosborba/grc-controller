// Direct file color applicator - applies colors directly to CSS files
import type { ColorPalette } from '@/types/colors';

// Generate the complete CSS content for static-colors.css
export const generateStaticColorsCSS = (palette: ColorPalette): string => {
  const lightColors = Object.entries(palette.light)
    .map(([key, value]) => `    --${key}: ${value.hsl} !important;`)
    .join('\n');
    
  const darkColors = Object.entries(palette.dark)
    .map(([key, value]) => `    --${key}: ${value.hsl} !important;`)
    .join('\n');

  return `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo gerado automaticamente pelo Static Color Controller */
/* Última atualização: ${new Date().toLocaleString('pt-BR')} */

/* Remove @layer para máxima prioridade */
  /* ========================================================================== */
  /* LIGHT MODE - CORES PRINCIPAIS */
  /* ========================================================================== */
  :root {
${lightColors}
    /* Additional system variables */
    --input: var(--border);
    --ring: var(--primary);
    --accent: var(--secondary);
    --destructive: var(--danger);
    --destructive-foreground: var(--danger-foreground);
    --success-light: var(--success);
    --warning-light: var(--warning);
    --danger-light: var(--danger);
    --sidebar-primary: var(--sidebar-foreground);
    --sidebar-primary-foreground: var(--sidebar-background);
    --sidebar-accent: var(--muted);
    --sidebar-accent-foreground: var(--sidebar-foreground);
    --sidebar-border: var(--border);
    --sidebar-ring: var(--primary);
  }

  /* ========================================================================== */
  /* DARK MODE - CORES PRINCIPAIS */  
  /* ========================================================================== */
  .dark {
${darkColors}
    /* Additional system variables */
    --input: var(--border);
    --ring: var(--primary);
    --accent: var(--secondary);
    --destructive: var(--danger);
    --destructive-foreground: var(--danger-foreground);
    --success-light: var(--success);
    --warning-light: var(--warning);
    --danger-light: var(--danger);
    --sidebar-primary: var(--sidebar-foreground);
    --sidebar-primary-foreground: var(--sidebar-background);
    --sidebar-accent: var(--muted);
    --sidebar-accent-foreground: var(--sidebar-foreground);
    --sidebar-border: var(--border);
    --sidebar-ring: var(--primary);
  }

  /* ========================================================================== */
  /* APLICAÇÃO DAS CORES NOS COMPONENTES */
  /* ========================================================================== */
  
  /* Base styles - aplicados globalmente */
  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* ========================================================================== */
  /* TAILWIND UTILITY CLASSES */
  /* ========================================================================== */
  
  /* Background utilities */
  .bg-background { background-color: hsl(var(--background)) !important; }
  .bg-foreground { background-color: hsl(var(--foreground)) !important; }
  .bg-card { background-color: hsl(var(--card)) !important; }
  .bg-card-foreground { background-color: hsl(var(--card-foreground)) !important; }
  .bg-popover { background-color: hsl(var(--popover)) !important; }
  .bg-popover-foreground { background-color: hsl(var(--popover-foreground)) !important; }
  .bg-primary { background-color: hsl(var(--primary)) !important; }
  .bg-primary-foreground { background-color: hsl(var(--primary-foreground)) !important; }
  .bg-secondary { background-color: hsl(var(--secondary)) !important; }
  .bg-secondary-foreground { background-color: hsl(var(--secondary-foreground)) !important; }
  .bg-muted { background-color: hsl(var(--muted)) !important; }
  .bg-muted-foreground { background-color: hsl(var(--muted-foreground)) !important; }
  .bg-accent { background-color: hsl(var(--accent)) !important; }
  .bg-accent-foreground { background-color: hsl(var(--accent-foreground)) !important; }
  .bg-destructive { background-color: hsl(var(--destructive)) !important; }
  .bg-destructive-foreground { background-color: hsl(var(--destructive-foreground)) !important; }

  /* Text color utilities */
  .text-background { color: hsl(var(--background)) !important; }
  .text-foreground { color: hsl(var(--foreground)) !important; }
  .text-card { color: hsl(var(--card)) !important; }
  .text-card-foreground { color: hsl(var(--card-foreground)) !important; }
  .text-popover { color: hsl(var(--popover)) !important; }
  .text-popover-foreground { color: hsl(var(--popover-foreground)) !important; }
  .text-primary { color: hsl(var(--primary)) !important; }
  .text-primary-foreground { color: hsl(var(--primary-foreground)) !important; }
  .text-primary-text { color: hsl(var(--primary-text)) !important; }
  .text-secondary { color: hsl(var(--secondary)) !important; }
  .text-secondary-foreground { color: hsl(var(--secondary-foreground)) !important; }
  .text-muted { color: hsl(var(--muted)) !important; }
  .text-muted-foreground { color: hsl(var(--muted-foreground)) !important; }
  .text-accent { color: hsl(var(--accent)) !important; }
  .text-accent-foreground { color: hsl(var(--accent-foreground)) !important; }
  .text-destructive { color: hsl(var(--destructive)) !important; }
  .text-destructive-foreground { color: hsl(var(--destructive-foreground)) !important; }

  /* Border utilities */
  .border-background { border-color: hsl(var(--background)) !important; }
  .border-foreground { border-color: hsl(var(--foreground)) !important; }
  .border-card { border-color: hsl(var(--card)) !important; }
  .border-card-foreground { border-color: hsl(var(--card-foreground)) !important; }
  .border-popover { border-color: hsl(var(--popover)) !important; }
  .border-popover-foreground { border-color: hsl(var(--popover-foreground)) !important; }
  .border-primary { border-color: hsl(var(--primary)) !important; }
  .border-primary-foreground { border-color: hsl(var(--primary-foreground)) !important; }
  .border-secondary { border-color: hsl(var(--secondary)) !important; }
  .border-secondary-foreground { border-color: hsl(var(--secondary-foreground)) !important; }
  .border-muted { border-color: hsl(var(--muted)) !important; }
  .border-muted-foreground { border-color: hsl(var(--muted-foreground)) !important; }
  .border-accent { border-color: hsl(var(--accent)) !important; }
  .border-accent-foreground { border-color: hsl(var(--accent-foreground)) !important; }
  .border-destructive { border-color: hsl(var(--destructive)) !important; }
  .border-destructive-foreground { border-color: hsl(var(--destructive-foreground)) !important; }

  /* ========================================================================== */
  /* COMPONENTES ESPECÍFICOS */
  /* ========================================================================== */
  
  /* Cards */
  .card {
    background-color: hsl(var(--card));
    color: hsl(var(--card-foreground));
    border: 1px solid hsl(var(--border));
  }

  /* Botões */
  button {
    border-color: hsl(var(--border));
  }

  /* Botões primários com hover */
  button[class*="bg-primary"]:hover,
  .bg-primary:hover {
    background-color: hsl(var(--primary-hover)) !important;
  }

  /* Sidebar específico */
  [data-sidebar="main"] {
    background-color: hsl(var(--sidebar-background));
    color: hsl(var(--sidebar-foreground));
    border-right: 1px solid hsl(var(--border));
  }

  /* Estados de risco GRC */
  .risk-critical, [data-risk="critical"] {
    background-color: hsl(var(--risk-critical));
    color: hsl(var(--danger-foreground));
  }

  .risk-high, [data-risk="high"] {
    background-color: hsl(var(--risk-high));
    color: hsl(var(--warning-foreground));
  }

  .risk-medium, [data-risk="medium"] {
    background-color: hsl(var(--risk-medium));
    color: hsl(var(--warning-foreground));
  }

  .risk-low, [data-risk="low"] {
    background-color: hsl(var(--risk-low));
    color: hsl(var(--success-foreground));
  }

  /* Estados funcionais */
  .status-success, [data-status="success"] {
    background-color: hsl(var(--success));
    color: hsl(var(--success-foreground));
  }

  .status-warning, [data-status="warning"] {
    background-color: hsl(var(--warning));
    color: hsl(var(--warning-foreground));
  }

  .status-danger, [data-status="danger"] {
    background-color: hsl(var(--danger));
    color: hsl(var(--danger-foreground));
  }

  /* Formulários e inputs */
  input, textarea, select {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    border-color: hsl(var(--border));
  }

  input:focus, textarea:focus, select:focus {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }

  /* Badges e tags */
  .badge {
    background-color: hsl(var(--secondary));
    color: hsl(var(--secondary-foreground));
  }

  .badge-primary {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .badge-success {
    background-color: hsl(var(--success));
    color: hsl(var(--success-foreground));
  }

  .badge-warning {
    background-color: hsl(var(--warning));
    color: hsl(var(--warning-foreground));
  }

  .badge-danger {
    background-color: hsl(var(--danger));
    color: hsl(var(--danger-foreground));
  }

  /* Links e navigation */
  a {
    color: hsl(var(--primary));
  }

  a:hover {
    color: hsl(var(--primary-hover));
  }

  /* Tables */
  table {
    border-color: hsl(var(--border));
  }

  th {
    background-color: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
  }

  td {
    border-color: hsl(var(--border));
  }

  tr:hover {
    background-color: hsl(var(--muted));
  }

  /* Scrollbars (webkit) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: hsl(var(--muted));
  }

  ::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground));
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--primary));
  }`;
};

// Apply colors directly to the static-colors.css file (if possible)
export const applyColorsToFile = async (palette: ColorPalette): Promise<{ success: boolean; method: string; message: string }> => {
  try {
    const cssContent = generateStaticColorsCSS(palette);
    
    // Try to write to file via File System Access API (modern browsers)
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: 'static-colors.css',
          types: [{
            description: 'CSS files',
            accept: { 'text/css': ['.css'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(cssContent);
        await writable.close();
        
        return {
          success: true,
          method: 'file-system-api',
          message: 'Arquivo CSS salvo com sucesso! Substitua o arquivo src/styles/static-colors.css pelo arquivo baixado.'
        };
      } catch (error) {
        // User cancelled or error occurred
        console.log('File System API cancelled or failed:', error);
      }
    }
    
    // Fallback: Download the file
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'static-colors.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      method: 'download',
      message: 'Arquivo CSS baixado! Substitua o arquivo src/styles/static-colors.css pelo arquivo baixado.'
    };
    
  } catch (error) {
    return {
      success: false,
      method: 'error',
      message: `Erro ao gerar arquivo CSS: ${error}`
    };
  }
};

// Quick color change function for common colors
export const quickChangeColor = (colorName: 'primary' | 'background' | 'card', newHex: string, mode: 'light' | 'dark' = 'light'): void => {
  // Convert hex to HSL
  const hexToHsl = (hex: string): string => {
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
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
  };

  const hslValue = hexToHsl(newHex);
  
  // Apply immediately to CSS variables
  const isDarkMode = document.documentElement.classList.contains('dark');
  if ((mode === 'light' && !isDarkMode) || (mode === 'dark' && isDarkMode)) {
    document.documentElement.style.setProperty(`--${colorName}`, hslValue, 'important');
    console.log(`🎨 Quick change: --${colorName} = ${hslValue} (${newHex})`);
  }
};

// Preset color schemes
export const colorPresets = {
  blue: {
    name: 'Azul Profissional',
    primary: '#0066ff',
    description: 'Azul clássico para aplicações corporativas'
  },
  green: {
    name: 'Verde Natureza',
    primary: '#22c55e',
    description: 'Verde vibrante para aplicações sustentáveis'
  },
  purple: {
    name: 'Roxo Criativo',
    primary: '#8b5cf6',
    description: 'Roxo moderno para aplicações criativas'
  },
  red: {
    name: 'Vermelho Energia',
    primary: '#ef4444',
    description: 'Vermelho vibrante para aplicações dinâmicas'
  },
  orange: {
    name: 'Laranja Caloroso',
    primary: '#f97316',
    description: 'Laranja energético para aplicações amigáveis'
  },
  teal: {
    name: 'Teal Original',
    primary: '#14b8a6',
    description: 'Cor original do sistema GRC'
  }
};

// Apply a preset color scheme
export const applyColorPreset = (presetName: keyof typeof colorPresets): void => {
  const preset = colorPresets[presetName];
  if (preset) {
    quickChangeColor('primary', preset.primary, 'light');
    quickChangeColor('primary', preset.primary, 'dark');
    console.log(`🎨 Preset aplicado: ${preset.name} (${preset.primary})`);
  }
};