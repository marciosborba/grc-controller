import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield,
  FileCheck,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Brain,
  HelpCircle,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  Star,
  Activity,
  Target,
  Award,
  Info,
  Calendar,
  User,
  Building
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number' | 'file_upload' | 'rating';
  options?: string[];
  required: boolean;
  weight: number;
  help_text?: string;
}

interface AssessmentData {
  id: string;
  assessment_name: string;
  due_date: string;
  progress_percentage: number;
  responses: Record<string, any>;
  vendor_registry: {
    name: string;
    primary_contact_name: string;
  };
  vendor_assessment_frameworks: {
    name: string;
    framework_type: string;
    questions: Question[];
  };
}

interface PublicVendorAssessmentProps {
  publicLinkId: string;
}

export const PublicVendorAssessment: React.FC<PublicVendorAssessmentProps> = ({
  publicLinkId
}) => {
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showAlexHelp, setShowAlexHelp] = useState(false);

  // Load assessment data
  useEffect(() => {
    loadAssessmentData();
  }, [publicLinkId]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor_registry:vendor_id (
            name,
            primary_contact_name
          ),
          vendor_assessment_frameworks:framework_id (
            name,
            framework_type,
            questions
          )
        `)
        .eq('public_link', publicLinkId)
        .single();

      if (error || !data) {
        toast({
          title: "Assessment Não Encontrado",
          description: "O link pode ter expirado ou ser inválido",
          variant: "destructive"
        });
        return;
      }

      // Check if expired
      if (data.public_link_expires_at && new Date(data.public_link_expires_at) < new Date()) {
        setIsExpired(true);
        toast({
          title: "Link Expirado",
          description: "Este link de assessment expirou. Entre em contato conosco para solicitar um novo link.",
          variant: "destructive"
        });
        return;
      }

      setAssessment(data);
      setResponses(data.responses || {});

    } catch (error) {
      console.error('Erro ao carregar assessment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o assessment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Group questions by category
  const getQuestionsByCategory = () => {
    if (!assessment?.vendor_assessment_frameworks?.questions) return [];

    const categories: Record<string, Question[]> = {};
    
    assessment.vendor_assessment_frameworks.questions.forEach(question => {
      if (!categories[question.category]) {
        categories[question.category] = [];
      }
      categories[question.category].push(question);
    });

    return Object.entries(categories).map(([category, questions]) => ({
      category,
      questions
    }));
  };

  const sections = getQuestionsByCategory();

  // Calculate progress
  const calculateProgress = () => {
    if (!assessment) return 0;
    
    const totalQuestions = assessment.vendor_assessment_frameworks?.questions?.length || 0;
    const answeredQuestions = Object.keys(responses).filter(key => 
      responses[key] !== undefined && responses[key] !== ''
    ).length;

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  // Save responses
  const saveResponses = async () => {
    if (!assessment) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          responses,
          progress_percentage: calculateProgress(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (error) throw error;

      toast({
        title: "Respostas Salvas",
        description: "Suas respostas foram salvas automaticamente"
      });

    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as respostas",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit assessment
  const submitAssessment = async () => {
    if (!assessment) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          responses,
          progress_percentage: 100,
          status: 'completed',
          vendor_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (error) throw error;

      toast({
        title: "Assessment Concluído!",
        description: "Obrigado por completar o assessment. Nossa equipe irá revisar e entrar em contato."
      });

    } catch (error) {
      console.error('Erro ao enviar assessment:', error);
      toast({
        title: "Erro ao Enviar",
        description: "Não foi possível finalizar o assessment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Validate required fields in current section
  const validateCurrentSection = () => {
    if (!sections[currentSection]) return true;

    const currentQuestions = sections[currentSection].questions;
    const requiredQuestions = currentQuestions.filter(q => q.required);
    
    for (const question of requiredQuestions) {
      if (!responses[question.id] || responses[question.id] === '') {
        toast({
          title: "Campos Obrigatórios",
          description: "Preencha todos os campos obrigatórios antes de continuar",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  // Next section
  const nextSection = async () => {
    if (!validateCurrentSection()) return;

    await saveResponses();
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  // Previous section
  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Render question input
  const renderQuestionInput = (question: Question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'yes_no':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => setResponses(prev => ({ ...prev, [question.id]: val }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}_yes`} />
              <Label htmlFor={`${question.id}_yes`}>Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}_no`} />
              <Label htmlFor={`${question.id}_no`}>Não</Label>
            </div>
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <Select value={value} onValueChange={(val) => setResponses(prev => ({ ...prev, [question.id]: val }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder="Digite sua resposta..."
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder="0"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <Button
                key={rating}
                variant={value === rating.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setResponses(prev => ({ ...prev, [question.id]: rating.toString() }))}
              >
                <Star className={`h-4 w-4 ${value === rating.toString() ? 'text-white' : 'text-yellow-500'}`} />
                {rating}
              </Button>
            ))}
          </div>
        );

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Clique para fazer upload ou arraste arquivos aqui</p>
            <Input
              type="file"
              onChange={(e) => {
                // Handle file upload logic here
                console.log('File selected:', e.target.files?.[0]);
              }}
              className="mt-2"
            />
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder="Digite sua resposta..."
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Carregando assessment...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (isExpired || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-900">
              {isExpired ? 'Link Expirado' : 'Assessment Não Encontrado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-700 mb-4">
              {isExpired 
                ? 'Este link de assessment expirou. Entre em contato conosco para solicitar um novo link.'
                : 'O link pode ser inválido ou ter sido removido.'
              }
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();
  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {assessment.assessment_name}
                </h1>
                <p className="text-sm text-gray-600">
                  {assessment.vendor_registry.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{progress}% Concluído</div>
                <div className="text-xs text-gray-500">
                  Prazo: {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <Progress value={progress} className="w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seções do Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, index) => {
                  const sectionProgress = section.questions.filter(q => 
                    responses[q.id] !== undefined && responses[q.id] !== ''
                  ).length;
                  const sectionTotal = section.questions.length;
                  const isCompleted = sectionProgress === sectionTotal;

                  return (
                    <div
                      key={section.category}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentSection
                          ? 'bg-blue-100 border-blue-200 border'
                          : isCompleted
                          ? 'bg-green-50 border-green-200 border'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentSection(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="font-medium capitalize">
                            {section.category.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {sectionProgress}/{sectionTotal}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* ALEX VENDOR Help */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  ALEX VENDOR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Precisa de ajuda? Nosso assistente de IA está aqui para ajudá-lo!
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowAlexHelp(true)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Obter Ajuda
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Questions */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl capitalize">
                    {currentSectionData?.category.replace('_', ' ')}
                  </CardTitle>
                  <Badge variant="outline">
                    Seção {currentSection + 1} de {sections.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {currentSectionData?.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Label className="text-base font-medium text-gray-900">
                          {index + 1}. {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {question.help_text && (
                          <p className="text-sm text-gray-500 mt-1">{question.help_text}</p>
                        )}
                      </div>
                      {question.weight && (
                        <Badge variant="secondary" className="ml-2">
                          Peso: {question.weight}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {renderQuestionInput(question)}
                    </div>
                    
                    <Separator />
                  </div>
                ))}

                {/* Auto-save indicator */}
                {saving && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Salvando automaticamente...</span>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={previousSection}
                    disabled={currentSection === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="text-sm text-gray-500">
                    {currentSection + 1} de {sections.length} seções
                  </div>

                  {currentSection < sections.length - 1 ? (
                    <Button onClick={nextSection}>
                      Próxima
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={submitAssessment}
                      disabled={submitting || progress < 100}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Finalizar Assessment
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};