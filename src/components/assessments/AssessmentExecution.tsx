import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
  Target,
  Users,
  Calendar,
  BookOpen,
  Star,
  MessageSquare,
  Upload,
  Download,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { Assessment, AssessmentQuestion, AssessmentControl, AssessmentResponse } from '@/types/assessment';

interface AssessmentExecutionProps {
  assessmentId?: string;
}

export default function AssessmentExecutionProfessional({ assessmentId }: AssessmentExecutionProps) {
  const { user, effectiveTenantId } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const currentAssessmentId = assessmentId || params.assessmentId;

  // Estados principais
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: AssessmentResponse }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executionMode, setExecutionMode] = useState<'guided' | 'free'>('guided');
  
  // Estados de navegação
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedControl, setSelectedControl] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Estados de resposta atual
  const [currentResponse, setCurrentResponse] = useState<Partial<AssessmentResponse>>({});
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  useEffect(() => {
    if (currentAssessmentId && effectiveTenantId) {
      loadAssessmentData();
    }
  }, [currentAssessmentId, effectiveTenantId]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);

      // Carregar assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(
            id, nome, tipo_framework, escala_maturidade
          ),
          responsavel_profile:profiles!responsavel_assessment(id, full_name),
          coordenador_profile:profiles!coordenador_assessment(id, full_name)
        `)
        .eq('id', currentAssessmentId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      // Carregar questões do framework
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select(`
          *,
          control:assessment_controls(
            id, codigo, titulo, domain_id, criticidade, peso,
            domain:assessment_domains(id, codigo, nome, ordem)
          )
        `)
        .eq('tenant_id', effectiveTenantId)
        .eq('ativa', true)
        .in('control_id', [
          // Subconsulta para pegar controles do framework
        ])
        .order('ordem', { ascending: true });

      if (questionsError) throw questionsError;

      // Filtrar questões pelo framework do assessment
      const frameworkQuestions = questionsData?.filter(q => 
        q.control?.domain?.id // Ajustar lógica conforme estrutura do banco
      ) || [];

      setQuestions(frameworkQuestions);

      // Carregar respostas existentes
      const { data: responsesData, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', currentAssessmentId)
        .eq('tenant_id', effectiveTenantId);

      if (responsesError) throw responsesError;

      // Organizar respostas por question_id
      const responsesMap = (responsesData || []).reduce((acc, response) => {
        acc[response.question_id] = response;
        return acc;
      }, {} as { [key: string]: AssessmentResponse });

      setResponses(responsesMap);

    } catch (error) {
      console.error('Erro ao carregar dados do assessment:', error);
      toast.error('Erro ao carregar assessment');
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = async (questionId: string, responseData: Partial<AssessmentResponse>) => {
    try {
      setSaving(true);

      const response = {
        ...responseData,
        tenant_id: effectiveTenantId,
        assessment_id: currentAssessmentId,
        question_id: questionId,
        control_id: questions.find(q => q.id === questionId)?.control_id,
        respondido_por: user?.id,
        data_resposta: new Date().toISOString()
      };

      const existingResponse = responses[questionId];

      if (existingResponse) {
        // Atualizar resposta existente
        const { error } = await supabase
          .from('assessment_responses')
          .update(response)
          .eq('id', existingResponse.id);

        if (error) throw error;
      } else {
        // Criar nova resposta
        const { data, error } = await supabase
          .from('assessment_responses')
          .insert(response)
          .select()
          .single();

        if (error) throw error;
        
        setResponses(prev => ({
          ...prev,
          [questionId]: data
        }));
      }

      toast.success('Resposta salva com sucesso');

      // Atualizar progresso do assessment
      await updateAssessmentProgress();

    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast.error('Erro ao salvar resposta');
    } finally {
      setSaving(false);
    }
  };

  const updateAssessmentProgress = async () => {
    try {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(responses).length;
      const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

      await supabase
        .from('assessments')
        .update({ 
          percentual_conclusao: progressPercent,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAssessmentId);

    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const calculateMaturityScore = (responseValue: number, maxValue: number = 5) => {
    return Math.round((responseValue / maxValue) * 100);
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const isQuestionAnswered = (questionId: string) => {
    return !!responses[questionId];
  };

  const getProgressData = () => {
    const total = questions.length;
    const answered = Object.keys(responses).length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    
    return { total, answered, percentage };
  };

  const renderQuestionInput = (question: AssessmentQuestion) => {
    const existingResponse = responses[question.id];
    
    switch (question.tipo_pergunta) {
      case 'escala':
        return (
          <div className="space-y-3">
            <Label>Avaliação (1-5)</Label>
            <RadioGroup
              value={existingResponse?.resposta_numerica?.toString() || ''}
              onValueChange={(value) => setCurrentResponse(prev => ({ 
                ...prev, 
                resposta_numerica: parseInt(value),
                percentual_conformidade: calculateMaturityScore(parseInt(value))
              }))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value.toString()} id={`scale-${value}`} />
                  <Label htmlFor={`scale-${value}`} className="flex items-center gap-2">
                    <span>{value}</span>
                    <div className="flex">
                      {Array.from({ length: value }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'sim_nao':
        return (
          <div className="space-y-3">
            <Label>Resposta</Label>
            <RadioGroup
              value={existingResponse?.resposta_booleana?.toString() || ''}
              onValueChange={(value) => setCurrentResponse(prev => ({ 
                ...prev, 
                resposta_booleana: value === 'true',
                percentual_conformidade: value === 'true' ? 100 : 0
              }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="yes" />
                <Label htmlFor="yes">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="no" />
                <Label htmlFor="no">Não</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'multipla_escolha':
        return (
          <div className="space-y-3">
            <Label>Selecione as opções aplicáveis</Label>
            <div className="space-y-2">
              {question.opcoes_resposta?.opcoes?.map((opcao: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={existingResponse?.resposta_multipla_escolha?.includes(opcao) || false}
                    onCheckedChange={(checked) => {
                      const currentOptions = existingResponse?.resposta_multipla_escolha || [];
                      const newOptions = checked
                        ? [...currentOptions, opcao]
                        : currentOptions.filter(o => o !== opcao);
                      
                      setCurrentResponse(prev => ({
                        ...prev,
                        resposta_multipla_escolha: newOptions
                      }));
                    }}
                  />
                  <Label htmlFor={`option-${index}`}>{opcao}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'texto_livre':
        return (
          <div className="space-y-3">
            <Label>Resposta Detalhada</Label>
            <Textarea
              value={existingResponse?.resposta_texto || ''}
              onChange={(e) => setCurrentResponse(prev => ({ 
                ...prev, 
                resposta_texto: e.target.value 
              }))}
              placeholder="Descreva sua resposta..."
              rows={4}
            />
          </div>
        );

      case 'numerica':
        return (
          <div className="space-y-3">
            <Label>Valor Numérico</Label>
            <Input
              type="number"
              value={existingResponse?.resposta_numerica || ''}
              onChange={(e) => setCurrentResponse(prev => ({ 
                ...prev, 
                resposta_numerica: parseFloat(e.target.value) 
              }))}
              min={question.valor_minimo}
              max={question.valor_maximo}
            />
          </div>
        );

      case 'data':
        return (
          <div className="space-y-3">
            <Label>Data</Label>
            <Input
              type="date"
              value={existingResponse?.resposta_data || ''}
              onChange={(e) => setCurrentResponse(prev => ({ 
                ...prev, 
                resposta_data: e.target.value 
              }))}
            />
          </div>
        );

      default:
        return (
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <p className="text-orange-800">Tipo de pergunta não suportado: {question.tipo_pergunta}</p>
          </div>
        );
    }
  };

  const renderGuidedExecution = () => {
    const currentQuestion = getCurrentQuestion();
    const progress = getProgressData();

    if (!currentQuestion) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Assessment Concluído!</h3>
            <p className="text-muted-foreground">
              Todas as questões foram respondidas.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Cabeçalho com Progresso */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Questão {currentQuestionIndex + 1} de {questions.length}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.control?.domain?.nome} • {currentQuestion.control?.titulo}
                </p>
              </div>
              <Badge className={`${
                isQuestionAnswered(currentQuestion.id) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isQuestionAnswered(currentQuestion.id) ? 'Respondida' : 'Pendente'}
              </Badge>
            </div>
            <Progress value={progress.percentage} className="mt-4" />
            <p className="text-sm text-muted-foreground">
              {progress.answered} de {progress.total} questões respondidas ({progress.percentage}%)
            </p>
          </CardHeader>
        </Card>

        {/* Questão Atual */}
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.texto}</CardTitle>
            {currentQuestion.descricao && (
              <p className="text-muted-foreground">{currentQuestion.descricao}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestionInput(currentQuestion)}

            {/* Evidências */}
            <div className="space-y-3">
              <Label>Evidências e Justificativas</Label>
              <Textarea
                placeholder="Justifique sua resposta e inclua evidências..."
                value={currentResponse.justificativa || ''}
                onChange={(e) => setCurrentResponse(prev => ({ 
                  ...prev, 
                  justificativa: e.target.value 
                }))}
                rows={3}
              />
            </div>

            {/* Upload de Arquivos */}
            <div className="space-y-3">
              <Label>Anexos de Evidência</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Arraste arquivos aqui ou clique para selecionar</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setEvidenceFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => saveResponse(currentQuestion.id, currentResponse)}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>

                <Button
                  onClick={() => {
                    saveResponse(currentQuestion.id, currentResponse);
                    setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1));
                  }}
                  disabled={saving}
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Questão */}
        {currentQuestion.texto_ajuda && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <MessageSquare className="h-4 w-4" />
                Orientações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">{currentQuestion.texto_ajuda}</p>
              {currentQuestion.exemplos && currentQuestion.exemplos.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-blue-700 mb-2">Exemplos:</h5>
                  <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                    {currentQuestion.exemplos.map((exemplo, index) => (
                      <li key={index}>{exemplo}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderFreeExecution = () => {
    const progress = getProgressData();

    return (
      <div className="space-y-6">
        {/* Cabeçalho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Execução Livre - Todas as Questões
            </CardTitle>
            <Progress value={progress.percentage} className="mt-4" />
            <p className="text-sm text-muted-foreground">
              {progress.answered} de {progress.total} questões respondidas ({progress.percentage}%)
            </p>
          </CardHeader>
        </Card>

        {/* Lista de Questões */}
        <div className="grid gap-4">
          {questions.map((question, index) => {
            const isAnswered = isQuestionAnswered(question.id);
            
            return (
              <Card key={question.id} className={isAnswered ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {index + 1}. {question.texto}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {question.control?.domain?.nome} • {question.control?.titulo}
                      </p>
                    </div>
                    <Badge className={isAnswered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {isAnswered ? 'Respondida' : 'Pendente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderQuestionInput(question)}
                  <div className="flex justify-end mt-4">
                    <Button
                      size="sm"
                      onClick={() => saveResponse(question.id, currentResponse)}
                      disabled={saving}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Assessment não encontrado</h3>
          <p className="text-muted-foreground">
            O assessment solicitado não foi encontrado ou você não tem permissão para acessá-lo.
          </p>
          <Button className="mt-4" onClick={() => navigate('/assessments')}>
            Voltar aos Assessments
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold mt-2">{assessment.titulo}</h1>
          <p className="text-muted-foreground">
            {assessment.framework?.nome} • {assessment.responsavel_profile?.full_name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {assessment.status.replace('_', ' ')}
          </Badge>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Modos de Execução */}
      <Tabs value={executionMode} onValueChange={(value) => setExecutionMode(value as 'guided' | 'free')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guided" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Execução Guiada
          </TabsTrigger>
          <TabsTrigger value="free" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Execução Livre
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guided">
          {renderGuidedExecution()}
        </TabsContent>

        <TabsContent value="free">
          {renderFreeExecution()}
        </TabsContent>
      </Tabs>
    </div>
  );
}