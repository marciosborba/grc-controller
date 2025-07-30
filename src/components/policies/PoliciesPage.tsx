import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Eye,
  Send,
  Archive,
  UserPlus,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AIChatAssistant } from '@/components/ai/AIChatAssistant';
import { AIContentGenerator } from '@/components/ai/AIContentGenerator';

interface Policy {
  id: string;
  title: string;
  description: string | null;
  category: string;
  version: string;
  status: string;
  document_url: string | null;
  document_type: string | null;
  effective_date: string | null;
  review_date: string | null;
  owner_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface PolicyApproval {
  id: string;
  policy_id: string;
  approver_id: string;
  status: string;
  comments: string | null;
  approved_at: string | null;
  created_at: string;
}

interface PolicyApprover {
  id: string;
  policy_id: string;
  approver_id: string;
  approver_role: string;
  is_required: boolean;
  order_sequence: number;
  created_at: string;
  created_by: string | null;
}

const PoliciesPage = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [approvals, setApprovals] = useState<PolicyApproval[]>([]);
  const [approvers, setApprovers] = useState<PolicyApprover[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isApproversDialogOpen, setIsApproversDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<Date>();
  const [reviewDate, setReviewDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState('policies');
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    version: '1.0',
    status: 'draft',
    document_type: '',
    owner_id: '',
  });

  const [approvalData, setApprovalData] = useState({
    status: 'approved',
    comments: '',
  });

  const [approverData, setApproverData] = useState({
    approver_id: '',
    approver_role: '',
    is_required: true,
    order_sequence: 1,
  });

  useEffect(() => {
    fetchPolicies();
    fetchApprovals();
    fetchApprovers();
    fetchProfiles();
  }, []);

  useEffect(() => {
    let filtered = policies;
    
    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(policy => policy.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }
    
    setFilteredPolicies(filtered);
  }, [policies, searchTerm, categoryFilter, statusFilter]);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPolicies(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar políticas',
        variant: 'destructive',
      });
    }
  };

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_approvals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setApprovals(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar aprovações',
        variant: 'destructive',
      });
    }
  };

  const fetchApprovers = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_approvers')
        .select('*')
        .order('order_sequence', { ascending: true });
      
      if (error) throw error;
      setApprovers(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar aprovadores',
        variant: 'destructive',
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar perfis de usuários',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const policyData = {
        ...formData,
        effective_date: effectiveDate ? format(effectiveDate, 'yyyy-MM-dd') : null,
        review_date: reviewDate ? format(reviewDate, 'yyyy-MM-dd') : null,
        created_by: user?.id,
        owner_id: user?.id,
      };

      if (editingPolicy) {
        const { error } = await supabase
          .from('policies')
          .update(policyData)
          .eq('id', editingPolicy.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Política atualizada com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('policies')
          .insert([policyData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Política criada com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchPolicies();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar política',
        variant: 'destructive',
      });
    }
  };

  const handleApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPolicy) return;

    try {
      // Create approval record
      const { error: approvalError } = await supabase
        .from('policy_approvals')
        .insert([{
          policy_id: selectedPolicy.id,
          approver_id: user?.id,
          status: approvalData.status,
          comments: approvalData.comments,
          approved_at: approvalData.status === 'approved' ? new Date().toISOString() : null,
        }]);

      if (approvalError) throw approvalError;

      // Update policy status if approved
      if (approvalData.status === 'approved') {
        const { error: policyError } = await supabase
          .from('policies')
          .update({
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', selectedPolicy.id);

        if (policyError) throw policyError;
      }

      toast({
        title: 'Sucesso',
        description: `Política ${approvalData.status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });

      setIsApprovalDialogOpen(false);
      setSelectedPolicy(null);
      resetApprovalForm();
      fetchPolicies();
      fetchApprovals();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao processar aprovação',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      description: policy.description || '',
      category: policy.category,
      version: policy.version,
      status: policy.status,
      document_type: policy.document_type || '',
      owner_id: policy.owner_id || '',
    });
    setEffectiveDate(policy.effective_date ? new Date(policy.effective_date) : undefined);
    setReviewDate(policy.review_date ? new Date(policy.review_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleApprove = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsApprovalDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta política?')) return;
    
    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Política excluída com sucesso',
      });
      
      fetchPolicies();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir política',
        variant: 'destructive',
      });
    }
  };

  const handleSendForApproval = async (policy: Policy) => {
    try {
      const { error } = await supabase
        .from('policies')
        .update({ status: 'pending_approval' })
        .eq('id', policy.id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Política enviada para aprovação',
      });
      
      fetchPolicies();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar para aprovação',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      version: '1.0',
      status: 'draft',
      document_type: '',
      owner_id: '',
    });
    setEffectiveDate(undefined);
    setReviewDate(undefined);
    setEditingPolicy(null);
  };

  const resetApprovalForm = () => {
    setApprovalData({
      status: 'approved',
      comments: '',
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPolicy) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Erro',
        description: 'Apenas arquivos PDF e Word são permitidos',
        variant: 'destructive',
      });
      return;
    }

    setUploadingFile(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedPolicy.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update policy with document URL
      const { data: { publicUrl } } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('policies')
        .update({ 
          document_url: fileName,
          document_type: fileExt === 'pdf' ? 'PDF' : 'Word'
        })
        .eq('id', selectedPolicy.id);

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: 'Documento arquivado com sucesso',
      });

      setIsArchiveDialogOpen(false);
      fetchPolicies();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao arquivar documento',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleArchivePolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsArchiveDialogOpen(true);
  };

  const handleAddApprover = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPolicy) return;

    try {
      const { error } = await supabase
        .from('policy_approvers')
        .insert([{
          policy_id: selectedPolicy.id,
          approver_id: approverData.approver_id,
          approver_role: approverData.approver_role,
          is_required: approverData.is_required,
          order_sequence: approverData.order_sequence,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Aprovador adicionado com sucesso',
      });

      setApproverData({
        approver_id: '',
        approver_role: '',
        is_required: true,
        order_sequence: 1,
      });

      fetchApprovers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao adicionar aprovador',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveApprover = async (approverId: string) => {
    if (!confirm('Tem certeza que deseja remover este aprovador?')) return;

    try {
      const { error } = await supabase
        .from('policy_approvers')
        .delete()
        .eq('id', approverId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Aprovador removido com sucesso',
      });

      fetchApprovers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao remover aprovador',
        variant: 'destructive',
      });
    }
  };

  const handleManageApprovers = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsApproversDialogOpen(true);
  };

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || 'Usuário não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'pending_approval': return 'Aguardando Aprovação';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      case 'archived': return 'Arquivada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'archived': return <FileCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Políticas</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gerencie documentações e fluxos de aprovação para compliance</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Editar Política' : 'Nova Política'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Ex: Política de Segurança da Informação"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Descreva o objetivo e escopo da política..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Segurança da Informação">Segurança da Informação</SelectItem>
                      <SelectItem value="Privacidade de Dados">Privacidade de Dados</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Gestão de Riscos">Gestão de Riscos</SelectItem>
                      <SelectItem value="Ética">Ética</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="1.0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="document_type">Tipo de Documento</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) => setFormData({...formData, document_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Política">Política</SelectItem>
                      <SelectItem value="Procedimento">Procedimento</SelectItem>
                      <SelectItem value="Instrução de Trabalho">Instrução de Trabalho</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Regulamento">Regulamento</SelectItem>
                      <SelectItem value="Norma">Norma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="pending_approval">Aguardando Aprovação</SelectItem>
                      <SelectItem value="approved">Aprovada</SelectItem>
                      <SelectItem value="archived">Arquivada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Data de Vigência</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !effectiveDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {effectiveDate ? format(effectiveDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={effectiveDate}
                        onSelect={setEffectiveDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data de Revisão</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reviewDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reviewDate ? format(reviewDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={reviewDate}
                        onSelect={setReviewDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPolicy ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="approvers">Gestão de Aprovações</TabsTrigger>
          <TabsTrigger value="approvals">Histórico</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar políticas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    <SelectItem value="Segurança da Informação">Segurança da Informação</SelectItem>
                    <SelectItem value="Privacidade de Dados">Privacidade de Dados</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Gestão de Riscos">Gestão de Riscos</SelectItem>
                    <SelectItem value="Ética">Ética</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="pending_approval">Aguardando</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                    <SelectItem value="archived">Arquivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Policy Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{policies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Edit className="h-8 w-8 text-gray-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                    <p className="text-2xl font-bold">
                      {policies.filter(p => p.status === 'draft').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Aguardando</p>
                    <p className="text-2xl font-bold">
                      {policies.filter(p => p.status === 'pending_approval').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Aprovadas</p>
                    <p className="text-2xl font-bold">
                      {policies.filter(p => p.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileCheck className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Arquivadas</p>
                    <p className="text-2xl font-bold">
                      {policies.filter(p => p.status === 'archived').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Políticas e Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Título</TableHead>
                      <TableHead className="text-xs">Categoria</TableHead>
                      <TableHead className="text-xs">Versão</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Vigência</TableHead>
                      <TableHead className="text-xs">Revisão</TableHead>
                      <TableHead className="text-xs">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="text-xs font-medium">{policy.title}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline">{policy.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{policy.version}</TableCell>
                        <TableCell className="text-xs">
                          <Badge className={getStatusColor(policy.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(policy.status)}
                              {getStatusText(policy.status)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {policy.effective_date ? (
                            format(new Date(policy.effective_date), 'dd/MM/yyyy', { locale: ptBR })
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {policy.review_date ? (
                            format(new Date(policy.review_date), 'dd/MM/yyyy', { locale: ptBR })
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(policy)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchivePolicy(policy)}
                              title="Arquivar documento"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManageApprovers(policy)}
                              title="Gerenciar aprovadores"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            {policy.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendForApproval(policy)}
                                title="Enviar para aprovação"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {policy.status === 'pending_approval' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(policy)}
                                title="Aprovar/Rejeitar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {policy.document_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const { data } = supabase.storage
                                    .from('policy-documents')
                                    .getPublicUrl(policy.document_url!);
                                  window.open(data.publicUrl, '_blank');
                                }}
                                title="Download documento"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(policy.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredPolicies.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                        ? 'Nenhuma política encontrada com os filtros aplicados.'
                        : 'Nenhuma política encontrada.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aprovações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval) => {
                  const policy = policies.find(p => p.id === approval.policy_id);
                  return (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{policy?.title || 'Política não encontrada'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {approval.comments && `Comentários: ${approval.comments}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(approval.status)}>
                            {getStatusText(approval.status)}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(approval.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {approvals.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Nenhuma aprovação encontrada.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Políticas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(policies.map(p => p.category))).map(category => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{category}</span>
                      <Badge variant="outline">
                        {policies.filter(p => p.category === category).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status das Políticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['draft', 'pending_approval', 'approved', 'rejected', 'archived'].map(status => (
                    <div key={status} className="flex justify-between items-center">
                      <span>{getStatusText(status)}</span>
                      <Badge variant="outline">
                        {policies.filter(p => p.status === status).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Add new tab for Approvers Management */}
        <TabsContent value="approvers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Painel de Gestão de Aprovações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {policies.map((policy) => {
                  const policyApprovers = approvers.filter(a => a.policy_id === policy.id);
                  return (
                    <Card key={policy.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">{policy.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Categoria: {policy.category} | Status: {getStatusText(policy.status)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageApprovers(policy)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar Aprovador
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {policyApprovers.length > 0 ? (
                            policyApprovers.map((approver) => (
                              <div key={approver.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">{getProfileName(approver.approver_id)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Função: {approver.approver_role} | 
                                    Sequência: {approver.order_sequence} |
                                    {approver.is_required ? ' Obrigatório' : ' Opcional'}
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
                              Nenhum aprovador configurado para esta política.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Archive Document Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Arquivar Documento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Política: {selectedPolicy?.title}</Label>
            </div>
            
            <div>
              <Label htmlFor="document-file">Documento (PDF ou Word) *</Label>
              <Input
                id="document-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: PDF, DOC, DOCX
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsArchiveDialogOpen(false)}
                disabled={uploadingFile}
              >
                Cancelar
              </Button>
              <Button disabled={uploadingFile}>
                {uploadingFile ? 'Enviando...' : 'Arquivar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approvers Management Dialog */}
      <Dialog open={isApproversDialogOpen} onOpenChange={setIsApproversDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Aprovadores</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label>Política: {selectedPolicy?.title}</Label>
            </div>

            {/* Add Approver Form */}
            <form onSubmit={handleAddApprover} className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Adicionar Novo Aprovador</h4>
              
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
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={approverData.is_required}
                    onChange={(e) => setApproverData({...approverData, is_required: e.target.checked})}
                  />
                  <Label htmlFor="is_required">Aprovação obrigatória</Label>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Aprovador
              </Button>
            </form>

            {/* Current Approvers List */}
            <div className="space-y-3">
              <h4 className="font-medium">Aprovadores Atuais</h4>
              {selectedPolicy && approvers.filter(a => a.policy_id === selectedPolicy.id).length > 0 ? (
                approvers
                  .filter(a => a.policy_id === selectedPolicy.id)
                  .sort((a, b) => a.order_sequence - b.order_sequence)
                  .map((approver) => (
                    <div key={approver.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{getProfileName(approver.approver_id)}</div>
                        <div className="text-sm text-muted-foreground">
                          Função: {approver.approver_role} | 
                          Sequência: {approver.order_sequence} |
                          {approver.is_required ? ' Obrigatório' : ' Opcional'}
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
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsApproversDialogOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar Política</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleApproval} className="space-y-4">
            <div>
              <Label>Política: {selectedPolicy?.title}</Label>
            </div>
            
            <div>
              <Label htmlFor="approval_status">Decisão *</Label>
              <Select
                value={approvalData.status}
                onValueChange={(value) => setApprovalData({...approvalData, status: value})}
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
                placeholder="Adicione comentários sobre a decisão..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {approvalData.status === 'approved' ? 'Aprovar' : 'Rejeitar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Components */}
      <AIChatAssistant
        type="policy"
        context={{
          module: 'Políticas',
          totalPolicies: policies.length,
          pendingApprovals: policies.filter(p => p.status === 'pending_approval').length,
          categories: Array.from(new Set(policies.map(p => p.category))),
          currentFilters: { categoryFilter, statusFilter, searchTerm }
        }}
      />
      
      <AIContentGenerator
        type="policy"
        onGenerated={(content) => {
          if (content.title) {
            setFormData(prev => ({
              ...prev,
              title: content.title,
              description: content.description || '',
              category: content.category || prev.category
            }));
            setIsDialogOpen(true);
          }
        }}
      />
    </div>
  );
};

export default PoliciesPage;