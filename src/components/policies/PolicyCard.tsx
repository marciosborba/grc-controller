import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  FileText,
  Shield,
  Users,
  History,
  BookOpen,
  Upload,
  Download,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Eye,
  Plus,
  Trash2,
  Archive,
  UserPlus,
  MessageSquare,
  Calendar as CalendarDays,
  FileCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePolicyManagement } from '@/hooks/usePolicyManagement';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Policy, 
  PolicyApproval, 
  PolicyApprover,
  PolicyCategory,
  PolicyStatus,
  DocumentType
} from '@/types/policy-management';
import { POLICY_CATEGORIES, DOCUMENT_TYPES, POLICY_STATUSES } from '@/types/policy-management';

interface PolicyCardProps {
  policy: Policy;
  onUpdate?: (policyId: string, updates: any) => void;
  onDelete?: (policyId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
}

const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  canEdit = true,
  canDelete = true,
  canApprove = true
}) => {
  const { user } = useAuth();
  const { 
    profiles, 
    approvePolicy, 
    addApprover, 
    removeApprover, 
    uploadDocument,
    sendForApproval,
    getPolicyApprovers,
    getPolicyApprovals,
    getProfileName
  } = usePolicyManagement();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'approvals' | 'documents' | 'training' | 'history'>('general');

  // Helper function to safely format dates for input fields
  const formatDateForInput = useCallback((date: string | Date | undefined): string => {
    if (!date) return '';
    
    try {
      if (typeof date === 'string') {
        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // Try to parse the string as a date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return '';
        }
        return parsedDate.toISOString().split('T')[0];
      } else {
        // It's a Date object
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
  }, []);

  // Estados para edição de informações gerais
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalData, setGeneralData] = useState({
    title: policy.title,
    description: policy.description || '',
    category: policy.category || 'Segurança da Informação',
    document_type: policy.document_type || 'Política',
    version: policy.version,
    status: policy.status,
    owner_id: policy.owner_id || '',
    effective_date: formatDateForInput(policy.effective_date),
    review_date: formatDateForInput(policy.review_date),
    expiration_date: formatDateForInput(policy.expiration_date),
    tags: policy.tags?.join(', ') || '',
    compliance_frameworks: policy.compliance_frameworks?.join(', ') || '',
    impact_areas: policy.impact_areas?.join(', ') || ''
  });

  // Estados para aprovações
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    comments: ''
  });

  // Estados para aprovadores
  const [isApproversDialogOpen, setIsApproversDialogOpen] = useState(false);
  const [approverData, setApproverData] = useState({
    approver_id: '',
    approver_role: '',
    is_required: true,
    order_sequence: 1,
    can_delegate: false,
    notification_days_before: 7,
    escalation_days: 3
  });

  // Estados para documentos
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sincronizar estado local com as mudanças do prop policy
  useEffect(() => {
    setGeneralData({
      title: policy.title,
      description: policy.description || '',
      category: policy.category || 'Segurança da Informação',
      document_type: policy.document_type || 'Política',
      version: policy.version,
      status: policy.status,
      owner_id: policy.owner_id || '',
      effective_date: formatDateForInput(policy.effective_date),
      review_date: formatDateForInput(policy.review_date),
      expiration_date: formatDateForInput(policy.expiration_date),
      tags: policy.tags?.join(', ') || '',
      compliance_frameworks: policy.compliance_frameworks?.join(', ') || '',
      impact_areas: policy.impact_areas?.join(', ') || ''
    });
  }, [policy, formatDateForInput]);

  // Obter aprovadores e aprovações desta política
  const policyApprovers = getPolicyApprovers(policy.id);
  const policyApprovals = getPolicyApprovals(policy.id);

  // ============================================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // ============================================================================

  const handleSaveGeneral = async () => {
    if (onUpdate) {
      const updates = {
        title: generalData.title,
        description: generalData.description,
        category: generalData.category as PolicyCategory,
        document_type: generalData.document_type as DocumentType,
        version: generalData.version,
        status: generalData.status as PolicyStatus,
        owner_id: generalData.owner_id || undefined,
        effective_date: generalData.effective_date ? new Date(generalData.effective_date) : undefined,
        review_date: generalData.review_date ? new Date(generalData.review_date) : undefined,
        expiration_date: generalData.expiration_date ? new Date(generalData.expiration_date) : undefined,
        tags: generalData.tags ? generalData.tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
        compliance_frameworks: generalData.compliance_frameworks ? 
          generalData.compliance_frameworks.split(',').map(f => f.trim()).filter(f => f) : undefined,
        impact_areas: generalData.impact_areas ? 
          generalData.impact_areas.split(',').map(a => a.trim()).filter(a => a) : undefined
      };
      
      try {
        await onUpdate(policy.id, updates);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsEditingGeneral(false);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }
  };

  const handleApproval = async () => {
    if (!user) return;
    
    try {
      await approvePolicy({
        policyId: policy.id,
        approverId: user.id,
        status: approvalData.status,
        comments: approvalData.comments
      });
      
      setIsApprovalDialogOpen(false);
      setApprovalData({ status: 'approved', comments: '' });
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
    }
  };

  const handleAddApprover = async () => {
    if (!user || !approverData.approver_id) return;
    
    try {
      await addApprover({
        policy_id: policy.id,
        approver_id: approverData.approver_id,
        approver_role: approverData.approver_role,
        is_required: approverData.is_required,
        order_sequence: approverData.order_sequence,
        can_delegate: approverData.can_delegate,
        notification_days_before: approverData.notification_days_before,
        escalation_days: approverData.escalation_days,
        notify_on_assignment: true,
        notify_on_decision: true,
        notify_on_changes: true,
        created_by: user.id
      });
      
      setApproverData({
        approver_id: '',
        approver_role: '',
        is_required: true,
        order_sequence: 1,
        can_delegate: false,
        notification_days_before: 7,
        escalation_days: 3
      });
    } catch (error) {
      console.error('Erro ao adicionar aprovador:', error);
    }
  };

  const handleRemoveApprover = async (approverId: string) => {
    if (!confirm('Tem certeza que deseja remover este aprovador?')) return;
    
    try {
      await removeApprover(approverId);
    } catch (error) {
      console.error('Erro ao remover aprovador:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Apenas arquivos PDF e Word são permitidos');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await uploadDocument({
        policyId: policy.id,
        file: selectedFile
      });
      
      setIsDocumentDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendForApproval = async () => {
    try {
      await sendForApproval(policy.id);
    } catch (error) {
      console.error('Erro ao enviar para aprovação:', error);
    }
  };

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: PolicyStatus) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'expired': return <CalendarDays className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (isRequired: boolean, orderSequence: number) => {
    if (!isRequired) return 'bg-gray-100 text-gray-800';
    if (orderSequence === 1) return 'bg-red-100 text-red-800';
    if (orderSequence <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const isOverdue = (date?: Date) => {
    return date && new Date(date) < new Date();
  };

  return (
    <Card className={`rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer ${isExpanded ? 'shadow-lg border-primary/30' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-border'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3" title={isExpanded ? "Clique para recolher" : "Clique para expandir"}>
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{policy.title}</CardTitle>
                    <Badge className={getStatusColor(policy.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(policy.status)}
                        {POLICY_STATUSES[policy.status]?.split(' - ')[0] || policy.status}
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{policy.category}</span>
                    <span>"</span>
                    <span className="truncate">v{policy.version}</span>
                    <span>"</span>
                    <span className="truncate">{policy.document_type || 'Política'}</span>
                    {policy.owner_id && (
                      <>
                        <span>"</span>
                        <span className="truncate">Proprietário: {getProfileName(policy.owner_id)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                {policy.review_date && (
                  <div className={`text-xs ${isOverdue(policy.review_date) ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                    <div>Revisão:</div>
                    <div className="font-medium">
                      {format(policy.review_date, "dd/MM/yyyy", { locale: ptBR })}
                      {isOverdue(policy.review_date) && ' (Atrasada)'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'general' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Informações Gerais
                </button>
                
                <button
                  onClick={() => setActiveSection('approvals')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'approvals' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Aprovações
                  {policyApprovers.length > 0 && (
                    <Badge variant="outline" className="ml-1 h-5 text-xs">
                      {policyApprovers.length}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('documents')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'documents' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileCheck className="h-4 w-4" />
                  Documentos
                </button>
                
                <button
                  onClick={() => setActiveSection('training')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'training' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Treinamentos
                </button>
                
                <button
                  onClick={() => setActiveSection('history')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'history' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Histórico
                </button>
              </div>

              {/* Section Content */}
              {/* 1. INFORMAÇÕES GERAIS */}
              {activeSection === 'general' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">INFORMAÇÕES GERAIS</h4>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingGeneral(!isEditingGeneral)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditingGeneral ? 'Cancelar' : 'Editar'}
                      </Button>
                    )}
                  </div>

                  {isEditingGeneral ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="title">Título da Política</Label>
                        <Input
                          id="title"
                          value={generalData.title}
                          onChange={(e) => setGeneralData({ ...generalData, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={generalData.category}
                          onValueChange={(value) => setGeneralData({ ...generalData, category: value as PolicyCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(POLICY_CATEGORIES).map(([key, description]) => (
                              <SelectItem key={key} value={key} title={description}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="document_type">Tipo de Documento</Label>
                        <Select
                          value={generalData.document_type}
                          onValueChange={(value) => setGeneralData({ ...generalData, document_type: value as DocumentType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DOCUMENT_TYPES).map(([key, description]) => (
                              <SelectItem key={key} value={key} title={description}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="version">Versão</Label>
                        <Input
                          id="version"
                          value={generalData.version}
                          onChange={(e) => setGeneralData({ ...generalData, version: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={generalData.status}
                          onValueChange={(value) => setGeneralData({ ...generalData, status: value as PolicyStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(POLICY_STATUSES).map(([key, description]) => (
                              <SelectItem key={key} value={key}>
                                {description.split(' - ')[0]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="owner">Proprietário</Label>
                        <Select
                          value={generalData.owner_id}
                          onValueChange={(value) => setGeneralData({ ...generalData, owner_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um proprietário" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.map((profile) => (
                              <SelectItem key={profile.user_id} value={profile.user_id}>
                                {profile.full_name} - {profile.job_title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="effective_date">Data de Vigência</Label>
                        <Input
                          id="effective_date"
                          type="date"
                          value={generalData.effective_date}
                          onChange={(e) => setGeneralData({ ...generalData, effective_date: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="review_date">Data de Revisão</Label>
                        <Input
                          id="review_date"
                          type="date"
                          value={generalData.review_date}
                          onChange={(e) => setGeneralData({ ...generalData, review_date: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="expiration_date">Data de Expiração</Label>
                        <Input
                          id="expiration_date"
                          type="date"
                          value={generalData.expiration_date}
                          onChange={(e) => setGeneralData({ ...generalData, expiration_date: e.target.value })}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={generalData.description}
                          onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="tags">Tags (separadas por vãrgula)</Label>
                        <Input
                          id="tags"
                          value={generalData.tags}
                          onChange={(e) => setGeneralData({ ...generalData, tags: e.target.value })}
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="compliance_frameworks">Frameworks de Compliance</Label>
                        <Input
                          id="compliance_frameworks"
                          value={generalData.compliance_frameworks}
                          onChange={(e) => setGeneralData({ ...generalData, compliance_frameworks: e.target.value })}
                          placeholder="ISO 27001, LGPD, SOX"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="impact_areas">Áreas de Impacto</Label>
                        <Input
                          id="impact_areas"
                          value={generalData.impact_areas}
                          onChange={(e) => setGeneralData({ ...generalData, impact_areas: e.target.value })}
                          placeholder="TI, RH, Financeiro"
                        />
                      </div>
                      
                      <div className="col-span-2 flex gap-2">
                        <Button onClick={handleSaveGeneral} disabled={isUpdating}>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Título:</span> {policy.title}
                      </div>
                      <div>
                        <span className="font-medium">Categoria:</span> {policy.category}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {policy.document_type || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Versão:</span> {policy.version}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge className={getStatusColor(policy.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(policy.status)}
                            {POLICY_STATUSES[policy.status]?.split(' - ')[0] || policy.status}
                          </div>
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Proprietário:</span>{' '}
                        {policy.owner_id ? getProfileName(policy.owner_id) : 'Não definido'}
                      </div>
                      <div>
                        <span className="font-medium">Vigência:</span>{' '}
                        {policy.effective_date ? format(policy.effective_date, 'dd/MM/yyyy', { locale: ptBR }) : 'Não definida'}
                      </div>
                      <div>
                        <span className="font-medium">Revisão:</span>{' '}
                        {policy.review_date ? (
                          <span className={isOverdue(policy.review_date) ? 'text-red-600 font-semibold' : ''}>
                            {format(policy.review_date, 'dd/MM/yyyy', { locale: ptBR })}
                            {isOverdue(policy.review_date) && ' (Atrasada)'}
                          </span>
                        ) : 'Não definida'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Descrição:</span> {policy.description || 'Não informada'}
                      </div>
                      {policy.tags && policy.tags.length > 0 && (
                        <div className="col-span-2">
                          <span className="font-medium">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {policy.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2. APROVAÇÕES */}
              {activeSection === 'approvals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">GESTÃO DE APROVAÇÕES</h4>
                    <div className="flex gap-2">
                      {policy.status === 'draft' && canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendForApproval}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar para Aprovação
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsApproversDialogOpen(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Gerenciar Aprovadores
                        </Button>
                      )}
                      {policy.status === 'pending_approval' && canApprove && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsApprovalDialogOpen(true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar/Rejeitar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status da Aprovação */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(policy.status)}
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Status: {POLICY_STATUSES[policy.status]}
                      </span>
                    </div>
                    {policy.approved_by && policy.approved_at && (
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Aprovada por {getProfileName(policy.approved_by)} em{' '}
                        {format(policy.approved_at, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    )}
                  </div>

                  {/* Lista de Aprovadores */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Aprovadores Configurados</h5>
                    {policyApprovers.length > 0 ? (
                      policyApprovers
                        .sort((a, b) => a.order_sequence - b.order_sequence)
                        .map((approver) => (
                          <div key={approver.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge className={getPriorityColor(approver.is_required, approver.order_sequence)}>
                                #{approver.order_sequence}
                              </Badge>
                              <div>
                                <div className="font-medium">{getProfileName(approver.approver_id)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {approver.approver_role} " {approver.is_required ? 'Obrigatório' : 'Opcional'}
                                  {approver.can_delegate && ' " Pode delegar'}
                                </div>
                              </div>
                            </div>
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveApprover(approver.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Nenhum aprovador configurado.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Histórico de Aprovações */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Histórico de Aprovações</h5>
                    {policyApprovals.length > 0 ? (
                      policyApprovals.map((approval) => (
                        <div key={approval.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{getProfileName(approval.approver_id)}</div>
                              <div className="text-sm text-muted-foreground">
                                {approval.approver_role && `${approval.approver_role} " `}
                                {approval.decision_date && format(approval.decision_date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </div>
                              {approval.comments && (
                                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                  "{approval.comments}"
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(approval.status === 'approved' ? 'approved' : 'rejected')}>
                              {approval.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          Nenhuma aprovação registrada.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. DOCUMENTOS */}
              {activeSection === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">GESTÃO DE DOCUMENTOS</h4>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDocumentDialogOpen(true)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload
                      </Button>
                    )}
                  </div>

                  {/* Documento Principal */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-3">Documento Principal</h5>
                    {policy.document_path ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <div className="font-medium">
                              {policy.title} - v{policy.version}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {policy.document_type} " Enviado em{' '}
                              {policy.created_at && format(policy.created_at, 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const { data } = supabase.storage
                                .from('policy-documents')
                                .getPublicUrl(policy.document_path!);
                              window.open(data.publicUrl, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDocumentDialogOpen(true)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Nenhum documento principal anexado.
                        </p>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setIsDocumentDialogOpen(true)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Fazer Upload
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Anexos Adicionais */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-3">Anexos e Documentos Relacionados</h5>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Funcionalidade em desenvolvimento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TREINAMENTOS */}
              {activeSection === 'training' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">TREINAMENTOS</h4>
                  </div>

                  <div className="text-center py-8">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Módulo de treinamentos em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. HISTÓRICO */}
              {activeSection === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">HISTÓRICO DE MUDANÇAS</h4>
                  </div>

                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Histórico de mudanças em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(policy.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Política
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog para Aprovação */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar Política</DialogTitle>
            <DialogDescription>
              {policy.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval_status">Decisão</Label>
              <Select
                value={approvalData.status}
                onValueChange={(value) => setApprovalData({...approvalData, status: value as 'approved' | 'rejected'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Aprovar</SelectItem>
                  <SelectItem value="rejected">Rejeitar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="approval_comments">Comentários</Label>
              <Textarea
                id="approval_comments"
                value={approvalData.comments}
                onChange={(e) => setApprovalData({...approvalData, comments: e.target.value})}
                rows={3}
                placeholder="Adicione comentãrios sobre a decisão..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApproval}>
              {approvalData.status === 'approved' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Gerenciar Aprovadores */}
      <Dialog open={isApproversDialogOpen} onOpenChange={setIsApproversDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Aprovadores</DialogTitle>
            <DialogDescription>
              {policy.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Formulário para adicionar aprovador */}
            <div className="border rounded-lg p-4 space-y-4">
              <h5 className="font-medium">Adicionar Novo Aprovador</h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approver_id">Aprovador *</Label>
                  <Select
                    value={approverData.approver_id}
                    onValueChange={(value) => setApproverData({...approverData, approver_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} - {profile.job_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="approver_role">Função</Label>
                  <Input
                    id="approver_role"
                    value={approverData.approver_role}
                    onChange={(e) => setApproverData({...approverData, approver_role: e.target.value})}
                    placeholder="Ex: Gerente, Diretor..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="order_sequence">Sequência</Label>
                  <Input
                    id="order_sequence"
                    type="number"
                    min="1"
                    value={approverData.order_sequence}
                    onChange={(e) => setApproverData({...approverData, order_sequence: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notification_days">Notificar (dias antes)</Label>
                  <Input
                    id="notification_days"
                    type="number"
                    min="0"
                    value={approverData.notification_days_before}
                    onChange={(e) => setApproverData({...approverData, notification_days_before: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={approverData.is_required}
                    onChange={(e) => setApproverData({...approverData, is_required: e.target.checked})}
                  />
                  <span className="text-sm">Aprovação obrigatória</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={approverData.can_delegate}
                    onChange={(e) => setApproverData({...approverData, can_delegate: e.target.checked})}
                  />
                  <span className="text-sm">Pode delegar</span>
                </label>
              </div>
              
              <Button onClick={handleAddApprover} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Aprovador
              </Button>
            </div>
            
            {/* Lista de aprovadores atuais */}
            <div className="space-y-3">
              <h5 className="font-medium">Aprovadores Atuais</h5>
              {policyApprovers.length > 0 ? (
                policyApprovers
                  .sort((a, b) => a.order_sequence - b.order_sequence)
                  .map((approver) => (
                    <div key={approver.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getPriorityColor(approver.is_required, approver.order_sequence)}>
                          #{approver.order_sequence}
                        </Badge>
                        <div>
                          <div className="font-medium">{getProfileName(approver.approver_id)}</div>
                          <div className="text-sm text-muted-foreground">
                            {approver.approver_role} " {approver.is_required ? 'Obrigatório' : 'Opcional'}
                            {approver.can_delegate && ' " Pode delegar'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveApprover(approver.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum aprovador configurado.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproversDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Upload de Documento */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Arquivar Documento</DialogTitle>
            <DialogDescription>
              {policy.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-file">Documento (PDF ou Word)</Label>
              <Input
                id="document-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: PDF, DOC, DOCX
              </p>
            </div>
            
            {selectedFile && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDocumentDialogOpen(false);
                setSelectedFile(null);
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUploadDocument}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Enviando...' : 'Arquivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PolicyCard;