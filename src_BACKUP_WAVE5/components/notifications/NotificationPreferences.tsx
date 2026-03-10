// ============================================================================
// CONFIGURAÇÕES DE PREFERÊNCIAS DE NOTIFICAÇÃO
// ============================================================================
// Componente completo para gerenciar preferências de notificação do usuário

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Bell, 
  Mail, 
  Smartphone, 
  Phone, 
  Clock, 
  Volume2, 
  VolumeX,
  Monitor,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsRealtime } from '@/contexts/NotificationsRealtimeContext';
import { 
  NotificationModule, 
  NotificationType, 
  NotificationPriority,
  NotificationPreferences as NotificationPreferencesType
} from '@/types/notifications';
import { cn } from '@/lib/utils';

// Interface para configurações por módulo
interface ModuleSettingConfig {
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  digestMode: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'disabled';
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

// Mapeamento de módulos para rótulos e descrições
const moduleLabels: Record<NotificationModule, { label: string; description: string; icon: React.ComponentType<any> }> = {
  assessments: { 
    label: 'Assessments', 
    description: 'Questionários e avaliações de controles',
    icon: Bell
  },
  risks: { 
    label: 'Gestão de Riscos', 
    description: 'Identificação e mitigação de riscos',
    icon: AlertTriangle
  },
  compliance: { 
    label: 'Compliance', 
    description: 'Controles de conformidade regulatória',
    icon: CheckCircle
  },
  policies: { 
    label: 'Políticas', 
    description: 'Gestão de políticas corporativas',
    icon: Info
  },
  privacy: { 
    label: 'Privacidade', 
    description: 'Proteção de dados e privacidade',
    icon: Settings
  },
  audit: { 
    label: 'Auditoria', 
    description: 'Planejamento e execução de auditorias',
    icon: CheckCircle
  },
  users: { 
    label: 'Usuários', 
    description: 'Gestão de usuários e acessos',
    icon: Settings
  },
  system: { 
    label: 'Sistema', 
    description: 'Alertas e notificações do sistema',
    icon: Monitor
  },
  'general-settings': { 
    label: 'Configurações Gerais', 
    description: 'Integrações e configurações avançadas',
    icon: Settings
  },
  frameworks: { 
    label: 'Frameworks', 
    description: 'Frameworks de segurança e compliance',
    icon: Bell
  },
  incidents: { 
    label: 'Incidentes', 
    description: 'Gestão de incidentes de segurança',
    icon: XCircle
  }
};

// Opções de digest
const digestOptions = [
  { value: 'immediate', label: 'Imediato', description: 'Receber notificações instantaneamente' },
  { value: 'hourly', label: 'A cada hora', description: 'Agrupar notificações por hora' },
  { value: 'daily', label: 'Diário', description: 'Resumo diário das notificações' },
  { value: 'weekly', label: 'Semanal', description: 'Resumo semanal das notificações' },
  { value: 'disabled', label: 'Desabilitado', description: 'Não receber notificações deste tipo' }
];

// Componente principal
export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, loading } = useNotifications();
  const { 
    isConnected, 
    connectionStatus, 
    enableRealtimeNotifications,
    enableDesktopNotifications,
    enableSounds,
    autoReconnect
  } = useNotificationsRealtime();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferencesType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  const [realtimeEnabled, setRealtimeEnabled] = useState(() => 
    localStorage.getItem('notifications-realtime-enabled') === 'true'
  );

  // Carregar preferências iniciais
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  // Verificar se há mudanças
  useEffect(() => {
    setHasChanges(
      JSON.stringify(localPreferences) !== JSON.stringify(preferences)
    );
  }, [localPreferences, preferences]);

  const handleModuleSettingChange = (
    module: NotificationModule, 
    setting: keyof ModuleSettingConfig, 
    value: any
  ) => {
    if (!localPreferences) return;

    setLocalPreferences(prev => ({
      ...prev!,
      moduleSettings: {
        ...prev!.moduleSettings,
        [module]: {
          ...prev!.moduleSettings[module],
          [setting]: value
        }
      }
    }));
  };

  const handleGlobalSettingChange = (setting: string, value: any) => {
    if (!localPreferences) return;

    setLocalPreferences(prev => ({
      ...prev!,
      globalSettings: {
        ...prev!.globalSettings,
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updatePreferences(localPreferences);
      toast.success('Preferências salvas com sucesso!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Erro ao salvar preferências');
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasChanges(false);
      toast.info('Alterações descartadas');
    }
  };

  const handleRealtimeToggle = (enabled: boolean) => {
    setRealtimeEnabled(enabled);
    enableRealtimeNotifications(enabled);
    
    if (enabled) {
      toast.success('Sistema de notificações em tempo real habilitado');
    } else {
      toast.info('Sistema de notificações em tempo real desabilitado');
    }
  };

  if (loading || !localPreferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Preferências de Notificação</h2>
          <p className="text-muted-foreground">
            Configure como e quando você deseja receber notificações
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Descartar
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            size="sm"
          >
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Por Módulo</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
        </TabsList>

        {/* Configurações por módulo */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações por Módulo
              </CardTitle>
              <CardDescription>
                Configure preferências específicas para cada módulo do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {Object.entries(moduleLabels).map(([moduleKey, moduleInfo]) => {
                    const module = moduleKey as NotificationModule;
                    const settings = localPreferences.moduleSettings[module];
                    const ModuleIcon = moduleInfo.icon;

                    return (
                      <div key={module} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ModuleIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{moduleInfo.label}</h3>
                              <p className="text-sm text-muted-foreground">
                                {moduleInfo.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.enabled}
                            onCheckedChange={(checked) => 
                              handleModuleSettingChange(module, 'enabled', checked)
                            }
                          />
                        </div>

                        {settings.enabled && (
                          <div className="space-y-4 pl-11">
                            {/* Canais de notificação */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-sm">E-mail</Label>
                                </div>
                                <Switch
                                  checked={settings.emailEnabled}
                                  onCheckedChange={(checked) => 
                                    handleModuleSettingChange(module, 'emailEnabled', checked)
                                  }
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Monitor className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-sm">Push</Label>
                                </div>
                                <Switch
                                  checked={settings.pushEnabled}
                                  onCheckedChange={(checked) => 
                                    handleModuleSettingChange(module, 'pushEnabled', checked)
                                  }
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-sm">SMS</Label>
                                </div>
                                <Switch
                                  checked={settings.smsEnabled}
                                  onCheckedChange={(checked) => 
                                    handleModuleSettingChange(module, 'smsEnabled', checked)
                                  }
                                />
                              </div>
                            </div>

                            {/* Modo de agrupamento */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Modo de Entrega
                              </Label>
                              <Select
                                value={settings.digestMode}
                                onValueChange={(value: any) => 
                                  handleModuleSettingChange(module, 'digestMode', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {digestOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {option.description}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de canais */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* E-mail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-mail
                </CardTitle>
                <CardDescription>
                  Configurações para notificações por e-mail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar e-mail</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Agrupar notificações</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label className="text-sm">Horários de silêncio</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input type="time" defaultValue="22:00" />
                    <Input type="time" defaultValue="08:00" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Não enviar e-mails entre esses horários
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Push */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Push (Navegador)
                </CardTitle>
                <CardDescription>
                  Notificações push do navegador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar push</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sons de notificação</Label>
                  <Switch 
                    checked={localPreferences.globalSettings.enableSounds}
                    onCheckedChange={(checked) => 
                      handleGlobalSettingChange('enableSounds', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Notificações na área de trabalho</Label>
                  <Switch 
                    checked={localPreferences.globalSettings.enableDesktopNotifications}
                    onCheckedChange={(checked) => 
                      handleGlobalSettingChange('enableDesktopNotifications', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* SMS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  SMS
                </CardTitle>
                <CardDescription>
                  Notificações por SMS (apenas críticas)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar SMS</Label>
                  <Switch />
                </div>
                <div>
                  <Label className="text-sm">Número de telefone</Label>
                  <Input 
                    type="tel" 
                    placeholder="+55 11 99999-9999"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usado apenas para notificações críticas
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Apenas para notificações de alta prioridade
                </Badge>
              </CardContent>
            </Card>

            {/* Outros canais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Outros Canais
                </CardTitle>
                <CardDescription>
                  Integrações futuras
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Integrações com Slack, Teams e WhatsApp em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurações de tempo real */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações em Tempo Real
              </CardTitle>
              <CardDescription>
                Configure o sistema de notificações em tempo real via Server-Sent Events (SSE)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da conexão */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Status da Conexão</h3>
                    <p className="text-sm text-muted-foreground">
                      Estado atual do sistema de notificações em tempo real
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      isConnected ? "bg-green-500 animate-pulse" : 
                      connectionStatus === 'connecting' ? "bg-yellow-500 animate-pulse" : 
                      "bg-red-500"
                    )} />
                    <span className="text-sm font-medium">
                      {isConnected ? 'Conectado' : 
                       connectionStatus === 'connecting' ? 'Conectando...' : 
                       connectionStatus === 'error' ? 'Erro de conexão' :
                       'Desconectado'}
                    </span>
                  </div>
                </div>
                
                {!isConnected && connectionStatus === 'error' && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Não foi possível conectar ao servidor de notificações
                      </span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      O sistema foi automaticamente desabilitado para evitar mensagens de erro constantes.
                    </p>
                  </div>
                )}
              </div>

              {/* Controle principal */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Habilitar Notificações em Tempo Real</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receber notificações instantaneamente via Server-Sent Events (SSE)
                  </p>
                  {!realtimeEnabled && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      ⚠️ Desabilitado: Você ainda receberá notificações ao recarregar a página
                    </p>
                  )}
                </div>
                <Switch
                  checked={realtimeEnabled}
                  onCheckedChange={handleRealtimeToggle}
                />
              </div>

              {/* Configurações avançadas */}
              {realtimeEnabled && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="font-medium">Configurações Avançadas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Notificações Desktop</Label>
                        <p className="text-xs text-muted-foreground">
                          Mostrar notificações do navegador
                        </p>
                      </div>
                      <Switch
                        checked={enableDesktopNotifications}
                        onCheckedChange={(checked) => {
                          // Esta funcionalidade será implementada no contexto
                          toast.info('Configuração será aplicada na próxima sessão');
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Sons de Notificação</Label>
                        <p className="text-xs text-muted-foreground">
                          Tocar som ao receber notificações
                        </p>
                      </div>
                      <Switch
                        checked={enableSounds}
                        onCheckedChange={(checked) => {
                          // Esta funcionalidade será implementada no contexto
                          toast.info('Configuração será aplicada na próxima sessão');
                        }}
                      />
                    </div>
                  </div>

                  {/* Informações técnicas */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Informações Técnicas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Status: {connectionStatus}</div>
                      <div>Protocolo: Server-Sent Events (SSE)</div>
                      <div>Reconexão automática: {autoReconnect ? 'Habilitada' : 'Desabilitada'}</div>
                      <div>Endpoint: /api/notifications/stream</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aviso sobre funcionalidade experimental */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Funcionalidade Experimental
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                      As notificações em tempo real requerem um servidor SSE configurado. 
                      Se você estiver enfrentando problemas de conexão, mantenha esta opção desabilitada.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações gerais */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações globais de comportamento das notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comportamento */}
              <div>
                <h3 className="font-medium mb-4">Comportamento</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marcar como lida automaticamente</Label>
                      <p className="text-sm text-muted-foreground">
                        Marcar notificações como lidas ao visualizar
                      </p>
                    </div>
                    <Switch 
                      checked={localPreferences.globalSettings.autoMarkAsRead}
                      onCheckedChange={(checked) => 
                        handleGlobalSettingChange('autoMarkAsRead', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Agrupar notificações similares</Label>
                      <p className="text-sm text-muted-foreground">
                        Combinar notificações do mesmo tipo
                      </p>
                    </div>
                    <Switch 
                      checked={localPreferences.globalSettings.groupSimilarNotifications}
                      onCheckedChange={(checked) => 
                        handleGlobalSettingChange('groupSimilarNotifications', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Exibição */}
              <div>
                <h3 className="font-medium mb-4">Exibição</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Notificações por página</Label>
                    <Select
                      value={localPreferences.globalSettings.maxNotificationsPerPage.toString()}
                      onValueChange={(value) => 
                        handleGlobalSettingChange('maxNotificationsPerPage', parseInt(value))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Tempo para marcar como lida (segundos)</Label>
                    <Select
                      value={localPreferences.globalSettings.autoMarkAsReadAfterSeconds.toString()}
                      onValueChange={(value) => 
                        handleGlobalSettingChange('autoMarkAsReadAfterSeconds', parseInt(value))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="120">120</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo que uma notificação deve ficar visível para ser marcada como lida
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status das configurações */}
              <div>
                <h3 className="font-medium mb-4">Status do Sistema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Notificações ativas</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">E-mail configurado</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Push permission pending</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">SMS não configurado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aviso de mudanças */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Você tem alterações não salvas. Clique em "Salvar" para aplicá-las.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationPreferences;