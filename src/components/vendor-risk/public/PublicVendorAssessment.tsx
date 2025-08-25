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

      // Security check - verify status is appropriate for public access
      if (!['sent', 'in_progress'].includes(data.status)) {
        toast({
          title: "Assessment Não Disponível",
          description: "Este assessment não está disponível para resposta pública.",
          variant: "destructive"
        });
        return;
      }

      // Additional security - log access attempt for audit
      console.log('Public assessment accessed:', {
        assessmentId: data.id,
        vendorId: data.vendor_id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'client-side' // Server would have real IP
      });

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

  // Save responses automatically
  const saveResponses = async () => {
    if (!assessment) return;

    try {
      setSaving(true);

      const progress = calculateProgress();
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          responses,
          progress_percentage: progress,
          updated_at: now,
          // Update status based on progress
          status: progress === 100 ? 'ready_for_review' : 'in_progress'
        })
        .eq('id', assessment.id);

      if (error) throw error;

      // Update local assessment object
      setAssessment(prev => prev ? {
        ...prev,
        responses,
        progress_percentage: progress,
        updated_at: now
      } : null);

      toast({
        title: "✅ Respostas Salvas",
        description: `Progresso: ${progress}% • Salvo automaticamente`
      });

    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save when responses change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      const saveTimeout = setTimeout(() => {
        saveResponses();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimeout);
    }
  }, [responses]);

  // Submit assessment with confirmation
  const submitAssessment = async () => {
    if (!assessment) return;

    // Final validation of all sections
    const allQuestions = assessment.vendor_assessment_frameworks?.questions || [];
    const requiredQuestions = allQuestions.filter(q => q.required);
    const unansweredRequired = requiredQuestions.filter(q => 
      !responses[q.id] || responses[q.id] === ''
    );

    if (unansweredRequired.length > 0) {
      toast({
        title: "❌ Assessment Incompleto",
        description: `${unansweredRequired.length} pergunta(s) obrigatória(s) ainda não foram respondidas`,
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Tem certeza que deseja finalizar e enviar o assessment?\n\n` +
      `✅ ${allQuestions.length} questões no total\n` +
      `✅ ${Object.keys(responses).length} respostas preenchidas\n` +
      `✅ 100% concluído\n\n` +
      `Após o envio, você não poderá mais editar as respostas.`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      // Generate submission summary
      const submissionSummary = {
        submitted_at: new Date().toISOString(),
        total_questions: allQuestions.length,
        answered_questions: Object.keys(responses).length,
        completion_percentage: 100,
        vendor_contact: assessment.vendor_registry?.primary_contact_name,
        vendor_name: assessment.vendor_registry?.name
      };

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          responses,
          progress_percentage: 100,
          status: 'completed',
          vendor_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          submission_summary: submissionSummary
        })
        .eq('id', assessment.id);

      if (error) throw error;

      // Update local state to show completion
      setAssessment(prev => prev ? {
        ...prev,
        status: 'completed',
        vendor_submitted_at: new Date().toISOString(),
        progress_percentage: 100
      } : null);

      toast({
        title: "🎉 Assessment Concluído com Sucesso!",
        description: "Obrigado por completar o assessment. Nossa equipe irá revisar e entrar em contato em breve.",
        duration: 6000
      });

    } catch (error) {
      console.error('Erro ao enviar assessment:', error);
      toast({
        title: "❌ Erro ao Enviar",
        description: "Não foi possível finalizar o assessment. Tente novamente.",
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
    const missingQuestions: string[] = [];
    
    for (const question of requiredQuestions) {
      const response = responses[question.id];
      if (!response || response === '' || (typeof response === 'string' && response.trim() === '')) {
        missingQuestions.push(question.question);
      }
    }

    if (missingQuestions.length > 0) {
      toast({
        title: "⚠️ Campos Obrigatórios Não Preenchidos",
        description: `${missingQuestions.length} campo(s) obrigatório(s) pendente(s)`,
        variant: "destructive"
      });
      
      // Scroll to first missing question
      const firstMissingId = requiredQuestions.find(q => 
        !responses[q.id] || responses[q.id] === ''
      )?.id;
      
      if (firstMissingId) {
        const element = document.getElementById(`question-${firstMissingId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return false;
    }

    return true;
  };

  // Check if a question is answered
  const isQuestionAnswered = (questionId: string) => {
    const response = responses[questionId];
    return response !== undefined && response !== '' && response !== null;
  };

  // Get validation status for a question
  const getQuestionValidationStatus = (question: Question) => {
    const answered = isQuestionAnswered(question.id);
    
    if (question.required) {
      return answered ? 'completed' : 'required';
    }
    
    return answered ? 'completed' : 'optional';
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
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Clique para fazer upload ou arraste arquivos aqui</p>
              <p className="text-xs text-gray-500">Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast({
                        title: "Arquivo muito grande",
                        description: "O arquivo deve ter no máximo 10MB",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    // Simulate file upload and store file info
                    const fileInfo = {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      uploadedAt: new Date().toISOString(),
                      url: URL.createObjectURL(file) // For preview, in real scenario would be uploaded URL
                    };
                    
                    setResponses(prev => ({ 
                      ...prev, 
                      [question.id]: JSON.stringify(fileInfo)
                    }));
                    
                    toast({
                      title: "Arquivo anexado",
                      description: `${file.name} foi anexado com sucesso`
                    });
                  }
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                className="mt-3"
              />
            </div>
            
            {/* Show uploaded file info */}
            {value && (() => {
              try {
                const fileInfo = JSON.parse(value);
                return (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{fileInfo.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileInfo.size / 1024).toFixed(1)} KB • {new Date(fileInfo.uploadedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResponses(prev => ({ ...prev, [question.id]: '' }))}
                    >
                      Remover
                    </Button>
                  </div>
                );
              } catch {
                return null;
              }
            })()}
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

  // Show success page if assessment is completed
  if (assessment?.status === 'completed' && assessment?.vendor_submitted_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900 mb-2">
              🎉 Assessment Concluído com Sucesso!
            </CardTitle>
            <p className="text-green-700">
              Obrigado por completar o assessment de segurança. Suas respostas foram enviadas com sucesso.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {assessment.vendor_assessment_frameworks?.questions?.length || 0}
                </div>
                <div className="text-sm text-green-700">Questões Respondidas</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-blue-700">Concluído</div>
              </div>
            </div>

            {/* Submission Info */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Enviado em: {new Date(assessment.vendor_submitted_at).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Nossa equipe irá revisar suas respostas e entrará em contato em breve.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Informações de Contato</p>
                  <p className="text-sm text-blue-700">
                    Fornecedor: <strong>{assessment.vendor_registry?.name}</strong>
                  </p>
                  {assessment.vendor_registry?.primary_contact_name && (
                    <p className="text-sm text-blue-700">
                      Contato: <strong>{assessment.vendor_registry.primary_contact_name}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Imprimir Comprovante
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:suporte@empresa.com?subject=Dúvida sobre Assessment'}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Entrar em Contato
              </Button>
            </div>

            {/* Footer Info */}
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>Você receberá uma confirmação por e-mail e atualizações sobre o status da revisão.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {currentSectionData?.questions.map((question, index) => {
                  const validationStatus = getQuestionValidationStatus(question);
                  
                  return (
                    <div 
                      key={question.id} 
                      id={`question-${question.id}`}
                      className={`space-y-3 p-4 rounded-lg border transition-colors ${
                        validationStatus === 'completed' ? 'border-green-200 bg-green-50/30' :
                        validationStatus === 'required' ? 'border-red-200 bg-red-50/30' :
                        'border-gray-200 bg-gray-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {/* Status indicator */}
                          <div className="flex-shrink-0 mt-1">
                            {validationStatus === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : validationStatus === 'required' ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-base font-medium text-gray-900">
                              {index + 1}. {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {question.help_text && (
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <Info className="h-4 w-4" />
                                {question.help_text}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-2">
                          {question.weight && (
                            <Badge variant="secondary" className="text-xs">
                              Peso: {question.weight}
                            </Badge>
                          )}
                          {validationStatus === 'completed' && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              ✓ Respondida
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-8">
                        {renderQuestionInput(question)}
                      </div>
                    </div>
                  );
                })}

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