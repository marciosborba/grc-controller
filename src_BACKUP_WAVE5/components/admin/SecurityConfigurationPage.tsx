import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  Eye, 
  Clock,
  Activity,
  Lock,
  Bell,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiresDays: number;
  };
  sessionSecurity: {
    timeoutMinutes: number;
    maxConcurrentSessions: number;
    requireMFA: boolean;
  };
  monitoring: {
    logAllActivities: boolean;
    alertOnSuspicious: boolean;
    retentionDays: number;
  };
  accessControl: {
    failedLoginLimit: number;
    lockoutDurationMinutes: number;
    ipWhitelisting: boolean;
  };
}

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  suspiciousActivities: number;
  failedLogins: number;
  lastSecurityReview: string;
  complianceScore: number;
}

const SecurityConfigurationPage = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiresDays: 90
    },
    sessionSecurity: {
      timeoutMinutes: 30,
      maxConcurrentSessions: 3,
      requireMFA: false
    },
    monitoring: {
      logAllActivities: true,
      alertOnSuspicious: true,
      retentionDays: 365
    },
    accessControl: {
      failedLoginLimit: 5,
      lockoutDurationMinutes: 15,
      ipWhitelisting: false
    }
  });

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    suspiciousActivities: 0,
    failedLogins: 0,
    lastSecurityReview: new Date().toISOString().split('T')[0],
    complianceScore: 85
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadSecurityMetrics();
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      // Carregar métricas da base de dados
      const { data: users } = await supabase.from('profiles').select('*');
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const suspiciousCount = activities?.filter(a => 
        a.action.includes('suspicious') || a.action.includes('failed')
      ).length || 0;

      const failedLogins = activities?.filter(a => 
        a.action === 'LOGIN_FAILED'
      ).length || 0;

      setMetrics(prev => ({
        ...prev,
        totalUsers: users?.length || 0,
        activeUsers: Math.floor((users?.length || 0) * 0.7), // Simulado
        suspiciousActivities: suspiciousCount,
        failedLogins
      }));
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Aqui você salvaria as configurações no backend
      // Por exemplo, em uma tabela de configurações do sistema
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
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

  const updateMonitoring = (field: keyof SecuritySettings['monitoring'], value: any) => {
    setSettings(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações de Segurança</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie políticas de segurança e monitoramento do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadSecurityMetrics}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar Métricas
          </Button>
          <Button 
            className="grc-button-primary" 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      {isSaved && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Configurações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Totais</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalUsers}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atividades Suspeitas (24h)</p>
                <p className="text-2xl font-bold text-warning">{metrics.suspiciousActivities}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tentativas de Login Falhadas</p>
                <p className="text-2xl font-bold text-danger">{metrics.failedLogins}</p>
              </div>
              <div className="p-3 bg-danger/10 rounded-lg">
                <XCircle className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score de Compliance</p>
                <p className="text-2xl font-bold text-success">{metrics.complianceScore}%</p>
                <Progress value={metrics.complianceScore} className="h-2 mt-2" />
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Policy */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary" />
              <span>Política de Senhas</span>
            </CardTitle>
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
          </CardContent>
        </Card>

        {/* Session Security */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent" />
              <span>Segurança de Sessão</span>
            </CardTitle>
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
              <Label htmlFor="requireMFA">Exigir Autenticação Multifator</Label>
              <Switch
                id="requireMFA"
                checked={settings.sessionSecurity.requireMFA}
                onCheckedChange={(checked) => updateSessionSecurity('requireMFA', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Monitoring */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-warning" />
              <span>Monitoramento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="logAllActivities">Registrar Todas as Atividades</Label>
              <Switch
                id="logAllActivities"
                checked={settings.monitoring.logAllActivities}
                onCheckedChange={(checked) => updateMonitoring('logAllActivities', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="alertOnSuspicious">Alertas para Atividades Suspeitas</Label>
              <Switch
                id="alertOnSuspicious"
                checked={settings.monitoring.alertOnSuspicious}
                onCheckedChange={(checked) => updateMonitoring('alertOnSuspicious', checked)}
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
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-danger" />
              <span>Controle de Acesso</span>
            </CardTitle>
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

            <div className="flex items-center justify-between">
              <Label htmlFor="ipWhitelisting">Lista Branca de IPs</Label>
              <Switch
                id="ipWhitelisting"
                checked={settings.accessControl.ipWhitelisting}
                onCheckedChange={(checked) => updateAccessControl('ipWhitelisting', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card className="grc-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-warning" />
            <span>Recomendações de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendação:</strong> Habilite autenticação multifator para todos os usuários administrativos para aumentar a segurança.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Manutenção:</strong> Realize revisões de segurança mensais e atualize as políticas conforme necessário.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Backup:</strong> Mantenha backups regulares dos logs de auditoria e configurações de segurança.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityConfigurationPage;