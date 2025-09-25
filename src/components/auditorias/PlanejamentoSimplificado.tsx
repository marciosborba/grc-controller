import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  BarChart3,
  FileText,
  Building,
  Shield,
  Search,
  Eye,
  Activity,
  Calendar,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface PlanoAuditoria {
  id: string;
  tenant_id: string;
  codigo: string;
  titulo: string;
  ano_exercicio: number;
  descricao?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  total_horas_planejadas: number;
  total_recursos_orcados: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface TrabalhoAuditoria {
  id: string;
  tenant_id: string;
  plano_anual_id?: string;
  codigo: string;
  titulo: string;
  descricao: string;
  objetivos: string[];
  escopo: string;
  tipo_auditoria: string;
  area_auditada: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_planejadas: number;
  orcamento_estimado?: number;
  status: string;
  percentual_conclusao: number;
  prioridade: number;
  auditor_lider: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  planejado: 'bg-yellow-100 text-yellow-800',
  iniciado: 'bg-orange-100 text-orange-800',
  em_andamento: 'bg-green-100 text-green-800'
};

const riskColors: Record<string, string> = {
  baixo: 'bg-blue-100 text-blue-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-orange-100 text-orange-800',
  critico: 'bg-red-100 text-red-800'
};

export function PlanejamentoSimplificado() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [planos, setPlanos] = useState<PlanoAuditoria[]>([]);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('planos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Carregar dados
  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar planos e trabalhos em paralelo
      const [planosResult, trabalhosResult] = await Promise.all([
        supabase
          .from('planos_auditoria_anuais')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('ano_exercicio', { ascending: false }),
        
        supabase
          .from('trabalhos_auditoria')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('prioridade', { ascending: true })
      ]);

      if (planosResult.error) {
        console.error('Erro ao carregar planos:', planosResult.error);
        toast.error('Erro ao carregar planos de auditoria');
      } else {
        setPlanos(planosResult.data || []);
      }

      if (trabalhosResult.error) {
        console.error('Erro ao carregar trabalhos:', trabalhosResult.error);
        toast.error('Erro ao carregar trabalhos de auditoria');
      } else {
        setTrabalhos(trabalhosResult.data || []);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas calculadas
  const planosStats = useMemo(() => {
    return {
      total: planos.length,
      approved: planos.filter(p => p.status === 'approved').length,
      in_progress: planos.filter(p => p.status === 'in_progress').length,
      completed: planos.filter(p => p.status === 'completed').length,
      total_horas: planos.reduce((sum, p) => sum + (p.total_horas_planejadas || 0), 0),
      total_recursos: planos.reduce((sum, p) => sum + (p.total_recursos_orcados || 0), 0)
    };
  }, [planos]);

  const trabalhosStats = useMemo(() => {
    return {
      total: trabalhos.length,
      planejados: trabalhos.filter(t => t.status === 'planejado').length,
      em_andamento: trabalhos.filter(t => t.status === 'em_andamento' || t.status === 'iniciado').length,
      concluidos: trabalhos.filter(t => t.status === 'concluido').length,
      alto_risco: trabalhos.filter(t => t.nivel_risco === 'alto' || t.nivel_risco === 'critico').length,
      progress_medio: trabalhos.length > 0 ? 
        Math.round(trabalhos.reduce((sum, t) => sum + t.percentual_conclusao, 0) / trabalhos.length) : 0
    };
  }, [trabalhos]);

  // Filtros
  const filteredPlanos = useMemo(() => {
    return planos.filter(plano => {
      const matchesSearch = !searchTerm || 
        plano.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plano.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || plano.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [planos, searchTerm, filterStatus]);

  const filteredTrabalhos = useMemo(() => {
    return trabalhos.filter(trabalho => {
      const matchesSearch = !searchTerm || 
        trabalho.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trabalho.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trabalho.area_auditada.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || trabalho.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trabalhos, searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Planejamento de Auditoria</h2>
        <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
          <Plus className="h-4 w-4 mr-2" />
          {selectedTab === 'planos' ? 'Novo Plano' : 'Novo Trabalho'}
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planos">Planos Anuais</TabsTrigger>
          <TabsTrigger value="trabalhos">Trabalhos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{planosStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                    <p className="text-2xl font-bold text-blue-600">{planosStats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                    <p className="text-2xl font-bold text-green-600">{planosStats.in_progress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-purple-600">{planosStats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Horas</p>
                    <p className="text-2xl font-bold text-orange-600">{planosStats.total_horas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Recursos</p>
                    <p className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                        .format(planosStats.total_recursos)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar planos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Planos */}
          <div className="space-y-4">
            {filteredPlanos.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum plano encontrado</h3>
                  <p className="text-muted-foreground">Crie seu primeiro plano ou ajuste os filtros.</p>
                </CardContent>
              </Card>
            ) : (
              filteredPlanos.map((plano) => (
                <Card key={plano.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{plano.titulo}</h3>
                          <Badge variant="outline">{plano.codigo}</Badge>
                          <Badge className={statusColors[plano.status] || 'bg-gray-100 text-gray-800'}>
                            {plano.status}
                          </Badge>
                          <Badge variant="secondary">{plano.ano_exercicio}</Badge>
                        </div>
                        
                        {plano.descricao && (
                          <p className="text-muted-foreground mb-4">{plano.descricao}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Horas:</span>
                            <span className="ml-2">{plano.total_horas_planejadas}</span>
                          </div>
                          <div>
                            <span className="font-medium">Recursos:</span>
                            <span className="ml-2">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                                .format(plano.total_recursos_orcados)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Criado:</span>
                            <span className="ml-2">
                              {new Date(plano.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {plano.data_aprovacao && (
                            <div>
                              <span className="font-medium">Aprovado:</span>
                              <span className="ml-2">
                                {new Date(plano.data_aprovacao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trabalhos" className="space-y-6">
          {/* Stats Cards para Trabalhos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{trabalhosStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Planejados</p>
                    <p className="text-2xl font-bold text-yellow-600">{trabalhosStats.planejados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold text-green-600">{trabalhosStats.em_andamento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                    <p className="text-2xl font-bold text-red-600">{trabalhosStats.alto_risco}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
                    <p className="text-2xl font-bold text-purple-600">{trabalhosStats.progress_medio}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Trabalhos */}
          <div className="space-y-4">
            {filteredTrabalhos.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum trabalho encontrado</h3>
                  <p className="text-muted-foreground">Crie seu primeiro trabalho ou ajuste os filtros.</p>
                </CardContent>
              </Card>
            ) : (
              filteredTrabalhos.map((trabalho) => (
                <Card key={trabalho.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{trabalho.titulo}</h3>
                          <Badge variant="outline">{trabalho.codigo}</Badge>
                          <Badge className={statusColors[trabalho.status] || 'bg-gray-100 text-gray-800'}>
                            {trabalho.status}
                          </Badge>
                          <Badge className={riskColors[trabalho.nivel_risco]}>
                            {trabalho.nivel_risco}
                          </Badge>
                          <Badge variant="secondary">P{trabalho.prioridade}</Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-2">Área: {trabalho.area_auditada}</p>
                        <p className="text-muted-foreground mb-4">{trabalho.descricao}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tipo:</span>
                            <span className="ml-2">{trabalho.tipo_auditoria}</span>
                          </div>
                          <div>
                            <span className="font-medium">Horas:</span>
                            <span className="ml-2">{trabalho.horas_planejadas}</span>
                          </div>
                          <div>
                            <span className="font-medium">Progresso:</span>
                            <span className="ml-2">{trabalho.percentual_conclusao}%</span>
                          </div>
                          <div>
                            <span className="font-medium">Período:</span>
                            <span className="ml-2">
                              {new Date(trabalho.data_inicio_planejada).toLocaleDateString('pt-BR')} - {new Date(trabalho.data_fim_planejada).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {trabalho.objetivos && trabalho.objetivos.length > 0 && (
                          <div className="mt-4">
                            <span className="font-medium text-sm">Objetivos:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {trabalho.objetivos.slice(0, 3).map((objetivo, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {objetivo}
                                </Badge>
                              ))}
                              {trabalho.objetivos.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{trabalho.objetivos.length - 3} mais
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status - Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusColors).map(([status, colorClass]) => {
                    const count = filteredPlanos.filter(item => item.status === status).length;
                    const total = filteredPlanos.length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Risco - Trabalhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(riskColors).map(([risk, colorClass]) => {
                    const count = filteredTrabalhos.filter(item => item.nivel_risco === risk).length;
                    const percentage = filteredTrabalhos.length > 0 ? (count / filteredTrabalhos.length) * 100 : 0;
                    
                    return (
                      <div key={risk} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{risk}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral do Planejamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{planos.length}</div>
                  <div className="text-sm text-muted-foreground">Planos Anuais</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{trabalhos.length}</div>
                  <div className="text-sm text-muted-foreground">Trabalhos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{planosStats.total_horas}</div>
                  <div className="text-sm text-muted-foreground">Horas Planejadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{trabalhosStats.progress_medio}%</div>
                  <div className="text-sm text-muted-foreground">Progresso Médio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}