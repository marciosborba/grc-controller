/**
 * COMPONENTE DE GESTAO DE CHAVES CRIPTOGRAFICAS POR TENANT
 * 
 * Componente para gerenciar chaves criptograficas de tenants especificos.
 * Integrado ao sistema de criptografia por tenant implementado.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tenantCrypto, type TenantKeyInfo, type EncryptionPurpose } from '@/utils/tenantCrypto';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Key,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Settings,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Zap,
  Database,
  Lock,
  Unlock,
  RotateCcw,
  TrendingUp,
  Users,
  Calendar,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TenantCryptoManagementProps {
  tenantId: string;
  tenantName: string;
}

interface CryptoStats {
  operationType: string;
  operationDate: string;
  operationCount: number;
  successCount: number;
  errorCount: number;
  avgPerformanceMs: number;
  maxPerformanceMs: number;
}

interface TestResult {
  purpose: EncryptionPurpose;
  testData: string;
  encrypted: string;
  decrypted: string;
  success: boolean;
  performanceMs: number;
  error?: string;
}

const TenantCryptoManagement: React.FC<TenantCryptoManagementProps> = ({ 
  tenantId, 
  tenantName 
}) => {
  const { user } = useAuth();
  const [keyInfo, setKeyInfo] = useState<TenantKeyInfo[]>([]);
  const [cryptoStats, setCryptoStats] = useState<CryptoStats[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingEncryption, setIsTestingEncryption] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<EncryptionPurpose>('general');
  const [testData, setTestData] = useState('Dados de teste para criptografia');
  const [showDecryptedData, setShowDecryptedData] = useState<Record<string, boolean>>({});
  const [rotatingKeys, setRotatingKeys] = useState<Set<string>>(new Set());
  const [creatingKeys, setCreatingKeys] = useState(false);

  const hasPermission = user?.isPlatformAdmin || user?.role === 'admin' || true; // Temporariamente permitir acesso

  // Carregar informacoes das chaves
  const loadKeyInfo = async () => {
    try {
      setLoading(true);
      const keys = await tenantCrypto.getTenantKeyInfo(tenantId);
      setKeyInfo(keys);
    } catch (error) {
      console.error('Erro ao carregar informacoes das chaves:', error);
      toast.error('Erro ao carregar informacoes das chaves');
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatisticas de criptografia
  const loadCryptoStats = async () => {
    try {
      const stats = await tenantCrypto.getCryptoStats(tenantId, 30); // ultimos 30 dias
      setCryptoStats(stats);
      
      const cache = tenantCrypto.getCacheStats();
      setCacheStats(cache);
    } catch (error) {
      console.error('Erro ao carregar estatisticas:', error);
      toast.error('Erro ao carregar estatisticas de criptografia');
    }
  };

  // Rotacionar chave especifica
  const rotateKey = async (purpose: EncryptionPurpose, reason: string = 'manual') => {
    try {
      setRotatingKeys(prev => new Set(prev).add(purpose));
      
      const success = await tenantCrypto.rotateKey(tenantId, purpose, reason);
      
      if (success) {
        toast.success(`Chave ${purpose} rotacionada com sucesso`);
        await loadKeyInfo();
        await loadCryptoStats();
      }
    } catch (error) {
      console.error('Erro ao rotacionar chave:', error);
      toast.error('Erro ao rotacionar chave');
    } finally {
      setRotatingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(purpose);
        return newSet;
      });
    }
  };

  // Criar chaves para o tenant (se nao existirem)
  const createTenantKeys = async () => {
    try {
      setCreatingKeys(true);
      
      const success = await tenantCrypto.createTenantKeys(tenantId);
      
      if (success) {
        toast.success('Chaves criptograficas criadas com sucesso');
        await loadKeyInfo();
      }
    } catch (error) {
      console.error('Erro ao criar chaves:', error);
      toast.error('Erro ao criar chaves criptograficas');
    } finally {
      setCreatingKeys(false);
    }
  };

  // Testar criptografia
  const testEncryption = async () => {
    if (!testData.trim()) {
      toast.error('Digite dados para testar');
      return;
    }

    try {
      setIsTestingEncryption(true);
      const results: TestResult[] = [];
      
      const purposes: EncryptionPurpose[] = ['general', 'pii', 'financial', 'audit', 'compliance'];
      
      for (const purpose of purposes) {
        const startTime = performance.now();
        
        try {
          // Testar criptografia
          const encryptResult = await tenantCrypto.encrypt(
            tenantId,
            testData,
            purpose,
            { tableName: 'test', fieldName: 'test_field' }
          );
          
          if (!encryptResult.success) {
            throw new Error(encryptResult.error || 'Falha na criptografia');
          }
          
          // Testar descriptografia
          const decryptResult = await tenantCrypto.decrypt(
            tenantId,
            encryptResult.data!,
            purpose,
            { tableName: 'test', fieldName: 'test_field' }
          );
          
          if (!decryptResult.success) {
            throw new Error(decryptResult.error || 'Falha na descriptografia');
          }
          
          const endTime = performance.now();
          const performanceMs = Math.round(endTime - startTime);
          
          results.push({
            purpose,
            testData,
            encrypted: encryptResult.data!,
            decrypted: decryptResult.data!,
            success: decryptResult.data === testData,
            performanceMs
          });
          
        } catch (error: any) {
          const endTime = performance.now();
          const performanceMs = Math.round(endTime - startTime);
          
          results.push({
            purpose,
            testData,
            encrypted: '',
            decrypted: '',
            success: false,
            performanceMs,
            error: error.message
          });
        }
      }
      
      setTestResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        toast.success(`Todos os testes passaram! (${successCount}/${totalCount})`);
      } else {
        toast.warning(`${successCount}/${totalCount} testes passaram`);
      }
      
    } catch (error) {
      console.error('Erro no teste de criptografia:', error);
      toast.error('Erro ao executar teste de criptografia');
    } finally {
      setIsTestingEncryption(false);
    }
  };

  // Limpar cache do tenant
  const clearTenantCache = async (purpose?: EncryptionPurpose) => {
    try {
      tenantCrypto.clearCache(tenantId, purpose);
      
      const cache = tenantCrypto.getCacheStats();
      setCacheStats(cache);
      
      toast.success(
        purpose 
          ? `Cache da chave ${purpose} limpo` 
          : 'Cache do tenant limpo'
      );
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
    }
  };

  // Obter status da chave
  const getKeyStatusBadge = (keyInfo: TenantKeyInfo) => {
    switch (keyInfo.status) {
      case 'OK':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'ROTATION_WARNING':
        return <Badge variant="secondary" className="bg-yellow-500">Atencao</Badge>;
      case 'ROTATION_NEEDED':
        return <Badge variant="destructive">Rotacao Necessaria</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Obter icone do proposito
  const getPurposeIcon = (purpose: EncryptionPurpose) => {
    switch (purpose) {
      case 'general':
        return <Database className="h-4 w-4" />;
      case 'pii':
        return <Users className="h-4 w-4" />;
      case 'financial':
        return <TrendingUp className="h-4 w-4" />;
      case 'audit':
        return <Eye className="h-4 w-4" />;
      case 'compliance':
        return <Shield className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  // Obter nome amigavel do proposito
  const getPurposeName = (purpose: EncryptionPurpose) => {
    switch (purpose) {
      case 'general':
        return 'Geral';
      case 'pii':
        return 'Dados Pessoais (PII)';
      case 'financial':
        return 'Financeiro';
      case 'audit':
        return 'Auditoria';
      case 'compliance':
        return 'Compliance';
      default:
        return purpose;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (hasPermission && tenantId) {
      loadKeyInfo();
      loadCryptoStats();
    }
  }, [tenantId, hasPermission]);

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
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Gestao de Chaves Criptograficas
          </h3>
          <p className="text-sm text-muted-foreground">
            Tenant: {tenantName} ({tenantId})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadKeyInfo();
              loadCryptoStats();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {keyInfo.length === 0 && (
            <Button
              onClick={createTenantKeys}
              disabled={creatingKeys}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creatingKeys ? 'Criando...' : 'Criar Chaves'}
            </Button>
          )}
        </div>
      </div>

      {/* Status das Chaves */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status das Chaves Criptograficas
          </CardTitle>
          <CardDescription>
            Informacoes sobre as chaves de criptografia do tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando informacoes das chaves...</p>
            </div>
          ) : keyInfo.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-muted-foreground mb-2">
                Nenhuma chave encontrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este tenant nao possui chaves criptograficas configuradas.
              </p>
              <Button onClick={createTenantKeys} disabled={creatingKeys}>
                <Plus className="h-4 w-4 mr-2" />
                {creatingKeys ? 'Criando Chaves...' : 'Criar Chaves Agora'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {keyInfo.map((key) => (
                <div
                  key={key.purpose}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getPurposeIcon(key.purpose)}
                    <div>
                      <div className="font-medium">{getPurposeName(key.purpose)}</div>
                      <div className="text-sm text-muted-foreground">
                        Versao {key.version} - {key.keyAgeDays} dias
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getKeyStatusBadge(key)}
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearTenantCache(key.purpose)}
                        title="Limpar cache desta chave"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={rotatingKeys.has(key.purpose)}
                            title="Rotacionar chave"
                          >
                            {rotatingKeys.has(key.purpose) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rotacionar Chave</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja rotacionar a chave "{getPurposeName(key.purpose)}"?
                              <br /><br />
                              <strong>Atencao:</strong> Esta acao ira:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Gerar uma nova chave criptografica</li>
                                <li>Invalidar a chave atual</li>
                                <li>Limpar o cache relacionado</li>
                                <li>Registrar a operacao nos logs de auditoria</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => rotateKey(key.purpose, 'manual_admin')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Rotacionar Chave
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de Criptografia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste de Criptografia
          </CardTitle>
          <CardDescription>
            Teste o funcionamento da criptografia para este tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testData">Dados para Teste</Label>
              <Textarea
                id="testData"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="Digite os dados que deseja testar..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Acoes</Label>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={testEncryption}
                  disabled={isTestingEncryption || !testData.trim()}
                  className="w-full"
                >
                  {isTestingEncryption ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Testar Criptografia
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearTenantCache()}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todo Cache
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-medium">Resultados dos Testes</h4>
              <div className="space-y-2">
                {testResults.map((result) => (
                  <div
                    key={result.purpose}
                    className={cn(
                      "p-3 rounded-lg border",
                      result.success 
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPurposeIcon(result.purpose)}
                        <span className="font-medium">{getPurposeName(result.purpose)}</span>
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Timer className="h-4 w-4" />
                        {result.performanceMs}ms
                      </div>
                    </div>
                    
                    {result.success ? (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Dados criptografados:</span>
                          <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all">
                            {showDecryptedData[result.purpose] ? result.decrypted : result.encrypted}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDecryptedData(prev => ({
                                ...prev,
                                [result.purpose]: !prev[result.purpose]
                              }))}
                            >
                              {showDecryptedData[result.purpose] ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Mostrar Descriptografado
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    showDecryptedData[result.purpose] ? result.decrypted : result.encrypted
                                  );
                                  toast.success('Dados copiados para a area de transferencia');
                                } catch (error) {
                                  toast.error('Erro ao copiar dados');
                                }
                              }}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        <span className="font-medium">Erro:</span> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatisticas */}
      {cryptoStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatisticas de Uso (Ultimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Estatisticas do Cache */}
              {cacheStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{cacheStats.size || 0}</div>
                    <div className="text-sm text-muted-foreground">Entradas no Cache</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats.hitRate ? cacheStats.hitRate.toFixed(1) : '0.0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {cacheStats.memoryUsage ? (cacheStats.memoryUsage / 1024 / 1024).toFixed(1) : '0.0'}MB
                    </div>
                    <div className="text-sm text-muted-foreground">Uso de Memoria</div>
                  </div>
                </div>
              )}

              {/* Tabela de Estatisticas */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operacao</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Sucesso</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead>Performance Media</TableHead>
                      <TableHead>Performance Maxima</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cryptoStats.filter(stat => stat && stat.operationType).map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {stat.operationType === 'encrypt' && <Lock className="h-4 w-4 text-blue-500" />}
                            {stat.operationType === 'decrypt' && <Unlock className="h-4 w-4 text-green-500" />}
                            {stat.operationType === 'key_rotation' && <RotateCcw className="h-4 w-4 text-orange-500" />}
                            {stat.operationType === 'key_generation' && <Plus className="h-4 w-4 text-purple-500" />}
                            {stat.operationType ? (stat.operationType.charAt(0).toUpperCase() + stat.operationType.slice(1)) : 'Desconhecido'}
                          </div>
                        </TableCell>
                        <TableCell>{stat.operationDate ? new Date(stat.operationDate).toLocaleDateString('pt-BR') : '-'}</TableCell>
                        <TableCell>{stat.operationCount || 0}</TableCell>
                        <TableCell className="text-green-600">{stat.successCount || 0}</TableCell>
                        <TableCell className="text-red-600">{stat.errorCount || 0}</TableCell>
                        <TableCell>{stat.avgPerformanceMs ? stat.avgPerformanceMs.toFixed(1) : '0'}ms</TableCell>
                        <TableCell>{stat.maxPerformanceMs || 0}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantCryptoManagement;
