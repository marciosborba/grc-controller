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
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash2, 
  Send,
  FileText,
  AlertTriangle,
  CheckCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Vendor {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  category: string;
  risk_level: string;
  status: string;
  contract_start_date: string | null;
  contract_end_date: string | null;
  last_assessment_date: string | null;
  next_assessment_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface VendorAssessment {
  id: string;
  vendor_id: string;
  title: string;
  status: string;
  questionnaire_data: any;
  responses: any;
  score: number | null;
  risk_rating: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [contractStartDate, setContractStartDate] = useState<Date>();
  const [contractEndDate, setContractEndDate] = useState<Date>();
  const [nextAssessmentDate, setNextAssessmentDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState('vendors');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    risk_level: 'medium',
    status: 'active',
  });

  const [assessmentData, setAssessmentData] = useState({
    title: '',
    questionnaire_data: {} as any,
  });

  // Predefined questionnaire templates
  const questionnaireTemplates = {
    security: {
      title: 'Questionário de Segurança da Informação',
      questions: [
        {
          id: 'q1',
          question: 'A empresa possui certificação ISO 27001?',
          type: 'boolean',
          weight: 10,
          required: true
        },
        {
          id: 'q2',
          question: 'Qual é a frequência de backup dos dados?',
          type: 'select',
          options: ['Diário', 'Semanal', 'Mensal', 'Não realiza backup'],
          weight: 8,
          required: true
        },
        {
          id: 'q3',
          question: 'A empresa possui um plano de continuidade de negócios?',
          type: 'boolean',
          weight: 9,
          required: true
        },
        {
          id: 'q4',
          question: 'Quais medidas de controle de acesso são implementadas?',
          type: 'multiple',
          options: ['Autenticação de dois fatores', 'Controle por biometria', 'Senhas complexas', 'Revisão periódica de acessos'],
          weight: 7,
          required: true
        },
        {
          id: 'q5',
          question: 'A empresa realiza treinamentos de conscientização em segurança?',
          type: 'select',
          options: ['Trimestralmente', 'Semestralmente', 'Anualmente', 'Não realiza'],
          weight: 6,
          required: true
        }
      ]
    },
    compliance: {
      title: 'Questionário de Compliance e Regulamentações',
      questions: [
        {
          id: 'q1',
          question: 'A empresa está em conformidade com a LGPD?',
          type: 'boolean',
          weight: 10,
          required: true
        },
        {
          id: 'q2',
          question: 'Possui DPO (Data Protection Officer) designado?',
          type: 'boolean',
          weight: 8,
          required: true
        },
        {
          id: 'q3',
          question: 'Realiza DPIA (Avaliação de Impacto à Proteção de Dados)?',
          type: 'boolean',
          weight: 7,
          required: true
        },
        {
          id: 'q4',
          question: 'Qual o tempo máximo para notificação de incidentes?',
          type: 'select',
          options: ['24 horas', '48 horas', '72 horas', 'Mais de 72 horas'],
          weight: 9,
          required: true
        },
        {
          id: 'q5',
          question: 'A empresa possui política de retenção de dados?',
          type: 'boolean',
          weight: 6,
          required: true
        }
      ]
    },
    financial: {
      title: 'Questionário de Avaliação Financeira',
      questions: [
        {
          id: 'q1',
          question: 'A empresa possui auditoria externa anual?',
          type: 'boolean',
          weight: 10,
          required: true
        },
        {
          id: 'q2',
          question: 'Qual a classificação de rating de crédito?',
          type: 'select',
          options: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'Não possui'],
          weight: 9,
          required: true
        },
        {
          id: 'q3',
          question: 'A empresa possui seguro de responsabilidade civil?',
          type: 'boolean',
          weight: 8,
          required: true
        },
        {
          id: 'q4',
          question: 'Tempo de mercado da empresa (em anos)?',
          type: 'number',
          weight: 7,
          required: true
        },
        {
          id: 'q5',
          question: 'A empresa já passou por processos de recuperação judicial?',
          type: 'boolean',
          weight: 10,
          required: true
        }
      ]
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = vendors;
    
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === categoryFilter);
    }
    
    if (riskFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.risk_level === riskFilter);
    }
    
    setFilteredVendors(filtered);
  }, [vendors, searchTerm, categoryFilter, riskFilter]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar fornecedores',
        variant: 'destructive',
      });
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar assessments',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const vendorData = {
        ...formData,
        contract_start_date: contractStartDate ? format(contractStartDate, 'yyyy-MM-dd') : null,
        contract_end_date: contractEndDate ? format(contractEndDate, 'yyyy-MM-dd') : null,
        next_assessment_date: nextAssessmentDate ? format(nextAssessmentDate, 'yyyy-MM-dd') : null,
        created_by: user?.id,
      };

      if (editingVendor) {
        const { error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', editingVendor.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Fornecedor atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('vendors')
          .insert([vendorData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Fornecedor criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchVendors();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar fornecedor',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVendor) return;

    try {
      const { error } = await supabase
        .from('vendor_assessments')
        .insert([{
          vendor_id: selectedVendor.id,
          title: assessmentData.title,
          questionnaire_data: assessmentData.questionnaire_data,
          status: 'sent',
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Questionário de assessment enviado com sucesso',
      });

      setIsAssessmentDialogOpen(false);
      setSelectedVendor(null);
      resetAssessmentForm();
      fetchAssessments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao enviar assessment',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      category: vendor.category,
      risk_level: vendor.risk_level,
      status: vendor.status,
    });
    setContractStartDate(vendor.contract_start_date ? new Date(vendor.contract_start_date) : undefined);
    setContractEndDate(vendor.contract_end_date ? new Date(vendor.contract_end_date) : undefined);
    setNextAssessmentDate(vendor.next_assessment_date ? new Date(vendor.next_assessment_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleSendAssessment = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsAssessmentDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Fornecedor excluído com sucesso',
      });
      
      fetchVendors();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir fornecedor',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      risk_level: 'medium',
      status: 'active',
    });
    setContractStartDate(undefined);
    setContractEndDate(undefined);
    setNextAssessmentDate(undefined);
    setEditingVendor(null);
  };

  const resetAssessmentForm = () => {
    setAssessmentData({
      title: '',
      questionnaire_data: {},
    });
  };

  const selectQuestionnaireTemplate = (templateKey: string) => {
    const template = questionnaireTemplates[templateKey as keyof typeof questionnaireTemplates];
    setAssessmentData({
      title: template.title,
      questionnaire_data: template,
    });
  };

  const calculateRiskScore = (assessment: VendorAssessment) => {
    if (!assessment.responses || !assessment.questionnaire_data?.questions) return 0;

    const questions = assessment.questionnaire_data.questions;
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((question: any) => {
      const response = assessment.responses[question.id];
      const weight = question.weight || 1;
      maxScore += weight * 10; // Assumindo pontuação máxima de 10 por pergunta

      if (response !== undefined) {
        let score = 0;
        
        switch (question.type) {
          case 'boolean':
            score = response ? 10 : 0;
            break;
          case 'select':
            // Pontuação baseada na posição da opção (primeira opção = pontuação máxima)
            const optionIndex = question.options?.indexOf(response) || 0;
            score = Math.max(0, 10 - (optionIndex * 2));
            break;
          case 'multiple':
            // Pontuação baseada no número de opções selecionadas
            score = Math.min(10, (response.length / question.options?.length || 1) * 10);
            break;
          case 'number':
            // Pontuação baseada no valor numérico (adaptável conforme a pergunta)
            score = Math.min(10, Math.max(0, response / 10));
            break;
          default:
            score = 5; // Pontuação neutra para tipos desconhecidos
        }
        
        totalScore += score * weight;
      }
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      case 'critical': return 'Crítico';
      default: return riskLevel;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      case 'under_review': return 'Em Análise';
      default: return status;
    }
  };

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssessmentStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'overdue': return 'Atrasado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gerencie riscos de terceiros e questionários de assessment</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Ex: TechCorp Solutions"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_person">Pessoa de Contato</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contato@empresa.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
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
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Consultoria">Consultoria</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Manufatura">Manufatura</SelectItem>
                      <SelectItem value="Telecomunicações">Telecomunicações</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={2}
                    placeholder="Endereço completo da empresa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="risk_level">Nível de Risco</Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value) => setFormData({...formData, risk_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
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
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                      <SelectItem value="under_review">Em Análise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Início do Contrato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !contractStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractStartDate ? format(contractStartDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={contractStartDate}
                        onSelect={setContractStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Fim do Contrato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !contractEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractEndDate ? format(contractEndDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={contractEndDate}
                        onSelect={setContractEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Próximo Assessment</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextAssessmentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextAssessmentDate ? format(nextAssessmentDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nextAssessmentDate}
                        onSelect={setNextAssessmentDate}
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
                  {editingVendor ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar fornecedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Risco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{vendors.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold">
                      {vendors.filter(v => v.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                    <p className="text-2xl font-bold">
                      {vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length}
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
                    <p className="text-sm font-medium text-muted-foreground">Assessments Pendentes</p>
                    <p className="text-2xl font-bold">
                      {assessments.filter(a => a.status === 'sent' || a.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendors Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Próximo Assessment</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{vendor.name}</p>
                            <p className="text-sm text-muted-foreground">{vendor.contact_person}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vendor.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {vendor.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1" />
                                {vendor.email}
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1" />
                                {vendor.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(vendor.risk_level)}>
                            {getRiskText(vendor.risk_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(vendor.status)}>
                            {getStatusText(vendor.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vendor.next_assessment_date ? (
                            format(new Date(vendor.next_assessment_date), 'dd/MM/yyyy', { locale: ptBR })
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(vendor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendAssessment(vendor)}
                              title="Enviar Assessment"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(vendor.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredVendors.length === 0 && (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {searchTerm || categoryFilter !== 'all' || riskFilter !== 'all'
                        ? 'Nenhum fornecedor encontrado com os filtros aplicados.'
                        : 'Nenhum fornecedor encontrado.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessments de Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Classificação</TableHead>
                      <TableHead>Enviado em</TableHead>
                      <TableHead>Concluído em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => {
                      const vendor = vendors.find(v => v.id === assessment.vendor_id);
                      const score = assessment.score || calculateRiskScore(assessment);
                      return (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            {vendor?.name || 'Fornecedor não encontrado'}
                          </TableCell>
                          <TableCell>{assessment.title}</TableCell>
                          <TableCell>
                            <Badge className={getAssessmentStatusColor(assessment.status)}>
                              {getAssessmentStatusText(assessment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {score ? (
                              <div className="flex items-center space-x-2">
                                <Progress value={score} className="w-16" />
                                <span className="text-sm font-medium">{score}%</span>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {assessment.risk_rating && (
                              <Badge className={getRiskColor(assessment.risk_rating)}>
                                {getRiskText(assessment.risk_rating)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(assessment.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {assessment.completed_at ? (
                              format(new Date(assessment.completed_at), 'dd/MM/yyyy', { locale: ptBR })
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {assessments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Nenhum assessment encontrado.
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
                <CardTitle>Fornecedores por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(vendors.map(v => v.category))).map(category => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{category}</span>
                      <Badge variant="outline">
                        {vendors.filter(v => v.category === category).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['low', 'medium', 'high', 'critical'].map(risk => (
                    <div key={risk} className="flex justify-between items-center">
                      <span>{getRiskText(risk)}</span>
                      <Badge variant="outline">
                        {vendors.filter(v => v.risk_level === risk).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assessment Dialog */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar Assessment para {selectedVendor?.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateAssessment} className="space-y-4">
            <div>
              <Label>Selecione um Template de Questionário</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => selectQuestionnaireTemplate('security')}
                >
                  <Shield className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Segurança da Informação</div>
                    <div className="text-sm text-muted-foreground">
                      Avaliação de controles de segurança cibernética
                    </div>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => selectQuestionnaireTemplate('compliance')}
                >
                  <CheckCircle className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Compliance e Regulamentações</div>
                    <div className="text-sm text-muted-foreground">
                      Conformidade com LGPD e outras regulamentações
                    </div>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => selectQuestionnaireTemplate('financial')}
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Avaliação Financeira</div>
                    <div className="text-sm text-muted-foreground">
                      Saúde financeira e estabilidade empresarial
                    </div>
                  </div>
                </Button>
              </div>
            </div>
            
            {assessmentData.title && (
              <div>
                <Label>Título do Assessment</Label>
                <Input
                  value={assessmentData.title}
                  onChange={(e) => setAssessmentData({...assessmentData, title: e.target.value})}
                  placeholder="Título personalizado do assessment"
                />
              </div>
            )}
            
            {assessmentData.questionnaire_data?.questions && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Preview do Questionário:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {assessmentData.questionnaire_data.questions.map((q: any, index: number) => (
                    <div key={q.id} className="text-sm">
                      <span className="font-medium">{index + 1}.</span> {q.question}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total de {assessmentData.questionnaire_data.questions.length} perguntas
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAssessmentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!assessmentData.title}>
                Enviar Assessment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorsPage;