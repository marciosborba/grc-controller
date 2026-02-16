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
  Shield,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  created_at: string;
  user_id: string;
  // Join fields
  profiles?: {
    email: string;
    full_name: string;
  };
  action: string;
  resource_type: string;
  details: any; // jsonb
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failed' | 'warning'; // If this column exists, else default to success
  severity: 'low' | 'medium' | 'high' | 'critical'; // If this column exists
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
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Loading limits/pagination could be added here
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    loadActivityLogs();
  }, [tenantId, selectedTimeRange]);

  const loadActivityLogs = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('activity_logs')
        // Now that FK is on the PK, Supabase should auto-detect it.
        // We use the table name 'profiles' which matches the alias we want.
        .select('*, profiles (email, full_name)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100); // Limit initially for performance

      // Apply Time Range Filter
      const now = new Date();
      let startTime = new Date();

      if (selectedTimeRange === '1h') startTime.setHours(now.getHours() - 1);
      if (selectedTimeRange === '24h') startTime.setHours(now.getHours() - 24);
      if (selectedTimeRange === '7d') startTime.setDate(now.getDate() - 7);
      if (selectedTimeRange === '30d') startTime.setDate(now.getDate() - 30);

      if (selectedTimeRange !== 'all') {
        query = query.gte('created_at', startTime.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase Query Error:', error);
        throw error;
      }

      setLogs(data as any[] || []);
    } catch (error: any) {
      console.error('Erro detalhado ao carregar logs:', error);
      toast.error(`Erro ao carregar logs: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const userEmail = log.profiles?.email || 'Sistema';
    const userAction = log.action || '';
    const userDetails = typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '');
    const userIp = log.ip_address || '';

    const matchesSearch = !searchTerm ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userIp.includes(searchTerm);

    // Simple mapping to group actions if needed, or exact match
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const getStatusBadge = (status: string) => {
    // Default to success if undefined (legacy logs)
    const s = status || 'success';
    switch (s) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Sucesso</Badge>;
      case 'failed':
      case 'error': // handle variance
        return <Badge className="bg-red-100 text-red-800 border-red-200">Falha</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Aviso</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    const a = (action || '').toUpperCase();
    if (a.includes('LOGIN')) return <User className="h-4 w-4" />;
    if (a.includes('CREATE') || a.includes('UPDATE') || a.includes('DELETE')) return <Activity className="h-4 w-4" />;
    if (a.includes('SECURITY') || a.includes('SETTINGS') || a.includes('BACKUP')) return <Shield className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatDetails = (details: any) => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    try {
      return JSON.stringify(details);
    } catch (e) {
      return String(details);
    }
  }

  const handleExportLogs = () => {
    const csvContent = [
      'Timestamp,User,Action,Resource,IP Address,Details',
      ...filteredLogs.map(log =>
        `${log.created_at},${log.profiles?.email || 'System'},${log.action},${log.resource_type || ''},${log.ip_address || ''},"${(JSON.stringify(log.details || '')).replace(/"/g, '""')}"`
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
    toast.success("Download iniciado");
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
            <Button onClick={handleExportLogs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar (CSV)
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="failed_login">Login falhado</SelectItem>
                <SelectItem value="suspicious_activity">Atividade Suspeita</SelectItem>
                <SelectItem value="security_violation">Violação de Segurança</SelectItem>
                <SelectItem value="backup_created">Backup</SelectItem>
                <SelectItem value="export_data">Exportação</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>IP</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {log.profiles?.full_name || 'Sistema'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.profiles?.email || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm capitalize">{log.action?.replace(/_/g, ' ')}</span>
                      </div>
                      {log.resource_type && (
                        <div className="text-xs text-muted-foreground">{log.resource_type}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{log.ip_address || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate" title={formatDetails(log.details)}>
                        {formatDetails(log.details)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedAction !== 'all'
                ? 'Nenhum log encontrado com os filtros aplicados.'
                : 'Nenhum log de atividade registrado neste período.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};