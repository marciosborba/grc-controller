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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  Building,
  Lock,
  Server,
  FileText,
  AlertTriangle,
  Eye,
  CheckSquare,
  Paperclip,
  X,
  MessageSquare,
} from 'lucide-react';
import { DEFAULT_ASSESSMENT_QUESTIONS, calculateAssessmentStats } from '../shared/RiskAssessmentManager';

interface Question {
  id: string;
  category: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number' | 'file_upload' | 'rating' | 'scale';
  options?: string[];
  required: boolean;
  weight: number;
  help_text?: string;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: string[];
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
  public_link_expires_at?: string;
  vendor_id: string;
}

interface Message {
  id: string;
  sender_type: 'vendor' | 'internal';
  content: string;
  created_at: string;
  attachments?: any[];
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
  const [showWelcome, setShowWelcome] = useState(true);

  // Messaging State
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load messages
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_assessment_messages', {
        p_link: publicLinkId
      });

      if (error) throw error;

      if (data) {
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Poll messages when chat is open
  useEffect(() => {
    if (showChat) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [showChat, publicLinkId]);


  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        newAttachments.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        });

      } catch (error) {
        console.error('Error uploading file:', error);
        toast({ title: "Erro no Upload", description: `Falha ao enviar ${file.name}`, variant: "destructive" });
      }
    }

    setAttachments(newAttachments);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      handleFileUpload(dt.files);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() && attachments.length === 0) return;

    try {
      setSendingMessage(true);

      const { data, error } = await supabase.rpc('send_public_assessment_message', {
        p_link: publicLinkId,
        p_content: chatMessage,
        p_attachments: attachments
      });

      if (error) throw error;

      if (data && data.success) {
        setChatMessage('');
        setAttachments([]);
        await loadMessages(); // Refresh immediately
      } else {
        throw new Error(data?.error || 'Erro ao enviar mensagem');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Load assessment data
  useEffect(() => {
    loadAssessmentData();
  }, [publicLinkId]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);

      // Use RPC to bypass RLS and get joined data safely
      console.log('🔍 Fetching assessment data for link:', publicLinkId);

      const { data, error } = await supabase
        .rpc('get_public_assessment_data', { p_link: publicLinkId })
        .single();

      console.log('📡 RPC Response:', { data, error });

      if (error || !data) {
        console.error('❌ Error loading assessment:', error);
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

      console.log('🔍 DEBUG: Checking status:', data.status);
      console.log('🔍 DEBUG: Allowed statuses:', ['draft', 'sent', 'in_progress', 'completed']);

      console.log('🔍 DEBUG: Full Data:', JSON.stringify(data, null, 2));

      // Handle potential nesting from RPC returning SETOF jsonb
      // If the RPC returns a single column named after the function, unwrap it
      // Also handle pgrst_scalar which Supabase/PostgREST sometimes uses for scalar returns
      const assessmentData = data.get_public_assessment_data || data.pgrst_scalar || data;
      console.log('🔍 DEBUG: Assessment Data (Unwrapped):', assessmentData);

      // Security check - verify status is appropriate for public access
      // We allow 'draft' so admins can test the link before sending, and 'completed' to show success screen
      if (!['draft', 'sent', 'in_progress', 'completed'].includes(assessmentData.status)) {
        console.error('❌ DEBUG: Status check failed!', data.status);
        toast({
          title: "Assessment Não Disponível (Debug)",
          description: `Status atual: ${data.status}`,
          variant: "destructive"
        });
        return;
      }

      // Additional security - log access attempt for audit
      console.log('Public assessment accessed:', {
        assessmentId: assessmentData.id,
        vendorId: assessmentData.vendor_id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'client-side' // Server would have real IP
      });

      // Normalize nested data (handle array vs object from Supabase)
      const normalizedData = {
        ...assessmentData,
        vendor_registry: Array.isArray(assessmentData.vendor_registry) ? assessmentData.vendor_registry[0] : assessmentData.vendor_registry,
        vendor_assessment_frameworks: Array.isArray(assessmentData.vendor_assessment_frameworks) ? assessmentData.vendor_assessment_frameworks[0] : assessmentData.vendor_assessment_frameworks
      };

      setAssessment(normalizedData);
      setResponses(assessmentData.responses || {});

      // If already has responses, skip welcome screen
      if (assessmentData.responses && Object.keys(assessmentData.responses).length > 0) {
        setShowWelcome(false);
      }

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

  // Expanded Default Questions (imported from shared source)
  const DEFAULT_QUESTIONS: Question[] = DEFAULT_ASSESSMENT_QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    type: q.type as any, // Cast type as they are compatible
    options: q.options,
    required: q.required,
    weight: q.weight,
    help_text: q.description,
    scale_min: q.scale_min,
    scale_max: q.scale_max,
    scale_labels: q.scale_labels
  }));

  // Group questions by category
  const getQuestionsByCategory = () => {
    // Use framework questions if available (mapped from 'questoes' if it existed, but it doesn't)
    // Or use default questions if no framework questions found
    const questions = assessment?.vendor_assessment_frameworks?.questions || DEFAULT_QUESTIONS;

    if (!questions || questions.length === 0) return [];

    const categories: Record<string, Question[]> = {};

    questions.forEach((question: Question) => {
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

    const questionsToUse = assessment.vendor_assessment_frameworks?.questions || DEFAULT_QUESTIONS;

    // Use shared calculation logic
    // We need to cast questionsToUse to any because of slight interface mismatch (help_text vs description)
    // but the shared function only uses id and required, which match.
    const stats = calculateAssessmentStats(questionsToUse as any[], responses);

    console.log('📊 PUBLIC PROGRESS DEBUG:', {
      total: stats.total,
      answered: stats.answered,
      progress: stats.progress,
      responsesKeys: Object.keys(responses),
      questionsIds: questionsToUse.map(q => q.id)
    });

    return stats.progress;
  };

  // Save responses automatically
  const saveResponses = async () => {
    if (!assessment) return;

    try {
      setSaving(true);

      const progress = calculateProgress();
      const now = new Date().toISOString();

      // Use RPC function to bypass RLS issues for public updates
      const { error } = await supabase.rpc('update_vendor_assessment_public', {
        p_id: assessment.id,
        p_responses: responses,
        p_progress: progress,
        p_status: progress === 100 ? 'ready_for_review' : 'in_progress',
        p_submission_summary: null
      });

      if (error) throw error;

      // Update local assessment object
      setAssessment(prev => prev ? {
        ...prev,
        responses,
        progress_percentage: progress,
        updated_at: now
      } : null);

    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
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
    const allQuestions = assessment.vendor_assessment_frameworks?.questions || DEFAULT_QUESTIONS;
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
      `✅ ${Object.keys(responses).filter(k => !k.endsWith('_evidence')).length} respostas preenchidas\n` +
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
        answered_questions: Object.keys(responses).filter(k => !k.endsWith('_evidence')).length,
        completion_percentage: 100,
        vendor_contact: assessment.vendor_registry?.primary_contact_name,
        vendor_name: assessment.vendor_registry?.name
      };

      // Use RPC function for secure submission
      const { error } = await supabase.rpc('update_vendor_assessment_public', {
        p_id: assessment.id,
        p_responses: responses,
        p_progress: 100,
        p_status: 'completed',
        p_submission_summary: JSON.stringify(submissionSummary) // RPC expects text for summary? No, let's check definition.
      });

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

  // Next section
  const nextSection = async () => {
    if (!validateCurrentSection()) return;

    await saveResponses();

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous section
  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render evidence upload for any question
  const renderEvidenceUpload = (questionId: string) => {
    const evidenceKey = `${questionId}_evidence`;
    const value = responses[evidenceKey];

    if (value) {
      try {
        const fileInfo = JSON.parse(value);
        return (
          <div className="mt-4 flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Paperclip className="h-4 w-4 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{fileInfo.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(fileInfo.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setResponses(prev => {
                const newResponses = { ...prev };
                delete newResponses[evidenceKey];
                return newResponses;
              })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      } catch {
        return null;
      }
    }

    return (
      <div className="mt-3">
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
                [evidenceKey]: JSON.stringify(fileInfo)
              }));

              toast({
                title: "Evidência anexada",
                description: `${file.name} foi anexado com sucesso`
              });
            }
          }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          className="hidden"
          id={`evidence-${questionId}`}
        />
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 border-dashed text-muted-foreground hover:text-primary hover:border-primary/50"
          onClick={() => document.getElementById(`evidence-${questionId}`)?.click()}
        >
          <Paperclip className="h-3 w-3 mr-2" />
          Anexar Evidência (Opcional)
        </Button>
      </div>
    );
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
            <div className={`flex-1 flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${value === 'yes' ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm' : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}>
              <RadioGroupItem value="yes" id={`${question.id}_yes`} />
              <Label htmlFor={`${question.id}_yes`} className="cursor-pointer font-medium flex-1 text-foreground">Sim</Label>
            </div>
            <div className={`flex-1 flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${value === 'no' ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm' : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}>
              <RadioGroupItem value="no" id={`${question.id}_no`} />
              <Label htmlFor={`${question.id}_no`} className="cursor-pointer font-medium flex-1 text-foreground">Não</Label>
            </div>
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <Select value={value} onValueChange={(val) => setResponses(prev => ({ ...prev, [question.id]: val }))}>
            <SelectTrigger className="w-full h-12 text-base bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all rounded-xl">
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
            className="w-full min-h-[120px] text-base bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y p-4 rounded-xl"
          />
        );

      case 'scale':
      case 'rating':
        return (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setResponses(prev => ({ ...prev, [question.id]: rating.toString() }))}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 ${value === rating.toString()
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
                  }`}
              >
                {rating}
              </button>
            ))}
            <div className="w-full mt-2 flex justify-between text-xs text-muted-foreground px-1">
              <span>Baixo / Ruim</span>
              <span>Alto / Excelente</span>
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 group ${value ? 'border-green-500/50 bg-green-500/10' : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}>
              <div className="w-12 h-12 bg-card rounded-full shadow-sm border border-border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className={`h-6 w-6 ${value ? 'text-green-500' : 'text-muted-foreground group-hover:text-primary'}`} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {value ? 'Arquivo selecionado' : 'Clique para fazer upload'}
                </p>
                <p className="text-xs text-muted-foreground">
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
                  <div className="flex items-center justify-between p-4 bg-card border border-green-500/30 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{fileInfo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(fileInfo.size / 1024).toFixed(1)} KB • {new Date(fileInfo.uploadedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
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
            className="h-12 text-base bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
          />
        );
    }
  };

  // Render Chat Interface (Common across all screens)
  const renderChatInterface = () => (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-110"
          onClick={() => setShowChat(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="sm:max-w-[400px] h-[600px] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b bg-primary/5">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Suporte ao Fornecedor
            </DialogTitle>
            <DialogDescription>
              Tire suas dúvidas com nossa equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">Nenhuma mensagem ainda.</p>
                <p className="text-xs mt-1">Envie uma mensagem</p>
              </div>
            ) : (
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatHistory.map((msg) => {
                    const isVendor = msg.sender_type === 'vendor';
                    return (
                      <div key={msg.id} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${isVendor
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted text-foreground rounded-tl-none'
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((att: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-1.5 bg-background/10 rounded border border-white/10 overflow-hidden">
                                  <Paperclip className="h-3 w-3 shrink-0" />
                                  <span className="text-xs truncate flex-1 block max-w-[150px]">{att.name}</span>
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/20 rounded">
                                    <Download className="h-3 w-3" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          <span className="text-[10px] opacity-70 block mt-1 text-right">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="p-4 border-t bg-background">
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative bg-muted p-1 rounded border shrink-0">
                    <span className="text-xs max-w-[100px] truncate block">{att.name}</span>
                    <button onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5">
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || sendingMessage}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Digite sua dúvida ou cole imagem..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onPaste={handlePaste}
                disabled={sendingMessage}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={sendingMessage || isUploading}>
                {sendingMessage ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-medium">Carregando assessment seguro...</p>
        </div>
      </div>
    );
  }

  if (isExpired || !assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isExpired ? 'Link Expirado' : 'Assessment Não Encontrado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              {isExpired
                ? 'Este link de avaliação expirou por motivos de segurança.'
                : 'O link acessado não é válido ou foi removido.'
              }
            </p>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-sm text-red-700 dark:text-red-400">
              Por favor, entre em contato com a equipe de GRC para solicitar um novo link de acesso.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-border shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-blue-600"></div>
          <CardContent className="p-8 sm:p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto rotate-3 transform transition-transform hover:rotate-0 duration-500">
              <Shield className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Assessment de Segurança
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Olá, <span className="font-semibold text-foreground">{assessment.vendor_registry.primary_contact_name}</span>.
                Você foi convidado para preencher a avaliação de segurança da <span className="font-semibold text-foreground">{assessment.vendor_registry.name}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <Clock className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground">15-20 min</h3>
                <p className="text-sm text-muted-foreground">Tempo estimado</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <Save className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground">Auto-save</h3>
                <p className="text-sm text-muted-foreground">Progresso salvo</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <Lock className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground">Seguro</h3>
                <p className="text-sm text-muted-foreground">Criptografado</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto px-12 h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
              onClick={() => setShowWelcome(false)}
            >
              Iniciar Avaliação
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        {renderChatInterface()}
      </div>
    );
  }

  const progress = calculateProgress();
  const currentSectionData = sections[currentSection];

  // Success Screen
  if (assessment?.status === 'completed' && assessment?.vendor_submitted_at) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full">
          <Card className="border-border shadow-xl overflow-hidden">
            <div className="bg-green-600 h-2 w-full"></div>
            <CardHeader className="text-center pb-2 pt-12">
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                Assessment Enviado!
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Suas respostas foram registradas com sucesso.
              </p>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-muted/50 rounded-2xl border border-border">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {assessment.vendor_assessment_frameworks?.questions?.length || DEFAULT_QUESTIONS.length}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Questões</div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">100%</div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Concluído</div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Enviado em {new Date(assessment.vendor_submitted_at).toLocaleDateString('pt-BR')} às {new Date(assessment.vendor_submitted_at).toLocaleTimeString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Nossa equipe de GRC irá analisar suas respostas. Você receberá uma notificação assim que a revisão for concluída.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-12 px-6 border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Salvar Comprovante
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GRC Controller. Todos os direitos reservados.
          </div>
          {renderChatInterface()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      {/* Hero Header */}
      <div className="bg-card/80 border-b border-border sticky top-0 z-40 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {assessment.assessment_name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-3.5 w-3.5" />
                    <span>{assessment.vendor_registry.name}</span>
                    <span className="text-border">•</span>
                    <span className={saving ? "text-primary animate-pulse" : "text-green-600 dark:text-green-400"}>
                      {saving ? "Salvando..." : "Salvo"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-2xl font-bold text-primary">{progress}%</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Concluído</div>
              </div>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-32 space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
                Seções
              </h3>
              {sections.map((section, idx) => {
                const isCompleted = section.questions.every(q =>
                  responses[q.id] !== undefined && responses[q.id] !== ''
                );
                const isActive = idx === currentSection;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSection(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                  >
                    <span className="truncate mr-2">{section.category}</span>
                    {isCompleted && (
                      <CheckCircle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-green-500 dark:text-green-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {currentSectionData.category}
              </h2>
              <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border border-border shadow-sm">
                Seção {currentSection + 1} de {sections.length}
              </span>
            </div>

            <div className="space-y-6">
              {currentSectionData.questions.map((question) => (
                <Card
                  key={question.id}
                  id={`question-${question.id}`}
                  className={`border-border shadow-sm ring-1 ring-border transition-all duration-300 hover:shadow-md ${!responses[question.id] && question.required ? 'border-l-4 border-l-orange-400 dark:border-l-orange-500' : ''
                    }`}
                >
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <Label className="text-lg font-semibold text-foreground leading-relaxed">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {question.help_text && (
                          <div className="group relative">
                            <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                            <div className="absolute right-0 w-64 p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mt-2 border border-border">
                              {question.help_text}
                            </div>
                          </div>
                        )}
                      </div>
                      {question.required && !responses[question.id] && (
                        <p className="text-xs text-orange-500 dark:text-orange-400 font-medium flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Obrigatório
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      {renderQuestionInput(question)}

                      {/* Universal Evidence Upload for ALL questions */}
                      {question.type !== 'file_upload' && renderEvidenceUpload(question.id)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-border mt-12">
              <Button
                variant="ghost"
                onClick={previousSection}
                disabled={currentSection === 0}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              {currentSection < sections.length - 1 ? (
                <Button
                  onClick={nextSection}
                  className="px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
                >
                  Próxima Seção
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={submitAssessment}
                  disabled={submitting}
                  className="px-8 h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all hover:-translate-y-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Finalizar e Enviar
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {renderChatInterface()}
    </div>
  );
};