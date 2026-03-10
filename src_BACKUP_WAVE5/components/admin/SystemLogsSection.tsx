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
      console.log('🔍 Carregando logs REAIS de atividade do sistema...');

      // Determinar o filtro de data
      const now = new Date();
      let dateThreshold = new Date();
      let limitRecords = 1000;

      switch (dateFilter) {
        case 'today':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          limitRecords = 500;
          break;
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          limitRecords = 1000;
          break;
        case 'month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          limitRecords = 2000;
          break;
        default:
          dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // Últimos 90 dias
          limitRecords = 3000;
      }

      console.log('📅 Filtro de data:', {
        periodo: dateFilter,
        threshold: dateThreshold.toISOString(),
        limite: limitRecords
      });

      // 1. Carregar logs de atividade (sem JOIN inicial para evitar problemas)
      const { data: logsData, error: logsError, count } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action,
          resource_type,
          resource_id,
          details,
          ip_address,
          user_agent,
          created_at
        `, { count: 'exact' })
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false })
        .limit(limitRecords);

      if (logsError) {
        console.error('❌ Erro ao carregar logs:', logsError);
        console.error('🔍 Detalhes do erro:', {
          message: logsError.message,
          details: logsError.details,
          hint: logsError.hint,
          code: logsError.code
        });

        // Não fazer throw, apenas definir dados vazios para mostrar o erro na UI
        console.log('⚠️ Continuando com dados vazios devido ao erro...');
        setLogs([]);
        setLogStats({
          total: 0,
          today: 0,
          thisWeek: 0,
          errors: 0,
          warnings: 0,
          securityEvents: 0,
          authEvents: 0
        });
        setIsLoading(false);
        return;
      }

      console.log('📊 Logs carregados:', {
        total: count,
        retornados: logsData?.length || 0,
        periodo: dateFilter
      });

      // 2. Para logs sem profile, buscar informações na tabela auth.users
      const logsWithoutProfile = logsData?.filter(log =>
        log.user_id && !log.profiles
      ) || [];

      const authUsersMap = new Map();
      if (logsWithoutProfile.length > 0) {
        console.log('🔍 Buscando dados de usuários para', logsWithoutProfile.length, 'logs sem profile');

        try {
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          if (authUsers?.users) {
            authUsers.users.forEach(user => {
              authUsersMap.set(user.id, {
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                email: user.email
              });
            });
          }
        } catch (authError) {
          console.warn('⚠️ Erro ao carregar usuários de auth:', authError);
        }
      }

      // 3. Processar logs e enriquecer com dados de usuário
      const processedLogs: ActivityLog[] = (logsData || []).map(log => {
        let userName = 'Sistema';
        let userEmail = '';

        if (log.user_id) {
          if (log.profiles && Array.isArray(log.profiles) && log.profiles.length > 0) {
            userName = log.profiles[0].full_name || 'Usuário';
            const authData = authUsersMap.get(log.user_id);
            userEmail = authData?.email || '';
          } else if (log.profiles && !Array.isArray(log.profiles)) {
            userName = log.profiles.full_name || 'Usuário';
            const authData = authUsersMap.get(log.user_id);
            userEmail = authData?.email || '';
          } else {
            // Usar dados do auth se não houver profile
            const authData = authUsersMap.get(log.user_id);
            userName = authData?.full_name || `User-${log.user_id?.slice(-8) || 'unknown'}`;
            userEmail = authData?.email || '';
          }
        } else {
          // Tentar extrair identidade de logs anônimos (ex: falha de login)
          const detailsObj = (typeof log.details === 'object' ? log.details : {}) as Record<string, any>;
          if (detailsObj?.email) {
            userName = 'Visitante (Tentativa)';
            userEmail = String(detailsObj.email);
          }
        }

        return {
          id: log.id,
          user_id: log.user_id,
          action: log.action || 'unknown',
          resource_type: log.resource_type || 'system',
          resource_id: log.resource_id,
          details: (typeof log.details === 'object' ? log.details : {}) as Record<string, unknown>,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          created_at: log.created_at,
          user_name: userName,
          user_email: userEmail
        };
      });

      console.log('✅ Logs processados:', {
        total: processedLogs.length,
        comUsuario: processedLogs.filter(l => l.user_id).length,
        sistema: processedLogs.filter(l => !l.user_id).length,
        acoesUnicas: [...new Set(processedLogs.map(l => l.action))].length
      });

      setLogs(processedLogs);

      // 4. Calcular estatísticas REAIS baseadas nos dados carregados
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Para estatísticas totais, usar dados de todo o período se não for filtro específico
      const totalLogsCount = count || 0;
      let todayLogsData = processedLogs;
      let weekLogsData = processedLogs;

      // Se não for filtro de hoje, carregar dados específicos para estatísticas precisas
      if (dateFilter !== 'today') {
        const { data: todayData } = await supabase
          .from('activity_logs')
          .select('id, action, resource_type, details')
          .gte('created_at', today.toISOString());
        todayLogsData = todayData || [];
      }

      if (dateFilter === 'all' || dateFilter === 'month') {
        const { data: weekData } = await supabase
          .from('activity_logs')
          .select('id, action, resource_type, details')
          .gte('created_at', weekAgo.toISOString());
        weekLogsData = weekData || [];
      }

      const stats: LogStats = {
        total: totalLogsCount,
        today: todayLogsData.length,
        thisWeek: weekLogsData.length,
        errors: processedLogs.filter(log => {
          const details = log.details || {};
          const action = log.action.toLowerCase();
          return details.severity === 'error' ||
            action.includes('error') ||
            action.includes('fail') ||
            action.includes('failed') ||
            action.includes('exception');
        }).length,
        warnings: processedLogs.filter(log => {
          const details = log.details || {};
          const action = log.action.toLowerCase();
          return details.severity === 'warning' ||
            action.includes('warning') ||
            action.includes('suspicious') ||
            action.includes('blocked') ||
            action.includes('retry');
        }).length,
        securityEvents: processedLogs.filter(log => {
          const action = log.action.toLowerCase();
          const resourceType = log.resource_type.toLowerCase();
          return resourceType === 'security' ||
            action.includes('security') ||
            action.includes('suspicious') ||
            action.includes('breach') ||
            action.includes('unauthorized') ||
            action.includes('blocked') ||
            action.includes('attempt');
        }).length,
        authEvents: processedLogs.filter(log => {
          const action = log.action.toLowerCase();
          const resourceType = log.resource_type.toLowerCase();
          return resourceType === 'auth' ||
            action.includes('login') ||
            action.includes('logout') ||
            action.includes('signin') ||
            action.includes('signout') ||
            action.includes('authentication') ||
            action.includes('session');
        }).length
      };

      console.log('📈 Estatísticas calculadas:', stats);
      setLogStats(stats);

    } catch (error) {
      console.error('❌ Erro crítico ao carregar logs:', error);

      // Log detalhado do erro para debug
      if (error instanceof Error) {
        console.error('🐞 Stack trace:', error.stack);
        console.error('🐞 Mensagem:', error.message);
      }

      // Tentar uma consulta mais simples como fallback
      try {
        console.log('🔄 Tentando consulta simplificada...');
        const { data: simpleLogs, error: simpleError } = await supabase
          .from('activity_logs')
          .select('id, action, resource_type, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (simpleError) {
          console.error('❌ Erro na consulta simplificada:', simpleError);
        } else {
          console.log('✅ Consulta simplificada funcionou:', simpleLogs?.length || 0, 'logs');
          if (simpleLogs && simpleLogs.length > 0) {
            const processedSimpleLogs = simpleLogs.map(log => ({
              id: log.id,
              user_id: null,
              action: log.action,
              resource_type: log.resource_type,
              resource_id: null,
              details: {},
              ip_address: null,
              user_agent: null,
              created_at: log.created_at,
              user_name: 'Sistema',
              user_email: ''
            }));
            setLogs(processedSimpleLogs);
            setLogStats({
              total: simpleLogs.length,
              today: simpleLogs.filter(log =>
                new Date(log.created_at).toDateString() === new Date().toDateString()
              ).length,
              thisWeek: simpleLogs.length,
              errors: 0,
              warnings: 0,
              securityEvents: 0,
              authEvents: 0
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('❌ Erro na consulta de fallback:', fallbackError);
      }

      // Mostrar dados básicos em caso de erro total
      const fallbackStats = {
        total: 0,
        today: 0,
        thisWeek: 0,
        errors: 0,
        warnings: 0,
        securityEvents: 0,
        authEvents: 0
      };

      setLogStats(fallbackStats);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogData();
  }, [dateFilter]);

  // Auto-refresh a cada 30 segundos se estiver na aba hoje
  useEffect(() => {
    if (dateFilter === 'today') {
      const interval = setInterval(() => {
        loadLogData();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [dateFilter]);

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const action = log.action?.toLowerCase() || '';
    const userName = log.user_name?.toLowerCase() || '';
    const resourceType = log.resource_type?.toLowerCase() || '';
    const details = log.details || {};
    const errorMessage = (details.error_message as string)?.toLowerCase() || '';
    const detailsString = JSON.stringify(details).toLowerCase();

    const matchesSearch = searchTerm === '' ||
      action.includes(searchLower) ||
      userName.includes(searchLower) ||
      resourceType.includes(searchLower) ||
      errorMessage.includes(searchLower) ||
      detailsString.includes(searchLower) ||
      log.ip_address?.includes(searchTerm) ||
      log.resource_id?.includes(searchTerm);

    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;

    let matchesSeverity = true;
    if (severityFilter !== 'all') {
      const actionLower = action;
      if (severityFilter === 'error') {
        matchesSeverity = details.severity === 'error' ||
          actionLower.includes('error') ||
          actionLower.includes('fail') ||
          actionLower.includes('exception') ||
          actionLower.includes('critical');
      } else if (severityFilter === 'warning') {
        matchesSeverity = details.severity === 'warning' ||
          actionLower.includes('warning') ||
          actionLower.includes('suspicious') ||
          actionLower.includes('blocked') ||
          actionLower.includes('retry');
      } else if (severityFilter === 'info') {
        matchesSeverity = !details.severity ||
          details.severity === 'info' ||
          (!actionLower.includes('error') &&
            !actionLower.includes('warning') &&
            !actionLower.includes('fail'));
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
      // Cabeçalho CSV
      ['Timestamp', 'Usuário', 'Email', 'Ação', 'Recurso', 'Recurso_ID', 'IP', 'Severidade', 'Detalhes'].join(','),
      // Dados dos logs
      ...filteredLogs.map(log => [
        `"${log.created_at}"`,
        `"${log.user_name || 'Sistema'}"`,
        `"${log.user_email || ''}"`,
        `"${log.action}"`,
        `"${log.resource_type}"`,
        `"${log.resource_id || ''}"`,
        `"${log.ip_address || ''}"`,
        `"${log.details?.severity || 'info'}"`,
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`  // Escapar aspas duplas
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grc-system-logs-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
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
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="risk">Risco</SelectItem>
                <SelectItem value="policy">Política</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
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
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Carregando logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {logs.length === 0 ? (
                        <div className="space-y-2">
                          <div>Nenhum log encontrado</div>
                          <div className="text-xs">
                            Período: {dateFilter} | Total carregado: {logs.length}
                          </div>
                          <div className="text-xs">
                            Verifique se há logs no período selecionado ou se as permissões estão corretas
                          </div>
                        </div>
                      ) : (
                        <div>Nenhum log corresponde aos filtros aplicados</div>
                      )}
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
                        {log.details && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.details.error_message && (
                              <div className="text-red-600">{String(log.details.error_message)}</div>
                            )}
                            {log.details.message && (
                              <div>{String(log.details.message)}</div>
                            )}
                            {log.resource_id && (
                              <div className="font-mono">ID: {log.resource_id}</div>
                            )}
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
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const logDetails = {
                                id: log.id,
                                timestamp: log.created_at,
                                user: log.user_name,
                                email: log.user_email,
                                action: log.action,
                                resource: log.resource_type,
                                resource_id: log.resource_id,
                                ip: log.ip_address,
                                user_agent: log.user_agent,
                                details: log.details
                              };
                              navigator.clipboard.writeText(JSON.stringify(logDetails, null, 2));
                            }}
                            className="h-6 w-6 p-0"
                            title="Copiar detalhes"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
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