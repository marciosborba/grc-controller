
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  palette, 
  onPaletteChange, 
  onGeneratePalette, 
  onSave, 
  saving = false 
}) => {
  const { toast } = useToast();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Paleta de Cores</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primária</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primary-color"
                type="color"
                value={palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="p-1 h-10 w-14"
              />
              <Input
                value={palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secundária</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="p-1 h-10 w-14"
              />
              <Input
                value={palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tertiary-color">Terciária</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tertiary-color"
                type="color"
                value={palette.tertiary}
                onChange={(e) => handleColorChange('tertiary', e.target.value)}
                className="p-1 h-10 w-14"
              />
              <Input
                value={palette.tertiary}
                onChange={(e) => handleColorChange('tertiary', e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-border" style={{ backgroundColor: palette.primary }}></div>
            <div className="w-8 h-8 rounded-full border-2 border-border" style={{ backgroundColor: palette.secondary }}></div>
            <div className="w-8 h-8 rounded-full border-2 border-border" style={{ backgroundColor: palette.tertiary }}></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onGeneratePalette}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Nova Paleta
            </Button>
            {onSave && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Cores
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
