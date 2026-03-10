import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Mail, Key } from 'lucide-react';

interface MFAConfigSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const MFAConfigSection: React.FC<MFAConfigSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [mfaSettings, setMfaSettings] = useState({
    required: false,
    methods: {
      totp: true,
      sms: false,
      email: true
    },
    gracePeriod: 7
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticação Multifator (MFA)
        </CardTitle>
        <CardDescription>
          Configure autenticação de dois fatores para maior segurança
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="mfa-required">Exigir MFA para todos os usuários</Label>
            <p className="text-sm text-muted-foreground">
              Força todos os usuários a configurarem MFA
            </p>
          </div>
          <Switch
            id="mfa-required"
            checked={mfaSettings.required}
            onCheckedChange={(checked) => {
              setMfaSettings({...mfaSettings, required: checked});
              onSettingsChange();
            }}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Métodos Disponíveis</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Aplicativo Autenticador (TOTP)</div>
                  <div className="text-sm text-muted-foreground">Google Authenticator, Authy, etc.</div>
                </div>
              </div>
              <Switch
                checked={mfaSettings.methods.totp}
                onCheckedChange={(checked) => {
                  setMfaSettings({
                    ...mfaSettings,
                    methods: {...mfaSettings.methods, totp: checked}
                  });
                  onSettingsChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Código por Email</div>
                  <div className="text-sm text-muted-foreground">Código enviado por email</div>
                </div>
              </div>
              <Switch
                checked={mfaSettings.methods.email}
                onCheckedChange={(checked) => {
                  setMfaSettings({
                    ...mfaSettings,
                    methods: {...mfaSettings.methods, email: checked}
                  });
                  onSettingsChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium">SMS</div>
                  <div className="text-sm text-muted-foreground">Código enviado por SMS</div>
                </div>
              </div>
              <Badge variant="outline">Em breve</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};