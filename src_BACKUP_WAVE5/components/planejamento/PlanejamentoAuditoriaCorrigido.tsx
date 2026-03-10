import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarDays,
  ClipboardList,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Target,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';

// Interfaces baseadas no banco de dados
interface PlanoAnual {
  id: string;
  codigo: string;
  titulo: string;
  ano_exercicio: number;
  status: string;
  total_horas_planejadas: number;
  total_recursos_orcados: number;
}

interface TrabalhoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  tipo_auditoria: string;
  area_auditada: string;
  nivel_risco: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_planejadas: number;
  status: string;
  percentual_conclusao: number;
  prioridade: number;
}

export function PlanejamentoAuditoriaCorrigido() {
  const { user } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Dados mock baseados no banco real
  const planosAnuaisMock: PlanoAnual[] = [
    {
      id: '1',
      codigo: 'PAA-2025',
      titulo: 'Plano Anual de Auditoria 2025',
      ano_exercicio: 2025,
      status: 'approved',
      total_horas_planejadas: 2400.0,
      total_recursos_orcados: 350000.00
    }
  ];

  const trabalhosMock: TrabalhoAuditoria[] = [
    {
      id: '1',
      codigo: 'TAD-2025-001',
      titulo: 'Auditoria do Processo de Contas a Pagar',
      tipo_auditoria: 'operational',
      area_auditada: 'Financeiro - Contas a Pagar',
      nivel_risco: 'alto',
      data_inicio_planejada: '2025-02-03',
      data_fim_planejada: '2025-03-14',
      horas_planejadas: 240.0,
      status: 'planejado',
      percentual_conclusao: 0,
      prioridade: 4
    },
    {
      id: '2',
      codigo: 'TAD-2025-002',
      titulo: 'Auditoria de Segurança da Informação',
      tipo_auditoria: 'it',
      area_auditada: 'Tecnologia da Informação',
      nivel_risco: 'critico',
      data_inicio_planejada: '2025-04-07',
      data_fim_planejada: '2025-05-16',
      horas_planejadas: 320.0,
      status: 'planejado',
      percentual_conclusao: 0,
      prioridade: 5
    },
    {
      id: '3',
      codigo: 'TAD-2025-003',
      titulo: 'Follow-up de Recomendações 2024',
      tipo_auditoria: 'follow_up',
      area_auditada: 'Todas as áreas auditadas em 2024',
      nivel_risco: 'medio',
      data_inicio_planejada: '2025-06-02',
      data_fim_planejada: '2025-06-27',
      horas_planejadas: 120.0,
      status: 'planejado',
      percentual_conclusao: 0,
      prioridade: 3
    }
  ];

  // Simular carregamento
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Cálculos de métricas
  const calculateMetrics = () => {
    const totalTrabalhos = trabalhosMock.length;
    const trabalhosAtivos = trabalhosMock.filter(t => ['planejado', 'aprovado', 'em_andamento'].includes(t.status)).length;
    const trabalhosConcluidos = trabalhosMock.filter(t => t.status === 'concluido').length;
    const trabalhosAltoRisco = trabalhosMock.filter(t => ['alto', 'critico'].includes(t.nivel_risco)).length;
    
    const totalHoras = trabalhosMock.reduce((sum, t) => sum + (t.horas_planejadas || 0), 0);
    const progressoMedio = trabalhosMock.length > 0 
      ? trabalhosMock.reduce((sum, t) => sum + (t.percentual_conclusao || 0), 0) / trabalhosMock.length 
      : 0;

    const proximosTrabalhos = trabalhosMock
      .filter(t => t.status === 'planejado' && new Date(t.data_inicio_planejada) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      .length;

    return {
      totalTrabalhos,
      trabalhosAtivos,
      trabalhosConcluidos,
      trabalhosAltoRisco,
      totalHoras,
      progressoMedio,
      proximosTrabalhos
    };
  };

  const metrics = calculateMetrics();

  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'bg-orange-100 text-orange-800',
      'aprovado': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-green-100 text-green-800',
      'concluido': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiscoColor = (risco: string) => {
    const colors = {
      'baixo': 'bg-green-100 text-green-800',
      'medio': 'bg-yellow-100 text-yellow-800',
      'alto': 'bg-orange-100 text-orange-800',
      'critico': 'bg-red-100 text-red-800'
    };
    return colors[risco as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTipoAuditoriaLabel = (tipo: string) => {
    const tipos = {
      'operational': 'Operacional',
      'it': 'TI',
      'financial': 'Financeira',
      'compliance': 'Compliance',
      'follow_up': 'Follow-up'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Planejamento de Auditoria</h1>
          <p className="text-muted-foreground">
            Gestão de planos anuais, trabalhos e cronogramas de auditoria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Trabalho
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Trabalhos</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrabalhos}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.trabalhosAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 30 dias</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.proximosTrabalhos}</div>
            <p className="text-xs text-muted-foreground">
              trabalhos programados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trabalhosAltoRisco}</div>
            <p className="text-xs text-muted-foreground">
              trabalhos críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalHoras}</div>
            <p className="text-xs text-muted-foreground">
              horas planejadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trabalhos">Trabalhos</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
        </TabsList>

        {/* Tab Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planos Anuais */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Anuais de Auditoria</CardTitle>
                <CardDescription>
                  Planos aprovados e em execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planosAnuaisMock.map((plano) => (
                    <div key={plano.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{plano.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {plano.ano_exercicio} • {plano.total_horas_planejadas?.toLocaleString()} horas • R$ {plano.total_recursos_orcados?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(plano.status)}>
                        Aprovado
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trabalhos por Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Nível de Risco</CardTitle>
                <CardDescription>
                  Classificação de risco dos trabalhos planejados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['critico', 'alto', 'medio', 'baixo'].map((risco) => {
                    const count = trabalhosMock.filter(t => t.nivel_risco === risco).length;
                    const percentage = trabalhosMock.length > 0 ? (count / trabalhosMock.length) * 100 : 0;
                    
                    return (
                      <div key={risco} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getRiscoColor(risco)} variant="secondary">
                            {risco.charAt(0).toUpperCase() + risco.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} trabalhos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                risco === 'critico' ? 'bg-red-600' :
                                risco === 'alto' ? 'bg-orange-600' :
                                risco === 'medio' ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Trabalhos */}
        <TabsContent value="trabalhos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trabalhos de Auditoria Planejados</CardTitle>
              <CardDescription>
                Lista completa dos trabalhos para 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trabalhosMock.map((trabalho) => (
                  <div key={trabalho.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        trabalho.nivel_risco === 'critico' ? 'bg-red-500' :
                        trabalho.nivel_risco === 'alto' ? 'bg-orange-500' :
                        trabalho.nivel_risco === 'medio' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{trabalho.titulo}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{trabalho.area_auditada}</span>
                          <span>•</span>
                          <span>{getTipoAuditoriaLabel(trabalho.tipo_auditoria)}</span>
                          <span>•</span>
                          <span>{trabalho.horas_planejadas}h</span>
                          <span>•</span>
                          <span>{new Date(trabalho.data_inicio_planejada).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRiscoColor(trabalho.nivel_risco)} variant="secondary">
                        {trabalho.nivel_risco}
                      </Badge>
                      <Badge className={getStatusColor(trabalho.status)}>
                        Planejado
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cronograma */}
        <TabsContent value="cronograma" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Execução 2025</CardTitle>
              <CardDescription>
                Timeline dos trabalhos de auditoria planejados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trabalhosMock
                  .sort((a, b) => new Date(a.data_inicio_planejada).getTime() - new Date(b.data_inicio_planejada).getTime())
                  .map((trabalho) => {
                    const inicio = new Date(trabalho.data_inicio_planejada);
                    const fim = new Date(trabalho.data_fim_planejada);
                    const duracao = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={trabalho.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex flex-col items-center text-center min-w-[60px]">
                          <div className="text-lg font-medium">{inicio.getDate()}</div>
                          <div className="text-xs text-muted-foreground">
                            {inicio.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inicio.getFullYear()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{trabalho.titulo}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getRiscoColor(trabalho.nivel_risco)} variant="secondary">
                                {trabalho.nivel_risco}
                              </Badge>
                              <Badge className={getStatusColor(trabalho.status)}>
                                Planejado
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trabalho.area_auditada} • {getTipoAuditoriaLabel(trabalho.tipo_auditoria)} • {duracao} dias • {trabalho.horas_planejadas}h
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {inicio.toLocaleDateString('pt-BR')} até {fim.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}