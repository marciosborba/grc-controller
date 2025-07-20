import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  AlertTriangle,
  Activity,
  Calendar as CalendarIcon,
  Download,
  Eye,
  Filter,
  Search,
  Shield,
  User,
  Clock,
  Globe,
  Monitor,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

const actionColors = {
  LOGIN: 'bg-green-100 text-green-800 border-green-200',
  LOGOUT: 'bg-blue-100 text-blue-800 border-blue-200',
  CREATE: 'bg-purple-100 text-purple-800 border-purple-200',
  UPDATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  VIEW: 'bg-gray-100 text-gray-800 border-gray-200',
  APPROVE: 'bg-green-100 text-green-800 border-green-200',
  EXPORT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  LOGIN_FAILED: 'bg-red-100 text-red-800 border-red-200',
  PASSWORD_RESET: 'bg-orange-100 text-orange-800 border-orange-200'
};

const actionIcons = {
  LOGIN: CheckCircle,
  LOGOUT: XCircle,
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  VIEW: Eye,
  APPROVE: CheckCircle,
  EXPORT: Download,
  LOGIN_FAILED: AlertTriangle,
  PASSWORD_RESET: Shield
};

const resourceTypeLabels = {
  auth: 'Autenticação',
  policy: 'Política',
  assessment: 'Avaliação',
  vendor: 'Fornecedor',
  compliance_record: 'Conformidade',
  security_incident: 'Incidente',
  audit_report: 'Auditoria',
  ethics_report: 'Ética',
  user: 'Usuário'
};

export const ActivityLogsPage = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, resourceFilter, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
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
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Apply filters
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      
      if (resourceFilter !== 'all') {
        query = query.eq('resource_type', resourceFilter);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de atividade',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      // Create CSV content
      const headers = ['Data/Hora', 'Usuário', 'Ação', 'Recurso', 'ID do Recurso', 'IP', 'Detalhes'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss'),
          log.profiles?.full_name || 'Sistema',
          log.action,
          resourceTypeLabels[log.resource_type as keyof typeof resourceTypeLabels] || log.resource_type,
          log.resource_id || '',
          log.ip_address || '',
          JSON.stringify(log.details || {}).replace(/,/g, ';')
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `activity_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
      link.click();

      toast({
        title: 'Sucesso',
        description: 'Logs exportados com sucesso'
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar logs',
        variant: 'destructive'
      });
    }
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.resource_type.toLowerCase().includes(searchLower) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(searchLower)) ||
      (log.profiles?.full_name && log.profiles.full_name.toLowerCase().includes(searchLower)) ||
      (log.ip_address && typeof log.ip_address === 'string' && log.ip_address.includes(searchTerm))
    );
  });

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action as keyof typeof actionIcons] || Info;
    return <Icon className="h-4 w-4" />;
  };

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Não informado';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Outro';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Logs de Atividade
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Auditoria e rastreabilidade de ações na plataforma
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2 shrink-0">
          <Button 
            onClick={exportLogs}
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button 
            onClick={fetchLogs} 
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Sync</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{logs.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total de Atividades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  {new Set(logs.filter(l => l.user_id).map(l => l.user_id)).size}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  {logs.filter(l => l.action === 'LOGIN_FAILED' || l.action === 'DELETE').length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Ações Críticas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  {logs.length > 0 ? format(new Date(logs[0].created_at), 'HH:mm') : '--:--'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Última Atividade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="grc-card">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ação, recurso, usuário ou IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Excluir</SelectItem>
                  <SelectItem value="VIEW">Visualizar</SelectItem>
                  <SelectItem value="APPROVE">Aprovar</SelectItem>
                  <SelectItem value="EXPORT">Exportar</SelectItem>
                </SelectContent>
              </Select>

              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Recurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Recursos</SelectItem>
                  <SelectItem value="auth">Autenticação</SelectItem>
                  <SelectItem value="policy">Políticas</SelectItem>
                  <SelectItem value="assessment">Avaliações</SelectItem>
                  <SelectItem value="vendor">Fornecedores</SelectItem>
                  <SelectItem value="security_incident">Incidentes</SelectItem>
                  <SelectItem value="audit_report">Auditoria</SelectItem>
                  <SelectItem value="ethics_report">Ética</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">
                      {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Data Início'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">
                      {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Data Fim'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {(dateFrom || dateTo || actionFilter !== 'all' || resourceFilter !== 'all' || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setActionFilter('all');
                    setResourceFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-muted-foreground w-full sm:w-auto"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="grc-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Registro de Atividades</span>
            <Badge variant="outline" className="ml-auto">
              {filteredLogs.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando logs...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>ID do Recurso</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {log.profiles?.full_name || 'Sistema'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "flex items-center space-x-1 w-fit",
                            actionColors[log.action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                          )}
                        >
                          {getActionIcon(log.action)}
                          <span>{log.action}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {resourceTypeLabels[log.resource_type as keyof typeof resourceTypeLabels] || log.resource_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.resource_id || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>{typeof log.ip_address === 'string' ? log.ip_address : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Monitor className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{formatUserAgent(log.user_agent)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">Detalhes da Ação</h4>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log encontrado com os filtros aplicados</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
};