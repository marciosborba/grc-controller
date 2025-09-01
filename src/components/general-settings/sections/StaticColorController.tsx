import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Sun,
  Brush,
  Check,
  AlertTriangle,
  Info,
  RefreshCw,
  Shield,
  Menu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { ColorValue, ColorPalette, ColorCategory } from '@/types/colors';
import { ColorPreviewDemo } from './ColorPreviewDemo';
import { ColorPersistenceDemo } from './ColorPersistenceDemo';
import { useStaticColorManager } from '@/hooks/useStaticColorManager';

// Paleta padrão (cores atuais preservadas)
const defaultPalette: ColorPalette = {
  light: {
    // Core Colors
    primary: {
      hsl: '173 88% 58%',
      hex: '#2dd4bf',
      name: 'Primary',
      description: 'Cor primária - Verde/Teal UI Nativa',
      category: 'core'
    },
    'primary-hover': {
      hsl: '173 88% 54%',
      hex: '#14b8a6',
      name: 'Primary Hover',
      description: 'Estado hover do primary',
      category: 'core'
    },
    'primary-glow': {
      hsl: '173 95% 78%',
      hex: '#7dd3fc',
      name: 'Primary Glow',
      description: 'Efeito glow do primary',
      category: 'core'
    },
    
    // Layout Colors
    background: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Background',
      description: 'Fundo principal da aplicação',
      category: 'layout'
    },
    foreground: {
      hsl: '225 71% 12%',
      hex: '#0a0f1c',
      name: 'Foreground',
      description: 'Cor do texto principal',
      category: 'layout'
    },
    card: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Card',
      description: 'Fundo dos cards',
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
      description: 'Cor das bordas',
      category: 'layout'
    },
    muted: {
      hsl: '210 20% 96%',
      hex: '#f4f6f8',
      name: 'Muted',
      description: 'Cor de fundo neutra',
      category: 'layout'
    },
    'muted-foreground': {
      hsl: '215.4 16.3% 46.9%',
      hex: '#64748b',
      name: 'Muted Foreground',
      description: 'Texto sobre fundo muted',
      category: 'layout'
    },
    secondary: {
      hsl: '210 40% 98%',
      hex: '#f1f5f9',
      name: 'Secondary',
      description: 'Cor secundária',
      category: 'layout'
    },
    'secondary-foreground': {
      hsl: '222.2 84% 4.9%',
      hex: '#0f172a',
      name: 'Secondary Foreground',
      description: 'Texto sobre cor secundária',
      category: 'layout'
    },
    'primary-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Primary Foreground',
      description: 'Texto sobre cor primária',
      category: 'core'
    },
    'primary-text': {
      hsl: '225 71% 12%',
      hex: '#0a0f1c',
      name: 'Primary Text',
      description: 'Cor do texto primário da aplicação',
      category: 'core'
    },
    popover: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Popover',
      description: 'Fundo de popovers',
      category: 'layout'
    },
    'popover-foreground': {
      hsl: '225 71% 12%',
      hex: '#0a0f1c',
      name: 'Popover Foreground',
      description: 'Texto de popovers',
      category: 'layout'
    },
    
    // Status Colors
    success: {
      hsl: '142 76% 36%',
      hex: '#22c55e',
      name: 'Success',
      description: 'Cor de sucesso',
      category: 'status'
    },
    'success-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Success Foreground',
      description: 'Texto sobre cor de sucesso',
      category: 'status'
    },
    warning: {
      hsl: '38 92% 50%',
      hex: '#f97316',
      name: 'Warning',
      description: 'Cor de aviso',
      category: 'status'
    },
    'warning-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Warning Foreground',
      description: 'Texto sobre cor de aviso',
      category: 'status'
    },
    danger: {
      hsl: '0 84% 60%',
      hex: '#ef4444',
      name: 'Danger',
      description: 'Cor de perigo',
      category: 'status'
    },
    'danger-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Danger Foreground',
      description: 'Texto sobre cor de perigo',
      category: 'status'
    },
    
    // GRC Risk Colors
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
    
    // Sidebar Colors
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
    // Core Colors (iguais no dark)
    primary: {
      hsl: '173 88% 58%',
      hex: '#2dd4bf',
      name: 'Primary',
      description: 'Cor primária - Verde/Teal UI Nativa',
      category: 'core'
    },
    'primary-hover': {
      hsl: '173 88% 54%',
      hex: '#14b8a6',
      name: 'Primary Hover',
      description: 'Estado hover do primary',
      category: 'core'
    },
    'primary-glow': {
      hsl: '173 95% 78%',
      hex: '#7dd3fc',
      name: 'Primary Glow',
      description: 'Efeito glow do primary',
      category: 'core'
    },
    
    // Layout Colors Dark
    background: {
      hsl: '222 18% 4%',
      hex: '#0a0a0b',
      name: 'Background',
      description: 'Fundo principal dark mode',
      category: 'layout'
    },
    foreground: {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Foreground',
      description: 'Cor do texto principal dark',
      category: 'layout'
    },
    card: {
      hsl: '215 8% 12%',
      hex: '#1a1d23',
      name: 'Card',
      description: 'Fundo dos cards dark',
      category: 'layout'
    },
    'card-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Card Foreground',
      description: 'Texto dos cards dark',
      category: 'layout'
    },
    border: {
      hsl: '215 10% 22%',
      hex: '#2d3748',
      name: 'Border',
      description: 'Cor das bordas dark',
      category: 'layout'
    },
    muted: {
      hsl: '215 12% 16%',
      hex: '#1f2937',
      name: 'Muted',
      description: 'Cor de fundo neutra dark',
      category: 'layout'
    },
    'muted-foreground': {
      hsl: '215.4 16.3% 56.9%',
      hex: '#94a3b8',
      name: 'Muted Foreground',
      description: 'Texto sobre fundo muted dark',
      category: 'layout'
    },
    secondary: {
      hsl: '215 8% 12%',
      hex: '#1a1d23',
      name: 'Secondary',
      description: 'Cor secundária dark',
      category: 'layout'
    },
    'secondary-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Secondary Foreground',
      description: 'Texto sobre cor secundária dark',
      category: 'layout'
    },
    'primary-foreground': {
      hsl: '0 0% 0%',
      hex: '#000000',
      name: 'Primary Foreground',
      description: 'Texto sobre cor primária dark',
      category: 'core'
    },
    'primary-text': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Primary Text',
      description: 'Cor do texto primário da aplicação dark',
      category: 'core'
    },
    popover: {
      hsl: '215 8% 12%',
      hex: '#1a1d23',
      name: 'Popover',
      description: 'Fundo de popovers dark',
      category: 'layout'
    },
    'popover-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Popover Foreground',
      description: 'Texto de popovers dark',
      category: 'layout'
    },
    
    // Status Colors Dark (mais claras)
    success: {
      hsl: '142 76% 46%',
      hex: '#34d399',
      name: 'Success',
      description: 'Cor de sucesso dark',
      category: 'status'
    },
    'success-foreground': {
      hsl: '0 0% 0%',
      hex: '#000000',
      name: 'Success Foreground',
      description: 'Texto sobre cor de sucesso dark',
      category: 'status'
    },
    warning: {
      hsl: '38 92% 60%',
      hex: '#fbbf24',
      name: 'Warning',
      description: 'Cor de aviso dark',
      category: 'status'
    },
    'warning-foreground': {
      hsl: '0 0% 0%',
      hex: '#000000',
      name: 'Warning Foreground',
      description: 'Texto sobre cor de aviso dark',
      category: 'status'
    },
    danger: {
      hsl: '0 84% 70%',
      hex: '#f87171',
      name: 'Danger',
      description: 'Cor de perigo dark',
      category: 'status'
    },
    'danger-foreground': {
      hsl: '0 0% 0%',
      hex: '#000000',
      name: 'Danger Foreground',
      description: 'Texto sobre cor de perigo dark',
      category: 'status'
    },
    
    // GRC Risk Colors Dark
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
    
    // Sidebar Colors Dark
    'sidebar-background': {
      hsl: '215 8% 12%',
      hex: '#1a1d23',
      name: 'Sidebar Background',
      description: 'Fundo da sidebar dark',
      category: 'sidebar'
    },
    'sidebar-foreground': {
      hsl: '0 0% 100%',
      hex: '#ffffff',
      name: 'Sidebar Foreground',
      description: 'Texto da sidebar dark',
      category: 'sidebar'
    }
  }
};

// Categorias de cores
const colorCategories: ColorCategory[] = [
  {
    name: 'Core',
    description: 'Cores principais da marca',
    colors: ['primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text'],
    icon: Brush
  },
  {
    name: 'Layout',
    description: 'Cores estruturais da aplicação',
    colors: ['background', 'foreground', 'card', 'card-foreground', 'border', 'muted', 'muted-foreground', 'secondary', 'secondary-foreground', 'popover', 'popover-foreground'],
    icon: Monitor
  },
  {
    name: 'Status',
    description: 'Cores de estado e feedback',
    colors: ['success', 'success-foreground', 'warning', 'warning-foreground', 'danger', 'danger-foreground'],
    icon: AlertTriangle
  },
  {
    name: 'Risk',
    description: 'Cores específicas do GRC',
    colors: ['risk-critical', 'risk-high', 'risk-medium', 'risk-low'],
    icon: Shield
  },
  {
    name: 'Sidebar',
    description: 'Cores da navegação lateral',
    colors: ['sidebar-background', 'sidebar-foreground'],
    icon: Menu
  }
];

export const StaticColorController: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'light' | 'dark'>('light');
  const [activeCategory, setActiveCategory] = useState('core');
  const [previewRefresh, setPreviewRefresh] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detectar tema atual do sistema
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setActiveMode(isDark ? 'dark' : 'light');
    };
    
    // Verificar tema inicial
    checkTheme();
    
    // Observer para mudanças na classe dark
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Use the new color manager hook
  const {
    palette,
    hasChanges,
    isApplying,
    previewMode,
    pendingColorsDetected,
    showCSSModal,
    generatedCSS,
    staticColorsCode,
    indexCSSCode,
    activeTab,
    setActiveTab,
    updateColor,
    applyColors,
    togglePreview,
    resetToDefault,
    clearPendingChanges,
    testColorApplication,
    forceExtremeColors,
    exportPalette,
    importPalette,
    setShowCSSModal
  } = useStaticColorManager(defaultPalette);

  // Debug: Monitorar mudanças na paleta
  useEffect(() => {
    console.log('🔍 PALETA MUDOU:', palette?.light?.primary?.hex);
    console.log('🔍 Cor primária atual:', palette?.light?.primary);
  }, [palette]);
  
  // Forçar atualização do preview quando cores mudarem
  useEffect(() => {
    setPreviewRefresh(prev => prev + 1);
  }, [palette, activeMode]);

  // Aplicar cores do modo ativo apenas quando explicitamente solicitado
  // Removido useEffect automático que estava causando mudanças indesejadas
  
  // Função para alternar modo de configuração
  const setConfigurationMode = (mode: 'light' | 'dark') => {
    // Apenas alternar o tema visual (light/dark) sem modificar cores
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apenas atualizar o estado do modo ativo
    setActiveMode(mode);
    
    // Toast informativo
    toast.success(`🎨 Modo ${mode === 'dark' ? 'Dark' : 'Light'} selecionado`, {
      description: `Agora você pode configurar as cores para o modo ${mode}. Use os seletores abaixo.`
    });
  };

  // Handle color update
  const handleColorUpdate = useCallback((colorKey: string, newHex: string) => {
    updateColor(colorKey, newHex, activeMode);
  }, [updateColor, activeMode]);

  // Função para obter a cor real aplicada na aplicação
  const getRealAppliedColor = useCallback((colorKey: string) => {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${colorKey}`)
      .trim();
    
    if (computedValue) {
      // Se é HSL, converter para hex para exibição
      if (computedValue.includes(' ')) {
        // É HSL (ex: "173 88% 58%")
        return `hsl(${computedValue})`;
      }
    }
    
    // Fallback para a cor da paleta
    return palette[activeMode][colorKey]?.hex || '#000000';
  }, [palette, activeMode, previewRefresh]);

  // Handle file import
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPalette = JSON.parse(e.target?.result as string);
          importPalette(importedPalette);
        } catch (error) {
          toast.error('Arquivo inválido');
        }
      };
      reader.readAsText(file);
    }
  }, [importPalette]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Controle de Cores Estáticas</h2>
            <p className="text-muted-foreground">
              Gerencie as cores da aplicação com sistema estático otimizado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={previewMode ? 'default' : 'secondary'}>
            {previewMode ? 'Preview Ativo' : 'Preview Desativado'}
          </Badge>
          {pendingColorsDetected && (
            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
              Cores Aplicadas
            </Badge>
          )}
          {hasChanges && (
            <Badge variant="destructive">
              Alterações Pendentes
            </Badge>
          )}
        </div>
      </div>

      {/* Controles Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Controles Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <Label>Configurar Modo:</Label>
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={activeMode === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setConfigurationMode('light')}
                  className="rounded-md"
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </Button>
                <Button
                  variant={activeMode === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setConfigurationMode('dark')}
                  className="rounded-md"
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </Button>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Actions */}
            <Button
              onClick={() => {
                console.log('🔥 CLIQUE NO BOTÃO APLICAR CORES DETECTADO!');
                applyColors();
              }}
              disabled={isApplying}
              className={`gap-2 ${hasChanges ? 'bg-primary hover:bg-primary-hover' : 'bg-secondary hover:bg-secondary/80'}`}
              size="lg"
            >
              {isApplying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isApplying ? 'Aplicando...' : 'Aplicar Cores'}
            </Button>
            
            {hasChanges && (
              <div className="text-xs text-muted-foreground">
                ⚡ Aplicação instantânea na interface
              </div>
            )}
            
            {/* Indicador do modo ativo */}
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {activeMode === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              Configurando: <strong>{activeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
            </div>

            <Button
              onClick={exportPalette}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              onClick={handleImportClick}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Color Editor */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-6 w-full">
          {colorCategories.map(category => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.name.toLowerCase()} value={category.name.toLowerCase()}>
                <Icon className="h-4 w-4 mr-1" />
                {category.name}
              </TabsTrigger>
            );
          })}
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </TabsTrigger>
        </TabsList>

        {colorCategories.map(category => {
          const Icon = category.icon;
          return (
            <TabsContent key={category.name.toLowerCase()} value={category.name.toLowerCase()}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.name} Colors - {activeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {category.colors
                      .filter(colorKey => palette[activeMode][colorKey])
                      .map(colorKey => {
                        const color = palette[activeMode][colorKey];
                        return (
                          <div key={colorKey} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium">{color.name}</Label>
                              <div className="text-xs text-muted-foreground font-mono">
                                --{colorKey}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Color Preview - Agora clicável como seletor */}
                              <div className="relative">
                                <div
                                  className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0 cursor-pointer hover:border-primary transition-colors"
                                  style={{ 
                                    backgroundColor: getRealAppliedColor(colorKey)
                                  }}
                                  title={`Clique para alterar cor | Atual: ${getRealAppliedColor(colorKey)} | CSS: var(--${colorKey})`}
                                  onClick={() => {
                                    // Criar input temporário para seleção de cor
                                    const colorInput = document.createElement('input');
                                    colorInput.type = 'color';
                                    colorInput.value = color.hex;
                                    colorInput.style.position = 'absolute';
                                    colorInput.style.opacity = '0';
                                    colorInput.style.pointerEvents = 'none';
                                    
                                    colorInput.addEventListener('change', (e) => {
                                      const newColor = (e.target as HTMLInputElement).value;
                                      console.log('🎨 COR SELECIONADA:', newColor);
                                      handleColorUpdate(colorKey, newColor);
                                      document.body.removeChild(colorInput);
                                    });
                                    
                                    document.body.appendChild(colorInput);
                                    colorInput.click();
                                  }}
                                />
                              </div>
                              
                              {/* Color Input - CAMPOS DE TEXTO */}
                              <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <Input
                                    value={color.hex}
                                    onChange={(e) => {
                                      console.log('🎨 INPUT HEX:', e.target.value);
                                      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                        handleColorUpdate(colorKey, e.target.value);
                                      }
                                    }}
                                    placeholder="#FF0000"
                                    className="font-mono text-xs"
                                    maxLength={7}
                                  />
                                  <Input
                                    value={color.hsl}
                                    readOnly
                                    placeholder="HSL"
                                    className="font-mono text-xs bg-muted"
                                    title={`HSL: ${color.hsl}`}
                                  />
                                </div>
                                
                                {/* Botão de teste direto */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log('💪 TESTE DIRETO DA COR:', color.hex);
                                    // Forçar aplicação imediata
                                    document.documentElement.style.setProperty(`--${colorKey}`, color.hsl, 'important');
                                    if (colorKey === 'primary') {
                                      const elements = document.querySelectorAll('.bg-primary, [class*="bg-primary"]');
                                      elements.forEach(el => {
                                        el.style.setProperty('background-color', color.hex, 'important');
                                      });
                                      console.log(`✅ Aplicado ${color.hex} em ${elements.length} elementos`);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  💪 Testar Agora
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {color.description}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview dos Componentes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualize como as cores se aplicam aos componentes da aplicação em tempo real.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPersistenceDemo />
              <ColorPreviewDemo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced System Info */}
      <Alert className={pendingColorsDetected ? "border-blue-200 bg-blue-50 dark:bg-blue-950" : hasChanges ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-green-200 bg-green-50 dark:bg-green-950"}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema de Cores Estáticas:</strong> 
          {pendingColorsDetected ? (
            <span className="text-blue-700 dark:text-blue-300">
              ✅ Cores personalizadas aplicadas temporariamente! 
              <br />Para torná-las <strong>permanentes</strong>, copie o código CSS do modal e substitua o arquivo <code>src/styles/static-colors.css</code>.
            </span>
          ) : hasChanges ? (
            <span className="text-orange-700 dark:text-orange-300">
              ⚠️ Você tem alterações não aplicadas. 
              <br />Clique em <strong>"Aplicar Cores"</strong> para ver as mudanças na interface.
            </span>
          ) : (
            <span className="text-green-700 dark:text-green-300">
              ✅ Sistema pronto! Altere as cores usando os seletores acima e clique em "Aplicar Cores".
              <br />As cores são aplicadas instantaneamente na interface e podem ser tornadas permanentes.
            </span>
          )}
        </AlertDescription>
      </Alert>
      
      {/* Quick Start Guide */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Info className="h-5 w-5" />
            🚀 Como Alterar a Cor Primária
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Vá para a aba "Core"</strong> (cores principais)</li>
            <li><strong>Clique no seletor de cor</strong> ao lado de "Primary"</li>
            <li><strong>Escolha sua cor</strong> ou digite o código HEX</li>
            <li><strong>Clique em "Aplicar Cores"</strong> para ver na interface</li>
            <li><strong>Para tornar permanente:</strong> Copie o código CSS do modal e substitua o arquivo <code>src/styles/static-colors.css</code></li>
          </ol>
          <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-xs font-medium">
              💡 <strong>Dica:</strong> Use o "Preview em Tempo Real" para ver as mudanças enquanto edita!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* CSS Code Modal */}
      <Dialog open={showCSSModal} onOpenChange={setShowCSSModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              🎨 Código CSS Atualizado - Copie e Substitua
            </DialogTitle>
            <DialogDescription>
              Siga o passo a passo abaixo para alterar a cor primária permanentemente. É necessário atualizar <strong>AMBOS</strong> os arquivos para garantir que as cores sejam aplicadas corretamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[calc(95vh-120px)] overflow-y-auto pr-2">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>📋 Processo Completo (2 arquivos):</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Copie o código da <strong>Aba 1</strong>: static-colors.css</li>
                  <li>Copie o código da <strong>Aba 2</strong>: index.css</li>
                  <li>Substitua os arquivos com Ctrl+A + Ctrl+V</li>
                  <li>Recarregue com Ctrl+Shift+R</li>
                  <li>✅ Cor primária deve mudar e persistir!</li>
                </ol>
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs">
                  ⚠️ <strong>Importante:</strong> Ambos os arquivos devem ter as mesmas cores primárias!
                </div>
              </AlertDescription>
            </Alert>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="static-colors" className="gap-2">
                  🎨 static-colors.css
                </TabsTrigger>
                <TabsTrigger value="index-css" className="gap-2">
                  ⚙️ index.css
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="static-colors" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">src/styles/static-colors.css</Label>
                    <p className="text-xs text-muted-foreground mt-1">Substitua TODO o conteúdo do arquivo</p>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      navigator.clipboard.writeText(staticColorsCode);
                      toast.success('📋 Código static-colors.css copiado! Use Ctrl+A + Ctrl+V para substituir.');
                    }}
                    className="gap-1 bg-primary hover:bg-primary-hover"
                  >
                    <Download className="h-3 w-3" />
                    Copiar Código
                  </Button>
                </div>
                
                <Textarea
                  value={staticColorsCode}
                  readOnly
                  className="font-mono text-xs min-h-[400px] max-h-[400px] overflow-auto bg-muted resize-none"
                  placeholder="Código CSS será gerado aqui..."
                />
              </TabsContent>
              
              <TabsContent value="index-css" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">src/index.css</Label>
                    <p className="text-xs text-muted-foreground mt-1">Substitua TODO o conteúdo do arquivo</p>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      navigator.clipboard.writeText(indexCSSCode);
                      toast.success('📋 Código index.css copiado! Use Ctrl+A + Ctrl+V para substituir.');
                    }}
                    className="gap-1 bg-primary hover:bg-primary-hover"
                  >
                    <Download className="h-3 w-3" />
                    Copiar Código
                  </Button>
                </div>
                
                <Textarea
                  value={indexCSSCode}
                  readOnly
                  className="font-mono text-xs min-h-[400px] max-h-[400px] overflow-auto bg-muted resize-none"
                  placeholder="Código CSS será gerado aqui..."
                />
              </TabsContent>
            </Tabs>
            
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <Check className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Resultado esperado:</strong> Após seguir TODOS os passos (ambos os arquivos), a cor primária ficará aplicada permanentemente e persistirá após qualquer reload da aplicação.
                <div className="mt-2 text-xs">
                  📝 <strong>Lembre-se:</strong> Consulte o arquivo <code>ui.md</code> na raiz do projeto para instruções detalhadas.
                </div>
              </AlertDescription>
            </Alert>
            
            {/* Botão para fechar */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setShowCSSModal(false)}
                variant="outline"
                className="gap-2"
              >
                ✅ Entendi, vou seguir os passos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};