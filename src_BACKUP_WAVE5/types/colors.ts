// Types for the static color system

export interface ColorValue {
  hsl: string;
  hex: string;
  name: string;
  description: string;
  category: string;
}

export interface ColorPalette {
  light: Record<string, ColorValue>;
  dark: Record<string, ColorValue>;
}

export interface ColorCategory {
  name: string;
  description: string;
  colors: string[];
  icon: React.ComponentType<any>;
}

export interface ColorManagerState {
  palette: ColorPalette;
  activeMode: 'light' | 'dark';
  activeCategory: string;
  previewMode: boolean;
  isApplying: boolean;
  hasChanges: boolean;
}

export interface ColorManagerActions {
  updateColor: (colorKey: string, newHex: string) => void;
  applyColors: () => Promise<void>;
  resetToDefault: () => void;
  setActiveMode: (mode: 'light' | 'dark') => void;
  setActiveCategory: (category: string) => void;
  setPreviewMode: (enabled: boolean) => void;
  exportPalette: () => void;
  importPalette: (palette: ColorPalette) => void;
}