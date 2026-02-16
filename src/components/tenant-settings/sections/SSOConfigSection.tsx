import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Lock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SsoConfigSectionProps {
  tenantId: string;
}

export const SsoConfigSection: React.FC<SsoConfigSectionProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState(false);
  const [ssoSettings, setSsoSettings] = useState<{
    provider: 'azure' | 'google' | 'okta' | 'custom';
    domain: string;
    clientId: string;
    tenantIdAzure?: string;
    metadataUrl?: string; // For Custom SAML
    enabled: boolean;
  }>({
    provider: 'azure',
    domain: '',
    clientId: '',
    tenantIdAzure: '',
    metadataUrl: '',
    enabled: false
  });

  // Mock fetching existing settings
  useEffect(() => {
    // In a real implementation, fetch from 'tenant_sso_settings' table
    // checkForExistingSso(); 
  }, [tenantId]);

  const handleSave = async () => {
    if (!ssoSettings.domain) {
      toast.error("O domínio corporativo é obrigatório (ex: empresa.com)");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to save settings
      // const { error } = await supabase.from('tenant_sso_settings').upsert({ ... });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      toast.success("Configuração SSO salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configuração SSO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Single Sign-On (SSO) Enterprise
          </CardTitle>
          <CardDescription>
            Permita que seus colaboradores façam login usando o provedor de identidade corporativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-background/80 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Como funciona</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              Após configurar, usuários com e-mail <strong>@{ssoSettings.domain || 'sua-empresa.com'}</strong> serão redirecionados automaticamente para o login da sua organização.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div>
                <Label className="text-base font-semibold">Habilitar SSO</Label>
                <p className="text-sm text-muted-foreground">Ativar login federado para este tenant</p>
              </div>
              <Switch
                checked={ssoSettings.enabled}
                onCheckedChange={(c) => setSsoSettings({ ...ssoSettings, enabled: c })}
              />
            </div>

            {/* Domain Configuration */}
            <div className="grid gap-2">
              <Label>Domínio Corporativo</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ex: acme.com"
                  className="pl-9"
                  value={ssoSettings.domain}
                  onChange={e => setSsoSettings({ ...ssoSettings, domain: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Todos os usuários com este domínio de e-mail serão forçados a usar SSO.</p>
            </div>

            {/* Provider Selection */}
            <div className="grid gap-2">
              <Label>Provedor de Identidade</Label>
              <Select
                value={ssoSettings.provider}
                onValueChange={(v: any) => setSsoSettings({ ...ssoSettings, provider: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azure">Microsoft Azure AD (Entra ID)</SelectItem>
                  <SelectItem value="google">Google Workspace</SelectItem>
                  <SelectItem value="okta">Okta</SelectItem>
                  <SelectItem value="custom">SAML 2.0 Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Fields based on Provider */}
            {ssoSettings.provider === 'azure' && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 animate-in fade-in slide-in-from-left-2">
                <div className="grid gap-2">
                  <Label>Azure Tenant ID</Label>
                  <Input
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={ssoSettings.tenantIdAzure}
                    onChange={e => setSsoSettings({ ...ssoSettings, tenantIdAzure: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Client ID (App ID)</Label>
                  <Input
                    placeholder="Application ID do Azure"
                    value={ssoSettings.clientId}
                    onChange={e => setSsoSettings({ ...ssoSettings, clientId: e.target.value })}
                  />
                </div>
              </div>
            )}

            {ssoSettings.provider === 'google' && (
              <div className="space-y-4 border-l-2 border-red-500 pl-4 animate-in fade-in slide-in-from-left-2">
                <div className="grid gap-2">
                  <Label>Client ID (Google Cloud Console)</Label>
                  <Input
                    placeholder="xxx.apps.googleusercontent.com"
                    value={ssoSettings.clientId}
                    onChange={e => setSsoSettings({ ...ssoSettings, clientId: e.target.value })}
                  />
                </div>
              </div>
            )}

            {ssoSettings.provider === 'custom' && (
              <div className="space-y-4 border-l-2 border-purple-500 pl-4 animate-in fade-in slide-in-from-left-2">
                <div className="grid gap-2">
                  <Label>Metadata URL (XML)</Label>
                  <Input
                    placeholder="https://idp.example.com/metadata.xml"
                    value={ssoSettings.metadataUrl}
                    onChange={e => setSsoSettings({ ...ssoSettings, metadataUrl: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};