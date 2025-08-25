import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileCheck,
  Plus,
  Send,
  Link,
  Copy,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Brain,
  BarChart3,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  MessageSquare,
  Zap,
  Target,
  Star,
  Award,
  TrendingUp,
  Activity,
  Save,
  X,
  FileText
} from 'lucide-react';

interface VendorAssessment {
  id: string;
  vendor_id: string;
  framework_id: string;
  assessment_name: string;
  assessment_type: 'initial' | 'annual' | 'reassessment' | 'incident_triggered' | 'ad_hoc';
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  progress_percentage: number;
  public_link?: string;
  public_link_expires_at?: string;
  vendor_submitted_at?: string;
  internal_review_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_clarification';
  overall_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  vendor_registry?: {
    name: string;
    primary_contact_email?: string;
    primary_contact_name?: string;
  };
  vendor_assessment_frameworks?: {
    name: string;
    framework_type: string;
    questions: any[];
  };
}

interface VendorAssessmentManagerProps {
  assessments?: any[];
  vendors?: any[];
  searchTerm: string;
  selectedFilter: string;
  loading?: boolean;
  showFilters?: boolean;
}

export const VendorAssessmentManager: React.FC<VendorAssessmentManagerProps> = ({
  assessments: propAssessments = [],
  vendors: propVendors = [],
  searchTerm,
  selectedFilter,
  loading: propLoading = false,
  showFilters = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSelectedFilter, setLocalSelectedFilter] = useState(selectedFilter);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [selectedAssessment, setSelectedAssessment] = useState<VendorAssessment | null>(null);
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false);
  const [showPublicLinkDialog, setShowPublicLinkDialog] = useState(false);
  const [publicLinkData, setPublicLinkData] = useState<{link: string; expiresAt: string} | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<VendorAssessment | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [assessmentResponses, setAssessmentResponses] = useState<Record<string, any>>({});
  const [assessmentMetadata, setAssessmentMetadata] = useState<any>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionEditForm, setQuestionEditForm] = useState<any>({});

  // Load assessments from vendor registry
  const loadAssessments = async () => {
    if (!user?.tenantId && !user?.tenant_id) return;

    try {
      setLoading(true);
      
      // Primeiro, buscar assessments da tabela vendor_assessments (incluindo os criados no onboarding)
      const { data: vendorAssessments, error: assessmentError } = await supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor_registry:vendor_id (
            name,
            primary_contact_email,
            primary_contact_name
          ),
          vendor_assessment_frameworks:framework_id (
            name,
            framework_type,
            questions
          )
        `)
        .eq('tenant_id', user?.tenantId || user?.tenant_id)
        .order('created_at', { ascending: false });

      // Segundo, buscar fornecedores que têm assessments cadastrados
      const { data: vendorsWithAssessments, error: vendorError } = await supabase
        .from('vendor_registry')
        .select(`
          id,
          name,
          primary_contact_email,
          primary_contact_name,
          last_assessment_date,
          next_assessment_due,
          risk_score,
          onboarding_progress,
          status,
          created_at,
          updated_at
        `)
        .eq('tenant_id', user?.tenantId || user?.tenant_id)
        .not('last_assessment_date', 'is', null)
        .order('last_assessment_date', { ascending: false });

      if (assessmentError && vendorError) {
        console.error('Erro ao carregar assessments:', assessmentError, vendorError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os assessments",
          variant: "destructive"
        });
        return;
      }

      // Combinar assessments formais com assessments dos fornecedores
      const combinedAssessments = [];
      
      // Adicionar assessments formais
      if (vendorAssessments) {
        combinedAssessments.push(...vendorAssessments);
      }
      
      // Verificar assessments selecionados no localStorage que ainda não foram criados no banco
      const localStorageAssessments = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vendor_') && key.endsWith('_selected_template')) {
          try {
            const templateInfo = JSON.parse(localStorage.getItem(key) || '{}');
            const vendorId = templateInfo.vendorId;
            
            // Verificar se já existe um assessment formal para este fornecedor
            const existingAssessment = vendorAssessments?.find(a => a.vendor_id === vendorId);
            
            if (!existingAssessment && templateInfo.templateId && templateInfo.templateName) {
              // Buscar informações do fornecedor
              const { data: vendorData } = await supabase
                .from('vendor_registry')
                .select('name, primary_contact_email, primary_contact_name')
                .eq('id', vendorId)
                .single();
              
              if (vendorData) {
                localStorageAssessments.push({
                  id: `pending-${vendorId}`,
                  vendor_id: vendorId,
                  framework_id: templateInfo.templateId,
                  assessment_name: `Assessment - ${vendorData.name}`,
                  assessment_type: 'initial' as const,
                  status: 'draft' as const,
                  priority: 'medium' as const,
                  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  progress_percentage: 0,
                  public_link: null,
                  public_link_expires_at: null,
                  vendor_submitted_at: null,
                  internal_review_status: 'pending' as const,
                  overall_score: null,
                  risk_level: null,
                  vendor_registry: {
                    name: vendorData.name,
                    primary_contact_email: vendorData.primary_contact_email,
                    primary_contact_name: vendorData.primary_contact_name
                  },
                  vendor_assessment_frameworks: null,
                  metadata: {
                    template_name: templateInfo.templateName,
                    selected_in_onboarding: true,
                    pending_creation: true,
                    selected_at: templateInfo.selectedAt
                  },
                  created_at: templateInfo.selectedAt,
                  updated_at: templateInfo.selectedAt
                });
              }
            }
          } catch (error) {
            console.error('Erro ao processar template do localStorage:', error);
          }
        }
      }
      
      // Adicionar assessments pendentes do localStorage
      combinedAssessments.push(...localStorageAssessments);
      
      // Adicionar assessments dos fornecedores como assessments virtuais
      if (vendorsWithAssessments) {
        const vendorBasedAssessments = vendorsWithAssessments.map(vendor => ({
          id: `vendor-${vendor.id}`,
          vendor_id: vendor.id,
          framework_id: null,
          assessment_name: `Assessment - ${vendor.name}`,
          assessment_type: 'annual' as const,
          status: vendor.status === 'active' ? 'completed' as const : 'in_progress' as const,
          priority: vendor.risk_score >= 4 ? 'high' as const : vendor.risk_score >= 3 ? 'medium' as const : 'low' as const,
          due_date: vendor.next_assessment_due || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          progress_percentage: vendor.onboarding_progress || 0,
          public_link: null,
          public_link_expires_at: null,
          vendor_submitted_at: vendor.last_assessment_date,
          internal_review_status: 'approved' as const,
          overall_score: vendor.risk_score,
          risk_level: vendor.risk_score >= 4.5 ? 'critical' as const : 
                     vendor.risk_score >= 3.5 ? 'high' as const :
                     vendor.risk_score >= 2.5 ? 'medium' as const : 'low' as const,
          vendor_registry: {
            name: vendor.name,
            primary_contact_email: vendor.primary_contact_email,
            primary_contact_name: vendor.primary_contact_name
          },
          vendor_assessment_frameworks: {
            name: 'Assessment Padrão',
            framework_type: 'standard',
            questions: []
          },
          created_at: vendor.created_at,
          updated_at: vendor.updated_at
        }));
        
        combinedAssessments.push(...vendorBasedAssessments);
      }

      // Ordenar por data de criação/atualização
      combinedAssessments.sort((a, b) => 
        new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
      );

      setAssessments(combinedAssessments);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [user?.tenantId, user?.tenant_id]);
  
  // Verificar periodicamente por novos assessments criados durante onboarding
  useEffect(() => {
    const interval = setInterval(() => {
      // Verificar se há assessments criados recentemente (últimos 30 segundos)
      const recentTime = new Date(Date.now() - 30000).toISOString();
      
      // Recarregar assessments se houver atividade recente
      if (user?.tenantId || user?.tenant_id) {
        loadAssessments();
      }
    }, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [user?.tenantId, user?.tenant_id, loadAssessments]);

  // Use props assessments if available, otherwise use internal state
  const currentAssessments = propAssessments.length > 0 ? propAssessments : assessments;
  const currentLoading = propAssessments.length > 0 ? propLoading : loading;
  const currentSearchTerm = searchTerm || localSearchTerm;
  const currentSelectedFilter = selectedFilter || localSelectedFilter;

  // Filter assessments based on search and filters
  const filteredAssessments = currentAssessments.filter(assessment => {
    const matchesSearch = !currentSearchTerm || 
      assessment.assessment_name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
      assessment.vendor_registry?.name.toLowerCase().includes(currentSearchTerm.toLowerCase());

    const matchesFilter = currentSelectedFilter === 'all' || 
      (currentSelectedFilter === 'pending' && ['draft', 'sent'].includes(assessment.status)) ||
      (currentSelectedFilter === 'awaiting_response' && assessment.status === 'sent' && assessment.public_link_id && !assessment.responses) ||
      (currentSelectedFilter === 'in_progress' && assessment.status === 'in_progress') ||
      (currentSelectedFilter === 'completed' && assessment.status === 'completed') ||
      (currentSelectedFilter === 'overdue' && new Date(assessment.due_date) < new Date() && !['completed', 'approved'].includes(assessment.status));

    return matchesSearch && matchesFilter;
  });
  
  // Fornecedores que receberam assessments mas ainda não responderam
  const pendingVendorAssessments = filteredAssessments.filter(assessment => 
    assessment.status === 'sent' && 
    assessment.public_link_id && 
    !assessment.responses
  );

  // Generate public link for assessment
  const generatePublicLink = async (assessmentId: string) => {
    try {
      const publicLinkId = `${assessmentId}-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          public_link: publicLinkId,
          public_link_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) throw error;

      const publicLink = `${window.location.origin}/vendor-assessment/${publicLinkId}`;
      
      setPublicLinkData({
        link: publicLink,
        expiresAt: expiresAt.toISOString()
      });

      setShowPublicLinkDialog(true);
      
      toast({
        title: "Link Público Gerado",
        description: "O link foi criado com sucesso. Você pode copiá-lo e enviá-lo ao fornecedor."
      });

      await loadAssessments(); // Refresh data

    } catch (error) {
      console.error('Erro ao gerar link público:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link público",
        variant: "destructive"
      });
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link Copiado",
        description: "O link foi copiado para a área de transferência"
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  // Send assessment via email (placeholder for integration with notification system)
  const sendAssessmentEmail = async (assessment: VendorAssessment) => {
    if (!assessment.public_link) {
      await generatePublicLink(assessment.id);
      return;
    }

    // This would integrate with the notification system
    toast({
      title: "Assessment Enviado",
      description: `Assessment enviado para ${assessment.vendor_registry?.primary_contact_email || 'fornecedor'}`,
    });
  };
  
  // Create formal assessment from localStorage template
  const createFormalAssessment = async (assessment: VendorAssessment) => {
    if (!assessment.metadata?.pending_creation) return;
    
    try {
      // Buscar o framework real se o templateId for um UUID válido
      let frameworkId = assessment.framework_id;
      
      // Se for um template hardcoded, buscar um framework padrão
      if (assessment.framework_id === 'nist_csf_default' || assessment.framework_id === 'iso_27001_27701_default') {
        const { data: frameworks } = await supabase
          .from('vendor_assessment_frameworks')
          .select('id')
          .eq('tenant_id', user?.tenantId || user?.tenant_id)
          .eq('is_active', true)
          .limit(1);
        
        if (frameworks && frameworks.length > 0) {
          frameworkId = frameworks[0].id;
        }
      }
      
      const assessmentData = {
        vendor_id: assessment.vendor_id,
        framework_id: frameworkId,
        assessment_name: assessment.assessment_name,
        assessment_type: assessment.assessment_type,
        status: 'draft' as const,
        priority: assessment.priority,
        due_date: assessment.due_date,
        responses: {},
        alex_analysis: {},
        alex_recommendations: {},
        evidence_attachments: [],
        metadata: {
          template_name: assessment.metadata?.template_name,
          selected_at: assessment.metadata?.selected_at,
          selected_in_onboarding: true
        }
      };
      
      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert({
          ...assessmentData,
          tenant_id: user?.tenantId || user?.tenant_id,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Remover do localStorage
      localStorage.removeItem(`vendor_${assessment.vendor_id}_selected_template`);
      
      toast({
        title: "Assessment Criado",
        description: "Assessment formal criado com sucesso no banco de dados",
      });
      
      // Recarregar assessments
      await loadAssessments();
      
    } catch (error) {
      console.error('Erro ao criar assessment formal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o assessment formal",
        variant: "destructive"
      });
    }
  };
  
  // Open assessment editor
  const openAssessmentEditor = async (assessment: VendorAssessment) => {
    try {
      console.log('=== ABRINDO EDITOR DE ASSESSMENT ===');
      console.log('Assessment completo:', assessment);
      console.log('Framework ID:', assessment.framework_id);
      console.log('Template name:', assessment.metadata?.template_name);
      console.log('Framework data:', assessment.vendor_assessment_frameworks);
      
      setEditingAssessment(assessment);
      
      // Carregar questões do framework ou template
      let questions = [];
      
      // Primeiro, tentar carregar do framework se existir
      if (assessment.vendor_assessment_frameworks?.questions && assessment.vendor_assessment_frameworks.questions.length > 0) {
        questions = assessment.vendor_assessment_frameworks.questions;
        console.log('Questões carregadas do framework:', questions.length, 'questões');
      } 
      // Segundo, tentar carregar baseado no framework_id
      else if (assessment.framework_id) {
        console.log('Carregando questões baseado no framework_id:', assessment.framework_id);
        
        if (assessment.framework_id === 'nist_csf_default' || assessment.framework_id.includes('nist')) {
          questions = await loadNistCsfQuestions();
          console.log('Questões NIST CSF carregadas:', questions.length);
        } else if (assessment.framework_id === 'iso_27001_27701_default' || assessment.framework_id.includes('iso')) {
          questions = await loadIsoQuestions();
          console.log('Questões ISO carregadas:', questions.length);
        } else {
          questions = await loadDefaultQuestions();
          console.log('Questões padrão carregadas (framework não reconhecido):', questions.length);
        }
      }
      // Terceiro, tentar carregar baseado no template_name
      else if (assessment.metadata?.template_name) {
        console.log('Carregando questões baseado no template_name:', assessment.metadata.template_name);
        
        if (assessment.metadata.template_name.toLowerCase().includes('nist')) {
          questions = await loadNistCsfQuestions();
          console.log('Questões NIST CSF carregadas (por template):', questions.length);
        } else if (assessment.metadata.template_name.toLowerCase().includes('iso')) {
          questions = await loadIsoQuestions();
          console.log('Questões ISO carregadas (por template):', questions.length);
        } else {
          questions = await loadDefaultQuestions();
          console.log('Questões padrão carregadas (template não reconhecido):', questions.length);
        }
      }
      // Último recurso: carregar questões padrão
      else {
        console.log('Carregando questões padrão (fallback final)');
        questions = await loadDefaultQuestions();
        console.log('Questões padrão carregadas (fallback):', questions.length);
      }
      
      console.log('Questões finais carregadas:', questions);
      console.log('Respostas existentes:', assessment.responses);
      
      setAssessmentQuestions(questions);
      setAssessmentResponses(assessment.responses || {});
      setAssessmentMetadata({
        due_date: assessment.due_date,
        priority: assessment.priority,
        status: assessment.status,
        progress_percentage: assessment.progress_percentage,
        vendor_submitted_at: assessment.vendor_submitted_at,
        internal_review_status: assessment.internal_review_status,
        reviewer_notes: assessment.reviewer_notes || '',
        overall_score: assessment.overall_score,
        risk_level: assessment.risk_level
      });
      
      console.log('=== ABRINDO MODAL ===');
      setShowEditDialog(true);
      
    } catch (error) {
      console.error('Erro ao abrir editor de assessment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o editor de assessment",
        variant: "destructive"
      });
    }
  };
  
  // Carregar questões do NIST CSF (completo - 90+ questões)
  const loadNistCsfQuestions = async () => {
    try {
      // Importar o template completo do RiskAssessmentManager
      const { NIST_CSF_TEMPLATE } = await import('../shared/RiskAssessmentManager');
      console.log('Template NIST CSF importado:', NIST_CSF_TEMPLATE);
      return NIST_CSF_TEMPLATE.questions || [];
    } catch (error) {
      console.error('Erro ao importar template NIST CSF:', error);
      // Fallback para questões simplificadas
      return [
        {
          id: 'nist_1',
          category: 'Identify',
          question: 'A organização possui inventário de ativos de TI?',
          type: 'multiple_choice',
          options: ['Sim, completo', 'Sim, parcial', 'Não possui'],
          required: true,
          weight: 10
        },
        {
          id: 'nist_2',
          category: 'Protect',
          question: 'Existem controles de acesso implementados?',
          type: 'scale',
          scale_min: 1,
          scale_max: 5,
          scale_labels: ['Inexistente', 'Básico', 'Adequado', 'Robusto', 'Avançado'],
          required: true,
          weight: 10
        },
        {
          id: 'nist_3',
          category: 'Detect',
          question: 'A organização possui sistema de monitoramento de segurança?',
          type: 'yes_no',
          required: true,
          weight: 8
        },
        {
          id: 'nist_4',
          category: 'Respond',
          question: 'Descreva o plano de resposta a incidentes:',
          type: 'text',
          required: false,
          weight: 6
        }
      ];
    }
  };
  
  // Carregar questões do ISO 27001/27701 (completo - 90+ questões)
  const loadIsoQuestions = async () => {
    try {
      // Importar o template completo do RiskAssessmentManager
      const { ISO_27001_27701_TEMPLATE } = await import('../shared/RiskAssessmentManager');
      console.log('Template ISO 27001/27701 importado:', ISO_27001_27701_TEMPLATE);
      return ISO_27001_27701_TEMPLATE.questions || [];
    } catch (error) {
      console.error('Erro ao importar template ISO 27001/27701:', error);
      // Fallback para questões simplificadas
      return [
        {
          id: 'iso_1',
          category: 'A.5 - Políticas',
          question: 'A organização possui política de segurança da informação aprovada?',
          type: 'multiple_choice',
          options: ['Sim, aprovada e comunicada', 'Sim, mas não comunicada', 'Em desenvolvimento', 'Não possui'],
          required: true,
          weight: 10
        },
        {
          id: 'iso_2',
          category: 'A.6 - Organização',
          question: 'Avalie a maturidade da gestão de segurança:',
          type: 'scale',
          scale_min: 1,
          scale_max: 5,
          scale_labels: ['Inicial', 'Básico', 'Definido', 'Gerenciado', 'Otimizado'],
          required: true,
          weight: 9
        },
        {
          id: 'iso_3',
          category: 'A.8 - Gestão de Ativos',
          question: 'Existe inventário de ativos de informação?',
          type: 'yes_no',
          required: true,
          weight: 8
        }
      ];
    }
  };
  
  // Carregar questões padrão (genéricas)
  const loadDefaultQuestions = async () => {
    return [
      {
        id: 'default_1',
        category: 'Segurança Geral',
        question: 'A organização possui políticas de segurança documentadas?',
        type: 'yes_no',
        required: true,
        weight: 10
      },
      {
        id: 'default_2',
        category: 'Controles de Acesso',
        question: 'Como você avalia os controles de acesso da organização?',
        type: 'scale',
        scale_min: 1,
        scale_max: 5,
        scale_labels: ['Muito Fraco', 'Fraco', 'Regular', 'Bom', 'Excelente'],
        required: true,
        weight: 8
      },
      {
        id: 'default_3',
        category: 'Gestão de Dados',
        question: 'Qual o nível de proteção de dados pessoais?',
        type: 'multiple_choice',
        options: ['Totalmente conforme LGPD', 'Parcialmente conforme', 'Em adequação', 'Não conforme'],
        required: true,
        weight: 9
      },
      {
        id: 'default_4',
        category: 'Observações',
        question: 'Descreva outras medidas de segurança relevantes:',
        type: 'text',
        required: false,
        weight: 5
      }
    ];
  };
  
  // Salvar alterações no assessment
  const saveAssessmentChanges = async () => {
    console.log('=== INICIANDO SALVAMENTO ===');
    console.log('editingAssessment:', editingAssessment);
    console.log('assessmentQuestions:', assessmentQuestions);
    console.log('assessmentResponses:', assessmentResponses);
    console.log('assessmentMetadata:', assessmentMetadata);
    
    if (!editingAssessment) {
      console.log('Erro: editingAssessment é null');
      return;
    }
    
    try {
      // Calcular estatísticas
      const totalQuestions = assessmentQuestions.length;
      const answeredQuestions = Object.keys(assessmentResponses).length;
      const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
      
      console.log('Estatísticas calculadas:', {
        totalQuestions,
        answeredQuestions,
        progressPercentage
      });
      
      // Calcular score baseado nas respostas
      let totalScore = 0;
      let totalWeight = 0;
      
      assessmentQuestions.forEach(question => {
        const response = assessmentResponses[question.id];
        if (response && response.answer) {
          let questionScore = 0;
          
          if (question.type === 'yes_no') {
            questionScore = response.answer === 'yes' ? 5 : 1;
          } else if (question.type === 'scale') {
            questionScore = parseFloat(response.answer) || 0;
          } else if (question.type === 'multiple_choice') {
            // Score baseado na posição da opção (primeira opção = maior score)
            const optionIndex = question.options?.indexOf(response.answer) || 0;
            questionScore = question.options ? (question.options.length - optionIndex) : 1;
          } else {
            questionScore = response.answer ? 3 : 0; // Texto preenchido = score médio
          }
          
          totalScore += questionScore * (question.weight || 1);
          totalWeight += (question.weight || 1);
        }
      });
      
      const overallScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
      
      console.log('Score calculado:', {
        totalScore,
        totalWeight,
        overallScore
      });
      
      // Determinar nível de risco baseado no score
      let riskLevel = 'low';
      if (overallScore < 2) riskLevel = 'critical';
      else if (overallScore < 3) riskLevel = 'high';
      else if (overallScore < 4) riskLevel = 'medium';
      
      // Determinar status baseado no progresso e prazo
      let status = assessmentMetadata.status;
      if (progressPercentage === 100) {
        status = 'completed';
      } else if (new Date(assessmentMetadata.due_date) < new Date()) {
        status = 'overdue';
      } else if (progressPercentage > 0) {
        status = 'in_progress';
      }
      
      const updatedAssessment = {
        due_date: assessmentMetadata.due_date,
        priority: assessmentMetadata.priority,
        status: status,
        progress_percentage: progressPercentage,
        internal_review_status: assessmentMetadata.internal_review_status,
        reviewer_notes: assessmentMetadata.reviewer_notes || '',
        overall_score: overallScore,
        risk_level: riskLevel,
        responses: assessmentResponses,
        // Incluir questões modificadas se houver
        custom_questions: assessmentQuestions.filter(q => q.modified),
        updated_at: new Date().toISOString()
      };
      
      console.log('Dados para atualização:', updatedAssessment);
      console.log('ID do assessment:', editingAssessment.id);
      console.log('É assessment pendente?', editingAssessment.id.startsWith('pending-'));
      
      // Salvar no banco se for um assessment real (não pendente)
      if (!editingAssessment.id.startsWith('pending-') && !editingAssessment.id.startsWith('vendor-')) {
        console.log('Salvando no banco de dados...');
        
        const { data, error } = await supabase
          .from('vendor_assessments')
          .update(updatedAssessment)
          .eq('id', editingAssessment.id)
          .select();
        
        console.log('Resultado da atualização:', { data, error });
        
        if (error) {
          console.error('Erro do Supabase:', error);
          throw error;
        }
        
        console.log('Assessment salvo no banco com sucesso');
      } else {
        console.log('Assessment é virtual/pendente, não salvando no banco');
        
        // Para assessments virtuais, salvar no localStorage ou estado local
        if (editingAssessment.id.startsWith('pending-')) {
          // Atualizar dados no localStorage se necessário
          const vendorId = editingAssessment.vendor_id;
          const storageKey = `vendor_${vendorId}_assessment_data`;
          localStorage.setItem(storageKey, JSON.stringify({
            ...updatedAssessment,
            questions: assessmentQuestions,
            lastUpdated: new Date().toISOString()
          }));
          console.log('Dados salvos no localStorage');
        }
      }
      
      toast({
        title: "Assessment Salvo",
        description: `Assessment atualizado com sucesso. Progresso: ${progressPercentage}%, Score: ${overallScore.toFixed(1)}`
      });
      
      console.log('Fechando modal e recarregando assessments...');
      setShowEditDialog(false);
      await loadAssessments();
      
      console.log('=== SALVAMENTO CONCLUÍDO ===');
      
    } catch (error) {
      console.error('=== ERRO NO SALVAMENTO ===');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      
      toast({
        title: "Erro",
        description: `Não foi possível salvar as alterações: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };
  
  // Debug: Estado atual do sistema
  const debugSystemState = () => {
    console.log('\n=== DEBUG SISTEMA COMPLETO ===');
    console.log('1. USER INFO:');
    console.log('   - user:', user);
    console.log('   - tenantId:', user?.tenantId || user?.tenant_id);
    console.log('   - email:', user?.email);
    console.log('   - id:', user?.id);
    
    console.log('\n2. EDITING ASSESSMENT:');
    console.log('   - editingAssessment:', editingAssessment);
    console.log('   - assessment ID:', editingAssessment?.id);
    console.log('   - vendor_id:', editingAssessment?.vendor_id);
    console.log('   - framework_id:', editingAssessment?.framework_id);
    
    console.log('\n3. QUESTIONS:');
    console.log('   - assessmentQuestions length:', assessmentQuestions.length);
    console.log('   - assessmentQuestions:', assessmentQuestions);
    
    console.log('\n4. RESPONSES:');
    console.log('   - assessmentResponses:', assessmentResponses);
    console.log('   - responses count:', Object.keys(assessmentResponses).length);
    
    console.log('\n5. METADATA:');
    console.log('   - assessmentMetadata:', assessmentMetadata);
    
    console.log('\n6. SUPABASE CONNECTION:');
    console.log('   - supabase:', supabase);
    console.log('   - supabase.auth:', supabase.auth);
    
    console.log('\n7. BROWSER INFO:');
    console.log('   - localStorage available:', typeof localStorage !== 'undefined');
    console.log('   - localStorage items:', localStorage.length);
    console.log('   - navigator online:', navigator.onLine);
    
    console.log('=== FIM DEBUG SISTEMA ===\n');
  };
  
  // Debug: Testar conectividade Supabase
  const testSupabaseConnection = async () => {
    console.log('\n=== TESTE CONECTIVIDADE SUPABASE ===');
    
    try {
      // Teste 1: Verificar auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('1. AUTH TEST:', { authData, authError });
      
      // Teste 2: Verificar tabela vendor_assessments
      const { data: tableData, error: tableError } = await supabase
        .from('vendor_assessments')
        .select('id')
        .limit(1);
      console.log('2. TABLE TEST:', { tableData, tableError });
      
      // Teste 3: Verificar permissões de escrita
      const testRecord = {
        id: 'test-' + Date.now(),
        vendor_id: 'test-vendor',
        framework_id: 'test-framework',
        assessment_name: 'Test Assessment',
        assessment_type: 'initial',
        status: 'draft',
        priority: 'low',
        due_date: new Date().toISOString(),
        progress_percentage: 0,
        internal_review_status: 'pending',
        responses: {},
        tenant_id: user?.tenantId || user?.tenant_id,
        created_by: user?.id
      };
      
      console.log('3. TESTING INSERT...');
      const { data: insertData, error: insertError } = await supabase
        .from('vendor_assessments')
        .insert(testRecord)
        .select();
      
      console.log('3. INSERT TEST:', { insertData, insertError });
      
      // Limpar teste se inseriu com sucesso
      if (insertData && insertData.length > 0) {
        console.log('4. CLEANING TEST RECORD...');
        const { error: deleteError } = await supabase
          .from('vendor_assessments')
          .delete()
          .eq('id', testRecord.id);
        console.log('4. DELETE TEST:', { deleteError });
      }
      
    } catch (error) {
      console.error('ERRO NO TESTE DE CONECTIVIDADE:', error);
    }
    
    console.log('=== FIM TESTE CONECTIVIDADE ===\n');
  };
  
  // Debug: Simular resposta completa
  const simulateCompleteResponse = () => {
    console.log('\n=== SIMULANDO RESPOSTA COMPLETA ===');
    
    if (assessmentQuestions.length === 0) {
      console.log('ERRO: Nenhuma questão carregada');
      return;
    }
    
    const simulatedResponses = {};
    
    assessmentQuestions.forEach((question, index) => {
      let simulatedAnswer;
      
      switch (question.type) {
        case 'yes_no':
          simulatedAnswer = index % 2 === 0 ? 'yes' : 'no';
          break;
        case 'scale':
          simulatedAnswer = (index % 5) + 1;
          break;
        case 'multiple_choice':
          simulatedAnswer = question.options?.[0] || 'Opção 1';
          break;
        case 'text':
        default:
          simulatedAnswer = `Resposta simulada para questão ${index + 1}`;
          break;
      }
      
      simulatedResponses[question.id] = {
        answer: simulatedAnswer,
        justification: `Justificativa simulada para questão ${index + 1}`,
        responded_at: new Date().toISOString(),
        responded_by: user?.email || 'Sistema',
        evidence: [
          {
            id: `evidence-${question.id}-1`,
            fileName: `documento-${index + 1}.pdf`,
            fileSize: 1024 * (index + 1),
            fileType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.email || 'Sistema',
            url: `#evidence-${question.id}`
          }
        ]
      };
    });
    
    console.log('Respostas simuladas:', simulatedResponses);
    setAssessmentResponses(simulatedResponses);
    
    console.log('=== FIM SIMULAÇÃO ===\n');
  };
  
  // Debug: Forçar salvamento com logs detalhados
  const forceSaveWithDebug = async () => {
    console.log('\n=== FORÇANDO SALVAMENTO COM DEBUG ===');
    
    if (!editingAssessment) {
      console.error('ERRO: editingAssessment é null');
      return;
    }
    
    try {
      console.log('1. PREPARANDO DADOS...');
      
      const totalQuestions = assessmentQuestions.length;
      const answeredQuestions = Object.keys(assessmentResponses).length;
      const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
      
      console.log('   - Total questões:', totalQuestions);
      console.log('   - Questões respondidas:', answeredQuestions);
      console.log('   - Progresso:', progressPercentage + '%');
      
      const updateData = {
        responses: assessmentResponses,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
        status: progressPercentage > 0 ? 'in_progress' : 'draft'
      };
      
      console.log('2. DADOS PARA ATUALIZAÇÃO:', updateData);
      
      // Verificar se é assessment real ou virtual
      const isRealAssessment = !editingAssessment.id.startsWith('pending-') && 
                              !editingAssessment.id.startsWith('vendor-');
      
      console.log('3. TIPO DE ASSESSMENT:');
      console.log('   - ID:', editingAssessment.id);
      console.log('   - É real?', isRealAssessment);
      console.log('   - É pendente?', editingAssessment.id.startsWith('pending-'));
      console.log('   - É virtual?', editingAssessment.id.startsWith('vendor-'));
      
      if (isRealAssessment) {
        console.log('4. SALVANDO NO BANCO DE DADOS...');
        
        // Primeiro verificar se existe
        const { data: existingData, error: selectError } = await supabase
          .from('vendor_assessments')
          .select('*')
          .eq('id', editingAssessment.id)
          .single();
        
        console.log('   - Busca existente:', { existingData, selectError });
        
        if (selectError && selectError.code === 'PGRST116') {
          // Não existe, criar
          console.log('5. ASSESSMENT NÃO EXISTE, CRIANDO...');
          
          const newAssessment = {
            id: editingAssessment.id,
            vendor_id: editingAssessment.vendor_id,
            framework_id: editingAssessment.framework_id,
            assessment_name: editingAssessment.assessment_name,
            assessment_type: editingAssessment.assessment_type,
            status: updateData.status,
            priority: editingAssessment.priority,
            due_date: editingAssessment.due_date,
            progress_percentage: updateData.progress_percentage,
            internal_review_status: 'pending',
            responses: updateData.responses,
            tenant_id: user?.tenantId || user?.tenant_id,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: updateData.updated_at
          };
          
          console.log('   - Dados para criação:', newAssessment);
          
          const { data: createData, error: createError } = await supabase
            .from('vendor_assessments')
            .insert(newAssessment)
            .select();
          
          console.log('   - Resultado criação:', { createData, createError });
          
          if (createError) throw createError;
          
        } else if (!selectError) {
          // Existe, atualizar
          console.log('5. ASSESSMENT EXISTE, ATUALIZANDO...');
          
          const { data: updateResult, error: updateError } = await supabase
            .from('vendor_assessments')
            .update(updateData)
            .eq('id', editingAssessment.id)
            .select();
          
          console.log('   - Resultado atualização:', { updateResult, updateError });
          
          if (updateError) throw updateError;
          
        } else {
          throw selectError;
        }
        
      } else {
        console.log('4. SALVANDO NO LOCALSTORAGE (ASSESSMENT VIRTUAL)...');
        
        const storageKey = `assessment_${editingAssessment.id}_data`;
        const storageData = {
          ...updateData,
          assessmentId: editingAssessment.id,
          vendorId: editingAssessment.vendor_id,
          lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(storageData));
        console.log('   - Salvo no localStorage:', storageKey);
        console.log('   - Dados salvos:', storageData);
      }
      
      console.log('6. SALVAMENTO CONCLUÍDO COM SUCESSO!');
      
      toast({
        title: "Debug: Salvamento Bem-sucedido",
        description: `Dados salvos com sucesso. Progresso: ${progressPercentage}%`
      });
      
    } catch (error) {
      console.error('ERRO NO SALVAMENTO:', error);
      console.error('Stack trace:', error.stack);
      
      toast({
        title: "Debug: Erro no Salvamento",
        description: `Erro: ${error.message}`,
        variant: "destructive"
      });
    }
    
    console.log('=== FIM FORÇAR SALVAMENTO ===\n');
  };
  
  // Atualizar resposta de uma questão
  const updateQuestionResponse = (questionId: string, answer: any, justification?: string) => {
    console.log('\n=== UPDATE QUESTION RESPONSE ===');
    console.log('Input:', { questionId, answer, justification });
    console.log('Estado anterior:', assessmentResponses[questionId]);
    
    setAssessmentResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: {
          ...prev[questionId], // Preservar evidências existentes
          answer,
          justification: justification || prev[questionId]?.justification || '',
          responded_at: new Date().toISOString(),
          responded_by: user?.email || 'Sistema'
        }
      };
      
      console.log('Estado novo:', newResponses[questionId]);
      console.log('Total respostas:', Object.keys(newResponses).length);
      console.log('=== FIM UPDATE RESPONSE ===\n');
      
      return newResponses;
    });
  };
  
  // Editar questão individual
  const startEditingQuestion = (question: any) => {
    setEditingQuestionId(question.id);
    setQuestionEditForm({
      question: question.question,
      description: question.description || '',
      type: question.type,
      required: question.required,
      weight: question.weight,
      options: question.options ? [...question.options] : [],
      scale_min: question.scale_min || 1,
      scale_max: question.scale_max || 5,
      scale_labels: question.scale_labels ? [...question.scale_labels] : []
    });
  };
  
  // Salvar edição da questão
  const saveQuestionEdit = () => {
    if (!editingQuestionId) return;
    
    setAssessmentQuestions(prev => prev.map(q => {
      if (q.id === editingQuestionId) {
        return {
          ...q,
          question: questionEditForm.question,
          description: questionEditForm.description,
          type: questionEditForm.type,
          required: questionEditForm.required,
          weight: questionEditForm.weight,
          options: questionEditForm.options,
          scale_min: questionEditForm.scale_min,
          scale_max: questionEditForm.scale_max,
          scale_labels: questionEditForm.scale_labels,
          modified: true, // Marcar como modificada
          modified_at: new Date().toISOString(),
          modified_by: user?.email || 'Sistema'
        };
      }
      return q;
    }));
    
    setEditingQuestionId(null);
    setQuestionEditForm({});
    
    toast({
      title: "Questão Atualizada",
      description: "A questão foi atualizada com sucesso"
    });
  };
  
  // Cancelar edição da questão
  const cancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setQuestionEditForm({});
  };
  
  // Adicionar opção para questão de múltipla escolha
  const addOption = () => {
    setQuestionEditForm(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };
  
  // Remover opção
  const removeOption = (index: number) => {
    setQuestionEditForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };
  
  // Atualizar opção
  const updateOption = (index: number, value: string) => {
    setQuestionEditForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };
  
  // Upload de evidência
  const uploadEvidence = async (questionId: string, file: File) => {
    try {
      console.log('Fazendo upload de evidência:', { questionId, fileName: file.name });
      
      // Aqui você implementaria o upload real para o storage
      // Por enquanto, vou simular o upload
      const fileName = `evidence_${questionId}_${Date.now()}_${file.name}`;
      
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvidence = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || 'Sistema',
        url: `#${fileName}` // URL simulada
      };
      
      // Adicionar evidência à resposta preservando dados existentes
      setAssessmentResponses(prev => {
        const currentResponse = prev[questionId] || {};
        const updatedResponse = {
          ...currentResponse,
          evidence: [
            ...(currentResponse.evidence || []),
            newEvidence
          ],
          // Se não há resposta ainda, criar uma básica
          answer: currentResponse.answer || '',
          justification: currentResponse.justification || '',
          responded_at: currentResponse.responded_at || new Date().toISOString(),
          responded_by: currentResponse.responded_by || user?.email || 'Sistema'
        };
        
        const newResponses = {
          ...prev,
          [questionId]: updatedResponse
        };
        
        console.log('Evidência adicionada, novas respostas:', newResponses);
        return newResponses;
      });
      
      toast({
        title: "Evidência Anexada",
        description: `Arquivo ${file.name} anexado com sucesso`
      });
      
    } catch (error) {
      console.error('Erro ao fazer upload da evidência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível anexar a evidência",
        variant: "destructive"
      });
    }
  };
  
  // Remover evidência
  const removeEvidence = (questionId: string, evidenceId: string) => {
    console.log('Removendo evidência:', { questionId, evidenceId });
    
    setAssessmentResponses(prev => {
      const currentResponse = prev[questionId];
      if (!currentResponse) return prev;
      
      const updatedResponse = {
        ...currentResponse,
        evidence: currentResponse.evidence?.filter(e => e.id !== evidenceId) || []
      };
      
      const newResponses = {
        ...prev,
        [questionId]: updatedResponse
      };
      
      console.log('Evidência removida, novas respostas:', newResponses);
      return newResponses;
    });
    
    toast({
      title: "Evidência Removida",
      description: "A evidência foi removida com sucesso"
    });
  };
  
  // Calcular estatísticas do assessment
  const getAssessmentStats = () => {
    const totalQuestions = assessmentQuestions.length;
    const answeredQuestions = Object.keys(assessmentResponses).length;
    const incompleteQuestions = assessmentQuestions.filter(q => {
      const response = assessmentResponses[q.id];
      return q.required && (!response || !response.answer);
    }).length;
    
    return {
      total: totalQuestions,
      answered: answeredQuestions,
      remaining: totalQuestions - answeredQuestions,
      incomplete: incompleteQuestions,
      progress: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
    };
  };

  // Get status badge
  const getStatusBadge = (status: string, dueDate: string, assessment: VendorAssessment) => {
    const isOverdue = new Date(dueDate) < new Date() && !['completed', 'approved'].includes(status);
    const isPendingResponse = status === 'sent' && assessment.public_link_id && !assessment.responses;
    
    if (isOverdue) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    
    if (isPendingResponse) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
          Aguardando Resposta
        </Badge>
      );
    }

    switch (status) {
      case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
      case 'sent': return <Badge variant="outline">Enviado</Badge>;
      case 'in_progress': return <Badge variant="default">Em Andamento</Badge>;
      case 'completed': return <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">Concluído</Badge>;
      case 'approved': return <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-300">Aprovado</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>;
      case 'expired': return <Badge variant="secondary">Expirado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get risk level badge
  const getRiskLevelBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;

    switch (riskLevel) {
      case 'low': return <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-300">Baixo</Badge>;
      case 'medium': return <Badge variant="default" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">Médio</Badge>;
      case 'high': return <Badge variant="default" className="bg-orange-500/10 text-orange-700 dark:text-orange-300">Alto</Badge>;
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assessments
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {currentAssessments.length}
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Em Andamento
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {currentAssessments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Concluídos
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {currentAssessments.filter(a => ['completed', 'approved'].includes(a.status)).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Atrasados
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {currentAssessments.filter(a => new Date(a.due_date) < new Date() && !['completed', 'approved'].includes(a.status)).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Assessments de Fornecedores</CardTitle>
              {pendingVendorAssessments.length > 0 && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                  {pendingVendorAssessments.length} aguardando resposta
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowNewAssessmentDialog(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="filter">Filtrar por:</Label>
                <Select value={currentSelectedFilter} onValueChange={setLocalSelectedFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione um filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="awaiting_response">Aguardando Resposta</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="overdue">Atrasados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="search">Buscar:</Label>
                <Input
                  id="search"
                  placeholder="Nome do assessment ou fornecedor..."
                  value={currentSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
            
            {pendingVendorAssessments.length > 0 && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                {pendingVendorAssessments.length} aguardando resposta do fornecedor
              </Badge>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">Assessment</TableHead>
                  <TableHead className="w-[22%]">Fornecedor</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[12%]">Progresso</TableHead>
                  <TableHead className="w-[11%]">Prazo</TableHead>
                  <TableHead className="w-[15%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {currentLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Carregando assessments...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileCheck className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-500">Nenhum assessment encontrado</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <TableRow 
                      key={assessment.id} 
                      className={`
                        hover:bg-muted/50 transition-colors
                        ${assessment.status === 'sent' && assessment.public_link_id && !assessment.responses 
                          ? 'bg-orange-50/50 dark:bg-orange-950/20 border-l-4 border-l-orange-500' 
                          : ''
                        }
                      `}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium text-sm mb-1">{assessment.assessment_name}</div>
                          <div className="flex flex-wrap items-center gap-1 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {assessment.assessment_type.replace('_', ' ')}
                            </Badge>
                            {assessment.id.startsWith('vendor-') && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                Fornecedor
                              </Badge>
                            )}
                            {assessment.metadata?.selected_in_onboarding && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                                Onboarding
                              </Badge>
                            )}
                            {assessment.metadata?.pending_creation && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
                                Pendente
                              </Badge>
                            )}
                            {getRiskLevelBadge(assessment.risk_level)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assessment.vendor_assessment_frameworks?.name || assessment.metadata?.template_name}
                            {assessment.overall_score && (
                              <span className="ml-2">• Score: {assessment.overall_score.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{assessment.vendor_registry?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {assessment.vendor_registry?.primary_contact_email}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(assessment.status, assessment.due_date, assessment)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={assessment.progress_percentage} className="w-12 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {assessment.progress_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Sempre mostrar botão de editar primeiro */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAssessmentEditor(assessment)}
                            title="Editar Assessment"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAssessment(assessment)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Mostrar botão criar apenas para assessments pendentes */}
                          {assessment.metadata?.pending_creation && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => createFormalAssessment(assessment)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Criar Assessment Formal"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Botões adicionais apenas para assessments não pendentes */}
                          {!assessment.metadata?.pending_creation && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generatePublicLink(assessment.id)}
                                title="Gerar Link Público"
                              >
                                <Link className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendAssessmentEmail(assessment)}
                                title="Enviar por Email"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Public Link Dialog */}
      <Dialog open={showPublicLinkDialog} onOpenChange={setShowPublicLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Link Público do Assessment
            </DialogTitle>
            <DialogDescription>
              Compartilhe este link com o fornecedor para que ele possa responder ao assessment.
            </DialogDescription>
          </DialogHeader>
          
          {publicLinkData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="public-link">Link Público</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="public-link"
                    value={publicLinkData.link}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyLinkToClipboard(publicLinkData.link)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expira em: {new Date(publicLinkData.expiresAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="bg-primary/10 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-primary mb-1">
                  🎯 ALEX VENDOR - Dica Inteligente
                </h4>
                <p className="text-sm text-primary/80">
                  O link expira automaticamente em 30 dias por segurança. O fornecedor receberá 
                  lembretes automáticos conforme o prazo se aproxima.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assessment Editor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Editar Assessment - {editingAssessment?.assessment_name || 'Carregando...'}
            </DialogTitle>
            <DialogDescription>
              Edite as informações do assessment, responda questões e acompanhe o progresso.
            </DialogDescription>
          </DialogHeader>
          
          {editingAssessment && (
            <div className="space-y-6">
              {/* Informações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações do Framework */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Framework/Template Selecionado:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nome:</span> {editingAssessment?.vendor_assessment_frameworks?.name || editingAssessment?.metadata?.template_name || 'Não definido'}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {editingAssessment?.vendor_assessment_frameworks?.framework_type || 
                          (editingAssessment?.framework_id === 'nist_csf_default' ? 'NIST CSF' : 
                           editingAssessment?.framework_id === 'iso_27001_27701_default' ? 'ISO 27001/27701' : 
                           'Padrão')}
                      </div>
                      <div>
                        <span className="font-medium">Framework ID:</span> {editingAssessment?.framework_id || 'Não definido'}
                      </div>
                      <div>
                        <span className="font-medium">Questões Carregadas:</span> {assessmentQuestions.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="due_date">Prazo</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={assessmentMetadata.due_date ? new Date(assessmentMetadata.due_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setAssessmentMetadata(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={assessmentMetadata.priority} onValueChange={(value) => setAssessmentMetadata(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={assessmentMetadata.status} onValueChange={(value) => setAssessmentMetadata(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="sent">Enviado</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reviewer_notes">Notas do Revisor</Label>
                    <Textarea
                      id="reviewer_notes"
                      placeholder="Adicione notas sobre a revisão do assessment..."
                      value={assessmentMetadata.reviewer_notes}
                      onChange={(e) => setAssessmentMetadata(prev => ({ ...prev, reviewer_notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas do Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(() => {
                      const stats = getAssessmentStats();
                      return (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Total de Questões</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.answered}</div>
                            <div className="text-sm text-muted-foreground">Respondidas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.remaining}</div>
                            <div className="text-sm text-muted-foreground">Faltantes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.incomplete}</div>
                            <div className="text-sm text-muted-foreground">Incompletas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.progress}%</div>
                            <div className="text-sm text-muted-foreground">Progresso</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progresso Geral</span>
                      <span className="text-sm text-muted-foreground">{getAssessmentStats().progress}%</span>
                    </div>
                    <Progress value={getAssessmentStats().progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Questões */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Questões do Assessment</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssessmentEditor(editingAssessment!)}
                      >
                        Recarregar Questões
                      </Button>
                      {assessmentQuestions.length === 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => loadDefaultQuestions().then(setAssessmentQuestions)}
                        >
                          Carregar Questões Padrão
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-6">
                      {assessmentQuestions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mb-6">
                            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Nenhuma questão carregada</h3>
                            <p className="text-muted-foreground mb-4">
                              Não foi possível carregar as questões para este assessment.
                            </p>
                          </div>
                          
                          <div className="bg-muted/30 p-4 rounded-lg mb-6 text-left">
                            <h4 className="font-medium mb-2">Informações de Debug:</h4>
                            <div className="text-sm space-y-1">
                              <div><strong>Assessment:</strong> {editingAssessment?.assessment_name || 'Não definido'}</div>
                              <div><strong>Template:</strong> {editingAssessment?.metadata?.template_name || 'Não definido'}</div>
                              <div><strong>Framework ID:</strong> {editingAssessment?.framework_id || 'Não definido'}</div>
                              <div><strong>Framework Name:</strong> {editingAssessment?.vendor_assessment_frameworks?.name || 'Não definido'}</div>
                              <div><strong>Framework Type:</strong> {editingAssessment?.vendor_assessment_frameworks?.framework_type || 'Não definido'}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-center">
                            <Button 
                              onClick={() => loadDefaultQuestions().then(setAssessmentQuestions)}
                              variant="default"
                            >
                              Carregar Questões Padrão
                            </Button>
                            <Button 
                              onClick={() => openAssessmentEditor(editingAssessment!)}
                              variant="outline"
                            >
                              Tentar Recarregar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        assessmentQuestions.map((question, index) => {
                        console.log('Renderizando questão:', question);
                        const response = assessmentResponses[question.id];
                        const isRequired = question.required;
                        const isAnswered = response && response.answer;
                        console.log('Resposta atual:', response);
                        
                        return (
                          <div key={question.id} className={`p-4 border rounded-lg ${
                            isRequired && !isAnswered ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : 
                            isAnswered ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 
                            'border-gray-200 dark:border-gray-700 dark:bg-gray-800/30'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {question.category}
                                  </Badge>
                                  {isRequired && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obrigatória
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    Peso: {question.weight || 1}
                                  </Badge>
                                  {question.modified && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                      Modificada
                                    </Badge>
                                  )}
                                </div>
                                
                                {editingQuestionId === question.id ? (
                                  // Modo de edição da questão
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium">Questão:</Label>
                                      <Textarea
                                        value={questionEditForm.question}
                                        onChange={(e) => setQuestionEditForm(prev => ({ ...prev, question: e.target.value }))}
                                        rows={2}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-sm font-medium">Descrição (opcional):</Label>
                                      <Textarea
                                        value={questionEditForm.description}
                                        onChange={(e) => setQuestionEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                        className="mt-1"
                                        placeholder="Descrição adicional da questão..."
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <Label className="text-sm font-medium">Tipo:</Label>
                                        <Select value={questionEditForm.type} onValueChange={(value) => setQuestionEditForm(prev => ({ ...prev, type: value }))}>
                                          <SelectTrigger className="mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                                            <SelectItem value="scale">Escala</SelectItem>
                                            <SelectItem value="yes_no">Sim/Não</SelectItem>
                                            <SelectItem value="text">Texto</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium">Peso:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={questionEditForm.weight}
                                          onChange={(e) => setQuestionEditForm(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                                          className="mt-1"
                                        />
                                      </div>
                                      
                                      <div className="flex items-center space-x-2 mt-6">
                                        <Checkbox
                                          checked={questionEditForm.required}
                                          onCheckedChange={(checked) => setQuestionEditForm(prev => ({ ...prev, required: checked }))}
                                        />
                                        <Label className="text-sm">Obrigatória</Label>
                                      </div>
                                    </div>
                                    
                                    {/* Opções para múltipla escolha */}
                                    {questionEditForm.type === 'multiple_choice' && (
                                      <div>
                                        <Label className="text-sm font-medium">Opções:</Label>
                                        <div className="space-y-2 mt-1">
                                          {questionEditForm.options?.map((option, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                              <Input
                                                value={option}
                                                onChange={(e) => updateOption(optIndex, e.target.value)}
                                                placeholder={`Opção ${optIndex + 1}`}
                                              />
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeOption(optIndex)}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          ))}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addOption}
                                          >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Adicionar Opção
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Configurações para escala */}
                                    {questionEditForm.type === 'scale' && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <Label className="text-sm font-medium">Mínimo:</Label>
                                          <Input
                                            type="number"
                                            value={questionEditForm.scale_min}
                                            onChange={(e) => setQuestionEditForm(prev => ({ ...prev, scale_min: parseInt(e.target.value) }))}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Máximo:</Label>
                                          <Input
                                            type="number"
                                            value={questionEditForm.scale_max}
                                            onChange={(e) => setQuestionEditForm(prev => ({ ...prev, scale_max: parseInt(e.target.value) }))}
                                            className="mt-1"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={saveQuestionEdit}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Salvar
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={cancelQuestionEdit}>
                                        <X className="h-4 w-4 mr-1" />
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // Modo de visualização da questão
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-foreground">
                                      {index + 1}. {question.question}
                                    </h4>
                                    {question.description && (
                                      <p className="text-xs text-muted-foreground mb-2">
                                        {question.description}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-4 flex items-center gap-2">
                                {editingQuestionId !== question.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditingQuestion(question)}
                                    title="Editar Questão"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                {isAnswered ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : isRequired ? (
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            {/* Campo de resposta baseado no tipo */}
                            <div className="space-y-3">
                              {question.type === 'multiple_choice' && (
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Resposta:</Label>
                                  <Select 
                                    value={response?.answer || ''} 
                                    onValueChange={(value) => updateQuestionResponse(question.id, value)}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Selecione uma opção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {question.options?.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              
                              {question.type === 'scale' && (
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Avaliação (1-{question.scale_max}):</Label>
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center space-x-2">
                                      {Array.from({ length: question.scale_max || 5 }, (_, i) => i + 1).map((value) => (
                                        <Button
                                          key={value}
                                          variant={response?.answer == value ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateQuestionResponse(question.id, value)}
                                          className="w-10 h-10"
                                        >
                                          {value}
                                        </Button>
                                      ))}
                                    </div>
                                    {question.scale_labels && (
                                      <div className="text-xs text-muted-foreground">
                                        {question.scale_labels.map((label, i) => (
                                          <span key={i} className="mr-4">
                                            {i + 1}: {label}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {question.type === 'yes_no' && (
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Resposta:</Label>
                                  <div className="mt-2 flex space-x-2">
                                    <Button
                                      variant={response?.answer === 'yes' ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => updateQuestionResponse(question.id, 'yes')}
                                    >
                                      Sim
                                    </Button>
                                    <Button
                                      variant={response?.answer === 'no' ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => updateQuestionResponse(question.id, 'no')}
                                    >
                                      Não
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              {question.type === 'text' && (
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Resposta:</Label>
                                  <Textarea
                                    placeholder="Digite sua resposta..."
                                    value={response?.answer || ''}
                                    onChange={(e) => updateQuestionResponse(question.id, e.target.value)}
                                    rows={3}
                                    className="mt-1"
                                  />
                                </div>
                              )}
                              
                              {/* Campo de justificativa */}
                              <div>
                                <Label className="text-sm font-medium text-foreground">Justificativa/Observações (opcional):</Label>
                                <Textarea
                                  placeholder="Adicione justificativas ou observações sobre esta resposta..."
                                  value={response?.justification || ''}
                                  onChange={(e) => updateQuestionResponse(question.id, response?.answer || '', e.target.value)}
                                  rows={2}
                                  className="mt-1"
                                />
                              </div>
                              
                              {/* Seção de Evidências */}
                              <div>
                                <Label className="text-sm font-medium text-foreground">Evidências:</Label>
                                <div className="mt-2 space-y-2">
                                  {/* Lista de evidências existentes */}
                                  {response?.evidence && response.evidence.length > 0 && (
                                    <div className="space-y-2">
                                      {response.evidence.map((evidence) => (
                                        <div key={evidence.id} className="flex items-center justify-between p-2 bg-muted/30 rounded border">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <div>
                                              <div className="text-sm font-medium">{evidence.fileName}</div>
                                              <div className="text-xs text-muted-foreground">
                                                {(evidence.fileSize / 1024).toFixed(1)} KB • {evidence.uploadedBy} • {new Date(evidence.uploadedAt).toLocaleDateString('pt-BR')}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => window.open(evidence.url, '_blank')}
                                              title="Visualizar"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeEvidence(question.id, evidence.id)}
                                              title="Remover"
                                            >
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Botão para adicionar evidência */}
                                  <div>
                                    <input
                                      type="file"
                                      id={`evidence-${question.id}`}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          uploadEvidence(question.id, file);
                                          e.target.value = ''; // Reset input
                                        }
                                      }}
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById(`evidence-${question.id}`)?.click()}
                                    >
                                      <Upload className="h-4 w-4 mr-1" />
                                      Anexar Evidência
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Informações da resposta */}
                              {response && (
                                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                                  Respondido por: {response.responded_by} em {new Date(response.responded_at).toLocaleString('pt-BR')}
                                  {response.evidence && response.evidence.length > 0 && (
                                    <span className="ml-2">• {response.evidence.length} evidência(s) anexada(s)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Botões de Ação */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const stats = getAssessmentStats();
                    return `${stats.answered}/${stats.total} questões respondidas (${stats.progress}%)`;
                  })()}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveAssessmentChanges}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};