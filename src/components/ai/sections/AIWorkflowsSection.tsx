import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';

interface AIWorkflow {
  id?: string;
  name: string;
  description: string;
  workflow_type: string;
  trigger_events: Record<string, any>;
  workflow_steps: Record<string, any>[];
  schedule_cron?: string;
  is_active: boolean;
  auto_approve: boolean;
  requires_human_review: boolean;
  default_provider_id?: string;
  max_execution_time_minutes: number;
  executions_count: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time_minutes: number;
  last_execution_at?: string;
}

export const AIWorkflowsSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AIWorkflow | null>(null);
  const [providers, setProviders] = useState<any[]>([]);

  const [workflowForm, setWorkflowForm] = useState<Partial<AIWorkflow>>({
    name: '',
    description: '',
    workflow_type: 'automated-analysis',
    trigger_events: {},
    workflow_steps: [],
    schedule_cron: '',
    is_active: true,
    auto_approve: false,
    requires_human_review: true,
    max_execution_time_minutes: 30
  });

  const workflowTypes = [
    { value: 'automated-analysis', label: 'Análise Automatizada' },
    { value: 'scheduled-report', label: 'Relatório Agendado' },
    { value: 'alert-processing', label: 'Processamento de Alertas' },
    { value: 'data-validation', label: 'Validação de Dados' },
    { value: 'compliance-monitoring', label: 'Monitoramento de Compliance' },
    { value: 'risk-scoring', label: 'Pontuação de Riscos' }
  ];

  const cronPresets = [
    { value: '0 0 * * *', label: 'Diário (00:00)' },
    { value: '0 9 * * 1-5', label: 'Dias úteis (09:00)' },
    { value: '0 0 * * 0', label: 'Semanal (Domingo)' },
    { value: '0 0 1 * *', label: 'Mensal (Dia 1)' },
    { value: '0 */6 * * *', label: 'A cada 6 horas' },
    { value: '*/30 * * * *', label: 'A cada 30 minutos' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadWorkflows(), loadProviders()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_workflows')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Erro ao carregar workflows:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar workflows de IA',
        variant: 'destructive'
      });
    }
  };

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_grc_providers')
        .select('id, name, model_name, is_active')
        .eq('tenant_id', user?.tenant?.id)
        .eq('is_active', true);

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    }
  };

  const saveWorkflow = async () => {
    try {
      const workflowData = {
        ...workflowForm,
        tenant_id: user?.tenant?.id,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (editingWorkflow?.id) {
        const { error } = await supabase
          .from('ai_workflows')
          .update(workflowData)
          .eq('id', editingWorkflow.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_workflows')
          .insert(workflowData);

        if (error) throw error;
      }

      await loadWorkflows();
      setShowCreateDialog(false);
      setEditingWorkflow(null);
      resetForm();

      toast({
        title: 'Sucesso',
        description: editingWorkflow ? 'Workflow atualizado!' : 'Workflow criado!'
      });
    } catch (error) {
      console.error('Erro ao salvar workflow:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar workflow',
        variant: 'destructive'
      });
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadWorkflows();
      toast({
        title: 'Sucesso',
        description: 'Workflow removido!'
      });
    } catch (error) {
      console.error('Erro ao deletar workflow:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover workflow',
        variant: 'destructive'
      });
    }
  };

  const toggleWorkflowStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_workflows')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      await loadWorkflows();
      toast({
        title: 'Sucesso',
        description: `Workflow ${isActive ? 'ativado' : 'pausado'}!`
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do workflow',
        variant: 'destructive'
      });
    }
  };

  const executeWorkflow = async (id: string) => {
    try {
      // Simulação de execução manual - em produção, isso seria uma edge function
      toast({
        title: 'Workflow Executado',
        description: 'Workflow foi executado manualmente com sucesso'
      });
    } catch (error) {
      console.error('Erro ao executar workflow:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao executar workflow',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setWorkflowForm({
      name: '',
      description: '',
      workflow_type: 'automated-analysis',
      trigger_events: {},
      workflow_steps: [],
      schedule_cron: '',
      is_active: true,
      auto_approve: false,
      requires_human_review: true,
      max_execution_time_minutes: 30
    });
  };

  const openEditDialog = (workflow: AIWorkflow) => {
    setEditingWorkflow(workflow);
    setWorkflowForm(workflow);
    setShowCreateDialog(true);
  };

  const getWorkflowTypeIcon = (type: string) => {
    switch (type) {
      case 'automated-analysis': return <TrendingUp className="h-4 w-4" />;
      case 'scheduled-report': return <Calendar className="h-4 w-4" />;
      case 'alert-processing': return <AlertTriangle className="h-4 w-4" />;
      case 'data-validation': return <CheckCircle className="h-4 w-4" />;
      case 'compliance-monitoring': return <Activity className="h-4 w-4" />;
      case 'risk-scoring': return <Zap className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const getSuccessRate = (workflow: AIWorkflow) => {
    if (workflow.executions_count === 0) return 0;
    return Math.round((workflow.successful_executions / workflow.executions_count) * 100);
  };

  const getStatusColor = (workflow: AIWorkflow) => {
    if (!workflow.is_active) return 'bg-gray-500';
    const successRate = getSuccessRate(workflow);
    if (successRate >= 90) return 'bg-green-500';
    if (successRate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Workflow className="h-5 w-5 text-primary" />
            <span>Workflows de IA</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure workflows automatizados que utilizam IA para análises e processamento
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingWorkflow(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Workflow
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkflow ? 'Editar Workflow' : 'Novo Workflow de IA'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Workflow</Label>
                  <Input
                    id="name"
                    value={workflowForm.name}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                    placeholder="Nome identificador do workflow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={workflowForm.description}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                    placeholder="Descreva o propósito e funcionamento do workflow"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Workflow</Label>
                    <Select 
                      value={workflowForm.workflow_type} 
                      onValueChange={(value) => setWorkflowForm({ ...workflowForm, workflow_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Provedor Padrão</Label>
                    <Select 
                      value={workflowForm.default_provider_id || ''} 
                      onValueChange={(value) => setWorkflowForm({ ...workflowForm, default_provider_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um provedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name} ({provider.model_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Agendamento</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cronPreset">Agendamento Pré-definido</Label>
                    <Select 
                      value={workflowForm.schedule_cron || ''} 
                      onValueChange={(value) => setWorkflowForm({ ...workflowForm, schedule_cron: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Manual</SelectItem>
                        {cronPresets.map(preset => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTime">Tempo Máximo (min)</Label>
                    <Input
                      id="maxTime"
                      type="number"
                      value={workflowForm.max_execution_time_minutes}
                      onChange={(e) => setWorkflowForm({ ...workflowForm, max_execution_time_minutes: parseInt(e.target.value) })}
                      min="1"
                      max="480"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cronCustom">Cron Customizado (opcional)</Label>
                  <Input
                    id="cronCustom"
                    value={workflowForm.schedule_cron || ''}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, schedule_cron: e.target.value })}
                    placeholder="Ex: 0 9 * * 1-5 (dias úteis às 9h)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: minuto hora dia mês dia-da-semana
                  </p>
                </div>
              </div>

              {/* Configuration Switches */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Configurações</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Workflow Ativo</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir execução automática
                      </p>
                    </div>
                    <Switch
                      checked={workflowForm.is_active}
                      onCheckedChange={(checked) => setWorkflowForm({ ...workflowForm, is_active: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Aprovação Automática</Label>
                      <p className="text-xs text-muted-foreground">
                        Aprovar resultados automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={workflowForm.auto_approve}
                      onCheckedChange={(checked) => setWorkflowForm({ ...workflowForm, auto_approve: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requer Revisão Humana</Label>
                      <p className="text-xs text-muted-foreground">
                        Solicitar revisão manual
                      </p>
                    </div>
                    <Switch
                      checked={workflowForm.requires_human_review}
                      onCheckedChange={(checked) => setWorkflowForm({ ...workflowForm, requires_human_review: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveWorkflow}>
                  {editingWorkflow ? 'Atualizar' : 'Criar'} Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="grc-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getWorkflowTypeIcon(workflow.workflow_type)}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {workflowTypes.find(t => t.value === workflow.workflow_type)?.label}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow)}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {workflow.description}
              </p>

              {/* Schedule Info */}
              {workflow.schedule_cron && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {cronPresets.find(p => p.value === workflow.schedule_cron)?.label || 'Personalizado'}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Execuções</p>
                  <p className="font-medium">{workflow.executions_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa Sucesso</p>
                  <p className="font-medium">{getSuccessRate(workflow)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tempo Médio</p>
                  <p className="font-medium">{workflow.avg_execution_time_minutes?.toFixed(1) || 0}min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Exec.</p>
                  <p className="font-medium">
                    {workflow.last_execution_at 
                      ? new Date(workflow.last_execution_at).toLocaleDateString()
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>

              {/* Configuration Badges */}
              <div className="flex flex-wrap gap-1">
                {workflow.auto_approve && (
                  <Badge variant="secondary" className="text-xs">
                    Auto Aprovação
                  </Badge>
                )}
                {workflow.requires_human_review && (
                  <Badge variant="outline" className="text-xs">
                    Revisão Humana
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeWorkflow(workflow.id!)}
                    disabled={!workflow.is_active}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWorkflowStatus(workflow.id!, !workflow.is_active)}
                  >
                    {workflow.is_active ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(workflow)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteWorkflow(workflow.id!)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {workflows.length === 0 && (
          <div className="col-span-full">
            <Card className="grc-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum workflow configurado
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Configure workflows automatizados para análises recorrentes e processamento inteligente de dados
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Workflow
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {workflows.length > 0 && (
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Play className="h-4 w-4 mr-2" />
                Executar Todos Ativos
              </Button>
              <Button variant="outline" className="justify-start">
                <Pause className="h-4 w-4 mr-2" />
                Pausar Todos
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Notificações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};