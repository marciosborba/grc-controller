// File manager for updating static colors directly in the CSS file
import type { ColorPalette } from '@/types/colors';

const STATIC_COLORS_FILE_PATH = '/src/styles/static-colors.css';

// Generate complete CSS content for BOTH files (static-colors.css + index.css fallbacks)
export const generateCompleteStaticCSS = (palette: ColorPalette): { staticColorsCSS: string; indexCSSFallbacks: string } => {
  const lightColors = Object.entries(palette.light)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');
    
  const darkColors = Object.entries(palette.dark)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');

  const staticColorsCSS = `/* ============================================================================ */
/* SISTEMA DE CORES ESTÃTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo gerado automaticamente pelo Static Color Controller */
/* Ãšltima atualizaÃ§Ã£o: ${new Date().toLocaleString('pt-BR')} */

/* CORES ESTÃTICAS - SEM @layer utilities para evitar conflitos com Tailwind */
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
  /* APLICAÃ‡ÃƒO DAS CORES NOS COMPONENTES */
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

  // Gerar arquivo index.css COMPLETO com fallbacks atualizados
  const primaryColor = palette.light.primary?.hsl || '173 88% 58%';
  const primaryHover = palette.light['primary-hover']?.hsl || '173 88% 54%';
  const primaryGlow = palette.light['primary-glow']?.hsl || '173 95% 78%';
  
  const indexCSSComplete = `/* Controller GRC - Static Design System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=latin');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Cores de fallback ANTES do import para menor prioridade */
@layer base {
  :root {
    /* FALLBACKS - Menor prioridade que static-colors.css */
    --primary: ${primaryColor};
    --primary-hover: ${primaryHover};
    --primary-glow: ${primaryGlow};
    --primary-foreground: 0 0% 100%;
    --primary-text: 225 71% 12%;
    --secondary: 210 40% 98%;
    --secondary-foreground: 222.2 84% 4.9%;
    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --danger: 0 84% 60%;
    --danger-foreground: 0 0% 100%;
    --muted: 210 20% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214 32% 91%;
    --risk-critical: 0 84% 60%;
    --risk-high: 24 95% 53%;
    --risk-medium: 38 92% 50%;
    --risk-low: 142 76% 36%;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
  }
  
  .dark {
    /* FALLBACKS DARK - Menor prioridade que static-colors.css */
    --primary: ${primaryColor};
    --primary-hover: ${primaryHover};
    --primary-glow: ${primaryGlow};
    --primary-foreground: 0 0% 0%;
    --primary-text: 0 0% 100%;
    --secondary: 215 8% 12%;
    --secondary-foreground: 0 0% 100%;
    --success: 142 76% 46%;
    --success-foreground: 0 0% 0%;
    --warning: 38 92% 60%;
    --warning-foreground: 0 0% 0%;
    --danger: 0 84% 70%;
    --danger-foreground: 0 0% 0%;
    --muted: 215 12% 16%;
    --muted-foreground: 215.4 16.3% 56.9%;
    --border: 215 10% 22%;
    --risk-critical: 0 84% 70%;
    --risk-high: 24 95% 63%;
    --risk-medium: 38 92% 60%;
    --risk-low: 142 76% 46%;
    --sidebar-background: 215 8% 12%;
    --sidebar-foreground: 0 0% 100%;
  }
}

/* Import static colors AFTER fallbacks for higher priority */
@import './styles/static-colors.css';

@layer base {
  :root {
    /* 
     * CORES PRINCIPAIS DEFINIDAS EM static-colors.css
     * Este arquivo apenas define variÃ¡veis derivadas
     * As cores primÃ¡rias sÃ£o carregadas de src/styles/static-colors.css
     */
    
    /* Fallback colors bÃ¡sicos - apenas se static-colors.css nÃ£o carregar */
    --background: 0 0% 100%;
    --foreground: 225 71% 12%;
    --card: 0 0% 100%;
    --card-foreground: 225 71% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 225 71% 12%;
    
    /* VariÃ¡veis derivadas que referenciam as cores principais */
    --ring: var(--primary);
    --accent: var(--secondary);
    --destructive: var(--danger);
    --destructive-foreground: var(--danger-foreground);
    --input: var(--border);
    
    /* VariÃ¡veis de sidebar que referenciam as cores principais */
    --sidebar-primary: var(--sidebar-foreground);
    --sidebar-primary-foreground: var(--sidebar-background);
    --sidebar-accent: var(--muted);
    --sidebar-accent-foreground: var(--sidebar-foreground);
    --sidebar-border: var(--border);
    --sidebar-ring: var(--primary);
    
    /* Gradients */
    --gradient-brand: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
    --gradient-success: linear-gradient(135deg, hsl(var(--success)), hsl(142 76% 50%));
    --gradient-danger: linear-gradient(135deg, hsl(var(--danger)), hsl(0 84% 70%));
    --gradient-hero: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

    /* Border radius */
    --radius: 0.4375rem;
  }

  .dark {
    /* 
     * DARK MODE: Cores principais definidas em static-colors.css
     * Este arquivo apenas define variÃ¡veis derivadas
     */
    
    /* Fallback colors bÃ¡sicos - apenas se static-colors.css nÃ£o carregar */
    --background: 222 18% 4%;
    --foreground: 0 0% 100%;
    --card: 215 8% 12%;
    --card-foreground: 0 0% 100%;
    --popover: 222 13% 11%;
    --popover-foreground: 0 0% 100%;
    
    /* VariÃ¡veis derivadas que referenciam as cores principais */
    --ring: var(--primary);
    --accent: var(--secondary);
    --destructive: var(--danger);
    --destructive-foreground: var(--danger-foreground);
    --input: var(--border);
    
    /* VariÃ¡veis de sidebar que referenciam as cores principais */
    --sidebar-primary: var(--primary);
    --sidebar-primary-foreground: var(--sidebar-background);
    --sidebar-accent: var(--muted);
    --sidebar-accent-foreground: var(--sidebar-foreground);
    --sidebar-border: var(--border);
    --sidebar-ring: var(--primary);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  html {
    /* Improve text rendering and sharpness */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1;
    font-kerning: normal;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-display: swap;
    font-variant-ligatures: normal;
    font-variant-numeric: tabular-nums;
    /* Additional sharpness improvements */
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    text-size-adjust: 100%;
    /* Ensure dark mode colors are applied */
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }

  /* Improve rendering for all elements */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-font-smoothing: inherit;
    -moz-osx-font-smoothing: inherit;
  }

  /* Improve SVG and icon rendering */
  svg {
    shape-rendering: geometricPrecision;
    text-rendering: optimizeLegibility;
  }

  /* Improve button and interactive element rendering */
  button,
  input,
  select,
  textarea {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* High DPI display optimizations */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    html {
      -webkit-font-smoothing: subpixel-antialiased;
    }
  }

  /* Improve text contrast and readability */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  p, span, div {
    line-height: 1.5;
  }

  /* Improve card rendering for all cards */
  .card {
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* Risk level indicators */
  .risk-critical {
    @apply text-[hsl(var(--risk-critical))] bg-[hsl(var(--risk-critical)/0.1)] border-[hsl(var(--risk-critical)/0.3)];
  }

  .risk-high {
    @apply text-[hsl(var(--risk-high))] bg-[hsl(var(--risk-high)/0.1)] border-[hsl(var(--risk-high)/0.3)];
  }

  .risk-medium {
    @apply text-[hsl(var(--risk-medium))] bg-[hsl(var(--risk-medium)/0.1)] border-[hsl(var(--risk-medium)/0.3)];
  }

  .risk-low {
    @apply text-[hsl(var(--risk-low))] bg-[hsl(var(--risk-low)/0.1)] border-[hsl(var(--risk-low)/0.3)];
  }

  /* Animation classes */
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }

  .animate-pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  /* Improve card hover effects */
  .card:hover {
    transform: translateY(-1px);
  }

  /* Smooth transitions - only for interactive elements */
  button,
  .card,
  [role="button"],
  input,
  textarea,
  select {
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  }

  /* Focus states */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px hsl(var(--primary-glow) / 0.3);
  }
  50% {
    box-shadow: 0 0 40px hsl(var(--primary-glow) / 0.6);
  }
}`;

  return {
    staticColorsCSS,
    indexCSSFallbacks: indexCSSComplete
  };
};

// Create a mock API endpoint simulation for development
// In a real implementation, this would call a backend API
export const writeStaticColorsFile = async (palette: ColorPalette): Promise<boolean> => {
  try {
    const cssContent = generateCompleteStaticCSS(palette);
    
    // For development: Use localStorage to persist the changes temporarily
    // and provide instructions for manual file update
    localStorage.setItem('grc-pending-colors', JSON.stringify({
      palette,
      cssContent,
      timestamp: new Date().toISOString()
    }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be replaced with:
    // const response = await fetch('/api/update-colors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ cssContent, filePath: STATIC_COLORS_FILE_PATH })
    // });
    // return response.ok;

    return true;
  } catch (error) {
    console.error('Failed to write colors file:', error);
    return false;
  }
};

// Load pending colors from localStorage and apply them
export const loadPendingColors = (): { palette: ColorPalette; cssContent: string } | null => {
  try {
    const pending = localStorage.getItem('grc-pending-colors');
    if (pending) {
      return JSON.parse(pending);
    }
  } catch (error) {
    console.error('Failed to load pending colors:', error);
  }
  return null;
};

// Apply CSS content to a <style> element for immediate effect
export const injectCSS = (cssContent: string, id = 'dynamic-colors') => {
  // Remove existing dynamic styles
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create and inject new style element with highest priority
  const style = document.createElement('style');
  style.id = id;
  style.textContent = cssContent;
  
  // Insert at the beginning of head for highest priority
  document.head.insertBefore(style, document.head.firstChild);
};

// Remove injected CSS
export const removeInjectedCSS = (id = 'dynamic-colors') => {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
};

// Check if there are pending color changes
export const hasPendingColors = (): boolean => {
  return !!localStorage.getItem('grc-pending-colors');
};

// Clear pending colors
export const clearPendingColors = () => {
  localStorage.removeItem('grc-pending-colors');
};

// Download file with instructions
export const downloadWithInstructions = (palette: ColorPalette) => {
  const cssContent = generateCompleteStaticCSS(palette);
  
  const instructionsContent = `# INSTRUÃ‡Ã•ES PARA APLICAR AS CORES

## Arquivo Gerado
- static-colors.css - Substitua o arquivo em src/styles/static-colors.css

## Como aplicar:
1. FaÃ§a backup do arquivo atual src/styles/static-colors.css
2. Substitua o arquivo pela versÃ£o baixada
3. Reinicie o servidor de desenvolvimento (npm run dev)
4. As cores serÃ£o aplicadas automaticamente

## VerificaÃ§Ã£o:
- âœ… Recarregue a pÃ¡gina para confirmar as mudanÃ§as
- âœ… Teste tanto light mode quanto dark mode
- âœ… Verifique se todos os componentes estÃ£o usando as novas cores

Ãšltima atualizaÃ§Ã£o: ${new Date().toLocaleString('pt-BR')}
`;

  // Create zip-like download with both files
  const blob1 = new Blob([cssContent], { type: 'text/css' });
  const blob2 = new Blob([instructionsContent], { type: 'text/plain' });
  
  // Download CSS file
  const url1 = URL.createObjectURL(blob1);
  const a1 = document.createElement('a');
  a1.href = url1;
  a1.download = 'static-colors.css';
  document.body.appendChild(a1);
  a1.click();
  document.body.removeChild(a1);
  URL.revokeObjectURL(url1);

  // Download instructions
  setTimeout(() => {
    const url2 = URL.createObjectURL(blob2);
    const a2 = document.createElement('a');
    a2.href = url2;
    a2.download = 'INSTRUÃ‡Ã•ES.txt';
    document.body.appendChild(a2);
    a2.click();
    document.body.removeChild(a2);
    URL.revokeObjectURL(url2);
  }, 500);
};

