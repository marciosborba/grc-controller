import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Key, Plus, RotateCcw, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CryptoKey {
  id: string;
  name: string;
  type: 'master' | 'data' | 'backup';
  algorithm: string;
  status: 'active' | 'rotating' | 'deprecated';
  createdAt: string;
  lastRotated: string;
  nextRotation: string;
  usage: number;
}

interface CryptoKeysSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const CryptoKeysSection: React.FC<CryptoKeysSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [keys] = useState<CryptoKey[]>([
    {
      id: '1',
      name: 'Master Key',
      type: 'master',
      algorithm: 'AES-256-GCM',
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      lastRotated: '2024-01-15T00:00:00Z',
      nextRotation: '2024-04-15T00:00:00Z',
      usage: 95
    },
    {
      id: '2',
      name: 'Data Encryption Key',
      type: 'data',
      algorithm: 'AES-256-GCM',
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      lastRotated: '2024-02-15T00:00:00Z',
      nextRotation: '2024-05-15T00:00:00Z',
      usage: 78
    },
    {
      id: '3',
      name: 'Backup Encryption Key',
      type: 'backup',
      algorithm: 'AES-256-GCM',
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      lastRotated: '2024-01-20T00:00:00Z',
      nextRotation: '2024-04-20T00:00:00Z',
      usage: 45
    }
  ]);

  const [isRotating, setIsRotating] = useState<string | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  const handleRotateKey = async (keyId: string) => {
    setIsRotating(keyId);
    try {
      // Simular rotação de chave
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Chave rotacionada com sucesso!');
      onSettingsChange();
    } catch (error) {
      toast.error('Erro ao rotacionar chave');
    } finally {
      setIsRotating(null);
    }
  };

  const handleGenerateRecoveryKey = () => {
    // Simular geração de chave de recuperação
    const recoveryKey = 'RK-' + Math.random().toString(36).substr(2, 16).toUpperCase();
    
    // Criar elemento temporário para download
    const element = document.createElement('a');
    const file = new Blob([`Chave de Recuperação: ${recoveryKey}\nData: ${new Date().toISOString()}\nTenant: ${tenantId}`], 
      { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `recovery-key-${tenantId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Chave de recuperação gerada e baixada!');
    setShowRecoveryDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'rotating':
        return <Badge className="bg-blue-100 text-blue-800">Rotacionando</Badge>;
      case 'deprecated':
        return <Badge className="bg-gray-100 text-gray-800">Depreciada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      master: 'Mestre',
      data: 'Dados',
      backup: 'Backup'
    };
    
    const typeColors = {
      master: 'bg-purple-100 text-purple-800',
      data: 'bg-blue-100 text-blue-800',
      backup: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={typeColors[type as keyof typeof typeColors]}>
        {typeLabels[type as keyof typeof typeLabels]}
      </Badge>
    );
  };

  const isRotationDue = (nextRotation: string) => {
    return new Date(nextRotation) <= new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Gestão de Chaves Criptográficas
              </CardTitle>
              <CardDescription>
                Gerencie chaves de criptografia e rotação automática
              </CardDescription>
            </div>
            
            <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Chave de Recuperação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar Chave de Recuperação</DialogTitle>
                  <DialogDescription>
                    A chave de recuperação permite restaurar o acesso aos dados criptografados 
                    em caso de perda das chaves principais.
                  </DialogDescription>
                </DialogHeader>
                
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Importante:</strong> Armazene a chave de recuperação em local seguro e offline.
                    Esta é a única forma de recuperar dados se as chaves principais forem perdidas.
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRecoveryDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGenerateRecoveryKey}>
                    Gerar e Baixar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Algoritmo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Rotação</TableHead>
                  <TableHead>Próxima Rotação</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {key.id}</div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(key.type)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{key.algorithm}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(key.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(key.lastRotated).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(key.nextRotation).toLocaleDateString('pt-BR')}
                        {isRotationDue(key.nextRotation) && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-orange-500 mr-1" />
                            <span className="text-xs text-orange-600">Rotação devida</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">{key.usage}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              key.usage > 90 ? 'bg-red-500' :
                              key.usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${key.usage}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRotateKey(key.id)}
                        disabled={isRotating === key.id || key.status === 'rotating'}
                      >
                        {isRotating === key.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Rotacionando...
                          </div>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Chaves */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chaves Ativas</p>
                <p className="text-2xl font-bold">{keys.filter(k => k.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rotações Devidas</p>
                <p className="text-2xl font-bold">
                  {keys.filter(k => isRotationDue(k.nextRotation)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uso Médio</p>
                <p className="text-2xl font-bold">
                  {Math.round(keys.reduce((acc, k) => acc + k.usage, 0) / keys.length)}%
                </p>
              </div>
              <Key className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {keys.some(k => isRotationDue(k.nextRotation)) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Ação Necessária:</strong> {keys.filter(k => isRotationDue(k.nextRotation)).length} chave(s) 
            precisam ser rotacionadas. Clique em "Rotacionar" para atualizar as chaves.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança:</strong> As chaves são armazenadas de forma segura e nunca são expostas em texto plano.
          A rotação regular das chaves é essencial para manter a segurança dos dados criptografados.
        </AlertDescription>
      </Alert>
    </div>
  );
};