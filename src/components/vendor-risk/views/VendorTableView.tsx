import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search
} from 'lucide-react';
import { useVendorRiskManagement, VendorRegistry, VendorFilters } from '@/hooks/useVendorRiskManagement';
import { VendorOnboardingWorkflow } from '../workflows/VendorOnboardingWorkflow';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface VendorTableViewProps {
  searchTerm: string;
  selectedFilter: string;
  loading?: boolean;
  showFilters?: boolean;
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
  showFilters
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar fornecedores..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={localFilters.status?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters(prev => ({
                  ...prev,
                  status: value === 'all' ? undefined : [value]
                }))
              }
            >
              <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
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
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Fornecedores Registrados</span>
              </CardTitle>
              <CardDescription>
                Gerencie seu catálogo completo de fornecedores e parceiros
              </CardDescription>
            </div>
            {selectedVendors.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedVendors.length} selecionados
                </Badge>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedVendors.length === paginatedVendors.length && paginatedVendors.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium p-3 w-[25%]"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium">Fornecedor</span>
                      {sortBy === 'name' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[12%]">Tipo</TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[12%]">Criticidade</TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[10%]">Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium p-3 w-[8%]"
                    onClick={() => handleSort('risk_score')}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium">Risco</span>
                      {sortBy === 'risk_score' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[12%]">Status do Processo</TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[10%]">Contrato</TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[10%]">Último Assessment</TableHead>
                  <TableHead className="text-xs font-medium p-3 w-[11%]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="h-12">
                    <TableCell className="p-3">
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id)}
                        onCheckedChange={(checked) => handleVendorSelect(vendor.id, !!checked)}
                        className="h-4 w-4"
                      />
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[25%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {vendor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {vendor.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {vendor.primary_contact_email || vendor.website?.replace(/^https?:\/\//, '') || ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[12%]">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getVendorTypeBadgeStyle(vendor.vendor_type)}`}>
                        {getVendorTypeText(vendor.vendor_type)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[12%]">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getCriticalityBadgeStyle(vendor.criticality_level)}`}>
                        {getCriticalityText(vendor.criticality_level)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[10%]">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadgeStyle(vendor.status)}`}>
                        {getStatusText(vendor.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[8%]">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getRiskLevelBadgeStyle(vendor.risk_score)}`}>
                        {getRiskLevelText(vendor.risk_score)}
                        {vendor.risk_score && (
                          <span className="ml-1 opacity-75 text-[10px]">
                            ({vendor.risk_score.toFixed(1)})
                          </span>
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[12%]">
                      {(() => {
                        const processStatus = analyzeVendorProcessStatus(vendor);
                        return (
                          <Badge
                            className={`text-[10px] px-2 py-0.5 ${getProcessStatusBadgeStyle(processStatus.status)}`}
                            title={processStatus.description}
                          >
                            {processStatus.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[10%]">
                      <div className="text-xs text-muted-foreground">
                        <span className="text-xs">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                            notation: 'compact'
                          }).format(vendor.contract_value || 0)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs p-3 w-[10%]">
                      {vendor.last_assessment_date ? (
                        <div className="text-xs text-muted-foreground">
                          <div className="text-xs">{format(new Date(vendor.last_assessment_date), 'dd/MM/yy', { locale: ptBR })}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nunca avaliado</span>
                      )}
                    </TableCell>

                    <TableCell className="p-3 w-[11%]">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditWithWorkflow(vendor)}
                          title="Editar fornecedor"
                          className="h-7 w-7 p-0 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(vendor.id)}
                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Excluir fornecedor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {paginatedVendors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedVendors.length)} de {sortedVendors.length} fornecedores
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
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