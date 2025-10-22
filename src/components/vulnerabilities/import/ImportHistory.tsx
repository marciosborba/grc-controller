import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Download,
  Eye,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ImportJob, ImportSourceType } from './types/import';
import { createImportService } from '@/services/VulnerabilityImportService';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface ImportHistoryProps {
  onJobSelect?: (job: ImportJob) => void;
}

export default function ImportHistory({ onJobSelect }: ImportHistoryProps) {
  const { user } = useAuth();
  const tenantId = useCurrentTenantId();
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && tenantId) {
      loadData();
    }
  }, [user, tenantId]);

  const loadData = async () => {
    if (!user || !tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const importService = createImportService(tenantId, user.id);
      
      // Carregar jobs e estatísticas em paralelo
      const [jobsResponse, statsResponse] = await Promise.all([
        importService.getImportJobs(),
        importService.getImportStatistics()
      ]);

      if (jobsResponse.success) {
        setJobs(jobsResponse.data || []);
      } else {
        throw new Error(jobsResponse.error || 'Erro ao carregar jobs');
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao carregar histórico: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSourceTypeLabel = (sourceType: ImportSourceType) => {
    const labels: Record<ImportSourceType, string> = {
      nessus_file: 'Nessus (Arquivo)',
      nessus_api: 'Nessus (API)',
      qualys_file: 'Qualys (Arquivo)',
      qualys_api: 'Qualys (API)',
      openvas_file: 'OpenVAS',
      rapid7_api: 'Rapid7',
      burp_file: 'Burp Suite',
      owasp_zap_file: 'OWASP ZAP (Arquivo)',
      owasp_zap_api: 'OWASP ZAP (API)',
      sonarqube_api: 'SonarQube',
      checkmarx_api: 'Checkmarx',
      veracode_api: 'Veracode',
      aws_inspector_api: 'AWS Inspector v2',
      azure_defender_api: 'Azure Defender',
      gcp_security_api: 'GCP Security',
      orca_security_api: 'Orca Security',
      csv_file: 'CSV',
      json_file: 'JSON',
      xml_file: 'XML',
      generic_api: 'API Genérica'
    };
    return labels[sourceType] || sourceType;
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const calculateProgress = (job: ImportJob) => {
    if (job.total_records === 0) return 0;
    return Math.round((job.processed_records / job.total_records) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Erro ao carregar histórico:</p>
                <p className="text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statistics.total_jobs}</p>
                  <p className="text-sm text-muted-foreground">Total de Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{statistics.successful_jobs}</p>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{statistics.failed_jobs}</p>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{statistics.total_vulnerabilities}</p>
                  <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Importações
              </CardTitle>
              <CardDescription>
                Últimas {jobs.length} importações realizadas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma importação encontrada</p>
              <p className="text-muted-foreground">
                Inicie sua primeira importação para ver o histórico aqui
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Vulnerabilidades</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Badge className={getStatusBadgeColor(job.status)}>
                            {job.status === 'pending' && 'Pendente'}
                            {job.status === 'processing' && 'Processando'}
                            {job.status === 'completed' && 'Concluído'}
                            {job.status === 'failed' && 'Falhou'}
                            {job.status === 'cancelled' && 'Cancelado'}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium">
                          {getSourceTypeLabel(job.source_type)}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        {job.file_name ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-32" title={job.file_name}>
                              {job.file_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">API</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {job.status === 'processing' ? (
                          <div className="space-y-1">
                            <Progress value={calculateProgress(job)} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {job.processed_records} / {job.total_records}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm">
                            {job.total_records > 0 ? `${job.processed_records} / ${job.total_records}` : '-'}
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">
                              {job.successful_imports}
                            </span>
                            {job.failed_imports > 0 && (
                              <span className="text-sm font-medium text-red-600">
                                / {job.failed_imports} falhas
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">
                          {formatDuration(job.started_at, job.completed_at)}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">
                          {new Date(job.started_at).toLocaleString()}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onJobSelect?.(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {job.status === 'completed' && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}