import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target,
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  Clipboard,
  Eye,
  Search,
  Filter,
  BarChart3,
  Settings,
  ArrowRight
} from 'lucide-react';
import { SimpleEnhancedActionPlanCard } from './SimpleEnhancedActionPlanCard';

// Dados simulados de planos de ação
const mockPlans = [
  {
    id: '1',
    codigo: 'PA-001',
    titulo: 'Implementar controles de segurança da informação',
    modulo_origem: 'risk_management',
    prioridade: 'alta',
    status: 'em_execucao',
    percentual_conclusao: 75,
    responsavel: 'João Silva',
    data_fim_planejada: '2025-10-15',
    dias_para_vencimento: 26
  },
  {
    id: '2',
    codigo: 'PA-002',
    titulo: 'Adequação à LGPD - Política de Privacidade',
    modulo_origem: 'privacy',
    prioridade: 'critica',
    status: 'em_execucao',
    percentual_conclusao: 45,
    responsavel: 'Maria Santos',
    data_fim_planejada: '2025-09-30',
    dias_para_vencimento: 11
  },
  {
    id: '3',
    codigo: 'PA-003',
    titulo: 'Treinamento em compliance para equipe',
    modulo_origem: 'compliance',
    prioridade: 'media',
    status: 'concluido',
    percentual_conclusao: 100,
    responsavel: 'Carlos Oliveira',
    data_fim_planejada: '2025-08-30',
    dias_para_vencimento: -20
  },
  {
    id: '4',
    codigo: 'PA-004',
    titulo: 'Avaliação de fornecedores críticos',
    modulo_origem: 'assessments',
    prioridade: 'alta',
    status: 'planejado',
    percentual_conclusao: 15,
    responsavel: 'Ana Costa',
    data_fim_planejada: '2025-11-20',
    dias_para_vencimento: 62
  }
];

export const ActionPlansDashboard: React.FC = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'em_execucao': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planejado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getModuleIcon = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return <Shield className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      case 'assessments': return <Clipboard className="h-4 w-4" />;
      case 'privacy': return <Eye className="h-4 w-4" />;
      case 'tprm': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getModuleName = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return 'Riscos';
      case 'compliance': return 'Conformidade';
      case 'assessments': return 'Avaliações';
      case 'privacy': return 'Privacidade';
      case 'tprm': return 'TPRM';
      case 'audit': return 'Auditoria';
      default: return 'Geral';
    }
  };

  const getModuleColor = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return '#ef4444'; // red-500
      case 'compliance': return '#3b82f6'; // blue-500
      case 'assessments': return '#10b981'; // emerald-500
      case 'privacy': return '#8b5cf6'; // violet-500
      case 'tprm': return '#f59e0b'; // amber-500
      case 'audit': return '#06b6d4'; // cyan-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getModuleBadgeColor = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'compliance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assessments': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'privacy': return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200';
      case 'tprm': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'audit': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Planos de Ação</h1>
          <p className="text-muted-foreground">Central de Gestão e Acompanhamento de Planos de Ação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => navigate('/action-plans/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-green-600">58%</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  +2.1% vs mês anterior
                </p>
              </div>
              <Target className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Planos</p>
                <p className="text-2xl font-bold">{mockPlans.length}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold">{mockPlans.filter(p => p.status === 'em_execucao').length}</p>
              </div>
              <Activity className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{mockPlans.filter(p => p.dias_para_vencimento < 0).length}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{mockPlans.filter(p => p.prioridade === 'critica').length}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{mockPlans.filter(p => p.status === 'planejado').length}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-emerald-600">{mockPlans.filter(p => p.status === 'concluido').length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-indigo-600">{mockPlans.filter(p => p.prioridade === 'alta').length}</p>
              </div>
              <Target className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Origem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-red-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Gestão de Riscos</h3>
            <p className="text-muted-foreground text-sm">Planos de ação de riscos e controles</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{mockPlans.filter(p => p.modulo_origem === 'risk_management').length}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Conformidade</h3>
            <p className="text-muted-foreground text-sm">Não conformidades e adequações</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{mockPlans.filter(p => p.modulo_origem === 'compliance').length}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Clipboard className="h-8 w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Avaliações</h3>
            <p className="text-muted-foreground text-sm">Melhorias de assessments</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{mockPlans.filter(p => p.modulo_origem === 'assessments').length}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Privacidade</h3>
            <p className="text-muted-foreground text-sm">LGPD e proteção de dados</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{mockPlans.filter(p => p.modulo_origem === 'privacy').length}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Planos de Ação Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Planos de Ação Recentes
          </CardTitle>
          <CardDescription>
            Últimos planos criados ou atualizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlans.map(plan => {
              const simpleEnhancedPlan = {
                ...plan,
                responsavel: {
                  nome: plan.responsavel,
                  email: `${plan.responsavel.toLowerCase().replace(' ', '.')}@empresa.com`
                },
                descricao: `Plano de ação relacionado ao módulo ${plan.modulo_origem} com foco em melhorias operacionais e conformidade.`,
                atividades: [
                  {
                    id: '1',
                    titulo: 'Análise inicial e levantamento',
                    descricao: 'Levantamento completo da situação atual e definição de requisitos',
                    status: 'concluida',
                    data_fim_planejada: '2025-02-15',
                    data_fim_real: '2025-02-10',
                    responsavel: {
                      nome: plan.responsavel,
                      email: `${plan.responsavel.toLowerCase().replace(' ', '.')}@empresa.com`
                    },
                    percentual_conclusao: 100,
                    prioridade: 'alta',
                    evidencias_count: 1,
                    notificacoes_count: 1
                  },
                  {
                    id: '2',
                    titulo: 'Implementação das melhorias',
                    descricao: 'Execução das ações planejadas e implementação dos controles',
                    status: plan.percentual_conclusao > 50 ? 'em_execucao' : 'pendente',
                    data_fim_planejada: '2025-09-30',
                    data_fim_replanejada: plan.data_fim_planejada,
                    responsavel: {
                      nome: plan.responsavel,
                      email: `${plan.responsavel.toLowerCase().replace(' ', '.')}@empresa.com`
                    },
                    percentual_conclusao: plan.percentual_conclusao,
                    prioridade: plan.prioridade,
                    evidencias_count: 0,
                    notificacoes_count: 2
                  },
                  {
                    id: '3',
                    titulo: 'Testes e validação final',
                    descricao: 'Validação dos controles e testes de funcionalidade',
                    status: 'pendente',
                    data_fim_planejada: '2025-10-30',
                    responsavel: {
                      nome: 'Equipe de QA',
                      email: 'qa@empresa.com'
                    },
                    percentual_conclusao: 0,
                    prioridade: 'media',
                    evidencias_count: 0,
                    notificacoes_count: 0
                  }
                ]
              };
              
              return (
                <SimpleEnhancedActionPlanCard
                  key={plan.id}
                  actionPlan={simpleEnhancedPlan}
                  isExpandedByDefault={false}
                  showModuleLink={true}
                  onUpdate={(updatedPlan) => {
                    console.log('Plano atualizado:', updatedPlan);
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};