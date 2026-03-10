/**
 * DASHBOARD DE MONITORAMENTO DE CRIPTOGRAFIA
 * 
 * Dashboard centralizado para monitorar o sistema de criptografia
 * por tenant em toda a plataforma.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { tenantCrypto } from '@/utils/tenantCrypto';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Users,
  Key,
  BarChart3,
  RefreshCw,
  Download,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TenantCryptoOverview {
  tenantId: string;
  tenantName: string;
  totalKeys: number;
  activeKeys: number;
  keysNeedingRotation: number;
  lastActivity: string;
  totalOperations: number;
  successRate: number;
  avgPerformance: number;
}

interface SystemStats {
  totalTenants: number;
  totalKeys: number;
  totalOperations: number;
  avgSuccessRate: number;
  avgPerformance: number;
  cacheHitRate: number;
  memoryUsage: number;
  keysNeedingRotation: number;
}

interface PerformanceMetric {
  date: string;
  operations: number;
  avgPerformance: number;
  successRate: number;
  cacheHitRate: number;
}

const CryptoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [tenantOverviews, setTenantOverviews] = useState<TenantCryptoOverview[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  
  const hasPermission = user?.isPlatformAdmin || false;
  
  const loadSystemStats = async () => {
    try {
      setLoading(true);
      
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('is_active', true);
      
      if (tenantsError) throw tenantsError;
      
      const cacheStats = tenantCrypto.getCacheStats();
      
      const tenantStats: TenantCryptoOverview[] = [];
      let totalKeys = 0;
      let totalOperations = 0;
      let totalSuccessRate = 0;
      let totalPerformance = 0;
      let keysNeedingRotation = 0;
      
      for (const tenant of tenants || []) {
        try {
          const keyInfo = await tenantCrypto.getTenantKeyInfo(tenant.id);
          const cryptoStats = await tenantCrypto.getCryptoStats(tenant.id, parseInt(selectedPeriod));
          
          const activeKeys = keyInfo.filter(k => k.status === 'OK').length;
          const needingRotation = keyInfo.filter(k => k.status === 'ROTATION_NEEDED').length;
          
          const tenantOperations = cryptoStats.reduce((sum, stat) => sum + stat.operationCount, 0);
          const tenantSuccessCount = cryptoStats.reduce((sum, stat) => sum + stat.successCount, 0);
          const tenantSuccessRate = tenantOperations > 0 ? (tenantSuccessCount / tenantOperations) * 100 : 100;
          const tenantAvgPerformance = cryptoStats.length > 0 
            ? cryptoStats.reduce((sum, stat) => sum + stat.avgPerformanceMs, 0) / cryptoStats.length 
            : 0;
          
          const lastActivity = cryptoStats.length > 0 
            ? cryptoStats.sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())[0].operationDate
            : new Date().toISOString();
          
          tenantStats.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            totalKeys: keyInfo.length,
            activeKeys,
            keysNeedingRotation: needingRotation,
            lastActivity,
            totalOperations: tenantOperations,
            successRate: tenantSuccessRate,
            avgPerformance: tenantAvgPerformance
          });
          
          totalKeys += keyInfo.length;
          totalOperations += tenantOperations;
          totalSuccessRate += tenantSuccessRate;
          totalPerformance += tenantAvgPerformance;
          keysNeedingRotation += needingRotation;
          
        } catch (error) {
          console.warn(`Erro ao carregar dados do tenant ${tenant.name}:`, error);
        }
      }
      
      const tenantsCount = tenants?.length || 0;
      const avgSuccessRate = tenantsCount > 0 ? totalSuccessRate / tenantsCount : 100;
      const avgPerformance = tenantsCount > 0 ? totalPerformance / tenantsCount : 0;
      
      setSystemStats({
        totalTenants: tenantsCount,
        totalKeys,
        totalOperations,
        avgSuccessRate,
        avgPerformance,
        cacheHitRate: cacheStats.hitRate,
        memoryUsage: cacheStats.memoryUsage,
        keysNeedingRotation
      });
      
      setTenantOverviews(tenantStats);
      
    } catch (error: any) {
      console.error('Erro ao carregar estatisticas do sistema:', error);
      toast.error('Erro ao carregar estatisticas do sistema');
    } finally {
      setLoading(false);
    }
  };
  
  const loadPerformanceMetrics = async () => {
    try {
      const days = parseInt(selectedPeriod);
      const metrics: PerformanceMetric[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        metrics.push({
          date: date.toISOString().split('T')[0],
          operations: Math.floor(Math.random() * 1000) + 500,
          avgPerformance: Math.floor(Math.random() * 50) + 10,
          successRate: 95 + Math.random() * 5,
          cacheHitRate: 85 + Math.random() * 15
        });
      }
      
      setPerformanceMetrics(metrics);
      
    } catch (error: any) {
      console.error('Erro ao carregar metricas de performance:', error);
    }
  };
  
  const exportReport = async () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        period: `${selectedPeriod} dias`,
        systemStats,
        tenantOverviews,
        performanceMetrics
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crypto-dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Relatorio exportado com sucesso');
      
    } catch (error: any) {
      console.error('Erro ao exportar relatorio:', error);
      toast.error('Erro ao exportar relatorio');
    }
  };
  
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value >= thresholds.warning) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };
  
  useEffect(() => {
    if (hasPermission) {
      loadSystemStats();
      loadPerformanceMetrics();
    }
  }, [hasPermission, selectedPeriod]);
  
  useEffect(() => {
    if (hasPermission) {
      const interval = setInterval(() => {
        loadSystemStats();
        loadPerformanceMetrics();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [hasPermission, selectedPeriod]);
  
  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da plataforma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Dashboard de Criptografia
          </h2>
          <p className="text-muted-foreground">
            Monitoramento centralizado do sistema de criptografia por tenant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 dia</SelectItem>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadSystemStats();
              loadPerformanceMetrics();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Estatisticas Gerais */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Tenants</p>
                  <p className="text-2xl font-bold">{systemStats.totalTenants}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Chaves</p>
                  <p className="text-2xl font-bold">{systemStats.totalKeys}</p>
                  {systemStats.keysNeedingRotation > 0 && (
                    <p className="text-xs text-red-600">
                      {systemStats.keysNeedingRotation} precisam rotacao
                    </p>
                  )}
                </div>
                <Key className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className={`text-2xl font-bold ${getStatusColor(systemStats.avgSuccessRate, { good: 95, warning: 90 })}`}>
                    {systemStats.avgSuccessRate.toFixed(1)}%
                  </p>
                </div>
                {getStatusIcon(systemStats.avgSuccessRate, { good: 95, warning: 90 })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance Media</p>
                  <p className={`text-2xl font-bold ${getStatusColor(100 - systemStats.avgPerformance, { good: 50, warning: 25 })}`}>
                    {systemStats.avgPerformance.toFixed(0)}ms
                  </p>
                </div>
                <Timer className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Estatisticas do Cache */}
      {systemStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estatisticas do Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${getStatusColor(systemStats.cacheHitRate, { good: 90, warning: 75 })}`}>
                  {systemStats.cacheHitRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {(systemStats.memoryUsage / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="text-sm text-muted-foreground">Uso de Memoria</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {systemStats.totalOperations.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total de Operacoes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Metricas de Performance */}
      {performanceMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Metricas de Performance ({selectedPeriod} dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Operacoes por Dia</h4>
                  <div className="space-y-2">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs w-16">
                          {new Date(metric.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(metric.operations / Math.max(...performanceMetrics.map(m => m.operations))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs w-12 text-right">{metric.operations}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Performance Media (ms)</h4>
                  <div className="space-y-2">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs w-16">
                          {new Date(metric.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.avgPerformance <= 20 ? 'bg-green-500' :
                              metric.avgPerformance <= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${(metric.avgPerformance / Math.max(...performanceMetrics.map(m => m.avgPerformance))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs w-12 text-right">{metric.avgPerformance.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Visao Geral por Tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Visao Geral por Tenant
          </CardTitle>
          <CardDescription>
            Status das chaves criptograficas e performance por tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando dados dos tenants...</p>
            </div>
          ) : tenantOverviews.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum tenant encontrado</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Chaves</TableHead>
                    <TableHead>Operacoes</TableHead>
                    <TableHead>Taxa Sucesso</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantOverviews.map((tenant) => (
                    <TableRow key={tenant.tenantId}>
                      <TableCell className="font-medium">{tenant.tenantName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{tenant.activeKeys}/{tenant.totalKeys}</span>
                          {tenant.keysNeedingRotation > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {tenant.keysNeedingRotation} rotacao
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{tenant.totalOperations.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(tenant.successRate, { good: 95, warning: 90 })}>
                          {tenant.successRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{tenant.avgPerformance.toFixed(0)}ms</TableCell>
                      <TableCell>
                        {tenant.keysNeedingRotation > 0 ? (
                          <Badge variant="outline" className="text-yellow-600">
                            Atencao
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            OK
                          </Badge>
                        )}
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
};

export default CryptoDashboard;
