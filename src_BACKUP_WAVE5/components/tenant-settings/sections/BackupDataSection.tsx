import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Download, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface BackupDataSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const BackupDataSection: React.FC<BackupDataSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    frequency: 'daily',
    retentionDays: 30,
    includeFiles: true,
    includeUserData: true,
    includeSystemLogs: false,
    encryptBackup: true
  });

  const [backupHistory] = useState([
    {
      id: '1',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      size: '2.3 GB',
      status: 'completed',
      type: 'automatic'
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      size: '2.1 GB',
      status: 'completed',
      type: 'automatic'
    },
    {
      id: '3',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      size: '2.2 GB',
      status: 'completed',
      type: 'manual'
    }
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simular criação de backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Backup criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">Em andamento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações de Backup
          </CardTitle>
          <CardDescription>
            Configure backups automáticos dos dados da organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações Automáticas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Criar backups automaticamente conforme programação
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={backupSettings.autoBackup}
                onCheckedChange={(checked) => {
                  setBackupSettings({...backupSettings, autoBackup: checked});
                  onSettingsChange();
                }}
              />
            </div>

            {backupSettings.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select
                    value={backupSettings.frequency}
                    onValueChange={(value) => {
                      setBackupSettings({...backupSettings, frequency: value});
                      onSettingsChange();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Retenção (dias)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={backupSettings.retentionDays}
                    onChange={(e) => {
                      setBackupSettings({
                        ...backupSettings,
                        retentionDays: parseInt(e.target.value)
                      });
                      onSettingsChange();
                    }}
                    min={7}
                    max={365}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Conteúdo do Backup */}
          <div className="space-y-4">
            <h4 className="font-medium">Conteúdo do Backup</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-files">Incluir arquivos e documentos</Label>
                <Switch
                  id="include-files"
                  checked={backupSettings.includeFiles}
                  onCheckedChange={(checked) => {
                    setBackupSettings({...backupSettings, includeFiles: checked});
                    onSettingsChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-user-data">Incluir dados de usuários</Label>
                <Switch
                  id="include-user-data"
                  checked={backupSettings.includeUserData}
                  onCheckedChange={(checked) => {
                    setBackupSettings({...backupSettings, includeUserData: checked});
                    onSettingsChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-logs">Incluir logs do sistema</Label>
                <Switch
                  id="include-logs"
                  checked={backupSettings.includeSystemLogs}
                  onCheckedChange={(checked) => {
                    setBackupSettings({...backupSettings, includeSystemLogs: checked});
                    onSettingsChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="encrypt-backup">Criptografar backup</Label>
                  <p className="text-xs text-muted-foreground">Recomendado para segurança</p>
                </div>
                <Switch
                  id="encrypt-backup"
                  checked={backupSettings.encryptBackup}
                  onCheckedChange={(checked) => {
                    setBackupSettings({...backupSettings, encryptBackup: checked});
                    onSettingsChange();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Backup Manual */}
          <div className="space-y-4">
            <h4 className="font-medium">Backup Manual</h4>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                {isCreatingBackup ? 'Criando Backup...' : 'Criar Backup Agora'}
              </Button>
              
              {isCreatingBackup && (
                <div className="flex-1">
                  <Progress value={33} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Processando dados... Isso pode levar alguns minutos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Visualize e gerencie backups anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {new Date(backup.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(backup.date).toLocaleTimeString('pt-BR')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tamanho: {backup.size} • Tipo: {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(backup.status)}
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {backupHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum backup encontrado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas e Informações */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Os backups são armazenados de forma segura e criptografada.
          Mantenha suas chaves de recuperação em local seguro para garantir a restauração dos dados.
        </AlertDescription>
      </Alert>
    </div>
  );
};