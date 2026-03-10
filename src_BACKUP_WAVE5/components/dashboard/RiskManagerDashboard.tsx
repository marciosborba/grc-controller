import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Shield,
  Activity,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';

const mockRisks = [
  {
    id: 1,
    title: 'Vazamento de Dados Pessoais',
    category: 'Cybersecurity',
    inherentRisk: 'Alto',
    residualRisk: 'Médio',
    status: 'Mitigating',
    owner: 'TI',
    dueDate: '2024-08-15',
    progress: 75
  },
  {
    id: 2,
    title: 'Falha em Fornecedor Crítico',
    category: 'Operational',
    inherentRisk: 'Crítico',
    residualRisk: 'Alto',
    status: 'Open',
    owner: 'Procurement',
    dueDate: '2024-07-30',
    progress: 25
  },
  {
    id: 3,
    title: 'Mudança Regulatória LGPD',
    category: 'Compliance',
    inherentRisk: 'Médio',
    residualRisk: 'Baixo',
    status: 'Accepted',
    owner: 'Legal',
    dueDate: '2024-09-01',
    progress: 90
  }
];

const getRiskColor = (level: string) => {
  switch (level) {
    case 'Crítico': return 'risk-critical';
    case 'Alto': return 'risk-high';
    case 'Médio': return 'risk-medium';
    case 'Baixo': return 'risk-low';
    default: return 'risk-medium';
  }
};

const RiskManagerDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Riscos</h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento e controle de riscos organizacionais
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Matriz de Riscos
          </Button>
          <Button className="grc-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Risco
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Riscos Ativos</p>
                <p className="text-2xl font-bold text-foreground">47</p>
                <p className="text-sm text-muted-foreground">
                  +3 novos esta semana
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Riscos Críticos</p>
                <p className="text-2xl font-bold text-danger">2</p>
                <p className="text-sm text-success">
                  -1 vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-danger/10 rounded-lg">
                <Target className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mitigações</p>
                <p className="text-2xl font-bold text-foreground">23</p>
                <p className="text-sm text-primary">
                  Em andamento
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">KRIs Ativos</p>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-sm text-warning">
                  12 em alerta
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Activity className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk List */}
      <Card className="grc-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Riscos Prioritários</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRisks.map((risk) => (
              <div 
                key={risk.id}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{risk.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{risk.category}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Inerente:</span>
                        <Badge className={`${getRiskColor(risk.inherentRisk)} text-xs`}>
                          {risk.inherentRisk}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Residual:</span>
                        <Badge className={`${getRiskColor(risk.residualRisk)} text-xs`}>
                          {risk.residualRisk}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Owner:</span>
                        <span className="text-xs font-medium">{risk.owner}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {risk.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso da Mitigação:</span>
                    <span className="font-medium">{risk.progress}%</span>
                  </div>
                  <Progress value={risk.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Prazo: {risk.dueDate}</span>
                    <span>{100 - risk.progress}% restante</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-danger/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-danger/20 transition-colors">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Identificar Riscos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Utilize IA para identificar novos riscos emergentes
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Iniciar Análise
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Planos de Ação</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Criar e gerenciar planos de mitigação
            </p>
            <Button className="grc-button-primary w-full">
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-accent/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Relatórios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerar relatórios de risco personalizados
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Criar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskManagerDashboard;
export { RiskManagerDashboard };