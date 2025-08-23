// ============================================================================
// GERENCIADOR DE REGRAS DE ESCALAÇÃO DE NOTIFICAÇÕES
// ============================================================================
// Sistema para criar e gerenciar regras automáticas de escalação

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  Zap, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowRight,
  Filter,
  Save,
  X,
  TestTube,
  Activity,
  Target,
  Bell
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from 'sonner';

import { NotificationModule, NotificationType, NotificationPriority } from '@/types/notifications';
import { cn } from '@/lib/utils';

// Interface para regras de escalação
interface EscalationRule {
  id: string;
  name: string;
  description: string;
  module?: NotificationModule;
  type?: NotificationType;
  
  // Condições para ativar escalação
  conditions: {
    priority?: NotificationPriority[];
    statusDuration?: number; // minutos sem mudança de status
    noActionTaken?: boolean;
    overdueDays?: number;
    unreadDuration?: number; // minutos não lida
    specificUsers?: string[];
    specificRoles?: string[];
    timeOfDay?: { start: string; end: string };
    daysOfWeek?: number[]; // 0-6, domingo a sábado
  };
  
  // Ações de escalação
  escalationActions: {
    increasePriority?: boolean;
    newPriority?: NotificationPriority;
    assignToRoles?: string[];
    assignToUsers?: string[];
    createNewNotification?: boolean;
    sendEmail?: boolean;
    sendSms?: boolean;
    sendSlack?: boolean;
    executeWebhook?: boolean;
    webhookUrl?: string;
    customMessage?: string;
  };
  
  // Configurações
  isActive: boolean;
  maxEscalations?: number;
  escalationIntervalMinutes: number;
  priority: number; // para ordenação
  
  // Estatísticas
  timesTriggered: number;
  lastTriggered?: string;
  successRate: number;
  
  // Auditoria
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data para regras
const mockRules: EscalationRule[] = [
  {
    id: '1',
    name: 'Escalação Riscos Críticos',
    description: 'Escala riscos críticos não lidos após 30 minutos para gerência',
    module: 'risks',
    type: 'risk_escalated',
    conditions: {
      priority: ['critical'],
      unreadDuration: 30,
      noActionTaken: true
    },
    escalationActions: {
      assignToRoles: ['risk_manager', 'security_manager'],
      sendEmail: true,
      sendSlack: true,
      customMessage: 'Risco crítico requer atenção imediata da gerência'
    },
    isActive: true,
    maxEscalations: 3,
    escalationIntervalMinutes: 30,
    priority: 100,
    timesTriggered: 45,
    lastTriggered: '2024-01-20T14:30:00Z',
    successRate: 89.5,
    createdBy: 'admin',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T16:20:00Z'
  },
  {
    id: '2',
    name: 'Assessments Vencidos',
    description: 'Escala assessments vencidos após 1 dia para coordenadores',
    module: 'assessments',
    type: 'assessment_due',
    conditions: {
      overdueDays: 1,
      priority: ['high', 'medium']
    },
    escalationActions: {
      increasePriority: true,
      newPriority: 'high',
      assignToRoles: ['assessment_coordinator'],
      sendEmail: true,
      createNewNotification: true
    },
    isActive: true,
    maxEscalations: 2,
    escalationIntervalMinutes: 1440, // 24 horas
    priority: 80,
    timesTriggered: 23,
    lastTriggered: '2024-01-19T09:15:00Z',
    successRate: 95.2,
    createdBy: 'assessment_admin',
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-18T11:30:00Z'
  },
  {
    id: '3',
    name: 'LGPD Urgente',
    description: 'Escala solicitações LGPD críticas após 2 horas',
    module: 'privacy',
    type: 'privacy_request_received',
    conditions: {
      priority: ['critical', 'high'],
      statusDuration: 120,
      timeOfDay: { start: '08:00', end: '18:00' },
      daysOfWeek: [1, 2, 3, 4, 5] // Segunda a sexta
    },
    escalationActions: {
      assignToUsers: ['privacy_officer_1', 'privacy_officer_2'],
      sendEmail: true,
      sendSms: true,
      executeWebhook: true,
      webhookUrl: 'https://api.company.com/privacy/escalation'
    },
    isActive: true,
    maxEscalations: 1,
    escalationIntervalMinutes: 120,
    priority: 90,
    timesTriggered: 12,
    lastTriggered: '2024-01-18T15:45:00Z',
    successRate: 100,
    createdBy: 'privacy_admin',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-16T13:20:00Z'
  }
];

// Opções para roles
const availableRoles = [
  'admin',
  'risk_manager',
  'security_manager',
  'assessment_coordinator',
  'privacy_officer',
  'compliance_manager',
  'audit_manager',
  'policy_manager'
];

// Opções para usuários (mock)
const availableUsers = [
  { id: 'user1', name: 'João Silva', role: 'risk_manager' },
  { id: 'user2', name: 'Maria Santos', role: 'privacy_officer' },
  { id: 'user3', name: 'Pedro Costa', role: 'security_manager' },
  { id: 'user4', name: 'Ana Oliveira', role: 'assessment_coordinator' }
];

export const NotificationRulesManager: React.FC = () => {
  const [rules, setRules] = useState<EscalationRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<EscalationRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<Partial<EscalationRule>>({});

  // Filtrar regras
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = filterModule === 'all' || rule.module === filterModule;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.isActive) ||
                         (filterStatus === 'inactive' && !rule.isActive);
    
    return matchesSearch && matchesModule && matchesStatus;
  });

  // Inicializar form data
  const initializeFormData = (rule?: EscalationRule) => {
    if (rule) {
      setFormData({ ...rule });
    } else {
      setFormData({
        name: '',
        description: '',
        module: 'risks',
        conditions: {
          priority: [],
          statusDuration: 60,
          noActionTaken: false,
          unreadDuration: 30
        },
        escalationActions: {
          increasePriority: false,
          assignToRoles: [],
          assignToUsers: [],
          sendEmail: true,
          sendSms: false,
          sendSlack: false
        },
        isActive: true,
        maxEscalations: 3,
        escalationIntervalMinutes: 60,
        priority: 100
      });
    }
  };

  // Handlers
  const handleCreateRule = () => {
    setIsCreating(true);
    setIsEditing(true);
    initializeFormData();
  };

  const handleEditRule = (rule: EscalationRule) => {
    setSelectedRule(rule);
    setIsCreating(false);
    setIsEditing(true);
    initializeFormData(rule);
  };

  const handleSaveRule = () => {
    if (!formData.name || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const ruleData: EscalationRule = {
      id: isCreating ? `rule_${Date.now()}` : selectedRule!.id,
      name: formData.name!,
      description: formData.description!,
      module: formData.module,
      type: formData.type,
      conditions: formData.conditions!,
      escalationActions: formData.escalationActions!,
      isActive: formData.isActive!,
      maxEscalations: formData.maxEscalations || 3,
      escalationIntervalMinutes: formData.escalationIntervalMinutes!,
      priority: formData.priority || 100,
      timesTriggered: isCreating ? 0 : selectedRule!.timesTriggered,
      lastTriggered: selectedRule?.lastTriggered,
      successRate: isCreating ? 0 : selectedRule!.successRate,
      createdBy: isCreating ? 'current_user' : selectedRule!.createdBy,
      createdAt: isCreating ? new Date().toISOString() : selectedRule!.createdAt,
      updatedAt: new Date().toISOString()
    };

    if (isCreating) {
      setRules(prev => [ruleData, ...prev]);
      toast.success('Regra criada com sucesso');
    } else {
      setRules(prev => prev.map(r => r.id === ruleData.id ? ruleData : r));
      toast.success('Regra atualizada com sucesso');
    }

    setIsEditing(false);
    setIsCreating(false);
    setSelectedRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success('Regra excluída com sucesso');
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
        : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    toast.success(`Regra ${rule?.isActive ? 'desativada' : 'ativada'} com sucesso`);
  };

  const handleTestRule = (rule: EscalationRule) => {
    toast.info('Simulando execução da regra...', {
      description: 'Esta funcionalidade será implementada para testar regras'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Regras de Escalação</h1>
          <p className="text-muted-foreground">
            Configure regras automáticas para escalação de notificações
          </p>
        </div>

        <Button onClick={handleCreateRule}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Regras</p>
                <p className="text-2xl font-bold">{rules.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {rules.filter(r => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Execuções Hoje</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rules.reduce((sum, rule) => sum + (rule.timesTriggered || 0), 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Buscar</Label>
              <Input
                placeholder="Nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Módulo</Label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  <SelectItem value="risks">Riscos</SelectItem>
                  <SelectItem value="assessments">Assessments</SelectItem>
                  <SelectItem value="privacy">Privacidade</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Regras */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className={cn(
            "relative",
            !rule.isActive && "opacity-60"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {rule.module && (
                      <Badge variant="outline" className="text-xs">
                        {rule.module}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Prioridade {rule.priority}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {rule.description}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestRule(rule)}
                  >
                    <TestTube className="h-3 w-3 mr-1" />
                    Testar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleRule(rule.id)}
                  >
                    {rule.isActive ? (
                      <Pause className="h-3 w-3 mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    {rule.isActive ? 'Pausar' : 'Ativar'}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Regra</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a regra "{rule.name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRule(rule.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Condições */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Condições de Ativação
                  </Label>
                  <div className="space-y-2">
                    {rule.conditions.priority && rule.conditions.priority.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>Prioridade: {rule.conditions.priority.join(', ')}</span>
                      </div>
                    )}
                    {rule.conditions.unreadDuration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Não lida por {rule.conditions.unreadDuration} min</span>
                      </div>
                    )}
                    {rule.conditions.statusDuration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>Sem mudança por {rule.conditions.statusDuration} min</span>
                      </div>
                    )}
                    {rule.conditions.overdueDays && (
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Vencida há {rule.conditions.overdueDays} dias</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Ações de Escalação
                  </Label>
                  <div className="space-y-2">
                    {rule.escalationActions.increasePriority && (
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowUp className="h-4 w-4 text-red-500" />
                        <span>Aumentar prioridade para {rule.escalationActions.newPriority}</span>
                      </div>
                    )}
                    {rule.escalationActions.assignToRoles && rule.escalationActions.assignToRoles.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-green-500" />
                        <span>Atribuir para: {rule.escalationActions.assignToRoles.join(', ')}</span>
                      </div>
                    )}
                    {rule.escalationActions.sendEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bell className="h-4 w-4 text-blue-500" />
                        <span>Enviar email</span>
                      </div>
                    )}
                    {rule.escalationActions.sendSms && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bell className="h-4 w-4 text-purple-500" />
                        <span>Enviar SMS</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Estatísticas
                  </Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Execuções:</span>
                      <span className="font-medium">{rule.timesTriggered}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de sucesso:</span>
                      <span className="font-medium text-green-600">{rule.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Intervalo:</span>
                      <span className="font-medium">{rule.escalationIntervalMinutes} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Máx. escalações:</span>
                      <span className="font-medium">{rule.maxEscalations}</span>
                    </div>
                    {rule.lastTriggered && (
                      <div className="flex justify-between text-sm">
                        <span>Última execução:</span>
                        <span className="font-medium">
                          {new Date(rule.lastTriggered).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição/Criação */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Criar Nova Regra' : 'Editar Regra'}
            </DialogTitle>
            <DialogDescription>
              Configure as condições e ações para escalação automática
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="conditions">Condições</TabsTrigger>
              <TabsTrigger value="actions">Ações</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Regra *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Escalação Riscos Críticos"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridade da Regra</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority || 100}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maior número = maior prioridade
                  </p>
                </div>

                <div>
                  <Label htmlFor="module">Módulo (Opcional)</Label>
                  <Select
                    value={formData.module || ''}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      module: value as NotificationModule || undefined
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os módulos</SelectItem>
                      <SelectItem value="risks">Riscos</SelectItem>
                      <SelectItem value="assessments">Assessments</SelectItem>
                      <SelectItem value="privacy">Privacidade</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="intervalMinutes">Intervalo de Escalação (min)</Label>
                  <Input
                    id="intervalMinutes"
                    type="number"
                    value={formData.escalationIntervalMinutes || 60}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      escalationIntervalMinutes: parseInt(e.target.value) 
                    }))}
                    placeholder="60"
                  />
                </div>

                <div>
                  <Label htmlFor="maxEscalations">Máximo de Escalações</Label>
                  <Input
                    id="maxEscalations"
                    type="number"
                    value={formData.maxEscalations || 3}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxEscalations: parseInt(e.target.value) 
                    }))}
                    placeholder="3"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Regra ativa</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva quando e como esta regra deve ser aplicada..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Prioridades que Ativam a Regra</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['low', 'medium', 'high', 'critical'] as NotificationPriority[]).map(priority => (
                      <div key={priority} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`priority-${priority}`}
                          checked={formData.conditions?.priority?.includes(priority) || false}
                          onChange={(e) => {
                            const currentPriorities = formData.conditions?.priority || [];
                            const newPriorities = e.target.checked
                              ? [...currentPriorities, priority]
                              : currentPriorities.filter(p => p !== priority);
                            
                            setFormData(prev => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                priority: newPriorities
                              }
                            }));
                          }}
                        />
                        <Label htmlFor={`priority-${priority}`} className="capitalize">
                          {priority === 'low' ? 'Baixa' :
                           priority === 'medium' ? 'Média' :
                           priority === 'high' ? 'Alta' : 'Crítica'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unreadDuration">Não lida por (minutos)</Label>
                    <Input
                      id="unreadDuration"
                      type="number"
                      value={formData.conditions?.unreadDuration || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          unreadDuration: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      }))}
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="statusDuration">Sem mudança por (minutos)</Label>
                    <Input
                      id="statusDuration"
                      type="number"
                      value={formData.conditions?.statusDuration || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          statusDuration: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      }))}
                      placeholder="60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="overdueDays">Vencida há (dias)</Label>
                    <Input
                      id="overdueDays"
                      type="number"
                      value={formData.conditions?.overdueDays || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          overdueDays: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="noActionTaken"
                    checked={formData.conditions?.noActionTaken || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        noActionTaken: checked
                      }
                    }))}
                  />
                  <Label htmlFor="noActionTaken">Nenhuma ação foi tomada</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Escalação de Prioridade</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="increasePriority"
                        checked={formData.escalationActions?.increasePriority || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          escalationActions: {
                            ...prev.escalationActions,
                            increasePriority: checked
                          }
                        }))}
                      />
                      <Label htmlFor="increasePriority">Aumentar prioridade</Label>
                    </div>

                    {formData.escalationActions?.increasePriority && (
                      <div>
                        <Label htmlFor="newPriority">Nova Prioridade</Label>
                        <Select
                          value={formData.escalationActions?.newPriority || ''}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            escalationActions: {
                              ...prev.escalationActions,
                              newPriority: value as NotificationPriority
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Canais de Notificação</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sendEmail"
                        checked={formData.escalationActions?.sendEmail || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          escalationActions: {
                            ...prev.escalationActions,
                            sendEmail: checked
                          }
                        }))}
                      />
                      <Label htmlFor="sendEmail">Enviar Email</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sendSms"
                        checked={formData.escalationActions?.sendSms || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          escalationActions: {
                            ...prev.escalationActions,
                            sendSms: checked
                          }
                        }))}
                      />
                      <Label htmlFor="sendSms">Enviar SMS</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sendSlack"
                        checked={formData.escalationActions?.sendSlack || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          escalationActions: {
                            ...prev.escalationActions,
                            sendSlack: checked
                          }
                        }))}
                      />
                      <Label htmlFor="sendSlack">Enviar Slack</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="createNewNotification"
                        checked={formData.escalationActions?.createNewNotification || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          escalationActions: {
                            ...prev.escalationActions,
                            createNewNotification: checked
                          }
                        }))}
                      />
                      <Label htmlFor="createNewNotification">Criar Nova Notificação</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customMessage">Mensagem Personalizada</Label>
                  <Textarea
                    id="customMessage"
                    value={formData.escalationActions?.customMessage || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      escalationActions: {
                        ...prev.escalationActions,
                        customMessage: e.target.value
                      }
                    }))}
                    placeholder="Mensagem adicional para a escalação..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRule}>
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? 'Criar Regra' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationRulesManager;