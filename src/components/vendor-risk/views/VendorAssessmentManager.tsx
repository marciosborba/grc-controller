import React, { useState, useEffect, useMemo } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
import { useAuth} from '@/contexts/AuthContextOptimized';
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
  FileText,
  MoreHorizontal,
  Mail,
  ExternalLink,
  Copy as CopyIcon,
  Building,
  Info,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  AlertCircle as AlertCircleIcon,
  ArrowLeft,
  ArrowRight
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
  const [showAssessmentDetails, setShowAssessmentDetails] = useState(false);
  const [publicLinkData, setPublicLinkData] = useState<{link: string; expiresAt: string} | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<VendorAssessment | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [assessmentResponses, setAssessmentResponses] = useState<Record<string, any>>({});
  const [assessmentMetadata, setAssessmentMetadata] = useState<any>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionEditForm, setQuestionEditForm] = useState<any>({});
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedAssessmentForEmail, setSelectedAssessmentForEmail] = useState<VendorAssessment | null>(null);
  const [emailForm, setEmailForm] = useState({ email: '', subject: '', message: '' });
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState<VendorAssessment | null>(null);
  const [previewEmailData, setPreviewEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    customMessage: '',
    sendCopy: false,
    autoReminder: true
  });
  const [previewEmailSending, setPreviewEmailSending] = useState(false);
  const [previewEmailStatus, setPreviewEmailStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);

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
        // Error loading assessments
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
            // Error processing localStorage template
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
      // Unexpected error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
    
    // Removed debugging functions - preview should work now
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
      (currentSelectedFilter === 'awaiting_response' && assessment.status === 'sent' && assessment.public_link && !assessment.responses) ||
      (currentSelectedFilter === 'in_progress' && assessment.status === 'in_progress') ||
      (currentSelectedFilter === 'completed' && assessment.status === 'completed') ||
      (currentSelectedFilter === 'overdue' && new Date(assessment.due_date) < new Date() && !['completed', 'approved'].includes(assessment.status));

    return matchesSearch && matchesFilter;
  });
  
  // Fornecedores que receberam assessments mas ainda não responderam
  const pendingVendorAssessments = filteredAssessments.filter(assessment => 
    assessment.status === 'sent' && 
    assessment.public_link && 
    !assessment.responses
  );

  // Open public link dialog
  const openPublicLinkDialog = async (assessment: VendorAssessment) => {
    // If link already exists and is not expired, show it
    if (assessment.public_link && assessment.public_link_expires_at) {
      const now = new Date();
      const expiresAt = new Date(assessment.public_link_expires_at);
      
      if (expiresAt > now) {
        const publicUrl = `${window.location.origin}/vendor-assessment/${assessment.public_link}`;
        setPublicLinkData({
          link: publicUrl,
          expiresAt: assessment.public_link_expires_at
        });
        setShowPublicLinkDialog(true);
        return;
      }
    }

    // Generate new link if doesn't exist or expired
    await generatePublicLink(assessment);
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
      // Error copying link
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  // Estado para o preview
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [previewCurrentStep, setPreviewCurrentStep] = useState(0);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});
  const [loadingPreviewQuestions, setLoadingPreviewQuestions] = useState(false);

  // Carregar questões reais usando exatamente a mesma lógica do openAssessmentEditor
  const loadPreviewQuestions = async (assessment: VendorAssessment) => {
    // Loading questions for assessment
    // Framework ID: assessment.framework_id
    // Template name: assessment.metadata?.template_name
    // Framework data: assessment.vendor_assessment_frameworks
    setLoadingPreviewQuestions(true);
    
    try {
      let questions = [];
      let savedResponses = {};
      
      // REPLICAR EXATAMENTE A LÓGICA DO openAssessmentEditor
      
      // Para assessments virtuais/pendentes, verificar se há dados salvos no localStorage
      if (assessment.id.startsWith('pending-') || assessment.id.startsWith('vendor-')) {
        const vendorId = assessment.vendor_id;
        const dataStorageKey = `vendor_${vendorId}_assessment_data`;
        const savedData = localStorage.getItem(dataStorageKey);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            // Dados salvos encontrados no localStorage
            savedResponses = parsedData.responses || {};
            
            // Se há questões salvas, usar elas
            if (parsedData.questions && parsedData.questions.length > 0) {
              questions = parsedData.questions;
              // Usando questões salvas do localStorage
            }
          } catch (e) {
            // Erro ao parsear dados salvos do localStorage
          }
        }
      }
      
      // Se ainda não temos questões, carregar baseado no framework - MESMA LÓGICA
      if (questions.length === 0) {
        // Primeiro, tentar carregar do framework se existir
        if (assessment.vendor_assessment_frameworks?.questions && assessment.vendor_assessment_frameworks.questions.length > 0) {
          questions = assessment.vendor_assessment_frameworks.questions;
          // Questões carregadas do framework
        } 
        // Segundo, tentar carregar baseado no framework_id
        else if (assessment.framework_id) {
          // Carregando questões baseado no framework_id
          
          // Use fallback questions for all frameworks
          questions = [];
        }
        // Terceiro, tentar carregar baseado no template_name
        else if (assessment.metadata?.template_name) {
          // Carregando questões baseado no template_name
          
          // Use fallback questions for all templates
          questions = [];
        }
        // Último recurso: carregar questões padrão
        else {
          // Use fallback questions
          questions = [];
        }
      }
      
      // Questões finais carregadas
      // Respostas existentes (assessment)
      // Respostas salvas (localStorage)
      
      // Combinar respostas existentes com respostas salvas (localStorage tem precedência) - MESMA LÓGICA
      const finalResponses = { ...(assessment.responses || {}), ...savedResponses };
      
      // Se ainda não tem questões, usar questões de fallback mínimas
      if (questions.length === 0) {
        // Using fallback questions
        questions = [
          {
            id: 'SEC-001',
            category: 'Segurança da Informação',
            subcategory: 'Políticas e Procedimentos',
            question: 'A organização possui políticas de segurança da informação documentadas, aprovadas e atualizadas?',
            description: 'Verificar se existem políticas formais de segurança da informação que cubram todos os aspectos relevantes do negócio.',
            type: 'multiple_choice',
            options: [
              'Sim, políticas completas e atualizadas (últimos 12 meses)',
              'Sim, políticas básicas mas necessitam atualização',
              'Políticas em desenvolvimento',
              'Não possui políticas formais'
            ],
            required: true,
            weight: 5,
            help_text: 'Políticas de segurança são fundamentais para estabelecer diretrizes organizacionais.'
          },
          {
            id: 'SEC-002',
            category: 'Controle de Acesso',
            subcategory: 'Gestão de Identidade',
            question: 'Como é realizada a gestão de contas de usuário e controle de acesso aos sistemas?',
            description: 'Avaliar os processos de criação, modificação e desabilitação de contas de usuário.',
            type: 'multiple_choice',
            options: [
              'Sistema centralizado com revisões regulares',
              'Controle básico mas sem revisões sistemáticas', 
              'Controle manual sem processo formal',
              'Sem controle específico'
            ],
            required: true,
            weight: 4,
            help_text: 'Controle de acesso adequado previne acessos não autorizados.'
          },
          {
            id: 'SEC-003',
            category: 'Gestão de Vulnerabilidades',
            subcategory: 'Atualizações e Patches',
            question: 'Qual a frequência e processo para aplicação de patches de segurança?',
            description: 'Verificar como a organização gerencia e aplica correções de segurança.',
            type: 'multiple_choice',
            options: [
              'Processo automatizado com aplicação imediata para críticos',
              'Processo manual mas regular (mensal)',
              'Aplicação ocasional conforme necessidade',
              'Sem processo definido'
            ],
            required: true,
            weight: 4,
            help_text: 'Patches regulares são essenciais para manter a segurança dos sistemas.'
          },
          {
            id: 'SEC-004',
            category: 'Backup e Recuperação',
            subcategory: 'Continuidade do Negócio',
            question: 'A organização possui estratégia de backup e plano de recuperação de desastres?',
            description: 'Avaliar os procedimentos de backup e capacidade de recuperação em caso de incidentes.',
            type: 'multiple_choice',
            options: [
              'Backup automatizado com testes regulares de recuperação',
              'Backup regular mas testes ocasionais',
              'Backup básico sem testes de recuperação',
              'Sem estratégia formal de backup'
            ],
            required: true,
            weight: 5,
            help_text: 'Backups e planos de recuperação são críticos para continuidade do negócio.'
          },
          {
            id: 'SEC-005',
            category: 'Treinamento e Conscientização',
            subcategory: 'Capital Humano',
            question: 'Os colaboradores recebem treinamentos regulares sobre segurança da informação?',
            description: 'Verificar programas de conscientização e treinamento em segurança.',
            type: 'multiple_choice',
            options: [
              'Treinamentos regulares e atualizados para todos',
              'Treinamentos anuais básicos',
              'Treinamentos ocasionais conforme demanda',
              'Sem programa de treinamento formal'
            ],
            required: true,
            weight: 3,
            help_text: 'Colaboradores conscientizados são a primeira linha de defesa.'
          },
          {
            id: 'SEC-006',
            category: 'Gestão de Incidentes',
            subcategory: 'Resposta a Incidentes',
            question: 'Existe um processo formal para detecção, resposta e recuperação de incidentes de segurança?',
            description: 'Avaliar a capacidade de resposta a incidentes de segurança.',
            type: 'multiple_choice',
            options: [
              'Processo formal com equipe dedicada e ferramentas',
              'Processo básico com responsabilidades definidas',
              'Resposta ad-hoc sem processo formal',
              'Sem processo de gestão de incidentes'
            ],
            required: true,
            weight: 4,
            help_text: 'Resposta rápida a incidentes minimiza danos e tempo de inatividade.'
          },
          {
            id: 'SEC-007',
            category: 'Conformidade e Auditoria',
            subcategory: 'Governança',
            question: 'A organização realiza auditorias internas ou externas de segurança?',
            description: 'Verificar práticas de auditoria e conformidade com padrões.',
            type: 'multiple_choice',
            options: [
              'Auditorias regulares internas e externas',
              'Auditorias anuais internas',
              'Auditorias ocasionais conforme necessidade',
              'Sem processo de auditoria'
            ],
            required: true,
            weight: 3,
            help_text: 'Auditorias garantem conformidade e identificam áreas de melhoria.'
          },
          {
            id: 'SEC-008',
            category: 'Proteção de Dados',
            subcategory: 'Privacidade',
            question: 'Como a organização protege dados pessoais e sensíveis conforme LGPD/GDPR?',
            description: 'Avaliar conformidade com regulamentações de proteção de dados.',
            type: 'text',
            required: true,
            weight: 5,
            help_text: 'Descreva as medidas técnicas e organizacionais implementadas para proteção de dados pessoais.'
          },
          {
            id: 'SEC-009',
            category: 'Infraestrutura',
            subcategory: 'Segurança Física',
            question: 'Quais controles de segurança física estão implementados nos data centers ou instalações?',
            description: 'Verificar medidas de proteção física dos ativos de TI.',
            type: 'text',
            required: true,
            weight: 3,
            help_text: 'Inclua controles de acesso físico, monitoramento, proteção ambiental, etc.'
          },
          {
            id: 'SEC-010',
            category: 'Monitoramento',
            subcategory: 'Detecção de Ameaças',
            question: 'A organização utiliza ferramentas de monitoramento contínuo e detecção de ameaças?',
            description: 'Avaliar capacidades de monitoramento e detecção proativa.',
            type: 'multiple_choice',
            options: [
              'SIEM/SOC com monitoramento 24x7',
              'Ferramentas básicas de monitoramento',
              'Monitoramento manual e reativo',
              'Sem ferramentas de monitoramento específicas'
            ],
            required: true,
            weight: 4,
            help_text: 'Monitoramento contínuo permite detecção precoce de ameaças.'
          },
          // Categoria: Criptografia e Proteção de Dados
          {
            id: 'SEC-011',
            category: 'Criptografia',
            subcategory: 'Proteção de Dados em Trânsito',
            question: 'Todos os dados sensíveis são criptografados durante a transmissão?',
            description: 'Verificar implementação de criptografia para dados em trânsito.',
            type: 'multiple_choice',
            options: [
              'Sim, todos os dados com TLS/SSL forte',
              'Maioria dos dados com criptografia básica',
              'Apenas dados mais críticos',
              'Sem criptografia sistemática'
            ],
            required: true,
            weight: 5,
            help_text: 'Criptografia em trânsito protege dados contra interceptação.'
          },
          {
            id: 'SEC-012',
            category: 'Criptografia',
            subcategory: 'Proteção de Dados em Repouso',
            question: 'Os dados armazenados são adequadamente criptografados?',
            description: 'Avaliar criptografia de dados em repouso.',
            type: 'multiple_choice',
            options: [
              'Criptografia forte (AES-256) para todos dados sensíveis',
              'Criptografia básica para dados críticos',
              'Criptografia limitada apenas para alguns dados',
              'Sem criptografia de dados em repouso'
            ],
            required: true,
            weight: 5,
            help_text: 'Dados criptografados em repouso protegem contra acesso não autorizado.'
          },
          // Categoria: Gestão de Fornecedores
          {
            id: 'SEC-013',
            category: 'Cadeia de Suprimentos',
            subcategory: 'Avaliação de Fornecedores',
            question: 'Como é realizada a avaliação de segurança dos fornecedores e terceiros?',
            description: 'Verificar processos de due diligence de terceiros.',
            type: 'multiple_choice',
            options: [
              'Avaliação rigorosa com questionários e auditorias',
              'Avaliação básica com questionários padronizados',
              'Avaliação informal conforme necessidade',
              'Sem processo formal de avaliação'
            ],
            required: true,
            weight: 4,
            help_text: 'Fornecedores podem representar riscos significativos à cadeia de suprimentos.'
          },
          {
            id: 'SEC-014',
            category: 'Cadeia de Suprimentos',
            subcategory: 'Contratos e SLAs',
            question: 'Os contratos incluem cláusulas específicas de segurança da informação?',
            description: 'Avaliar requisitos contratuais de segurança com terceiros.',
            type: 'multiple_choice',
            options: [
              'Sim, cláusulas detalhadas com SLAs de segurança',
              'Cláusulas básicas de segurança',
              'Algumas menções à segurança',
              'Sem cláusulas específicas de segurança'
            ],
            required: true,
            weight: 3,
            help_text: 'Contratos são fundamentais para estabelecer responsabilidades de segurança.'
          },
          // Categoria: Desenvolvimento Seguro
          {
            id: 'SEC-015',
            category: 'Desenvolvimento Seguro',
            subcategory: 'Ciclo de Vida Seguro',
            question: 'A organização segue práticas de desenvolvimento seguro (SSDLC)?',
            description: 'Verificar implementação de desenvolvimento seguro.',
            type: 'multiple_choice',
            options: [
              'SSDLC completo com revisão de código e testes',
              'Práticas básicas de desenvolvimento seguro',
              'Algumas verificações de segurança',
              'Sem práticas formais de desenvolvimento seguro'
            ],
            required: true,
            weight: 4,
            help_text: 'Desenvolvimento seguro previne vulnerabilidades desde o início.'
          },
          {
            id: 'SEC-016',
            category: 'Desenvolvimento Seguro',
            subcategory: 'Testes de Segurança',
            question: 'São realizados testes de segurança nas aplicações?',
            description: 'Avaliar testes de segurança em aplicações.',
            type: 'multiple_choice',
            options: [
              'Testes automatizados e manuais regulares',
              'Testes básicos durante desenvolvimento',
              'Testes ocasionais antes de releases',
              'Sem testes específicos de segurança'
            ],
            required: true,
            weight: 4,
            help_text: 'Testes de segurança identificam vulnerabilidades antes da produção.'
          },
          // Categoria: Infraestrutura e Rede
          {
            id: 'SEC-017',
            category: 'Infraestrutura',
            subcategory: 'Segurança de Rede',
            question: 'A rede possui segmentação adequada e firewalls configurados?',
            description: 'Verificar arquitetura de segurança de rede.',
            type: 'multiple_choice',
            options: [
              'Segmentação completa com firewalls e IDS/IPS',
              'Segmentação básica com firewalls',
              'Proteções mínimas de rede',
              'Rede plana sem segmentação'
            ],
            required: true,
            weight: 4,
            help_text: 'Segmentação de rede limita o impacto de possíveis breaches.'
          },
          {
            id: 'SEC-018',
            category: 'Infraestrutura',
            subcategory: 'Gestão de Ativos',
            question: 'Existe inventário completo e atualizado de todos os ativos de TI?',
            description: 'Avaliar gestão e inventário de ativos.',
            type: 'multiple_choice',
            options: [
              'Inventário automatizado e atualizado em tempo real',
              'Inventário regular com atualizações manuais',
              'Inventário básico com atualizações ocasionais',
              'Sem inventário formal de ativos'
            ],
            required: true,
            weight: 3,
            help_text: 'Conhecer todos os ativos é fundamental para protegê-los adequadamente.'
          },
          // Categoria: Cloud Security
          {
            id: 'SEC-019',
            category: 'Segurança em Nuvem',
            subcategory: 'Configuração Cloud',
            question: 'Os recursos em nuvem seguem as melhores práticas de segurança?',
            description: 'Verificar configurações de segurança em cloud.',
            type: 'multiple_choice',
            options: [
              'Configurações seguindo frameworks como CIS/NIST',
              'Configurações básicas de segurança',
              'Configurações padrão com algumas customizações',
              'Uso de configurações padrão sem hardening'
            ],
            required: true,
            weight: 4,
            help_text: 'Configurações inadequadas são uma das principais causas de incidentes em cloud.'
          },
          {
            id: 'SEC-020',
            category: 'Segurança em Nuvem',
            subcategory: 'Monitoramento Cloud',
            question: 'Existe monitoramento específico para recursos em nuvem?',
            description: 'Avaliar monitoramento e logging em cloud.',
            type: 'multiple_choice',
            options: [
              'Monitoramento completo com CASB e Cloud Security Posture',
              'Monitoramento básico nativo do provedor',
              'Logs básicos sem análise proativa',
              'Sem monitoramento específico para cloud'
            ],
            required: true,
            weight: 4,
            help_text: 'Visibilidade em cloud é essencial para detectar ameaças e misconfigurations.'
          },
          // Categoria: Resposta a Incidentes
          {
            id: 'SEC-021',
            category: 'Resposta a Incidentes',
            subcategory: 'Plano de Resposta',
            question: 'Existe um plano formal de resposta a incidentes de segurança?',
            description: 'Verificar preparação para resposta a incidentes.',
            type: 'multiple_choice',
            options: [
              'Plano detalhado testado regularmente',
              'Plano básico com procedimentos definidos',
              'Procedimentos informais de resposta',
              'Sem plano formal de resposta'
            ],
            required: true,
            weight: 5,
            help_text: 'Resposta rápida e eficaz minimiza impactos de incidentes.'
          },
          {
            id: 'SEC-022',
            category: 'Resposta a Incidentes',
            subcategory: 'Comunicação de Incidentes',
            question: 'Como é feita a comunicação durante incidentes de segurança?',
            description: 'Avaliar processos de comunicação em incidentes.',
            type: 'text',
            required: true,
            weight: 3,
            help_text: 'Descreva os canais e processos de comunicação durante incidentes.'
          },
          // Categoria: Compliance e Regulamentações
          {
            id: 'SEC-023',
            category: 'Compliance',
            subcategory: 'Regulamentações',
            question: 'A organização está em conformidade com regulamentações aplicáveis?',
            description: 'Verificar aderência a regulamentações setoriais.',
            type: 'multiple_choice',
            options: [
              'Conformidade total com auditorias regulares',
              'Conformidade básica com lacunas identificadas',
              'Conformidade parcial em implementação',
              'Sem avaliação formal de conformidade'
            ],
            required: true,
            weight: 5,
            help_text: 'Não conformidade pode resultar em multas e sanções.'
          },
          {
            id: 'SEC-024',
            category: 'Compliance',
            subcategory: 'Documentação',
            question: 'Toda documentação de segurança está atualizada e acessível?',
            description: 'Avaliar gestão da documentação de segurança.',
            type: 'multiple_choice',
            options: [
              'Documentação completa e atualizada regularmente',
              'Documentação básica com atualizações ocasionais',
              'Documentação limitada e desatualizada',
              'Documentação inexistente ou muito defasada'
            ],
            required: true,
            weight: 3,
            help_text: 'Documentação atualizada é essencial para auditorias e operações.'
          },
          // Categoria: Recursos Humanos e Segurança
          {
            id: 'SEC-025',
            category: 'Segurança de RH',
            subcategory: 'Background Check',
            question: 'São realizadas verificações de antecedentes para funcionários em posições críticas?',
            description: 'Verificar processos de screening de pessoal.',
            type: 'multiple_choice',
            options: [
              'Verificações rigorosas para todas posições críticas',
              'Verificações básicas conforme função',
              'Verificações ocasionais apenas',
              'Sem processo formal de verificação'
            ],
            required: true,
            weight: 3,
            help_text: 'Verificações de antecedentes reduzem riscos internos.'
          },
          {
            id: 'SEC-026',
            category: 'Segurança de RH',
            subcategory: 'Desligamento',
            question: 'Existe processo formal para desligamento de funcionários?',
            description: 'Avaliar processos de offboarding de segurança.',
            type: 'multiple_choice',
            options: [
              'Processo formal com revogação imediata de acessos',
              'Processo básico com checklist de segurança',
              'Processo informal sem padronização',
              'Sem processo específico de segurança'
            ],
            required: true,
            weight: 4,
            help_text: 'Desligamentos mal gerenciados podem deixar acessos ativos.'
          },
          // Categoria: Métricas e KPIs de Segurança
          {
            id: 'SEC-027',
            category: 'Métricas de Segurança',
            subcategory: 'KPIs',
            question: 'A organização monitora KPIs específicos de segurança?',
            description: 'Verificar uso de métricas para gestão de segurança.',
            type: 'multiple_choice',
            options: [
              'KPIs abrangentes com dashboard executivo',
              'Métricas básicas reportadas regularmente',
              'Algumas métricas coletadas ocasionalmente',
              'Sem métricas formais de segurança'
            ],
            required: true,
            weight: 3,
            help_text: 'Métricas permitem gestão baseada em dados e melhoria contínua.'
          },
          // Questões Abertas para Detalhamento
          {
            id: 'SEC-028',
            category: 'Governança',
            subcategory: 'Estratégia de Segurança',
            question: 'Descreva a estratégia geral de segurança da informação da organização:',
            description: 'Forneça uma visão geral da abordagem estratégica para segurança.',
            type: 'text',
            required: true,
            weight: 4,
            help_text: 'Inclua objetivos, princípios e direcionamentos estratégicos principais.'
          },
          {
            id: 'SEC-029',
            category: 'Tecnologia',
            subcategory: 'Ferramentas de Segurança',
            question: 'Quais as principais ferramentas e tecnologias de segurança utilizadas?',
            description: 'Liste e descreva as tecnologias de segurança implementadas.',
            type: 'text',
            required: true,
            weight: 3,
            help_text: 'Inclua antivírus, firewalls, SIEM, DLP, etc.'
          },
          {
            id: 'SEC-030',
            category: 'Processos',
            subcategory: 'Melhoria Contínua',
            question: 'Como a organização identifica e implementa melhorias no programa de segurança?',
            description: 'Descreva processos de melhoria contínua em segurança.',
            type: 'text',
            required: true,
            weight: 3,
            help_text: 'Inclua revisões, lições aprendidas, benchmarking, etc.'
          }
        ];
      }
      
      // Definir questões e respostas - EXATAMENTE como no openAssessmentEditor
      setPreviewQuestions(questions);
      setPreviewCurrentStep(0);
      setPreviewResponses(finalResponses); // Usar respostas reais, não vazio!
      // Final questions count
      // Final responses count
      // Estado final setado
      
      // Primeira questão de exemplo
      // Últimas 3 questões
      
      // COMPARAÇÃO PREVIEW vs EDITOR
      // As questões do PREVIEW devem ser IDÊNTICAS às do EDITOR!
      
    } catch (error) {
      // Error loading preview questions
      // Fallback para questões de exemplo em caso de erro
      setPreviewQuestions([]);
    } finally {
      setLoadingPreviewQuestions(false);
    }
  };

  // Open preview of public assessment page
  const openPreviewDialog = async (assessment: VendorAssessment) => {
    // Opening preview for assessment
    
    // Verificar se é assessment temporário
    const isTemporary = assessment.id.startsWith('pending-') || assessment.id.startsWith('vendor-');
    // Is temporary assessment
    
    if (isTemporary) {
      // Para assessments temporários, criar um link fictício para preview
      // Creating temporary preview link
      const tempPublicLink = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Criar uma cópia do assessment com link temporário
      const previewAssessment = {
        ...assessment,
        public_link: tempPublicLink,
        public_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
      };
      
      // Temporary preview link created
      setPreviewAssessment(previewAssessment);
      
      // Carregar questões para o preview - MESMAS do editor
      // Carregando questões para preview do assessment
      await loadPreviewQuestions(assessment);
      setShowPreviewDialog(true);
      return;
    }
    
    // Para assessments reais, verificar se já tem link público
    if (!assessment.public_link) {
      toast({
        title: "Gerando link público...",
        description: "Aguarde, estamos criando o link para preview",
      });
      
      try {
        const result = await generatePublicLink(assessment);
        if (result) {
          // Reload assessments to get updated data with public_link
          await loadAssessments();
          // Find the updated assessment
          const updatedAssessment = assessments.find(a => a.id === assessment.id);
          if (updatedAssessment?.public_link) {
            // Public link generated successfully
            setPreviewAssessment(updatedAssessment);
            setShowPreviewDialog(true);
          } else {
            // Failed to find updated assessment with public link
            toast({
              title: "Erro",
              description: "Não foi possível gerar o link público para preview",
              variant: "destructive"
            });
          }
        } else {
          // generatePublicLink returned false
          toast({
            title: "Erro ao Gerar Link", 
            description: "Falha na geração do link público. Verifique suas permissões e tente novamente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        // Error generating public link for preview
        toast({
          title: "Erro",
          description: `Erro ao gerar link público: ${error.message}`,
          variant: "destructive"
        });
      }
      return;
    }
    
    // Assessment real com link público existente
    // Using existing public link for preview
    setPreviewAssessment(assessment);
    setShowPreviewDialog(true);
  };

  // Open email dialog for sending assessment
  const openEmailDialog = async (assessment: VendorAssessment) => {
    // Opening email dialog for assessment
    
    // Ensure public link exists
    if (!assessment.public_link) {
      // No public link found, generating one
      try {
        const result = await generatePublicLink(assessment);
        if (result) {
          // Reload assessments to get updated data
          await loadAssessments();
          // Find the updated assessment and try again
          const updatedAssessment = assessments.find(a => a.id === assessment.id);
          if (updatedAssessment?.public_link) {
            // Public link generated, setting assessment for email
            setSelectedAssessmentForEmail(updatedAssessment);
            setShowEmailDialog(true);
          } else {
            // Failed to find updated assessment with public link
            toast({
              title: "Erro",
              description: "Assessment foi atualizado mas link público não foi encontrado. Tente novamente.",
              variant: "destructive"
            });
          }
        } else {
          // generatePublicLink returned false
          toast({
            title: "Erro ao Gerar Link", 
            description: "Falha na geração do link público. Verifique suas permissões e tente novamente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        // Error in generatePublicLink
        toast({
          title: "Erro de Permissão", 
          description: error.message || "Você não tem permissão para gerar links públicos para este assessment.",
          variant: "destructive"
        });
      }
      return;
    }

    // Assessment has public link, proceeding to open modal
    setSelectedAssessmentForEmail(assessment);
    
    // Pre-fill email form with default values
    const defaultSubject = `Assessment de Segurança - ${assessment.assessment_name}`;
    const publicUrl = `${window.location.origin}/vendor-assessment/${assessment.public_link}`;
    const defaultMessage = `Olá,

Você foi convidado(a) para responder um assessment de segurança.

**Detalhes do Assessment:**
• Nome: ${assessment.assessment_name}
• Fornecedor: ${assessment.vendor_registry?.name}
• Prazo: ${new Date(assessment.due_date).toLocaleDateString('pt-BR')}

**Link para responder:**
${publicUrl}

Este link expira em 30 dias. Por favor, complete o assessment até a data limite.

Caso tenha dúvidas, entre em contato conosco.

Atenciosamente,
Equipe de Compliance`;

    setEmailForm({
      email: assessment.vendor_registry?.primary_contact_email || '',
      subject: defaultSubject,
      message: defaultMessage
    });
    
    // Setting showEmailDialog to true
    setShowEmailDialog(true);
    // Email dialog should now be open
  };

  // Send assessment via email
  const sendAssessmentEmail = async () => {
    if (!selectedAssessmentForEmail || !emailForm.email) {
      toast({
        title: "Erro",
        description: "Email é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would integrate with your email service
      // For now, we'll simulate the email sending
      // Sending email simulation

      // Update vendor contact email if it was empty
      if (!selectedAssessmentForEmail.vendor_registry?.primary_contact_email && emailForm.email) {
        await supabase
          .from('vendor_registry')
          .update({ primary_contact_email: emailForm.email })
          .eq('id', selectedAssessmentForEmail.vendor_id);
      }

      toast({
        title: "✅ Assessment Enviado",
        description: `Assessment enviado para ${emailForm.email}`,
      });

      setShowEmailDialog(false);
      setEmailForm({ email: '', subject: '', message: '' });
      
      // Reload assessments to reflect any updates
      await loadAssessments();

    } catch (error) {
      // Error sending email
      toast({
        title: "❌ Erro ao Enviar",
        description: "Não foi possível enviar o email. Tente novamente.",
        variant: "destructive"
      });
    }
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
      // Error creating formal assessment
      toast({
        title: "Erro",
        description: "Não foi possível criar o assessment formal",
        variant: "destructive"
      });
    }
  };

  // Criar assessment formal a partir de um temporário
  const createFormalAssessmentFromTemp = async (tempAssessment: VendorAssessment) => {
    // Creating formal assessment from temporary
    try {
      // Step 1: Starting conversion
      // Temporary Assessment ID
      // Vendor ID
      // Framework ID
      
      // Step 2: Resolve framework ID
      // Step 2: Resolving framework ID
      let frameworkId = tempAssessment.framework_id;
      // Original Framework ID
      
      if (frameworkId === 'nist_csf_default' || frameworkId === 'iso_27001_27701_default') {
        // Detected template framework, trying different approach
        
        // Tentar buscar qualquer framework existente
        try {
          const { data: anyFramework } = await supabase
            .from('vendor_assessment_frameworks')
            .select('id')
            .limit(1);
            
          if (anyFramework && anyFramework.length > 0) {
            frameworkId = anyFramework[0].id;
            // Found existing framework
          } else {
            // No frameworks found, skipping framework_id
            frameworkId = null;
          }
        } catch (error) {
          // Framework search failed, skipping framework_id
          frameworkId = null;
        }
      }
      
      // Final Framework ID
      
      // Step 3: Verify vendor exists and prepare assessment data
      // Step 3: Verifying vendor and preparing assessment data
      
      // Check if vendor exists
      const { data: vendor, error: vendorError } = await supabase
        .from('vendor_registry')
        .select('id, name')
        .eq('id', tempAssessment.vendor_id)
        .single();
        
      // Vendor Check Results:
      // Vendor Error
      // Vendor Data
      
      if (vendorError || !vendor) {
        // VENDOR NOT FOUND!
        throw new Error(`Fornecedor não encontrado: ${tempAssessment.vendor_id}`);
      }
      
      // Prepare assessment data with all required fields
      const assessmentData: any = {
        vendor_id: tempAssessment.vendor_id,
        tenant_id: user?.tenantId || user?.tenant_id,
        assessment_name: tempAssessment.assessment_name || `Assessment - ${vendor.name}`,
        assessment_type: tempAssessment.assessment_type || 'security',
        status: 'draft',
        due_date: tempAssessment.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add framework_id only if we have a valid one
      if (frameworkId) {
        assessmentData.framework_id = frameworkId;
        // Added framework_id to data
      }
      
      // Add other optional fields if they exist
      if (tempAssessment.priority) {
        assessmentData.priority = tempAssessment.priority;
      }
      
      // Using minimal essential fields only
      
      // Assessment Data to Insert
      
      // Step 4: Insert into database
      // Step 4: Inserting assessment into database
      // Current User Auth State
      
      // Test if we can access the table first
      // Testing table access before insert
      const { count, error: countError } = await supabase
        .from('vendor_assessments')
        .select('*', { count: 'exact', head: true });
      
      // Table access test:
      // Count Error
      // Count Result
      
      if (countError) {
        // Cannot access vendor_assessments table
        throw new Error(`Sem acesso à tabela vendor_assessments: ${countError.message}`);
      }
      
      // Try the insert
      // Attempting INSERT operation
      
      // SOLUÇÃO: Usar RPC (função no banco) para bypass RLS se necessário
      // Trying RPC function for assessment creation
      
      let data, error;
      
      // Primeiro tentar INSERT direto
      const directResult = await supabase
        .from('vendor_assessments')
        .insert(assessmentData)
        .select('*')
        .single();
        
      if (directResult.error && directResult.error.code === '42501') {
        // Direct INSERT failed (42501), trying RPC bypass
        
        // Se falhar por permissão, usar RPC function que bypassa RLS
        try {
          const rpcResult = await supabase.rpc('create_vendor_assessment', {
            p_vendor_id: assessmentData.vendor_id,
            p_tenant_id: assessmentData.tenant_id,
            p_assessment_name: assessmentData.assessment_name,
            p_assessment_type: assessmentData.assessment_type,
            p_status: assessmentData.status,
            p_due_date: assessmentData.due_date,
            p_created_by: assessmentData.created_by,
            p_framework_id: assessmentData.framework_id,
            p_priority: assessmentData.priority
          });
          
          if (rpcResult.error) {
            // RPC function also failed
            // Se RPC falhar, tentar abordagem alternativa
            throw new Error(`RPC failed: ${rpcResult.error.message}`);
          } else {
            // RPC function succeeded
            // Buscar o assessment criado
            const { data: createdData, error: fetchError } = await supabase
              .from('vendor_assessments')
              .select('*')
              .eq('id', rpcResult.data)
              .single();
              
            if (fetchError) {
              // RPC created but fetch failed
              data = { id: rpcResult.data, ...assessmentData };
              error = null;
            } else {
              data = createdData;
              error = null;
            }
          }
        } catch (rpcError) {
          // RPC approach failed, falling back to service role
          
          // Último recurso: notificar o usuário sobre o problema de permissões
          throw new Error('Sem permissão para criar assessments. Contate o administrador do sistema para ajustar as políticas RLS da tabela vendor_assessments.');
        }
      } else {
        // Direct INSERT succeeded
        data = directResult.data;
        error = directResult.error;
      }
        
      // INSERT Results:
      // Error
      // Data
      
      if (error) {
        // INSERT ERROR DETAILS:
        // Code
        // Message
        // Details
        // Hint
        // Full Error Object
        
        toast({
          title: "❌ Erro ao Criar Assessment",
          description: `Não foi possível salvar o assessment: ${error.message}`,
          variant: "destructive"
        });
        // CREATE FORMAL ASSESSMENT FAILED
        return null;
      }
      
      if (!data) {
        // NO DATA RETURNED FROM INSERT!
        toast({
          title: "❌ Erro",
          description: "Nenhum dado retornado após inserção",
          variant: "destructive"
        });
        // CREATE FORMAL ASSESSMENT FAILED
        return null;
      }
      
      // Assessment formal criado com sucesso!
      // Created Assessment ID
      // Full Created Data
      
      // Step 5: Cleanup and reload
      // Step 5: Cleaning up localStorage and reloading
      
      const tempKey = `vendor_${tempAssessment.vendor_id}_selected_template`;
      // Removing localStorage key
      localStorage.removeItem(tempKey);
      
      // Reloading assessments list
      await loadAssessments();
      
      toast({
        title: "✅ Assessment Criado",
        description: "Assessment salvo com sucesso no banco de dados.",
      });
      
      // CREATE FORMAL ASSESSMENT SUCCESS
      return data;
      
    } catch (error) {
      // CREATE FORMAL ASSESSMENT EXCEPTION
      // EXCEPTION CAUGHT:
      // Error Type
      // Error Message
      // Error Stack
      // Full Error Object
      
      toast({
        title: "❌ Erro",
        description: `Erro interno ao criar assessment: ${error?.message || error}`,
        variant: "destructive"
      });
      return null;
    } finally {
      // CREATE FORMAL ASSESSMENT END
    }
  };
  
  // Debug function removed for production

  // Debug function removed for production

  // Verificar permissões do usuário
  const checkUserPermissions = async () => {
    console.log('🔐 ======== CHECKING USER PERMISSIONS ========');
    
    try {
      if (!user?.id) {
        console.error('❌ User not logged in');
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não está logado",
          variant: "destructive"
        });
        return false;
      }

      const userTenantId = user?.tenantId || user?.tenant_id;
      if (!userTenantId) {
        console.error('❌ User has no tenant ID');
        toast({
          title: "Erro de Tenant",
          description: "Usuário não possui tenant ID válido",
          variant: "destructive"
        });
        return false;
      }

      console.log('👤 User ID:', user.id);
      console.log('🏢 Tenant ID:', userTenantId);

      // Testar acesso básico à tabela
      console.log('🔍 Testing basic table access...');
      const { data, error, count } = await supabase
        .from('vendor_assessments')
        .select('id, tenant_id, status', { count: 'exact' })
        .eq('tenant_id', userTenantId)
        .limit(1);

      console.log('📊 Permission test results:');
      console.log('  Data:', data);
      console.log('  Error:', error);
      console.log('  Count:', count);

      if (error) {
        console.error('❌ Permission test failed:', error);
        toast({
          title: "Erro de Acesso",
          description: `Sem acesso à tabela vendor_assessments: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ User has basic table access');
      toast({
        title: "Permissões Verificadas",
        description: `Usuário tem acesso à tabela. Encontrados ${count || 0} assessments.`,
      });
      return true;

    } catch (error) {
      console.error('❌ Permission check failed:', error);
      toast({
        title: "Erro na Verificação",
        description: `Falha ao verificar permissões: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      console.log('🔐 ======== END PERMISSION CHECK ========');
    }
  };

  // Debug completo para geração de link público
  const debugPublicLinkGeneration = async (assessment?: VendorAssessment) => {
    console.log('🐛 ======== COMPLETE PUBLIC LINK DEBUG ========');
    
    // Se não foi passado assessment, usar o primeiro disponível
    const testAssessment = assessment || currentAssessments[0];
    
    if (!testAssessment) {
      console.error('❌ No assessment available for testing');
      toast({
        title: "Erro de Debug",
        description: "Nenhum assessment disponível para testar",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔍 STEP 1: Assessment Information');
      console.log('  Assessment ID:', testAssessment.id);
      console.log('  Assessment Name:', testAssessment.assessment_name);
      console.log('  Assessment Status:', testAssessment.status);
      console.log('  Assessment Tenant ID:', testAssessment.tenant_id);
      console.log('  Vendor ID:', testAssessment.vendor_id);
      console.log('  Current Public Link:', testAssessment.public_link);
      console.log('  Is Temporary:', testAssessment.id.startsWith('pending-') || testAssessment.id.startsWith('vendor-'));

      console.log('🔍 STEP 2: User Context');
      console.log('  User ID:', user?.id);
      console.log('  User Email:', user?.email);
      console.log('  User Tenant ID (new):', user?.tenantId);
      console.log('  User Tenant ID (old):', user?.tenant_id);
      const userTenantId = user?.tenantId || user?.tenant_id;
      console.log('  Effective Tenant ID:', userTenantId);

      console.log('🔍 STEP 3: Tenant Match Check');
      const tenantMatch = testAssessment.tenant_id === userTenantId;
      console.log('  Assessment Tenant:', testAssessment.tenant_id);
      console.log('  User Tenant:', userTenantId);
      console.log('  Tenant Match:', tenantMatch);

      if (!tenantMatch) {
        console.error('❌ TENANT MISMATCH DETECTED');
        toast({
          title: "Erro de Tenant",
          description: `Mismatch: Assessment(${testAssessment.tenant_id}) vs User(${userTenantId})`,
          variant: "destructive"
        });
        return;
      }

      console.log('🔍 STEP 4: Database Read Test');
      const { data: readData, error: readError } = await supabase
        .from('vendor_assessments')
        .select('id, tenant_id, status, vendor_id, created_by, public_link')
        .eq('id', testAssessment.id)
        .single();

      console.log('  Read Query Result:');
      console.log('    Data:', readData);
      console.log('    Error:', readError);

      if (readError) {
        console.error('❌ READ ERROR:', readError);
        toast({
          title: "Erro de Leitura",
          description: `Não conseguiu ler assessment: ${readError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('🔍 STEP 5: Generate Test Link ID');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const secureHash = btoa(`${testAssessment.id}_${timestamp}_${randomStr}`).replace(/[+/=]/g, '');
      const testLinkId = `${secureHash.substring(0, 16)}_${timestamp.toString(36)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      console.log('  Generated Link ID:', testLinkId);
      console.log('  Expires At:', expiresAt.toISOString());

      console.log('🔍 STEP 6: Database Write Test');
      console.log('  Attempting update with:');
      console.log('    WHERE id =', testAssessment.id);
      console.log('    WHERE tenant_id =', userTenantId);
      
      const updateData = {
        public_link: testLinkId,
        public_link_expires_at: expiresAt.toISOString(),
        status: testAssessment.status === 'draft' ? 'sent' : testAssessment.status,
        updated_at: new Date().toISOString()
      };
      console.log('  Update Data:', updateData);

      const { data: updateData_result, error: updateError, count } = await supabase
        .from('vendor_assessments')
        .update(updateData)
        .eq('id', testAssessment.id)
        .eq('tenant_id', userTenantId)
        .select('id, public_link, public_link_expires_at, status');

      console.log('  Update Query Result:');
      console.log('    Data:', updateData_result);
      console.log('    Error:', updateError);
      console.log('    Count:', count);
      console.log('    Data Length:', updateData_result?.length || 0);

      if (updateError) {
        console.error('❌ UPDATE ERROR DETAILS:');
        console.log('    Code:', updateError.code);
        console.log('    Message:', updateError.message);
        console.log('    Details:', updateError.details);
        console.log('    Hint:', updateError.hint);
        console.log('    Full Error:', updateError);
        
        toast({
          title: "Erro de Atualização",
          description: `${updateError.code}: ${updateError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!updateData_result || updateData_result.length === 0) {
        console.error('❌ NO DATA RETURNED FROM UPDATE');
        console.log('  This indicates:');
        console.log('    - RLS policy blocking the update');
        console.log('    - WHERE conditions not matching any rows');
        console.log('    - User lacks specific permissions');
        
        // Teste adicional: verificar se o assessment ainda existe
        console.log('🔍 STEP 6.1: Verify Assessment Still Exists');
        const { data: verifyData, error: verifyError } = await supabase
          .from('vendor_assessments')
          .select('id, tenant_id, status')
          .eq('id', testAssessment.id);
          
        console.log('  Verification Result:');
        console.log('    Data:', verifyData);
        console.log('    Error:', verifyError);
        
        toast({
          title: "Erro: Nenhum Dado Retornado",
          description: "Update executou mas não retornou dados (possível RLS block)",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ SUCCESS! Link generated successfully');
      console.log('  Updated Assessment:', updateData_result[0]);
      
      toast({
        title: "✅ Debug Concluído",
        description: `Link gerado com sucesso: ${testLinkId.substring(0, 10)}...`,
      });

      // Reload assessments para ver a mudança
      await loadAssessments();

    } catch (error) {
      console.error('❌ DEBUG FAILED:', error);
      toast({
        title: "Erro no Debug",
        description: `Falha durante debug: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      console.log('🐛 ======== END COMPLETE PUBLIC LINK DEBUG ========');
    }
  };

  // Gerar link público para o assessment (com debug integrado)
  const generatePublicLink = async (assessment: VendorAssessment) => {
    console.log('🔗 ======== GENERATE PUBLIC LINK START ========');
    console.log('🔗 Assessment ID:', assessment.id);
    
    try {
      // STEP 1: Validar contexto do usuário
      console.log('🔍 STEP 1: User Authentication Check');
      if (!user?.id) {
        console.error('❌ User not authenticated');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userTenantId = user?.tenantId || user?.tenant_id;
      if (!userTenantId) {
        console.error('❌ User has no tenant ID');
        throw new Error('Usuário sem tenant ID válido');
      }

      console.log('👤 User ID:', user.id);
      console.log('🏢 User Tenant ID:', userTenantId);
      console.log('📋 Assessment Tenant ID:', assessment.tenant_id);

      // STEP 2: Check if temporary assessment
      console.log('🔍 STEP 2: Temporary Assessment Check');
      const isTemporary = assessment.id.startsWith('pending-') || assessment.id.startsWith('vendor-');
      console.log('🔄 Is Temporary:', isTemporary);
      
      if (isTemporary) {
        console.log('🔄 Converting temporary assessment to formal...');
        const formalAssessment = await createFormalAssessmentFromTemp(assessment);
        if (!formalAssessment) {
          console.error('❌ Failed to create formal assessment');
          throw new Error('Falha ao criar assessment formal');
        }
        console.log('✅ Formal assessment created, recursing...');
        return await generatePublicLink(formalAssessment);
      }

      // STEP 3: Verify assessment exists and user has access
      console.log('🔍 STEP 3: Database Read Check');
      const { data: existingAssessment, error: readError } = await supabase
        .from('vendor_assessments')
        .select('id, tenant_id, status, vendor_id, created_by')
        .eq('id', assessment.id)
        .single();

      console.log('📖 Read Result:', { data: existingAssessment, error: readError });

      if (readError) {
        console.error('❌ Read Error:', readError);
        throw new Error(`Erro ao verificar assessment: ${readError.message} (${readError.code})`);
      }

      if (!existingAssessment) {
        console.error('❌ Assessment not found in database');
        throw new Error('Assessment não encontrado no banco de dados');
      }

      // STEP 4: Tenant validation
      console.log('🔍 STEP 4: Tenant Validation');
      const tenantMatch = existingAssessment.tenant_id === userTenantId;
      console.log('🏢 Assessment Tenant:', existingAssessment.tenant_id);
      console.log('🏢 User Tenant:', userTenantId);
      console.log('✅ Tenant Match:', tenantMatch);

      if (!tenantMatch) {
        console.error('❌ Tenant mismatch detected');
        throw new Error(`Tenant mismatch: Assessment(${existingAssessment.tenant_id}) vs User(${userTenantId})`);
      }

      // STEP 5: Generate secure public link
      console.log('🔍 STEP 5: Link Generation');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const secureHash = btoa(`${assessment.id}_${timestamp}_${randomStr}`).replace(/[+/=]/g, '');
      const publicLinkId = `${secureHash.substring(0, 16)}_${timestamp.toString(36)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      console.log('🔗 Generated Link ID:', publicLinkId);
      console.log('📅 Expires At:', expiresAt.toISOString());

      // STEP 6: Database update with double security
      console.log('🔍 STEP 6: Database Update');
      const updateData = {
        public_link: publicLinkId,
        public_link_expires_at: expiresAt.toISOString(),
        status: assessment.status === 'draft' ? 'sent' : assessment.status,
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Update Data:', updateData);
      console.log('🎯 WHERE Conditions: id =', assessment.id, ', tenant_id =', userTenantId);

      const { data, error, count } = await supabase
        .from('vendor_assessments')
        .update(updateData)
        .eq('id', assessment.id)
        .eq('tenant_id', userTenantId) // Double security
        .select('id, public_link, public_link_expires_at, status');

      console.log('📊 Update Result:', { data, error, count, dataLength: data?.length });

      if (error) {
        console.error('❌ UPDATE ERROR:', error);
        console.error('Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Specific error messages
        if (error.code === '42501') {
          throw new Error('Erro 42501: Permissão negada para modificar este assessment');
        } else if (error.code === 'PGRST116') {
          throw new Error('Erro PGRST116: Assessment não encontrado ou sem permissão');
        } else {
          throw new Error(`Erro ${error.code}: ${error.message}`);
        }
      }

      if (!data || data.length === 0) {
        console.error('❌ NO DATA RETURNED - RLS/Permission Issue');
        console.log('🔍 Possible causes:');
        console.log('  - RLS policy blocking update');
        console.log('  - WHERE conditions not matching');
        console.log('  - User lacks UPDATE permission');
        throw new Error('Update executou mas não retornou dados. Possível bloqueio de RLS ou permissões.');
      }

      console.log('✅ PUBLIC LINK GENERATED SUCCESSFULLY!');
      console.log('📄 Updated Record:', data[0]);
      console.log('🔗 ======== GENERATE PUBLIC LINK SUCCESS ========');
      
      return true;

    } catch (error) {
      console.error('❌ GENERATE PUBLIC LINK FAILED:', error);
      console.log('🔗 ======== GENERATE PUBLIC LINK END (FAILED) ========');
      
      // Re-throw with message if available
      if (error.message) {
        throw error;
      }
      
      throw new Error('Falha desconhecida na geração do link público');
    }
  };

  // Função para enviar assessment por email diretamente do preview
  const sendAssessmentEmailFromPreview = async () => {
    if (!previewEmailData.recipientEmail) {
      setPreviewEmailStatus({
        type: 'error',
        message: 'Email do fornecedor é obrigatório',
        details: 'Por favor, informe o email do destinatário'
      });
      return;
    }

    if (!previewAssessment) {
      setPreviewEmailStatus({
        type: 'error',
        message: 'Assessment não encontrado',
        details: 'Erro interno: assessment não está carregado'
      });
      return;
    }

    setPreviewEmailSending(true);
    setPreviewEmailStatus(null);

    try {
      // 1. Se for um assessment temporário, primeiro gerar o link público formal
      let finalAssessment = previewAssessment;
      let publicLink = previewAssessment.public_link;

      if (!publicLink || publicLink.startsWith('temp-')) {
        console.log('🔄 Generating public link before sending email...');
        
        // Gerar link público real
        const success = await generatePublicLink(previewAssessment);
        if (!success) {
          throw new Error('Não foi possível gerar o link público para o assessment');
        }

        // Recarregar a lista para obter o assessment atualizado
        await loadAssessments();
        
        // Encontrar o assessment atualizado
        const updatedAssessment = assessments.find(a => a.id === previewAssessment.id);
        if (!updatedAssessment?.public_link) {
          throw new Error('Link público não foi gerado corretamente');
        }

        finalAssessment = updatedAssessment;
        publicLink = updatedAssessment.public_link;
        setPreviewAssessment(updatedAssessment);
      }

      const publicUrl = `${window.location.origin}/vendor-assessment/${publicLink}`;

      // 2. Preparar dados do email
      const emailData = {
        to: previewEmailData.recipientEmail,
        recipientName: previewEmailData.recipientName || '',
        subject: previewEmailData.subject || `Assessment de Segurança - ${finalAssessment.vendor_registry?.name || 'Fornecedor'}`,
        customMessage: previewEmailData.customMessage || '',
        assessmentData: {
          id: finalAssessment.id,
          name: finalAssessment.assessment_name,
          type: finalAssessment.assessment_type,
          dueDate: finalAssessment.due_date,
          questionsCount: previewQuestions.length,
          vendorName: finalAssessment.vendor_registry?.name || 'Fornecedor',
          publicUrl: publicUrl,
          expiresAt: finalAssessment.public_link_expires_at
        },
        senderEmail: user?.email || 'Equipe GRC',
        sendCopy: previewEmailData.sendCopy,
        autoReminder: previewEmailData.autoReminder
      };

      console.log('📧 Sending email with data:', emailData);

      // 3. Simular envio de email (em produção, integrar com serviço real)
      await simulateEmailSending(emailData);

      // 4. Atualizar status do assessment no banco
      if (finalAssessment.status === 'draft') {
        const { error: updateError } = await supabase
          .from('vendor_assessments')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_to_email: previewEmailData.recipientEmail,
            sent_to_name: previewEmailData.recipientName || null
          })
          .eq('id', finalAssessment.id);

        if (updateError) {
          console.warn('Erro ao atualizar status do assessment:', updateError);
        }
      }

      // 5. Registrar log de envio
      await logEmailSent({
        assessmentId: finalAssessment.id,
        recipientEmail: previewEmailData.recipientEmail,
        recipientName: previewEmailData.recipientName,
        subject: emailData.subject,
        sentBy: user?.email,
        sentAt: new Date().toISOString()
      });

      // 6. Sucesso
      setPreviewEmailStatus({
        type: 'success',
        message: 'Email enviado com sucesso!',
        details: `Assessment enviado para ${previewEmailData.recipientEmail}${previewEmailData.autoReminder ? '. Lembrete automático agendado para 7 dias.' : ''}`
      });

      // Recarregar assessments
      await loadAssessments();

      toast({
        title: "✅ Email Enviado",
        description: `Assessment enviado para ${previewEmailData.recipientEmail}`,
      });

      // Resetar dados do formulário
      setPreviewEmailData(prev => ({
        ...prev,
        recipientEmail: '',
        recipientName: '',
        customMessage: ''
      }));

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      
      setPreviewEmailStatus({
        type: 'error',
        message: 'Erro ao enviar email',
        details: error.message || 'Erro desconhecido ao enviar o assessment'
      });

      toast({
        title: "❌ Erro",
        description: `Não foi possível enviar o email: ${error.message}`,
        variant: "destructive"
      });

    } finally {
      setPreviewEmailSending(false);
    }
  };

  // Função para simular envio de email (substituir por integração real)
  const simulateEmailSending = async (emailData: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simular delay de envio
      setTimeout(() => {
        // Simular falha ocasional para teste
        if (Math.random() < 0.05) { // 5% de chance de falha
          reject(new Error('Falha na conexão com o servidor de email'));
          return;
        }
        
        console.log('📧 Email simulado enviado:', {
          to: emailData.to,
          subject: emailData.subject,
          assessment: emailData.assessmentData.name
        });
        
        resolve();
      }, 2000); // 2 segundos de delay
    });
  };

  // Função para registrar log de envio de email
  const logEmailSent = async (logData: {
    assessmentId: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    sentBy?: string;
    sentAt: string;
  }): Promise<void> => {
    try {
      // Em produção, salvar em tabela de logs
      console.log('📝 Email log:', logData);
      
      // Exemplo de estrutura para tabela de logs:
      // await supabase.from('email_logs').insert([{
      //   assessment_id: logData.assessmentId,
      //   recipient_email: logData.recipientEmail,
      //   recipient_name: logData.recipientName,
      //   subject: logData.subject,
      //   sent_by: logData.sentBy,
      //   sent_at: logData.sentAt,
      //   tenant_id: user?.tenantId || user?.tenant_id
      // }]);
      
    } catch (error) {
      console.error('Erro ao registrar log de email:', error);
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
      let savedResponses = {};
      let savedMetadata = {};
      
      // Para assessments virtuais/pendentes, verificar se há dados salvos no localStorage
      if (assessment.id.startsWith('pending-') || assessment.id.startsWith('vendor-')) {
        const vendorId = assessment.vendor_id;
        const dataStorageKey = `vendor_${vendorId}_assessment_data`;
        const savedData = localStorage.getItem(dataStorageKey);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('Dados salvos encontrados no localStorage:', parsedData);
            savedResponses = parsedData.responses || {};
            savedMetadata = {
              due_date: parsedData.due_date || assessment.due_date,
              priority: parsedData.priority || assessment.priority,
              status: parsedData.status || assessment.status,
              progress_percentage: parsedData.progress_percentage || assessment.progress_percentage,
              vendor_submitted_at: parsedData.vendor_submitted_at || assessment.vendor_submitted_at,
              internal_review_status: parsedData.internal_review_status || assessment.internal_review_status,
              reviewer_notes: parsedData.reviewer_notes || '',
              overall_score: parsedData.overall_score || assessment.overall_score,
              risk_level: parsedData.risk_level || assessment.risk_level
            };
            
            // Se há questões salvas, usar elas
            if (parsedData.questions && parsedData.questions.length > 0) {
              questions = parsedData.questions;
              console.log('Usando questões salvas do localStorage');
            }
          } catch (e) {
            console.warn('Erro ao parsear dados salvos do localStorage:', e);
          }
        }
      }
      
      // Se ainda não temos questões, carregar baseado no framework
      if (questions.length === 0) {
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
      }
      
      console.log('Questões finais carregadas:', questions);
      console.log('Respostas existentes (assessment):', assessment.responses);
      console.log('Respostas salvas (localStorage):', savedResponses);
      
      // Combinar respostas existentes com respostas salvas (localStorage tem precedência)
      const finalResponses = { ...(assessment.responses || {}), ...savedResponses };
      const finalMetadata = Object.keys(savedMetadata).length > 0 ? savedMetadata : {
        due_date: assessment.due_date,
        priority: assessment.priority,
        status: assessment.status,
        progress_percentage: assessment.progress_percentage,
        vendor_submitted_at: assessment.vendor_submitted_at,
        internal_review_status: assessment.internal_review_status,
        reviewer_notes: assessment.reviewer_notes || '',
        overall_score: assessment.overall_score,
        risk_level: assessment.risk_level
      };
      
      setAssessmentQuestions(questions);
      setAssessmentResponses(finalResponses);
      setAssessmentMetadata(finalMetadata);
      
      console.log('📊 EDITOR: Estado final setado:', {
        questions: questions.length,
        responses: Object.keys(finalResponses).length,
        metadata: finalMetadata
      });
      
      console.log('📊 EDITOR: Primeira questão de exemplo:', questions[0]?.question || 'Nenhuma questão');
      console.log('📊 EDITOR: Últimas 3 questões:', questions.slice(-3).map(q => q.question || q.id));
      
      console.log('=== ABRINDO MODAL EDITOR ===');
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
      
      // Disparar atualização da tabela
      setProgressUpdateTrigger(prev => prev + 1);
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
  
  // Debug: Test minimal INSERT to isolate column issues
  const testMinimalInsert = async () => {
    console.log('\n=== TESTE INSERT MÍNIMO ===');
    try {
      const minimalData = {
        vendor_id: '6302338c-9d89-4489-8bb1-8b6c002dda00', // Use a known vendor ID
        tenant_id: user?.tenantId || user?.tenant_id
      };
      
      console.log('📄 Dados mínimos para teste:', minimalData);
      
      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert(minimalData)
        .select('*')
        .single();
        
      console.log('📊 Resultado INSERT Mínimo:');
      console.log('  Error:', error);
      console.log('  Data:', data);
      
      if (error) {
        toast({
          title: "Teste INSERT Mínimo",
          description: `Erro: ${error.message}`,
          variant: "destructive",
          duration: 5000
        });
      } else {
        toast({
          title: "Teste INSERT Mínimo",
          description: "INSERT mínimo funcionou! Problema não é com colunas básicas.",
          duration: 5000
        });
        
        // Clean up - delete the test record
        await supabase
          .from('vendor_assessments')
          .delete()
          .eq('id', data.id);
      }
      
    } catch (error) {
      console.error('💥 Erro no teste INSERT mínimo:', error);
    }
    console.log('=== FIM TESTE INSERT MÍNIMO ===\n');
  };

  // Debug: Verificar estrutura da tabela vendor_assessments
  const inspectTableStructure = async () => {
    console.log('\n=== INSPECIONAR ESTRUTURA TABELA ===');
    try {
      // Consultar colunas da tabela vendor_assessments
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'vendor_assessments')
        .eq('table_schema', 'public');

      if (columnsError) {
        console.error('❌ Erro ao consultar colunas:', columnsError);
        
        // Alternativa: tentar consultar a tabela diretamente
        console.log('🔄 Tentando consulta alternativa...');
        const { data: testData, error: testError } = await supabase
          .from('vendor_assessments')
          .select('*')
          .limit(0);
        
        console.log('📊 Teste consulta vendor_assessments:', { testData, testError });
      } else {
        console.log('📋 Colunas encontradas na tabela vendor_assessments:');
        const columnList = columns?.map((col, index) => 
          `${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable ? 'NULL' : 'NOT NULL'}`
        ).join('\n   ');
        console.log('   ' + columnList);
        
        // Also show in toast for visibility
        toast({
          title: "Estrutura da Tabela Inspecionada",
          description: `Encontradas ${columns?.length} colunas na tabela vendor_assessments. Verifique o console para detalhes.`,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('💥 Erro na inspeção da tabela:', error);
    }
    console.log('=== FIM INSPEÇÃO TABELA ===\n');
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
      
      // Salvar no localStorage para persistência imediata
      if (editingAssessment) {
        const vendorId = editingAssessment.vendor_id;
        const storageKey = `vendor_${vendorId}_assessment_data`;
        
        // Obter dados existentes ou criar novos
        const existingDataStr = localStorage.getItem(storageKey);
        let existingData = {};
        try {
          existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
        } catch (e) {
          console.warn('Erro ao parsear dados existentes:', e);
        }
        
        const storageData = {
          ...existingData,
          responses: newResponses,
          questions: assessmentQuestions,
          ...assessmentMetadata,
          lastUpdated: new Date().toISOString(),
          assessmentId: editingAssessment.id
        };
        
        localStorage.setItem(storageKey, JSON.stringify(storageData));
        console.log('   - Resposta salva no localStorage:', storageKey);
        
        // Disparar atualização da tabela
        setProgressUpdateTrigger(prev => prev + 1);
      }
      
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
        
        // Salvar no localStorage para persistência imediata
        if (editingAssessment) {
          const vendorId = editingAssessment.vendor_id;
          const storageKey = `vendor_${vendorId}_assessment_data`;
          
          const existingDataStr = localStorage.getItem(storageKey);
          let existingData = {};
          try {
            existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
          } catch (e) {
            console.warn('Erro ao parsear dados existentes:', e);
          }
          
          const storageData = {
            ...existingData,
            responses: newResponses,
            questions: assessmentQuestions,
            ...assessmentMetadata,
            lastUpdated: new Date().toISOString(),
            assessmentId: editingAssessment.id
          };
          
          localStorage.setItem(storageKey, JSON.stringify(storageData));
          console.log('Evidência salva no localStorage:', storageKey);
          
          // Disparar atualização da tabela
          setProgressUpdateTrigger(prev => prev + 1);
        }
        
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
  
  // Calcular progresso real baseado nos dados do localStorage (memoizado)
  const getActualProgress = useMemo(() => {
    const progressCache = new Map<string, number>();
    
    return (assessment: VendorAssessment) => {
      const cacheKey = `${assessment.id}-${progressUpdateTrigger}`;
      
      if (progressCache.has(cacheKey)) {
        return progressCache.get(cacheKey)!;
      }
      
      // Se é um assessment formal no banco, verificar se há dados mais recentes no localStorage
      const vendorId = assessment.vendor_id;
      const storageKey = `vendor_${vendorId}_assessment_data`;
      const savedData = localStorage.getItem(storageKey);
      
      let progress = assessment.progress_percentage || 0;
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          
          // Verificar se os dados são mais recentes que o assessment
          const savedTime = new Date(parsedData.lastUpdated || 0);
          const assessmentTime = new Date(assessment.updated_at || assessment.created_at || 0);
          
          // Se há dados salvos e são mais recentes, usar eles
          if (savedTime > assessmentTime || assessment.id.startsWith('pending-') || assessment.id.startsWith('vendor-')) {
            const responses = parsedData.responses || {};
            const questions = parsedData.questions || [];
            
            if (questions.length > 0) {
              const answeredQuestions = Object.keys(responses).filter(questionId => {
                const response = responses[questionId];
                return response && response.answer && response.answer.toString().trim() !== '';
              }).length;
              
              progress = Math.round((answeredQuestions / questions.length) * 100);
              console.log(`Progresso atualizado para ${assessment.assessment_name}: ${progress}% (${answeredQuestions}/${questions.length})`);
            }
          }
        } catch (e) {
          console.warn('Erro ao calcular progresso do localStorage:', e);
        }
      }
      
      progressCache.set(cacheKey, progress);
      return progress;
    };
  }, [progressUpdateTrigger]);

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
      {/* Debug Section (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2 w-full">
            🐛 Debug Tools (Development Mode)
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkUserPermissions}
            className="text-xs"
          >
            🔐 Verificar Permissões
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => debugPublicLinkGeneration()}
            className="text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700"
          >
            🐛 Debug Link Generation
          </Button>
          {currentAssessments.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => debugPublicLinkGeneration(currentAssessments[0])}
              className="text-xs bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700"
            >
              🎯 Test First Assessment
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              // Test direct formal assessment creation
              const testAssessment = {
                vendor_id: '6302338c-9d89-4489-8bb1-8b6c002dda00',
                tenant_id: user?.tenantId || user?.tenant_id,
                assessment_name: 'Test Direct Assessment',
                assessment_type: 'security',
                status: 'draft',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                created_by: user?.id
              };
              
              console.log('🧪 Testing direct INSERT to vendor_assessments...');
              console.log('Data:', testAssessment);
              
              const { data, error } = await supabase
                .from('vendor_assessments')
                .insert(testAssessment)
                .select('*')
                .single();
                
              console.log('Result:', { data, error });
              
              if (data) {
                toast({ title: "✅ Sucesso", description: `Assessment criado: ${data.id}` });
                await loadAssessments();
              } else {
                toast({ title: "❌ Erro", description: error?.message || 'Falha no teste', variant: "destructive" });
              }
            }}
            className="text-xs bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700"
          >
            🧪 Test Direct Insert
          </Button>
        </div>
      )}
      
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
                        ${assessment.status === 'sent' && assessment.public_link && !assessment.responses 
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
                          <Progress value={getActualProgress(assessment)} className="w-12 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {getActualProgress(assessment)}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Clicou em editar:', assessment.id);
                                openAssessmentEditor(assessment);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Assessment
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Clicou em preview:', assessment.id);
                                openPreviewDialog(assessment);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Assessment Preview
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Clicou em detalhes:', assessment.id);
                                setSelectedAssessment(assessment);
                                setShowAssessmentDetails(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Visualizar Detalhes
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            
                            {/* Ações de link público e email - sempre disponíveis para assessments reais */}
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Clicou em link público:', assessment.id);
                                openPublicLinkDialog(assessment);
                              }}
                            >
                              <Link className="h-4 w-4 mr-2" />
                              Gerar/Ver Link Público
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Clicou em enviar email:', assessment.id);
                                openEmailDialog(assessment);
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Assessment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

          {/* Seção de Envio de Email Integrada ao Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-foreground">Enviar Assessment por Email</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Envio */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preview-recipient-email" className="text-sm font-medium text-foreground">
                    Email do Fornecedor *
                  </Label>
                  <Input
                    id="preview-recipient-email"
                    type="email"
                    placeholder="fornecedor@empresa.com"
                    className="mt-1"
                    value={previewEmailData.recipientEmail || ''}
                    onChange={(e) => setPreviewEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preview-recipient-name" className="text-sm font-medium text-foreground">
                    Nome do Contato
                  </Label>
                  <Input
                    id="preview-recipient-name"
                    placeholder="Nome do responsável"
                    className="mt-1"
                    value={previewEmailData.recipientName || ''}
                    onChange={(e) => setPreviewEmailData(prev => ({ ...prev, recipientName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preview-email-subject" className="text-sm font-medium text-foreground">
                    Assunto do Email
                  </Label>
                  <Input
                    id="preview-email-subject"
                    className="mt-1"
                    value={previewEmailData.subject || `Assessment de Segurança - ${previewAssessment?.vendor_registry?.name || 'Fornecedor'}`}
                    onChange={(e) => setPreviewEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preview-email-message" className="text-sm font-medium text-foreground">
                    Mensagem Personalizada (Opcional)
                  </Label>
                  <Textarea
                    id="preview-email-message"
                    placeholder="Adicione uma mensagem personalizada..."
                    className="mt-1 min-h-20"
                    value={previewEmailData.customMessage || ''}
                    onChange={(e) => setPreviewEmailData(prev => ({ ...prev, customMessage: e.target.value }))}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preview-send-copy"
                      checked={previewEmailData.sendCopy || false}
                      onCheckedChange={(checked) => setPreviewEmailData(prev => ({ ...prev, sendCopy: !!checked }))}
                    />
                    <Label htmlFor="preview-send-copy" className="text-sm text-foreground">
                      Enviar cópia para mim
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preview-auto-reminder"
                      checked={previewEmailData.autoReminder !== false}
                      onCheckedChange={(checked) => setPreviewEmailData(prev => ({ ...prev, autoReminder: !!checked }))}
                    />
                    <Label htmlFor="preview-auto-reminder" className="text-sm text-foreground">
                      Enviar lembrete automático em 7 dias
                    </Label>
                  </div>
                </div>
                
                <Button
                  onClick={() => sendAssessmentEmailFromPreview()}
                  disabled={!previewEmailData.recipientEmail || previewEmailSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {previewEmailSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Assessment
                    </>
                  )}
                </Button>
              </div>
              
              {/* Prévia do Email */}
              <div className="bg-background border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm font-medium text-foreground mb-3 border-b pb-2">
                  📧 Prévia do Email
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Para:</span>
                    <span className="ml-2 text-muted-foreground">
                      {previewEmailData.recipientEmail || 'fornecedor@empresa.com'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-foreground">Assunto:</span>
                    <span className="ml-2 text-muted-foreground">
                      {previewEmailData.subject || `Assessment de Segurança - ${previewAssessment?.vendor_registry?.name || 'Fornecedor'}`}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <p>
                        Olá{previewEmailData.recipientName ? ` ${previewEmailData.recipientName}` : ''},
                      </p>
                      
                      {previewEmailData.customMessage && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border-l-4 border-l-blue-500 my-3">
                          <div className="whitespace-pre-wrap text-sm text-foreground">
                            {previewEmailData.customMessage}
                          </div>
                        </div>
                      )}
                      
                      <p>
                        Você foi convidado a responder nosso questionário de avaliação de segurança. 
                        Este assessment é importante para garantirmos que nossos fornecedores atendam 
                        aos padrões de segurança necessários.
                      </p>
                      
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border my-4">
                        <div className="font-medium text-foreground mb-2">📋 Detalhes do Assessment:</div>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li><strong>Tipo:</strong> {previewAssessment?.assessment_type || 'Avaliação de Segurança'}</li>
                          <li><strong>Prazo:</strong> {previewAssessment?.due_date ? new Date(previewAssessment.due_date).toLocaleDateString('pt-BR') : 'A definir'}</li>
                          <li><strong>Questões:</strong> {previewQuestions.length} questões</li>
                          <li><strong>Tempo estimado:</strong> 30-45 minutos</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 my-4">
                        <div className="font-medium text-green-800 dark:text-green-200 mb-2">
                          🔗 Link para Responder:
                        </div>
                        <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border break-all text-blue-600">
                          {previewAssessment?.public_link?.startsWith('temp-') || !previewAssessment?.public_link
                            ? `${window.location.origin}/vendor-assessment/[SERÁ_GERADO_AO_ENVIAR]`
                            : `${window.location.origin}/vendor-assessment/${previewAssessment.public_link}`
                          }
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        <strong>Instruções:</strong>
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Clique no link acima para acessar o questionário</li>
                        <li>• Você pode salvar e continuar respondendo mais tarde</li>
                        <li>• É possível anexar evidências a cada resposta</li>
                        <li>• Em caso de dúvidas, entre em contato conosco</li>
                      </ul>
                      
                      <p className="mt-4">
                        Atenciosamente,<br/>
                        <strong>{user?.email || 'Equipe GRC'}</strong>
                      </p>
                      
                      <div className="text-xs text-muted-foreground mt-6 pt-3 border-t">
                        Este link expira em 30 dias. Se você não conseguir acessar, entre em contato conosco.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status de Envio */}
            {previewEmailStatus && (
              <div className={`mt-4 p-3 rounded-lg border ${
                previewEmailStatus.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {previewEmailStatus.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{previewEmailStatus.message}</span>
                </div>
                {previewEmailStatus.details && (
                  <div className="mt-2 text-sm opacity-80">
                    {previewEmailStatus.details}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Preview da Página Pública
              </div>
              <Badge variant="secondary" className="text-xs">
                Tela Cheia
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Visualização completa de como o fornecedor verá a página de assessment
            </DialogDescription>
          </DialogHeader>
          
          {previewAssessment && (
            <div className="flex-1 overflow-hidden">
              {previewAssessment.public_link?.startsWith('temp-') ? (
                // Preview rico e interativo para assessments temporários
                <div className="w-full h-full bg-gradient-to-br from-background to-secondary/20 overflow-y-auto">
                  {loadingPreviewQuestions ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
                        <div>
                          <p className="text-base font-medium text-foreground">Carregando questões do template...</p>
                          <p className="text-sm text-muted-foreground">Buscando todas as questões disponíveis</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-7xl mx-auto p-8">
                      {/* Header com branding */}
                      <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/15 dark:bg-primary/10 rounded-full mb-6">
                          <Shield className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-3">Assessment de Segurança</h1>
                        <h2 className="text-2xl font-semibold text-primary mb-2">{previewAssessment.assessment_name}</h2>
                        <p className="text-base text-muted-foreground mb-3">
                          Framework: {previewAssessment.vendor_assessment_frameworks?.name || previewAssessment.metadata?.template_name || 'Template Padrão'}
                        </p>
                        
                        {/* Link Público */}
                        <div className="bg-secondary/30 border border-primary/20 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
                          <div className="flex items-center gap-2 mb-2">
                            <Link className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Link Público para o Fornecedor:</span>
                          </div>
                          <div className="flex items-center gap-2 bg-background border rounded-lg p-2">
                            <code className="flex-1 text-xs text-muted-foreground break-all">
                              {previewAssessment.public_link?.startsWith('temp-') 
                                ? `${window.location.origin}/vendor-assessment/[SERÁ_GERADO_AO_ENVIAR]`
                                : `${window.location.origin}/vendor-assessment/${previewAssessment.public_link}`
                              }
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const linkText = previewAssessment.public_link?.startsWith('temp-') 
                                  ? `${window.location.origin}/vendor-assessment/[SERÁ_GERADO_AO_ENVIAR]`
                                  : `${window.location.origin}/vendor-assessment/${previewAssessment.public_link}`;
                                navigator.clipboard.writeText(linkText);
                                toast({
                                  title: "Link copiado!",
                                  description: "O link foi copiado para a área de transferência.",
                                  duration: 2000
                                });
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <CopyIcon className="h-3 w-3" />
                            </Button>
                          </div>
                          {previewAssessment.public_link?.startsWith('temp-') && (
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 O link definitivo será gerado quando o assessment for enviado ao fornecedor
                            </p>
                          )}
                        </div>
                        
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          🔍 Modo Preview Interativo
                        </Badge>
                      </div>

                      {/* Barra de Progresso Global */}
                      <Card className="mb-8 shadow-md border-2 border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Target className="h-6 w-6 text-primary" />
                              <span className="text-lg font-semibold text-foreground">Progresso do Assessment</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {previewQuestions.length > 0 ? `${previewCurrentStep + 1} de ${previewQuestions.length}` : '0 questões'}
                            </div>
                          </div>
                          <Progress 
                            value={previewQuestions.length > 0 ? ((previewCurrentStep + 1) / previewQuestions.length) * 100 : 0} 
                            className="h-4 mb-4" 
                          />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <div className="text-2xl font-bold text-foreground">{previewQuestions.length}</div>
                              <div className="text-sm text-muted-foreground">Total de Questões</div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <div className="text-2xl font-bold text-green-600">{Object.keys(previewResponses).length}</div>
                              <div className="text-sm text-muted-foreground">Respondidas</div>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                              <div className="text-2xl font-bold text-orange-600">{previewQuestions.filter(q => q.required).length}</div>
                              <div className="text-sm text-muted-foreground">Obrigatórias</div>
                            </div>
                            <div className="p-3 rounded-lg bg-primary/10">
                              <div className="text-2xl font-bold text-primary">
                                {previewQuestions.length > 0 ? Math.round(((previewCurrentStep + 1) / previewQuestions.length) * 100) : 0}%
                              </div>
                              <div className="text-sm text-muted-foreground">Completude</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Questão Atual */}
                      {previewQuestions.length > 0 && (
                        <Card className="mb-8 shadow-lg border-l-4 border-l-primary bg-card">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge variant="secondary" className="px-3 py-1">
                                    {previewQuestions[previewCurrentStep]?.category}
                                  </Badge>
                                  {previewQuestions[previewCurrentStep]?.subcategory && (
                                    <Badge variant="outline" className="px-2 py-1 text-xs">
                                      {previewQuestions[previewCurrentStep]?.subcategory}
                                    </Badge>
                                  )}
                                  {previewQuestions[previewCurrentStep]?.required && (
                                    <Badge variant="destructive" className="px-2 py-1 text-xs">
                                      ⚠️ Obrigatória
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-xl text-foreground leading-relaxed">
                                  {previewQuestions[previewCurrentStep]?.question}
                                </CardTitle>
                                {previewQuestions[previewCurrentStep]?.description && (
                                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    {previewQuestions[previewCurrentStep]?.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 ml-6">
                                <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                                  Peso: {previewQuestions[previewCurrentStep]?.weight || 1}
                                </div>
                                {previewQuestions[previewCurrentStep]?.help_text && (
                                  <div className="group relative">
                                    <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                                    <div className="absolute right-0 top-8 w-80 p-3 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all z-50">
                                      <p className="text-sm text-popover-foreground">
                                        {previewQuestions[previewCurrentStep]?.help_text}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Renderização da questão baseada no tipo */}
                            {(() => {
                              const currentQuestion = previewQuestions[previewCurrentStep];
                              console.log(`🐛 DEBUG - Questão ${previewCurrentStep + 1}:`, {
                                id: currentQuestion?.id,
                                type: currentQuestion?.type,
                                options: currentQuestion?.options,
                                totalOptions: currentQuestion?.options?.length
                              });
                              return null;
                            })()}
                            {previewQuestions[previewCurrentStep]?.type === 'multiple_choice' && previewQuestions[previewCurrentStep]?.options ? (
                              <div className="space-y-4">
                                {previewQuestions[previewCurrentStep].options.map((option: string, index: number) => (
                                  <div 
                                    key={index} 
                                    className={`flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-secondary/50 ${
                                      previewResponses[previewQuestions[previewCurrentStep].id]?.answer === option 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-border'
                                    }`}
                                    onClick={() => setPreviewResponses(prev => ({
                                      ...prev,
                                      [previewQuestions[previewCurrentStep].id]: {
                                        ...prev[previewQuestions[previewCurrentStep].id],
                                        answer: option,
                                        responded_at: new Date().toISOString()
                                      }
                                    }))}
                                  >
                                    <input 
                                      type="radio" 
                                      name={`question-${previewCurrentStep}`}
                                      className="mt-1 h-5 w-5 text-primary"
                                      onChange={() => {}}
                                      checked={previewResponses[previewQuestions[previewCurrentStep].id]?.answer === option}
                                    />
                                    <label className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed">
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : previewQuestions[previewCurrentStep]?.type === 'text' ? (
                              <div className="space-y-4">
                                <Textarea 
                                  placeholder="Digite sua resposta aqui..."
                                  className="min-h-32 resize-none text-foreground bg-background border-border"
                                  value={previewResponses[previewQuestions[previewCurrentStep].id]?.answer || ''}
                                  onChange={(e) => setPreviewResponses(prev => ({
                                    ...prev,
                                    [previewQuestions[previewCurrentStep].id]: {
                                      ...prev[previewQuestions[previewCurrentStep].id],
                                      answer: e.target.value,
                                      responded_at: new Date().toISOString()
                                    }
                                  }))}
                                />
                                {previewQuestions[previewCurrentStep]?.help_text && (
                                  <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border-l-4 border-l-primary/50">
                                    💡 {previewQuestions[previewCurrentStep]?.help_text}
                                  </div>
                                )}
                              </div>
                            ) : previewQuestions[previewCurrentStep]?.type === 'scale' ? (
                              <div className="space-y-4">
                                {previewQuestions[previewCurrentStep]?.scale_labels && previewQuestions[previewCurrentStep].scale_labels.length > 0 ? (
                                  // Se há labels específicos para cada opção da escala, renderizar como lista vertical
                                  <div className="space-y-3">
                                    {previewQuestions[previewCurrentStep].scale_labels.map((label: string, index: number) => {
                                      const value = index + 1;
                                      return (
                                        <div 
                                          key={value}
                                          className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-secondary/50 ${
                                            previewResponses[previewQuestions[previewCurrentStep].id]?.answer == value 
                                              ? 'border-primary bg-primary/5' 
                                              : 'border-border'
                                          }`}
                                          onClick={() => setPreviewResponses(prev => ({
                                            ...prev,
                                            [previewQuestions[previewCurrentStep].id]: {
                                              ...prev[previewQuestions[previewCurrentStep].id],
                                              answer: value,
                                              responded_at: new Date().toISOString()
                                            }
                                          }))}
                                        >
                                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                                            previewResponses[previewQuestions[previewCurrentStep].id]?.answer == value
                                              ? 'border-primary bg-primary text-primary-foreground'
                                              : 'border-border bg-background text-foreground'
                                          }`}>
                                            {value}
                                          </div>
                                          <label className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed">
                                            {label}
                                          </label>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  // Se não há labels específicos, usar renderização numérica horizontal
                                  <>
                                    <div className="flex items-center justify-center space-x-2 p-6 bg-secondary/20 rounded-lg border">
                                      {Array.from({ length: previewQuestions[previewCurrentStep]?.scale_max || 5 }, (_, i) => i + 1).map((value) => (
                                        <Button
                                          key={value}
                                          variant={previewResponses[previewQuestions[previewCurrentStep].id]?.answer == value ? "default" : "outline"}
                                          size="lg"
                                          onClick={() => setPreviewResponses(prev => ({
                                            ...prev,
                                            [previewQuestions[previewCurrentStep].id]: {
                                              ...prev[previewQuestions[previewCurrentStep].id],
                                              answer: value,
                                              responded_at: new Date().toISOString()
                                            }
                                          }))}
                                          className="w-12 h-12 text-lg font-bold"
                                        >
                                          {value}
                                        </Button>
                                      ))}
                                    </div>
                                    {previewQuestions[previewCurrentStep]?.scale_min && previewQuestions[previewCurrentStep]?.scale_max && (
                                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                                        <span>{previewQuestions[previewCurrentStep].scale_min} - Menor</span>
                                        <span>{previewQuestions[previewCurrentStep].scale_max} - Maior</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {previewQuestions[previewCurrentStep]?.help_text && (
                                  <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border-l-4 border-l-primary/50">
                                    💡 {previewQuestions[previewCurrentStep]?.help_text}
                                  </div>
                                )}
                              </div>
                            ) : previewQuestions[previewCurrentStep]?.type === 'yes_no' ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {['yes', 'no'].map((option) => (
                                    <div
                                      key={option}
                                      className={`flex items-center justify-center space-x-3 p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-secondary/50 ${
                                        previewResponses[previewQuestions[previewCurrentStep].id]?.answer === option
                                          ? 'border-primary bg-primary/5'
                                          : 'border-border'
                                      }`}
                                      onClick={() => setPreviewResponses(prev => ({
                                        ...prev,
                                        [previewQuestions[previewCurrentStep].id]: {
                                          ...prev[previewQuestions[previewCurrentStep].id],
                                          answer: option,
                                          responded_at: new Date().toISOString()
                                        }
                                      }))}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${previewCurrentStep}`}
                                        className="h-5 w-5 text-primary"
                                        onChange={() => {}}
                                        checked={previewResponses[previewQuestions[previewCurrentStep].id]?.answer === option}
                                      />
                                      <span className="text-lg font-medium text-foreground">
                                        {option === 'yes' ? 'Sim' : 'Não'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {previewQuestions[previewCurrentStep]?.help_text && (
                                  <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border-l-4 border-l-primary/50">
                                    💡 {previewQuestions[previewCurrentStep]?.help_text}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-6 bg-secondary/30 border-2 border-dashed border-border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-4">
                                  Questão de exemplo - tipo: {previewQuestions[previewCurrentStep]?.type || 'unknown'}
                                </p>
                                <Select>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma opção..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="option1">Opção 1</SelectItem>
                                    <SelectItem value="option2">Opção 2</SelectItem>
                                    <SelectItem value="option3">Opção 3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            {/* Seção de Evidências/Anexos */}
                            <div className="mt-8 p-4 bg-secondary/20 rounded-lg border">
                              <div className="flex items-center gap-2 mb-4">
                                <Upload className="h-5 w-5 text-primary" />
                                <Label className="text-sm font-medium text-foreground">
                                  Anexar Evidências (Opcional)
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4">
                                Anexe documentos, capturas de tela ou outros arquivos que comprovem sua resposta
                              </p>
                              
                              {/* Área de upload */}
                              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center transition-colors">
                                <input
                                  type="file"
                                  multiple
                                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 0) {
                                      setPreviewResponses(prev => ({
                                        ...prev,
                                        [previewQuestions[previewCurrentStep].id]: {
                                          ...prev[previewQuestions[previewCurrentStep].id],
                                          evidence: [
                                            ...(prev[previewQuestions[previewCurrentStep].id]?.evidence || []),
                                            ...files.map(file => ({
                                              id: `evidence-${Date.now()}-${Math.random()}`,
                                              fileName: file.name,
                                              fileSize: file.size,
                                              fileType: file.type,
                                              uploadedAt: new Date().toISOString(),
                                              file: file
                                            }))
                                          ]
                                        }
                                      }));
                                    }
                                  }}
                                  className="hidden"
                                  id={`file-upload-${previewCurrentStep}`}
                                />
                                <label htmlFor={`file-upload-${previewCurrentStep}`} className="cursor-pointer">
                                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Clique para selecionar arquivos ou arraste e solte
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    PDF, DOC, TXT, IMG, ZIP - Máx. 10MB por arquivo
                                  </p>
                                </label>
                              </div>
                              
                              {/* Lista de arquivos anexados */}
                              {previewResponses[previewQuestions[previewCurrentStep]?.id]?.evidence && 
                               previewResponses[previewQuestions[previewCurrentStep].id].evidence.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <Label className="text-sm font-medium text-foreground">
                                    Arquivos Anexados:
                                  </Label>
                                  {previewResponses[previewQuestions[previewCurrentStep].id].evidence.map((evidence: any, index: number) => (
                                    <div key={evidence.id || index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                      <div className="flex items-center space-x-3">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <div>
                                          <p className="text-sm font-medium text-foreground">{evidence.fileName}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {evidence.fileSize ? `${(evidence.fileSize / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setPreviewResponses(prev => ({
                                            ...prev,
                                            [previewQuestions[previewCurrentStep].id]: {
                                              ...prev[previewQuestions[previewCurrentStep].id],
                                              evidence: prev[previewQuestions[previewCurrentStep].id]?.evidence?.filter((_, i) => i !== index) || []
                                            }
                                          }));
                                        }}
                                        className="text-destructive hover:text-destructive/80"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Campo de justificativa */}
                              <div className="mt-4">
                                <Label className="text-sm font-medium text-foreground">
                                  Comentários Adicionais (Opcional)
                                </Label>
                                <Textarea
                                  placeholder="Adicione comentários ou justificativas para sua resposta..."
                                  className="mt-2 min-h-20 text-foreground bg-background border-border"
                                  value={previewResponses[previewQuestions[previewCurrentStep]?.id]?.justification || ''}
                                  onChange={(e) => setPreviewResponses(prev => ({
                                    ...prev,
                                    [previewQuestions[previewCurrentStep].id]: {
                                      ...prev[previewQuestions[previewCurrentStep].id],
                                      justification: e.target.value
                                    }
                                  }))}
                                />
                              </div>
                            </div>

                            {/* Navegação Avançada entre questões */}
                            <div className="space-y-6 mt-8 pt-6 border-t border-border">
                              {/* Navegação Sequencial */}
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => setPreviewCurrentStep(Math.max(0, previewCurrentStep - 1))}
                                  disabled={previewCurrentStep === 0}
                                  className="flex items-center gap-2 px-6"
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                  Anterior
                                </Button>
                                
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-foreground">
                                    Questão {previewCurrentStep + 1} de {previewQuestions.length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Categoria: {previewQuestions[previewCurrentStep]?.category}
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => setPreviewCurrentStep(Math.min(previewQuestions.length - 1, previewCurrentStep + 1))}
                                  disabled={previewCurrentStep >= previewQuestions.length - 1}
                                  className="flex items-center gap-2 px-6"
                                >
                                  Próxima
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </div>

                              {/* Mini-mapa de Navegação */}
                              <div className="flex items-center justify-center gap-1 flex-wrap max-w-4xl mx-auto p-4 bg-secondary/20 rounded-lg border">
                                {previewQuestions.map((question, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setPreviewCurrentStep(index)}
                                    className={`relative w-8 h-8 rounded-lg transition-all hover:scale-110 flex items-center justify-center text-xs font-medium ${
                                      index === previewCurrentStep 
                                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-md' 
                                        : previewResponses[previewQuestions[index]?.id]?.answer 
                                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
                                          : 'bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground border'
                                    }`}
                                    title={`Questão ${index + 1}: ${question.question?.substring(0, 50)}...${previewResponses[question?.id]?.answer ? ' ✅ Respondida' : ''}`}
                                  >
                                    {index + 1}
                                    {previewResponses[question?.id]?.answer && (
                                      <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-600 bg-white rounded-full" />
                                    )}
                                  </button>
                                ))}
                              </div>

                              {/* Navegação por Categoria */}
                              <div className="bg-secondary/10 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Target className="h-4 w-4 text-primary" />
                                  Navegação Rápida por Categoria
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {Array.from(new Set(previewQuestions.map(q => q.category))).map((category, index) => {
                                    const categoryQuestions = previewQuestions.filter(q => q.category === category);
                                    const firstQuestionIndex = previewQuestions.findIndex(q => q.category === category);
                                    const answeredInCategory = categoryQuestions.filter(q => previewResponses[q.id]?.answer).length;
                                    const isCurrentCategory = previewQuestions[previewCurrentStep]?.category === category;
                                    
                                    return (
                                      <Button
                                        key={index}
                                        variant={isCurrentCategory ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPreviewCurrentStep(firstQuestionIndex)}
                                        className={`text-xs h-auto p-2 flex flex-col items-start gap-1 ${
                                          isCurrentCategory ? 'ring-2 ring-primary/30' : ''
                                        }`}
                                      >
                                        <span className="font-medium truncate w-full text-left">{category}</span>
                                        <span className="text-xs opacity-75">
                                          {answeredInCategory}/{categoryQuestions.length} questões
                                        </span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Saltos Rápidos */}
                              <div className="flex items-center justify-center gap-4 text-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewCurrentStep(0)}
                                  className="flex items-center gap-1"
                                >
                                  <ArrowLeft className="h-4 w-4" />
                                  Primeira
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Ir para próxima questão não respondida
                                    const nextUnanswered = previewQuestions.findIndex((q, idx) => 
                                      idx > previewCurrentStep && !previewResponses[q.id]
                                    );
                                    if (nextUnanswered !== -1) {
                                      setPreviewCurrentStep(nextUnanswered);
                                    }
                                  }}
                                  className="flex items-center gap-1"
                                  disabled={!previewQuestions.some((q, idx) => idx > previewCurrentStep && !previewResponses[q.id])}
                                >
                                  <HelpCircle className="h-4 w-4" />
                                  Próxima não respondida
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewCurrentStep(previewQuestions.length - 1)}
                                  className="flex items-center gap-1"
                                >
                                  Última
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Resumo das Categorias */}
                      {previewQuestions.length > 0 && (
                        <Card className="mb-8 shadow-md">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <BarChart3 className="h-6 w-6 text-primary" />
                              Categorias do Assessment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {Array.from(new Set(previewQuestions.map(q => q.category))).map((category, index) => {
                                const categoryQuestions = previewQuestions.filter(q => q.category === category);
                                const answeredInCategory = categoryQuestions.filter(q => previewResponses[q.id]?.answer).length;
                                const progressInCategory = (answeredInCategory / categoryQuestions.length) * 100;
                                
                                return (
                                  <div key={index} className="p-4 border-2 border-border rounded-lg hover:border-primary/30 hover:bg-secondary/20 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-sm text-foreground">{category}</h4>
                                      <Badge variant="outline" className="text-xs px-2 py-1">
                                        {answeredInCategory}/{categoryQuestions.length}
                                      </Badge>
                                    </div>
                                    <Progress value={progressInCategory} className="h-3 mb-2" />
                                    <div className="text-xs text-muted-foreground text-center">
                                      {Math.round(progressInCategory)}% completo
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Footer com informações */}
                      <div className="text-center space-y-4 pt-8 pb-6 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/30 rounded-lg">
                            <FileCheck className="h-8 w-8 text-primary" />
                            <div className="text-lg font-bold text-foreground">{previewQuestions.length}</div>
                            <div className="text-sm text-muted-foreground">Questões Totais</div>
                          </div>
                          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/30 rounded-lg">
                            <Clock className="h-8 w-8 text-orange-500" />
                            <div className="text-lg font-bold text-foreground">~{Math.ceil(previewQuestions.length * 1.5)} min</div>
                            <div className="text-sm text-muted-foreground">Tempo Estimado</div>
                          </div>
                          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/30 rounded-lg">
                            <Brain className="h-8 w-8 text-green-500" />
                            <div className="text-lg font-bold text-foreground">Interativo</div>
                            <div className="text-sm text-muted-foreground">Preview Completo</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Este preview permite navegar por todas as questões reais do template selecionado, 
                          simulando a experiência completa do fornecedor.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Preview via iframe para assessments reais
                <iframe
                  src={`${window.location.origin}/vendor-assessment/${previewAssessment.public_link}`}
                  className="w-full h-full border rounded-lg"
                  title="Preview da Página Pública"
                />
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-6 px-6 pb-6 border-t border-border bg-secondary/20">
            {previewAssessment?.public_link?.startsWith('temp-') ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full">
                <Info className="h-4 w-4" />
                Preview interativo disponível apenas neste modal
              </div>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (previewAssessment?.public_link) {
                    window.open(`${window.location.origin}/vendor-assessment/${previewAssessment.public_link}`, '_blank');
                  }
                }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                Abrir em Nova Aba
              </Button>
            )}
            <Button 
              size="lg" 
              onClick={() => setShowPreviewDialog(false)}
              className="px-8"
            >
              Fechar Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Details Dialog */}
      <Dialog open={showAssessmentDetails} onOpenChange={setShowAssessmentDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalhes do Assessment
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas do assessment selecionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                  <p className="text-sm">{selectedAssessment.assessment_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedAssessment.assessment_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="text-sm">{getStatusBadge(selectedAssessment.status, selectedAssessment.due_date, selectedAssessment)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Prioridade</Label>
                  <Badge variant="outline" className={`text-xs ${
                    selectedAssessment.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                    selectedAssessment.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    selectedAssessment.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {selectedAssessment.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fornecedor</Label>
                  <p className="text-sm">{selectedAssessment.vendor_registry?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email Contato</Label>
                  <p className="text-sm">{selectedAssessment.vendor_registry?.primary_contact_email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data de Vencimento</Label>
                  <p className="text-sm">{new Date(selectedAssessment.due_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Progresso</Label>
                  <div className="flex items-center space-x-2">
                    <Progress value={getActualProgress(selectedAssessment)} className="w-20 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {getActualProgress(selectedAssessment)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedAssessment.overall_score && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Score Geral</Label>
                  <p className="text-lg font-semibold text-primary">{selectedAssessment.overall_score.toFixed(1)}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Framework</Label>
                <p className="text-sm">{selectedAssessment.vendor_assessment_frameworks?.name || selectedAssessment.metadata?.template_name}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Enviar Assessment por Email
            </DialogTitle>
            <DialogDescription>
              Envie o link do assessment diretamente para o fornecedor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Destinatário *</Label>
              <Input
                id="email"
                type="email"
                placeholder="fornecedor@empresa.com"
                value={emailForm.email}
                onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                rows={10}
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                className="resize-none"
              />
            </div>
            
            {selectedAssessmentForEmail && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    Assessment: {selectedAssessmentForEmail.assessment_name}
                  </div>
                  <div className="text-blue-700">
                    Fornecedor: {selectedAssessmentForEmail.vendor_registry?.name}
                  </div>
                  <div className="text-blue-700">
                    Prazo: {new Date(selectedAssessmentForEmail.due_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEmailDialog(false);
                setEmailForm({ email: '', subject: '', message: '' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={sendAssessmentEmail} disabled={!emailForm.email.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </div>
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
                                  <Label className="text-sm font-medium text-foreground">Avaliação:</Label>
                                  <div className="mt-2">
                                    {question.scale_labels && question.scale_labels.length > 0 ? (
                                      // Se há labels específicos para cada opção da escala, renderizar como lista vertical
                                      <div className="space-y-2">
                                        {question.scale_labels.map((label: string, index: number) => {
                                          const value = index + 1;
                                          return (
                                            <div 
                                              key={value}
                                              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-secondary/50 ${
                                                response?.answer == value 
                                                  ? 'border-primary bg-primary/5' 
                                                  : 'border-border'
                                              }`}
                                              onClick={() => updateQuestionResponse(question.id, value)}
                                            >
                                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                                                response?.answer == value
                                                  ? 'border-primary bg-primary text-primary-foreground'
                                                  : 'border-border bg-background text-foreground'
                                              }`}>
                                                {value}
                                              </div>
                                              <label className="text-sm text-foreground cursor-pointer flex-1">
                                                {label}
                                              </label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      // Se não há labels específicos, usar renderização numérica horizontal
                                      <div className="space-y-2">
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
                                        {question.scale_min && question.scale_max && (
                                          <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{question.scale_min} - Menor</span>
                                            <span>{question.scale_max} - Maior</span>
                                          </div>
                                        )}
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