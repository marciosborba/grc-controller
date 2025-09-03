import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  TrendingUp,
  Shield,
  Brain,
  Workflow,
  Calendar,
  Settings,
  Eye,
  MessageSquare,
  Sparkles,
  Target,
  BookOpen,
  Archive
} from 'lucide-react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

// Views
import PolicyDashboardView from './views/PolicyDashboardView';
import PolicyElaborationView from './views/PolicyElaborationView';
import PolicyReviewView from './views/PolicyReviewView';
import PolicyApprovalView from './views/PolicyApprovalView';
import PolicyPublicationView from './views/PolicyPublicationView';
import PolicyValidityView from './views/PolicyValidityView';

// Shared Components
import AlexPolicyAssistant from './shared/AlexPolicyAssistant';
import PolicyMetricsPanel from './shared/PolicyMetricsPanel';
import PolicyNotificationCenter from './shared/PolicyNotificationCenter';

// Types
import type { PolicyV2, PolicyMetrics, WorkflowStage } from '@/types/policy-management-v2';

type ViewType = 'dashboard' | 'elaboration' | 'review' | 'approval' | 'publication' | 'validity';

interface PolicyManagementCenterProps {
  initialView?: ViewType;
}

const PolicyManagementCenter: React.FC<PolicyManagementCenterProps> = ({
  initialView = 'dashboard'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [policies, setPolicies] = useState<PolicyV2[]>([]);
  const [metrics, setMetrics] = useState<PolicyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alexActive, setAlexActive] = useState(true);
  const [showAlexDialog, setShowAlexDialog] = useState(false);

  // Estados para notificações e alertas
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [upcomingReviews, setUpcomingReviews] = useState(0);
  const [expiringPolicies, setExpiringPolicies] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - em produção, viria do backend
      const mockMetrics: PolicyMetrics = {
        total_policies: 45,
        policies_by_status: {
          draft: 8,
          under_review: 5,
          pending_approval: 3,
          approved: 25,
          published: 20,
          expired: 2,
          archived: 7,
          rejected: 1,
          suspended: 0
        },
        policies_by_category: {
          governance: 12,
          compliance: 8,
          security: 10,
          hr: 6,
          finance: 4,
          operations: 3,
          legal: 2,
          quality: 0,
          environmental: 0,
          health_safety: 0
        },
        policies_by_priority: {
          low: 15,
          medium: 20,
          high: 8,
          critical: 2
        },
        pending_approvals: 3,
        upcoming_reviews: 7,
        expired_policies: 2,
        compliance_rate: 94.5,
        average_approval_time: 5.2,
        acknowledgment_rate: 87.3,
        alex_usage_rate: 78.9
      };

      setMetrics(mockMetrics);
      setPendingApprovals(mockMetrics.pending_approvals);
      setUpcomingReviews(mockMetrics.upcoming_reviews);
      setExpiringPolicies(mockMetrics.expired_policies);

      toast({
        title: '✅ Dados Carregados',
        description: 'Dashboard de políticas atualizado com sucesso',
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    
    // Analytics/tracking
    console.log(`Navegação para view: ${view}`);
    
    toast({
      title: `📋 ${getViewTitle(view)}`,
      description: 'Carregando dados da seção...',
    });
  };

  const getViewTitle = (view: ViewType): string => {
    const titles = {
      dashboard: 'Dashboard de Políticas',
      elaboration: 'Elaboração de Políticas',
      review: 'Revisão de Políticas',
      approval: 'Aprovação de Políticas',
      publication: 'Publicação de Políticas',
      validity: 'Gestão da Validade'
    };
    return titles[view];
  };

  const getViewIcon = (view: ViewType) => {
    const icons = {
      dashboard: BarChart3,
      elaboration: FileText,
      review: Eye,
      approval: CheckCircle,
      publication: Users,
      validity: Calendar
    };
    return icons[view];
  };

  const getViewDescription = (view: ViewType): string => {
    const descriptions = {
      dashboard: 'Visão geral e métricas do módulo de políticas',
      elaboration: 'Criação e elaboração de políticas com assistência IA',
      review: 'Processo de revisão técnica e de compliance',
      approval: 'Fluxo de aprovação estruturado e controlado',
      publication: 'Gestão de publicação e comunicação',
      validity: 'Controle de vigência e renovação de políticas'
    };
    return descriptions[view];
  };

  const quickActions = [
    {
      id: 'new-policy',
      title: 'Nova Política',
      description: 'Criar política com Alex Policy',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => setCurrentView('elaboration')
    },
    {
      id: 'review-pending',
      title: 'Revisões Pendentes',
      description: `${upcomingReviews} políticas aguardando`,
      icon: Eye,
      color: 'bg-orange-500',
      action: () => setCurrentView('review'),
      badge: upcomingReviews > 0 ? upcomingReviews.toString() : undefined
    },
    {
      id: 'approve-pending',
      title: 'Aprovações Pendentes',
      description: `${pendingApprovals} aguardando aprovação`,
      icon: CheckCircle,
      color: 'bg-green-500',
      action: () => setCurrentView('approval'),
      badge: pendingApprovals > 0 ? pendingApprovals.toString() : undefined
    },
    {
      id: 'expiring-soon',
      title: 'Vencimentos Próximos',
      description: `${expiringPolicies} políticas expirando`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      action: () => setCurrentView('validity'),
      badge: expiringPolicies > 0 ? expiringPolicies.toString() : undefined
    }
  ];

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4\"></div>
          <p className=\"text-muted-foreground\">Carregando módulo de políticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0\">
        <div className=\"flex-1 min-w-0\">
          <div className=\"flex items-center space-x-3 mb-2\">
            <div className=\"p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg\">
              <FileText className=\"h-6 w-6 text-indigo-600 dark:text-indigo-400\" />
            </div>
            <div>
              <h1 className=\"text-2xl sm:text-3xl font-bold truncate\">
                Gestão de Políticas e Normas
              </h1>
              <p className=\"text-muted-foreground text-sm sm:text-base\">
                Ciclo completo de gestão com assistência Alex Policy IA
              </p>
            </div>
          </div>
        </div>
        
        <div className=\"flex items-center space-x-3\">
          {/* Alex Policy Status */}
          <div className=\"flex items-center space-x-2\">
            <div className={`w-2 h-2 rounded-full ${alexActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className=\"text-sm text-muted-foreground\">
              Alex Policy {alexActive ? 'ativo' : 'standby'}
            </span>
          </div>

          {/* Alex Policy Chat */}
          <ImprovedAIChatDialog
            type=\"policy\"
            title=\"Alex Policy - Assistente Especializado\"
            trigger={
              <Button variant=\"outline\" className=\"flex items-center space-x-2\">
                <Brain className=\"h-4 w-4\" />
                <span>Alex Policy</span>
                <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                  <Sparkles className=\"h-3 w-3 mr-1\" />
                  IA
                </Badge>
              </Button>
            }
          />

          {/* Configurações */}
          <Button variant=\"outline\" size=\"sm\">
            <Settings className=\"h-4 w-4\" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-4\">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={action.id} 
              className=\"cursor-pointer hover:shadow-md transition-shadow group\"
              onClick={action.action}
            >
              <CardContent className=\"p-4\">
                <div className=\"flex items-start justify-between\">
                  <div className=\"flex items-center space-x-3\">
                    <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                      <IconComponent className=\"h-4 w-4\" />
                    </div>
                    <div className=\"flex-1 min-w-0\">
                      <h3 className=\"font-medium text-sm truncate\">{action.title}</h3>
                      <p className=\"text-xs text-muted-foreground mt-1\">{action.description}</p>
                    </div>
                  </div>
                  {action.badge && (
                    <Badge variant=\"destructive\" className=\"text-xs\">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <Tabs value={currentView} onValueChange={(value) => handleViewChange(value as ViewType)}>
        <TabsList className=\"grid w-full grid-cols-6\">
          <TabsTrigger value=\"dashboard\" className=\"flex items-center space-x-2\">
            <BarChart3 className=\"h-4 w-4\" />
            <span className=\"hidden sm:inline\">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value=\"elaboration\" className=\"flex items-center space-x-2\">
            <FileText className=\"h-4 w-4\" />
            <span className=\"hidden sm:inline\">Elaboração</span>
          </TabsTrigger>
          <TabsTrigger value=\"review\" className=\"flex items-center space-x-2\">
            <Eye className=\"h-4 w-4\" />
            <span className=\"hidden sm:inline\">Revisão</span>
          </TabsTrigger>
          <TabsTrigger value=\"approval\" className=\"flex items-center space-x-2\">
            <CheckCircle className=\"h-4 w-4\" />
            <span className=\"hidden sm:inline\">Aprovação</span>
          </TabsTrigger>
          <TabsTrigger value=\"publication\" className=\"flex items-center space-x-2\">
            <Users className=\"h-4 w-4\" />
            <span className=\"hidden sm:inline\">Publicação</span>
          </TabsTrigger>
          <TabsTrigger value=\"validity\" className=\"flex items-center space-x-2\">
            <Calendar className=\"h-4 w-4\" />
            <span className=\"hidden sm:inline\">Validade</span>
          </TabsTrigger>
        </TabsList>

        {/* View Content */}
        <div className=\"mt-6\">
          <TabsContent value=\"dashboard\" className=\"space-y-6\">
            <PolicyDashboardView 
              metrics={metrics}
              onNavigate={handleViewChange}
            />
          </TabsContent>

          <TabsContent value=\"elaboration\" className=\"space-y-6\">
            <PolicyElaborationView 
              onPolicyCreated={(policy) => {
                toast({
                  title: '✅ Política Criada',
                  description: `Política \"${policy.title}\" criada com sucesso`,
                });
              }}
            />
          </TabsContent>

          <TabsContent value=\"review\" className=\"space-y-6\">
            <PolicyReviewView 
              onReviewCompleted={(review) => {
                toast({
                  title: '✅ Revisão Concluída',
                  description: 'Revisão registrada no sistema',
                });
              }}
            />
          </TabsContent>

          <TabsContent value=\"approval\" className=\"space-y-6\">
            <PolicyApprovalView 
              onApprovalDecision={(approval) => {
                toast({
                  title: approval.status === 'approved' ? '✅ Política Aprovada' : '❌ Política Rejeitada',
                  description: 'Decisão registrada no sistema',
                });
              }}
            />
          </TabsContent>

          <TabsContent value=\"publication\" className=\"space-y-6\">
            <PolicyPublicationView 
              onPublicationScheduled={(publication) => {
                toast({
                  title: '📢 Publicação Agendada',
                  description: 'Política será publicada conforme programado',
                });
              }}
            />
          </TabsContent>

          <TabsContent value=\"validity\" className=\"space-y-6\">
            <PolicyValidityView 
              onValidityUpdated={(policy) => {
                toast({
                  title: '📅 Validade Atualizada',
                  description: `Política \"${policy.title}\" atualizada`,
                });
              }}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Alex Policy Integration - Contextual */}
      {alexActive && (
        <AlexPolicyAssistant 
          currentView={currentView}
          context={{
            metrics,
            pendingApprovals,
            upcomingReviews,
            expiringPolicies
          }}
          onSuggestion={(suggestion) => {
            toast({
              title: '🤖 Sugestão Alex Policy',
              description: suggestion.description,
            });
          }}
        />
      )}

      {/* Notification Center */}
      <PolicyNotificationCenter 
        pendingApprovals={pendingApprovals}
        upcomingReviews={upcomingReviews}
        expiringPolicies={expiringPolicies}
        onNotificationClick={(type) => {
          const viewMap = {
            approval: 'approval',
            review: 'review',
            expiry: 'validity'
          };
          if (viewMap[type]) {
            setCurrentView(viewMap[type] as ViewType);
          }
        }}
      />
    </div>
  );
};

export default PolicyManagementCenter;