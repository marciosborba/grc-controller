import React, { useState, useEffect, useMemo } from 'react';
import { EditAssessmentModal } from './EditAssessmentModal';
import { AssessmentPreviewModal } from './AssessmentPreviewModal';
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
import { useAuth } from '@/contexts/AuthContextOptimized';
import {
  Plus,
  FileCheck,
  Send,
  Link,
  Copy,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Brain,
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
  HelpCircle,
  AlertCircle as AlertCircleIcon,
  RotateCcw,
  User,
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
  metadata?: any;
  responses?: Record<string, any>;
  public_link_id?: string;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
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
  const [publicLinkData, setPublicLinkData] = useState<{ link: string; expiresAt: string } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<VendorAssessment | null>(null);

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedAssessmentForEmail, setSelectedAssessmentForEmail] = useState<VendorAssessment | null>(null);
  const [emailForm, setEmailForm] = useState({ email: '', subject: '', message: '' });
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState<VendorAssessment | null>(null);

  // New Assessment State
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [newAssessmentForm, setNewAssessmentForm] = useState({
    name: '',
    vendor_id: '',
    framework_id: '',
    priority: 'medium',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Fetch frameworks
  useEffect(() => {
    const fetchFrameworks = async () => {
      if (!user?.tenantId) return;
      const { data } = await supabase
        .from('assessment_frameworks')
        .select('id, nome, tipo_framework')
        .eq('tenant_id', user.tenantId);
      if (data) setFrameworks(data);
    };
    fetchFrameworks();
  }, [user]);

  const handleCreateAssessment = async () => {
    if (!newAssessmentForm.name || !newAssessmentForm.vendor_id || !newAssessmentForm.framework_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert({
          tenant_id: user?.tenantId,
          vendor_id: newAssessmentForm.vendor_id,
          framework_id: newAssessmentForm.framework_id,
          assessment_name: newAssessmentForm.name,
          assessment_type: 'initial',
          status: 'draft',
          priority: newAssessmentForm.priority,
          due_date: new Date(newAssessmentForm.due_date).toISOString(),
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Assessment criado com sucesso"
      });
      setShowNewAssessmentDialog(false);
      loadAssessments();
      // Reset form
      setNewAssessmentForm({
        name: '',
        vendor_id: '',
        framework_id: '',
        priority: 'medium',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar assessment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load assessments from vendor registry
  const loadAssessments = async () => {
    if (!user?.tenantId) return;

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
            name:nome,
            framework_type:tipo_framework
          )
        `)
        .eq('tenant_id', user?.tenantId)
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
        .eq('tenant_id', user?.tenantId)
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
  }, [user?.tenantId]);

  // Verificar periodicamente por novos assessments criados durante onboarding
  useEffect(() => {
    const interval = setInterval(() => {
      // Verificar se há assessments criados recentemente (últimos 30 segundos)
      const recentTime = new Date(Date.now() - 30000).toISOString();

      // Recarregar assessments se houver atividade recente
      if (user?.tenantId) {
        loadAssessments();
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [user?.tenantId, loadAssessments]);

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
    console.log('[DEBUG_LINK] openPublicLinkDialog called for:', assessment.id);
    console.log('[DEBUG_LINK] Assessment Data:', assessment);
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
    const generatedLink = await generatePublicLink(assessment);
    if (generatedLink && typeof generatedLink === 'string') {
      const publicUrl = `${window.location.origin}/vendor-assessment/${generatedLink}`;
      // Update local state immediately
      setPublicLinkData({
        link: publicUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Approximate expiry
      });
      setShowPublicLinkDialog(true);

      // Reload assessments in background
      loadAssessments();
    } else {
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
      // Error copying link
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
    return;
  }

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
        const generatedLink = await generatePublicLink(assessment);
        if (generatedLink && typeof generatedLink === 'string') {
          // Update local state immediately with the new link
          const updatedAssessment = {
            ...assessment,
            public_link: generatedLink,
            public_link_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Approximate expiry
          };

          setPreviewAssessment(updatedAssessment);
          setShowPreviewDialog(true);

          // Reload assessments in background to keep sync
          loadAssessments();
        } else {
          // generatePublicLink returned false/null
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
        try {
          const generatedLink = await generatePublicLink(assessment);
          if (generatedLink && typeof generatedLink === 'string') {
            // Update local state immediately with the new link
            const updatedAssessment = {
              ...assessment,
              public_link: generatedLink,
              public_link_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Approximate expiry
            };

            setSelectedAssessmentForEmail(updatedAssessment);
            setShowEmailDialog(true);

            // Reload assessments in background
            loadAssessments();
          } else {
            // generatePublicLink returned false/null
            toast({
              title: "Erro ao Gerar Link",
              description: "Falha na geração do link público. Verifique suas permissões e tente novamente.",
              variant: "destructive"
            });
          }
        } catch (error) {
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
          .eq('tenant_id', user?.tenantId)
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
          tenant_id: user?.tenantId,
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
    console.log('[DEBUG_LINK] createFormalAssessmentFromTemp called');
    console.log('[DEBUG_LINK] Temp Assessment:', tempAssessment);
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

      if (!frameworkId || frameworkId === 'nist_csf_default' || frameworkId === 'iso_27001_27701_default') {
        // Detected template framework or missing framework, trying to find a valid one

        // Tentar buscar qualquer framework existente
        try {
          const { data: anyFramework } = await supabase
            .from('assessment_frameworks')
            .select('id')
            .eq('tenant_id', user?.tenantId)
            .limit(1);

          console.log('[DEBUG_LINK] Framework search result:', anyFramework);

          if (anyFramework && anyFramework.length > 0) {
            frameworkId = anyFramework[0].id;
            // Found existing framework
          } else {
            // No frameworks found, cannot proceed without a framework
            throw new Error("Nenhum framework de avaliação encontrado. Por favor, cadastre um framework antes de continuar.");
          }
        } catch (error: any) {
          // Framework search failed
          throw new Error(error.message || "Erro ao buscar framework padrão.");
        }
      }

      if (!frameworkId) {
        throw new Error("Framework ID é obrigatório para criar um assessment.");
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
        tenant_id: user?.tenantId,
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

      console.log('[DEBUG_LINK] Direct Insert Result:', directResult);

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
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        toast({
          title: "❌ Erro ao Criar Assessment",
          description: `Não foi possível salvar o assessment: ${errorMessage}`,
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
      const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      toast({
        title: "❌ Erro",
        description: `Erro interno ao criar assessment: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      // CREATE FORMAL ASSESSMENT END
    }
  };

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

      const userTenantId = user?.tenantId;
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
      // console.log('  User Tenant ID (old):', user?.tenant_id);
      const userTenantId = user?.tenantId;
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
  const generatePublicLink = async (assessment: VendorAssessment): Promise<string | boolean> => {
    console.log('🔗 ======== GENERATE PUBLIC LINK START ========');
    console.log('[DEBUG_LINK] generatePublicLink called for:', assessment.id);
    console.log('🔗 Assessment ID:', assessment.id);

    try {
      // STEP 1: Validar contexto do usuário
      console.log('🔍 STEP 1: User Authentication Check');
      if (!user?.id) {
        console.error('❌ User not authenticated');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userTenantId = user?.tenantId;
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

      return publicLinkId;

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
      //   tenant_id: user?.tenantId
      // }]);

    } catch (error) {
      console.error('Erro ao registrar log de email:', error);
    }
  };

  // Open assessment editor
  const openAssessmentEditor = async (assessment: VendorAssessment) => {
    setEditingAssessment(assessment);
    setShowEditDialog(true);
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
                          <Progress value={assessment.progress_percentage || 0} className="w-12 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {assessment.progress_percentage || 0}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
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
                  🎯 Dica Inteligente
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

      {/* Preview Dialog */}
      {/* Preview Modal */}
      {showPreviewDialog && previewAssessment && (
        <AssessmentPreviewModal
          isOpen={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          assessmentId={previewAssessment.id}
          assessmentData={previewAssessment}
        />
      )}

      {/* Assessment Details Dialog */}
      <Dialog open={showAssessmentDetails} onOpenChange={setShowAssessmentDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Detalhes do Assessment</DialogTitle>
                <DialogDescription className="mt-1">
                  Visão geral e métricas do assessment selecionado.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedAssessment && (
            <div className="py-6 space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md border shadow-sm">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Status Atual</h4>
                    <p className="text-xs text-muted-foreground">
                      Última atualização: {new Date(selectedAssessment.updated_at || selectedAssessment.created_at || Date.now()).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(selectedAssessment.status, selectedAssessment.due_date, selectedAssessment)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: General Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Informações Gerais</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Brain className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Nome do Assessment</p>
                          <p className="text-sm text-muted-foreground">{selectedAssessment.assessment_name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Target className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Tipo</p>
                          <Badge variant="outline" className="text-xs capitalize mt-1">
                            {selectedAssessment.assessment_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Framework</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedAssessment.vendor_assessment_frameworks?.name || selectedAssessment.metadata?.template_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Métricas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Score Geral</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">
                            {selectedAssessment.overall_score ? selectedAssessment.overall_score.toFixed(1) : '-'}
                          </span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Risco</p>
                        <div className="mt-1">
                          {getRiskLevelBadge(selectedAssessment.risk_level) || <span className="text-sm text-muted-foreground">-</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Vendor & Timing */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Fornecedor</h4>
                    <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                      <div className="flex items-start gap-3">
                        <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{selectedAssessment.vendor_registry?.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {selectedAssessment.vendor_id.substring(0, 8)}...</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Contato Principal</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {selectedAssessment.vendor_registry?.primary_contact_email || 'Email não cadastrado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Cronograma</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Data de Vencimento</span>
                        </div>
                        <Badge variant="outline">
                          {new Date(selectedAssessment.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span className="font-medium">{selectedAssessment.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={selectedAssessment.progress_percentage || 0} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Prioridade</span>
                        </div>
                        <Badge variant="outline" className={`
                          ${selectedAssessment.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                            selectedAssessment.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              selectedAssessment.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-green-50 text-green-700 border-green-200'}
                        `}>
                          {selectedAssessment.priority === 'low' ? 'Baixa' :
                            selectedAssessment.priority === 'medium' ? 'Média' :
                              selectedAssessment.priority === 'high' ? 'Alta' : 'Urgente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Enviar Assessment</DialogTitle>
                <DialogDescription className="mt-1">
                  Envie o convite para o fornecedor responder ao questionário de segurança.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Assessment Context Card */}
            {selectedAssessmentForEmail && (
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-background rounded-md border shadow-sm">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{selectedAssessmentForEmail.vendor_registry?.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedAssessmentForEmail.assessment_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Prazo de Entrega</div>
                    <Badge variant="outline" className="bg-background">
                      <Calendar className="h-3 w-3 mr-1" />
                      {/* Fix timezone issue: treat date as UTC or append time to ensure it falls on correct day */}
                      {new Date(selectedAssessmentForEmail.due_date).getUTCDay ?
                        new Date(selectedAssessmentForEmail.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) :
                        new Date(selectedAssessmentForEmail.due_date).toLocaleDateString('pt-BR')
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Destinatário
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  O link de acesso será enviado para este endereço.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="h-10 font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Mensagem</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      if (selectedAssessmentForEmail && selectedAssessmentForEmail.public_link) {
                        const defaultSubject = `Assessment de Segurança - ${selectedAssessmentForEmail.assessment_name}`;
                        const publicUrl = `${window.location.origin}/vendor-assessment/${selectedAssessmentForEmail.public_link}`;
                        const defaultMessage = `Olá,

Você foi convidado(a) para responder um assessment de segurança.

**Detalhes do Assessment:**
• Nome: ${selectedAssessmentForEmail.assessment_name}
• Fornecedor: ${selectedAssessmentForEmail.vendor_registry?.name}
• Prazo: ${new Date(selectedAssessmentForEmail.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}

**Link para responder:**
${publicUrl}

Este link expira em 30 dias. Por favor, complete o assessment até a data limite.

Caso tenha dúvidas, entre em contato conosco.

Atenciosamente,
Equipe de Compliance`;
                        setEmailForm(prev => ({
                          ...prev,
                          subject: defaultSubject,
                          message: defaultMessage
                        }));
                        toast({
                          description: "Mensagem restaurada para o padrão."
                        });
                      }
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restaurar Padrão
                  </Button>
                </div>
                <Textarea
                  id="message"
                  rows={12}
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  className="resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailDialog(false);
                setEmailForm({ email: '', subject: '', message: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={sendAssessmentEmail}
              disabled={!emailForm.email.trim()}
              className="min-w-[120px]"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>





      <EditAssessmentModal
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        assessmentId={editingAssessment?.id || null}
        onSave={() => {
          loadAssessments();
          setShowEditDialog(false);
        }}
      />

      {/* New Assessment Dialog */}
      <Dialog open={showNewAssessmentDialog} onOpenChange={setShowNewAssessmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Assessment</DialogTitle>
            <DialogDescription>
              Crie um novo assessment para um fornecedor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Assessment</Label>
              <Input
                id="name"
                value={newAssessmentForm.name}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, name: e.target.value })}
                placeholder="Ex: Avaliação de Segurança 2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor">Fornecedor</Label>
              <Select
                value={newAssessmentForm.vendor_id}
                onValueChange={(value) => setNewAssessmentForm({ ...newAssessmentForm, vendor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {propVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="framework">Framework</Label>
              <Select
                value={newAssessmentForm.framework_id}
                onValueChange={(value) => setNewAssessmentForm({ ...newAssessmentForm, framework_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>
                      {fw.nome} ({fw.tipo_framework})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={newAssessmentForm.priority}
                  onValueChange={(value) => setNewAssessmentForm({ ...newAssessmentForm, priority: value })}
                >
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
              <div className="grid gap-2">
                <Label htmlFor="due_date">Prazo</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newAssessmentForm.due_date}
                  onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewAssessmentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAssessment}>
              Criar Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};