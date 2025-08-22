import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Bell,
  FileText,
  Edit,
  Eye,
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSecurity } from '@/utils/tenantSecurity';

interface ActionPlan {
  id: string;
  risk_id: string;
  risk_title: string;
  risk_category: string;
  risk_level: string;
  treatment_type: string;
  activities: Activity[];
  total_activities: number;
  completed_activities: number;
  overdue_activities: number;
  next_deadline: string | null;
  responsible_persons: string[];
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  activity_name: string;
  activity_description: string;
  responsible_name: string;
  responsible_email: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  evidence_description?: string;
  days_until_due?: number;
  is_overdue: boolean;
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const PRIORITY_ICONS = {
  low: '🟢',
  medium: '🟡', 
  high: '🟠',
  critical: '🔴'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const RISK_LEVEL_COLORS = {
  'Muito Baixo': 'bg-green-100 text-green-800',
  'Baixo': 'bg-green-100 text-green-800', 
  'Médio': 'bg-yellow-100 text-yellow-800',
  'Alto': 'bg-orange-100 text-orange-800',
  'Muito Alto': 'bg-red-100 text-red-800',
  'Crítico': 'bg-red-100 text-red-800'
};

export const ActionPlansManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userTenantId } = useTenantSecurity();

  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar dados dos planos de ação
  useEffect(() => {
    loadActionPlans();
  }, [userTenantId]);

  const loadActionPlans = async () => {
    if (!userTenantId) return;
    
    setIsLoading(true);
    try {
      // Buscar dados dos registros de risco e seus planos de ação
      const { data: riskData, error: riskError } = await supabase
        .from('risk_registrations')
        .select(`
          id,
          risk_title,
          risk_category,
          risk_level,
          treatment_strategy,
          created_at,
          updated_at
        `)
        .eq('tenant_id', userTenantId)
        .neq('treatment_strategy', 'accept')
        .order('created_at', { ascending: false });

      if (riskError) throw riskError;

      if (!riskData || riskData.length === 0) {
        setActionPlans([]);
        setIsLoading(false);
        return;
      }

      // Buscar atividades para cada risco
      const actionPlansData: ActionPlan[] = [];
      
      for (const risk of riskData) {
        const { data: activities, error: activitiesError } = await supabase
          .from('risk_registration_action_plans')
          .select('*')
          .eq('risk_registration_id', risk.id)
          .order('due_date', { ascending: true });

        if (activitiesError) {
          console.error('Erro ao carregar atividades:', activitiesError);
          continue;
        }

        const now = new Date();
        const processedActivities: Activity[] = (activities || []).map(activity => {
          const dueDate = new Date(activity.due_date);
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          return {
            id: activity.id,
            activity_name: activity.activity_name,
            activity_description: activity.activity_description || '',
            responsible_name: activity.responsible_name,
            responsible_email: activity.responsible_email,
            due_date: activity.due_date,
            priority: activity.priority,
            status: activity.status,
            evidence_description: activity.evidence_description,
            days_until_due: daysDiff,
            is_overdue: daysDiff < 0 && activity.status !== 'completed'
          };
        });

        const completedActivities = processedActivities.filter(a => a.status === 'completed');
        const overdueActivities = processedActivities.filter(a => a.is_overdue);
        const nextDeadline = processedActivities
          .filter(a => a.status !== 'completed' && !a.is_overdue)
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]?.due_date || null;

        const responsiblePersons = [...new Set(processedActivities.map(a => a.responsible_name))];

        actionPlansData.push({
          id: risk.id,
          risk_id: risk.id,
          risk_title: risk.risk_title,
          risk_category: risk.risk_category,
          risk_level: risk.risk_level,
          treatment_type: risk.treatment_strategy || 'mitigate',
          activities: processedActivities,
          total_activities: processedActivities.length,
          completed_activities: completedActivities.length,
          overdue_activities: overdueActivities.length,
          next_deadline: nextDeadline,
          responsible_persons: responsiblePersons,
          created_at: risk.created_at,
          updated_at: risk.updated_at
        });
      }

      setActionPlans(actionPlansData);
    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast({
        title: "Erro ao Carregar Dados",
        description: "Não foi possível carregar os planos de ação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActionPlans();
    setIsRefreshing(false);
    toast({
      title: "Dados Atualizados",
      description: "Os planos de ação foram atualizados com sucesso.",
    });
  };

  const toggleCardExpanded = (planId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedCards(newExpanded);
  };

  const filteredActionPlans = actionPlans.filter(plan => {
    const matchesSearch = 
      plan.risk_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.risk_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.responsible_persons.some(person => person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      plan.activities.some(activity => 
        activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.responsible_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = categoryFilter === 'all' || plan.risk_category === categoryFilter;
    const matchesRiskLevel = riskLevelFilter === 'all' || plan.risk_level === riskLevelFilter;

    let matchesStatus = true;
    if (statusFilter === 'with_overdue') {
      matchesStatus = plan.overdue_activities > 0;
    } else if (statusFilter === 'completed') {
      matchesStatus = plan.completed_activities === plan.total_activities && plan.total_activities > 0;
    } else if (statusFilter === 'in_progress') {
      matchesStatus = plan.completed_activities > 0 && plan.completed_activities < plan.total_activities;
    } else if (statusFilter === 'not_started') {
      matchesStatus = plan.completed_activities === 0 && plan.total_activities > 0;
    }

    let matchesPriority = true;
    if (priorityFilter !== 'all') {
      matchesPriority = plan.activities.some(activity => activity.priority === priorityFilter);
    }

    return matchesSearch && matchesCategory && matchesRiskLevel && matchesStatus && matchesPriority;
  });

  const calculateProgress = (plan: ActionPlan): number => {
    if (plan.total_activities === 0) return 0;
    return Math.round((plan.completed_activities / plan.total_activities) * 100);
  };

  const getProgressColor = (progress: number, hasOverdue: boolean): string => {
    if (hasOverdue) return 'bg-red-500';
    if (progress === 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const formatDaysUntilDue = (days: number | undefined): { text: string; color: string } => {
    if (days === undefined) return { text: 'N/A', color: 'text-gray-500' };
    if (days < 0) return { text: `${Math.abs(days)} dias em atraso`, color: 'text-red-600' };
    if (days === 0) return { text: 'Vence hoje', color: 'text-orange-600' };
    if (days <= 3) return { text: `${days} dias`, color: 'text-orange-500' };
    if (days <= 7) return { text: `${days} dias`, color: 'text-yellow-600' };
    return { text: `${days} dias`, color: 'text-green-600' };
  };

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalActionPlans: filteredActionPlans.length,
      summary: {
        totalActivities: filteredActionPlans.reduce((sum, plan) => sum + plan.total_activities, 0),
        completedActivities: filteredActionPlans.reduce((sum, plan) => sum + plan.completed_activities, 0),
        overdueActivities: filteredActionPlans.reduce((sum, plan) => sum + plan.overdue_activities, 0),
        averageProgress: filteredActionPlans.length > 0 
          ? filteredActionPlans.reduce((sum, plan) => sum + calculateProgress(plan), 0) / filteredActionPlans.length 
          : 0
      },
      actionPlans: filteredActionPlans
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planos-acao-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório Gerado",
      description: "Relatório de planos de ação baixado com sucesso.",
    });
  };

  const categories = [...new Set(actionPlans.map(plan => plan.risk_category))];
  const totalOverdueActivities = actionPlans.reduce((sum, plan) => sum + plan.overdue_activities, 0);
  const totalActivities = actionPlans.reduce((sum, plan) => sum + plan.total_activities, 0);
  const totalCompleted = actionPlans.reduce((sum, plan) => sum + plan.completed_activities, 0);
  const globalProgress = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando planos de ação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/risks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Gestão de Planos de Ação
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Acompanhamento centralizado de todas as atividades de tratamento de riscos
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={generateReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionPlans.length}</div>
            <p className="text-xs text-muted-foreground">planos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOverdueActivities > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalOverdueActivities}
            </div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalProgress}%</div>
            <Progress value={globalProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Atividades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">{totalCompleted} concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-6'}`}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="with_overdue">Com Atividades Vencidas</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="not_started">Não Iniciados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="critical">🔴 Crítica</SelectItem>
                <SelectItem value="high">🟠 Alta</SelectItem>
                <SelectItem value="medium">🟡 Média</SelectItem>
                <SelectItem value="low">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
                <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Baixo">Baixo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setRiskLevelFilter('all');
              setCategoryFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Planos de Ação - Cards Expansíveis */}
      <div className="space-y-4">
        {filteredActionPlans.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Nenhum plano de ação encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Não há planos de ação para exibir.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredActionPlans.map(plan => {
            const isExpanded = expandedCards.has(plan.id);
            const progress = calculateProgress(plan);
            const progressColor = getProgressColor(progress, plan.overdue_activities > 0);
            
            return (
              <Card key={plan.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg truncate">{plan.risk_title}</CardTitle>
                        <Badge className={`text-xs ${RISK_LEVEL_COLORS[plan.risk_level as keyof typeof RISK_LEVEL_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                          {plan.risk_level}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {plan.risk_category}
                        </Badge>
                        {plan.overdue_activities > 0 && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <Bell className="h-3 w-3 mr-1" />
                            {plan.overdue_activities} vencidas
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.total_activities} atividades</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{plan.completed_activities} concluídas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.responsible_persons.length} responsáveis</span>
                        </div>
                        {plan.next_deadline && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">
                              Próximo: {new Date(plan.next_deadline).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso Geral</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/risks?highlight=${plan.risk_id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleCardExpanded(plan.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          Atividades ({plan.activities.length})
                        </h4>
                        
                        {plan.activities.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <FileText className="mx-auto h-8 w-8 mb-2" />
                            <p>Nenhuma atividade cadastrada</p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {plan.activities.map(activity => {
                              const dueInfo = formatDaysUntilDue(activity.days_until_due);
                              
                              return (
                                <Card key={activity.id} className={`border-l-4 ${
                                  activity.is_overdue ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
                                  activity.status === 'completed' ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' :
                                  'border-l-blue-500'
                                }`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h5 className="font-medium truncate">{activity.activity_name}</h5>
                                          <Badge className={`text-xs border ${PRIORITY_COLORS[activity.priority]}`}>
                                            {PRIORITY_ICONS[activity.priority]} {activity.priority}
                                          </Badge>
                                          <Badge className={STATUS_COLORS[activity.status]}>
                                            {activity.status}
                                          </Badge>
                                        </div>
                                        
                                        {activity.activity_description && (
                                          <p className="text-sm text-muted-foreground mb-3">
                                            {activity.activity_description}
                                          </p>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                              <AvatarFallback className="text-xs">
                                                {activity.responsible_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <div className="font-medium">{activity.responsible_name}</div>
                                              <div className="text-xs text-muted-foreground">{activity.responsible_email}</div>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                              <div className="font-medium">
                                                {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                                              </div>
                                              <div className={`text-xs ${dueInfo.color}`}>
                                                {dueInfo.text}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {activity.evidence_description && (
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-4 w-4 text-muted-foreground" />
                                              <div className="text-xs text-muted-foreground truncate">
                                                {activity.evidence_description}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        {activity.is_overdue && (
                                          <AlertTriangle className="h-4 w-4 text-red-500" />
                                        )}
                                        {activity.status === 'completed' && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                        
                        {plan.responsible_persons.length > 0 && (
                          <div className="pt-4 border-t">
                            <h5 className="text-sm font-medium mb-2">Responsáveis Envolvidos:</h5>
                            <div className="flex flex-wrap gap-2">
                              {plan.responsible_persons.map((person, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {person}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};