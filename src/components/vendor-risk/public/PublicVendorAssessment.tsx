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
  status: string;
  vendor_submitted_at?: string;
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
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all duration-200 ${value === 'yes' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              <RadioGroupItem value="yes" id={`${question.id}_yes`} />
              <Label htmlFor={`${question.id}_yes`} className="cursor-pointer font-medium">Sim</Label>
            </div>
            <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all duration-200 ${value === 'no' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              <RadioGroupItem value="no" id={`${question.id}_no`} />
              <Label htmlFor={`${question.id}_no`} className="cursor-pointer font-medium">Não</Label>
            </div>
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <Select value={value} onValueChange={(val) => setResponses(prev => ({ ...prev, [question.id]: val }))}>
            <SelectTrigger className="w-full h-12 text-base bg-white border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option} value={option} className="py-3 cursor-pointer">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder="Digite sua resposta detalhada aqui..."
            rows={4}
            className="w-full min-h-[120px] text-base bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y p-4"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder="0"
            className="h-12 text-base bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all max-w-[200px]"
          />
        );

      case 'rating':
        return (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setResponses(prev => ({ ...prev, [question.id]: rating.toString() }))}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 ${value === rating.toString()
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5'
                  }`}
              >
                {rating}
              </button>
            ))}
            <div className="w-full mt-2 flex justify-between text-xs text-gray-400 px-1">
              <span>Baixo</span>
              <span>Alto</span>
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 group ${value ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}>
              <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className={`h-6 w-6 ${value ? 'text-green-500' : 'text-gray-400 group-hover:text-primary'}`} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {value ? 'Arquivo selecionado' : 'Clique para fazer upload'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                </p>
              </div>

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

                    const fileInfo = {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      uploadedAt: new Date().toISOString(),
                      url: URL.createObjectURL(file)
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
                className="hidden"
                id={`file-${question.id}`}
              />

              {!value && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => document.getElementById(`file-${question.id}`)?.click()}
                >
                  Selecionar Arquivo
                </Button>
              )}
            </div>

            {/* Show uploaded file info */}
            {value && (() => {
              try {
                const fileInfo = JSON.parse(value);
                return (
                  <div className="flex items-center justify-between p-4 bg-white border border-green-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fileInfo.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileInfo.size / 1024).toFixed(1)} KB • {new Date(fileInfo.uploadedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
            className="h-12 text-base bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-green-600 h-2 w-full"></div>
            <CardHeader className="text-center pb-2 pt-12">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                Assessment Enviado!
              </CardTitle>
              <p className="text-gray-500 text-lg">
                Suas respostas foram registradas com sucesso.
              </p>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {assessment.vendor_assessment_frameworks?.questions?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Questões</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-sm font-medium text-green-600 uppercase tracking-wide">Concluído</div>
                </div>
              </div>

              {/* Submission Info */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Enviado em {new Date(assessment.vendor_submitted_at).toLocaleDateString('pt-BR')} às {new Date(assessment.vendor_submitted_at).toLocaleTimeString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Nossa equipe de GRC irá analisar suas respostas. Você receberá uma notificação assim que a revisão for concluída.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-12 px-6 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Salvar Comprovante
                </Button>
                <Button
                  onClick={() => window.location.href = 'mailto:suporte@empresa.com?subject=Dúvida sobre Assessment'}
                  className="h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20"
                >
                  <User className="h-4 w-4 mr-2" />
                  Falar com Suporte
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GRC Controller. Todos os direitos reservados.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {assessment.assessment_name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building className="h-3.5 w-3.5" />
                    <span>{assessment.vendor_registry.name}</span>
                    <span className="text-gray-300">•</span>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Prazo: {new Date(assessment.due_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{progress}% Concluído</div>
                  <div className="text-xs text-gray-500">
                    {Object.keys(responses).length} de {assessment.vendor_assessment_frameworks?.questions?.length || 0} questões
                  </div>
                </div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar (visible only on small screens) */}
        <div className="md:hidden h-1 bg-gray-100 w-full">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Seções</h2>
                </div>
                <div className="p-2">
                  {sections.map((section, index) => {
                    const sectionProgress = section.questions.filter(q =>
                      responses[q.id] !== undefined && responses[q.id] !== ''
                    ).length;
                    const sectionTotal = section.questions.length;
                    const isCompleted = sectionProgress === sectionTotal;
                    const isActive = index === currentSection;

                    return (
                      <button
                        key={section.category}
                        onClick={() => setCurrentSection(index)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${isActive
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-primary' : 'bg-gray-300'
                            }`} />
                          <span className="capitalize truncate max-w-[120px]">
                            {section.category.replace('_', ' ')}
                          </span>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ALEX VENDOR Help */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-white/90" />
                  <h3 className="font-semibold">Alex Vendor AI</h3>
                </div>
                <p className="text-sm text-white/80 mb-4 leading-relaxed">
                  Dúvidas no preenchimento? Posso ajudar a esclarecer as perguntas.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                  onClick={() => setShowAlexHelp(true)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Pedir Ajuda
                </Button>
              </div>
            </div>
          </div>

          {/* Main Questions Area */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {currentSectionData?.category.replace('_', ' ')}
                </h2>
                <p className="text-gray-500 mt-1">
                  Responda as perguntas abaixo com atenção.
                </p>
              </div>
              <Badge variant="outline" className="bg-white">
                Seção {currentSection + 1} de {sections.length}
              </Badge>
            </div>

            <div className="space-y-6">
              {currentSectionData?.questions.map((question, index) => {
                const validationStatus = getQuestionValidationStatus(question);
                const isAnswered = validationStatus === 'completed';

                return (
                  <Card
                    key={question.id}
                    id={`question-${question.id}`}
                    className={`border transition-all duration-300 ${isAnswered ? 'border-green-200 shadow-sm' : 'border-gray-200 hover:border-primary/30 hover:shadow-md'
                      }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {index + 1}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <Label className="text-base font-semibold text-gray-900 leading-relaxed block">
                                {question.question}
                                {question.required && <span className="text-red-500 ml-1" title="Obrigatório">*</span>}
                              </Label>
                              {question.weight && (
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium text-gray-500 bg-gray-100">
                                  Peso {question.weight}
                                </Badge>
                              )}
                            </div>

                            {question.help_text && (
                              <div className="mt-2 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{question.help_text}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            {renderQuestionInput(question)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Auto-save indicator */}
            {saving && (
              <div className="fixed bottom-8 right-8 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm font-medium text-gray-600">Salvando...</span>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={previousSection}
                disabled={currentSection === 0}
                className="text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentSection < sections.length - 1 ? (
                <Button onClick={nextSection} className="px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  Próxima Seção
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitAssessment}
                  disabled={submitting || progress < 100}
                  className="px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-105"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
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
          </div>
        </div>
      </div>
    </div>
  );
};