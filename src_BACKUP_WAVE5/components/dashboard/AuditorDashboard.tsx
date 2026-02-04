import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Target,
  BarChart3
} from 'lucide-react';

const mockAudits = [
  {
    id: 1,
    title: 'Auditoria ISO 27001:2022',
    type: 'Certification',
    status: 'In Progress',
    progress: 65,
    startDate: '2024-07-01',
    endDate: '2024-08-15',
    auditor: 'João Oliveira',
    findings: 8,
    scope: 'Segurança da Informação'
  },
  {
    id: 2,
    title: 'Revisão Controles LGPD',
    type: 'Compliance',
    status: 'Planned',
    progress: 15,
    startDate: '2024-08-01',
    endDate: '2024-08-30',
    auditor: 'Maria Santos',
    findings: 0,
    scope: 'Privacidade de Dados'
  },
  {
    id: 3,
    title: 'Auditoria SOX Controles TI',
    type: 'Internal',
    status: 'Completed',
    progress: 100,
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    auditor: 'Carlos Lima',
    findings: 12,
    scope: 'Controles de TI'
  }
];

const mockFindings = [
  {
    id: 1,
    audit: 'ISO 27001:2022',
    title: 'Política de senhas desatualizada',
    severity: 'Medium',
    status: 'Open',
    dueDate: '2024-08-30',
    owner: 'TI'
  },
  {
    id: 2,
    audit: 'SOX Controles TI',
    title: 'Segregação de funções inadequada',
    severity: 'High',
    status: 'In Progress',
    dueDate: '2024-07-31',
    owner: 'TI'
  },
  {
    id: 3,
    audit: 'ISO 27001:2022',
    title: 'Backup não testado regularmente',
    severity: 'High',
    status: 'Resolved',
    dueDate: '2024-07-15',
    owner: 'Infraestrutura'
  }
];

const AuditorDashboard = () => {
  const navigate = useNavigate();

  const handlePlanejamentoClick = () => {
    navigate('/planejamento-estrategico');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Auditoria</h1>
          <p className="text-muted-foreground mt-1">
            Planejamento, execução e acompanhamento de auditorias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Cronograma
          </Button>
          <Button className="grc-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auditorias Ativas</p>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-primary">
                  3 em andamento
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achados Abertos</p>
                <p className="text-2xl font-bold text-warning">15</p>
                <p className="text-sm text-muted-foreground">
                  5 críticos
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
                <p className="text-sm font-medium text-muted-foreground">Taxa de Resolução</p>
                <p className="text-2xl font-bold text-foreground">87%</p>
                <p className="text-sm text-success">
                  +12% vs trimestre
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas Planejadas</p>
                <p className="text-2xl font-bold text-foreground">420</p>
                <p className="text-sm text-accent">
                  Este trimestre
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audits and Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Audits */}
        <Card className="grc-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Auditorias Ativas</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAudits.map((audit) => (
                <div 
                  key={audit.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{audit.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{audit.scope}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Auditor: {audit.auditor}</span>
                        <span>Achados: {audit.findings}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={
                          audit.status === 'Completed' ? 'bg-success/10 text-success border-success/30' :
                          audit.status === 'In Progress' ? 'bg-primary/10 text-primary border-primary/30' :
                          'bg-muted/10 text-muted-foreground border-muted/30'
                        }
                      >
                        {audit.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso:</span>
                      <span className="font-medium">{audit.progress}%</span>
                    </div>
                    <Progress value={audit.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{audit.startDate} - {audit.endDate}</span>
                      <span>{100 - audit.progress}% restante</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Findings */}
        <Card className="grc-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Achados Recentes</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                Relatório
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFindings.map((finding) => (
                <div 
                  key={finding.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {finding.audit}
                        </Badge>
                        <Badge 
                          className={
                            finding.severity === 'High' ? 'risk-high text-xs' :
                            finding.severity === 'Medium' ? 'risk-medium text-xs' :
                            'risk-low text-xs'
                          }
                        >
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{finding.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: {finding.dueDate} • Owner: {finding.owner}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={
                          finding.status === 'Resolved' ? 'bg-success/10 text-success border-success/30' :
                          finding.status === 'In Progress' ? 'bg-primary/10 text-primary border-primary/30' :
                          'bg-warning/10 text-warning border-warning/30'
                        }
                      >
                        {finding.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
          onClick={handlePlanejamentoClick}
        >
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Planejamento Estratégico</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gestão completa do planejamento estratégico organizacional
            </p>
            <Button className="grc-button-primary w-full">
              Acessar Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-warning/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
              <Target className="h-8 w-8 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Acompanhar Achados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Monitorar progresso de resolução
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Acompanhar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-success/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-success/20 transition-colors">
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Relatórios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerar relatórios de auditoria
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Gerar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditorDashboard;
export { AuditorDashboard };