import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  FileCheck,
  AlertTriangle,
  Shield,
  Calendar,
  DollarSign,
  Building,
  Phone,
  Mail,
  Globe,
  Star,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  Brain,
  Zap,
  Search,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  KeyRound,
  UserPlus,
  ShieldCheck,
  ShieldOff,
  Copy
} from 'lucide-react';
import { useVendorRiskManagement, VendorRegistry, VendorFilters } from '@/hooks/useVendorRiskManagement';
import { VendorOnboardingWorkflow } from '../workflows/VendorOnboardingWorkflow';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VendorTableViewProps {
  searchTerm: string;
  selectedFilter: string;
  loading?: boolean;
  showFilters?: boolean;
  assessments?: any[];
}

interface VendorFormData {
  name: string;
  legal_name: string;
  tax_id: string;
  website: string;
  description: string;
  business_category: string;
  vendor_type: 'strategic' | 'operational' | 'transactional' | 'critical';
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  annual_spend: number;
  contract_value: number;
  contract_start_date: string;
  contract_end_date: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
}

export const VendorTableView: React.FC<VendorTableViewProps> = ({
  searchTerm,
  selectedFilter,
  loading: externalLoading,
  showFilters,
  assessments = []
}) => {
  const {
    vendors,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    loading
  } = useVendorRiskManagement();

  const { toast } = useToast();

  // State management
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRegistry | null>(null);
  const [viewingVendor, setViewingVendor] = useState<VendorRegistry | null>(null);
  const [showOnboardingWorkflow, setShowOnboardingWorkflow] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [expandedProcessDetails, setExpandedProcessDetails] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<VendorFilters>({});
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [portalUsers, setPortalUsers] = useState<Record<string, any[]>>({});
  const [loadingPortalUsers, setLoadingPortalUsers] = useState<string | null>(null);
  const [newPortalUserEmail, setNewPortalUserEmail] = useState('');
  const [newPortalUserPassword, setNewPortalUserPassword] = useState('');
  const [showAddPortalUser, setShowAddPortalUser] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<VendorFormData>>({
    vendor_type: 'operational',
    criticality_level: 'medium',
    annual_spend: 0,
    contract_value: 0
  });

  // Load vendors on mount and when filters change
  useEffect(() => {
    const filters: VendorFilters = {
      search: localSearchTerm,
      ...localFilters
    };

    // Apply selectedFilter from parent
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'critical') {
        filters.criticality_level = ['critical'];
      } else if (selectedFilter === 'high-risk') {
        filters.criticality_level = ['high', 'critical'];
      } else if (selectedFilter === 'pending-assessment') {
        // This would need additional logic to filter by assessment status
      }
    }

    fetchVendors(filters);
  }, [localSearchTerm, selectedFilter, localFilters, fetchVendors]);

  // Sync external searchTerm with local state
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Sort vendors
  const sortedVendors = [...vendors].sort((a, b) => {
    const aVal = a[sortBy as keyof VendorRegistry];
    const bVal = b[sortBy as keyof VendorRegistry];

    if (aVal === null || aVal === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (bVal === null || bVal === undefined) return sortOrder === 'asc' ? 1 : -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Paginate vendors
  const totalPages = Math.ceil(sortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = sortedVendors.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev.filter(id => id !== vendorId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVendors(paginatedVendors.map(v => v.id));
    } else {
      setSelectedVendors([]);
    }
  };

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVendor) {
      await updateVendor(editingVendor.id, formData);
      setEditingVendor(null);
    } else {
      await createVendor(formData as Omit<VendorRegistry, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>);
      setShowCreateDialog(false);
    }

    setFormData({
      vendor_type: 'operational',
      criticality_level: 'medium',
      annual_spend: 0,
      contract_value: 0
    });
  };

  const handleEdit = (vendor: VendorRegistry) => {
    setFormData(vendor);
    setEditingVendor(vendor);
    setShowCreateDialog(true);
  };

  // Nova função para editar através do wizard completo
  const handleEditWithWorkflow = (vendor: VendorRegistry) => {
    setEditingVendorId(vendor.id);
    setShowOnboardingWorkflow(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await deleteVendor(vendorId);
    }
  };

  // Badge styling functions with proper dark/light theme support
  const getRiskLevelBadgeStyle = (riskScore?: number) => {
    if (!riskScore) return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';

    if (riskScore >= 4.5) return 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700';
    if (riskScore >= 3.5) return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:text-white dark:border-orange-700';
    if (riskScore >= 2.5) return 'bg-yellow-500 text-white border-yellow-600 dark:bg-yellow-600 dark:text-white dark:border-yellow-700';
    return 'bg-green-500 text-white border-green-600 dark:bg-green-600 dark:text-white dark:border-green-700';
  };

  // Análise de status do processo de onboarding (Etapas 1-4)
  const analyzeVendorProcessStatus = (vendor: VendorRegistry) => {
    // Etapa 1: Dados Básicos
    const step1Complete = !!(vendor.name && vendor.legal_name && vendor.tax_id &&
      vendor.primary_contact_name && vendor.primary_contact_email);

    // Etapa 2: Due Diligence (baseado no progresso)
    const step2Complete = vendor.onboarding_progress >= 40;

    // Etapa 3: Assessment (baseado no progresso e se tem score de risco válido)
    const step3Complete = vendor.onboarding_progress >= 60 && vendor.risk_score !== undefined && vendor.risk_score !== null;

    // Etapa 4: Contrato (baseado no progresso)
    const step4Complete = vendor.onboarding_progress >= 80;

    // Verificar se todas as etapas estão completas
    const allStepsComplete = step1Complete && step2Complete && step3Complete && step4Complete;

    // Verificar se tem assessment respondido e planos de ação cumpridos (validar nulo)
    const hasAssessmentCompleted = !!vendor.last_assessment_date;
    const hasActionPlanCompleted = vendor.onboarding_status === 'completed';

    // Verificar prazos (simular verificação de prazo)
    const now = new Date();
    const assessmentDue = vendor.next_assessment_due ? new Date(vendor.next_assessment_due) : null;
    const withinDeadline = assessmentDue ? now <= assessmentDue : true;

    // Lógica de status
    if (allStepsComplete && hasAssessmentCompleted && hasActionPlanCompleted) {
      return {
        status: 'adequate',
        label: 'Adequado',
        description: 'Todas as etapas completas, assessment respondido e planos de ação cumpridos'
      };
    } else if (allStepsComplete && withinDeadline) {
      return {
        status: 'in_compliance',
        label: 'Em Adequação',
        description: 'Etapas completas, dentro do prazo para assessment ou plano de ação'
      };
    } else {
      return {
        status: 'inadequate',
        label: 'Inadequado',
        description: 'Etapas incompletas ou fora do prazo'
      };
    }
  };

  // Estilo do badge de status do processo
  const getProcessStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'adequate': return 'bg-green-500 text-white border-green-600 dark:bg-green-600 dark:text-white dark:border-green-700';
      case 'in_compliance': return 'bg-yellow-500 text-white border-yellow-600 dark:bg-yellow-600 dark:text-white dark:border-yellow-700';
      case 'inadequate': return 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700';
      default: return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';
    }
  };

  // Detalhamento das etapas do processo
  const getProcessStepsDetail = (vendor: VendorRegistry) => {
    const step1Complete = !!(vendor.name && vendor.legal_name && vendor.tax_id &&
      vendor.primary_contact_name && vendor.primary_contact_email);
    const step2Complete = vendor.onboarding_progress >= 40;
    const step3Complete = vendor.onboarding_progress >= 60 && vendor.risk_score !== undefined;
    const step4Complete = vendor.onboarding_progress >= 80;

    return {
      step1: { complete: step1Complete, label: 'Dados Básicos', progress: step1Complete ? 100 : 0 },
      step2: { complete: step2Complete, label: 'Due Diligence', progress: Math.min(vendor.onboarding_progress, 40) * 2.5 },
      step3: { complete: step3Complete, label: 'Assessment', progress: step3Complete ? 100 : Math.max(0, (vendor.onboarding_progress - 40) * 5) },
      step4: { complete: step4Complete, label: 'Contrato', progress: step4Complete ? 100 : Math.max(0, (vendor.onboarding_progress - 60) * 5) }
    };
  };

  const getRiskLevelText = (riskScore?: number) => {
    if (!riskScore) return 'N/A';

    if (riskScore >= 4.5) return 'Crítico';
    if (riskScore >= 3.5) return 'Alto';
    if (riskScore >= 2.5) return 'Médio';
    return 'Baixo';
  };

  // Status badge styling with dark/light theme support
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white border-green-600 dark:bg-green-600 dark:text-white dark:border-green-700';
      case 'inactive': return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';
      case 'suspended': return 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700';
      case 'onboarding': return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-700';
      case 'offboarding': return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:text-white dark:border-orange-700';
      default: return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';
    }
  };

  // Criticality badge styling with dark/light theme support
  const getCriticalityBadgeStyle = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700';
      case 'high': return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:text-white dark:border-orange-700';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-600 dark:bg-yellow-600 dark:text-white dark:border-yellow-700';
      case 'low': return 'bg-green-500 text-white border-green-600 dark:bg-green-600 dark:text-white dark:border-green-700';
      default: return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';
    }
  };

  // Vendor type badge styling
  const getVendorTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'strategic': return 'bg-purple-500 text-white border-purple-600 dark:bg-purple-600 dark:text-white dark:border-purple-700';
      case 'operational': return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-700';
      case 'transactional': return 'bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:text-white dark:border-teal-700';
      case 'critical': return 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700';
      default: return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';
    }
  };

  // Legacy functions for compatibility
  const getRiskLevelStyle = (riskScore?: number) => {
    if (!riskScore) return 'text-gray-600 bg-gray-100';

    if (riskScore >= 4.5) return 'text-red-700 bg-red-100 border-red-200';
    if (riskScore >= 3.5) return 'text-orange-700 bg-orange-100 border-orange-200';
    if (riskScore >= 2.5) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-green-700 bg-green-100 border-green-200';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border-green-200';
      case 'inactive': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'suspended': return 'text-red-700 bg-red-100 border-red-200';
      case 'onboarding': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'offboarding': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      case 'onboarding': return 'Onboarding';
      case 'offboarding': return 'Offboarding';
      default: return status;
    }
  };

  const getVendorTypeText = (type: string) => {
    switch (type) {
      case 'strategic': return 'Estratégico';
      case 'operational': return 'Operacional';
      case 'transactional': return 'Transacional';
      case 'critical': return 'Crítico';
      default: return type;
    }
  };

  const getCriticalityText = (level: string) => {
    switch (level) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return level;
    }
  };

  // Portal user management functions
  const fetchPortalUsers = async (vendorId: string) => {
    setLoadingPortalUsers(vendorId);
    try {
      const { data, error } = await supabase
        .from('vendor_portal_users')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPortalUsers(prev => ({ ...prev, [vendorId]: data || [] }));
    } catch (e) {
      console.error('Error fetching portal users:', e);
    } finally {
      setLoadingPortalUsers(null);
    }
  };

  const handleAddPortalUser = async (vendorId: string) => {
    if (!newPortalUserEmail) return;
    try {
      // Create auth user via Supabase Auth
      const tempPassword = newPortalUserPassword || Math.random().toString(36).slice(-10) + 'A1!';
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newPortalUserEmail,
        password: tempPassword,
        options: { data: { role: 'vendor', vendor_id: vendorId } }
      });
      if (authError) throw authError;

      // Create vendor_portal_users record
      const vendor = vendors.find(v => v.id === vendorId);
      const { error: insertError } = await supabase
        .from('vendor_portal_users')
        .insert({
          email: newPortalUserEmail,
          vendor_id: vendorId,
          tenant_id: vendor?.tenant_id,
          is_active: true,
          force_password_change: true
        });
      if (insertError) throw insertError;

      toast({ title: 'Usuário criado', description: `Acesso criado para ${newPortalUserEmail}. Senha temporária: ${tempPassword}` });
      setNewPortalUserEmail('');
      setNewPortalUserPassword('');
      setShowAddPortalUser(null);
      fetchPortalUsers(vendorId);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Erro ao criar usuário', variant: 'destructive' });
    }
  };

  const handleTogglePortalUser = async (userId: string, vendorId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('vendor_portal_users')
        .update({ is_active: !currentActive })
        .eq('id', userId);
      if (error) throw error;
      toast({ title: currentActive ? 'Portal bloqueado' : 'Portal desbloqueado' });
      fetchPortalUsers(vendorId);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleResetPassword = async (portalUser: any) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(portalUser.email, {
        redirectTo: `${window.location.origin}/vendor-portal/reset-password`
      });
      if (error) throw error;
      toast({ title: 'E-mail enviado', description: `Link de redefinição enviado para ${portalUser.email}` });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleUpdateEmail = async (userId: string, vendorId: string, newEmail: string) => {
    try {
      const { error } = await supabase
        .from('vendor_portal_users')
        .update({ email: newEmail })
        .eq('id', userId);
      if (error) throw error;
      toast({ title: 'E-mail atualizado' });
      fetchPortalUsers(vendorId);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const toggleVendorExpand = (vendorId: string) => {
    if (expandedVendorId === vendorId) {
      setExpandedVendorId(null);
    } else {
      setExpandedVendorId(vendorId);
      if (!portalUsers[vendorId]) {
        fetchPortalUsers(vendorId);
      }
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Filters */}
      <Card className="overflow-hidden w-full">
        <CardContent className="p-3 sm:p-6 w-full">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-center w-full">
            <div className="w-full lg:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar fornecedores..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 w-full h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 lg:flex lg:flex-row gap-2 sm:gap-4 w-full lg:w-auto">

              <Select
                value={localFilters.status?.[0] || 'all'}
                onValueChange={(value) =>
                  setLocalFilters(prev => ({
                    ...prev,
                    status: value === 'all' ? undefined : [value]
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-36 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={localFilters.criticality_level?.[0] || 'all'}
                onValueChange={(value) =>
                  setLocalFilters(prev => ({
                    ...prev,
                    criticality_level: value === 'all' ? undefined : [value]
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-36 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={localFilters.vendor_type?.[0] || 'all'}
                onValueChange={(value) =>
                  setLocalFilters(prev => ({
                    ...prev,
                    vendor_type: value === 'all' ? undefined : [value]
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-36 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="strategic">Estratégico</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="transactional">Transacional</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setShowCreateDialog(true)}
                className="col-span-3 lg:col-span-1 h-9 sm:h-10 text-[10px] sm:text-sm w-full lg:w-auto"
              >
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Novo Fornecedor</span>
                <span className="inline sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Cards Grid */}
      <div className="space-y-3">
        {paginatedVendors.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
            </CardContent>
          </Card>
        )}

        {paginatedVendors.map((vendor) => {
          const processStatus = analyzeVendorProcessStatus(vendor);
          const isExpanded = expandedVendorId === vendor.id;

          return (
            <Card key={vendor.id} className={`overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-primary/30' : 'hover:shadow-md'}`}>
              {/* Card Header - Always visible */}
              <div
                className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleVendorExpand(vendor.id)}
              >
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-white">{vendor.name.charAt(0).toUpperCase()}</span>
                </div>

                {/* Name + info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{vendor.name}</h3>
                    <Badge className={`text-[8px] sm:text-[10px] px-1.5 py-0 shrink-0 ${getStatusBadgeStyle(vendor.status)}`}>
                      {getStatusText(vendor.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {vendor.legal_name || vendor.business_category || 'Sem categoria'}
                    </span>
                    {vendor.tax_id && (
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">• {vendor.tax_id}</span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <Badge className={`text-[9px] px-1.5 py-0 ${getVendorTypeBadgeStyle(vendor.vendor_type)}`}>
                    {getVendorTypeText(vendor.vendor_type)}
                  </Badge>
                  <Badge className={`text-[9px] px-1.5 py-0 ${getCriticalityBadgeStyle(vendor.criticality_level)}`}>
                    {getCriticalityText(vendor.criticality_level)}
                  </Badge>
                  <Badge className={`text-[9px] px-1.5 py-0 ${getRiskLevelBadgeStyle(vendor.risk_score)}`}>
                    {getRiskLevelText(vendor.risk_score)}
                  </Badge>
                  <Badge className={`text-[9px] px-1.5 py-0 ${getProcessStatusBadgeStyle(processStatus.status)}`}>
                    {processStatus.label}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleEditWithWorkflow(vendor); }} title="Editar">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(vendor.id); }} title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Mobile Badges Row */}
              <div className="flex sm:hidden items-center gap-1 px-3 pb-2 flex-wrap">
                <Badge className={`text-[8px] px-1 py-0 ${getVendorTypeBadgeStyle(vendor.vendor_type)}`}>{getVendorTypeText(vendor.vendor_type)}</Badge>
                <Badge className={`text-[8px] px-1 py-0 ${getCriticalityBadgeStyle(vendor.criticality_level)}`}>{getCriticalityText(vendor.criticality_level)}</Badge>
                <Badge className={`text-[8px] px-1 py-0 ${getRiskLevelBadgeStyle(vendor.risk_score)}`}>{getRiskLevelText(vendor.risk_score)}</Badge>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t">
                  <Tabs defaultValue="cadastro" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-9">
                      <TabsTrigger value="cadastro" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                        <Building className="h-3.5 w-3.5 mr-1.5" /> Cadastro
                      </TabsTrigger>
                      <TabsTrigger value="portal" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                        <Globe className="h-3.5 w-3.5 mr-1.5" /> Portal do Fornecedor
                      </TabsTrigger>
                    </TabsList>

                    {/* ── TAB: Cadastro ──────────────────────────────────────────── */}
                    <TabsContent value="cadastro" className="p-4 mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Dados Básicos */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados Básicos</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] text-muted-foreground">Razão Social</span>
                              <p className="text-sm font-medium">{vendor.legal_name || '—'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">CNPJ/CPF</span>
                              <p className="text-sm font-medium">{vendor.tax_id || '—'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">Categoria</span>
                              <p className="text-sm">{vendor.business_category || '—'}</p>
                            </div>
                            {vendor.website && (
                              <div>
                                <span className="text-[10px] text-muted-foreground">Website</span>
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> {vendor.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contato */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contato Principal</h4>
                          <div className="space-y-2">
                            {vendor.primary_contact_name && (
                              <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{vendor.primary_contact_name}</span>
                              </div>
                            )}
                            {vendor.primary_contact_email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <a href={`mailto:${vendor.primary_contact_email}`} className="text-sm text-primary hover:underline">{vendor.primary_contact_email}</a>
                              </div>
                            )}
                            {vendor.primary_contact_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{vendor.primary_contact_phone}</span>
                              </div>
                            )}
                            {!vendor.primary_contact_name && !vendor.primary_contact_email && (
                              <p className="text-sm text-muted-foreground italic">Sem contato cadastrado</p>
                            )}
                          </div>
                        </div>

                        {/* Contrato & Classificação */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contrato & Risco</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] text-muted-foreground">Valor do Contrato</span>
                              <p className="text-sm font-medium">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendor.contract_value || 0)}
                              </p>
                            </div>
                            {vendor.contract_end_date && (
                              <div>
                                <span className="text-[10px] text-muted-foreground">Vencimento</span>
                                <p className="text-sm">{format(new Date(vendor.contract_end_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              </div>
                            )}
                            {vendor.risk_score && (
                              <div>
                                <span className="text-[10px] text-muted-foreground">Score de Risco</span>
                                <p className="text-sm font-medium">{getRiskLevelText(vendor.risk_score)} ({vendor.risk_score.toFixed(1)})</p>
                              </div>
                            )}
                            {vendor.last_assessment_date && (
                              <div>
                                <span className="text-[10px] text-muted-foreground">Último Assessment</span>
                                <p className="text-sm">{format(new Date(vendor.last_assessment_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {vendor.description && (
                        <div className="mt-4 pt-3 border-t">
                          <span className="text-[10px] text-muted-foreground">Descrição</span>
                          <p className="text-sm mt-0.5">{vendor.description}</p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEditWithWorkflow(vendor)}>
                          <Edit className="h-3 w-3 mr-1" /> Editar Cadastro
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                          const portalLink = `${window.location.origin}/vendor-portal`;
                          navigator.clipboard.writeText(portalLink);
                          toast({ title: 'Link Copiado', description: 'Link do Portal do Fornecedor copiado.' });
                        }}>
                          <Copy className="h-3 w-3 mr-1" /> Copiar Link Portal
                        </Button>
                      </div>
                    </TabsContent>

                    {/* ── TAB: Portal do Fornecedor ──────────────────────────────── */}
                    <TabsContent value="portal" className="p-4 mt-0">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold">Usuários do Portal</h4>
                            <p className="text-[10px] text-muted-foreground">Gerencie o acesso do fornecedor ao portal</p>
                          </div>
                          <Button size="sm" className="h-7 text-xs" onClick={() => setShowAddPortalUser(showAddPortalUser === vendor.id ? null : vendor.id)}>
                            <UserPlus className="h-3 w-3 mr-1" /> Novo Usuário
                          </Button>
                        </div>

                        {/* Add User Form */}
                        {showAddPortalUser === vendor.id && (
                          <Card className="border-dashed border-primary/30 bg-primary/5">
                            <CardContent className="p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input
                                  placeholder="E-mail do usuário"
                                  type="email"
                                  value={newPortalUserEmail}
                                  onChange={e => setNewPortalUserEmail(e.target.value)}
                                  className="h-8 text-xs"
                                />
                                <Input
                                  placeholder="Senha temporária (opcional)"
                                  type="text"
                                  value={newPortalUserPassword}
                                  onChange={e => setNewPortalUserPassword(e.target.value)}
                                  className="h-8 text-xs"
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-8 text-xs flex-1" onClick={() => handleAddPortalUser(vendor.id)}>
                                    Criar Acesso
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowAddPortalUser(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Portal Users List */}
                        {loadingPortalUsers === vendor.id ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                          </div>
                        ) : (portalUsers[vendor.id] && portalUsers[vendor.id].length > 0) ? (
                          <div className="space-y-2">
                            {portalUsers[vendor.id].map((pu: any) => (
                              <div key={pu.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${pu.is_active === false ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800' : 'bg-muted/20'
                                }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${pu.is_active === false ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                                    }`}>
                                    {pu.is_active === false
                                      ? <ShieldOff className="h-3.5 w-3.5 text-red-600" />
                                      : <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                                    }
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{pu.email}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Criado em {pu.created_at ? format(new Date(pu.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'}
                                      {pu.is_active === false && <span className="text-red-600 font-medium ml-2">• BLOQUEADO</span>}
                                      {pu.force_password_change && <span className="text-amber-600 font-medium ml-2">• Aguardando troca de senha</span>}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Resetar Senha" onClick={() => handleResetPassword(pu)}>
                                    <KeyRound className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm" variant="ghost"
                                    className={`h-7 w-7 p-0 ${pu.is_active === false ? 'hover:text-green-600' : 'hover:text-red-600'}`}
                                    title={pu.is_active === false ? 'Desbloquear Portal' : 'Bloquear Portal'}
                                    onClick={() => handleTogglePortalUser(pu.id, vendor.id, pu.is_active !== false)}
                                  >
                                    {pu.is_active === false ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-lg border-dashed bg-muted/10">
                            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhum usuário de portal cadastrado</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Adicione um usuário para que o fornecedor acesse o portal</p>
                          </div>
                        )}

                        {/* Portal Link */}
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <span className="text-xs text-muted-foreground">Link do Portal:</span>
                          <code className="text-[10px] bg-muted px-2 py-1 rounded flex-1 truncate">{window.location.origin}/vendor-portal</code>
                          <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/vendor-portal`);
                            toast({ title: 'Link copiado!' });
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 mb-2">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground w-full sm:w-auto justify-center sm:justify-start">
            <span>
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedVendors.length)} de {sortedVendors.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs sm:text-sm"
            >
              Anterior
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs sm:text-sm"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {editingVendor ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingVendor ? 'Atualize as informações do fornecedor.' : 'Adicione um novo fornecedor ao seu catálogo.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do fornecedor"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Razão Social</label>
                <Input
                  value={formData.legal_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                  placeholder="Razão social"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CNPJ/CPF</label>
                <Input
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria de Negócio *</label>
                <Input
                  value={formData.business_category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_category: e.target.value }))}
                  placeholder="Ex: Tecnologia, Consultoria"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo do Fornecedor *</label>
                <Select
                  value={formData.vendor_type || 'operational'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strategic">Estratégico</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="transactional">Transacional</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Nível de Criticidade *</label>
                <Select
                  value={formData.criticality_level || 'medium'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, criticality_level: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Valor do Contrato (R$)</label>
                <Input
                  type="number"
                  value={formData.contract_value || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_value: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm resize-none"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição dos serviços ou produtos fornecidos..."
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contato Principal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600">Nome</label>
                  <Input
                    value={formData.primary_contact_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_name: e.target.value }))}
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">E-mail</label>
                  <Input
                    type="email"
                    value={formData.primary_contact_email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-600">Telefone</label>
                  <Input
                    value={formData.primary_contact_phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingVendor(null);
                  setFormData({
                    vendor_type: 'operational',
                    criticality_level: 'medium',
                    annual_spend: 0,
                    contract_value: 0
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary"
              >
                {loading ? 'Salvando...' : editingVendor ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewingVendor && (
        <Dialog open={!!viewingVendor} onOpenChange={() => setViewingVendor(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>{viewingVendor.name}</span>
              </DialogTitle>
              <DialogDescription>
                Informações detalhadas do fornecedor
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Razão Social</label>
                  <p className="text-sm font-medium">{viewingVendor.legal_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">CNPJ/CPF</label>
                  <p className="text-sm font-medium">{viewingVendor.tax_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Categoria</label>
                  <p className="text-sm font-medium">{viewingVendor.business_category}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Website</label>
                  {viewingVendor.website ? (
                    <a
                      href={viewingVendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center space-x-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{viewingVendor.website}</span>
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500">N/A</p>
                  )}
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Classificação</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Tipo: {getVendorTypeText(viewingVendor.vendor_type)}
                  </Badge>
                  <Badge variant="outline" className={
                    viewingVendor.criticality_level === 'critical' ? 'border-red-200 text-red-700 bg-red-50' :
                      viewingVendor.criticality_level === 'high' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                        viewingVendor.criticality_level === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                          'border-green-200 text-green-700 bg-green-50'
                  }>
                    Criticidade: {getCriticalityText(viewingVendor.criticality_level)}
                  </Badge>
                  <Badge variant="outline" className={getStatusStyle(viewingVendor.status)}>
                    Status: {getStatusText(viewingVendor.status)}
                  </Badge>
                  {viewingVendor.risk_score && (
                    <Badge variant="outline" className={getRiskLevelStyle(viewingVendor.risk_score)}>
                      Risco: {getRiskLevelText(viewingVendor.risk_score)} ({viewingVendor.risk_score.toFixed(1)})
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewingVendor.description && (
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Descrição</label>
                  <p className="text-sm mt-1">{viewingVendor.description}</p>
                </div>
              )}

              {/* Contract Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Informações Contratuais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Valor do Contrato</label>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(viewingVendor.contract_value || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Status do Contrato</label>
                    <p className="text-sm font-medium">
                      {viewingVendor.contract_status === 'active' ? 'Ativo' :
                        viewingVendor.contract_status === 'expired' ? 'Expirado' :
                          viewingVendor.contract_status === 'terminated' ? 'Encerrado' :
                            viewingVendor.contract_status === 'draft' ? 'Rascunho' :
                              viewingVendor.contract_status === 'under_review' ? 'Em Revisão' : 'N/A'}
                    </p>
                  </div>
                  {viewingVendor.contract_start_date && (
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Início do Contrato</label>
                      <p className="text-sm font-medium">
                        {format(new Date(viewingVendor.contract_start_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  {viewingVendor.contract_end_date && (
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Fim do Contrato</label>
                      <p className="text-sm font-medium">
                        {format(new Date(viewingVendor.contract_end_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(viewingVendor.primary_contact_name || viewingVendor.primary_contact_email || viewingVendor.primary_contact_phone) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Contato Principal</h4>
                  <div className="space-y-2">
                    {viewingVendor.primary_contact_name && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{viewingVendor.primary_contact_name}</span>
                      </div>
                    )}
                    {viewingVendor.primary_contact_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <a href={`mailto:${viewingVendor.primary_contact_email}`} className="text-sm text-primary hover:underline">
                          {viewingVendor.primary_contact_email}
                        </a>
                      </div>
                    )}
                    {viewingVendor.primary_contact_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{viewingVendor.primary_contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Onboarding Progress */}
              {viewingVendor.onboarding_status !== 'completed' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Progresso do Onboarding</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status: {viewingVendor.onboarding_status}</span>
                      <span>{viewingVendor.onboarding_progress}%</span>
                    </div>
                    <Progress value={viewingVendor.onboarding_progress} className="h-2" />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingVendor(null);
                    handleEdit(viewingVendor);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="text-primary border-primary/30 hover:bg-primary/5"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Criar Assessment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Onboarding Workflow for Editing */}
      {showOnboardingWorkflow && (
        <VendorOnboardingWorkflow
          vendorId={editingVendorId || undefined}
          isOpen={showOnboardingWorkflow}
          onClose={() => {
            setShowOnboardingWorkflow(false);
            setEditingVendorId(null);
          }}
          onComplete={(vendor) => {
            setShowOnboardingWorkflow(false);
            setEditingVendorId(null);
            fetchVendors(); // Refresh the vendor list
            toast({
              title: 'Fornecedor atualizado',
              description: `${vendor.name} foi atualizado com sucesso.`,
            });
          }}
        />
      )}
    </div>
  );
};

export default VendorTableView;