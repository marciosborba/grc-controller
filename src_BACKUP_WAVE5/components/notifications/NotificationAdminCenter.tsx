// ============================================================================
// CENTRO DE COMANDO ADMINISTRATIVO DE NOTIFICAÇÕES
// ============================================================================
// Painel centralizado para administração completa do sistema de notificações

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Bell, 
  Activity, 
  BarChart3, 
  Shield, 
  Zap, 
  Database, 
  Globe, 
  Mail, 
  Smartphone, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Save,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Target,
  Layers,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsRealtime } from '@/contexts/NotificationsRealtimeContext';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para configurações administrativas
interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  totalNotifications: number;
  processedToday: number;
  failureRate: number;
  avgProcessingTime: number;
  queueSize: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ChannelStatus {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'slack' | 'teams' | 'push' | 'webhook';
  status: 'active' | 'inactive' | 'error';
  isDefault: boolean;
  sentToday: number;
  deliveryRate: number;
  errorRate: number;
  lastError?: string;
  rateLimit: {
    perMinute: number;
    perHour: number;
    perDay: number;
    currentUsage: number;
  };
}

interface UserActivity {
  userId: string;
  userName: string;
  email: string;
  role: string;
  lastActive: string;
  notificationsReceived: number;
  notificationsRead: number;
  avgResponseTime: number;
  engagementScore: number;
  preferredChannels: string[];
  isOnline: boolean;
}

interface SystemConfiguration {
  globalSettings: {
    enableNotifications: boolean;
    enableRealtime: boolean;
    enableAuditLog: boolean;
    maxNotificationsPerUser: number;
    defaultRetentionDays: number;
    enableRateLimiting: boolean;
    globalRateLimit: number;
  };
  emailSettings: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    fromEmail: string;
    fromName: string;
    enableTLS: boolean;
  };
  smsSettings: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    fromNumber: string;
  };
  slackSettings: {
    enabled: boolean;
    webhookUrl: string;
    defaultChannel: string;
  };
}

// Mock data
const mockSystemHealth: SystemHealth = {
  status: 'healthy',
  uptime: 99.8,
  totalNotifications: 15847,
  processedToday: 342,
  failureRate: 0.2,
  avgProcessingTime: 1.2,
  queueSize: 23,
  activeConnections: 156,
  memoryUsage: 68.5,
  cpuUsage: 23.1
};

const mockChannels: ChannelStatus[] = [
  {
    id: '1',
    name: 'Sistema Email',
    type: 'email',
    status: 'active',
    isDefault: true,
    sentToday: 234,
    deliveryRate: 98.5,
    errorRate: 1.5,
    rateLimit: { perMinute: 60, perHour: 1000, perDay: 10000, currentUsage: 234 }
  },
  {
    id: '2',
    name: 'Push Notifications',
    type: 'push',
    status: 'active',
    isDefault: true,
    sentToday: 456,
    deliveryRate: 95.2,
    errorRate: 4.8,
    rateLimit: { perMinute: 100, perHour: 2000, perDay: 20000, currentUsage: 456 }
  },
  {
    id: '3',
    name: 'SMS Crítico',
    type: 'sms',
    status: 'active',
    isDefault: false,
    sentToday: 12,
    deliveryRate: 99.1,
    errorRate: 0.9,
    rateLimit: { perMinute: 10, perHour: 100, perDay: 500, currentUsage: 12 }
  },
  {
    id: '4',
    name: 'Slack Integração',
    type: 'slack',
    status: 'error',
    isDefault: false,
    sentToday: 0,
    deliveryRate: 0,
    errorRate: 100,
    lastError: 'Webhook URL inválida',
    rateLimit: { perMinute: 30, perHour: 500, perDay: 5000, currentUsage: 0 }
  }
];

const mockUserActivity: UserActivity[] = [
  {
    userId: '1',
    userName: 'João Silva',
    email: 'joao@empresa.com',
    role: 'Risk Manager',
    lastActive: '2024-01-20T14:30:00Z',
    notificationsReceived: 45,
    notificationsRead: 42,
    avgResponseTime: 2.3,
    engagementScore: 93.3,
    preferredChannels: ['email', 'push'],
    isOnline: true
  },
  {
    userId: '2',
    userName: 'Maria Santos',
    email: 'maria@empresa.com',
    role: 'Privacy Officer',
    lastActive: '2024-01-20T13:45:00Z',
    notificationsReceived: 67,
    notificationsRead: 65,
    avgResponseTime: 1.8,
    engagementScore: 97.0,
    preferredChannels: ['email', 'sms'],
    isOnline: true
  },
  {
    userId: '3',
    userName: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: 'Compliance Manager',
    lastActive: '2024-01-20T12:15:00Z',
    notificationsReceived: 23,
    notificationsRead: 18,
    avgResponseTime: 8.7,
    engagementScore: 78.3,
    preferredChannels: ['push'],
    isOnline: false
  }
];

export const NotificationAdminCenter: React.FC = () => {
  const { stats, loading } = useNotifications();
  const { isConnected, messagesReceived, connectionStatus } = useNotificationsRealtime();
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(mockSystemHealth);
  const [channels, setChannels] = useState<ChannelStatus[]>(mockChannels);
  const [userActivity, setUserActivity] = useState<UserActivity[]>(mockUserActivity);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Configurações do sistema
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    globalSettings: {
      enableNotifications: true,
      enableRealtime: true,
      enableAuditLog: true,
      maxNotificationsPerUser: 1000,
      defaultRetentionDays: 90,
      enableRateLimiting: true,
      globalRateLimit: 10000
    },
    emailSettings: {
      enabled: true,
      smtpHost: 'smtp.empresa.com',
      smtpPort: 587,
      fromEmail: 'noreply@empresa.com',
      fromName: 'Sistema GRC',
      enableTLS: true
    },
    smsSettings: {
      enabled: true,
      provider: 'twilio',
      apiKey: '***hidden***',
      fromNumber: '+5511999999999'
    },
    slackSettings: {
      enabled: false,
      webhookUrl: '',
      defaultChannel: '#grc-notifications'
    }
  });

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular atualização dos dados
      setSystemHealth(prev => ({
        ...prev,
        processedToday: prev.processedToday + Math.floor(Math.random() * 5),
        queueSize: Math.max(0, prev.queueSize + Math.floor(Math.random() * 10) - 5),
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 20) - 10,
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + Math.random() * 10 - 5)),
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + Math.random() * 20 - 10))
      }));
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handlers
  const handleChannelToggle = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, status: channel.status === 'active' ? 'inactive' : 'active' }
        : channel
    ));
    toast.success('Status do canal atualizado');
  };

  const handleSystemConfigSave = () => {
    // Aqui salvaria as configurações na API
    toast.success('Configurações salvas com sucesso');
  };

  const handleExportData = () => {
    toast.info('Exportando dados...', {
      description: 'O download será iniciado em breve'
    });
  };

  const handleSystemMaintenance = () => {
    toast.warning('Modo de manutenção ativado', {
      description: 'Novas notificações serão pausadas'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
      case 'error':
        return XCircle;
      case 'inactive':
        return Pause;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Comando</h1>
          <p className="text-muted-foreground">
            Administração e monitoramento do sistema de notificações
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label className="text-sm">Auto-refresh</Label>
          </div>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Manutenção
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Modo de Manutenção</AlertDialogTitle>
                <AlertDialogDescription>
                  Ativar o modo de manutenção pausará o processamento de novas notificações. 
                  Usuários serão notificados sobre a manutenção programada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSystemMaintenance}>
                  Ativar Manutenção
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status do Sistema</p>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const StatusIcon = getStatusIcon(systemHealth.status);
                    return (
                      <>
                        <StatusIcon className={cn("h-4 w-4", getStatusColor(systemHealth.status))} />
                        <span className={cn("text-sm font-medium capitalize", getStatusColor(systemHealth.status))}>
                          {systemHealth.status === 'healthy' ? 'Saudável' : systemHealth.status}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Uptime: {systemHealth.uptime}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processadas Hoje</p>
                <p className="text-2xl font-bold">{systemHealth.processedToday.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Tempo médio: {systemHealth.avgProcessingTime}s
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fila de Processamento</p>
                <p className="text-2xl font-bold">{systemHealth.queueSize}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Taxa de falha: {systemHealth.failureRate}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conexões Ativas</p>
                <p className="text-2xl font-bold">{systemHealth.activeConnections}</p>
              </div>
              {isConnected ? (
                <Wifi className="h-8 w-8 text-green-600" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Tempo real: {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Recursos do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Uso de Memória</span>
                <span>{systemHealth.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={systemHealth.memoryUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Uso de CPU</span>
                <span>{systemHealth.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={systemHealth.cpuUsage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {systemHealth.totalNotifications.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total de Notificações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {messagesReceived}
                </p>
                <p className="text-xs text-muted-foreground">Mensagens em Tempo Real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Status dos Canais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channels.map((channel) => {
                const StatusIcon = getStatusIcon(channel.status);
                return (
                  <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", getStatusColor(channel.status))}>
                        {channel.type === 'email' && <Mail className="h-4 w-4" />}
                        {channel.type === 'sms' && <Smartphone className="h-4 w-4" />}
                        {channel.type === 'push' && <Bell className="h-4 w-4" />}
                        {channel.type === 'slack' && <MessageSquare className="h-4 w-4" />}
                        {channel.type === 'webhook' && <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          {channel.isDefault && (
                            <Badge variant="secondary" className="text-xs">Padrão</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Enviadas: {channel.sentToday}</span>
                          <span>Entrega: {channel.deliveryRate}%</span>
                          {channel.lastError && (
                            <span className="text-red-600">Erro: {channel.lastError}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs">
                        <p>{channel.rateLimit.currentUsage}/{channel.rateLimit.perDay}</p>
                        <p className="text-muted-foreground">por dia</p>
                      </div>
                      <Switch
                        checked={channel.status === 'active'}
                        onCheckedChange={() => handleChannelToggle(channel.id)}
                        disabled={channel.status === 'error'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Administração */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        {/* Atividade dos Usuários */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Atividade dos Usuários
              </CardTitle>
              <CardDescription>
                Monitoramento de engajamento e uso do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar usuários..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filtros
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notificações</TableHead>
                      <TableHead>Engajamento</TableHead>
                      <TableHead>Tempo de Resposta</TableHead>
                      <TableHead>Canais</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivity.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.userName}</div>
                            <div className="text-sm text-muted-foreground">{user.role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              user.isOnline ? "bg-green-500" : "bg-gray-400"
                            )} />
                            <span className="text-sm">
                              {user.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.notificationsRead}/{user.notificationsReceived}</div>
                            <div className="text-muted-foreground">lidas/recebidas</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={user.engagementScore} className="w-16 h-2" />
                            <span className="text-sm">{user.engagementScore.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.avgResponseTime.toFixed(1)}h</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.preferredChannels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Globais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar Notificações</Label>
                  <Switch
                    checked={systemConfig.globalSettings.enableNotifications}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({
                      ...prev,
                      globalSettings: { ...prev.globalSettings, enableNotifications: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Tempo Real</Label>
                  <Switch
                    checked={systemConfig.globalSettings.enableRealtime}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({
                      ...prev,
                      globalSettings: { ...prev.globalSettings, enableRealtime: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Log de Auditoria</Label>
                  <Switch
                    checked={systemConfig.globalSettings.enableAuditLog}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({
                      ...prev,
                      globalSettings: { ...prev.globalSettings, enableAuditLog: checked }
                    }))}
                  />
                </div>

                <div>
                  <Label>Máximo de Notificações por Usuário</Label>
                  <Input
                    type="number"
                    value={systemConfig.globalSettings.maxNotificationsPerUser}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      globalSettings: { ...prev.globalSettings, maxNotificationsPerUser: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div>
                  <Label>Retenção Padrão (dias)</Label>
                  <Input
                    type="number"
                    value={systemConfig.globalSettings.defaultRetentionDays}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      globalSettings: { ...prev.globalSettings, defaultRetentionDays: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar Email</Label>
                  <Switch
                    checked={systemConfig.emailSettings.enabled}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, enabled: checked }
                    }))}
                  />
                </div>

                <div>
                  <Label>Servidor SMTP</Label>
                  <Input
                    value={systemConfig.emailSettings.smtpHost}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, smtpHost: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label>Porta SMTP</Label>
                  <Input
                    type="number"
                    value={systemConfig.emailSettings.smtpPort}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, smtpPort: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div>
                  <Label>Email Remetente</Label>
                  <Input
                    type="email"
                    value={systemConfig.emailSettings.fromEmail}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, fromEmail: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label>Nome Remetente</Label>
                  <Input
                    value={systemConfig.emailSettings.fromName}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, fromName: e.target.value }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSystemConfigSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>

        {/* Log de Auditoria */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Log de Auditoria
              </CardTitle>
              <CardDescription>
                Registro completo de atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Log de auditoria será implementado</p>
                <p className="text-sm">Registros de todas as ações e modificações</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ferramentas de Manutenção */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Limpeza de Dados</CardTitle>
                <CardDescription>
                  Ferramentas para manutenção e limpeza do banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Notificações Antigas
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Otimizar Banco de Dados
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reprocessar Fila
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup e Restauração</CardTitle>
                <CardDescription>
                  Gerenciamento de backups do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Fazer Backup
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurar Backup
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Backup Automático
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationAdminCenter;