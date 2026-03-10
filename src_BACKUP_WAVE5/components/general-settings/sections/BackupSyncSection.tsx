import React, { useState } from 'react';
import { 
  HardDrive,
  Cloud, 
  Upload, 
  Download, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Calendar,
  Clock,
  Database,
  Zap,
  Shield,
  Archive,
  Folder
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface BackupConfig {
  id: string;
  name: string;
  type: 'local' | 'aws-s3' | 'google-drive' | 'onedrive' | 'ftp';
  destination: string;
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastBackup?: string;
  nextBackup?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  retention: number; // dias
  compression: boolean;
  encryption: boolean;
  includes: string[];
  excludes: string[];
  description?: string;
  credentials?: {
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
  };
}

interface BackupJob {
  id: string;
  configId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  progress: number;
  filesBackedUp: number;
  totalSize: number;
  errorMessage?: string;
}

interface SyncConfig {
  id: string;
  name: string;
  source: string;
  destination: string;
  type: 'one-way' | 'two-way';
  schedule: 'real-time' | 'hourly' | 'daily';
  isActive: boolean;
  lastSync?: string;
  nextSync?: string;
  status: 'idle' | 'syncing' | 'completed' | 'conflict' | 'error';
  conflictResolution: 'newer-wins' | 'source-wins' | 'manual';
}

const BackupSyncSection: React.FC = () => {
  const [backupConfigs, setBackupConfigs] = useState<BackupConfig[]>([
    {
      id: '1',
      name: 'Backup Completo Diário',
      type: 'aws-s3',
      destination: 'grc-backups-prod',
      schedule: 'daily',
      isActive: true,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextBackup: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      retention: 30,
      compression: true,
      encryption: true,
      includes: ['database', 'uploads', 'configs', 'logs'],
      excludes: ['temp', 'cache'],
      description: 'Backup completo da aplicação para AWS S3',
      credentials: {
        bucket: 'grc-backups-prod',
        region: 'us-east-1'
      }
    },
    {
      id: '2',
      name: 'Backup Local Semanal',
      type: 'local',
      destination: '/backups/weekly',
      schedule: 'weekly',
      isActive: false,
      status: 'idle',
      retention: 8,
      compression: false,
      encryption: false,
      includes: ['database'],
      excludes: [],
      description: 'Backup local semanal apenas do banco de dados'
    }
  ]);

  const [syncConfigs, setSyncConfigs] = useState<SyncConfig[]>([
    {
      id: '1',
      name: 'Sincronização Documentos',
      source: '/app/documents',
      destination: 'gs://grc-documents-sync',
      type: 'one-way',
      schedule: 'daily',
      isActive: true,
      lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      nextSync: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      conflictResolution: 'newer-wins'
    }
  ]);

  const [recentJobs, setRecentJobs] = useState<BackupJob[]>([
    {
      id: '1',
      configId: '1',
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      filesBackedUp: 1247,
      totalSize: 2.4 * 1024 * 1024 * 1024 // 2.4 GB
    },
    {
      id: '2',
      configId: '1',
      status: 'failed',
      startTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      progress: 45,
      filesBackedUp: 560,
      totalSize: 1.1 * 1024 * 1024 * 1024,
      errorMessage: 'Connection timeout to S3'
    }
  ]);

  const [activeTab, setActiveTab] = useState('backup');
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [editingBackup, setEditingBackup] = useState<BackupConfig | null>(null);
  const [editingSyncConfig, setEditingSyncConfig] = useState<SyncConfig | null>(null);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const [backupForm, setBackupForm] = useState({
    name: '',
    type: 'local' as const,
    destination: '',
    schedule: 'daily' as const,
    retention: 7,
    compression: true,
    encryption: false,
    description: '',
    includes: [] as string[],
    excludes: [] as string[]
  });

  const [syncForm, setSyncForm] = useState({
    name: '',
    source: '',
    destination: '',
    type: 'one-way' as const,
    schedule: 'daily' as const,
    conflictResolution: 'newer-wins' as const
  });

  const availableIncludes = [
    'database', 'uploads', 'configs', 'logs', 'documents', 
    'user-data', 'reports', 'certificates', 'policies'
  ];

  const resetBackupForm = () => {
    setBackupForm({
      name: '',
      type: 'local',
      destination: '',
      schedule: 'daily',
      retention: 7,
      compression: true,
      encryption: false,
      description: '',
      includes: [],
      excludes: []
    });
    setEditingBackup(null);
  };

  const resetSyncForm = () => {
    setSyncForm({
      name: '',
      source: '',
      destination: '',
      type: 'one-way',
      schedule: 'daily',
      conflictResolution: 'newer-wins'
    });
    setEditingSyncConfig(null);
  };

  const handleRunBackup = async (config: BackupConfig) => {
    setRunningJob(config.id);
    
    const newJob: BackupJob = {
      id: Date.now().toString(),
      configId: config.id,
      status: 'running',
      startTime: new Date().toISOString(),
      progress: 0,
      filesBackedUp: 0,
      totalSize: 0
    };
    
    setRecentJobs(prev => [newJob, ...prev.slice(0, 9)]);
    
    // Simular progresso do backup
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setRecentJobs(prev => 
        prev.map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                progress: i,
                filesBackedUp: Math.floor((i / 100) * 1500),
                totalSize: Math.floor((i / 100) * 2.8 * 1024 * 1024 * 1024)
              }
            : job
        )
      );
    }
    
    // Finalizar backup
    const success = Math.random() > 0.2; // 80% chance de sucesso
    
    setRecentJobs(prev => 
      prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: success ? 'completed' : 'failed',
              endTime: new Date().toISOString(),
              errorMessage: success ? undefined : 'Simulated backup error'
            }
          : job
      )
    );
    
    setBackupConfigs(prev => 
      prev.map(cfg => 
        cfg.id === config.id 
          ? { 
              ...cfg, 
              lastBackup: new Date().toISOString(),
              status: success ? 'completed' : 'failed'
            }
          : cfg
      )
    );
    
    setRunningJob(null);
    
    if (success) {
      toast.success(`Backup ${config.name} executado com sucesso!`);
    } else {
      toast.error(`Falha no backup ${config.name}`);
    }
  };

  const handleSaveBackup = () => {
    const newConfig: BackupConfig = {
      id: editingBackup?.id || Date.now().toString(),
      name: backupForm.name,
      type: backupForm.type,
      destination: backupForm.destination,
      schedule: backupForm.schedule,
      isActive: true,
      status: 'idle',
      retention: backupForm.retention,
      compression: backupForm.compression,
      encryption: backupForm.encryption,
      includes: backupForm.includes,
      excludes: backupForm.excludes,
      description: backupForm.description
    };

    if (editingBackup) {
      setBackupConfigs(prev => 
        prev.map(cfg => cfg.id === editingBackup.id ? newConfig : cfg)
      );
      toast.success('Configuração de backup atualizada!');
    } else {
      setBackupConfigs(prev => [...prev, newConfig]);
      toast.success('Nova configuração de backup criada!');
    }

    setIsBackupDialogOpen(false);
    resetBackupForm();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'aws-s3':
        return <Cloud className="h-5 w-5 text-orange-600" />;
      case 'google-drive':
        return <Cloud className="h-5 w-5 text-blue-600" />;
      case 'onedrive':
        return <Cloud className="h-5 w-5 text-blue-500" />;
      case 'local':
        return <HardDrive className="h-5 w-5 text-gray-600" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const activeBackups = backupConfigs.filter(cfg => cfg.isActive).length;
  const activeSyncs = syncConfigs.filter(cfg => cfg.isActive).length;
  const completedJobs = recentJobs.filter(job => job.status === 'completed').length;
  const failedJobs = recentJobs.filter(job => job.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5 sm:h-6 sm:w-6" />
            Backup & Sincronização
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure backups automáticos e sincronização de dados
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Backups Ativos</CardTitle>
            <Archive className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{activeBackups}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              configurações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Sincronizações</CardTitle>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{activeSyncs}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Sucessos</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{completedJobs}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              últimos jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Falhas</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{failedJobs}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              últimos jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
        <Shield className="h-4 w-4" />
        <AlertTitle>Segurança dos Backups</AlertTitle>
        <AlertDescription>
          Sempre ative criptografia para backups sensíveis e teste regularmente a integridade 
          dos dados. Configure retenção adequada para otimizar o uso de armazenamento.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">Backups</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
          <TabsTrigger value="jobs">Jobs Recentes</TabsTrigger>
        </TabsList>

        {/* Backup Configurations Tab */}
        <TabsContent value="backup" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Configurações de Backup</h3>
            <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetBackupForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Configuração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBackup ? 'Editar' : 'Nova'} Configuração de Backup
                  </DialogTitle>
                  <DialogDescription>
                    Configure um backup automático para seus dados
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backupName">Nome da Configuração</Label>
                      <Input
                        id="backupName"
                        value={backupForm.name}
                        onChange={(e) => setBackupForm(prev => ({...prev, name: e.target.value}))}
                        placeholder="Ex: Backup Diário Completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backupType">Tipo de Destino</Label>
                      <Select 
                        value={backupForm.type} 
                        onValueChange={(value: any) => setBackupForm(prev => ({...prev, type: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="aws-s3">AWS S3</SelectItem>
                          <SelectItem value="google-drive">Google Drive</SelectItem>
                          <SelectItem value="onedrive">OneDrive</SelectItem>
                          <SelectItem value="ftp">FTP/SFTP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      value={backupForm.destination}
                      onChange={(e) => setBackupForm(prev => ({...prev, destination: e.target.value}))}
                      placeholder={backupForm.type === 'local' ? '/backups/daily' : 'bucket-name or path'}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule">Agendamento</Label>
                      <Select 
                        value={backupForm.schedule} 
                        onValueChange={(value: any) => setBackupForm(prev => ({...prev, schedule: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="retention">Retenção (dias)</Label>
                      <Input
                        id="retention"
                        type="number"
                        min="1"
                        max="365"
                        value={backupForm.retention}
                        onChange={(e) => setBackupForm(prev => ({...prev, retention: parseInt(e.target.value)}))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={backupForm.compression}
                        onCheckedChange={(checked) => setBackupForm(prev => ({...prev, compression: checked}))}
                      />
                      <Label>Ativar compressão</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={backupForm.encryption}
                        onCheckedChange={(checked) => setBackupForm(prev => ({...prev, encryption: checked}))}
                      />
                      <Label>Ativar criptografia</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Incluir nos Backups</Label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableIncludes.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={item}
                            checked={backupForm.includes.includes(item)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setBackupForm(prev => ({
                                ...prev,
                                includes: checked 
                                  ? [...prev.includes, item]
                                  : prev.includes.filter(i => i !== item)
                              }));
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={item} className="text-sm capitalize">
                            {item}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backupDescription">Descrição</Label>
                    <Textarea
                      id="backupDescription"
                      value={backupForm.description}
                      onChange={(e) => setBackupForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Descreva o propósito deste backup..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveBackup}>
                    {editingBackup ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {backupConfigs.map((config) => (
              <Card key={config.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {getTypeIcon(config.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{config.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {config.type.toUpperCase()} • {config.schedule}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(config.status)}
                      <Switch checked={config.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {config.description && (
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {config.includes.slice(0, 3).map((item) => (
                      <Badge key={item} variant="outline" className="text-xs capitalize">
                        {item}
                      </Badge>
                    ))}
                    {config.includes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{config.includes.length - 3} mais
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Retenção:</span>
                      <span>{config.retention} dias</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Destino:</span>
                      <span className="text-xs truncate max-w-20" title={config.destination}>
                        {config.destination}
                      </span>
                    </div>
                  </div>

                  {config.lastBackup && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Último backup:</span>
                      <span className="text-xs">
                        {new Date(config.lastBackup).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunBackup(config)}
                      disabled={runningJob === config.id}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      {runningJob === config.id ? 'Executando...' : 'Executar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBackup(config);
                        setBackupForm({
                          name: config.name,
                          type: config.type,
                          destination: config.destination,
                          schedule: config.schedule,
                          retention: config.retention,
                          compression: config.compression,
                          encryption: config.encryption,
                          includes: config.includes,
                          excludes: config.excludes,
                          description: config.description || ''
                        });
                        setIsBackupDialogOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setBackupConfigs(prev => prev.filter(cfg => cfg.id !== config.id));
                        toast.success('Configuração removida!');
                      }}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sync Configurations Tab */}
        <TabsContent value="sync" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sincronizações</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sincronização
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {syncConfigs.map((sync) => (
              <Card key={sync.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{sync.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {sync.type} • {sync.schedule}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(sync.status)}
                      <Switch checked={sync.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Origem:</span>
                      <span className="text-xs font-mono">{sync.source}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Destino:</span>
                      <span className="text-xs font-mono">{sync.destination}</span>
                    </div>
                  </div>

                  {sync.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Última sincronização:</span>
                      <span className="text-xs">
                        {new Date(sync.lastSync).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Executar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <h3 className="text-lg font-semibold">Histórico de Jobs</h3>
          
          <div className="space-y-4">
            {recentJobs.map((job) => {
              const config = backupConfigs.find(cfg => cfg.id === job.configId);
              return (
                <Card key={job.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{config?.name || 'Backup'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(job.startTime).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          job.status === 'completed' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : job.status === 'running'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Arquivos:</span>
                        <span className="ml-2">{job.filesBackedUp.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tamanho:</span>
                        <span className="ml-2">{formatBytes(job.totalSize)}</span>
                      </div>
                      {job.endTime && (
                        <div>
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="ml-2">
                            {Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000 / 60)}min
                          </span>
                        </div>
                      )}
                    </div>

                    {job.errorMessage && (
                      <Alert className="mt-4 border-red-200 bg-red-50 dark:bg-red-950">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {job.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackupSyncSection;