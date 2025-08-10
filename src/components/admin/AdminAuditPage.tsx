import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  Clock,
  Shield,
  AlertTriangle,
  Eye,
  Users,
  Monitor,
  Database,
  FileText,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

interface ActiveUser {
  id: string;
  full_name: string;
  email: string;
  last_login_at: string;
  department?: string;
  job_title?: string;
  is_active: boolean;
  session_count?: number;
}

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

interface SystemStats {
  total_users: number;
  active_users_today: number;
  total_activities_today: number;
  security_events_today: number;
  failed_logins_today: number;
  successful_logins_today: number;
}

export const AdminAuditPage: React.FC = () => {
  const { toast } = useToast();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_users: 0,
    active_users_today: 0,
    total_activities_today: 0,
    security_events_today: 0,
    failed_logins_today: 0,
    successful_logins_today: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');
  const [resourceFilter, setResourceFilter] = useState('all');

  const fetchSystemStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active users today (users who logged in today)
      const { count: activeUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', today.toISOString());

      // Total activities today
      const { count: totalActivitiesToday } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Security events today (auth failures, suspicious activities)
      const { count: securityEventsToday } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('resource_type', 'security')
        .gte('created_at', today.toISOString());

      // Failed logins today
      const { count: failedLoginsToday } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'login_failed')
        .gte('created_at', today.toISOString());

      // Successful logins today
      const { count: successfulLoginsToday } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'login_success')
        .gte('created_at', today.toISOString());

      setSystemStats({
        total_users: totalUsers || 0,
        active_users_today: activeUsersToday || 0,
        total_activities_today: totalActivitiesToday || 0,
        security_events_today: securityEventsToday || 0,
        failed_logins_today: failedLoginsToday || 0,
        successful_logins_today: successfulLoginsToday || 0,
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      // Date filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Resource filter
      if (resourceFilter !== 'all') {
        query = query.eq('resource_type', resourceFilter);
      }

      const { data: logsData, error } = await query;

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(logsData?.map(log => log.user_id).filter(Boolean) || [])];
      let profilesData: { user_id: string; full_name: string; email: string }[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Combine data
      let filteredData = (logsData || []).map(log => ({
        ...log,
        profiles: profilesData.find(p => p.user_id === log.user_id)
      }));

      // Search filter
      if (searchTerm) {
        filteredData = filteredData.filter(log => 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip_address?.includes(searchTerm)
        );
      }

      setActivityLogs(filteredData as ActivityLog[]);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de atividade',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [dateFilter, resourceFilter, searchTerm, toast]);

  const fetchActiveUsers = useCallback(async () => {
    try {
      // Users active in the last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .gte('last_login_at', last24Hours.toISOString())
        .order('last_login_at', { ascending: false });

      if (error) throw error;

      setActiveUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários ativos',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const fetchSecurityEvents = useCallback(async () => {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .in('resource_type', ['security', 'auth'])
        .order('created_at', { ascending: false })
        .limit(200);

      // Date filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data: eventsData, error } = await query;

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(eventsData?.map(log => log.user_id).filter(Boolean) || [])];
      let profilesData: { user_id: string; full_name: string; email: string }[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Map to security events format
      const securityEvents = (eventsData || []).map(log => ({
        ...log,
        event_type: log.action,
        severity: getSeverityFromAction(log.action) as 'info' | 'warning' | 'error' | 'critical',
        profiles: profilesData.find(p => p.user_id === log.user_id)
      }));

      // Apply severity filter
      let filteredEvents = securityEvents;
      if (severityFilter !== 'all') {
        filteredEvents = securityEvents.filter(event => event.severity === severityFilter);
      }

      setSecurityEvents(filteredEvents as SecurityEvent[]);
    } catch (error) {
      console.error('Error fetching security events:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar eventos de segurança',
        variant: 'destructive'
      });
    }
  }, [dateFilter, severityFilter, toast]);

  const getSeverityFromAction = (action: string): string => {
    const criticalActions = ['login_failed_multiple', 'account_locked', 'suspicious_activity'];
    const errorActions = ['login_failed', 'authentication_error', 'unauthorized_access'];
    const warningActions = ['password_changed', 'profile_updated', 'permission_denied'];
    
    if (criticalActions.some(a => action.includes(a))) return 'critical';
    if (errorActions.some(a => action.includes(a))) return 'error';
    if (warningActions.some(a => action.includes(a))) return 'warning';
    return 'info';
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSystemStats(),
      fetchActivityLogs(),
      fetchActiveUsers(),
      fetchSecurityEvents()
    ]);
    setLoading(false);
    
    toast({
      title: 'Dados Atualizados',
      description: 'Todas as informações foram recarregadas com sucesso',
    });
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchSystemStats(),
        fetchActivityLogs(),
        fetchActiveUsers(),
        fetchSecurityEvents()
      ]);
    };
    loadData();
  }, [searchTerm, severityFilter, dateFilter, resourceFilter, fetchActivityLogs, fetchActiveUsers, fetchSecurityEvents]);

  const exportData = async (type: 'activities' | 'security' | 'users') => {
    try {
      let data: (ActivityLog | SecurityEvent | ActiveUser)[] = [];
      let filename = '';
      
      switch (type) {
        case 'activities':
          data = activityLogs;
          filename = 'activity_logs';
          break;
        case 'security':
          data = securityEvents;
          filename = 'security_events';
          break;
        case 'users':
          data = activeUsers;
          filename = 'active_users';
          break;
      }

      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Sucesso',
        description: 'Dados exportados com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados',
        variant: 'destructive'
      });
    }
  };

  const convertToCSV = (data: (ActivityLog | SecurityEvent | ActiveUser)[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => key !== 'profiles');
    headers.push('user_name', 'user_email');
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        const values = headers.map(header => {
          if (header === 'user_name') {
            const activityRow = row as ActivityLog | SecurityEvent;
            const userRow = row as ActiveUser;
            return `"${activityRow.profiles?.full_name || userRow.full_name || 'N/A'}"`;
          }
          if (header === 'user_email') {
            const activityRow = row as ActivityLog | SecurityEvent;
            const userRow = row as ActiveUser;
            return `"${activityRow.profiles?.email || userRow.email || 'N/A'}"`;
          }
          const value = (row as Record<string, unknown>)[header];
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        });
        return values.join(',');
      })
    ].join('\n');
    
    return csvContent;
  };

  const getSeverityBadgeColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getResourceBadgeColor = (resource: string) => {
    const colors = {
      auth: 'bg-purple-100 text-purple-800',
      security: 'bg-red-100 text-red-800',
      assessment: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
      system: 'bg-gray-100 text-gray-800',
      policy: 'bg-indigo-100 text-indigo-800',
      risk: 'bg-orange-100 text-orange-800'
    };
    return colors[resource] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>Auditoria e Monitoramento</span>
          </h1>
          <p className="text-muted-foreground">
            Painel completo de auditoria, logs de segurança e usuários ativos para governança da plataforma
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{systemStats.total_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos Hoje</p>
                <p className="text-2xl font-bold">{systemStats.active_users_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atividades Hoje</p>
                <p className="text-2xl font-bold">{systemStats.total_activities_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Segurança</p>
                <p className="text-2xl font-bold">{systemStats.security_events_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logins Sucesso</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.successful_logins_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Falhas Login</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.failed_logins_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário, ação, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último dia</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <Database className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os recursos</SelectItem>
                <SelectItem value="auth">Autenticação</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="policy">Políticas</SelectItem>
                <SelectItem value="risk">Risco</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <AlertTriangle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity-logs" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Logs de Atividade ({activityLogs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="security-events" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Eventos de Segurança ({securityEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="active-users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Usuários Ativos ({activeUsers.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity-logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Logs de Atividade do Sistema</span>
                </CardTitle>
                <Button onClick={() => exportData('activities')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Data/Hora</TableHead>
                      <TableHead className="w-[120px]">Usuário</TableHead>
                      <TableHead className="w-[110px]">Ação</TableHead>
                      <TableHead className="w-[80px]">Recurso</TableHead>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead className="w-[100px]">IP</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className="whitespace-nowrap">
                              {new Date(log.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium truncate max-w-[100px]" title={log.profiles?.full_name || 'Sistema'}>
                              {log.profiles?.full_name || 'Sistema'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs px-1 py-0 max-w-[100px] truncate" title={log.action}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getResourceBadgeColor(log.resource_type)} text-xs px-1 py-0`}>
                            {log.resource_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <span className="truncate" title={log.resource_id || 'N/A'}>
                            {log.resource_id ? log.resource_id.substring(0, 6) : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <span className="truncate" title={log.ip_address || 'N/A'}>
                            {log.ip_address || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="truncate max-w-[200px]" title={log.details ? JSON.stringify(log.details) : 'N/A'}>
                            {log.details ? JSON.stringify(log.details).substring(0, 80) : 'N/A'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Eventos de Segurança</span>
                </CardTitle>
                <Button onClick={() => exportData('security')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Data/Hora</TableHead>
                      <TableHead className="w-[120px]">Usuário</TableHead>
                      <TableHead className="w-[110px]">Evento</TableHead>
                      <TableHead className="w-[80px]">Severidade</TableHead>
                      <TableHead className="w-[100px]">IP</TableHead>
                      <TableHead className="w-[120px]">User Agent</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className="whitespace-nowrap">
                              {new Date(event.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium truncate max-w-[100px]" title={event.profiles?.full_name || 'Sistema'}>
                              {event.profiles?.full_name || 'Sistema'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs px-1 py-0 max-w-[100px] truncate" title={event.event_type}>
                            {event.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getSeverityBadgeColor(event.severity)} text-xs px-1 py-0`}>
                            {event.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <span className="truncate" title={event.ip_address || 'N/A'}>
                            {event.ip_address || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="truncate max-w-[120px]" title={event.user_agent || 'N/A'}>
                            {event.user_agent || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="truncate max-w-[150px]" title={event.details ? JSON.stringify(event.details) : 'N/A'}>
                            {event.details ? JSON.stringify(event.details).substring(0, 60) : 'N/A'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Usuários Ativos (Últimas 24h)</span>
                </CardTitle>
                <Button onClick={() => exportData('users')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Nome</TableHead>
                      <TableHead className="w-[180px]">Email</TableHead>
                      <TableHead className="w-[120px]">Departamento</TableHead>
                      <TableHead className="w-[120px]">Cargo</TableHead>
                      <TableHead className="w-[130px]">Último Login</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium truncate max-w-[130px]" title={user.full_name}>
                              {user.full_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="truncate max-w-[160px]" title={user.email}>
                            {user.email}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="truncate max-w-[100px]" title={user.department || 'N/A'}>
                            {user.department || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="truncate max-w-[100px]" title={user.job_title || 'N/A'}>
                            {user.job_title || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className="whitespace-nowrap">
                              {new Date(user.last_login_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.is_active ? 'default' : 'secondary'}
                            className={`text-xs px-1 py-0 ${user.is_active ? 'bg-green-100 text-green-800' : ''}`}
                          >
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};