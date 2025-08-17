
import { useEffect } from 'react';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

// Function to convert HEX to HSL
const hexToHSL = (hex: string): [number, number, number] => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
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

  return [h * 360, s * 100, l * 100];
};

export const useCustomTheme = (palette: ColorPalette) => {
  useEffect(() => {
    // Check if colors are already the default ones to avoid unnecessary updates
    const isDefaultPalette = 
      palette.primary === '#0e2954' && 
      palette.secondary === '#7e22ce' && 
      palette.tertiary === '#be185d';
    
    // If using default colors, don't override CSS (they're already set in index.css)
    if (isDefaultPalette) {
      console.log('🎨 useTheme: Usando paleta padrão - não sobrescrevendo CSS');
      return;
    }

    const primaryHSL = hexToHSL(palette.primary);
    const secondaryHSL = hexToHSL(palette.secondary);
    const tertiaryHSL = hexToHSL(palette.tertiary);

    console.log('🎨 useTheme: Aplicando paleta customizada', {
      primary: palette.primary,
      secondary: palette.secondary,
      tertiary: palette.tertiary
    });

    // Use CSS custom properties directly on document root for better performance
    const root = document.documentElement;
    const isDarkMode = root.classList.contains('dark');
    
    // Apply colors with proper dark mode consideration
    if (isDarkMode) {
      // For dark mode, adjust colors to be more suitable
      const darkPrimaryL = primaryHSL[2] < 50 ? Math.min(primaryHSL[2] + 20, 70) : Math.max(primaryHSL[2] - 10, 30);
      const darkSecondaryL = secondaryHSL[2] < 50 ? Math.min(secondaryHSL[2] + 20, 70) : Math.max(secondaryHSL[2] - 10, 30);
      const darkTertiaryL = tertiaryHSL[2] < 50 ? Math.min(tertiaryHSL[2] + 20, 70) : Math.max(tertiaryHSL[2] - 10, 30);
      
      root.style.setProperty('--primary', `${primaryHSL[0]} ${primaryHSL[1]}% ${darkPrimaryL}%`);
      root.style.setProperty('--secondary', `${secondaryHSL[0]} ${secondaryHSL[1]}% ${darkSecondaryL}%`);
      root.style.setProperty('--accent', `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${darkTertiaryL}%`);
      
      console.log('🌙 useTheme: Cores ajustadas para dark mode');
    } else {
      // For light mode, use original colors
      root.style.setProperty('--primary', `${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2]}%`);
      root.style.setProperty('--secondary', `${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2]}%`);
      root.style.setProperty('--accent', `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2]}%`);
      
      console.log('☀️ useTheme: Cores aplicadas para light mode');
    }
    
    // Apply foreground colors
    root.style.setProperty('--primary-foreground', `${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2] > 50 ? 10 : 90}%`);
    root.style.setProperty('--secondary-foreground', `${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2] > 50 ? 10 : 90}%`);
    root.style.setProperty('--accent-foreground', `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2] > 50 ? 10 : 90}%`);

    // Remove the dynamic style element approach as it can conflict with ThemeContext
    // The ThemeContext now handles all theme applications
    
    return () => {
      // Clean up function - remove any custom styles if needed
      console.log('🧹 useTheme: Limpando estilos customizados');
    };
  }, [palette]);
};

// Manter a exportação original para compatibilidade
export const useTheme = useCustomTheme;
