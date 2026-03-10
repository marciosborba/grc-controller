/**
 * PAGINA DE ADMINISTRACAO DE CRIPTOGRAFIA
 * 
 * Pagina centralizada para administracao do sistema de criptografia
 * por tenant, incluindo dashboard, exemplos e ferramentas.
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  BarChart3,
  FileText,
  Settings,
  Key,
  Activity,
  Users,
  Database,
  Zap,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import CryptoDashboard from './CryptoDashboard';
import CryptoFormExample from './CryptoFormExample';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CryptoAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const hasPermission = user?.isPlatformAdmin || false;
  
  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
              <p>Esta pagina e restrita a administradores da plataforma.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Administracao de Criptografia
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gestao de chaves criptograficas por tenant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Sistema Ativo
          </Badge>
          <Badge variant="secondary">
            AES-256-GCM
          </Badge>
        </div>
      </div>
      
      {/* Informacoes do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Isolamento Criptografico</AlertTitle>
          <AlertDescription>
            Cada tenant possui chaves unicas que garantem isolamento completo dos dados.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Key className="h-4 w-4" />
          <AlertTitle>Multiplos Propositos</AlertTitle>
          <AlertDescription>
            Chaves especificas para PII, dados financeiros, auditoria e compliance.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Auditoria Completa</AlertTitle>
          <AlertDescription>
            Todas as operacoes sao registradas para compliance e monitoramento.
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Exemplos
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Documentacao
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <CryptoDashboard />
        </TabsContent>
        
        {/* Exemplos */}
        <TabsContent value="examples" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exemplos de Implementacao
                </CardTitle>
                <CardDescription>
                  Demonstracoes praticas de como usar o sistema de criptografia
                </CardDescription>
              </CardHeader>
            </Card>
            
            <CryptoFormExample />
          </div>
        </TabsContent>
        
        {/* Ferramentas */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ferramenta de Teste */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Teste de Criptografia
                </CardTitle>
                <CardDescription>
                  Teste a funcionalidade de criptografia para qualquer tenant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => setActiveTab('examples')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Abrir Ferramenta
                </Button>
              </CardContent>
            </Card>
            
            {/* Gerenciamento de Chaves */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-500" />
                  Gerenciamento de Chaves
                </CardTitle>
                <CardDescription>
                  Gerencie chaves criptograficas por tenant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Ver no Tenant Management
                </Button>
              </CardContent>
            </Card>
            
            {/* Auditoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Logs de Auditoria
                </CardTitle>
                <CardDescription>
                  Visualize logs de operacoes criptograficas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Ver Logs
                </Button>
              </CardContent>
            </Card>
            
            {/* Cache Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  Gerenciamento de Cache
                </CardTitle>
                <CardDescription>
                  Monitore e gerencie o cache de chaves
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Ver Cache
                </Button>
              </CardContent>
            </Card>
            
            {/* Performance Monitor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Monitor de Performance
                </CardTitle>
                <CardDescription>
                  Monitore performance das operacoes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab('dashboard')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Dashboard
                </Button>
              </CardContent>
            </Card>
            
            {/* Backup & Recovery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription>
                  Ferramentas de backup e recuperacao
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Em Desenvolvimento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Documentacao */}
        <TabsContent value="docs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guia de Implementacao */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Guia de Implementacao
                </CardTitle>
                <CardDescription>
                  Como implementar criptografia em seus componentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Importar o Hook</h4>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                    {`import { useTenantCrypto } from '@/hooks/useTenantCrypto';`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">2. Usar no Componente</h4>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                    {`const { encryptPII, decryptPII } = useTenantCrypto();`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">3. Criptografar Dados</h4>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                    {`const encrypted = await encryptPII('dados sensiveis');`}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Referencia da API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  Referencia da API
                </CardTitle>
                <CardDescription>
                  Funcoes disponiveis no sistema de criptografia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Funcoes de Conveniencia</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>- <code>encryptPII(data)</code> - Dados pessoais</li>
                      <li>- <code>encryptFinancial(data)</code> - Dados financeiros</li>
                      <li>- <code>encryptAudit(data)</code> - Dados de auditoria</li>
                      <li>- <code>encryptCompliance(data)</code> - Dados de compliance</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Funcoes de Gerenciamento</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>- <code>rotateKey(purpose)</code> - Rotacionar chave</li>
                      <li>- <code>createTenantKeys()</code> - Criar chaves</li>
                      <li>- <code>clearCache()</code> - Limpar cache</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Funcoes de Teste</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>- <code>testEncryption(data)</code> - Testar sistema</li>
                      <li>- <code>isEncrypted(data)</code> - Verificar se esta criptografado</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Melhores Praticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Melhores Praticas
                </CardTitle>
                <CardDescription>
                  Recomendacoes para uso seguro do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Sempre use o proposito correto</strong> - PII para dados pessoais, financial para valores monetarios
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Trate erros adequadamente</strong> - Sempre verifique o resultado das operacoes
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Use cache inteligentemente</strong> - O sistema ja otimiza automaticamente
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Monitore performance</strong> - Use o dashboard para acompanhar metricas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Troubleshooting
                </CardTitle>
                <CardDescription>
                  Solucoes para problemas comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-red-600">Erro: "Chave nao encontrada"</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Execute <code>createTenantKeys()</code> para criar as chaves do tenant
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-red-600">Performance lenta</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verifique o cache hit rate no dashboard. Use <code>clearCache()</code> se necessario
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-red-600">Dados corrompidos</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verifique os logs de auditoria e considere rotacionar a chave
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoAdminPage;
