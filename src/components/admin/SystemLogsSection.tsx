import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Search, 
  RefreshCw,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Clock,
  Download,
  Filter
} from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface LogStats {
  total: number;
  today: number;
  thisWeek: number;
  errors: number;
  warnings: number;
  securityEvents: number;
  authEvents: number;
}

export const SystemLogsSection = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logStats, setLogStats] = useState<LogStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    errors: 0,
    warnings: 0,
    securityEvents: 0,
    authEvents: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const loadLogData = async () => {
    setIsLoading(true);
    try {
      // Determinar o filtro de data
      const now = new Date();
      let dateThreshold = new Date();
      
      switch (dateFilter) {
        case 'today':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0); // All time
      }

      // Carregar logs de atividade
      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles(full_name, user_id)
        `)
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      // Carregar informações de usuários para logs sem profile
      const userIds = logsData
        ?.filter(log => log.user_id && !log.profiles)
        .map(log => log.user_id) || [];

      let usersData: Array<{ id: string; user_metadata?: { full_name?: string }; email?: string }> = [];
      if (userIds.length > 0) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        usersData = authUsers?.users || [];
      }

      // Processar logs
      const processedLogs: ActivityLog[] = logsData?.map(log => {
        let userName = 'Sistema';
        let userEmail = '';

        if (log.user_id) {
          if (log.profiles) {
            userName = log.profiles.full_name || 'Usuário Desconhecido';
          } else {
            const authUser = usersData.find(u => u.id === log.user_id);
            userName = authUser?.user_metadata?.full_name || 'Usuário Desconhecido';
            userEmail = authUser?.email || '';
          }
        }

        return {
          ...log,
          user_name: userName,
          user_email: userEmail
        };
      }) || [];

      setLogs(processedLogs);

      // Calcular estatísticas baseadas nos dados reais carregados
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: LogStats = {
        total: processedLogs.length,
        today: processedLogs.filter(log => 
          new Date(log.created_at) >= today
        ).length,
        thisWeek: processedLogs.filter(log => 
          new Date(log.created_at) >= weekAgo
        ).length,
        errors: processedLogs.filter(log => 
          (log.details as Record<string, unknown>)?.severity === 'error' || 
          log.action.includes('error') || 
          log.action.includes('fail') ||
          log.action.includes('failed')
        ).length,
        warnings: processedLogs.filter(log => 
          (log.details as Record<string, unknown>)?.severity === 'warning' || 
          log.action.includes('warning') ||
          log.action.includes('suspicious')
        ).length,
        securityEvents: processedLogs.filter(log => 
          log.resource_type === 'security' || 
          log.action.includes('security') || 
          log.action.includes('suspicious') ||
          log.action.includes('breach') ||
          log.action.includes('unauthorized')
        ).length,
        authEvents: processedLogs.filter(log => 
          log.resource_type === 'auth' || 
          log.action.includes('login') || 
          log.action.includes('logout') ||
          log.action.includes('signin') ||
          log.action.includes('signout')
        ).length
      };

      setLogStats(stats);

    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogData();
  }, [dateFilter]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details?.error_message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    
    let matchesSeverity = true;
    if (severityFilter !== 'all') {
      if (severityFilter === 'error') {
        matchesSeverity = log.details?.severity === 'error' || log.action.includes('error') || log.action.includes('fail');
      } else if (severityFilter === 'warning') {
        matchesSeverity = log.details?.severity === 'warning' || log.action.includes('warning');
      } else if (severityFilter === 'info') {
        matchesSeverity = !log.details?.severity || log.details?.severity === 'info';
      }
    }

    return matchesSearch && matchesResource && matchesSeverity;
  });

  const getActionIcon = (action: string, resourceType: string) => {
    if (action.includes('error') || action.includes('fail')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (action.includes('warning')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    if (resourceType === 'security' || action.includes('security')) {
      return <Shield className="h-4 w-4 text-purple-600" />;
    }
    if (resourceType === 'auth' || action.includes('login')) {
      return <User className="h-4 w-4 text-blue-600" />;
    }
    return <Info className="h-4 w-4 text-gray-600" />;
  };

  const getSeverityBadge = (log: ActivityLog) => {
    if (log.details?.severity === 'error' || log.action.includes('error') || log.action.includes('fail')) {
      return <Badge variant="destructive" className="text-xs">Erro</Badge>;
    }
    if (log.details?.severity === 'warning' || log.action.includes('warning')) {
      return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">Aviso</Badge>;
    }
    if (log.resource_type === 'security') {
      return <Badge variant="outline" className="text-xs border-purple-500 text-purple-700">Segurança</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Info</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Usuário', 'Ação', 'Recurso', 'IP', 'Detalhes'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.user_name || 'Sistema',
        log.action,
        log.resource_type,
        log.ip_address || '',
        JSON.stringify(log.details || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total}</div>
            <p className="text-xs text-muted-foreground">eventos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{logStats.today}</div>
            <p className="text-xs text-muted-foreground">eventos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.errors}</div>
            <p className="text-xs text-muted-foreground">eventos de erro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segurança</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{logStats.securityEvents}</div>
            <p className="text-xs text-muted-foreground">eventos de segurança</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Logs de Atividade</span>
              </CardTitle>
              <CardDescription>
                Registro completo de atividades e eventos do sistema
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={loadLogData} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ação, usuário ou recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="auth">Autenticação</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="risk">Risco</SelectItem>
                <SelectItem value="policy">Política</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead className="w-32">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Carregando logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono">
                            {formatTimestamp(log.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.user_name}</span>
                          {log.user_email && (
                            <span className="text-xs text-muted-foreground">{log.user_email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action, log.resource_type)}
                          <span className="text-sm">{log.action}</span>
                        </div>
                        {log.details?.error_message && (
                          <div className="text-xs text-red-600 mt-1">
                            {log.details.error_message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.resource_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(log)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {log.ip_address || 'N/A'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Exibindo {filteredLogs.length} de {logs.length} logs
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};