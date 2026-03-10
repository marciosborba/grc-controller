import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, CheckCircle, AlertTriangle, Globe, Settings } from 'lucide-react';

interface SSOConfigSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const SSOConfigSection: React.FC<SSOConfigSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [config, setConfig] = useState({
    provider: 'saml',
    entityId: '',
    ssoUrl: '',
    certificateFingerprint: '',
    attributeMapping: {
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name'
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuração SSO (Single Sign-On)
        </CardTitle>
        <CardDescription>
          Configure autenticação única para sua organização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sso-enabled">Habilitar SSO</Label>
            <p className="text-sm text-muted-foreground">
              Permite que usuários façam login usando provedor externo
            </p>
          </div>
          <Switch
            id="sso-enabled"
            checked={ssoEnabled}
            onCheckedChange={setSsoEnabled}
          />
        </div>

        {ssoEnabled && (
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Em desenvolvimento:</strong> A configuração completa de SSO estará disponível em breve.
                Entre em contato com o suporte para configuração manual.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="entity-id">Entity ID</Label>
                <Input
                  id="entity-id"
                  value={config.entityId}
                  onChange={(e) => setConfig({...config, entityId: e.target.value})}
                  placeholder="https://sua-organizacao.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sso-url">SSO URL</Label>
                <Input
                  id="sso-url"
                  value={config.ssoUrl}
                  onChange={(e) => setConfig({...config, ssoUrl: e.target.value})}
                  placeholder="https://provedor.com/sso/saml"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};