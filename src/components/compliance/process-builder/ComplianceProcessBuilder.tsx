import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings2,
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Eye,
  Shield,
  Workflow,
  Palette,
  Code,
  Download,
  Upload,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Users,
  Lock,
  Key,
  Zap,
  GitBranch,
  Star,
  Grid,
  Link,
  Calculator,
  ToggleLeft,
  Calendar,
  Hash,
  Type,
  Square,
  Circle,
  ChevronDown,
  CheckSquare,
  Paperclip,
  Edit3,
  Info,
  Minus,
  Heading,
  HelpCircle,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

// Types
import { 
  ComplianceProcessTemplate, 
  CustomFieldDefinition, 
  CustomFieldType,
  WorkflowState,
  WorkflowTransition,
  UIConfiguration,
  CreateProcessTemplateRequest,
  TemplateValidationResult,
  validateTemplate,
  getFieldTypeIcon,
  validateFieldName,
  sanitizeFieldName,
  CUSTOM_FIELD_TYPES,
  WORKFLOW_STATE_TYPES,
  UI_LAYOUTS,
  SECURITY_ACCESS_LEVELS
} from '@/types/compliance-process-templates';
import { ComplianceFramework, COMPLIANCE_FRAMEWORKS } from '@/types/compliance-management';

// Sub-components imports (will be created separately)
import { FieldBuilderPanel } from './FieldBuilderPanel';
import { WorkflowBuilderPanel } from './WorkflowBuilderPanel';
import { UIBuilderPanel } from './UIBuilderPanel';
import { SecurityConfigPanel } from './SecurityConfigPanel';
import { TemplatePreview } from './TemplatePreview';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ComplianceProcessBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ComplianceProcessTemplate | null;
  framework?: ComplianceFramework;
  onSave?: (template: ComplianceProcessTemplate) => Promise<void>;
  mode?: 'create' | 'edit' | 'clone' | 'view';
}

export const ComplianceProcessBuilder: React.FC<ComplianceProcessBuilderProps> = ({
  isOpen,
  onClose,
  template: initialTemplate,
  framework: defaultFramework,
  onSave,
  mode = 'create'
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<TemplateValidationResult | null>(null);
  
  // Template state
  const [template, setTemplate] = useState<Partial<ComplianceProcessTemplate>>(() => ({
    name: '',
    description: '',
    framework: defaultFramework || 'Custom Framework',
    version: '1.0',
    field_definitions: {
      fields: []
    },
    workflow_definition: {
      states: [
        {
          id: 'start',
          name: 'Início',
          type: 'start',
          description: 'Estado inicial do processo',
          position: { x: 100, y: 100 }
        },
        {
          id: 'draft',
          name: 'Rascunho',
          type: 'task',
          description: 'Preenchimento inicial',
          assignee_role: 'respondent',
          position: { x: 300, y: 100 }
        },
        {
          id: 'review',
          name: 'Revisão',
          type: 'review',
          description: 'Revisão técnica',
          assignee_role: 'reviewer',
          position: { x: 500, y: 100 }
        },
        {
          id: 'approved',
          name: 'Aprovado',
          type: 'end',
          description: 'Processo concluído',
          position: { x: 700, y: 100 }
        }
      ],
      transitions: [
        {
          id: 'start_to_draft',
          name: 'Iniciar',
          from_state: 'start',
          to_state: 'draft',
          trigger: 'manual'
        },
        {
          id: 'draft_to_review',
          name: 'Enviar para Revisão',
          from_state: 'draft',
          to_state: 'review',
          trigger: 'manual',
          require_approval: false
        },
        {
          id: 'review_to_approved',
          name: 'Aprovar',
          from_state: 'review',
          to_state: 'approved',
          trigger: 'manual',
          require_approval: true,
          approver_role: 'approver'
        }
      ],
      initial_state: 'start'
    },
    ui_configuration: {
      layout: 'two_columns',
      theme: 'default',
      sections: [],
      show_progress_bar: true,
      allow_draft_save: true,
      auto_save_interval: 30,
      navigation: {
        show_section_navigation: true,
        enable_jump_to_section: true,
        show_completion_percentage: true
      },
      validation: {
        validate_on_change: false,
        validate_on_save: true,
        show_inline_errors: true,
        highlight_required_fields: true
      },
      responsive: {
        mobile_layout: 'stacked',
        tablet_columns: 2,
        desktop_columns: 3
      }
    },
    security_config: {
      encryption_required: false,
      access_level: 'internal',
      audit_trail: true,
      data_retention_days: 2555,
      pii_handling: 'encrypt',
      compliance_tags: []
    },
    automation_config: {
      notifications_enabled: true,
      auto_assignment: false,
      webhook_triggers: [],
      ai_assistance: false,
      integration_hooks: []
    },
    is_active: true,
    is_default_for_framework: false,
    usage_count: 0
  }));

  // Initialize from existing template
  useEffect(() => {
    if (initialTemplate && mode !== 'create') {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate, mode]);

  // Validation
  const validateCurrentTemplate = useCallback(() => {
    setValidating(true);
    try {
      const result = validateTemplate(template);
      setValidationResult(result);
      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: [{
          field: 'general',
          type: 'invalid',
          message: 'Erro interno de validação',
          severity: 'error'
        }],
        warnings: []
      });
      return false;
    } finally {
      setValidating(false);
    }
  }, [template]);

  // Auto-validate on template changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateCurrentTemplate();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [template, validateCurrentTemplate]);

  // Handlers
  const handleBasicInfoChange = useCallback((field: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFieldDefinitionsChange = useCallback((fields: CustomFieldDefinition[]) => {
    setTemplate(prev => ({
      ...prev,
      field_definitions: {
        fields
      }
    }));
  }, []);

  const handleWorkflowChange = useCallback((states: WorkflowState[], transitions: WorkflowTransition[]) => {
    setTemplate(prev => ({
      ...prev,
      workflow_definition: {
        states,
        transitions,
        initial_state: states.find(s => s.type === 'start')?.id || states[0]?.id || 'start'
      }
    }));
  }, []);

  const handleUIConfigChange = useCallback((uiConfig: UIConfiguration) => {
    setTemplate(prev => ({
      ...prev,
      ui_configuration: uiConfig
    }));
  }, []);

  const handleSecurityConfigChange = useCallback((securityConfig: any) => {
    setTemplate(prev => ({
      ...prev,
      security_config: {
        ...prev.security_config,
        ...securityConfig
      }
    }));
  }, []);

  const handleSave = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validate before saving
    if (!validateCurrentTemplate()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      setActiveTab('basic'); // Go to first tab with errors
      return;
    }

    setSaving(true);
    try {
      const templateToSave: CreateProcessTemplateRequest = {
        name: template.name!,
        description: template.description,
        framework: template.framework!,
        field_definitions: template.field_definitions!,
        workflow_definition: template.workflow_definition!,
        ui_configuration: template.ui_configuration!,
        security_config: template.security_config,
        automation_config: template.automation_config
      };

      let savedTemplate: ComplianceProcessTemplate;

      if (mode === 'create' || mode === 'clone') {
        // Create new template
        const { data, error } = await supabase
          .from('compliance_process_templates')
          .insert({
            ...templateToSave,
            tenant_id: user.tenantId,
            created_by: user.id,
            version: template.version || '1.0'
          })
          .select()
          .single();

        if (error) throw error;
        savedTemplate = data;
      } else {
        // Update existing template
        const { data, error } = await supabase
          .from('compliance_process_templates')
          .update({
            ...templateToSave,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialTemplate!.id)
          .eq('tenant_id', user.tenantId)
          .select()
          .single();

        if (error) throw error;
        savedTemplate = data;
      }

      toast.success(
        mode === 'create' 
          ? 'Template criado com sucesso!' 
          : 'Template atualizado com sucesso!'
      );

      if (onSave) {
        await onSave(savedTemplate);
      }

      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to initial state
    if (mode === 'create') {
      setTemplate({
        name: '',
        description: '',
        framework: defaultFramework || 'Custom Framework',
        field_definitions: { fields: [] },
        // ... reset to defaults
      });
    }
    onClose();
  };

  const canSave = useMemo(() => {
    return template.name && 
           template.framework && 
           template.field_definitions?.fields && 
           template.workflow_definition?.states &&
           validationResult?.isValid !== false;
  }, [template, validationResult]);

  const modeLabel = {
    create: 'Criar Novo Template',
    edit: 'Editar Template', 
    clone: 'Clonar Template',
    view: 'Visualizar Template'
  }[mode];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {modeLabel}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {mode === 'create' && 'Configure um novo processo de compliance personalizado'}
                  {mode === 'edit' && 'Modifique o processo existente'}
                  {mode === 'clone' && 'Crie uma cópia do processo'}
                  {mode === 'view' && 'Visualize as configurações do processo'}
                </p>
              </div>
            </div>
            
            {/* Validation Status */}
            {validationResult && (
              <div className="flex items-center space-x-2">
                {validating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-xs text-muted-foreground">Validando...</span>
                  </div>
                ) : validationResult.isValid ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Válido</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">{validationResult.errors.length} erro(s)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Básico</span>
              </TabsTrigger>
              <TabsTrigger value="fields" className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Campos</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4" />
                <span>Fluxo</span>
              </TabsTrigger>
              <TabsTrigger value="ui" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Interface</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Informações Básicas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="template-name">Nome do Template *</Label>
                          <Input
                            id="template-name"
                            placeholder="Ex: Avaliação ISO 27001 Completa"
                            value={template.name || ''}
                            onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                            disabled={mode === 'view'}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="template-framework">Framework *</Label>
                          <Select
                            value={template.framework || ''}
                            onValueChange={(value) => handleBasicInfoChange('framework', value)}
                            disabled={mode === 'view'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um framework" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPLIANCE_FRAMEWORKS.map((framework) => (
                                <SelectItem key={framework} value={framework}>
                                  {framework}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="template-description">Descrição</Label>
                        <Textarea
                          id="template-description"
                          placeholder="Descreva o propósito e escopo deste template..."
                          value={template.description || ''}
                          onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                          rows={3}
                          disabled={mode === 'view'}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="template-version">Versão</Label>
                          <Input
                            id="template-version"
                            placeholder="1.0"
                            value={template.version || '1.0'}
                            onChange={(e) => handleBasicInfoChange('version', e.target.value)}
                            disabled={mode === 'view'}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="template-active"
                            checked={template.is_active || false}
                            onCheckedChange={(checked) => handleBasicInfoChange('is_active', checked)}
                            disabled={mode === 'view'}
                          />
                          <Label htmlFor="template-active">Template Ativo</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="template-default"
                            checked={template.is_default_for_framework || false}
                            onCheckedChange={(checked) => handleBasicInfoChange('is_default_for_framework', checked)}
                            disabled={mode === 'view'}
                          />
                          <Label htmlFor="template-default">Padrão para Framework</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Validation Errors */}
                  {validationResult && !validationResult.isValid && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          <span>Erros de Validação</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {validationResult.errors.map((error, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm text-red-600">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{error.message}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Fields Tab */}
            <TabsContent value="fields" className="flex-1 overflow-hidden">
              <FieldBuilderPanel
                fields={template.field_definitions?.fields || []}
                onChange={handleFieldDefinitionsChange}
                framework={template.framework!}
                readonly={mode === 'view'}
              />
            </TabsContent>

            {/* Workflow Tab */}
            <TabsContent value="workflow" className="flex-1 overflow-hidden">
              <WorkflowBuilderPanel
                states={template.workflow_definition?.states || []}
                transitions={template.workflow_definition?.transitions || []}
                onChange={handleWorkflowChange}
                readonly={mode === 'view'}
              />
            </TabsContent>

            {/* UI Tab */}
            <TabsContent value="ui" className="flex-1 overflow-hidden">
              <UIBuilderPanel
                config={template.ui_configuration!}
                fields={template.field_definitions?.fields || []}
                onChange={handleUIConfigChange}
                readonly={mode === 'view'}
              />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="flex-1 overflow-hidden">
              <SecurityConfigPanel
                config={template.security_config!}
                automationConfig={template.automation_config!}
                onChange={handleSecurityConfigChange}
                readonly={mode === 'view'}
              />
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 overflow-hidden">
              <TemplatePreview
                template={template as ComplianceProcessTemplate}
                validationResult={validationResult}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {template.field_definitions?.fields && (
              <span>{template.field_definitions.fields.length} campos</span>
            )}
            {template.workflow_definition?.states && (
              <span>{template.workflow_definition.states.length} estados</span>
            )}
            {validationResult && (
              <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                {validationResult.isValid ? 'Válido' : `${validationResult.errors.length} erro(s)`}
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {mode !== 'view' && (
              <Button 
                onClick={handleSave} 
                disabled={!canSave || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Criar Template' : 'Salvar Alterações'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceProcessBuilder;