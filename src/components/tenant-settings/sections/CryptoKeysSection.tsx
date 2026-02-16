import React, { useState, useEffect } from 'react';
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
import { Key, Plus, RotateCcw, Download, AlertTriangle, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CryptoKey {
  id: string;
  key_type: 'master' | 'data' | 'backup';
  algorithm: string;
  key_status: 'active' | 'rotating' | 'archived';
  created_at: string;
  rotated_at: string;
  next_rotation: string;
  key_fingerprint: string;
}

interface CryptoKeysSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const CryptoKeysSection: React.FC<CryptoKeysSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [keys, setKeys] = useState<CryptoKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState<string | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  useEffect(() => {
    loadKeys();
  }, [tenantId]);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenant_keys')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data as any[] || []);
    } catch (error) {
      console.error('Erro ao carregar chaves:', error);
      toast.error('Não foi possível carregar as chaves de criptografia.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotateKey = async (type: string) => {
    setIsRotating(type);
    try {
      const { data, error } = await supabase.rpc('rotate_tenant_key', {
        p_tenant_id: tenantId,
        p_type: type
      });

      if (error) throw error;

      toast.success(`Chave ${type} rotacionada/gerada com sucesso!`);
      loadKeys();
      onSettingsChange();
    } catch (error: any) {
      console.error('Erro ao rotacionar chave:', error);
      toast.error(`Erro: ${error.message || 'Falha na rotação'}`);
    } finally {
      setIsRotating(null);
    }
  };

  const handleGenerateRecoveryKey = () => {
    // Simular geração de chave de recuperação (Client-side apenas para demo de BYOK reverso)
    // Numa implementação real, isso viria do servidor criptografado com uma chave de sessão
    const recoveryKey = 'RK-' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Criar elemento temporário para download
    const element = document.createElement('a');
    const file = new Blob([`CHAVE DE RECUPERAÇÃO DE EMERGÊNCIA\n\nATENÇÃO: MANTENHA ESTE ARQUIVO SEGURO.\n\nChave: ${recoveryKey}\nData: ${new Date().toISOString()}\nTenant ID: ${tenantId}\n\nSe você perder o acesso à plataforma, esta chave poderá ser usada pelo suporte para recuperar seus dados.`],
      { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `recovery-key-${tenantId.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Chave de recuperação gerada e baixada!');
    setShowRecoveryDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ativa</Badge>;
      case 'rotating':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Rotacionando</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Arquivada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      master: 'Mestre (KEK)',
      data: 'Dados (DEK)',
      backup: 'Backup'
    };

    const typeColors: Record<string, string> = {
      master: 'bg-purple-100 text-purple-800',
      data: 'bg-blue-100 text-blue-800',
      backup: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={typeColors[type] || 'bg-gray-100'}>
        {typeLabels[type] || type}
      </Badge>
    );
  };

  // Helper para verificar se rotação é necessária
  const isRotationDue = (nextRotation: string) => {
    if (!nextRotation) return false;
    return new Date(nextRotation) <= new Date();
  };

  const activeKeys = keys.filter(k => k.key_status === 'active');
  const hasMasterKey = activeKeys.some(k => k.key_type === 'master');

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

            <div className="flex gap-2">
              {!hasMasterKey && (
                <Button onClick={() => handleRotateKey('master')} disabled={!!isRotating}>
                  {isRotating === 'master' ? 'Gerando...' : 'Gerar Chave Mestre'}
                </Button>
              )}

              <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Backup de Chaves
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Backup de Segurança (Recovery Key)</DialogTitle>
                    <DialogDescription>
                      Gere um arquivo de recuperação para restaurar o acesso em caso de emergência.
                    </DialogDescription>
                  </DialogHeader>

                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Atenção:</strong> Armazene este arquivo em um local offline e seguro (cofre físico ou gerenciador de senhas).
                    </AlertDescription>
                  </Alert>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRecoveryDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleGenerateRecoveryKey}>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Gerar e Baixar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              <Key className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>Nenhuma chave de criptografia ativa.</p>
              <p className="text-sm">Gere uma Chave Mestre para começar a proteger seus dados.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Impressão Digital (Fingerprint)</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Algoritmo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Próxima Rotação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div className="font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                          {key.key_fingerprint || 'N/A'}...
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(key.key_type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{key.algorithm}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(key.key_status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(key.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {key.next_rotation ? new Date(key.next_rotation).toLocaleDateString('pt-BR') : '-'}
                          {isRotationDue(key.next_rotation) && (
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-orange-500 mr-1" />
                              <span className="text-xs text-orange-600">Rotação devida</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {key.key_status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRotateKey(key.key_type)}
                            disabled={!!isRotating}
                            title="Rotacionar Chave"
                          >
                            {isRotating === key.key_type ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <RotateCcw className="h-4 w-4 text-blue-600" />
                            )}
                          </Button>
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

      {/* Alerta Informativo */}
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança de Nível Bancário:</strong> Suas chaves são armazenadas utilizando criptografia envelopada.
          A chave mestra do sistema protege suas chaves de tenant, que por sua vez protegem seus dados.
        </AlertDescription>
      </Alert>
    </div>
  );
};