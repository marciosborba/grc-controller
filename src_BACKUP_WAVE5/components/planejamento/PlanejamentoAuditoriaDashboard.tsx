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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interfaces baseadas no banco de dados
interface PlanoAnual {
  id: string;
  codigo: string;
  titulo: string;
  ano_exercicio: number;
  status: string;
  total_horas_planejadas: number;
  total_recursos_orcados: number;
  created_at: string;
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
  auditor_lider: string;
}

export function PlanejamentoAuditoriaDashboard() {
  const { user } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [planosAnuais, setPlanosAnuais] = useState<PlanoAnual[]>([]);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Carregar dados
  useEffect(() => {
    if (user?.tenant?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar planos anuais
      const { data: planosData, error: planosError } = await supabase
        .from('planos_auditoria_anuais')
        .select('*')
        .order('ano_exercicio', { ascending: false });

      if (planosError) throw planosError;

      // Carregar trabalhos
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select('*')
        .order('data_inicio_planejada', { ascending: true });

      if (trabalhosError) throw trabalhosError;

      setPlanosAnuais(planosData || []);
      setTrabalhos(trabalhosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de métricas
  const calculateMetrics = () => {
    const totalTrabalhos = trabalhos.length;
    const trabalhosAtivos = trabalhos.filter(t => ['planejado', 'aprovado', 'em_andamento'].includes(t.status)).length;
    const trabalhosConcluidos = trabalhos.filter(t => t.status === 'concluido').length;
    const trabalhosAltoRisco = trabalhos.filter(t => ['alto', 'critico'].includes(t.nivel_risco)).length;
    
    const totalHoras = trabalhos.reduce((sum, t) => sum + (t.horas_planejadas || 0), 0);
    const progressoMedio = trabalhos.length > 0 
      ? trabalhos.reduce((sum, t) => sum + (t.percentual_conclusao || 0), 0) / trabalhos.length 
      : 0;

    const proximosTrabalhos = trabalhos
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
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.progressoMedio)}%</div>
            <Progress value={metrics.progressoMedio} className="mt-2" />
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
                  {planosAnuais.slice(0, 3).map((plano) => (
                    <div key={plano.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{plano.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {plano.ano_exercicio} • {plano.total_horas_planejadas?.toLocaleString()} horas
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(plano.status)}>
                        {plano.status === 'approved' ? 'Aprovado' : plano.status}
                      </Badge>
                    </div>
                  ))}
                  {planosAnuais.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum plano anual encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trabalhos por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>
                  Status atual dos trabalhos de auditoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['planejado', 'em_andamento', 'concluido'].map((status) => {
                    const count = trabalhos.filter(t => t.status === status).length;
                    const percentage = trabalhos.length > 0 ? (count / trabalhos.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(status)} variant="secondary">
                            {status === 'planejado' ? 'Planejado' : 
                             status === 'em_andamento' ? 'Em Andamento' : 
                             'Concluído'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} trabalhos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
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
              <CardTitle>Trabalhos de Auditoria</CardTitle>
              <CardDescription>
                Lista de todos os trabalhos planejados e em execução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trabalhos.map((trabalho) => (
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
                          <span>{trabalho.horas_planejadas}h</span>
                          <span>•</span>
                          <span>{new Date(trabalho.data_inicio_planejada).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRiscoColor(trabalho.nivel_risco)} variant="secondary">
                        {trabalho.nivel_risco}
                      </Badge>
                      <Badge className={getStatusColor(trabalho.status)}>
                        {trabalho.status === 'planejado' ? 'Planejado' :
                         trabalho.status === 'em_andamento' ? 'Em Andamento' :
                         trabalho.status}
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
                {trabalhos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum trabalho de auditoria encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cronograma */}
        <TabsContent value="cronograma" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Trabalhos</CardTitle>
              <CardDescription>
                Cronograma dos próximos trabalhos de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trabalhos
                  .filter(t => t.status !== 'concluido')
                  .sort((a, b) => new Date(a.data_inicio_planejada).getTime() - new Date(b.data_inicio_planejada).getTime())
                  .map((trabalho) => {
                    const inicio = new Date(trabalho.data_inicio_planejada);
                    const fim = new Date(trabalho.data_fim_planejada);
                    const duracao = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={trabalho.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex flex-col items-center text-center">
                          <div className="text-sm font-medium">{inicio.getDate()}</div>
                          <div className="text-xs text-muted-foreground">
                            {inicio.toLocaleDateString('pt-BR', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{trabalho.titulo}</h4>
                            <Badge className={getStatusColor(trabalho.status)} variant="secondary">
                              {trabalho.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trabalho.area_auditada} • {duracao} dias • {trabalho.horas_planejadas}h
                          </p>
                          {trabalho.percentual_conclusao > 0 && (
                            <div className="mt-2">
                              <Progress value={trabalho.percentual_conclusao} className="h-2" />
                            </div>
                          )}
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