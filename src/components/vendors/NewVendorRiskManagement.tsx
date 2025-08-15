import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Shield, 
  Search,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
  Filter,
  Brain,
  BarChart3,
  Settings,
  Building2,
  Zap,
  Clock
} from 'lucide-react';
import SortableVendorRiskCard from './SortableVendorRiskCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { supabase } from '@/integrations/supabase/client';
import RiskMatrix from '@/components/risks/RiskMatrix';

interface VendorRisk {
  id: string;
  vendor_id: string;
  vendor: {
    name: string;
    category: string;
    status: string;
    risk_level: string;
    contact_person: string;
    email: string;
    phone: string;
  };
  title: string;
  description: string;
  risk_category: string;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  status: string;
  risk_owner: string;
  identified_date: string;
  next_review_date?: string;
  mitigation_actions: any[];
  created_at: string;
  updated_at: string;
}

const NewVendorRiskManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [vendorRisks, setVendorRisks] = useState<VendorRisk[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [orderedRisks, setOrderedRisks] = useState<VendorRisk[]>([]);

  // Form data for creating new vendor risk
  const [formData, setFormData] = useState({
    vendor_id: '',
    title: '',
    description: '',
    risk_category: 'Operational Risk',
    likelihood: 'Medium',
    impact: 'Medium',
    risk_owner: user?.id || ''
  });

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [vendorRisks, searchTerm, selectedCategories, selectedLevels, selectedStatuses]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchVendorRisks(),
        fetchVendors(),
        fetchProfiles()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorRisks = async () => {
    // Como as tabelas podem não existir ainda, vamos criar dados simulados
    const simulatedRisks: VendorRisk[] = [
      {
        id: 'vr-1',
        vendor_id: 'vendor-1',
        vendor: {
          name: 'TechCorp Solutions',
          category: 'Technology Provider',
          status: 'active',
          risk_level: 'high',
          contact_person: 'João Silva',
          email: 'joao.silva@techcorp.com',
          phone: '+55 11 99999-0001'
        },
        title: 'Dependência Crítica de Fornecedor Único',
        description: 'Risco de interrupção dos serviços devido à dependência crítica de um único fornecedor de tecnologia.',
        risk_category: 'Operational Risk',
        likelihood: 'High',
        impact: 'Very High',
        risk_level: 'high',
        risk_score: 20,
        status: 'open',
        risk_owner: user?.id || 'user-1',
        identified_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_review_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        mitigation_actions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'vr-2',
        vendor_id: 'vendor-2',
        vendor: {
          name: 'CloudServices Ltd',
          category: 'Cloud Service Provider',
          status: 'active',
          risk_level: 'medium',
          contact_person: 'Maria Santos',
          email: 'maria.santos@cloudservices.com',
          phone: '+55 11 99999-0002'
        },
        title: 'Compliance e Segurança de Dados na Nuvem',
        description: 'Riscos relacionados à proteção de dados e compliance em serviços de nuvem terceirizados.',
        risk_category: 'Security Risk',
        likelihood: 'Medium',
        impact: 'High',
        risk_level: 'medium',
        risk_score: 12,
        status: 'in_treatment',
        risk_owner: user?.id || 'user-1',
        identified_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        mitigation_actions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'vr-3',
        vendor_id: 'vendor-3',
        vendor: {
          name: 'FinancePartner Inc',
          category: 'Financial Services',
          status: 'active',
          risk_level: 'critical',
          contact_person: 'Carlos Oliveira',
          email: 'carlos.oliveira@financepartner.com',
          phone: '+55 11 99999-0003'
        },
        title: 'Risco de Liquidez e Continuidade Financeira',
        description: 'Avaliação da solidez financeira e capacidade de continuidade de operações do parceiro financeiro.',
        risk_category: 'Financial Risk',
        likelihood: 'Low',
        impact: 'Very High',
        risk_level: 'critical',
        risk_score: 15,
        status: 'monitored',
        risk_owner: user?.id || 'user-1',
        identified_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        next_review_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        mitigation_actions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setVendorRisks(simulatedRisks);
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.warn('Erro ao carregar fornecedores, usando dados simulados');
      // Dados simulados de fornecedores
      const simulatedVendors = [
        { id: 'vendor-1', name: 'TechCorp Solutions', category: 'Technology Provider' },
        { id: 'vendor-2', name: 'CloudServices Ltd', category: 'Cloud Service Provider' },
        { id: 'vendor-3', name: 'FinancePartner Inc', category: 'Financial Services' },
      ];
      setVendors(simulatedVendors);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, job_title')
        .eq('is_active', true);
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.warn('Erro ao carregar perfis, usando dados simulados');
      const simulatedProfiles = [
        { user_id: 'user-1', full_name: 'Administrador Sistema', job_title: 'Admin' }
      ];
      setProfiles(simulatedProfiles);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...vendorRisks];

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(risk =>
        risk.title.toLowerCase().includes(term) ||
        risk.description.toLowerCase().includes(term) ||
        risk.vendor.name.toLowerCase().includes(term) ||
        risk.risk_category.toLowerCase().includes(term)
      );
    }

    // Filtros por categoria
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(risk =>
        selectedCategories.includes(risk.risk_category)
      );
    }

    // Filtros por nível de risco
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(risk =>
        selectedLevels.includes(risk.risk_level)
      );
    }

    // Filtros por status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(risk =>
        selectedStatuses.includes(risk.status)
      );
    }

    // Ordenação: críticos primeiro, depois por data de identificação
    filtered.sort((a, b) => {
      const riskLevelOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      const levelA = riskLevelOrder[a.risk_level as keyof typeof riskLevelOrder] ?? 4;
      const levelB = riskLevelOrder[b.risk_level as keyof typeof riskLevelOrder] ?? 4;
      
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      
      return new Date(b.identified_date).getTime() - new Date(a.identified_date).getTime();
    });

    setOrderedRisks(filtered);
  };

  const handleCreateVendorRisk = async () => {
    try {
      if (!formData.vendor_id || !formData.title) {
        toast.error('Por favor, preencha os campos obrigatórios');
        return;
      }

      // Calcular risk_score baseado na likelihood e impact
      const likelihoodScore = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 }[formData.likelihood] || 3;
      const impactScore = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 }[formData.impact] || 3;
      const risk_score = likelihoodScore * impactScore;
      
      const risk_level = risk_score >= 20 ? 'critical' :
                        risk_score >= 15 ? 'high' :
                        risk_score >= 9 ? 'medium' : 'low';

      const selectedVendor = vendors.find(v => v.id === formData.vendor_id);
      
      const newRisk: VendorRisk = {
        id: `vr-${Date.now()}`,
        vendor_id: formData.vendor_id,
        vendor: {
          name: selectedVendor?.name || 'Fornecedor',
          category: selectedVendor?.category || 'Unknown',
          status: selectedVendor?.status || 'active',
          risk_level: selectedVendor?.risk_level || 'medium',
          contact_person: selectedVendor?.contact_person || '',
          email: selectedVendor?.email || '',
          phone: selectedVendor?.phone || ''
        },
        title: formData.title,
        description: formData.description,
        risk_category: formData.risk_category,
        likelihood: formData.likelihood,
        impact: formData.impact,
        risk_level,
        risk_score,
        status: 'open',
        risk_owner: formData.risk_owner,
        identified_date: new Date().toISOString(),
        mitigation_actions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setVendorRisks([newRisk, ...vendorRisks]);
      setFormData({
        vendor_id: '',
        title: '',
        description: '',
        risk_category: 'Operational Risk',
        likelihood: 'Medium',
        impact: 'Medium',
        risk_owner: user?.id || ''
      });
      setIsCreateDialogOpen(false);
      
      toast.success('Risco de fornecedor criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar risco:', error);
      toast.error('Erro ao criar risco de fornecedor');
    }
  };

  const handleUpdateVendorRisk = (riskId: string, updates: any) => {
    setVendorRisks(prev => 
      prev.map(risk => 
        risk.id === riskId 
          ? { ...risk, ...updates, updated_at: new Date().toISOString() }
          : risk
      )
    );
    toast.success('Risco atualizado com sucesso');
  };

  const handleDeleteVendorRisk = (riskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este risco?')) {
      setVendorRisks(prev => prev.filter(risk => risk.id !== riskId));
      toast.success('Risco excluído com sucesso');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedRisks((risks) => {
        const oldIndex = risks.findIndex((risk) => risk.id === active.id);
        const newIndex = risks.findIndex((risk) => risk.id === over.id);

        return arrayMove(risks, oldIndex, newIndex);
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedStatuses([]);
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || 
                          selectedLevels.length > 0 || selectedStatuses.length > 0;

  // Métricas calculadas
  const metrics = {
    totalRisks: vendorRisks.length,
    criticalRisks: vendorRisks.filter(r => r.risk_level === 'critical').length,
    highRisks: vendorRisks.filter(r => r.risk_level === 'high').length,
    openRisks: vendorRisks.filter(r => r.status === 'open').length,
    overdueRisks: vendorRisks.filter(r => 
      r.next_review_date && new Date(r.next_review_date) < new Date()
    ).length,
    totalVendors: vendors.length,
    averageRiskScore: vendorRisks.length > 0 ? 
      Math.round(vendorRisks.reduce((sum, r) => sum + r.risk_score, 0) / vendorRisks.length) : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando riscos de fornecedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Vendor Risk Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Identifique, avalie e gerencie riscos de terceiros e fornecedores
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Risco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Risco de Fornecedor</DialogTitle>
                <DialogDescription>
                  Identifique e documente um novo risco relacionado a fornecedores ou terceiros.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendor_id">Fornecedor *</Label>
                  <Select 
                    value={formData.vendor_id} 
                    onValueChange={(value) => setFormData({...formData, vendor_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {vendor.name} ({vendor.category})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título do Risco *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Dependência crítica de fornecedor único"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva o risco em detalhes..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="risk_category">Categoria</Label>
                    <Select 
                      value={formData.risk_category} 
                      onValueChange={(value) => setFormData({...formData, risk_category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational Risk">Risco Operacional</SelectItem>
                        <SelectItem value="Financial Risk">Risco Financeiro</SelectItem>
                        <SelectItem value="Security Risk">Risco de Segurança</SelectItem>
                        <SelectItem value="Compliance Risk">Risco de Conformidade</SelectItem>
                        <SelectItem value="Reputation Risk">Risco de Reputação</SelectItem>
                        <SelectItem value="Strategic Risk">Risco Estratégico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="likelihood">Probabilidade</Label>
                    <Select 
                      value={formData.likelihood} 
                      onValueChange={(value) => setFormData({...formData, likelihood: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Very Low">Muito Baixa (1)</SelectItem>
                        <SelectItem value="Low">Baixa (2)</SelectItem>
                        <SelectItem value="Medium">Média (3)</SelectItem>
                        <SelectItem value="High">Alta (4)</SelectItem>
                        <SelectItem value="Very High">Muito Alta (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="impact">Impacto</Label>
                    <Select 
                      value={formData.impact} 
                      onValueChange={(value) => setFormData({...formData, impact: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Very Low">Muito Baixo (1)</SelectItem>
                        <SelectItem value="Low">Baixo (2)</SelectItem>
                        <SelectItem value="Medium">Médio (3)</SelectItem>
                        <SelectItem value="High">Alto (4)</SelectItem>
                        <SelectItem value="Very High">Muito Alto (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateVendorRisk}>
                  Criar Risco
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Total</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-foreground leading-none">{metrics.totalRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <Zap className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Críticos</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-red-600 leading-none">{metrics.criticalRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Altos</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-orange-600 leading-none">{metrics.highRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <Activity className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Em Aberto</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-foreground leading-none">{metrics.openRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Vencidos</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-foreground leading-none">{metrics.overdueRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Fornecedores</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-foreground leading-none">{metrics.totalVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[90px] text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2 leading-tight">Score Médio</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-bold text-foreground leading-none">{metrics.averageRiskScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar riscos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria do Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational Risk">Risco Operacional</SelectItem>
                  <SelectItem value="Financial Risk">Risco Financeiro</SelectItem>
                  <SelectItem value="Security Risk">Risco de Segurança</SelectItem>
                  <SelectItem value="Compliance Risk">Risco de Conformidade</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Nível de Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Em Aberto</SelectItem>
                  <SelectItem value="in_treatment">Em Tratamento</SelectItem>
                  <SelectItem value="monitored">Monitorado</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Riscos de Fornecedores */}
      <div className="space-y-4">
        {orderedRisks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {hasActiveFilters ? 'Nenhum risco encontrado' : 'Nenhum risco de fornecedor identificado'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros para encontrar riscos.' 
                    : 'Comece identificando e documentando riscos de fornecedores.'
                  }
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Risco
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={orderedRisks.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {orderedRisks.map((risk) => (
                  <SortableVendorRiskCard
                    key={risk.id}
                    risk={risk}
                    onUpdate={handleUpdateVendorRisk}
                    onDelete={handleDeleteVendorRisk}
                    canEdit={true}
                    canDelete={true}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default NewVendorRiskManagement;