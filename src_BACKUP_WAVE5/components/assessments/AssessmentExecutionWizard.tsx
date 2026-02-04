import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Save, 
  Send, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  MessageSquare,
  Upload,
  Download,
  Bookmark,
  Star,
  HelpCircle,
  Lightbulb,
  Shield,
  Target,
  Zap,
  Eye,
  SkipForward
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useAssessment } from '@/hooks/useAssessments';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface QuestionData {
  id: string;
  texto: string;
  descricao?: string;
  tipo_pergunta: 'escala' | 'sim_nao' | 'multipla_escolha' | 'texto_livre' | 'numerica';
  opcoes_resposta?: any;
  obrigatorio: boolean;
  peso: number;
  control: {
    id: string;
    titulo: string;
    criticidade: string;
    domain: {
      id: string;
      nome: string;
    };
  };
}

interface ResponseData {
  question_id: string;
  resposta_valor?: string;
  pontuacao?: number;
  comentario?: string;
  evidencias?: string[];
  status: 'nao_respondida' | 'em_andamento' | 'respondida' | 'revisada';
}

interface WizardState {
  currentStep: number;
  totalSteps: number;
  currentDomain: string;
  progress: number;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
}

// =====================================================
// ASSESSMENT EXECUTION WIZARD
// =====================================================

export default function AssessmentExecutionWizard() {
  const { assessmentId } = useParams();
  const { user, effectiveTenantId } = useAuth();
  const navigate = useNavigate();
  
  // Estados principais
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: ResponseData }>({});
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 0,
    totalSteps: 0,
    currentDomain: '',
    progress: 0,
    autoSaveStatus: 'idle',
    lastSaved: null
  });
  
  // Estados da questão atual
  const [currentResponse, setCurrentResponse] = useState<Partial<ResponseData>>({});
  const [showHints, setShowHints] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Hook para carregar assessment
  const { 
    assessment, 
    isLoading, 
    error: assessmentError 
  } = useAssessment(assessmentId || '');

  // Questão atual calculada
  const currentQuestion = useMemo(() => {
    return questions[wizardState.currentStep] || null;
  }, [questions, wizardState.currentStep]);

  // Progresso calculado
  const calculatedProgress = useMemo(() => {
    if (questions.length === 0) return 0;
    const answeredCount = Object.keys(responses).filter(
      qid => responses[qid].status !== 'nao_respondida'
    ).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [questions.length, responses]);

  // Carregar dados do assessment
  useEffect(() => {
    if (assessmentId && effectiveTenantId) {
      loadAssessmentQuestions();
      loadExistingResponses();
    }
  }, [assessmentId, effectiveTenantId]);

  // Auto-save inteligente
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (wizardState.autoSaveStatus === 'idle' && Object.keys(responses).length > 0) {
        handleAutoSave();
      }
    }, 10000); // Auto-save a cada 10 segundos

    return () => clearInterval(autoSaveInterval);
  }, [responses, wizardState.autoSaveStatus]);

  // Atualizar progresso
  useEffect(() => {
    setWizardState(prev => ({
      ...prev,
      progress: calculatedProgress,
      totalSteps: questions.length
    }));
  }, [calculatedProgress, questions.length]);

  const loadAssessmentQuestions = async () => {
    try {
      if (!assessment?.framework_id) return;

      const { data: questionsData, error } = await supabase
        .from('assessment_questions')
        .select(`
          id,
          texto,
          descricao,
          tipo_pergunta,
          opcoes_resposta,
          obrigatorio,
          peso,
          control:assessment_controls(
            id,
            titulo,
            criticidade,
            domain:assessment_domains(
              id,
              nome
            )
          )
        `)
        .eq('control.framework_id', assessment.framework_id)
        .order('control.domain.ordem, control.ordem, ordem');

      if (error) throw error;

      setQuestions(questionsData || []);
      
      // Inicializar responses vazias
      const initialResponses: { [key: string]: ResponseData } = {};
      (questionsData || []).forEach(q => {
        initialResponses[q.id] = {
          question_id: q.id,
          status: 'nao_respondida'
        };
      });
      setResponses(initialResponses);

    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      toast.error('Erro ao carregar questões do assessment');
    }
  };

  const loadExistingResponses = async () => {
    try {
      const { data: existingResponses, error } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      if (existingResponses && existingResponses.length > 0) {
        const responsesMap: { [key: string]: ResponseData } = {};
        existingResponses.forEach(resp => {
          responsesMap[resp.question_id] = {
            question_id: resp.question_id,
            resposta_valor: resp.resposta_valor,
            pontuacao: resp.pontuacao,
            comentario: resp.comentario,
            evidencias: resp.evidencias || [],
            status: resp.status || 'respondida'
          };
        });
        setResponses(prev => ({ ...prev, ...responsesMap }));
      }

    } catch (error) {
      console.error('Erro ao carregar respostas existentes:', error);
    }
  };

  const handleAutoSave = useCallback(async () => {
    setWizardState(prev => ({ ...prev, autoSaveStatus: 'saving' }));

    try {
      const responsesToSave = Object.values(responses).filter(
        r => r.status !== 'nao_respondida'
      );

      if (responsesToSave.length === 0) {
        setWizardState(prev => ({ ...prev, autoSaveStatus: 'idle' }));
        return;
      }

      // Preparar dados para upsert
      const upsertData = responsesToSave.map(response => ({
        assessment_id: assessmentId,
        question_id: response.question_id,
        tenant_id: effectiveTenantId,
        resposta_valor: response.resposta_valor,
        pontuacao: response.pontuacao,
        comentario: response.comentario,
        evidencias: response.evidencias,
        status: response.status,
        respondido_por: user?.id,
        respondido_em: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('assessment_responses')
        .upsert(upsertData, { 
          onConflict: 'assessment_id,question_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      setWizardState(prev => ({
        ...prev,
        autoSaveStatus: 'saved',
        lastSaved: new Date()
      }));

      // Resetar status após 3 segundos
      setTimeout(() => {
        setWizardState(prev => ({ ...prev, autoSaveStatus: 'idle' }));
      }, 3000);

    } catch (error) {
      console.error('Erro no auto-save:', error);
      setWizardState(prev => ({ ...prev, autoSaveStatus: 'error' }));
      toast.error('Erro ao salvar automaticamente');
    }
  }, [responses, assessmentId, effectiveTenantId, user?.id]);

  const handleResponseChange = (questionId: string, field: keyof ResponseData, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
        status: 'em_andamento'
      }
    }));

    // Trigger auto-save após mudança
    setWizardState(prev => ({ ...prev, autoSaveStatus: 'idle' }));
  };

  const validateCurrentResponse = (): boolean => {
    if (!currentQuestion) return true;

    const response = responses[currentQuestion.id];
    const errors: string[] = [];

    // Validação obrigatória
    if (currentQuestion.obrigatorio) {
      if (!response?.resposta_valor || response.resposta_valor.trim() === '') {
        errors.push('Esta questão é obrigatória');
      }
    }

    // Validações específicas por tipo
    if (currentQuestion.tipo_pergunta === 'numerica') {
      const numValue = parseFloat(response?.resposta_valor || '');
      if (response?.resposta_valor && (isNaN(numValue) || numValue < 0)) {
        errors.push('Valor numérico inválido');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const navigateToStep = (step: number) => {
    if (step < 0 || step >= questions.length) return;

    // Validar questão atual antes de navegar
    if (step > wizardState.currentStep && !validateCurrentResponse()) {
      toast.error('Complete a questão atual antes de continuar');
      return;
    }

    const newDomain = questions[step]?.control?.domain?.nome || '';
    setWizardState(prev => ({
      ...prev,
      currentStep: step,
      currentDomain: newDomain
    }));

    // Carregar resposta atual
    setCurrentResponse(responses[questions[step]?.id] || {});
    setValidationErrors([]);
  };

  const handleNext = () => {
    if (validateCurrentResponse()) {
      // Marcar como respondida se tem valor
      const response = responses[currentQuestion?.id || ''];
      if (response?.resposta_valor) {
        handleResponseChange(currentQuestion?.id || '', 'status', 'respondida');
      }
      navigateToStep(wizardState.currentStep + 1);
    }
  };

  const handlePrevious = () => {
    navigateToStep(wizardState.currentStep - 1);
  };

  const handleSkip = () => {
    if (currentQuestion && !currentQuestion.obrigatorio) {
      navigateToStep(wizardState.currentStep + 1);
    } else {
      toast.error('Questões obrigatórias não podem ser puladas');
    }
  };

  const handleFinishAssessment = async () => {
    // Validar se todas as obrigatórias foram respondidas
    const unansweredRequired = questions.filter(q => 
      q.obrigatorio && (!responses[q.id]?.resposta_valor || responses[q.id].status === 'nao_respondida')
    );

    if (unansweredRequired.length > 0) {
      toast.error(`${unansweredRequired.length} questões obrigatórias ainda precisam ser respondidas`);
      return;
    }

    try {
      // Salvar tudo antes de finalizar
      await handleAutoSave();

      // Atualizar status do assessment
      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'em_revisao',
          percentual_conclusao: 100,
          data_conclusao_respostas: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Assessment finalizado com sucesso!');
      navigate('/assessments');

    } catch (error) {
      console.error('Erro ao finalizar assessment:', error);
      toast.error('Erro ao finalizar assessment');
    }
  };

  // Loading state
  if (isLoading || questions.length === 0) {
    return <AssessmentExecutionSkeleton />;
  }

  // Error state
  if (assessmentError || !assessment) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar assessment. Verifique se você tem permissão para acessá-lo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Assessment Concluído!</h2>
            <p className="text-muted-foreground mb-6">
              Todas as questões foram respondidas. Você pode revisar suas respostas ou finalizar o assessment.
            </p>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => navigateToStep(0)}>
                Revisar Respostas
              </Button>
              <Button onClick={handleFinishAssessment}>
                Finalizar Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/assessments')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="font-semibold">{assessment.titulo}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.control.domain.nome} • Questão {wizardState.currentStep + 1} de {wizardState.totalSteps}
                </p>
              </div>
            </div>

            {/* Auto-save status */}
            <div className="flex items-center gap-3">
              <AutoSaveIndicator status={wizardState.autoSaveStatus} lastSaved={wizardState.lastSaved} />
              
              <Badge variant="outline">
                {wizardState.progress}% Concluído
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={wizardState.progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="min-h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{currentQuestion.control.domain.nome}</Badge>
                    <Badge variant={currentQuestion.control.criticidade === 'critica' ? 'destructive' : 'secondary'}>
                      {currentQuestion.control.criticidade}
                    </Badge>
                    {currentQuestion.obrigatorio && (
                      <Badge variant="destructive">Obrigatória</Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl mb-2">
                    {currentQuestion.control.titulo}
                  </CardTitle>
                  
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    {currentQuestion.texto}
                  </p>
                  
                  {currentQuestion.descricao && (
                    <p className="text-muted-foreground">
                      {currentQuestion.descricao}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Ajuda
                </Button>
              </div>

              {/* Hints expandible */}
              {showHints && (
                <Alert className="mt-4">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Para questões de maturidade, considere:
                    <ul className="mt-2 ml-4 list-disc text-sm">
                      <li><strong>1 (Inicial):</strong> Processos ad-hoc, sem documentação</li>
                      <li><strong>2 (Básico):</strong> Processos definidos informalmente</li>
                      <li><strong>3 (Intermediário):</strong> Processos documentados e seguidos</li>
                      <li><strong>4 (Avançado):</strong> Processos otimizados e monitorados</li>
                      <li><strong>5 (Otimizado):</strong> Melhoria contínua implementada</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc ml-4">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Question input */}
              <QuestionInput
                question={currentQuestion}
                response={responses[currentQuestion.id]}
                onChange={(field, value) => handleResponseChange(currentQuestion.id, field, value)}
              />

              {/* Comments section */}
              <div className="space-y-3">
                <Label htmlFor="comentario">Comentários e Justificativas</Label>
                <Textarea
                  id="comentario"
                  placeholder="Adicione comentários para justificar sua resposta ou fornecer contexto adicional..."
                  value={responses[currentQuestion.id]?.comentario || ''}
                  onChange={(e) => handleResponseChange(currentQuestion.id, 'comentario', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Evidence upload placeholder */}
              <div className="space-y-3">
                <Label>Evidências (Opcional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-muted-foreground">
                    Arraste arquivos aqui ou clique para fazer upload de evidências
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos suportados: PDF, DOC, XLS, IMG (máx. 10MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={wizardState.currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              {!currentQuestion.obrigatorio && (
                <Button variant="ghost" onClick={handleSkip}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Pular
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleAutoSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              
              {wizardState.currentStep === wizardState.totalSteps - 1 ? (
                <Button onClick={handleFinishAssessment}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Assessment
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-2" />
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
// SUBCOMPONENTES
// =====================================================

function QuestionInput({ question, response, onChange }: any) {
  if (!question) return null;

  const handleScaleChange = (value: string) => {
    const numValue = parseInt(value);
    onChange('resposta_valor', value);
    onChange('pontuacao', numValue); // Para escalas, pontuação = valor
  };

  switch (question.tipo_pergunta) {
    case 'escala':
      const scale = question.opcoes_resposta?.scale || [1, 2, 3, 4, 5];
      const labels = question.opcoes_resposta?.labels || {
        1: 'Inicial', 2: 'Básico', 3: 'Intermediário', 4: 'Avançado', 5: 'Otimizado'
      };
      
      return (
        <div className="space-y-4">
          <Label>Nível de Maturidade</Label>
          <RadioGroup 
            value={response?.resposta_valor || ''} 
            onValueChange={handleScaleChange}
          >
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {scale.map((value: number) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value.toString()} id={`scale-${value}`} />
                  <Label htmlFor={`scale-${value}`} className="cursor-pointer flex-1">
                    <div className="text-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className="font-semibold">{value}</div>
                      <div className="text-xs text-muted-foreground">
                        {labels[value] || `Nível ${value}`}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );

    case 'sim_nao':
      return (
        <div className="space-y-3">
          <Label>Resposta</Label>
          <RadioGroup 
            value={response?.resposta_valor || ''} 
            onValueChange={(value) => {
              onChange('resposta_valor', value);
              onChange('pontuacao', value === 'sim' ? 5 : 1);
            }}
          >
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="sim" />
                <Label htmlFor="sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="nao" />
                <Label htmlFor="nao" className="cursor-pointer">Não</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      );

    case 'multipla_escolha':
      const options = question.opcoes_resposta?.options || [];
      return (
        <div className="space-y-3">
          <Label>Selecione uma opção</Label>
          <RadioGroup 
            value={response?.resposta_valor || ''} 
            onValueChange={(value) => onChange('resposta_valor', value)}
          >
            <div className="space-y-2">
              {options.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );

    case 'numerica':
      return (
        <div className="space-y-3">
          <Label>Valor Numérico</Label>
          <Input
            type="number"
            placeholder="Digite um valor numérico..."
            value={response?.resposta_valor || ''}
            onChange={(e) => onChange('resposta_valor', e.target.value)}
          />
        </div>
      );

    case 'texto_livre':
    default:
      return (
        <div className="space-y-3">
          <Label>Resposta</Label>
          <Textarea
            placeholder="Digite sua resposta..."
            value={response?.resposta_valor || ''}
            onChange={(e) => onChange('resposta_valor', e.target.value)}
            rows={4}
          />
        </div>
      );
  }
}

function AutoSaveIndicator({ status, lastSaved }: any) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-blue-600">Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Salvo</span>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-red-600" />
          <span className="text-red-600">Erro ao salvar</span>
        </>
      )}
    </div>
  );
}

function AssessmentExecutionSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="mt-3 h-2 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="min-h-[600px]">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}