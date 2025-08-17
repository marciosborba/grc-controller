
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
      palette.primary === '#0d26e3' && 
      palette.secondary === '#7e22ce' && 
      palette.tertiary === '#be185d';
    
    // If using default colors, don't override CSS (they're already set in index.css)
    if (isDefaultPalette) {
      return;
    }

    const primaryHSL = hexToHSL(palette.primary);
    const secondaryHSL = hexToHSL(palette.secondary);
    const tertiaryHSL = hexToHSL(palette.tertiary);

    // Use CSS custom properties directly on document root for better performance
    const root = document.documentElement;
    
    // Apply light mode colors
    root.style.setProperty('--primary', `${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2]}%`);
    root.style.setProperty('--primary-foreground', `${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2] > 50 ? 10 : 90}%`);
    root.style.setProperty('--secondary', `${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2]}%`);
    root.style.setProperty('--secondary-foreground', `${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2] > 50 ? 10 : 90}%`);
    root.style.setProperty('--accent', `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2]}%`);
    root.style.setProperty('--accent-foreground', `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2] > 50 ? 10 : 90}%`);

    // Create or update dark mode styles
    let darkModeStyle = document.getElementById('custom-dark-theme');
    if (!darkModeStyle) {
      darkModeStyle = document.createElement('style');
      darkModeStyle.id = 'custom-dark-theme';
      document.head.appendChild(darkModeStyle);
    }

    darkModeStyle.innerHTML = `
      .dark {
        --primary: ${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2] < 50 ? Math.min(100 - primaryHSL[2] + 10, 90) : primaryHSL[2]}%;
        --primary-foreground: ${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2] < 50 ? 10 : 90}%;
        --secondary: ${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2] < 50 ? Math.min(100 - secondaryHSL[2] + 10, 90) : secondaryHSL[2]}%;
        --secondary-foreground: ${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2] < 50 ? 10 : 90}%;
        --accent: ${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2] < 50 ? Math.min(100 - tertiaryHSL[2] + 10, 90) : tertiaryHSL[2]}%;
        --accent-foreground: ${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2] < 50 ? 10 : 90}%;
      }
    `;

    return () => {
      // Reset to default values when component unmounts
      if (darkModeStyle) {
        document.head.removeChild(darkModeStyle);
      }
    };
  }, [palette]);
};

// Manter a exportação original para compatibilidade
export const useTheme = useCustomTheme;
