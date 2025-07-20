import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Plus,
  Eye,
  Shield
} from 'lucide-react';

const mockPolicies = [
  {
    id: 1,
    title: 'Política de Segurança da Informação',
    version: '2.1',
    status: 'Published',
    readRate: 89,
    dueReview: '2024-12-31',
    owner: 'CISO'
  },
  {
    id: 2,
    title: 'Política de Privacidade e LGPD',
    version: '1.3',
    status: 'Review',
    readRate: 95,
    dueReview: '2024-08-15',
    owner: 'DPO'
  },
  {
    id: 3,
    title: 'Código de Ética Corporativa',
    version: '3.0',
    status: 'Draft',
    readRate: 0,
    dueReview: '2024-09-30',
    owner: 'Compliance'
  }
];

const mockIncidents = [
  {
    id: 1,
    category: 'Ética',
    description: 'Possível conflito de interesses',
    severity: 'Medium',
    status: 'Investigating',
    reportedAt: '2024-07-20',
    assignee: 'Maria Costa'
  },
  {
    id: 2,
    category: 'LGPD',
    description: 'Vazamento menor de dados',
    severity: 'High',
    status: 'Resolved',
    reportedAt: '2024-07-18',
    assignee: 'João Silva'
  }
];

export const ComplianceDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance & Ética</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de políticas, normas e canal de ética
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Canal de Ética
          </Button>
          <Button className="grc-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nova Política
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Políticas Ativas</p>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-success">
                  100% publicadas
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Leitura</p>
                <p className="text-2xl font-bold text-foreground">94%</p>
                <p className="text-sm text-success">
                  +5% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incidentes Ativos</p>
                <p className="text-2xl font-bold text-warning">3</p>
                <p className="text-sm text-muted-foreground">
                  1 em investigação
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Treinamentos</p>
                <p className="text-2xl font-bold text-foreground">87%</p>
                <p className="text-sm text-primary">
                  Conclusão atual
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies and Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policies */}
        <Card className="grc-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <span>Políticas</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPolicies.map((policy) => (
                <div 
                  key={policy.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{policy.title}</h4>
                      <p className="text-sm text-muted-foreground">v{policy.version} • {policy.owner}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={
                          policy.status === 'Published' ? 'bg-success/10 text-success border-success/30' :
                          policy.status === 'Review' ? 'bg-warning/10 text-warning border-warning/30' :
                          'bg-muted/10 text-muted-foreground border-muted/30'
                        }
                      >
                        {policy.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de Leitura:</span>
                      <span className="font-medium">{policy.readRate}%</span>
                    </div>
                    <Progress value={policy.readRate} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Revisão: {policy.dueReview}</span>
                      <span>{100 - policy.readRate}% pendente</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents */}
        <Card className="grc-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span>Incidentes Recentes</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                Canal de Ética
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockIncidents.map((incident) => (
                <div 
                  key={incident.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {incident.category}
                        </Badge>
                        <Badge 
                          className={
                            incident.severity === 'High' ? 'risk-high text-xs' :
                            incident.severity === 'Medium' ? 'risk-medium text-xs' :
                            'risk-low text-xs'
                          }
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{incident.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Reportado em {incident.reportedAt} • Atribuído a {incident.assignee}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={
                          incident.status === 'Resolved' ? 'bg-success/10 text-success border-success/30' :
                          incident.status === 'Investigating' ? 'bg-warning/10 text-warning border-warning/30' :
                          'bg-muted/10 text-muted-foreground border-muted/30'
                        }
                      >
                        {incident.status}
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
        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Gestão de Políticas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Criar, revisar e distribuir políticas corporativas
            </p>
            <Button className="grc-button-primary w-full">
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-warning/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Canal de Ética</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Portal seguro para denúncias e incidentes
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Acessar Portal
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-success/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-success/20 transition-colors">
              <Users className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Treinamentos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Acompanhar progresso de treinamentos de compliance
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Progresso
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};