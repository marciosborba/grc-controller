
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw } from 'lucide-react';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface ColorSelectorProps {
  palette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  onGeneratePalette: () => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ palette, onPaletteChange, onGeneratePalette }) => {
  const handleColorChange = (colorName: keyof ColorPalette, value: string) => {
    onPaletteChange({ ...palette, [colorName]: value });
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
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.primary }}></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.secondary }}></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.tertiary }}></div>
          </div>
          <Button variant="outline" onClick={onGeneratePalette}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Gerar Nova Paleta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
