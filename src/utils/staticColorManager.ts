// Utils for managing static colors in the CSS file
import { ColorValue } from '../types/colors';

export interface ColorPalette {
  light: Record<string, ColorValue>;
  dark: Record<string, ColorValue>;
}

// Generate CSS content from palette
export const generateCSSFromPalette = (palette: ColorPalette): string => {
  const lightColors = Object.entries(palette.light)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');
    
  const darkColors = Object.entries(palette.dark)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');

  return `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo gerado automaticamente pelo Static Color Controller */
/* Última atualização: ${new Date().toLocaleString('pt-BR')} */

@layer base {
  /* ========================================================================== */
  /* LIGHT MODE - CORES PRINCIPAIS */
  /* ========================================================================== */
  :root {
${lightColors}
  }

  /* ========================================================================== */
  /* DARK MODE - CORES PRINCIPAIS */  
  /* ========================================================================== */
  .dark {
${darkColors}
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

  /* Cards e containers */
  .card {
    background-color: hsl(var(--card));
    color: hsl(var(--card-foreground));
    border: 1px solid hsl(var(--border));
  }

  /* Botões primários */
  .btn-primary, [data-primary="true"] {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .btn-primary:hover, [data-primary="true"]:hover {
    background-color: hsl(var(--primary-hover));
  }

  /* Sidebar */
  [data-sidebar="true"] {
    background-color: hsl(var(--sidebar-background));
    color: hsl(var(--sidebar-foreground));
    border-right: 1px solid hsl(var(--sidebar-border));
  }

  /* Estados de risco GRC */
  [data-risk="critical"] {
    background-color: hsl(var(--risk-critical));
    color: hsl(var(--danger-foreground));
  }

  [data-risk="high"] {
    background-color: hsl(var(--risk-high));
    color: hsl(var(--warning-foreground));
  }

  [data-risk="medium"] {
    background-color: hsl(var(--risk-medium));
    color: hsl(var(--warning-foreground));
  }

  [data-risk="low"] {
    background-color: hsl(var(--risk-low));
    color: hsl(var(--success-foreground));
  }

  /* Estados funcionais */
  [data-status="success"] {
    background-color: hsl(var(--success));
    color: hsl(var(--success-foreground));
  }

  [data-status="warning"] {
    background-color: hsl(var(--warning));
    color: hsl(var(--warning-foreground));
  }

  [data-status="danger"] {
    background-color: hsl(var(--danger));
    color: hsl(var(--danger-foreground));
  }

  /* Inputs e form controls */
  input, textarea, select {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
  }

  input:focus, textarea:focus, select:focus {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary-glow));
  }
}`;
};

// Apply colors to current document (for preview)
export const applyColorsToDocument = (palette: ColorPalette, mode: 'light' | 'dark') => {
  const colors = palette[mode];
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value.hsl);
  });
};

// Reset colors in document to default
export const resetColorsInDocument = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  // Get all CSS custom properties that start with --
  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      Array.from(styleSheet.cssRules).forEach(rule => {
        if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
          const style = rule.style;
          for (let i = 0; i < style.length; i++) {
            const property = style[i];
            if (property.startsWith('--')) {
              root.style.removeProperty(property);
            }
          }
        }
      });
    } catch (e) {
      // Handle cross-origin stylesheets
      console.warn('Unable to access stylesheet:', e);
    }
  });
};

// Client-side function to trigger file download (since we can't write directly to files in browser)
export const downloadStaticColorsFile = (palette: ColorPalette) => {
  const cssContent = generateCSSFromPalette(palette);
  const blob = new Blob([cssContent], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'static-colors.css';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Backup current palette to localStorage
export const backupPalette = (palette: ColorPalette) => {
  const backup = {
    palette,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  localStorage.setItem('grc-color-backup', JSON.stringify(backup));
};

// Restore palette from localStorage
export const restorePalette = (): ColorPalette | null => {
  try {
    const backup = localStorage.getItem('grc-color-backup');
    if (backup) {
      const parsed = JSON.parse(backup);
      return parsed.palette;
    }
  } catch (error) {
    console.error('Error restoring palette:', error);
  }
  return null;
};