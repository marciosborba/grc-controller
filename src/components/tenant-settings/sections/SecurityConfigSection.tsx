import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Key,
  Lock,
  AlertTriangle,
  Clock,
  Eye,
  Laptop
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiresDays: number;
    preventReuse: number;
  };
  sessionSecurity: {
    timeoutMinutes: number;
    maxConcurrentSessions: number;
    requireMFA: boolean;
    forceLogoutOnPasswordChange: boolean;
  };
  accessControl: {
    failedLoginLimit: number;
    lockoutDurationMinutes: number;
    ipWhitelisting: boolean;
    allowedIPs: string[];
    requireDeviceApproval: boolean;
    allowTrustedDevices: boolean; // Novo campo
  };
  monitoring: {
    logAllActivities: boolean;
    alertOnSuspicious: boolean;
    retentionDays: number;
    realTimeAlerts: boolean;
  };
}

interface SecurityConfigSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const SecurityConfigSection: React.FC<SecurityConfigSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiresDays: 90,
      preventReuse: 5
    },
    sessionSecurity: {
      timeoutMinutes: 30,
      maxConcurrentSessions: 3,
      requireMFA: false,
      forceLogoutOnPasswordChange: true
    },
    accessControl: {
      failedLoginLimit: 5,
      lockoutDurationMinutes: 15,
      ipWhitelisting: false,
      allowedIPs: [],
      requireDeviceApproval: false,
      allowTrustedDevices: false
    },
    monitoring: {
      logAllActivities: true,
      alertOnSuspicious: true,
      retentionDays: 365,
      realTimeAlerts: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [newIP, setNewIP] = useState('');

  useEffect(() => {
    if (tenantId) {
      loadSecuritySettings();
    }
  }, [tenantId]);

  useEffect(() => {
    calculateSecurityScore();
  }, [settings]);

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      if (data?.settings?.security) {
        // Merge with default to ensure new fields are present
        setSettings(prev => ({
          ...prev,
          ...data.settings.security,
          accessControl: {
            ...prev.accessControl,
            ...data.settings.security.accessControl
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
      toast.error('Erro ao carregar configurações de segurança');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSecurityScore = () => {
    let score = 0;
    const maxScore = 100;

    // Política de senhas (30 pontos)
    if (settings.passwordPolicy.minLength >= 8) score += 5;
    if (settings.passwordPolicy.minLength >= 12) score += 5;
    if (settings.passwordPolicy.requireUppercase) score += 3;
    if (settings.passwordPolicy.requireLowercase) score += 3;
    if (settings.passwordPolicy.requireNumbers) score += 3;
    if (settings.passwordPolicy.requireSpecialChars) score += 5;
    if (settings.passwordPolicy.expiresDays <= 90) score += 3;
    if (settings.passwordPolicy.preventReuse >= 5) score += 3;

    // Segurança de sessão (25 pontos)
    if (settings.sessionSecurity.timeoutMinutes <= 30) score += 5;
    if (settings.sessionSecurity.maxConcurrentSessions <= 3) score += 5;
    if (settings.sessionSecurity.requireMFA) score += 10;
    if (settings.sessionSecurity.forceLogoutOnPasswordChange) score += 5;

    // Controle de acesso (25 pontos)
    if (settings.accessControl.failedLoginLimit <= 5) score += 5;
    if (settings.accessControl.lockoutDurationMinutes >= 15) score += 5;
    if (settings.accessControl.ipWhitelisting && settings.accessControl.allowedIPs.length > 0) score += 10;
    if (settings.accessControl.requireDeviceApproval) score += 5;

    // Monitoramento (20 pontos)
    if (settings.monitoring.logAllActivities) score += 5;
    if (settings.monitoring.alertOnSuspicious) score += 5;
    if (settings.monitoring.retentionDays >= 365) score += 5;
    if (settings.monitoring.realTimeAlerts) score += 5;

    setSecurityScore(Math.min(score, maxScore));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);

      // Get current settings first to preserve other sections
      const { data: currentData } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single();

      const currentSettings = currentData?.settings || {};

      const updatedSettings = {
        ...currentSettings,
        security: settings // Save under 'security' key
      };

      const { error } = await supabase
        .from('tenants')
        .update({ settings: updatedSettings })
        .eq('id', tenantId);

      if (error) throw error;

      onSettingsChange();
      toast.success('Configurações de segurança salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações de segurança');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePasswordPolicy = (field: keyof SecuritySettings['passwordPolicy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value
      }
    }));
  };

  const updateSessionSecurity = (field: keyof SecuritySettings['sessionSecurity'], value: any) => {
    setSettings(prev => ({
      ...prev,
      sessionSecurity: {
        ...prev.sessionSecurity,
        [field]: value
      }
    }));
  };

  const updateAccessControl = (field: keyof SecuritySettings['accessControl'], value: any) => {
    setSettings(prev => ({
      ...prev,
      accessControl: {
        ...prev.accessControl,
        [field]: value
      }
    }));
  };

  const updateMonitoring = (field: keyof SecuritySettings['monitoring'], value: any) => {
    setSettings(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        [field]: value
      }
    }));
  };

  const addAllowedIP = () => {
    if (!newIP.trim()) return;

    // Validação básica de IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(newIP.trim())) {
      toast.error('Formato de IP inválido');
      return;
    }

    if (settings.accessControl.allowedIPs.includes(newIP.trim())) {
      toast.error('IP já está na lista');
      return;
    }

    updateAccessControl('allowedIPs', [...settings.accessControl.allowedIPs, newIP.trim()]);
    setNewIP('');
    toast.success('IP adicionado à lista branca');
  };

  const removeAllowedIP = (ip: string) => {
    updateAccessControl('allowedIPs', settings.accessControl.allowedIPs.filter(allowedIP => allowedIP !== ip));
    toast.success('IP removido da lista branca');
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Score de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Score de Segurança da Organização
          </CardTitle>
          <CardDescription>
            Avaliação baseada nas configurações de segurança implementadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${getSecurityScoreBg(securityScore)}`}>
                <Shield className={`h-8 w-8 ${getSecurityScoreColor(securityScore)}`} />
              </div>
              <div>
                <div className={`text-3xl font-bold ${getSecurityScoreColor(securityScore)}`}>
                  {String(securityScore)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {securityScore >= 80 ? 'Excelente' :
                    securityScore >= 60 ? 'Bom' : 'Precisa melhorar'}
                </div>
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
          <Progress value={Number(securityScore)} className="h-3" />

          {securityScore < 80 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendação:</strong> Considere habilitar MFA e configurar lista branca de IPs para melhorar a segurança.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Política de Senhas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Política de Senhas
            </CardTitle>
            <CardDescription>
              Configure os requisitos de senha para usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minLength">Comprimento Mínimo</Label>
              <Input
                id="minLength"
                type="number"
                value={settings.passwordPolicy.minLength}
                onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                min={6}
                max={50}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireUppercase">Exigir Maiúsculas</Label>
                <Switch
                  id="requireUppercase"
                  checked={settings.passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requireLowercase">Exigir Minúsculas</Label>
                <Switch
                  id="requireLowercase"
                  checked={settings.passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requireNumbers">Exigir Números</Label>
                <Switch
                  id="requireNumbers"
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requireSpecialChars">Exigir Caracteres Especiais</Label>
                <Switch
                  id="requireSpecialChars"
                  checked={settings.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresDays">Expiração (dias)</Label>
              <Input
                id="expiresDays"
                type="number"
                value={settings.passwordPolicy.expiresDays}
                onChange={(e) => updatePasswordPolicy('expiresDays', parseInt(e.target.value))}
                min={30}
                max={365}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preventReuse">Prevenir Reutilização (últimas senhas)</Label>
              <Input
                id="preventReuse"
                type="number"
                value={settings.passwordPolicy.preventReuse}
                onChange={(e) => updatePasswordPolicy('preventReuse', parseInt(e.target.value))}
                min={0}
                max={20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança de Sessão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Segurança de Sessão
            </CardTitle>
            <CardDescription>
              Configure o comportamento das sessões de usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeoutMinutes">Timeout da Sessão (minutos)</Label>
              <Input
                id="timeoutMinutes"
                type="number"
                value={settings.sessionSecurity.timeoutMinutes}
                onChange={(e) => updateSessionSecurity('timeoutMinutes', parseInt(e.target.value))}
                min={5}
                max={480}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSessions">Máximo de Sessões Simultâneas</Label>
              <Input
                id="maxSessions"
                type="number"
                value={settings.sessionSecurity.maxConcurrentSessions}
                onChange={(e) => updateSessionSecurity('maxConcurrentSessions', parseInt(e.target.value))}
                min={1}
                max={10}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireMFA">Exigir Autenticação Multifator</Label>
                <p className="text-xs text-muted-foreground">Recomendado para maior segurança</p>
              </div>
              <Switch
                id="requireMFA"
                checked={settings.sessionSecurity.requireMFA}
                onCheckedChange={(checked) => updateSessionSecurity('requireMFA', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="forceLogout">Forçar Logout ao Alterar Senha</Label>
                <p className="text-xs text-muted-foreground">Encerra todas as sessões ativas</p>
              </div>
              <Switch
                id="forceLogout"
                checked={settings.sessionSecurity.forceLogoutOnPasswordChange}
                onCheckedChange={(checked) => updateSessionSecurity('forceLogoutOnPasswordChange', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Controle de Acesso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Controle de Acesso
            </CardTitle>
            <CardDescription>
              Configure restrições de acesso e bloqueios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="failedLoginLimit">Limite de Tentativas de Login</Label>
              <Input
                id="failedLoginLimit"
                type="number"
                value={settings.accessControl.failedLoginLimit}
                onChange={(e) => updateAccessControl('failedLoginLimit', parseInt(e.target.value))}
                min={3}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Duração do Bloqueio (minutos)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={settings.accessControl.lockoutDurationMinutes}
                onChange={(e) => updateAccessControl('lockoutDurationMinutes', parseInt(e.target.value))}
                min={5}
                max={1440}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label htmlFor="requireDeviceApproval">Exigir Aprovação de Dispositivos</Label>
                <p className="text-xs text-muted-foreground">Novos dispositivos precisam ser aprovados</p>
              </div>
              <Switch
                id="requireDeviceApproval"
                checked={settings.accessControl.requireDeviceApproval}
                onCheckedChange={(checked) => updateAccessControl('requireDeviceApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label htmlFor="allowTrustedDevices">Permitir Dispositivos Confiáveis</Label>
                <p className="text-xs text-muted-foreground">
                  Usuários podem pular MFA por 90 dias em dispositivos confiáveis
                </p>
              </div>
              <Switch
                id="allowTrustedDevices"
                checked={settings.accessControl.allowTrustedDevices}
                onCheckedChange={(checked) => updateAccessControl('allowTrustedDevices', checked)}
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ipWhitelisting">Lista Branca de IPs</Label>
                  <p className="text-xs text-muted-foreground">Restringir acesso a IPs específicos</p>
                </div>
                <Switch
                  id="ipWhitelisting"
                  checked={settings.accessControl.ipWhitelisting}
                  onCheckedChange={(checked) => updateAccessControl('ipWhitelisting', checked)}
                />
              </div>

              {settings.accessControl.ipWhitelisting && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="192.168.1.0/24 ou 203.0.113.1"
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                    />
                    <Button onClick={addAllowedIP} size="sm">
                      Adicionar
                    </Button>
                  </div>

                  {settings.accessControl.allowedIPs.length > 0 && (
                    <div className="space-y-1">
                      {settings.accessControl.allowedIPs.map((ip, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-mono">{ip}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAllowedIP(ip)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monitoramento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Monitoramento e Logs
            </CardTitle>
            <CardDescription>
              Configure o monitoramento de atividades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="logAllActivities">Registrar Todas as Atividades</Label>
                <p className="text-xs text-muted-foreground">Inclui logins, alterações e acessos</p>
              </div>
              <Switch
                id="logAllActivities"
                checked={settings.monitoring.logAllActivities}
                onCheckedChange={(checked) => updateMonitoring('logAllActivities', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="alertOnSuspicious">Alertas para Atividades Suspeitas</Label>
                <p className="text-xs text-muted-foreground">Notificações automáticas</p>
              </div>
              <Switch
                id="alertOnSuspicious"
                checked={settings.monitoring.alertOnSuspicious}
                onCheckedChange={(checked) => updateMonitoring('alertOnSuspicious', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="realTimeAlerts">Alertas em Tempo Real</Label>
                <p className="text-xs text-muted-foreground">Notificações instantâneas</p>
              </div>
              <Switch
                id="realTimeAlerts"
                checked={settings.monitoring.realTimeAlerts}
                onCheckedChange={(checked) => updateMonitoring('realTimeAlerts', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retenção de Logs (dias)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={settings.monitoring.retentionDays}
                onChange={(e) => updateMonitoring('retentionDays', parseInt(e.target.value))}
                min={30}
                max={2555}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 365 dias para conformidade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};