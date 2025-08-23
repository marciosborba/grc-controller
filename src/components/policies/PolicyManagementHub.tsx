import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LayoutDashboard,
  FileEdit,
  Eye,
  CheckCircle,
  BookOpen,
  BarChart3,
  Calendar,
  Settings,
  Search,
  Filter,
  Bell,
  Brain,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Importar views
import PolicyDashboard from './views/PolicyDashboard';
import PolicyElaboration from './views/PolicyElaboration';

// Placeholder components para outras views
const PolicyReview = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Revisão de Políticas</h3>
    <p className="text-muted-foreground">Módulo de revisão será implementado</p>
  </div>
);

const PolicyApproval = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Aprovação de Políticas</h3>
    <p className="text-muted-foreground">Módulo de aprovação será implementado</p>
  </div>
);

const PolicyPublication = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Publicação de Políticas</h3>
    <p className="text-muted-foreground">Módulo de publicação será implementado</p>
  </div>
);

const PolicyLifecycle = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Ciclo de Vida</h3>
    <p className="text-muted-foreground">Gestão do ciclo de vida será implementada</p>
  </div>
);

const PolicyAnalytics = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Analytics</h3>
    <p className="text-muted-foreground">Módulo de analytics será implementado</p>
  </div>
);

const PolicyTemplates = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <FileEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Templates</h3>
    <p className="text-muted-foreground">Biblioteca de templates será implementada</p>
  </div>
);

const PolicySettings = ({ policies, onPolicyUpdate }: any) => (
  <div className="p-8 text-center">
    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Configurações</h3>
    <p className="text-muted-foreground">Configurações do módulo serão implementadas</p>
  </div>
);

interface Policy {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  document_type: string;
  version: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

const PolicyManagementHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [activeView, setActiveView] = useState('elaboration');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  // Estados para Alex Policy
  const [alexConfig, setAlexConfig] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

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
    if (user?.tenant?.id) {
      console.log('🚀 [NOVO MÓDULO] Gestão de Políticas iniciado - Cards expansíveis disponíveis!');
      loadInitialData();
    }
  }, [user?.tenant?.id]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadPolicies(),
        loadAlexConfig(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPolicies = async () => {
    if (!user?.tenant?.id) return;

    console.log('Carregando políticas para tenant:', user.tenant.id);
    
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('tenant_id', user.tenant.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar políticas:', error);
      return;
    }

    console.log('Políticas carregadas:', data?.length || 0);
    setPolicies(data || []);
  };

  const loadAlexConfig = async () => {
    // Carregar configurações do Alex Policy
    // Por enquanto, usar configuração padrão
    setAlexConfig({
      enabled: true,
      model: 'gpt-4',
      features: ['suggestions', 'compliance_check', 'structure_analysis']
    });
  };

  const loadNotifications = async () => {
    // Carregar notificações pendentes
    setNotificationCount(3); // Mock
  };

  const handlePolicyUpdate = () => {
    loadPolicies();
  };

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

  const ActiveComponent = tabs.find(tab => tab.id === activeView)?.component || PolicyElaboration;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando módulo de políticas...</p>
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
            Gestão de Políticas e Normas - NOVO MÓDULO REFATORADO
          </h1>
          <p className="text-muted-foreground mt-1">
            Ciclo completo de gestão de políticas com assistência de IA Alex Policy
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Alex Policy Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Alex Policy</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
          
          {/* Notificações */}
          {notificationCount > 0 && (
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {notificationCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Confirmação do novo módulo */}
      <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          ✅ <strong>NOVO MÓDULO REFATORADO ATIVO</strong> - Cards Expansíveis implementados com PolicyProcessCard.tsx
        </AlertDescription>
      </Alert>

      {/* Filtros globais */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar políticas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeView} onValueChange={changeActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center space-y-1 p-3"
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <PolicyDashboard
            policies={policies}
          />
        </TabsContent>

        {/* Elaboração */}
        <TabsContent value="elaboration" className="space-y-6">
          <PolicyElaboration
            policies={policies}
            onPolicyUpdate={loadPolicies}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>

        {/* Outras tabs */}
        {tabs.slice(2).map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <tab.component
              policies={policies}
              onPolicyUpdate={handlePolicyUpdate}
              alexConfig={alexConfig}
              searchTerm={searchTerm}
              filters={filters}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PolicyManagementHub;