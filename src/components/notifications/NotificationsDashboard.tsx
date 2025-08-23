// ============================================================================
// DASHBOARD APRIMORADO DE NOTIFICAÇÕES
// ============================================================================
// Dashboard com analytics, métricas avançadas e centro de comando

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  Eye,
  MessageSquare,
  Mail,
  Smartphone
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsRealtime } from '@/contexts/NotificationsRealtimeContext';
import { NotificationModule, NotificationPriority } from '@/types/notifications';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para analytics
interface NotificationAnalytics {
  totalNotifications: number;
  unreadCount: number;
  responseRate: number;
  avgResponseTime: number;
  criticalCount: number;
  overdueCount: number;
  trendsData: Array<{
    date: string;
    total: number;
    unread: number;
    critical: number;
  }>;
  moduleDistribution: Array<{
    module: string;
    count: number;
    percentage: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    color: string;
  }>;
  channelPerformance: Array<{
    channel: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }>;
  userEngagement: Array<{
    userId: string;
    userName: string;
    totalReceived: number;
    totalRead: number;
    avgResponseTime: number;
    engagementScore: number;
  }>;
}

// Mock data para analytics - em produção viria da API
const mockAnalytics: NotificationAnalytics = {
  totalNotifications: 1247,
  unreadCount: 23,
  responseRate: 87.5,
  avgResponseTime: 4.2,
  criticalCount: 8,
  overdueCount: 12,
  trendsData: Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'dd/MM'),
    total: Math.floor(Math.random() * 50) + 20,
    unread: Math.floor(Math.random() * 15) + 2,
    critical: Math.floor(Math.random() * 5)
  })),
  moduleDistribution: [
    { module: 'Assessments', count: 342, percentage: 27.4 },
    { module: 'Riscos', count: 298, percentage: 23.9 },
    { module: 'Compliance', count: 187, percentage: 15.0 },
    { module: 'Privacidade', count: 156, percentage: 12.5 },
    { module: 'Políticas', count: 134, percentage: 10.7 },
    { module: 'Sistema', count: 89, percentage: 7.1 },
    { module: 'Outros', count: 41, percentage: 3.3 }
  ],
  priorityDistribution: [
    { priority: 'Crítica', count: 45, color: '#ef4444' },
    { priority: 'Alta', count: 123, color: '#f97316' },
    { priority: 'Média', count: 567, color: '#eab308' },
    { priority: 'Baixa', count: 512, color: '#22c55e' }
  ],
  channelPerformance: [
    { 
      channel: 'Push', 
      sent: 1247, 
      delivered: 1198, 
      opened: 892, 
      clicked: 234,
      deliveryRate: 96.1,
      openRate: 74.5,
      clickRate: 26.2
    },
    { 
      channel: 'Email', 
      sent: 856, 
      delivered: 834, 
      opened: 567, 
      clicked: 123,
      deliveryRate: 97.4,
      openRate: 68.0,
      clickRate: 21.7
    },
    { 
      channel: 'SMS', 
      sent: 45, 
      delivered: 44, 
      opened: 42, 
      clicked: 18,
      deliveryRate: 97.8,
      openRate: 95.5,
      clickRate: 42.9
    }
  ],
  userEngagement: [
    { userId: '1', userName: 'João Silva', totalReceived: 89, totalRead: 82, avgResponseTime: 2.3, engagementScore: 92.1 },
    { userId: '2', userName: 'Maria Santos', totalReceived: 76, totalRead: 71, avgResponseTime: 3.1, engagementScore: 93.4 },
    { userId: '3', userName: 'Pedro Costa', totalReceived: 134, totalRead: 98, avgResponseTime: 8.7, engagementScore: 73.1 },
    { userId: '4', userName: 'Ana Oliveira', totalReceived: 67, totalRead: 65, avgResponseTime: 1.8, engagementScore: 97.0 }
  ]
};

export const NotificationsDashboard: React.FC = () => {
  const { stats, loading } = useNotifications();
  const { isConnected, messagesReceived } = useNotificationsRealtime();
  
  const [analytics, setAnalytics] = useState<NotificationAnalytics>(mockAnalytics);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  // Cores para os gráficos
  const colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  // Métricas principais
  const mainMetrics = [
    {
      title: 'Total de Notificações',
      value: analytics.totalNotifications.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Não Lidas',
      value: analytics.unreadCount.toString(),
      change: '-8.3%',
      trend: 'down',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Taxa de Resposta',
      value: `${analytics.responseRate}%`,
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tempo Médio de Resposta',
      value: `${analytics.avgResponseTime}h`,
      change: '-15.7%',
      trend: 'down',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Críticas Pendentes',
      value: analytics.criticalCount.toString(),
      change: '+2',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Em Tempo Real',
      value: messagesReceived.toString(),
      change: isConnected ? 'Conectado' : 'Desconectado',
      trend: isConnected ? 'up' : 'down',
      icon: Activity,
      color: isConnected ? 'text-green-600' : 'text-red-600',
      bgColor: isConnected ? 'bg-green-50' : 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Notificações</h1>
          <p className="text-muted-foreground">
            Analytics e métricas do sistema de notificações
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                    <Icon className={cn('h-4 w-4', metric.color)} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={cn(
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{metric.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos e Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendência de Notificações
                </CardTitle>
                <CardDescription>
                  Volume de notificações nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stackId="1"
                      stroke={colors.primary} 
                      fill={colors.primary}
                      fillOpacity={0.6}
                      name="Total"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="unread" 
                      stackId="2"
                      stroke={colors.warning} 
                      fill={colors.warning}
                      fillOpacity={0.6}
                      name="Não Lidas"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="critical" 
                      stackId="3"
                      stroke={colors.danger} 
                      fill={colors.danger}
                      fillOpacity={0.8}
                      name="Críticas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance por Hora
                </CardTitle>
                <CardDescription>
                  Distribuição de notificações por horário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Array.from({ length: 24 }, (_, i) => ({
                    hour: `${i.toString().padStart(2, '0')}:00`,
                    notifications: Math.floor(Math.random() * 50) + 10
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="notifications" fill={colors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribuição */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Módulo
                </CardTitle>
                <CardDescription>
                  Percentual de notificações por módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.moduleDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="module"
                    >
                      {analytics.moduleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Distribuição por Prioridade
                </CardTitle>
                <CardDescription>
                  Quantidade de notificações por nível de prioridade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.priorityDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.priority}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {item.count} notificações
                        </span>
                        <Progress 
                          value={(item.count / analytics.totalNotifications) * 100} 
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance de Canais */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Performance dos Canais de Comunicação
              </CardTitle>
              <CardDescription>
                Métricas de entrega e engajamento por canal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.channelPerformance.map((channel, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {channel.channel === 'Push' && <Bell className="h-5 w-5 text-blue-600" />}
                        {channel.channel === 'Email' && <Mail className="h-5 w-5 text-green-600" />}
                        {channel.channel === 'SMS' && <Smartphone className="h-5 w-5 text-purple-600" />}
                        <h3 className="font-semibold">{channel.channel}</h3>
                      </div>
                      <Badge variant="outline">
                        {channel.sent.toLocaleString()} enviadas
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {channel.deliveryRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                        <Progress value={channel.deliveryRate} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {channel.openRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                        <Progress value={channel.openRate} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {channel.clickRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taxa de Clique</p>
                        <Progress value={channel.clickRate} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {channel.clicked}
                        </p>
                        <p className="text-sm text-muted-foreground">Ações Executadas</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engajamento de Usuários */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Engajamento dos Usuários
              </CardTitle>
              <CardDescription>
                Métricas de engajamento e resposta por usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userEngagement.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.totalReceived} recebidas • {user.totalRead} lidas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold">{user.avgResponseTime.toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">Tempo Médio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                          {user.engagementScore.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Engajamento</p>
                      </div>
                      <Progress value={user.engagementScore} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tempo Real */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status da Conexão
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Monitoramento da conexão em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status da Conexão</span>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                      )} />
                      <span className={cn(
                        "font-medium",
                        isConnected ? "text-green-600" : "text-red-600"
                      )}>
                        {isConnected ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mensagens Recebidas</span>
                    <span className="font-bold">{messagesReceived}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Última Atualização</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(), 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimas notificações processadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '14:32', action: 'Nova notificação crítica', module: 'Riscos' },
                    { time: '14:28', action: 'Assessment completado', module: 'Assessments' },
                    { time: '14:25', action: 'Política atualizada', module: 'Políticas' },
                    { time: '14:20', action: 'Solicitação LGPD', module: 'Privacidade' },
                    { time: '14:15', action: 'Backup concluído', module: 'Sistema' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono">
                          {activity.time}
                        </span>
                        <span>{activity.action}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.module}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsDashboard;