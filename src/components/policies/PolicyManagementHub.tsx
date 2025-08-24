import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileEdit,
  Eye,
  CheckCircle,
  BookOpen,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Plus,
  Brain,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Importar views
import PolicyDashboard from './views/PolicyDashboard';
import PolicyElaboration from './views/PolicyElaboration';
import PolicyReview from './views/PolicyReview';
import PolicyApproval from './views/PolicyApproval';
import PolicyPublication from './views/PolicyPublication';
import PolicyLifecycle from './views/PolicyLifecycle';
import PolicyAnalytics from './views/PolicyAnalytics';
import PolicyTemplates from './views/PolicyTemplates';

interface Policy {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  document_type?: string;
  version: string;
  workflow_stage?: string;
  priority?: string;
  effective_date?: string;
  review_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  content?: any;
  metadata?: any;
  document_url?: string;
}

const PolicyManagementHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [activeView, setActiveView] = useState('dashboard');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Estados para Alex Policy
  const [alexConfig] = useState({
    enabled: true,
    model: 'gpt-4',
    features: ['suggestions', 'compliance_check', 'structure_analysis']
  });

  // Função para mudar view e salvar no localStorage
  const changeActiveView = (view: string) => {
    setActiveView(view);
    localStorage.setItem('policy-management-active-view', view);
  };

  // Carregar view salva do localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('policy-management-active-view');
    if (savedView) {
      setActiveView(savedView);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const tenantId = user?.tenant?.id || user?.tenantId;
    
    if (tenantId) {
      loadPolicies();
    }
  }, [user?.tenant?.id, user?.tenantId, user]);

  const loadPolicies = async () => {
    // Tentar usar tenantId como fallback
    const tenantId = user?.tenant?.id || user?.tenantId;
    
    if (!tenantId) {
      console.log('❌ PolicyManagement: Sem tenant_id disponível');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('id, title, description, status, category, document_type, version, created_at, updated_at, effective_date, review_date, expiry_date, created_by, approved_by, approved_at, owner_id, document_url, metadata, priority')
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ PolicyManagement: Erro ao carregar políticas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar políticas",
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ PolicyManagement: ${data?.length || 0} políticas carregadas`);
      setPolicies(data || []);
    } catch (error) {
      console.error('Erro ao carregar políticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar políticas
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = !searchTerm || 
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Obter categorias únicas
  const categories = [...new Set(policies.map(p => p.category))];
  const statuses = [...new Set(policies.map(p => p.status))];

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      component: PolicyDashboard,
      description: 'Visão geral e métricas'
    },
    {
      id: 'elaboration',
      label: 'Elaboração',
      icon: FileEdit,
      component: PolicyElaboration,
      description: 'Criar e editar políticas'
    },
    {
      id: 'review',
      label: 'Revisão',
      icon: Eye,
      component: PolicyReview,
      description: 'Revisar e comentar'
    },
    {
      id: 'approval',
      label: 'Aprovação',
      icon: CheckCircle,
      component: PolicyApproval,
      description: 'Aprovar políticas'
    },
    {
      id: 'publication',
      label: 'Publicação',
      icon: BookOpen,
      component: PolicyPublication,
      description: 'Publicar e distribuir'
    },
    {
      id: 'lifecycle',
      label: 'Ciclo de Vida',
      icon: Calendar,
      component: PolicyLifecycle,
      description: 'Gestão de validade'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: PolicyAnalytics,
      description: 'Métricas e relatórios'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileEdit,
      component: PolicyTemplates,
      description: 'Biblioteca de modelos'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeView)?.component || PolicyDashboard;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando políticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">
            Gestão de Políticas e Normas
          </h1>
          <p className="text-muted-foreground mt-1">
            Ciclo completo de gestão de políticas com assistência de IA
          </p>
        </div>
        
        <div className="flex items-center space-x-3">

          

        </div>
      </div>

      {/* Filtros globais */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3 w-3 mb-0.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar políticas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="all">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'draft' ? 'Rascunho' :
                     status === 'review' ? 'Em Revisão' :
                     status === 'approved' ? 'Aprovado' :
                     status === 'published' ? 'Publicado' : status}
                  </option>
                ))}
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3 mb-0.5 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
          
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeView} onValueChange={changeActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-0.5 p-0.5 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="!flex !flex-col !items-center !justify-center !p-1 !px-0.5 !py-1 !min-w-0 !h-10 !text-xs"
                title={tab.description}
              >
                <Icon className="h-3 w-3 mb-0.5" />
                <span className="hidden sm:block truncate leading-none text-xs">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Conteúdo das tabs */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <tab.component
              policies={filteredPolicies}
              allPolicies={policies}
              onPolicyUpdate={loadPolicies}
              alexConfig={alexConfig}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              isLoading={isLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PolicyManagementHub;