import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  Upload,
  BookOpen,
  Target,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  GripVertical,
  Copy,
  Settings,
  Zap,
  Eye,
  Play,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface Framework {
  id?: string;
  codigo: string;
  nome: string;
  descricao: string;
  tipo_framework: string;
  padrao_origem?: string;
  escala_maturidade: {
    levels: Array<{
      value: number;
      name: string;
      description: string;
    }>;
  };
  domains: Domain[];
}

interface Domain {
  id?: string;
  codigo: string;
  nome: string;
  descricao: string;
  peso: number;
  ordem: number;
  controls: Control[];
}

interface Control {
  id?: string;
  codigo: string;
  titulo: string;
  descricao: string;
  objetivo: string;
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  peso: number;
  ordem: number;
  questions: Question[];
}

interface Question {
  id?: string;
  codigo?: string;
  texto: string;
  descricao?: string;
  tipo_pergunta: 'escala' | 'sim_nao' | 'multipla_escolha' | 'texto_livre' | 'numerica';
  opcoes_resposta?: any;
  obrigatorio: boolean;
  peso: number;
  ordem: number;
}

// =====================================================
// FRAMEWORK BUILDER COMPONENT
// =====================================================

export default function FrameworkBuilder() {
  const { user, effectiveTenantId } = useAuth();
  
  // Estados principais
  const [framework, setFramework] = useState<Framework>({
    codigo: '',
    nome: '',
    descricao: '',
    tipo_framework: 'custom',
    escala_maturidade: {
      levels: [
        { value: 1, name: 'Inicial', description: 'Processos ad-hoc' },
        { value: 2, name: 'Básico', description: 'Processos definidos' },
        { value: 3, name: 'Intermediário', description: 'Processos documentados' },
        { value: 4, name: 'Avançado', description: 'Processos otimizados' },
        { value: 5, name: 'Otimizado', description: 'Melhoria contínua' }
      ]
    },
    domains: []
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const steps = [
    { title: 'Informações Básicas', description: 'Dados gerais do framework' },
    { title: 'Escala de Maturidade', description: 'Configurar níveis de avaliação' },
    { title: 'Domínios', description: 'Organizar controles por domínios' },
    { title: 'Controles', description: 'Definir controles e objetivos' },
    { title: 'Questões', description: 'Criar questões de avaliação' },
    { title: 'Revisão', description: 'Validar e salvar framework' }
  ];

  // Progresso calculado
  const progress = useMemo(() => {
    const basicInfoComplete = framework.codigo && framework.nome && framework.descricao;
    const maturityComplete = framework.escala_maturidade.levels.length >= 3;
    const domainsComplete = framework.domains.length > 0;
    const controlsComplete = framework.domains.some(d => d.controls.length > 0);
    const questionsComplete = framework.domains.some(d => 
      d.controls.some(c => c.questions.length > 0)
    );

    let completed = 0;
    if (basicInfoComplete) completed++;
    if (maturityComplete) completed++;
    if (domainsComplete) completed++;
    if (controlsComplete) completed++;
    if (questionsComplete) completed++;
    
    return Math.round((completed / 5) * 100);
  }, [framework]);

  // Validação do framework
  const validateFramework = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!framework.codigo.trim()) errors.push('Código é obrigatório');
    if (!framework.nome.trim()) errors.push('Nome é obrigatório');
    if (!framework.descricao.trim()) errors.push('Descrição é obrigatória');
    if (framework.domains.length === 0) errors.push('Pelo menos um domínio é necessário');
    
    framework.domains.forEach((domain, dIndex) => {
      if (!domain.nome.trim()) errors.push(`Domínio ${dIndex + 1}: Nome é obrigatório`);
      if (domain.controls.length === 0) errors.push(`Domínio ${dIndex + 1}: Pelo menos um controle é necessário`);
      
      domain.controls.forEach((control, cIndex) => {
        if (!control.titulo.trim()) errors.push(`Controle ${cIndex + 1}: Título é obrigatório`);
        if (control.questions.length === 0) errors.push(`Controle ${cIndex + 1}: Pelo menos uma questão é necessária`);
        
        control.questions.forEach((question, qIndex) => {
          if (!question.texto.trim()) errors.push(`Questão ${qIndex + 1}: Texto é obrigatório`);
        });
      });
    });
    
    return errors;
  }, [framework]);

  // Handlers para manipulação de dados
  const addDomain = () => {
    const newDomain: Domain = {
      codigo: `DOM-${framework.domains.length + 1}`,
      nome: '',
      descricao: '',
      peso: 1,
      ordem: framework.domains.length + 1,
      controls: []
    };
    
    setFramework(prev => ({
      ...prev,
      domains: [...prev.domains, newDomain]
    }));
  };

  const updateDomain = (index: number, field: keyof Domain, value: any) => {
    setFramework(prev => ({
      ...prev,
      domains: prev.domains.map((domain, i) => 
        i === index ? { ...domain, [field]: value } : domain
      )
    }));
  };

  const deleteDomain = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir este domínio?')) {
      setFramework(prev => ({
        ...prev,
        domains: prev.domains.filter((_, i) => i !== index)
      }));
    }
  };

  const addControl = (domainIndex: number) => {
    const domain = framework.domains[domainIndex];
    const newControl: Control = {
      codigo: `CTRL-${domain.controls.length + 1}`,
      titulo: '',
      descricao: '',
      objetivo: '',
      criticidade: 'media',
      peso: 1,
      ordem: domain.controls.length + 1,
      questions: []
    };
    
    updateDomain(domainIndex, 'controls', [...domain.controls, newControl]);
  };

  const updateControl = (domainIndex: number, controlIndex: number, field: keyof Control, value: any) => {
    setFramework(prev => ({
      ...prev,
      domains: prev.domains.map((domain, dIndex) => {
        if (dIndex === domainIndex) {
          return {
            ...domain,
            controls: domain.controls.map((control, cIndex) => 
              cIndex === controlIndex ? { ...control, [field]: value } : control
            )
          };
        }
        return domain;
      })
    }));
  };

  const addQuestion = (domainIndex: number, controlIndex: number) => {
    const control = framework.domains[domainIndex].controls[controlIndex];
    const newQuestion: Question = {
      texto: '',
      descricao: '',
      tipo_pergunta: 'escala',
      obrigatorio: true,
      peso: 1,
      ordem: control.questions.length + 1
    };
    
    updateControl(domainIndex, controlIndex, 'questions', [...control.questions, newQuestion]);
  };

  const updateQuestion = (domainIndex: number, controlIndex: number, questionIndex: number, field: keyof Question, value: any) => {
    setFramework(prev => ({
      ...prev,
      domains: prev.domains.map((domain, dIndex) => {
        if (dIndex === domainIndex) {
          return {
            ...domain,
            controls: domain.controls.map((control, cIndex) => {
              if (cIndex === controlIndex) {
                return {
                  ...control,
                  questions: control.questions.map((question, qIndex) => 
                    qIndex === questionIndex ? { ...question, [field]: value } : question
                  )
                };
              }
              return control;
            })
          };
        }
        return domain;
      })
    }));
  };

  // Drag and drop handlers
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;
    
    if (type === 'domain') {
      const reorderedDomains = Array.from(framework.domains);
      const [movedDomain] = reorderedDomains.splice(source.index, 1);
      reorderedDomains.splice(destination.index, 0, movedDomain);
      
      setFramework(prev => ({ ...prev, domains: reorderedDomains }));
    }
    // Adicionar handlers para controls e questions se necessário
  };

  // Salvar framework
  const saveFramework = async () => {
    const errors = validateFramework();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(`${errors.length} erro(s) encontrado(s)`);
      return;
    }

    setSaving(true);
    
    try {
      // Salvar framework principal
      const frameworkData = {
        tenant_id: effectiveTenantId,
        codigo: framework.codigo,
        nome: framework.nome,
        descricao: framework.descricao,
        tipo_framework: framework.tipo_framework,
        padrao_origem: framework.padrao_origem,
        escala_maturidade: framework.escala_maturidade,
        status: 'ativo',
        created_by: user?.id,
        updated_by: user?.id
      };

      const { data: savedFramework, error: frameworkError } = await supabase
        .from('assessment_frameworks')
        .insert([frameworkData])
        .select()
        .single();

      if (frameworkError) throw frameworkError;

      // Salvar domínios, controles e questões
      for (const domain of framework.domains) {
        const domainData = {
          tenant_id: effectiveTenantId,
          framework_id: savedFramework.id,
          codigo: domain.codigo,
          nome: domain.nome,
          descricao: domain.descricao,
          peso: domain.peso,
          ordem: domain.ordem,
          created_by: user?.id,
          updated_by: user?.id
        };

        const { data: savedDomain, error: domainError } = await supabase
          .from('assessment_domains')
          .insert([domainData])
          .select()
          .single();

        if (domainError) throw domainError;

        // Salvar controles e questões...
        for (const control of domain.controls) {
          const controlData = {
            tenant_id: effectiveTenantId,
            framework_id: savedFramework.id,
            domain_id: savedDomain.id,
            codigo: control.codigo,
            titulo: control.titulo,
            descricao: control.descricao,
            objetivo: control.objetivo,
            criticidade: control.criticidade,
            peso: control.peso,
            ordem: control.ordem,
            created_by: user?.id,
            updated_by: user?.id
          };

          const { data: savedControl, error: controlError } = await supabase
            .from('assessment_controls')
            .insert([controlData])
            .select()
            .single();

          if (controlError) throw controlError;

          // Salvar questões
          if (control.questions.length > 0) {
            const questionsData = control.questions.map(question => ({
              tenant_id: effectiveTenantId,
              control_id: savedControl.id,
              codigo: question.codigo,
              texto: question.texto,
              descricao: question.descricao,
              tipo_pergunta: question.tipo_pergunta,
              opcoes_resposta: question.opcoes_resposta,
              obrigatorio: question.obrigatorio,
              peso: question.peso,
              ordem: question.ordem,
              created_by: user?.id,
              updated_by: user?.id
            }));

            const { error: questionsError } = await supabase
              .from('assessment_questions')
              .insert(questionsData);

            if (questionsError) throw questionsError;
          }
        }
      }

      toast.success('Framework salvo com sucesso!');
      setValidationErrors([]);
      
      // Reset ou redirect
      // navigate('/assessments/frameworks');
      
    } catch (error) {
      console.error('Erro ao salvar framework:', error);
      toast.error('Erro ao salvar framework');
    } finally {
      setSaving(false);
    }
  };

  // Import/Export handlers
  const exportFramework = () => {
    const dataStr = JSON.stringify(framework, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `framework_${framework.codigo || 'novo'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportFramework = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setFramework(imported);
        toast.success('Framework importado com sucesso!');
        setShowImportDialog(false);
      } catch (error) {
        toast.error('Erro ao importar framework. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Framework Builder</h1>
                <p className="text-muted-foreground">Construtor visual de frameworks de assessment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {progress}% Completo
              </Badge>
              
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Editar' : 'Preview'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={exportFramework}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Framework</DialogTitle>
                    <DialogDescription>
                      Selecione um arquivo JSON com a estrutura do framework
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportFramework}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Cancelar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button onClick={saveFramework} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Framework'}
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Corrija os seguintes erros:</strong>
              <ul className="mt-2 ml-4 list-disc">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Passos de Construção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentStep === index 
                        ? 'bg-blue-100 border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentStep === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <DragDropContext onDragEnd={onDragEnd}>
              {/* Step content */}
              {currentStep === 0 && (
                <BasicInfoStep framework={framework} setFramework={setFramework} />
              )}
              
              {currentStep === 1 && (
                <MaturityScaleStep framework={framework} setFramework={setFramework} />
              )}
              
              {currentStep === 2 && (
                <DomainsStep 
                  framework={framework} 
                  addDomain={addDomain}
                  updateDomain={updateDomain}
                  deleteDomain={deleteDomain}
                />
              )}
              
              {currentStep === 3 && (
                <ControlsStep 
                  framework={framework}
                  addControl={addControl}
                  updateControl={updateControl}
                />
              )}
              
              {currentStep === 4 && (
                <QuestionsStep 
                  framework={framework}
                  addQuestion={addQuestion}
                  updateQuestion={updateQuestion}
                />
              )}
              
              {currentStep === 5 && (
                <ReviewStep framework={framework} errors={validationErrors} />
              )}
            </DragDropContext>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                >
                  Próximo
                </Button>
              ) : (
                <Button onClick={saveFramework} disabled={saving}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Framework
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STEP COMPONENTS
// =====================================================

function BasicInfoStep({ framework, setFramework }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              placeholder="Ex: ISO-27001-2022"
              value={framework.codigo}
              onChange={(e) => setFramework((prev: Framework) => ({ ...prev, codigo: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Framework</Label>
            <Select
              value={framework.tipo_framework}
              onValueChange={(value) => setFramework((prev: Framework) => ({ ...prev, tipo_framework: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="privacy">Privacidade</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="governance">Governança</SelectItem>
                <SelectItem value="custom">Customizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            placeholder="Ex: ISO 27001 - Segurança da Informação"
            value={framework.nome}
            onChange={(e) => setFramework((prev: Framework) => ({ ...prev, nome: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva o propósito e escopo deste framework..."
            value={framework.descricao}
            onChange={(e) => setFramework((prev: Framework) => ({ ...prev, descricao: e.target.value }))}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="origem">Padrão de Origem (Opcional)</Label>
          <Input
            id="origem"
            placeholder="Ex: ISO 27001:2022, NIST CSF, COBIT 2019"
            value={framework.padrao_origem || ''}
            onChange={(e) => setFramework((prev: Framework) => ({ ...prev, padrao_origem: e.target.value }))}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MaturityScaleStep({ framework, setFramework }: any) {
  const addLevel = () => {
    const newLevel = {
      value: framework.escala_maturidade.levels.length + 1,
      name: `Nível ${framework.escala_maturidade.levels.length + 1}`,
      description: ''
    };
    
    setFramework((prev: Framework) => ({
      ...prev,
      escala_maturidade: {
        levels: [...prev.escala_maturidade.levels, newLevel]
      }
    }));
  };

  const updateLevel = (index: number, field: string, value: string | number) => {
    setFramework((prev: Framework) => ({
      ...prev,
      escala_maturidade: {
        levels: prev.escala_maturidade.levels.map((level, i) => 
          i === index ? { ...level, [field]: value } : level
        )
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Escala de Maturidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            Defina os níveis de maturidade que serão usados nas avaliações. Recomendamos 5 níveis para maior granularidade.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {framework.escala_maturidade.levels.map((level: any, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-1">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={level.value}
                  onChange={(e) => updateLevel(index, 'value', parseInt(e.target.value))}
                />
              </div>
              <div className="col-span-3">
                <Label>Nome</Label>
                <Input
                  value={level.name}
                  onChange={(e) => updateLevel(index, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-7">
                <Label>Descrição</Label>
                <Input
                  value={level.description}
                  onChange={(e) => updateLevel(index, 'description', e.target.value)}
                  placeholder="Ex: Processos ad-hoc, sem documentação"
                />
              </div>
              <div className="col-span-1">
                <Button size="sm" variant="ghost" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={addLevel} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Nível
        </Button>
      </CardContent>
    </Card>
  );
}

function DomainsStep({ framework, addDomain, updateDomain, deleteDomain }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Domínios do Framework
            </CardTitle>
            <Button onClick={addDomain}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Domínio
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Droppable droppableId="domains" type="domain">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {framework.domains.map((domain: Domain, index: number) => (
              <Draggable key={index} draggableId={`domain-${index}`} index={index}>
                {(provided, snapshot) => (
                  <Card 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'shadow-lg' : ''}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-3">
                          <div className="col-span-2">
                            <Input
                              placeholder="Código"
                              value={domain.codigo}
                              onChange={(e) => updateDomain(index, 'codigo', e.target.value)}
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              placeholder="Nome do domínio"
                              value={domain.nome}
                              onChange={(e) => updateDomain(index, 'nome', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Peso"
                              value={domain.peso}
                              onChange={(e) => updateDomain(index, 'peso', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2 flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => deleteDomain(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Descrição do domínio..."
                        value={domain.descricao}
                        onChange={(e) => updateDomain(index, 'descricao', e.target.value)}
                        rows={2}
                      />
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {framework.domains.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground mb-4">Nenhum domínio criado ainda</p>
            <Button onClick={addDomain}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Domínio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ControlsStep({ framework, addControl, updateControl }: any) {
  return (
    <div className="space-y-4">
      {framework.domains.map((domain: Domain, domainIndex: number) => (
        <Card key={domainIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{domain.nome || `Domínio ${domainIndex + 1}`}</CardTitle>
              <Button size="sm" onClick={() => addControl(domainIndex)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Controle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {domain.controls.map((control: Control, controlIndex: number) => (
              <Card key={controlIndex} className="bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-2">
                      <Label>Código</Label>
                      <Input
                        placeholder="CTRL-01"
                        value={control.codigo}
                        onChange={(e) => updateControl(domainIndex, controlIndex, 'codigo', e.target.value)}
                      />
                    </div>
                    <div className="col-span-6">
                      <Label>Título</Label>
                      <Input
                        placeholder="Título do controle"
                        value={control.titulo}
                        onChange={(e) => updateControl(domainIndex, controlIndex, 'titulo', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Criticidade</Label>
                      <Select
                        value={control.criticidade}
                        onValueChange={(value) => updateControl(domainIndex, controlIndex, 'criticidade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Peso</Label>
                      <Input
                        type="number"
                        value={control.peso}
                        onChange={(e) => updateControl(domainIndex, controlIndex, 'peso', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descrição detalhada do controle..."
                      value={control.descricao}
                      onChange={(e) => updateControl(domainIndex, controlIndex, 'descricao', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Objetivo</Label>
                    <Textarea
                      placeholder="Objetivo deste controle..."
                      value={control.objetivo}
                      onChange={(e) => updateControl(domainIndex, controlIndex, 'objetivo', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuestionsStep({ framework, addQuestion, updateQuestion }: any) {
  return (
    <div className="space-y-4">
      {framework.domains.map((domain: Domain, domainIndex: number) => (
        <Card key={domainIndex}>
          <CardHeader>
            <CardTitle className="text-lg">{domain.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {domain.controls.map((control: Control, controlIndex: number) => (
              <Card key={controlIndex} className="bg-gray-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{control.titulo}</CardTitle>
                    <Button size="sm" onClick={() => addQuestion(domainIndex, controlIndex)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Questão
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {control.questions.map((question: Question, questionIndex: number) => (
                    <Card key={questionIndex} className="bg-white">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-8">
                            <Label>Pergunta</Label>
                            <Textarea
                              placeholder="Digite a pergunta..."
                              value={question.texto}
                              onChange={(e) => updateQuestion(domainIndex, controlIndex, questionIndex, 'texto', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Tipo</Label>
                            <Select
                              value={question.tipo_pergunta}
                              onValueChange={(value) => updateQuestion(domainIndex, controlIndex, questionIndex, 'tipo_pergunta', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="escala">Escala</SelectItem>
                                <SelectItem value="sim_nao">Sim/Não</SelectItem>
                                <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                                <SelectItem value="texto_livre">Texto Livre</SelectItem>
                                <SelectItem value="numerica">Numérica</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <div>
                              <Label>Obrigatória</Label>
                              <div className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  checked={question.obrigatorio}
                                  onChange={(e) => updateQuestion(domainIndex, controlIndex, questionIndex, 'obrigatorio', e.target.checked)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Descrição/Ajuda (Opcional)</Label>
                          <Input
                            placeholder="Orientações para responder..."
                            value={question.descricao || ''}
                            onChange={(e) => updateQuestion(domainIndex, controlIndex, questionIndex, 'descricao', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReviewStep({ framework, errors }: any) {
  const stats = useMemo(() => {
    const totalDomains = framework.domains.length;
    const totalControls = framework.domains.reduce((sum: number, d: Domain) => sum + d.controls.length, 0);
    const totalQuestions = framework.domains.reduce((sum: number, d: Domain) => 
      sum + d.controls.reduce((sum2: number, c: Control) => sum2 + c.questions.length, 0), 0
    );

    return { totalDomains, totalControls, totalQuestions };
  }, [framework]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Revisão Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalDomains}</div>
              <div className="text-sm text-muted-foreground">Domínios</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalControls}</div>
              <div className="text-sm text-muted-foreground">Controles</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Questões</div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Informações do Framework</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="font-medium">Código:</dt>
              <dd>{framework.codigo}</dd>
              <dt className="font-medium">Nome:</dt>
              <dd>{framework.nome}</dd>
              <dt className="font-medium">Tipo:</dt>
              <dd>{framework.tipo_framework}</dd>
              <dt className="font-medium">Escala:</dt>
              <dd>{framework.escala_maturidade.levels.length} níveis</dd>
            </dl>
          </div>

          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ainda há {errors.length} erro(s) a serem corrigidos:</strong>
                <ul className="mt-2 ml-4 list-disc text-sm">
                  {errors.slice(0, 5).map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 5 && <li>... e mais {errors.length - 5} erros</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {errors.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Framework válido e pronto para ser salvo!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}