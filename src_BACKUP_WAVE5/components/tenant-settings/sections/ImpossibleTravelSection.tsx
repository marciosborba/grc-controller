import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface ImpossibleTravelSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const ImpossibleTravelSection: React.FC<ImpossibleTravelSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [impossibleTravelEnabled, setImpossibleTravelEnabled] = useState(true);
  const [settings, setSettings] = useState({
    maxSpeedKmh: 1000,
    timeWindowMinutes: 30,
    alertOnDetection: true,
    blockSuspiciousLogin: false,
    trustedCountries: ['BR', 'US']
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Detecção de Viagem Impossível
        </CardTitle>
        <CardDescription>
          Detecte logins suspeitos baseados em localização geográfica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="impossible-travel">Habilitar detecção de viagem impossível</Label>
            <p className="text-sm text-muted-foreground">
              Monitora logins de localizações geograficamente impossíveis
            </p>
          </div>
          <Switch
            id="impossible-travel"
            checked={impossibleTravelEnabled}
            onCheckedChange={(checked) => {
              setImpossibleTravelEnabled(checked);
              onSettingsChange();
            }}
          />
        </div>

        {impossibleTravelEnabled && (
          <div className="space-y-4">
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                O sistema calcula a velocidade necessária entre dois logins consecutivos.
                Se exceder os limites configurados, um alerta será gerado.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-speed">Velocidade máxima (km/h)</Label>
                <Input
                  id="max-speed"
                  type="number"
                  value={settings.maxSpeedKmh}
                  onChange={(e) => {
                    setSettings({...settings, maxSpeedKmh: parseInt(e.target.value)});
                    onSettingsChange();
                  }}
                  min={100}
                  max={2000}
                />
                <p className="text-xs text-muted-foreground">
                  Velocidade comercial de avião: ~900 km/h
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-window">Janela de tempo (minutos)</Label>
                <Input
                  id="time-window"
                  type="number"
                  value={settings.timeWindowMinutes}
                  onChange={(e) => {
                    setSettings({...settings, timeWindowMinutes: parseInt(e.target.value)});
                    onSettingsChange();
                  }}
                  min={5}
                  max={1440}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo mínimo entre logins para análise
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="alert-detection">Alertar quando detectado</Label>
                <Switch
                  id="alert-detection"
                  checked={settings.alertOnDetection}
                  onCheckedChange={(checked) => {
                    setSettings({...settings, alertOnDetection: checked});
                    onSettingsChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="block-login">Bloquear login suspeito</Label>
                  <p className="text-xs text-muted-foreground">
                    Requer verificação adicional para logins suspeitos
                  </p>
                </div>
                <Switch
                  id="block-login"
                  checked={settings.blockSuspiciousLogin}
                  onCheckedChange={(checked) => {
                    setSettings({...settings, blockSuspiciousLogin: checked});
                    onSettingsChange();
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Países Confiáveis</Label>
              <div className="flex gap-2 flex-wrap">
                {settings.trustedCountries.map(country => (
                  <Badge key={country} variant="outline">
                    {country === 'BR' ? 'Brasil' : country === 'US' ? 'Estados Unidos' : country}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Logins entre países confiáveis têm tolerância maior
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};