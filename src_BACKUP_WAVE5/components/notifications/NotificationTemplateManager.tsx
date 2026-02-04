// ============================================================================
// GERENCIADOR DE TEMPLATES DE NOTIFICAÇÃO
// ============================================================================
// Sistema completo para criar, editar e gerenciar templates de notificação

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save, 
  X, 
  Code, 
  Wand2, 
  TestTube,
  FileText,
  Settings,
  Layers,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info
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
import { toast } from 'sonner';

import { NotificationModule, NotificationType, NotificationPriority } from '@/types/notifications';
import { cn } from '@/lib/utils';

// Interface para templates
interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  module: NotificationModule;
  titleTemplate: string;
  messageTemplate: string;
  shortMessageTemplate?: string;
  defaultPriority: NotificationPriority;
  defaultActions: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action?: string;
    url?: string;
  }>;
  availableVariables: string[];
  conditions: Record<string, any>;
  isActive: boolean;
  isSystemTemplate: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock data para templates
const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Assessment Vencendo',
    description: 'Template para assessments que estão próximos do vencimento',
    type: 'assessment_due',
    module: 'assessments',
    titleTemplate: 'Assessment {{assessment_name}} Vencendo',
    messageTemplate: 'O assessment {{assessment_name}} vence em {{days_until_due}} dias. É necessário completar a avaliação dos controles pendentes.',
    shortMessageTemplate: 'Assessment vence em {{days_until_due}} dias',
    defaultPriority: 'high',
    defaultActions: [
      { label: 'Ver Assessment', type: 'primary', url: '/assessments/{{assessment_id}}' },
      { label: 'Solicitar Prorrogação', type: 'secondary', action: 'request_extension' }
    ],
    availableVariables: ['assessment_name', 'assessment_id', 'days_until_due', 'responsible_user', 'framework'],
    conditions: { days_until_due: { lte: 7 } },
    isActive: true,
    isSystemTemplate: true,
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'system'
  },
  {
    id: '2',
    name: 'Risco Crítico Identificado',
    description: 'Template para notificação de riscos críticos',
    type: 'risk_escalated',
    module: 'risks',
    titleTemplate: 'Risco Crítico: {{risk_title}}',
    messageTemplate: 'Um risco crítico foi identificado: {{risk_description}}. Impacto: {{impact_level}}. Probabilidade: {{probability}}. Requer ação imediata.',
    shortMessageTemplate: 'Risco crítico: {{risk_title}}',
    defaultPriority: 'critical',
    defaultActions: [
      { label: 'Revisar Risco', type: 'danger', url: '/risks/{{risk_id}}' },
      { label: 'Atribuir Equipe', type: 'primary', action: 'assign_team' },
      { label: 'Criar Plano de Ação', type: 'secondary', action: 'create_action_plan' }
    ],
    availableVariables: ['risk_title', 'risk_id', 'risk_description', 'impact_level', 'probability', 'category', 'owner'],
    conditions: { priority: { eq: 'critical' } },
    isActive: true,
    isSystemTemplate: false,
    version: 2,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'Solicitação LGPD Recebida',
    description: 'Template para novas solicitações de direitos LGPD',
    type: 'privacy_request_received',
    module: 'privacy',
    titleTemplate: 'Nova Solicitação LGPD: {{request_type}}',
    messageTemplate: 'Nova solicitação {{request_type}} recebida de {{data_subject_name}}. Prazo legal: {{legal_deadline}} dias. Protocolo: {{protocol_number}}.',
    shortMessageTemplate: 'Nova solicitação {{request_type}}',
    defaultPriority: 'medium',
    defaultActions: [
      { label: 'Processar Solicitação', type: 'primary', url: '/privacy/requests/{{request_id}}' },
      { label: 'Verificar Identidade', type: 'secondary', action: 'verify_identity' }
    ],
    availableVariables: ['request_type', 'request_id', 'data_subject_name', 'legal_deadline', 'protocol_number', 'received_date'],
    conditions: {},
    isActive: true,
    isSystemTemplate: false,
    version: 1,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    createdBy: 'privacy_officer'
  }
];

// Variáveis disponíveis por módulo
const moduleVariables: Record<NotificationModule, string[]> = {
  assessments: ['assessment_name', 'assessment_id', 'framework', 'responsible_user', 'due_date', 'completion_percentage'],
  risks: ['risk_title', 'risk_id', 'risk_description', 'impact_level', 'probability', 'category', 'owner', 'mitigation_plan'],
  compliance: ['regulation', 'requirement', 'deadline', 'responsible_area', 'compliance_status'],
  policies: ['policy_name', 'policy_id', 'version', 'approval_date', 'next_review_date', 'approver'],
  privacy: ['request_type', 'data_subject_name', 'legal_deadline', 'protocol_number', 'data_categories'],
  audit: ['audit_name', 'audit_id', 'auditor', 'start_date', 'end_date', 'scope'],
  users: ['user_name', 'user_email', 'role', 'department', 'last_login'],
  system: ['service_name', 'error_code', 'timestamp', 'severity', 'affected_users'],
  'general-settings': ['setting_name', 'old_value', 'new_value', 'changed_by'],
  frameworks: ['framework_name', 'framework_id', 'version', 'controls_count'],
  incidents: ['incident_id', 'incident_type', 'severity', 'affected_systems', 'reporter']
};

export const NotificationTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state para edição/criação
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>({});

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = filterModule === 'all' || template.module === filterModule;
    const matchesType = filterType === 'all' || template.type === filterType;
    
    return matchesSearch && matchesModule && matchesType;
  });

  // Inicializar form data
  const initializeFormData = (template?: NotificationTemplate) => {
    if (template) {
      setFormData({ ...template });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'assessment_due',
        module: 'assessments',
        titleTemplate: '',
        messageTemplate: '',
        shortMessageTemplate: '',
        defaultPriority: 'medium',
        defaultActions: [],
        availableVariables: [],
        conditions: {},
        isActive: true,
        isSystemTemplate: false,
        version: 1
      });
    }
  };

  // Renderizar preview do template
  const renderPreview = (template: NotificationTemplate, data: Record<string, string>) => {
    const replaceVariables = (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return data[variable] || `{{${variable}}}`;
      });
    };

    return {
      title: replaceVariables(template.titleTemplate),
      message: replaceVariables(template.messageTemplate),
      shortMessage: template.shortMessageTemplate ? replaceVariables(template.shortMessageTemplate) : undefined
    };
  };

  // Gerar dados de exemplo para preview
  const generateSampleData = (template: NotificationTemplate) => {
    const sampleData: Record<string, string> = {};
    
    template.availableVariables.forEach(variable => {
      switch (variable) {
        case 'assessment_name':
          sampleData[variable] = 'ISO 27001 - Controles de Segurança';
          break;
        case 'days_until_due':
          sampleData[variable] = '3';
          break;
        case 'risk_title':
          sampleData[variable] = 'Falha no Sistema de Backup';
          break;
        case 'impact_level':
          sampleData[variable] = 'Alto';
          break;
        case 'probability':
          sampleData[variable] = 'Média';
          break;
        case 'request_type':
          sampleData[variable] = 'Exclusão de Dados';
          break;
        case 'data_subject_name':
          sampleData[variable] = 'João Silva';
          break;
        case 'legal_deadline':
          sampleData[variable] = '15';
          break;
        default:
          sampleData[variable] = `Exemplo ${variable}`;
      }
    });
    
    return sampleData;
  };

  // Handlers
  const handleCreateTemplate = () => {
    setIsCreating(true);
    setIsEditing(true);
    initializeFormData();
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsCreating(false);
    setIsEditing(true);
    initializeFormData(template);
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.titleTemplate || !formData.messageTemplate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const templateData: NotificationTemplate = {
      id: isCreating ? `temp_${Date.now()}` : selectedTemplate!.id,
      name: formData.name!,
      description: formData.description!,
      type: formData.type!,
      module: formData.module!,
      titleTemplate: formData.titleTemplate!,
      messageTemplate: formData.messageTemplate!,
      shortMessageTemplate: formData.shortMessageTemplate,
      defaultPriority: formData.defaultPriority!,
      defaultActions: formData.defaultActions || [],
      availableVariables: moduleVariables[formData.module!],
      conditions: formData.conditions || {},
      isActive: formData.isActive!,
      isSystemTemplate: formData.isSystemTemplate || false,
      version: isCreating ? 1 : (selectedTemplate!.version + 1),
      createdAt: isCreating ? new Date().toISOString() : selectedTemplate!.createdAt,
      updatedAt: new Date().toISOString(),
      createdBy: isCreating ? 'current_user' : selectedTemplate!.createdBy
    };

    if (isCreating) {
      setTemplates(prev => [templateData, ...prev]);
      toast.success('Template criado com sucesso');
    } else {
      setTemplates(prev => prev.map(t => t.id === templateData.id ? templateData : t));
      toast.success('Template atualizado com sucesso');
    }

    setIsEditing(false);
    setIsCreating(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success('Template excluído com sucesso');
  };

  const handleDuplicateTemplate = (template: NotificationTemplate) => {
    const duplicated: NotificationTemplate = {
      ...template,
      id: `dup_${Date.now()}`,
      name: `${template.name} (Cópia)`,
      isSystemTemplate: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user'
    };

    setTemplates(prev => [duplicated, ...prev]);
    toast.success('Template duplicado com sucesso');
  };

  const handleTestTemplate = (template: NotificationTemplate) => {
    const sampleData = generateSampleData(template);
    setPreviewData(sampleData);
    setSelectedTemplate(template);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates de Notificação</h1>
          <p className="text-muted-foreground">
            Gerencie templates reutilizáveis para notificações
          </p>
        </div>

        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
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
                  <SelectItem value="assessments">Assessments</SelectItem>
                  <SelectItem value="risks">Riscos</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="policies">Políticas</SelectItem>
                  <SelectItem value="privacy">Privacidade</SelectItem>
                  <SelectItem value="audit">Auditoria</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="assessment_due">Assessment Vencendo</SelectItem>
                  <SelectItem value="risk_escalated">Risco Escalado</SelectItem>
                  <SelectItem value="privacy_request_received">Solicitação LGPD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {template.name}
                    {template.isSystemTemplate && (
                      <Badge variant="secondary" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                    {!template.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  {template.module}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    template.defaultPriority === 'critical' && "border-red-200 text-red-700",
                    template.defaultPriority === 'high' && "border-orange-200 text-orange-700",
                    template.defaultPriority === 'medium' && "border-yellow-200 text-yellow-700",
                    template.defaultPriority === 'low' && "border-green-200 text-green-700"
                  )}
                >
                  {template.defaultPriority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{template.version}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Título
                  </Label>
                  <p className="text-sm font-medium truncate">
                    {template.titleTemplate}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Mensagem
                  </Label>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.messageTemplate}
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Variáveis ({template.availableVariables.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.availableVariables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.availableVariables.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.availableVariables.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestTemplate(template)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicar
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    {!template.isSystemTemplate && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o template "{template.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
              {isCreating ? 'Criar Novo Template' : 'Editar Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o template de notificação com variáveis dinâmicas
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="actions">Ações</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Assessment Vencendo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="module">Módulo *</Label>
                  <Select
                    value={formData.module}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      module: value as NotificationModule,
                      availableVariables: moduleVariables[value as NotificationModule]
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessments">Assessments</SelectItem>
                      <SelectItem value="risks">Riscos</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="policies">Políticas</SelectItem>
                      <SelectItem value="privacy">Privacidade</SelectItem>
                      <SelectItem value="audit">Auditoria</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Notificação *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NotificationType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment_due">Assessment Vencendo</SelectItem>
                      <SelectItem value="risk_escalated">Risco Escalado</SelectItem>
                      <SelectItem value="privacy_request_received">Solicitação LGPD</SelectItem>
                      <SelectItem value="policy_review_due">Revisão de Política</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade Padrão *</Label>
                  <Select
                    value={formData.defaultPriority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, defaultPriority: value as NotificationPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva quando este template deve ser usado..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Template ativo</Label>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="titleTemplate">Template do Título *</Label>
                <Input
                  id="titleTemplate"
                  value={formData.titleTemplate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleTemplate: e.target.value }))}
                  placeholder="Ex: Assessment {{assessment_name}} Vencendo"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {{variavel}} para inserir dados dinâmicos
                </p>
              </div>

              <div>
                <Label htmlFor="messageTemplate">Template da Mensagem *</Label>
                <Textarea
                  id="messageTemplate"
                  value={formData.messageTemplate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, messageTemplate: e.target.value }))}
                  placeholder="Ex: O assessment {{assessment_name}} vence em {{days_until_due}} dias..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="shortMessageTemplate">Template da Mensagem Curta</Label>
                <Input
                  id="shortMessageTemplate"
                  value={formData.shortMessageTemplate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortMessageTemplate: e.target.value }))}
                  placeholder="Ex: Assessment vence em {{days_until_due}} dias"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usado para badges e notificações push
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Variáveis Disponíveis</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted rounded-lg">
                  {(formData.availableVariables || []).map((variable) => (
                    <Badge key={variable} variant="secondary" className="cursor-pointer">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em uma variável para copiá-la
                </p>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Ações Padrão</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Configure as ações que aparecerão nas notificações
                </p>
                
                {/* Lista de ações seria implementada aqui */}
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Configuração de ações será implementada</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Preview do Template</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Visualize como a notificação aparecerá
                </p>
                
                {formData.titleTemplate && formData.messageTemplate && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            formData.defaultPriority === 'critical' && "bg-red-100 text-red-600",
                            formData.defaultPriority === 'high' && "bg-orange-100 text-orange-600",
                            formData.defaultPriority === 'medium' && "bg-yellow-100 text-yellow-600",
                            formData.defaultPriority === 'low' && "bg-green-100 text-green-600"
                          )}>
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">
                              {formData.titleTemplate.replace(/\{\{(\w+)\}\}/g, '{{$1}}')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formData.messageTemplate.replace(/\{\{(\w+)\}\}/g, '{{$1}}')}
                            </p>
                          </div>
                        </div>
                        
                        {formData.shortMessageTemplate && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            <strong>Mensagem curta:</strong> {formData.shortMessageTemplate.replace(/\{\{(\w+)\}\}/g, '{{$1}}')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? 'Criar Template' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={!!selectedTemplate && !!Object.keys(previewData).length} onOpenChange={() => {
        setSelectedTemplate(null);
        setPreviewData({});
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
            <DialogDescription>
              Visualização com dados de exemplo
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  {(() => {
                    const preview = renderPreview(selectedTemplate, previewData);
                    return (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            selectedTemplate.defaultPriority === 'critical' && "bg-red-100 text-red-600",
                            selectedTemplate.defaultPriority === 'high' && "bg-orange-100 text-orange-600",
                            selectedTemplate.defaultPriority === 'medium' && "bg-yellow-100 text-yellow-600",
                            selectedTemplate.defaultPriority === 'low' && "bg-green-100 text-green-600"
                          )}>
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{preview.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {preview.message}
                            </p>
                            {preview.shortMessage && (
                              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                <strong>Mensagem curta:</strong> {preview.shortMessage}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                          <Badge variant="outline">{selectedTemplate.module}</Badge>
                          <Badge variant="outline">{selectedTemplate.defaultPriority}</Badge>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <div>
                <Label className="text-sm font-medium">Dados de Exemplo Utilizados</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <pre className="text-xs">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedTemplate(null);
              setPreviewData({});
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationTemplateManager;