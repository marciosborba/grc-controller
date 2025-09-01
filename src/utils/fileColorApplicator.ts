// Automatic color applicator for static-colors.css
import type { ColorPalette } from '@/types/colors';
import { generateUserColorCSS } from './directColorApplicator';

// Apply colors directly to static-colors.css file
export const applyColorsToFile = async (palette: ColorPalette): Promise<{success: boolean, message: string}> => {
  try {
    // Generate CSS content
    const cssContent = generateUserColorCSS(palette);
    
    // Try to use Vite's file system API if available (development mode)
    if (import.meta.hot) {
      try {
        const response = await fetch('/@fs/src/styles/static-colors.css', {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/css',
          },
          body: cssContent
        });

        if (response.ok) {
          return {
            success: true,
            message: 'Cores aplicadas automaticamente ao arquivo! A aplicação será recarregada.'
          };
        }
      } catch (viteError) {
        console.log('Vite FS API not available, trying alternative methods...');
      }
    }

    // Method 2: Use File System Access API (modern browsers)
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
          message: 'Arquivo CSS salvo! Copie o arquivo para src/styles/static-colors.css e recarregue a aplicação.'
        };
      } catch (fsError) {
        console.log('File System Access API failed or cancelled');
      }
    }

    // Method 3: Create download with instructions
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'static-colors-updated.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Arquivo CSS baixado! Substitua o conteúdo de src/styles/static-colors.css e recarregue a aplicação.'
    };

  } catch (error) {
    console.error('Error applying colors to file:', error);
    return {
      success: false,
      message: `Erro ao aplicar cores: ${error}`
    };
  }
};

// Create a simple color update script for Node.js
export const generateColorUpdateScript = (palette: ColorPalette): string => {
  return `#!/usr/bin/env node
// Auto-generated script to update colors in static-colors.css

const fs = require('fs');
const path = require('path');

const palette = ${JSON.stringify(palette, null, 2)};

const generateCSS = (palette) => {
  const lightColors = Object.entries(palette.light)
    .map(([key, value]) => \`    --\${key}: \${value.hsl};\`)
    .join('\\n');
    
  const darkColors = Object.entries(palette.dark)
    .map(([key, value]) => \`    --\${key}: \${value.hsl};\`)
    .join('\\n');

  return \`${generateUserColorCSS(palette).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
};

const cssFilePath = path.join(__dirname, '..', 'src', 'styles', 'static-colors.css');

try {
  const cssContent = generateCSS(palette);
  fs.writeFileSync(cssFilePath, cssContent, 'utf8');
  console.log('✅ Cores aplicadas com sucesso em static-colors.css!');
  console.log('🔄 Recarregue a aplicação para ver as mudanças.');
} catch (error) {
  console.error('❌ Erro ao aplicar cores:', error.message);
  process.exit(1);
}
`;
};

// Enhanced application with multiple fallback methods
export const applyColorsWithFallbacks = async (palette: ColorPalette): Promise<{success: boolean, method: string, message: string, cssContent?: string}> => {
  try {
    const cssContent = generateUserColorCSS(palette);
    
    // Method 1: Try direct file write via service worker or extension
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const response = await fetch('/api/update-static-colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cssContent, palette })
        });

        if (response.ok) {
          return {
            success: true,
            method: 'service-worker',
            message: 'Cores aplicadas automaticamente via Service Worker! Recarregando...'
          };
        }
      }
    } catch (swError) {
      console.log('Service Worker method failed, trying alternatives...');
    }

    // Method 2: Apply to DOM immediately and store for persistence
    const style = document.createElement('style');
    style.id = 'grc-automatic-colors';
    style.textContent = cssContent;
    
    // Remove existing automatic styles
    const existing = document.getElementById('grc-automatic-colors');
    if (existing) {
      existing.remove();
    }
    
    // Insert with high priority
    document.head.insertBefore(style, document.head.firstChild);

    // Apply CSS variables directly for immediate effect
    Object.entries(palette.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value.hsl);
    });

    // Store in localStorage for persistence
    localStorage.setItem('grc-applied-colors', JSON.stringify({
      palette,
      cssContent,
      timestamp: Date.now(),
      applied: true
    }));

    // Method 3: Generate downloadable script
    const script = generateColorUpdateScript(palette);
    const scriptBlob = new Blob([script], { type: 'text/javascript' });
    const scriptUrl = URL.createObjectURL(scriptBlob);
    const scriptLink = document.createElement('a');
    scriptLink.href = scriptUrl;
    scriptLink.download = 'apply-colors.js';
    scriptLink.style.display = 'none';
    document.body.appendChild(scriptLink);

    // Auto-download the script
    scriptLink.click();
    document.body.removeChild(scriptLink);
    URL.revokeObjectURL(scriptUrl);

    return {
      success: true,
      method: 'dom-immediate',
      message: 'Cores aplicadas visualmente! Script de aplicação permanente baixado. Execute: node apply-colors.js',
      cssContent
    };

  } catch (error) {
    return {
      success: false,
      method: 'error',
      message: `Erro ao aplicar cores: ${error}`
    };
  }
};

// Load applied colors on startup
export const loadAppliedColorsOnStartup = (): boolean => {
  try {
    const stored = localStorage.getItem('grc-applied-colors');
    if (!stored) return false;

    const data = JSON.parse(stored);
    if (!data.applied || !data.cssContent) return false;

    // Apply the stored CSS
    const style = document.createElement('style');
    style.id = 'grc-automatic-colors';
    style.textContent = data.cssContent;
    document.head.insertBefore(style, document.head.firstChild);

    // Apply CSS variables
    Object.entries(data.palette.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value.hsl);
    });

    // Apply dark mode if active
    if (document.documentElement.classList.contains('dark')) {
      Object.entries(data.palette.dark).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value.hsl);
      });
    }

    console.log('🎨 Applied colors loaded and restored');
    return true;
    
  } catch (error) {
    console.error('Error loading applied colors:', error);
    return false;
  }
};

// Clear applied colors
export const clearAppliedColors = (): void => {
  const style = document.getElementById('grc-automatic-colors');
  if (style) {
    style.remove();
  }
  
  localStorage.removeItem('grc-applied-colors');
  
  // Reset CSS variables
  const cssVars = Array.from(document.documentElement.style).filter(prop => prop.startsWith('--'));
  cssVars.forEach(prop => {
    document.documentElement.style.removeProperty(prop);
  });
  
  console.log('🧹 Applied colors cleared');
};

// Check if colors are currently applied
export const hasAppliedColors = (): boolean => {
  try {
    const stored = localStorage.getItem('grc-applied-colors');
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    return data.applied === true && document.getElementById('grc-automatic-colors') !== null;
  } catch {
    return false;
  }
};