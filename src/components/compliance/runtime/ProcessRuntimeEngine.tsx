import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Save, 
  Send, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  ComplianceProcessTemplate, 
  WorkflowState, 
  WorkflowTransition,
  ProcessInstance,
  ProcessSubmissionData
} from '@/types/compliance-process-templates';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { WorkflowNavigator } from './WorkflowNavigator';
import { ProcessValidationEngine } from './ProcessValidationEngine';

interface ProcessRuntimeEngineProps {
  template: ComplianceProcessTemplate;
  instanceId?: string;
  initialData?: ProcessSubmissionData;
  onSave?: (data: ProcessSubmissionData, isDraft: boolean) => Promise<void>;
  onSubmit?: (data: ProcessSubmissionData) => Promise<void>;
  onCancel?: () => void;
  readonly?: boolean;
  showWorkflow?: boolean;
}

export const ProcessRuntimeEngine: React.FC<ProcessRuntimeEngineProps> = ({
  template,
  instanceId,
  initialData,
  onSave,
  onSubmit,
  onCancel,
  readonly = false,
  showWorkflow = true
}) => {
  const [formData, setFormData] = useState<ProcessSubmissionData>(
    initialData || {
      template_id: template.id,
      instance_id: instanceId || '',
      field_values: {},
      workflow_state: template.workflow_definition.states.find(s => s.type === 'start')?.id || '',
      completion_percentage: 0,
      validation_results: {},
      metadata: {
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        version: '1.0'
      }
    }
  );

  const [currentState, setCurrentState] = useState<WorkflowState | null>(null);
  const [availableTransitions, setAvailableTransitions] = useState<WorkflowTransition[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, string[]>>({});

  // Current workflow state
  useEffect(() => {
    const state = template.workflow_definition.states.find(s => s.id === formData.workflow_state);
    setCurrentState(state || null);

    const transitions = template.workflow_definition.transitions.filter(
      t => t.from_state === formData.workflow_state
    );
    setAvailableTransitions(transitions);
  }, [formData.workflow_state, template]);

  // Validate form data
  const validateForm = useMemo(() => {
    return ProcessValidationEngine.validateSubmission(template, formData);
  }, [template, formData]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const totalFields = template.field_definitions.fields.length;
    const completedFields = template.field_definitions.fields.filter(
      field => {
        const value = formData.field_values[field.id];
        return value !== undefined && value !== null && value !== '';
      }
    ).length;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }, [template, formData]);

  // Update form data
  const handleFieldChange = (fieldId: string, value: any) => {
    if (readonly) return;

    setFormData(prev => ({
      ...prev,
      field_values: {
        ...prev.field_values,
        [fieldId]: value
      },
      completion_percentage: completionPercentage,
      metadata: {
        ...prev.metadata,
        last_updated: new Date().toISOString()
      }
    }));
  };

  // Validate specific field
  const handleFieldValidation = (fieldId: string, errors: string[]) => {
    setValidationResults(prev => ({
      ...prev,
      [fieldId]: errors
    }));
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(formData, true);
      toast.success('Rascunho salvo com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar rascunho');
      console.error('Save draft error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!onSubmit) return;

    setIsValidating(true);
    const validation = ProcessValidationEngine.validateSubmission(template, formData);
    
    if (!validation.isValid) {
      setValidationResults(validation.errors);
      toast.error(`Formulário inválido: ${validation.errorCount} erros encontrados`);
      setIsValidating(false);
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Processo submetido com sucesso');
    } catch (error) {
      toast.error('Erro ao submeter processo');
      console.error('Submit error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Workflow transition
  const handleWorkflowTransition = (transitionId: string) => {
    const transition = availableTransitions.find(t => t.id === transitionId);
    if (!transition) return;

    // Check if transition requires approval
    if (transition.require_approval && !readonly) {
      toast.info('Esta transição requer aprovação antes de prosseguir');
    }

    setFormData(prev => ({
      ...prev,
      workflow_state: transition.to_state,
      metadata: {
        ...prev.metadata,
        last_updated: new Date().toISOString()
      }
    }));
  };

  const getCurrentStateFields = () => {
    if (!currentState || !currentState.required_fields) {
      return template.field_definitions.fields;
    }

    return template.field_definitions.fields.filter(
      field => currentState.required_fields?.includes(field.id)
    );
  };

  const getStateIcon = (state: WorkflowState) => {
    switch (state.type) {
      case 'start': return <Play className="h-4 w-4" />;
      case 'end': return <CheckCircle className="h-4 w-4" />;
      case 'task': return <FileText className="h-4 w-4" />;
      case 'review': return <Shield className="h-4 w-4" />;
      case 'approval': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStateColor = (state: WorkflowState) => {
    switch (state.type) {
      case 'start': return 'bg-green-100 text-green-700';
      case 'end': return 'bg-gray-100 text-gray-700';
      case 'task': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'approval': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const fieldsToRender = getCurrentStateFields();
  const hasErrors = Object.values(validationResults).some(errors => errors.length > 0);
  const canSaveDraft = template.ui_configuration.allow_draft_save && !readonly && onSave;
  const canSubmit = !readonly && onSubmit && !hasErrors;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="text-sm text-muted-foreground">
                {template.framework} • {template.methodology || 'Processo Customizado'}
              </p>
            </div>
            
            {currentState && (
              <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${getStateColor(currentState)}`}>
                {getStateIcon(currentState)}
                <span className="text-sm font-medium">{currentState.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {template.security_config.access_level !== 'public' && (
              <Badge variant="outline" className="bg-orange-50">
                {template.security_config.access_level}
              </Badge>
            )}
            {template.security_config.encryption_required && (
              <Badge variant="outline" className="bg-green-50">
                <Shield className="h-3 w-3 mr-1" />
                Criptografado
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {template.ui_configuration.show_progress_bar && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso do Processo</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {template.description && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Validation Summary */}
              {hasErrors && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Erros de Validação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-red-700">
                      {Object.entries(validationResults).map(([fieldId, errors]) => 
                        errors.length > 0 && (
                          <div key={fieldId} className="flex items-start space-x-2">
                            <span className="font-medium">
                              {template.field_definitions.fields.find(f => f.id === fieldId)?.label}:
                            </span>
                            <div className="space-y-1">
                              {errors.map((error, index) => (
                                <div key={index}>• {error}</div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dynamic Fields */}
              <div className="space-y-6">
                {fieldsToRender.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum campo configurado para este estado do processo
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  fieldsToRender.map(field => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData.field_values[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      onValidate={(errors) => handleFieldValidation(field.id, errors)}
                      errors={validationResults[field.id] || []}
                      readonly={readonly}
                      securityConfig={template.security_config}
                    />
                  ))
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex-shrink-0 p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {canSaveDraft && (
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                  </Button>
                )}

                {canSubmit && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isValidating || hasErrors}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isValidating ? 'Validando...' : 'Submeter'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Sidebar */}
        {showWorkflow && template.workflow_definition.states.length > 1 && (
          <>
            <Separator orientation="vertical" />
            <div className="w-80 border-l">
              <WorkflowNavigator
                states={template.workflow_definition.states}
                transitions={template.workflow_definition.transitions}
                currentState={formData.workflow_state}
                availableTransitions={availableTransitions}
                onTransition={handleWorkflowTransition}
                readonly={readonly}
                getStateIcon={getStateIcon}
                getStateColor={getStateColor}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};