// Direct color applicator - guaranteed to work
import type { ColorPalette } from '@/types/colors';

// Generate CSS content with the user's colors
export const generateUserColorCSS = (palette: ColorPalette): string => {
  const lightColors = Object.entries(palette.light)
    .map(([key, value]) => `    --${key}: ${value.hsl} !important;`)
    .join('\n');
    
  const darkColors = Object.entries(palette.dark)
    .map(([key, value]) => `    --${key}: ${value.hsl} !important;`)
    .join('\n');

  return `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo atualizado automaticamente pelo Static Color Controller */
/* Última atualização: ${new Date().toLocaleString('pt-BR')} */

@layer utilities {
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

// Apply colors immediately and persistently
export const applyColorsDirectly = (palette: ColorPalette): Promise<{success: boolean, method: string, message: string}> => {
  return new Promise(async (resolve) => {
    try {
      const cssContent = generateUserColorCSS(palette);
      
      // Method 1: Try to update via API (if available)
      try {
        const response = await fetch('/api/update-colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(palette)
        });

        if (response.ok) {
          // Apply immediately to DOM as well
          applyToDOMDirectly(cssContent, palette);
          
          resolve({
            success: true,
            method: 'api',
            message: 'Cores aplicadas automaticamente via API! Arquivo CSS atualizado.'
          });
          return;
        }
      } catch (apiError) {
        console.log('API method failed, trying alternative methods...');
      }

      // Method 2: Apply to DOM and provide clear instructions
      const applied = applyToDOMDirectly(cssContent, palette);
      
      if (applied) {
        // Store for persistence across reloads
        localStorage.setItem('grc-user-colors', JSON.stringify({
          palette,
          cssContent,
          timestamp: new Date().toISOString(),
          applied: true
        }));

        // Generate command for permanent application
        const command = `node scripts/update-colors.js '${JSON.stringify(palette).replace(/'/g, "\\'")}'`;
        
        resolve({
          success: true,
          method: 'dom+instruction',
          message: `Cores aplicadas visualmente! Para aplicar permanentemente, execute no terminal:\n\n${command}`
        });
      } else {
        throw new Error('Failed to apply to DOM');
      }

    } catch (error) {
      resolve({
        success: false,
        method: 'error',
        message: `Erro ao aplicar cores: ${error}`
      });
    }
  });
};

// Apply directly to DOM with high priority
export const applyToDOMDirectly = (cssContent: string, palette: ColorPalette): boolean => {
  try {
    // Remove any existing applied styles
    const existingStyles = document.querySelectorAll('#grc-user-colors, #grc-dynamic-colors');
    existingStyles.forEach(el => el.remove());

    // Create new style element with high priority
    const style = document.createElement('style');
    style.id = 'grc-user-colors';
    style.textContent = cssContent;
    
    // Insert at the beginning of head for high priority
    document.head.insertBefore(style, document.head.firstChild);

    // Also apply individual CSS variables for immediate effect
    Object.entries(palette.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value.hsl);
    });

    // Apply dark mode variables if dark mode is active
    if (document.documentElement.classList.contains('dark')) {
      Object.entries(palette.dark).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value.hsl);
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to apply to DOM:', error);
    return false;
  }
};

// Load and apply stored colors on page load
export const loadUserColorsOnStartup = (): boolean => {
  try {
    const stored = localStorage.getItem('grc-user-colors');
    if (!stored) return false;

    const data = JSON.parse(stored);
    if (!data.applied || !data.cssContent) return false;

    // Apply the stored CSS
    const success = applyToDOMDirectly(data.cssContent, data.palette);
    
    if (success) {
      // User colors loaded and applied from localStorage
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error loading user colors:', error);
    return false;
  }
};

// Clear user colors and revert to defaults
export const clearUserColors = (): void => {
  // Remove style elements
  const userStyles = document.querySelectorAll('#grc-user-colors, #grc-dynamic-colors');
  userStyles.forEach(el => el.remove());

  // Clear localStorage
  localStorage.removeItem('grc-user-colors');

  // Reset CSS variables (let the default stylesheet take over)
  const computedStyle = getComputedStyle(document.documentElement);
  const cssVars = Array.from(document.documentElement.style).filter(prop => prop.startsWith('--'));
  cssVars.forEach(prop => {
    document.documentElement.style.removeProperty(prop);
  });

  // User colors cleared, reverted to defaults
};

// Check if user colors are currently applied
export const hasUserColorsApplied = (): boolean => {
  try {
    const stored = localStorage.getItem('grc-user-colors');
    if (!stored) return false;

    const data = JSON.parse(stored);
    return data.applied === true && document.getElementById('grc-user-colors') !== null;
  } catch {
    return false;
  }
};

// Get current user palette from storage
export const getCurrentUserPalette = (): ColorPalette | null => {
  try {
    const stored = localStorage.getItem('grc-user-colors');
    if (!stored) return null;

    const data = JSON.parse(stored);
    return data.palette || null;
  } catch {
    return null;
  }
};