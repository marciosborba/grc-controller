import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DEFAULT_ASSESSMENT_QUESTIONS } from '@/components/vendor-risk/shared/RiskAssessmentManager';
import { EditAssessmentModal } from './EditAssessmentModal';
import { AssessmentPreviewModal } from './AssessmentPreviewModal';
import { AssessmentValidationModal } from './AssessmentValidationModal';
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
import { useEffectiveTenant } from '@/hooks/useEffectiveTenant';
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
  ChevronDown,
  ChevronUp,
  ActivitySquare,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface VendorAssessment {
  id: string;
  vendor_id: string;
  framework_id: string;
  assessment_name: string;
  assessment_type: 'initial' | 'annual' | 'reassessment' | 'incident_triggered' | 'ad_hoc';
  status: 'draft' | 'sent' | 'in_progress' | 'pending_validation' | 'completed' | 'approved' | 'rejected' | 'expired';
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
  const { effectiveTenantId, isPlatformAdmin } = useEffectiveTenant();
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
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAssessment, setValidationAssessment] = useState<VendorAssessment | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchAssessment, setDispatchAssessment] = useState<VendorAssessment | null>(null);
  const [dispatchPlans, setDispatchPlans] = useState<any[]>([]);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanData, setEditingPlanData] = useState<{ title: string; description: string; due_date: string; priority: string } | null>(null);

  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Password Reset State
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetVendor, setPasswordResetVendor] = useState<any>(null);
  const [vendorAccesses, setVendorAccesses] = useState<{ email: string; password: string; isExisting: boolean }[]>([]);
  const [isManagingAccess, setIsManagingAccess] = useState(false);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);

  // New Assessment State
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [modalVendors, setModalVendors] = useState<any[]>([]);
  const [newAssessmentForm, setNewAssessmentForm] = useState({
    name: '',
    vendor_id: '',
    framework_id: '',
    priority: 'medium',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor_emails: [{ email: '', password: '' }] as { email: string; password: string }[],
  });

  // Fetch frameworks
  useEffect(() => {
    const fetchFrameworks = async () => {
      let query = supabase
        .from('vendor_assessment_frameworks')
        .select('*');

      if (effectiveTenantId && effectiveTenantId !== 'default') {
        query = query.or(`tenant_id.eq.${effectiveTenantId},tenant_id.eq.00000000-0000-0000-0000-000000000000`);
      } else if (!isPlatformAdmin) {
        return; // require tenantid for non-admins
      }

      const { data, error } = await query
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar frameworks:', error);
        return;
      }
      if (data) {
        // Map DB columns to expected UI names (handle both column naming conventions)
        setFrameworks(data.map((fw: any) => ({
          id: fw.id,
          name: fw.nome || fw.name,
          framework_type: fw.tipo_framework || fw.framework_type,
        })));
        console.log('✅ Frameworks carregados:', data.length);
      }
    };
    fetchFrameworks();
    // Also load vendors for the new assessment modal
    const fetchVendorsForModal = async () => {
      if (!user?.tenantId) return;
      const { data } = await supabase
        .from('vendor_registry')
        .select('id, name, status, primary_contact_email')
        .eq('tenant_id', user.tenantId)
        .order('name');
      if (data) setModalVendors(data);
    };
    fetchVendorsForModal();
  }, [user]);

  const handleCreateAssessment = async () => {
    const validEmails = newAssessmentForm.vendor_emails.filter(e => e.email.trim() && e.password.trim());
    if (!newAssessmentForm.name || !newAssessmentForm.vendor_id || !newAssessmentForm.framework_id || validEmails.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios. Adicione ao menos um e-mail e senha para o Portal.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const selectedVendor = (modalVendors.length > 0 ? modalVendors : propVendors).find(v => v.id === newAssessmentForm.vendor_id);
      if (!selectedVendor) {
        toast({ title: "Erro", description: "Fornecedor não encontrado.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // 1. Create Vendor Auth Users for each email
      const createdEmails: string[] = [];
      const tenantIdToUse = effectiveTenantId === 'default' ? null : (effectiveTenantId || null);
      console.log('[handleCreateAssessment] effectiveTenantId:', effectiveTenantId, '→ tenantIdToUse:', tenantIdToUse);

      for (const entry of validEmails) {
        const emailToUse = entry.email.trim().toLowerCase();
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_vendor_auth_user', {
          p_email: emailToUse,
          p_password: entry.password.trim(),
          p_name: selectedVendor.name,
          p_vendor_id: selectedVendor.id,
          p_tenant_id: tenantIdToUse
        });

        console.log('[create_vendor_auth_user] rpcData:', rpcData, 'rpcError:', rpcError);

        if (rpcError) {
          toast({ title: "Erro ao criar acesso", description: `${emailToUse}: ${rpcError.message}`, variant: "destructive" });
          throw new Error(rpcError.message);
        } else if (rpcData && !rpcData.success) {
          if (!rpcData.error?.includes('Usuário já existe')) {
            toast({ title: "Aviso ao criar acesso", description: `${emailToUse}: ${rpcData.error}`, variant: "destructive" });
            throw new Error(rpcData.error);
          }
          // User already exists - that's OK, just add to list
        }
        createdEmails.push(emailToUse);
      }


      // The vendor_assessment_frameworks ID from the dropdown
      const vendorFrameworkId = newAssessmentForm.framework_id;

      // Fetch the vendor framework data (questions, name, etc.)
      const { data: vendorFramework } = await supabase
        .from('vendor_assessment_frameworks')
        .select('*')
        .eq('id', vendorFrameworkId)
        .single();

      // Try to find a matching framework in assessment_frameworks (FK target table)
      let assessmentFrameworkId: string | null = null;
      if (vendorFramework) {
        const fwName = vendorFramework.nome || vendorFramework.name;
        const { data: matchingFw } = await supabase
          .from('assessment_frameworks')
          .select('id')
          .eq('tenant_id', effectiveTenantId === 'default' ? null : effectiveTenantId)
          .ilike('nome', `%${fwName}%`)
          .limit(1);

        if (matchingFw && matchingFw.length > 0) {
          assessmentFrameworkId = matchingFw[0].id;
        }
      }

      // Build insert payload
      const insertPayload: any = {
        tenant_id: effectiveTenantId === 'default' ? null : effectiveTenantId,
        vendor_id: newAssessmentForm.vendor_id,
        assessment_name: newAssessmentForm.name,
        assessment_type: 'initial',
        status: 'draft',
        priority: newAssessmentForm.priority,
        due_date: new Date(newAssessmentForm.due_date).toISOString(),
        created_by: user?.id,
        metadata: {
          vendor_framework_id: vendorFrameworkId,
          vendor_framework_name: vendorFramework?.nome || vendorFramework?.name,
          // Snapshot either the framework questions, or the defaults if it's empty, ensuring absolute consistency
          questions: vendorFramework?.questions?.length > 0
            ? vendorFramework.questions
            : DEFAULT_ASSESSMENT_QUESTIONS
        }
      };

      // Only set framework_id if we found a match in assessment_frameworks
      if (assessmentFrameworkId) {
        insertPayload.framework_id = assessmentFrameworkId;
      }

      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert(insertPayload)
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
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vendor_emails: [{ email: '', password: '' }],
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
  const loadAssessments = useCallback(async () => {
    if (!effectiveTenantId && !isPlatformAdmin) {
      console.log('⚠️ [VendorAssessmentManager] Skipping loadAssessments: no effectiveTenantId and not platform admin');
      return;
    }

    console.log('🔄 [VendorAssessmentManager] loadAssessments called', { effectiveTenantId, isPlatformAdmin });

    try {
      setLoading(true);

      // Primeiro, buscar assessments da tabela vendor_assessments (incluindo os criados no onboarding)
      let assessmentsQuery = supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor_registry:vendor_id (
            name,
            primary_contact_email,
            primary_contact_name
          )
        `);

      if (effectiveTenantId && effectiveTenantId !== 'default') {
        assessmentsQuery = assessmentsQuery.eq('tenant_id', effectiveTenantId);
      }

      const { data: vendorAssessments, error: assessmentError } = await assessmentsQuery.order('created_at', { ascending: false });

      // If joined query failed, try simple query without joins
      let finalAssessments = vendorAssessments;
      if (assessmentError || !vendorAssessments) {
        console.warn('⚠️ [loadAssessments] Joined query failed, trying simple query...');

        let simpleQuery = supabase
          .from('vendor_assessments')
          .select('*');

        if (effectiveTenantId && effectiveTenantId !== 'default') {
          simpleQuery = simpleQuery.eq('tenant_id', effectiveTenantId);
        }

        const { data: simpleData, error: simpleError } = await simpleQuery.order('created_at', { ascending: false });

        if (simpleError) {
          console.error('❌ [loadAssessments] Simple query also failed:', simpleError);
        } else {
          console.log('✅ [loadAssessments] Simple query returned:', simpleData?.length, 'assessments');
          // Enrich with vendor info
          if (simpleData) {
            const vendorIds = [...new Set(simpleData.map((a: any) => a.vendor_id).filter(Boolean))];
            const { data: vendors } = await supabase
              .from('vendor_registry')
              .select('id, name, primary_contact_email, primary_contact_name')
              .in('id', vendorIds);

            finalAssessments = simpleData.map((a: any) => ({
              ...a,
              vendor_registry: vendors?.find((v: any) => v.id === a.vendor_id) || null,
            }));
          }
        }
      }
      // Map metadata.validation.overallScore or metadata.submission_summary.maturity_score to overall_score property for UI
      if (finalAssessments) {
        finalAssessments = finalAssessments.map((a: any) => {
          const meta = typeof a.metadata === 'string' ? JSON.parse(a.metadata) : (a.metadata || {});
          let status = a.status;

          // Fix for public submission: RPC sets status to 'completed', but it still needs validation
          if (status === 'completed' && (!a.internal_review_status || a.internal_review_status === 'pending')) {
            status = 'pending_validation';
          }

          return {
            ...a,
            status,
            metadata: meta,
            overall_score: meta?.validation?.overallScore ?? meta?.submission_summary?.maturity_score ?? null
          };
        });
      }

      console.log('📋 [loadAssessments] finalAssessments:', finalAssessments?.length);
      if (finalAssessments.length > 0) {
        console.log('🧪 First item keys:', Object.keys(finalAssessments[0]).join(', '));
        console.log('🧪 First item data:', JSON.stringify({
          id: finalAssessments[0].id,
          assessment_name: finalAssessments[0].assessment_name,
          status: finalAssessments[0].status,
          tenant_id: (finalAssessments[0] as any).tenant_id,
        }));
      }

      // Segundo, buscar fornecedores que têm assessments cadastrados
      let vendorsQuery = supabase
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
        `);

      if (effectiveTenantId && effectiveTenantId !== 'default') {
        vendorsQuery = vendorsQuery.eq('tenant_id', effectiveTenantId);
      }

      const { data: vendorsWithAssessments, error: vendorError } = await vendorsQuery
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
      if (finalAssessments) {
        combinedAssessments.push(...finalAssessments);
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
            const existingAssessment = finalAssessments?.find(a => a.vendor_id === vendorId);

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

      console.log('🧪 [VendorAssessmentManager] combinedAssessments:', combinedAssessments.length);
      if (combinedAssessments.length > 0) {
        console.log('🧪 First item keys:', Object.keys(combinedAssessments[0]).join(', '));
        console.log('🧪 First item data:', JSON.stringify({
          id: combinedAssessments[0].id,
          assessment_name: combinedAssessments[0].assessment_name,
          status: combinedAssessments[0].status,
          tenant_id: (combinedAssessments[0] as any).tenant_id,
        }));
      }

      setAssessments(combinedAssessments);
    } catch (error) {
      console.error('❌ [VendorAssessmentManager] Unexpected error in loadAssessments:', error);
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, isPlatformAdmin, supabase, toast]);


  useEffect(() => {
    loadAssessments();

    // Removed debugging functions - preview should work now
  }, [effectiveTenantId, isPlatformAdmin]);

  // Verificar periodicamente por novos assessments criados durante onboarding
  useEffect(() => {
    const interval = setInterval(() => {
      // Verificar se há assessments criados recentemente (últimos 30 segundos)
      const recentTime = new Date(Date.now() - 30000).toISOString();

      // Recarregar assessments se houver atividade recente
      if (effectiveTenantId || isPlatformAdmin) {
        loadAssessments();
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [effectiveTenantId, isPlatformAdmin]);

  // Always use internal state (loaded by loadAssessments) - it merges all sources
  // Note: never use propLoading because for platform admins, propAssessments never gets populated
  // and propLoading stays true forever (parent hook skips fetch when tenantId is not set)
  const currentAssessments = assessments.length > 0 ? assessments : propAssessments;
  const currentLoading = loading; // Always use internal loading state
  const currentSearchTerm = searchTerm || localSearchTerm;
  const currentSelectedFilter = selectedFilter || localSelectedFilter;

  // Filter assessments based on search and filters
  const filteredAssessments = currentAssessments.filter(assessment => {
    const assessmentName = assessment.assessment_name || (assessment as any).title || '';
    const vendorName = assessment.vendor_registry?.name || '';

    const matchesSearch = !currentSearchTerm ||
      assessmentName.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
      vendorName.toLowerCase().includes(currentSearchTerm.toLowerCase());

    const matchesFilter = currentSelectedFilter === 'all' ||
      (currentSelectedFilter === 'pending' && ['draft', 'sent'].includes(assessment.status)) ||
      (currentSelectedFilter === 'awaiting_response' && assessment.status === 'sent' && assessment.public_link && !assessment.responses) ||
      (currentSelectedFilter === 'in_progress' && assessment.status === 'in_progress') ||
      (currentSelectedFilter === 'pending_validation' && assessment.status === 'pending_validation') ||
      (currentSelectedFilter === 'completed' && ['completed', 'approved'].includes(assessment.status)) ||
      (currentSelectedFilter === 'overdue' && assessment.due_date && new Date(assessment.due_date) < new Date() && !['completed', 'approved'].includes(assessment.status));

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

    // Provide portal URL
    const portalUrl = `${window.location.origin}/vendor-portal/login`;
    const defaultSubject = `Assessment de Segurança - ${assessment.assessment_name}`;
    const defaultMessage = `Olá,

Você foi convidado(a) para responder um assessment de segurança através do nosso Portal de Fornecedores.

**Detalhes do Assessment:**
• Nome: ${assessment.assessment_name}
• Fornecedor: ${assessment.vendor_registry?.name}
• Prazo: ${new Date(assessment.due_date).toLocaleDateString('pt-BR')}

**Acesso ao Portal:**
Link: ${portalUrl}
Seu Email: (Este endereço de email)
Sua Senha temporária: (Será gerada e exibida no sistema, ou use seu login existente)

Por favor, faça login, verifique o assessment pendente e complete-o até a data limite.

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

  // Send assessment via email and provision vendor user
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
      // 1. Update vendor contact email if it was empty
      if (!selectedAssessmentForEmail.vendor_registry?.primary_contact_email && emailForm.email) {
        await supabase
          .from('vendor_registry')
          .update({ primary_contact_email: emailForm.email })
          .eq('id', selectedAssessmentForEmail.vendor_id);
      }

      // 2. Check if user exists in vendor_users
      const { data: existingVendorUser, error: vendorUserError } = await supabase
        .from('vendor_users')
        .select('id, auth_user_id')
        .eq('email', emailForm.email)
        .eq('vendor_id', selectedAssessmentForEmail.vendor_id)
        .maybeSingle();

      let tempPassword = "";

      // 3. If no auth_user_id mapping, we need to create/map the user
      if (!existingVendorUser || !existingVendorUser.auth_user_id) {
        // Generate random password
        tempPassword = Math.random().toString(36).slice(-8) + "A1!";

        // Use Edge function to create user
        const functionData = {
          email: emailForm.email,
          password: tempPassword,
          full_name: selectedAssessmentForEmail.vendor_registry?.primary_contact_name || 'Contato do Fornecedor',
          tenant_id: user?.tenantId,
          roles: ['vendor'], // Especial vendor role
          send_invitation: false,
        };

        const { data: result, error: functionError } = await supabase.functions.invoke('create-user-admin', {
          body: functionData
        });

        // Even if user exists in Auth, if create-user-admin handles it gracefully, we get the ID.
        // For simplicity, let's assume we get an auth UID back (result.user.id)
        let authUid = result?.user?.id;

        if (functionError || !authUid) {
          console.error("User creation error or user already exists. We will just register the vendor_users entry.");
          // Fallback if edge function fails (e.g., user exists): store just the email mapping
        }

        // Upsert into vendor_users
        await supabase
          .from('vendor_users')
          .upsert({
            vendor_id: selectedAssessmentForEmail.vendor_id,
            email: emailForm.email,
            name: selectedAssessmentForEmail.vendor_registry?.primary_contact_name || 'Contato',
            auth_user_id: authUid || null, // Might be null if fallback occurs
            is_active: true
          }, { onConflict: 'vendor_id, email' });
      }

      // 4. Update the assessment status from draft to sent
      if (selectedAssessmentForEmail.status === 'draft') {
        await supabase
          .from('vendor_assessments')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', selectedAssessmentForEmail.id);
      }

      toast({
        title: "✅ Acesso Criado e Assessment Enviado",
        description: tempPassword ? `Uma senha temporária foi gerada: ${tempPassword}` : `Assessment enviado com sucesso.`,
        duration: 10000,
      });

      setShowEmailDialog(false);
      setEmailForm({ email: '', subject: '', message: '' });

      // Reload assessments to reflect any updates
      await loadAssessments();

    } catch (error: any) {
      console.error('Error in sendAssessmentEmail:', error);
      toast({
        title: "❌ Erro ao Enviar",
        description: `Não foi possível gerar acesso e enviar o email: ${error.message}`,
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
        description: `Usuário tem acesso à tabela.Encontrados ${count || 0} assessments.`,
      });
      return true;

    } catch (error) {
      console.error('❌ Permission check failed:', error);
      toast({
        title: "Erro na Verificação",
        description: `Falha ao verificar permissões: ${error.message} `,
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
          description: `Não conseguiu ler assessment: ${readError.message} `,
          variant: "destructive"
        });
        return;
      }

      console.log('🔍 STEP 5: Generate Test Link ID');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const secureHash = btoa(`${testAssessment.id}_${timestamp}_${randomStr} `).replace(/[+/=]/g, '');
      const testLinkId = `${secureHash.substring(0, 16)}_${timestamp.toString(36)} `;
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
          description: `${updateError.code}: ${updateError.message} `,
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
        description: `Falha durante debug: ${error.message} `,
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
          throw new Error(`Erro ${error.code}: ${error.message} `);
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

  // Open validation modal
  const openValidationModal = (assessment: VendorAssessment) => {
    setValidationAssessment(assessment);
    setShowValidationModal(true);
  };

  // Open password reset modal
  const openPasswordResetModal = async (assessment: VendorAssessment) => {
    setPasswordResetVendor({ id: assessment.vendor_id, name: assessment.vendor_registry?.name || 'Fornecedor' });
    setVendorAccesses([]);
    setShowPasswordResetModal(true);
    setIsLoadingAccess(true);
    try {
      const { data, error } = await supabase
        .from('vendor_portal_users')
        .select('email')
        .eq('vendor_id', assessment.vendor_id);
      if (error) throw error;
      if (data && data.length > 0) {
        setVendorAccesses(data.map(u => ({ email: u.email, password: '', isExisting: true })));
      } else {
        setVendorAccesses([{ email: '', password: '', isExisting: false }]);
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao buscar e-mails do fornecedor.", variant: "destructive" });
    } finally {
      setIsLoadingAccess(false);
    }
  };

  const submitAccessManagement = async () => {
    // Validate
    const hasInvalidRow = vendorAccesses.some(v =>
      (!v.isExisting && (!v.email.trim() || v.password.length < 6)) ||
      (v.isExisting && v.password.length > 0 && v.password.length < 6)
    );

    if (hasInvalidRow) {
      toast({ title: "Incompleto", description: "Preencha e-mail e senha (mín. 6 chars) para novos acessos. Senhas atualizadas também exigem 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsManagingAccess(true);
    let successCount = 0;
    const tenantIdToUse = effectiveTenantId === 'default' ? null : (effectiveTenantId || null);
    console.log('[submitAccessManagement] effectiveTenantId:', effectiveTenantId, '→ tenantIdToUse:', tenantIdToUse);

    try {
      for (const access of vendorAccesses) {
        const emailToUse = access.email.trim().toLowerCase();

        if (access.isExisting && access.password.length >= 6) {
          // Update password for existing user
          const { error } = await supabase.rpc('update_vendor_portal_password', {
            p_email: emailToUse,
            p_new_password: access.password
          });
          if (error) throw error;
          successCount++;
        } else if (!access.isExisting && emailToUse && access.password.length >= 6) {
          // Create new user
          const { data: rpcData, error: rpcError } = await supabase.rpc('create_vendor_auth_user', {
            p_email: emailToUse,
            p_password: access.password.trim(),
            p_name: passwordResetVendor.name,
            p_vendor_id: passwordResetVendor.id,
            p_tenant_id: tenantIdToUse
          });

          console.log('[create_vendor_auth_user] rpcData:', rpcData, 'rpcError:', rpcError);

          if (rpcError) throw rpcError;
          if (rpcData && !rpcData.success && !rpcData.error?.includes('Usuário já existe')) {
            throw new Error(rpcData.error || 'Erro desconhecido ao criar usuário');
          }

          successCount++;
        }
      }

      toast({ title: "Sucesso", description: `Acessos atualizados: ${successCount}. O fornecedor deverá alterar as senhas provisórias no próximo login.` });
      setShowPasswordResetModal(false);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Erro", description: error.message || "Falha ao atualizar acessos.", variant: "destructive" });
    } finally {
      setIsManagingAccess(false);
    }
  };

  // Open dispatch action plans modal
  const openDispatchModal = async (assessment: VendorAssessment) => {
    setDispatchAssessment(assessment);
    setDispatchLoading(true);
    setShowDispatchModal(true);
    setEditingPlanId(null);
    setEditingPlanData(null);

    try {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('modulo_origem', 'vendor_risk')
        .eq('entidade_origem_id', assessment.vendor_id)
        .in('status', ['aguardando_validacao', 'planejado', 'disponivel_fornecedor'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDispatchPlans(data || []);
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Não foi possível carregar os planos de ação.', variant: 'destructive' });
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleDispatchSavePlan = async (planId: string) => {
    if (!editingPlanData) return;
    try {
      const { error } = await supabase.from('action_plans').update({
        titulo: editingPlanData.title,
        descricao: editingPlanData.description,
        data_fim_planejada: editingPlanData.due_date || null,
        prioridade: editingPlanData.priority,
        updated_at: new Date().toISOString(),
      }).eq('id', planId);
      if (error) throw error;
      toast({ title: 'Plano atualizado', description: 'Alterações salvas.' });
      setEditingPlanId(null);
      // Refresh
      setDispatchPlans(prev => prev.map(p => p.id === planId ? { ...p, titulo: editingPlanData.title, descricao: editingPlanData.description, data_fim_planejada: editingPlanData.due_date, prioridade: editingPlanData.priority } : p));
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o plano.', variant: 'destructive' });
    }
  };

  const handleDispatchPlanToVendor = async (planId: string) => {
    try {
      const { error } = await supabase.from('action_plans').update({
        status: 'disponivel_fornecedor',
        updated_at: new Date().toISOString(),
      }).eq('id', planId);
      if (error) throw error;
      toast({ title: '✅ Plano Enviado!', description: 'O plano de ação está agora disponível no portal do fornecedor.' });
      setDispatchPlans(prev => prev.map(p => p.id === planId ? { ...p, status: 'disponivel_fornecedor' } : p));
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Não foi possível despachar o plano.', variant: 'destructive' });
    }
  };

  const handleDispatchAllToVendor = async () => {
    const toDispatch = dispatchPlans.filter(p => p.status !== 'disponivel_fornecedor');
    if (toDispatch.length === 0) {
      toast({ title: 'Aviso', description: 'Todos os planos já foram enviados ao fornecedor.' });
      return;
    }
    try {
      const ids = toDispatch.map(p => p.id);
      const { error } = await supabase.from('action_plans').update({
        status: 'disponivel_fornecedor',
        updated_at: new Date().toISOString(),
      }).in('id', ids);
      if (error) throw error;
      toast({ title: `✅ ${ids.length} plano(s) enviado(s)!`, description: 'Os planos estão agora disponíveis no portal do fornecedor.' });
      setDispatchPlans(prev => prev.map(p => ({ ...p, status: 'disponivel_fornecedor' })));
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Não foi possível despachar os planos.', variant: 'destructive' });
    }
  };

  // Handle validation submit
  const handleValidateAssessment = async (assessmentId: string, action: 'approved' | 'rejected' | 'requires_clarification' | 'unlock', data: any) => {
    try {
      const userTenantId = user?.tenantId;

      let newStatus = 'pending_validation';
      if (action === 'approved') newStatus = 'approved';
      if (action === 'rejected') newStatus = 'rejected';
      if (action === 'unlock') newStatus = 'in_progress'; // Reverte para o fornecedor editar

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          status: newStatus,
          internal_review_status: action === 'unlock' ? 'pending' : action,
          metadata: {
            ...validationAssessment?.metadata,
            validation: data, // Stores validation notes or the reason for unlocking
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessmentId)
        .eq('tenant_id', userTenantId);

      if (error) throw error;

      toast({
        title: action === 'approved' ? '✅ Assessment Aprovado' :
          action === 'rejected' ? '❌ Assessment Rejeitado' :
            action === 'unlock' ? '🔓 Assessment Desbloqueado' : '⚠️ Esclarecimento Solicitado',
        description: action === 'approved'
          ? 'O assessment foi validado e aprovado com sucesso.'
          : action === 'rejected'
            ? 'O assessment foi rejeitado. O fornecedor será notificado.'
            : action === 'unlock'
              ? 'O assessment foi reabilitado para edição pelo fornecedor.'
              : 'Foi solicitado esclarecimento ao fornecedor.',
      });

      await loadAssessments();
    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: 'Erro na Validação',
        description: error.message || 'Não foi possível validar o assessment.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete assessment
  const handleDeleteAssessment = async (assessmentId: string, assessmentName: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir o assessment "${assessmentName}" ? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      let query = supabase
        .from('vendor_assessments')
        .delete()
        .eq('id', assessmentId);

      if (effectiveTenantId && effectiveTenantId !== 'default') {
        query = query.eq('tenant_id', effectiveTenantId);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: '🗑️ Assessment Excluído',
        description: `O assessment "${assessmentName}" foi excluído com sucesso.`,
      });

      await loadAssessments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Erro ao Excluir',
        description: error.message || 'Não foi possível excluir o assessment.',
        variant: 'destructive',
      });
    }
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
      case 'in_progress': return <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 shadow-sm">Em Andamento</Badge>;
      case 'pending_validation': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 animate-pulse shadow-sm">Aguard. Validação</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm">Concluído</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30 shadow-sm">Aprovado</Badge>;
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Total Assessments
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {currentAssessments.length}
                </p>
              </div>
              <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Em Andamento
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {currentAssessments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Concluídos
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {currentAssessments.filter(a => ['completed', 'approved'].includes(a.status)).length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Atrasados
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {currentAssessments.filter(a => new Date(a.due_date) < new Date() && !['completed', 'approved'].includes(a.status)).length}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {/* Main Content */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-base sm:text-xl">Assessments de Fornecedores</CardTitle>
              {pendingVendorAssessments.length > 0 && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                  {pendingVendorAssessments.length} aguardando resposta
                </Badge>
              )}
            </div>

            {pendingVendorAssessments.length > 0 && (
              <Badge variant="outline" className="sm:hidden w-full justify-center bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                {pendingVendorAssessments.length} aguardando resposta
              </Badge>
            )}

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowNewAssessmentDialog(true)}
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto text-[10px] sm:text-sm h-9 sm:h-10"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                Novo Assessment
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 w-full">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 sm:mb-6 p-4 sm:bg-muted/30 rounded-none sm:rounded-lg">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <Label htmlFor="filter" className="text-[10px] sm:text-sm">Filtrar por:</Label>
                <Select value={currentSelectedFilter} onValueChange={setLocalSelectedFilter}>
                  <SelectTrigger className="w-full sm:w-48 text-[10px] sm:text-sm h-8 sm:h-10">
                    <SelectValue placeholder="Selecione um filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="awaiting_response">Aguardando Resposta</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="pending_validation">Aguardando Validação</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="overdue">Atrasados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <Label htmlFor="search" className="text-[10px] sm:text-sm">Buscar:</Label>
                <Input
                  id="search"
                  placeholder="Nome do assessment ou fornecedor..."
                  value={currentSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full sm:w-64 text-[10px] sm:text-sm h-8 sm:h-10"
                />
              </div>
            </div>
          </div>

          <div className="w-full pb-4 sm:pb-0 space-y-4">
            {currentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-sm text-muted-foreground">Carregando assessments...</span>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCheck className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Nenhum assessment encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou crie um novo assessment.</p>
              </div>
            ) : (
              filteredAssessments.map((assessment) => {
                const isExpanded = expandedCards.includes(assessment.id);
                return (
                  <Card
                    key={assessment.id}
                    className={`overflow-hidden transition-all duration-200 border ${assessment.status === 'pending_validation'
                      ? 'border-amber-500/50 shadow-sm shadow-amber-500/10'
                      : assessment.status === 'sent' && assessment.public_link && !assessment.responses
                        ? 'border-orange-500/50 shadow-sm shadow-orange-500/10'
                        : ''
                      }`}
                  >
                    {/* Compact Header row (always visible) */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card hover:bg-muted/30 transition-colors">

                      {/* Left section: Name and Vendor */}
                      <div className="flex-1 min-w-0 pr-4 w-full sm:w-auto">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-base truncate">{assessment.assessment_name}</h3>
                            {assessment.id.startsWith('vendor-') && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                Fornc
                              </Badge>
                            )}
                            {assessment.metadata?.selected_in_onboarding && (
                              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                                Onboarding
                              </Badge>
                            )}
                          </div>

                          {/* Mobile Actions Dropdown */}
                          <div className="sm:hidden block">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => {
                                  setTimeout(() => {
                                    console.log('Clicou em editar:', assessment.id);
                                    openAssessmentEditor(assessment);
                                  }, 0);
                                }}><Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Editar Assessment</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setTimeout(() => {
                                    console.log('Clicou em preview:', assessment.id);
                                    openPreviewDialog(assessment);
                                  }, 0);
                                }}><Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Assessment Preview</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setTimeout(() => {
                                    console.log('Clicou em detalhes:', assessment.id);
                                    setSelectedAssessment(assessment);
                                    setShowAssessmentDetails(true);
                                  }, 0);
                                }}><FileText className="h-4 w-4 mr-2" />Visualizar Detalhes</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => {
                                  setTimeout(() => {
                                    openPasswordResetModal(assessment);
                                  }, 0);
                                }}><KeyRound className="h-4 w-4 mr-2" />Redefinir Senha do Fornecedor</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(assessment.status === 'pending_validation' || assessment.status === 'completed' || assessment.status === 'approved') && (
                                  <>
                                    <DropdownMenuItem className="text-amber-700 font-medium" onSelect={() => {
                                      setTimeout(() => {
                                        openValidationModal(assessment);
                                      }, 0);
                                    }}><Shield className="h-4 w-4 mr-2" />Validar Assessment</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {(assessment.status === 'completed' || assessment.status === 'approved') && (
                                  <>
                                    <DropdownMenuItem className="text-emerald-700 font-medium" onSelect={() => {
                                      setTimeout(() => {
                                        openDispatchModal(assessment);
                                      }, 0);
                                    }}>
                                      <Send className="h-4 w-4 mr-2" />Despachar Planos de Ação
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {/* Removed Public Link shortcut as we now use Vendor Portal */}
                                <DropdownMenuItem onSelect={() => {
                                  setTimeout(() => {
                                    console.log('Clicou em enviar email:', assessment.id);
                                    openEmailDialog(assessment);
                                  }, 0);
                                }}><Send className="h-4 w-4 mr-2" />Enviar Assessment</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onSelect={() => {
                                  setTimeout(() => {
                                    handleDeleteAssessment(assessment.id, assessment.assessment_name);
                                  }, 0);
                                }}>
                                  <Trash2 className="h-4 w-4 mr-2" />Excluir Assessment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Users className="h-3.5 w-3.5 mr-1.5" />
                          <span className="truncate">{assessment.vendor_registry?.name}</span>
                          <span className="mx-2 text-muted-foreground/40">•</span>
                          <span className="truncate hidden sm:inline-block">{assessment.vendor_registry?.primary_contact_email}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="text-[10px] capitalize font-medium">{(assessment.assessment_type || 'padrão').replace('_', ' ')}</Badge>
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md truncate max-w-[200px]">
                            {assessment.vendor_assessment_frameworks?.name || assessment.metadata?.template_name || assessment.metadata?.vendor_framework_name || 'Framework'}
                          </div>
                        </div>
                      </div>

                      {/* Middle section: Status & Progress */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-48 gap-3 sm:gap-2">
                        <div className="flex flex-col sm:items-end w-1/2 sm:w-full">
                          <span className="text-xs text-muted-foreground mb-1 block sm:hidden">Status</span>
                          {getStatusBadge(assessment.status, assessment.due_date, assessment)}
                        </div>
                        <div className="w-1/2 sm:w-full flex flex-col sm:items-end">
                          <div className="flex items-center gap-2 w-full justify-end mb-1">
                            <span className="text-[10px] sm:text-xs font-medium">{assessment.progress_percentage || 0}%</span>
                          </div>
                          <Progress value={assessment.progress_percentage || 0} className="h-1.5 w-full sm:w-32 bg-muted-foreground/10" />
                        </div>
                      </div>

                      {/* Right section: Expand Toggle & Desktop Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">

                        {/* Desktop Actions Dropdown */}
                        <div className="hidden sm:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <span className="mr-2">Ações</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => {
                                setTimeout(() => {
                                  console.log('Clicou em editar:', assessment.id);
                                  openAssessmentEditor(assessment);
                                }, 0);
                              }}><Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Editar Assessment</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => {
                                setTimeout(() => {
                                  console.log('Clicou em preview:', assessment.id);
                                  openPreviewDialog(assessment);
                                }, 0);
                              }}><Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Assessment Preview</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => {
                                setTimeout(() => {
                                  console.log('Clicou em detalhes:', assessment.id);
                                  setSelectedAssessment(assessment);
                                  setShowAssessmentDetails(true);
                                }, 0);
                              }}><FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Visualizar Detalhes</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => {
                                setTimeout(() => {
                                  openPasswordResetModal(assessment);
                                }, 0);
                              }}><KeyRound className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Redefinir Senha do Fornecedor</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(assessment.status === 'pending_validation' || assessment.status === 'completed' || assessment.status === 'approved') && (
                                <>
                                  <DropdownMenuItem className="text-amber-700 font-medium" onSelect={() => {
                                    setTimeout(() => {
                                      openValidationModal(assessment);
                                    }, 0);
                                  }}>
                                    <Shield className="h-4 w-4 mr-2" />Validar Assessment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {(assessment.status === 'completed' || assessment.status === 'approved') && (
                                <>
                                  <DropdownMenuItem className="text-emerald-700 font-medium" onSelect={() => {
                                    setTimeout(() => {
                                      openDispatchModal(assessment);
                                    }, 0);
                                  }}>
                                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Despachar Planos de Ação
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onSelect={() => {
                                setTimeout(() => {
                                  console.log('Clicou em link público:', assessment.id);
                                  openPublicLinkDialog(assessment);
                                }, 0);
                              }}><Link className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Gerar/Ver Link Público</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => {
                                setTimeout(() => {
                                  console.log('Clicou em enviar email:', assessment.id);
                                  openEmailDialog(assessment);
                                }, 0);
                              }}><Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Enviar Assessment</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onSelect={() => {
                                setTimeout(() => {
                                  handleDeleteAssessment(assessment.id, assessment.assessment_name);
                                }, 0);
                              }}>
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Excluir Assessment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Expand Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCard(assessment.id)}
                          className="h-8 px-2 flex-grow sm:flex-grow-0"
                        >
                          <span className="sm:hidden mr-2">{isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content View */}
                    {isExpanded && (
                      <div className="border-t border-border/30 bg-muted/5 p-6 text-sm animate-in slide-in-from-top-2 rounded-b-xl shadow-inner transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                          {/* Column 1: Core Details */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
                                <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />Detalhes do Assessment</h4>
                              <div className="space-y-3">
                                <div className="flex flex-col bg-background/50 rounded-lg p-3 border border-border/40">
                                  <span className="text-muted-foreground text-[10px] uppercase font-semibold mb-1 tracking-widest">Prazo de Resposta</span>
                                  <span className="font-medium flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-primary/70" />
                                    {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <div className="flex flex-col bg-background/50 rounded-lg p-3 border border-border/40">
                                  <span className="text-muted-foreground text-[10px] uppercase font-semibold mb-1 tracking-widest">Prioridade</span>
                                  <Badge variant="outline" className={`w-fit capitalize shadow-sm ${assessment.priority === 'urgent' ? 'border-red-500/50 text-red-600 bg-red-500/5 dark:text-red-400' :
                                    assessment.priority === 'high' ? 'border-orange-500/50 text-orange-600 bg-orange-500/5 dark:text-orange-400' :
                                      assessment.priority === 'medium' ? 'border-yellow-500/50 text-yellow-600 bg-yellow-500/5 dark:text-yellow-400' : 'border-blue-500/50 text-blue-600 bg-blue-500/5 dark:text-blue-400'
                                    }`}>
                                    {assessment.priority === 'urgent' ? 'Urgente' :
                                      assessment.priority === 'high' ? 'Alta' :
                                        assessment.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </Badge>
                                </div>
                                {assessment.vendor_submitted_at && (
                                  <div className="flex flex-col bg-background/50 rounded-lg p-3 border border-green-500/20 dark:border-green-500/10">
                                    <span className="text-green-600/70 dark:text-green-400/70 text-[10px] uppercase font-semibold mb-1 tracking-widest">Submetido em</span>
                                    <span className="font-medium flex items-center text-sm">
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                      {new Date(assessment.vendor_submitted_at).toLocaleDateString('pt-BR')} às {new Date(assessment.vendor_submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Maturity & Score Results */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
                                <ActivitySquare className="h-3.5 w-3.5 mr-2 opacity-70" />Maturidade e Pontuação</h4>

                              {assessment.overall_score !== undefined && assessment.overall_score !== null ? (
                                <div className="space-y-3">
                                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 transition-all hover:bg-primary/10 shadow-sm">
                                    <div className="flex items-end justify-between mb-3">
                                      <span className="text-sm font-medium text-foreground">Score Geral</span>
                                      <span className="text-2xl font-bold tracking-tight text-primary">{assessment.overall_score.toFixed(1)}<span className="text-xs text-primary/60 font-medium ml-1">/ 100</span></span>
                                    </div>
                                    <Progress value={assessment.overall_score} className="h-2 rounded-full" />
                                  </div>

                                  {assessment.metadata?.validation?.maturityLevel && (
                                    <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg p-3 px-4 shadow-sm">
                                      <span className="text-sm font-medium text-muted-foreground">Nível de Maturidade</span>
                                      <Badge variant="outline" className="font-semibold bg-primary/10 text-primary border-primary/20 px-3 py-1">
                                        {assessment.metadata.validation.maturityLevel}
                                      </Badge>
                                    </div>
                                  )}

                                  {assessment.risk_level && (
                                    <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg p-3 px-4 shadow-sm">
                                      <span className="text-sm font-medium text-muted-foreground">Classificação de Risco</span>
                                      <Badge variant="outline" className={`font-semibold px-3 py-1 shadow-sm ${assessment.risk_level === 'critical' ? 'bg-red-50 text-red-600 border-red-500/30' :
                                        assessment.risk_level === 'high' ? 'bg-orange-50 text-orange-600 border-orange-500/30' :
                                          assessment.risk_level === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-500/30 bg-opacity-50' : 'bg-green-50 text-green-600 border-green-500/30'
                                        }`}>
                                        {assessment.risk_level === 'critical' ? 'Risco Crítico' :
                                          assessment.risk_level === 'high' ? 'Risco Alto' :
                                            assessment.risk_level === 'medium' ? 'Risco Médio' : 'Risco Baixo'}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-[140px] flex flex-col items-center justify-center p-6 border rounded-xl bg-background/50 border-dashed border-border/60">
                                  <Brain className="h-8 w-8 text-muted-foreground/40 mb-3" />
                                  <span className="text-xs text-muted-foreground text-center font-medium max-w-[200px] leading-relaxed">A análise de maturidade estará disponível após a validação.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Column 3: Validation Info */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
                                <ShieldCheck className="h-3.5 w-3.5 mr-2 opacity-70" />Validação</h4>

                              <div className="space-y-3">
                                <div className="flex flex-col gap-1.5 bg-background/50 rounded-lg p-3 border border-border/40">
                                  <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-widest">Status da Revisão</span>
                                  <div>
                                    <Badge variant="outline" className={`w-fit shadow-sm px-2.5 py-0.5
                                      ${assessment.internal_review_status === 'approved' ? 'bg-green-50 text-green-700 border-green-500/30' : ''}
                                      ${assessment.internal_review_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-500/30' : ''}
                                      ${assessment.internal_review_status === 'requires_clarification' ? 'bg-yellow-50 text-yellow-700 border-yellow-500/40' : ''}
                                      ${assessment.internal_review_status === 'pending' || !assessment.internal_review_status ? 'bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700' : ''}
    `}>
                                      {assessment.internal_review_status === 'approved' ? 'Aprovado internamente' :
                                        assessment.internal_review_status === 'rejected' ? 'Rejeitado internamente' :
                                          assessment.internal_review_status === 'requires_clarification' ? 'Ajustes Solicitados' : 'Pendente de análise'}
                                    </Badge>
                                  </div>
                                </div>

                                {(assessment.status === 'pending_validation' || assessment.status === 'completed' || assessment.status === 'approved') && (
                                  <div className="mt-4 pt-4 border-t border-border/50">
                                    {(!assessment.internal_review_status || assessment.internal_review_status === 'pending') ? (
                                      <p className="text-[11px] text-muted-foreground mb-3 font-medium flex items-start leading-tight">
                                        <Info className="h-3.5 w-3.5 mr-1.5 shrink-0 text-primary/70" />
                                        Uma validação manual deste item está pendente. Avalie as respostas do fornecedor.
                                      </p>
                                    ) : (
                                      <p className="text-[11px] text-muted-foreground mb-3 font-medium flex items-start leading-tight">
                                        <Info className="h-3.5 w-3.5 mr-1.5 shrink-0 text-primary/70" />
                                        Validação concluída. Você pode revisar o histórico e a pontuação.
                                      </p>
                                    )}
                                    <Button
                                      className={`w-full text-xs h-9 shadow-md hover:shadow-lg transition-all border font-semibold group ${(!assessment.internal_review_status || assessment.internal_review_status === 'pending') ? 'border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground' : 'border-muted bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                      size="sm"
                                      onClick={() => openValidationModal(assessment)}
                                    >
                                      {(!assessment.internal_review_status || assessment.internal_review_status === 'pending') ? (
                                        <><Shield className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> Validar Respostas e Maturidade</>
                                      ) : (
                                        <><ShieldCheck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> Visualizar Validação / Histórico</>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {assessment.metadata?.validation?.observation && (
                                  <div className="mt-3 text-[11px] border border-border/60 rounded-lg p-3 bg-muted/30 relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-lg"></div>
                                    <span className="font-bold text-foreground/80 block mb-1.5 uppercase tracking-wide">Observações do Validador:</span>
                                    <span className="text-muted-foreground italic">&ldquo;{assessment.metadata.validation.observation}&rdquo;</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
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

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordResetModal} onOpenChange={setShowPasswordResetModal}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Gerenciar Acessos do Fornecedor
            </DialogTitle>
            <DialogDescription>
              Gerencie quem pode acessar o portal para responder aos assessments em nome de {passwordResetVendor?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 min-w-0">
            {isLoadingAccess ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
            ) : (
              <div className="space-y-4 overflow-x-hidden">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    Ao adicionar um novo usuário ou alterar uma senha, o fornecedor será obrigado a criar uma nova senha definitiva no seu primeiro acesso.
                  </p>
                </div>

                <div className="space-y-3 px-1">
                  {vendorAccesses.map((access, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-muted/40 p-3 rounded-lg border border-border/50 max-w-full">
                      <div className="w-full sm:flex-1 space-y-1.5 min-w-0">
                        <Label className="text-xs">E-mail</Label>
                        <Input
                          placeholder="e.g. fornecedor@empresa.com"
                          value={access.email}
                          disabled={access.isExisting}
                          onChange={(e) => {
                            const updated = [...vendorAccesses];
                            updated[idx].email = e.target.value;
                            setVendorAccesses(updated);
                          }}
                          className={`w-full ${access.isExisting ? 'bg-muted text-muted-foreground' : ''}`}
                        />
                        {access.isExisting && <span className="text-[10px] text-primary/70 font-medium px-1">Acesso Existente</span>}
                        {!access.isExisting && <span className="text-[10px] text-green-600/70 font-medium px-1">Novo Acesso</span>}
                      </div>

                      <div className="w-full sm:flex-1 space-y-1.5 min-w-0">
                        <Label className="text-xs">Senha Provisória <span className="text-muted-foreground font-normal">(min. 6 char)</span></Label>
                        <Input
                          placeholder={access.isExisting ? "Deixe em branco para manter" : "Senha provisória"}
                          value={access.password}
                          onChange={(e) => {
                            const updated = [...vendorAccesses];
                            updated[idx].password = e.target.value;
                            setVendorAccesses(updated);
                          }}
                          className="w-full"
                          type="text"
                        />
                      </div>

                      <div className="flex sm:self-end self-end w-auto pt-2 sm:pt-0 sm:pb-0.5">
                        {!access.isExisting && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => {
                              const updated = vendorAccesses.filter((_, i) => i !== idx);
                              setVendorAccesses(updated.length > 0 ? updated : [{ email: '', password: '', isExisting: false }]);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-start pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed"
                    onClick={() => setVendorAccesses(prev => [...prev, { email: '', password: '', isExisting: false }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Novo Acesso
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t mt-4">
            <Button variant="outline" onClick={() => setShowPasswordResetModal(false)}>Cancelar</Button>
            <Button
              onClick={submitAccessManagement}
              disabled={isManagingAccess || isLoadingAccess}
            >
              {isManagingAccess ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
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
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 [&>button.absolute]:hidden">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 pr-2 sm:pr-6">
                <div className="p-2 bg-primary/10 rounded-full shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl leading-tight">Detalhes do Assessment</DialogTitle>
                  <DialogDescription className="mt-1 text-xs sm:text-sm">
                    Visão geral e métricas do assessment.
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAssessmentDetails(false)} className="h-8 w-8 text-muted-foreground shrink-0 rounded-full -mr-2 mt-1">
                <X className="h-4 w-4" />
              </Button>
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
                                'bg-green-50 text-green-700 border-green-200'
                          }
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
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 [&>button.absolute]:hidden">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 pr-2 sm:pr-6">
                <div className="p-2 bg-primary/10 rounded-full shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl leading-tight">Enviar Assessment</DialogTitle>
                  <DialogDescription className="mt-1 text-xs sm:text-sm">
                    Envie o convite para o fornecedor responder ao questionário.
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowEmailDialog(false)} className="h-8 w-8 text-muted-foreground shrink-0 rounded-full -mr-2 mt-1">
                <X className="h-4 w-4" />
              </Button>
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
                      if (selectedAssessmentForEmail) {
                        const defaultSubject = `Assessment de Segurança - ${selectedAssessmentForEmail.assessment_name}`;
                        const portalUrl = `${window.location.origin}/vendor-portal/login`;
                        const defaultMessage = `Olá,

Você foi convidado(a) para responder um assessment de segurança através do nosso Portal de Fornecedores.

**Detalhes do Assessment:**
• Nome: ${selectedAssessmentForEmail.assessment_name}
• Fornecedor: ${selectedAssessmentForEmail.vendor_registry?.name}
• Prazo: ${new Date(selectedAssessmentForEmail.due_date).toLocaleDateString('pt-BR')}

**Acesso ao Portal:**
Link: ${portalUrl}
Seu Email: (Este endereço de email)
Sua Senha temporária: (Será gerada e enviada pelo sistema)

Por favor, faça login, verifique o assessment pendente e complete-o até a data limite.

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
                  {(modalVendors.length > 0 ? modalVendors : propVendors).map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}{vendor.status ? ` (${vendor.status})` : ''}
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
                      {fw.name} {fw.framework_type ? `(${fw.framework_type.toUpperCase()})` : ''}
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

            <Separator className="my-1" />
            <div className="space-y-3 bg-muted/20 p-3 rounded-md border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Acesso ao Portal do Fornecedor</h4>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setNewAssessmentForm(prev => ({ ...prev, vendor_emails: [...prev.vendor_emails, { email: '', password: '' }] }))}
                >
                  <Plus className="h-3 w-3 mr-1" />Add Email
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-tight">
                Cadastre um ou mais e-mails que terão acesso ao Portal. Cada usuário deve alterar sua senha no <strong>primeiro acesso</strong>.
              </p>
              <div className="space-y-2 mt-2">
                {newAssessmentForm.vendor_emails.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">{idx + 1}</div>
                    <Input
                      type="email"
                      value={entry.email}
                      onChange={e => setNewAssessmentForm(prev => {
                        const updated = [...prev.vendor_emails];
                        updated[idx] = { ...updated[idx], email: e.target.value };
                        return { ...prev, vendor_emails: updated };
                      })}
                      placeholder="email@fornecedor.com"
                      className="h-8 text-sm flex-1"
                    />
                    <Input
                      type="password"
                      value={entry.password}
                      onChange={e => setNewAssessmentForm(prev => {
                        const updated = [...prev.vendor_emails];
                        updated[idx] = { ...updated[idx], password: e.target.value };
                        return { ...prev, vendor_emails: updated };
                      })}
                      placeholder="Senha inicial"
                      className="h-8 text-sm w-32"
                    />
                    {newAssessmentForm.vendor_emails.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => setNewAssessmentForm(prev => ({ ...prev, vendor_emails: prev.vendor_emails.filter((_, i) => i !== idx) }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
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

      {/* Validation Modal */}
      {validationAssessment && (
        <AssessmentValidationModal
          isOpen={showValidationModal}
          onClose={() => { setShowValidationModal(false); setValidationAssessment(null); }}
          assessment={validationAssessment}
          onValidate={handleValidateAssessment}
        />
      )}
      {/* Dispatch Action Plans Modal */}
      <Dialog open={showDispatchModal} onOpenChange={(open) => { if (!open) { setShowDispatchModal(false); setDispatchAssessment(null); setDispatchPlans([]); setEditingPlanId(null); } }}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-emerald-600" />
              Despachar Planos de Ação ao Fornecedor
            </DialogTitle>
            <DialogDescription>
              Revise, edite e envie os planos de ação gerados automaticamente para o fornecedor <strong>{dispatchAssessment?.vendor_registry?.name}</strong>. Apenas planos com status <span className="font-medium text-teal-600">Disponível ao Fornecedor</span> aparecerão no portal.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 py-4">
            {dispatchLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : dispatchPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 border-dashed border-2 rounded-xl text-muted-foreground">
                <AlertCircleIcon className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Nenhum plano de ação encontrado para este fornecedor.</p>
                <p className="text-xs mt-1">Os planos são gerados automaticamente quando o assessment é submetido com respostas abaixo do esperado.</p>
              </div>
            ) : (
              dispatchPlans.map((plan) => {
                const isDispatched = plan.status === 'disponivel_fornecedor';
                const isEditing = editingPlanId === plan.id;
                const priorityMap: Record<string, string> = { critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' };
                return (
                  <div key={plan.id} className={`border rounded-xl p-4 transition-all ${isDispatched ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20' : 'border-border bg-card'}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        {isEditing && editingPlanData ? (
                          <div className="space-y-2">
                            <Input
                              value={editingPlanData.title}
                              onChange={(e) => setEditingPlanData({ ...editingPlanData, title: e.target.value })}
                              className="font-medium h-8 text-sm"
                              placeholder="Título do plano"
                            />
                            <Textarea
                              value={editingPlanData.description}
                              onChange={(e) => setEditingPlanData({ ...editingPlanData, description: e.target.value })}
                              className="text-sm"
                              rows={2}
                              placeholder="Descrição"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground uppercase font-semibold">Prioridade</Label>
                                <select
                                  value={editingPlanData.priority}
                                  onChange={(e) => setEditingPlanData({ ...editingPlanData, priority: e.target.value })}
                                  className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1"
                                >
                                  <option value="critica">Crítica</option>
                                  <option value="alta">Alta</option>
                                  <option value="media">Média</option>
                                  <option value="baixa">Baixa</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground uppercase font-semibold">Prazo</Label>
                                <Input
                                  type="date"
                                  value={editingPlanData.due_date}
                                  onChange={(e) => setEditingPlanData({ ...editingPlanData, due_date: e.target.value })}
                                  className="h-8 text-sm mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-sm truncate">{plan.titulo}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.descricao}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {plan.data_fim_planejada && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(plan.data_fim_planejada).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                              {plan.prioridade && <span className="capitalize font-medium">{priorityMap[plan.prioridade] || plan.prioridade}</span>}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isDispatched ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">✓ Enviado</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">Aguardando Envio</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      {isEditing ? (
                        <>
                          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleDispatchSavePlan(plan.id)}>
                            <Save className="h-3 w-3 mr-1.5" />Salvar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingPlanId(null)}>
                            <X className="h-3 w-3 mr-1" />Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          {!isDispatched && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
                              onClick={() => { setEditingPlanId(plan.id); setEditingPlanData({ title: plan.titulo, description: plan.descricao || '', due_date: plan.data_fim_planejada || '', priority: plan.prioridade || 'media' }); }}>
                              <Edit className="h-3 w-3 mr-1.5" />Editar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className={`h-7 text-xs ${isDispatched ? 'text-muted-foreground bg-muted cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                            disabled={isDispatched}
                            onClick={() => handleDispatchPlanToVendor(plan.id)}
                          >
                            <Send className="h-3 w-3 mr-1.5" />{isDispatched ? 'Já enviado' : 'Enviar ao Fornecedor'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {dispatchPlans.filter(p => p.status === 'disponivel_fornecedor').length} de {dispatchPlans.length} plano(s) enviado(s)
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowDispatchModal(false)}>Fechar</Button>
              <Button
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                disabled={dispatchPlans.every(p => p.status === 'disponivel_fornecedor') || dispatchPlans.length === 0}
                onClick={handleDispatchAllToVendor}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Todos ao Fornecedor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >

  );
};