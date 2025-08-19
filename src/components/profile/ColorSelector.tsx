import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  RefreshCw, 
  Save, 
  Sparkles, 
  Eye, 
  Copy, 
  Check,
  Shuffle,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface ColorSelectorProps {
  palette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  onGeneratePalette: () => void;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

// Paletas predefinidas seguindo o padrão da aplicação
const PREDEFINED_PALETTES = [
  {
    name: 'Azul Corporativo',
    colors: { primary: '#3b82f6', secondary: '#1e40af', tertiary: '#60a5fa' }
  },
  {
    name: 'Verde Natureza',
    colors: { primary: '#10b981', secondary: '#059669', tertiary: '#34d399' }
  },
  {
    name: 'Roxo Criativo',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', tertiary: '#a78bfa' }
  },
  {
    name: 'Laranja Energia',
    colors: { primary: '#f97316', secondary: '#ea580c', tertiary: '#fb923c' }
  },
  {
    name: 'Rosa Moderno',
    colors: { primary: '#ec4899', secondary: '#db2777', tertiary: '#f472b6' }
  },
  {
    name: 'Ciano Tech',
    colors: { primary: '#06b6d4', secondary: '#0891b2', tertiary: '#22d3ee' }
  }
];

// Utilitário para converter hex para HSL
const hexToHsl = (hex: string): string => {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return '0 0% 0%';
  }
};

export const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  palette, 
  onPaletteChange, 
  onGeneratePalette, 
  onSave, 
  saving = false 
}) => {
  const { toast } = useToast();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorName: keyof ColorPalette, value: string) => {
    onPaletteChange({ ...palette, [colorName]: value });
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave();
        toast({
          title: 'Sucesso',
          description: 'Paleta de cores salva com sucesso',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao salvar a paleta de cores',
          variant: 'destructive'
        });
      }
    }
  };

  const copyColorToClipboard = async (color: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(colorName);
      setTimeout(() => setCopiedColor(null), 2000);
      toast({
        title: 'Copiado!',
        description: `Cor ${colorName} copiada: ${color}`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a cor',
        variant: 'destructive'
      });
    }
  };

  const applyPredefinedPalette = (predefinedPalette: typeof PREDEFINED_PALETTES[0]) => {
    onPaletteChange(predefinedPalette.colors);
    toast({
      title: 'Paleta Aplicada',
      description: `Paleta "${predefinedPalette.name}" aplicada com sucesso`,
    });
  };

  const exportPalette = () => {
    const paletteData = {
      name: 'Minha Paleta Personalizada',
      colors: palette,
      hsl: {
        primary: hexToHsl(palette.primary),
        secondary: hexToHsl(palette.secondary),
        tertiary: hexToHsl(palette.tertiary)
      },
      exported_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `paleta-cores-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: 'Exportado!',
      description: 'Paleta de cores exportada com sucesso',
    });
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <span>Paleta de Cores Personalizada</span>
            </CardTitle>
            <CardDescription>
              Customize as cores da interface de acordo com suas preferências
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? 'Ocultar' : 'Preview'}
            </Button>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Personalizado
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Cores Principal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Cores Principais</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(palette).map(([colorName, colorValue]) => (
              <div key={colorName} className="space-y-3">
                <Label htmlFor={`${colorName}-color`} className="text-sm font-medium capitalize">
                  {colorName === 'primary' ? 'Primária' : 
                   colorName === 'secondary' ? 'Secundária' : 'Terciária'}
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        id={`${colorName}-color`}
                        type="color"
                        value={colorValue}
                        onChange={(e) => handleColorChange(colorName as keyof ColorPalette, e.target.value)}
                        className="p-1 h-12 w-16 border-2 border-border rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={colorValue}
                        onChange={(e) => handleColorChange(colorName as keyof ColorPalette, e.target.value)}
                        className="h-12 font-mono text-sm"
                        placeholder="#000000"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyColorToClipboard(colorValue, colorName)}
                      className="h-12 px-3"
                    >
                      {copiedColor === colorName ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    HSL: {hexToHsl(colorValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview da Paleta */}
        {previewMode && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Preview da Paleta</Label>
              </div>
              <div className="p-6 rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(palette).map(([colorName, colorValue]) => (
                    <div key={colorName} className="text-center space-y-2">
                      <div 
                        className="w-full h-20 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: colorValue }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium capitalize">
                          {colorName === 'primary' ? 'Primária' : 
                           colorName === 'secondary' ? 'Secundária' : 'Terciária'}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">{colorValue}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: palette.primary + '10' }}>
                  <h4 className="font-medium" style={{ color: palette.primary }}>Exemplo de Aplicação</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta é uma demonstração de como as cores selecionadas aparecerão na interface.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <div 
                      className="px-3 py-1 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: palette.primary }}
                    >
                      Botão Primário
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: palette.secondary }}
                    >
                      Botão Secundário
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: palette.tertiary }}
                    >
                      Destaque
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Paletas Predefinidas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Paletas Predefinidas</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PREDEFINED_PALETTES.map((predefinedPalette, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => applyPredefinedPalette(predefinedPalette)}
                className="h-auto p-3 flex flex-col items-start gap-2 hover:border-primary/50"
              >
                <div className="flex gap-1 w-full">
                  {Object.values(predefinedPalette.colors).map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium">{predefinedPalette.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Object.values(palette).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Paleta atual
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportPalette}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              variant="outline" 
              onClick={onGeneratePalette}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Gerar Aleatória
            </Button>
            {onSave && (
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Paleta
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};