import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Activity,
  Shield
} from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityLogsSectionProps {
  tenantId: string;
}

export const ActivityLogsSection: React.FC<ActivityLogsSectionProps> = ({
  tenantId
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    loadActivityLogs();
  }, [tenantId, selectedTimeRange]);

  const loadActivityLogs = async () => {
    try {
      setIsLoading(true);
      // Simular carregamento de logs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          userId: '1',
          userEmail: 'admin@empresa.com',
          action: 'LOGIN',
          resource: 'Authentication',
          details: 'Usuário fez login com sucesso',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'success',
          severity: 'low'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          userId: '2',
          userEmail: 'maria@empresa.com',
          action: 'CREATE_RISK',
          resource: 'Risk Management',
          details: 'Novo risco criado: "Falha no sistema de backup"',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          status: 'success',
          severity: 'medium'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          userId: '3',
          userEmail: 'carlos@empresa.com',
          action: 'LOGIN_FAILED',
          resource: 'Authentication',
          details: 'Tentativa de login falhada - senha incorreta',
          ipAddress: '203.0.113.1',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          status: 'failed',
          severity: 'high'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          userId: '1',
          userEmail: 'admin@empresa.com',
          action: 'UPDATE_SETTINGS',
          resource: 'Tenant Settings',
          details: 'Configurações de segurança atualizadas',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'success',
          severity: 'medium'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: '4',
          userEmail: 'ana@empresa.com',
          action: 'EXPORT_DATA',
          resource: 'Data Management',
          details: 'Exportação de dados de usuários iniciada',
          ipAddress: '172.16.0.10',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          status: 'success',
          severity: 'high'
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falha</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Baixo</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4" />;
    if (action.includes('CREATE') || action.includes('UPDATE') || action.includes('DELETE')) return <Activity className="h-4 w-4" />;
    if (action.includes('SECURITY') || action.includes('SETTINGS')) return <Shield className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleExportLogs = () => {
    // Simular exportação de logs
    const csvContent = [
      'Timestamp,User,Action,Resource,Status,Severity,IP Address,Details',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.userEmail},${log.action},${log.resource},${log.status},${log.severity},${log.ipAddress},"${log.details}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${tenantId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando logs de atividade...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Logs de Atividade
              </CardTitle>
              <CardDescription>
                Visualize todas as atividades realizadas na organização
              </CardDescription>
            </div>
            <Button onClick={handleExportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por usuário, ação, IP ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGIN_FAILED">Login falhado</SelectItem>
                <SelectItem value="CREATE_RISK">Criar risco</SelectItem>
                <SelectItem value="UPDATE_SETTINGS">Atualizar config</SelectItem>
                <SelectItem value="EXPORT_DATA">Exportar dados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">{logs.length}</div>
              <div className="text-xs text-muted-foreground">Total de logs</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {logs.filter(l => l.status === 'success').length}
              </div>
              <div className="text-xs text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {logs.filter(l => l.status === 'failed').length}
              </div>
              <div className="text-xs text-muted-foreground">Falhas</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {logs.filter(l => l.severity === 'high' || l.severity === 'critical').length}
              </div>
              <div className="text-xs text-muted-foreground">Alta severidade</div>
            </div>
          </div>

          {/* Tabela de Logs */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{log.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm">{log.action}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{log.resource}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(log.severity)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{log.ipAddress}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedAction !== 'all' || selectedSeverity !== 'all'
                ? 'Nenhum log encontrado com os filtros aplicados.'
                : 'Nenhum log de atividade encontrado.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};