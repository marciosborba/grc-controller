import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Building2, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  Activity,
  Eye,
  Archive,
  Target,
  FileCheck,
  Gauge,
  Star,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VendorCard from './VendorCard';
import SortableVendorCard from './SortableVendorCard';
import VendorForm from './VendorForm';
import NewVendorRiskManagement from './NewVendorRiskManagement';

// Tipos simplificados para compatibilidade
interface SimpleVendor {
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

interface VendorFilters {
  search: string;
  category: string;
  risk_level: string;
  status: string;
}

const VendorsPage = () => {
  const [activeView, setActiveView] = useState<'vendors' | 'risk_management'>('risk_management');
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [vendors, setVendors] = useState<SimpleVendor[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<SimpleVendor[]>([]);
  const [sortedVendors, setSortedVendors] = useState<SimpleVendor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<SimpleVendor | null>(null);
  const [isCardView, setIsCardView] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de filtro
  const [filters, setFilters] = useState<VendorFilters>({
    search: '',
    category: 'all',
    risk_level: 'all',
    status: 'all'
  });

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchVendors();
    fetchProfiles();
  }, []);

  useEffect(() => {
    let filtered = vendors;
    
    if (filters.search) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === filters.category);
    }
    
    if (filters.risk_level !== 'all') {
      filtered = filtered.filter(vendor => vendor.risk_level === filters.risk_level);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === filters.status);
    }
    
    setFilteredVendors(filtered);
    setSortedVendors(filtered);
  }, [vendors, filters]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const handleCreateVendor = async (vendorData: any) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([{
          ...vendorData,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Fornecedor criado com sucesso',
      });
      
      setIsDialogOpen(false);
      resetForm();
      fetchVendors();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar fornecedor',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateVendor = async (vendorId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Fornecedor atualizado com sucesso',
      });
      
      if (editingVendor?.id === vendorId) {
        setIsDialogOpen(false);
        resetForm();
      }
      
      fetchVendors();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar fornecedor',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);
      
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

  const handleEdit = (vendor: SimpleVendor) => {
    setEditingVendor(vendor);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVendor(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedVendors((vendors) => {
        const oldIndex = vendors.findIndex((vendor) => vendor.id === active.id);
        const newIndex = vendors.findIndex((vendor) => vendor.id === over.id);

        return arrayMove(vendors, oldIndex, newIndex);
      });
    }
  };

  const updateFilter = (key: keyof VendorFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      risk_level: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.category !== 'all' ||
      filters.risk_level !== 'all' ||
      filters.status !== 'all'
    );
  };

  // Métricas dos fornecedores
  const getMetrics = () => {
    const total = vendors.length;
    const active = vendors.filter(v => v.status === 'active').length;
    const high_risk = vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length;
    const expiring_contracts = vendors.filter(v => {
      if (!v.contract_end_date) return false;
      const endDate = new Date(v.contract_end_date);
      const now = new Date();
      const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
    }).length;

    return {
      total,
      active,
      high_risk,
      expiring_contracts
    };
  };

  const metrics = getMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  // Se o modo de visualização for risk_management, usar o novo componente
  if (activeView === 'risk_management') {
    return <NewVendorRiskManagement />;
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de visualização */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Vendor Risk</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie fornecedores e riscos de terceiros
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-input bg-background p-1">
            <Button
              variant={activeView === 'risk_management' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('risk_management')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Risk Management
            </Button>
            <Button
              variant={activeView === 'vendors' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('vendors')}
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Fornecedores
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCardView(!isCardView)}
          >
            {isCardView ? <BarChart3 className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            {isCardView ? 'Visão Lista' : 'Visão Cards'}
          </Button>
          
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
              
              <VendorForm
                vendor={editingVendor || undefined}
                profiles={profiles}
                onSubmit={editingVendor ? 
                  (data) => handleUpdateVendor(editingVendor.id, data) : 
                  handleCreateVendor
                }
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Ativos</p>
                <p className="text-lg font-bold">{metrics.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Alto Risco</p>
                <p className="text-lg font-bold">{metrics.high_risk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-orange-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Vencendo</p>
                <p className="text-lg font-bold">{metrics.expiring_contracts}</p>
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
              {hasActiveFilters() && (
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
                  placeholder="Pesquisar fornecedores..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={filters.category} 
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="Technology Provider">Tecnologia</SelectItem>
                  <SelectItem value="Professional Services">Serviços</SelectItem>
                  <SelectItem value="Manufacturing">Manufatura</SelectItem>
                  <SelectItem value="Logistics">Logística</SelectItem>
                  <SelectItem value="Cloud Service Provider">Cloud</SelectItem>
                  <SelectItem value="Data Processor">Dados</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.risk_level} 
                onValueChange={(value) => updateFilter('risk_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Riscos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Riscos</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.status} 
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="under_review">Em Análise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fornecedores */}
      <div className="space-y-4">
        {sortedVendors.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhum fornecedor encontrado
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {hasActiveFilters() 
                    ? 'Tente ajustar os filtros para encontrar mais resultados.' 
                    : 'Comece criando seu primeiro fornecedor.'
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
              items={sortedVendors.map(v => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedVendors.map((vendor) => (
                  <SortableVendorCard
                    key={vendor.id}
                    vendor={vendor as any}
                    onUpdate={handleUpdateVendor}
                    onDelete={handleDeleteVendor}
                    canEdit={true}
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

export default VendorsPage;