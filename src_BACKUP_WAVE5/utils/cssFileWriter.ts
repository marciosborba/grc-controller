// System for directly writing CSS colors to the static file
import type { ColorPalette } from '@/types/colors';

const STATIC_COLORS_FILE_PATH = '/home/marciosb/grc/grc-controller/src/styles/static-colors.css';

// Generate complete CSS content preserving the original structure
export const generateUpdatedStaticCSS = (palette: ColorPalette): string => {
  const lightColors = Object.entries(palette.light)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');
    
  const darkColors = Object.entries(palette.dark)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');

  return `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo atualizado automaticamente pelo Static Color Controller */
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
  .btn-primary, 
  .bg-primary {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .btn-primary:hover, 
  .bg-primary:hover {
    background-color: hsl(var(--primary-hover));
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

  /* Inputs e form controls */
  input, textarea, select {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
  }

  input:focus, textarea:focus, select:focus {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary-glow) / 0.2);
  }

  /* Muted backgrounds */
  .bg-muted {
    background-color: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
  }

  /* Secondary colors */
  .bg-secondary {
    background-color: hsl(var(--secondary));
    color: hsl(var(--secondary-foreground));
  }

  /* Popover and dropdowns */
  .popover, [data-radix-popper-content-wrapper] {
    background-color: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    border: 1px solid hsl(var(--border));
  }
}

/* ========================================================================== */
/* RESPONSIVE ADJUSTMENTS */
/* ========================================================================== */
@media (max-width: 768px) {
  /* Mobile specific color adjustments if needed */
}

/* ========================================================================== */
/* HIGH CONTRAST MODE SUPPORT */
/* ========================================================================== */
@media (prefers-contrast: high) {
  :root {
    --border: 0 0% 20%;
  }
  
  .dark {
    --border: 0 0% 80%;
  }
}`;
};

// Write CSS file using Node.js fs (for development environment)
export const writeStaticCSSFile = async (palette: ColorPalette): Promise<boolean> => {
  try {
    const cssContent = generateUpdatedStaticCSS(palette);
    
    // For development environment - use a custom API endpoint
    const response = await fetch('/api/write-css', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: 'src/styles/static-colors.css',
        content: cssContent
      })
    });

    if (!response.ok) {
      // If API doesn't exist, use the direct file system approach
      return await writeDirectlyToFile(cssContent);
    }

    return true;
  } catch (error) {
    console.error('Failed to write CSS file via API:', error);
    // Fallback to direct file writing
    return await writeDirectlyToFile(generateUpdatedStaticCSS(palette));
  }
};

// Direct file writing using File System Access API (modern browsers)
export const writeDirectlyToFile = async (cssContent: string): Promise<boolean> => {
  try {
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
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
      
      return true;
    }
    
    // Fallback: Use Node.js fs if available (development environment)
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(process.cwd(), 'src', 'styles', 'static-colors.css');
      fs.writeFileSync(filePath, cssContent, 'utf8');
      
      return true;
    }
    
    throw new Error('No file writing method available');
  } catch (error) {
    console.error('Failed to write file directly:', error);
    return false;
  }
};

// Alternative: Use Vite's hot reload to inject CSS directly
export const injectCSSDirectly = (palette: ColorPalette): boolean => {
  try {
    const cssContent = generateUpdatedStaticCSS(palette);
    
    // Remove existing injected styles
    const existingStyle = document.getElementById('grc-dynamic-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create and inject new style element
    const style = document.createElement('style');
    style.id = 'grc-dynamic-colors';
    style.textContent = cssContent;
    document.head.appendChild(style);
    
    // Store in localStorage for persistence
    localStorage.setItem('grc-applied-colors', JSON.stringify({
      palette,
      cssContent,
      timestamp: new Date().toISOString(),
      applied: true
    }));
    
    return true;
  } catch (error) {
    console.error('Failed to inject CSS directly:', error);
    return false;
  }
};

// Load and apply colors from localStorage on page load
export const loadAndApplyStoredColors = (): boolean => {
  try {
    const stored = localStorage.getItem('grc-applied-colors');
    if (!stored) return false;
    
    const { cssContent, applied } = JSON.parse(stored);
    if (!applied) return false;
    
    // Remove existing injected styles
    const existingStyle = document.getElementById('grc-dynamic-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create and inject style element
    const style = document.createElement('style');
    style.id = 'grc-dynamic-colors';
    style.textContent = cssContent;
    document.head.appendChild(style);
    
    return true;
  } catch (error) {
    console.error('Failed to load stored colors:', error);
    return false;
  }
};

// Clear applied colors
export const clearAppliedColors = () => {
  const existingStyle = document.getElementById('grc-dynamic-colors');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  localStorage.removeItem('grc-applied-colors');
};

// Check if colors are applied
export const hasAppliedColors = (): boolean => {
  try {
    const stored = localStorage.getItem('grc-applied-colors');
    if (!stored) return false;
    
    const { applied } = JSON.parse(stored);
    return applied === true;
  } catch {
    return false;
  }
};