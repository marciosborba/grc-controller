import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  FileText, 
  Settings, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  ComplianceProcessTemplate, 
  ProcessSubmissionData,
  ProcessInstance
} from '@/types/compliance-process-templates';
import { ProcessRuntimeEngine } from './ProcessRuntimeEngine';

interface ProcessExecutorDemoProps {
  templates: ComplianceProcessTemplate[];
  onClose?: () => void;
}

export const ProcessExecutorDemo: React.FC<ProcessExecutorDemoProps> = ({
  templates,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ComplianceProcessTemplate | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentInstance, setCurrentInstance] = useState<ProcessInstance | null>(null);
  const [instanceData, setInstanceData] = useState<ProcessSubmissionData | null>(null);

  // Reset when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setIsExecuting(false);
      setCurrentInstance(null);
      setInstanceData(null);
    }
  }, [selectedTemplate]);

  // Create demo instance
  const createDemoInstance = (template: ComplianceProcessTemplate): ProcessInstance => {
    const startState = template.workflow_definition.states.find(s => s.type === 'start');
    
    return {
      id: `demo_instance_${Date.now()}`,
      template_id: template.id,
      tenant_id: template.tenant_id,
      instance_name: `Demo: ${template.name}`,
      current_state: startState?.id || template.workflow_definition.states[0]?.id || '',
      field_values: {},
      completion_percentage: 0,
      workflow_history: [],
      current_assignees: [],
      status: 'active',
      priority: 'medium',
      created_by: 'demo_user',
      created_at: new Date()
    };
  };

  // Create demo submission data
  const createDemoSubmissionData = (template: ComplianceProcessTemplate): ProcessSubmissionData => {
    const startState = template.workflow_definition.states.find(s => s.type === 'start');
    
    return {
      template_id: template.id,
      instance_id: `demo_instance_${Date.now()}`,
      field_values: {},
      workflow_state: startState?.id || template.workflow_definition.states[0]?.id || '',
      completion_percentage: 0,
      validation_results: {},
      metadata: {
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        version: template.version || '1.0'
      }
    };
  };

  // Start process execution
  const handleStartExecution = () => {
    if (!selectedTemplate) return;

    const instance = createDemoInstance(selectedTemplate);
    const submissionData = createDemoSubmissionData(selectedTemplate);

    setCurrentInstance(instance);
    setInstanceData(submissionData);
    setIsExecuting(true);
    
    toast.success('Processo iniciado em modo demonstração');
  };

  // Handle save (demo mode)
  const handleSave = async (data: ProcessSubmissionData, isDraft: boolean) => {
    console.log('Demo Save:', { data, isDraft });
    setInstanceData(data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(isDraft ? 'Rascunho salvo (demo)' : 'Dados salvos (demo)');
  };

  // Handle submit (demo mode)
  const handleSubmit = async (data: ProcessSubmissionData) => {
    console.log('Demo Submit:', data);
    setInstanceData(data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Processo submetido (demo)');
    
    // End demo after submission
    setTimeout(() => {
      setIsExecuting(false);
      toast.info('Demo finalizada. Dados não foram persistidos.');
    }, 2000);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsExecuting(false);
    setCurrentInstance(null);
    setInstanceData(null);
    toast.info('Execução cancelada');
  };

  // Template selection view
  if (!selectedTemplate || !isExecuting) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Demo: Executor de Processos</h2>
              <p className="text-sm text-muted-foreground">
                Demonstração do mecanismo de execução de processos customizados
              </p>
            </div>
            
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 p-6">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum Template Disponível</h3>
                <p className="text-muted-foreground mb-6">
                  Crie um template de processo primeiro usando o Construtor de Processos.
                </p>
                <Button variant="outline" onClick={onClose}>
                  Criar Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Selecionar Template</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Select
                      value={selectedTemplate?.id || ''}
                      onValueChange={(value) => {
                        const template = templates.find(t => t.id === value);
                        setSelectedTemplate(template || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um template para demonstrar" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center space-x-2">
                              <span>{template.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {template.framework}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedTemplate && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {selectedTemplate.name}
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          {selectedTemplate.description || 'Sem descrição disponível'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{selectedTemplate.framework}</Badge>
                          <Badge variant="outline">
                            {selectedTemplate.field_definitions.fields.length} campos
                          </Badge>
                          <Badge variant="outline">
                            {selectedTemplate.workflow_definition.states.length} estados
                          </Badge>
                          {selectedTemplate.security_config.encryption_required && (
                            <Badge variant="outline" className="bg-green-50">
                              Criptografado
                            </Badge>
                          )}
                        </div>
                        <Button onClick={handleStartExecution} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Demonstração
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Demo Info */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-amber-800">
                    <Info className="h-5 w-5" />
                    <span>Modo Demonstração</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-amber-700">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Funcionalidade completa:</strong> Todos os recursos do runtime engine são testáveis.
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Dados temporários:</strong> Nenhum dado será salvo no banco de dados.
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Validação real:</strong> Todas as validações e regras são aplicadas normalmente.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Templates List */}
              <Card>
                <CardHeader>
                  <CardTitle>Templates Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.map(template => (
                      <div 
                        key={template.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.framework} • {template.field_definitions.fields.length} campos
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {template.security_config.access_level}
                            </Badge>
                            {template.is_active && (
                              <Badge variant="outline" className="text-xs bg-green-50">
                                Ativo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Process execution view
  return (
    <ProcessRuntimeEngine
      template={selectedTemplate}
      instanceId={currentInstance?.id}
      initialData={instanceData || undefined}
      onSave={handleSave}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      readonly={false}
      showWorkflow={true}
    />
  );
};