import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Eye,
  Target,
  FileCheck,
  Gauge,
  Star,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageSquare,
  Send,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  Settings,
  Archive,
  Zap,
  Briefcase,
  Globe,
  Lock,
  Brain
} from 'lucide-react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SortableVendorRiskCard from './SortableVendorRiskCard';

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

interface VendorCommunication {
  id: string;
  vendor_id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  sent_at?: string;
  created_by: string;
  created_at: string;
}

interface VendorAssessment {
  id: string;
  vendor_id: string;
  title: string;
  assessment_type: string;
  status: string;
  overall_score?: number;
  risk_level?: string;
  completed_at?: string;
  created_at: string;
}

const VendorRiskManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorRisks, setVendorRisks] = useState<VendorRisk[]>([]);
  const [vendorCommunications, setVendorCommunications] = useState<VendorCommunication[]>([]);
  const [vendorAssessments, setVendorAssessments] = useState<VendorAssessment[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  const [filteredData, setFilteredData] = useState<VendorRisk[]>([]);
  const [sortedData, setSortedData] = useState<VendorRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Estados de dialog
  const [isRiskDialogOpen, setIsRiskDialogOpen] = useState(false);
  const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<VendorRisk | null>(null);

  // Estados de filtro
  const [filters, setFilters] = useState({
    search: '',
    vendor: 'all',
    riskLevel: 'all',
    status: 'all',
    category: 'all'
  });

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vendorRisks, filters]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchVendors(),
        fetchVendorRisks(),
        fetchVendorCommunications(),
        fetchVendorAssessments(),
        fetchProfiles()
      ]);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do sistema',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name');
    
    if (error) throw error;
    setVendors(data || []);
  };

  const fetchVendorRisks = async () => {
    const { data, error } = await supabase
      .from('vendor_risks')
      .select(`
        *,
        vendor:vendors(name, category, status, risk_level, contact_person, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Tabela vendor_risks não existe ainda, criando dados simulados');
      // Criar dados simulados baseados nos vendors existentes
      const simulatedRisks = vendors.slice(0, 3).map((vendor, index) => ({
        id: `risk-${vendor.id}-${index}`,
        vendor_id: vendor.id,
        vendor: {
          name: vendor.name,
          category: vendor.category,
          status: vendor.status,
          risk_level: vendor.risk_level,
          contact_person: vendor.contact_person,
          email: vendor.email,
          phone: vendor.phone,
        },
        title: `Risco de ${vendor.category} - ${vendor.name}`,
        description: `Avaliação de risco operacional para o fornecedor ${vendor.name}`,
        risk_category: 'Operational Risk',
        likelihood: 'Medium',
        impact: 'High',
        risk_level: vendor.risk_level,
        risk_score: Math.floor(Math.random() * 25) + 1,
        status: 'open',
        risk_owner: user?.id || '',
        identified_date: new Date().toISOString(),
        next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        mitigation_actions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setVendorRisks(simulatedRisks);
      return;
    }
    setVendorRisks(data || []);
  };

  const fetchVendorCommunications = async () => {
    const { data, error } = await supabase
      .from('vendor_communications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Tabela vendor_communications não existe, usando dados simulados');
      setVendorCommunications([]);
      return;
    }
    setVendorCommunications(data || []);
  };

  const fetchVendorAssessments = async () => {
    const { data, error } = await supabase
      .from('vendor_assessments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setVendorAssessments(data || []);
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, job_title')
      .eq('is_active', true);
    
    if (error) throw error;
    setProfiles(data || []);
  };

  const applyFilters = () => {
    let filtered = vendorRisks;
    
    if (filters.search) {
      filtered = filtered.filter(risk => 
        risk.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        risk.vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        risk.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(risk => risk.vendor_id === filters.vendor);
    }
    
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(risk => risk.risk_level === filters.riskLevel);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(risk => risk.status === filters.status);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(risk => risk.risk_category === filters.category);
    }
    
    setFilteredData(filtered);
    setSortedData(filtered);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      vendor: 'all',
      riskLevel: 'all',
      status: 'all',
      category: 'all'
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.vendor !== 'all' ||
      filters.riskLevel !== 'all' ||
      filters.status !== 'all' ||
      filters.category !== 'all'
    );
  };

  // Métricas do dashboard
  const getMetrics = () => {
    const totalRisks = vendorRisks.length;
    const highRisks = vendorRisks.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length;
    const openRisks = vendorRisks.filter(r => r.status === 'open').length;
    const overdueReviews = vendorRisks.filter(r => {
      if (!r.next_review_date) return false;
      return new Date(r.next_review_date) < new Date();
    }).length;

    return {
      totalRisks,
      highRisks,
      openRisks,
      overdueReviews,
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.status === 'active').length,
      pendingCommunications: vendorCommunications.filter(c => c.status === 'draft').length,
      completedAssessments: vendorAssessments.filter(a => a.status === 'completed').length
    };
  };

  const metrics = getMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Vendor Risk Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestão completa de riscos de terceiros, comunicação e avaliações
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Fornecedores</p>
                <p className="text-lg font-bold">{metrics.totalVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Ativos</p>
                <p className="text-lg font-bold">{metrics.activeVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Riscos Totais</p>
                <p className="text-lg font-bold">{metrics.totalRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-red-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Alto Risco</p>
                <p className="text-lg font-bold">{metrics.highRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-orange-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Em Aberto</p>
                <p className="text-lg font-bold">{metrics.openRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-amber-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Vencidos</p>
                <p className="text-lg font-bold">{metrics.overdueReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Comunicações</p>
                <p className="text-lg font-bold">{metrics.pendingCommunications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <FileCheck className="h-5 w-5 text-green-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Assessments</p>
                <p className="text-lg font-bold">{metrics.completedAssessments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riscos
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Assessments
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Riscos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Operational Risk', 'Financial Risk', 'Security Risk', 'Compliance Risk'].map((category) => {
                    const count = vendorRisks.filter(r => r.risk_category === category).length;
                    const percentage = vendorRisks.length > 0 ? (count / vendorRisks.length) * 100 : 0;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded">
                            <div 
                              className="h-full bg-primary rounded" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Status dos Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'open', label: 'Em Aberto', color: 'bg-red-500' },
                    { status: 'in_treatment', label: 'Em Tratamento', color: 'bg-yellow-500' },
                    { status: 'monitored', label: 'Monitorado', color: 'bg-blue-500' },
                    { status: 'closed', label: 'Fechado', color: 'bg-green-500' },
                  ].map(({ status, label, color }) => {
                    const count = vendorRisks.filter(r => r.status === status).length;
                    const percentage = vendorRisks.length > 0 ? (count / vendorRisks.length) * 100 : 0;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span className="text-sm">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Content - Riscos */}
        <TabsContent value="risks" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Filtros</h3>
                  {hasActiveFilters() && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar riscos..."
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filters.vendor} onValueChange={(value) => updateFilter('vendor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Fornecedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Fornecedores</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.riskLevel} onValueChange={(value) => updateFilter('riskLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Níveis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Níveis</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="open">Em Aberto</SelectItem>
                      <SelectItem value="in_treatment">Em Tratamento</SelectItem>
                      <SelectItem value="monitored">Monitorado</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Dialog open={isRiskDialogOpen} onOpenChange={setIsRiskDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Novo Risco
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingRisk ? 'Editar Risco' : 'Novo Risco de Fornecedor'}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <VendorRiskForm
                          risk={editingRisk}
                          vendors={vendors}
                          profiles={profiles}
                          onSubmit={async (data) => {
                            // Implementar salvamento do risco
                            console.log('Salvando risco:', data);
                            setIsRiskDialogOpen(false);
                            setEditingRisk(null);
                            await fetchVendorRisks();
                          }}
                          onCancel={() => {
                            setIsRiskDialogOpen(false);
                            setEditingRisk(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Riscos com Drag and Drop */}
          <div className="space-y-4">
            {sortedData.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Nenhum risco encontrado
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {hasActiveFilters() 
                        ? 'Tente ajustar os filtros para encontrar mais resultados.' 
                        : 'Comece criando seu primeiro risco de fornecedor.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedData.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sortedData.map((risk) => (
                      <SortableVendorRiskCard
                        key={risk.id}
                        risk={risk}
                        onEdit={(risk) => {
                          setEditingRisk(risk);
                          setIsRiskDialogOpen(true);
                        }}
                        onDelete={async (riskId) => {
                          // Implementar exclusão do risco
                          console.log('Excluindo risco:', riskId);
                          await fetchVendorRisks();
                        }}
                        canEdit={true}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </TabsContent>

        {/* Tab Content - Comunicação */}
        <TabsContent value="communication" className="space-y-6">
          <VendorCommunicationPanel
            vendors={vendors}
            communications={vendorCommunications}
            onSendCommunication={async (data) => {
              // Implementar envio de comunicação
              console.log('Enviando comunicação:', data);
              await fetchVendorCommunications();
            }}
          />
        </TabsContent>

        {/* Tab Content - Assessments */}
        <TabsContent value="assessments" className="space-y-6">
          <VendorAssessmentPanel
            vendors={vendors}
            assessments={vendorAssessments}
            onCreateAssessment={async (data) => {
              // Implementar criação de assessment
              console.log('Criando assessment:', data);
              await fetchVendorAssessments();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorRiskManagement;