import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLog } from '@/utils/securityLogger';

interface WorkPaper {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: 'teste_controle' | 'teste_substantivo' | 'analitico' | 'inspecao' | 'observacao';
  status: 'planejado' | 'em_execucao' | 'concluido' | 'revisado';
  auditor_responsavel: string;
  data_inicio: string;
  data_conclusao?: string;
  horas_planejadas: number;
  horas_realizadas: number;
  conclusao: string;
  evidencias: string[];
  resultado: 'eficaz' | 'parcialmente_eficaz' | 'ineficaz' | 'nao_aplicavel';
}

interface ExecutionData {
  trabalhos_auditoria: WorkPaper[];
  reuniao_abertura: {
    realizada: boolean;
    data: string;
    participantes: string[];
    observacoes: string;
  };
  cronograma_execucao: {
    data_inicio_real: string;
    data_fim_prevista: string;
    marcos: Array<{
      id: string;
      descricao: string;
      data_prevista: string;
      data_real?: string;
      status: 'pendente' | 'concluido' | 'atrasado';
    }>;
  };
  comunicacoes: Array<{
    id: string;
    tipo: 'email' | 'reuniao' | 'documento';
    destinatario: string;
    assunto: string;
    data: string;
    status: 'enviado' | 'respondido' | 'pendente';
  }>;
}

interface ExecutionPhaseProps {
  project: any;
}

export function ExecutionPhaseFixed({ project }: ExecutionPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [executionData, setExecutionData] = useState<ExecutionData>({
    trabalhos_auditoria: [],
    reuniao_abertura: {
      realizada: false,
      data: '',
      participantes: [],
      observacoes: ''
    },
    cronograma_execucao: {
      data_inicio_real: '',
      data_fim_prevista: '',
      marcos: []
    },
    comunicacoes: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showWorkPaperDialog, setShowWorkPaperDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [newWorkPaper, setNewWorkPaper] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    tipo: 'teste_controle' as const,
    auditor_responsavel: '',
    horas_planejadas: 0
  });
  const [newMilestone, setNewMilestone] = useState({
    descricao: '',
    data_prevista: ''
  });

  // Auto-save a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (executionData && !saving) {
        autoSaveExecutionData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [executionData, saving]);

  useEffect(() => {
    loadExecutionData();
  }, [project.id]);

  const loadExecutionData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados de execução do projeto
      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          trabalhos_auditoria(*),
          comunicacoes_auditoria(*)
        `)
        .eq('id', project.id)
        .single();

      if (error) throw error;

      if (data) {
        setExecutionData({
          trabalhos_auditoria: data.trabalhos_auditoria || [],
          reuniao_abertura: data.metadados?.reuniao_abertura || {
            realizada: false,
            data: '',
            participantes: [],
            observacoes: ''
          },
          cronograma_execucao: data.metadados?.cronograma_execucao || {
            data_inicio_real: data.data_inicio || '',
            data_fim_prevista: data.data_fim_planejada || '',
            marcos: []
          },
          comunicacoes: data.comunicacoes_auditoria || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de execução:', error);
      toast.error('Erro ao carregar dados de execução');
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular completude da execução
  const calculateCompleteness = useCallback(() => {
    let score = 0;
    const maxScore = 100;

    // Reunião de abertura (20 pontos)
    if (executionData.reuniao_abertura.realizada) {
      score += 20;
    }

    // Trabalhos de auditoria (50 pontos)
    const trabalhos = executionData.trabalhos_auditoria;
    if (trabalhos.length > 0) {
      const trabalhosCompletos = trabalhos.filter(t => t.status === 'concluido' || t.status === 'revisado').length;
      score += Math.round((trabalhosCompletos / trabalhos.length) * 50);
    }

    // Marcos do cronograma (20 pontos)
    const marcos = executionData.cronograma_execucao.marcos;
    if (marcos.length > 0) {
      const marcosCompletos = marcos.filter(m => m.status === 'concluido').length;
      score += Math.round((marcosCompletos / marcos.length) * 20);
    }

    // Comunicações (10 pontos)
    const comunicacoes = executionData.comunicacoes;
    if (comunicacoes.length > 0) {
      score += 10;
    }

    return Math.min(maxScore, score);
  }, [executionData]);

  // Auto-save silencioso
  const autoSaveExecutionData = async () => {
    try {
      setAutoSaving(true);
      
      const completeness = calculateCompleteness();
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          completude_execucao: completeness,
          metadados: {
            ...project.metadados,
            reuniao_abertura: executionData.reuniao_abertura,
            cronograma_execucao: executionData.cronograma_execucao
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setLastSaved(new Date());
      secureLog('info', 'Auto-save da execução realizado', { 
        projectId: project.id, 
        completeness 
      });
    } catch (error) {
      secureLog('error', 'Erro no auto-save da execução', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Save manual com feedback
  const saveExecutionData = async () => {
    try {
      setSaving(true);
      
      const completeness = calculateCompleteness();
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          completude_execucao: completeness,
          metadados: {
            ...project.metadados,
            reuniao_abertura: executionData.reuniao_abertura,
            cronograma_execucao: executionData.cronograma_execucao
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setLastSaved(new Date());
      toast.success(`Dados de execução salvos! Completude: ${completeness}%`);
      
      secureLog('info', 'Execução salva manualmente', { 
        projectId: project.id, 
        completeness 
      });
    } catch (error) {
      console.error('Erro ao salvar dados de execução:', error);
      toast.error('Erro ao salvar dados de execução');
    } finally {
      setSaving(false);
    }
  };

  const addWorkPaper = () => {
    if (newWorkPaper.titulo.trim() && newWorkPaper.codigo.trim()) {
      const workPaper: WorkPaper = {
        id: Date.now().toString(),
        codigo: newWorkPaper.codigo.trim(),
        titulo: newWorkPaper.titulo.trim(),
        descricao: newWorkPaper.descricao.trim(),
        tipo: newWorkPaper.tipo,
        status: 'planejado',
        auditor_responsavel: newWorkPaper.auditor_responsavel.trim(),
        data_inicio: new Date().toISOString().split('T')[0],
        horas_planejadas: newWorkPaper.horas_planejadas,
        horas_realizadas: 0,
        conclusao: '',
        evidencias: [],
        resultado: 'nao_aplicavel'
      };
      
      setExecutionData(prev => ({
        ...prev,
        trabalhos_auditoria: [...prev.trabalhos_auditoria, workPaper]
      }));
      
      setNewWorkPaper({
        codigo: '',
        titulo: '',
        descricao: '',
        tipo: 'teste_controle',
        auditor_responsavel: '',
        horas_planejadas: 0
      });
      setShowWorkPaperDialog(false);
    }
  };

  const updateWorkPaperStatus = (id: string, status: WorkPaper['status']) => {
    setExecutionData(prev => ({
      ...prev,
      trabalhos_auditoria: prev.trabalhos_auditoria.map(wp =>
        wp.id === id ? { ...wp, status } : wp
      )
    }));
  };

  const addMilestone = () => {
    if (newMilestone.descricao.trim() && newMilestone.data_prevista) {
      const milestone = {
        id: Date.now().toString(),
        descricao: newMilestone.descricao.trim(),
        data_prevista: newMilestone.data_prevista,
        status: 'pendente' as const
      };
      
      setExecutionData(prev => ({
        ...prev,
        cronograma_execucao: {
          ...prev.cronograma_execucao,
          marcos: [...prev.cronograma_execucao.marcos, milestone]
        }
      }));
      
      setNewMilestone({ descricao: '', data_prevista: '' });
      setShowMilestoneDialog(false);
    }
  };

  const updateMilestoneStatus = (id: string, status: 'pendente' | 'concluido' | 'atrasado') => {
    setExecutionData(prev => ({
      ...prev,
      cronograma_execucao: {
        ...prev.cronograma_execucao,
        marcos: prev.cronograma_execucao.marcos.map(m =>
          m.id === id ? { 
            ...m, 
            status,
            data_real: status === 'concluido' ? new Date().toISOString().split('T')[0] : m.data_real
          } : m
        )
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Execução da Auditoria
                {autoSaving && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
              </CardTitle>
              <CardDescription>
                Trabalhos de campo e coleta de evidências
                {lastSaved && (
                  <span className="block text-xs text-green-600 mt-1">
                    Último salvamento: {lastSaved.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-lg font-bold">{completeness}%</p>
                <Badge variant={completeness >= 80 ? 'default' : completeness >= 50 ? 'secondary' : 'outline'}>
                  {completeness >= 80 ? 'Excelente' : completeness >= 50 ? 'Bom' : 'Em progresso'}
                </Badge>
              </div>
              <Progress value={completeness} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Indicadores de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso da Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {executionData.reuniao_abertura.realizada ? '✓' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">Reunião Abertura</div>
              <Progress value={executionData.reuniao_abertura.realizada ? 100 : 0} className="h-2 mt-1" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {executionData.trabalhos_auditoria.length}
              </div>
              <div className="text-sm text-muted-foreground">Trabalhos</div>
              <Progress 
                value={executionData.trabalhos_auditoria.length > 0 ? 
                  (executionData.trabalhos_auditoria.filter(t => t.status === 'concluido' || t.status === 'revisado').length / executionData.trabalhos_auditoria.length) * 100 : 0} 
                className="h-2 mt-1" 
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {executionData.cronograma_execucao.marcos.length}
              </div>
              <div className="text-sm text-muted-foreground">Marcos</div>
              <Progress 
                value={executionData.cronograma_execucao.marcos.length > 0 ? 
                  (executionData.cronograma_execucao.marcos.filter(m => m.status === 'concluido').length / executionData.cronograma_execucao.marcos.length) * 100 : 0} 
                className="h-2 mt-1" 
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {executionData.comunicacoes.length}
              </div>
              <div className="text-sm text-muted-foreground">Comunicações</div>
              <Progress value={executionData.comunicacoes.length > 0 ? 100 : 0} className="h-2 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reunião de Abertura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Reunião de Abertura
              <Badge variant={executionData.reuniao_abertura.realizada ? 'default' : 'outline'}>
                {executionData.reuniao_abertura.realizada ? 'Realizada' : 'Pendente'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Reunião inicial com a área auditada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reuniao-realizada"
                checked={executionData.reuniao_abertura.realizada}
                onChange={(e) => setExecutionData(prev => ({
                  ...prev,
                  reuniao_abertura: {
                    ...prev.reuniao_abertura,
                    realizada: e.target.checked
                  }
                }))}
                className="rounded"
              />
              <Label htmlFor="reuniao-realizada">Reunião realizada</Label>
            </div>
            
            {executionData.reuniao_abertura.realizada && (
              <>
                <div>
                  <Label>Data da Reunião</Label>
                  <Input
                    type="date"
                    value={executionData.reuniao_abertura.data}
                    onChange={(e) => setExecutionData(prev => ({
                      ...prev,
                      reuniao_abertura: {
                        ...prev.reuniao_abertura,
                        data: e.target.value
                      }
                    }))}
                  />
                </div>
                
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Principais pontos discutidos, acordos, etc."
                    value={executionData.reuniao_abertura.observacoes}
                    onChange={(e) => setExecutionData(prev => ({
                      ...prev,
                      reuniao_abertura: {
                        ...prev.reuniao_abertura,
                        observacoes: e.target.value
                      }
                    }))}
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cronograma de Execução */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cronograma de Execução
              <Badge variant="outline">{executionData.cronograma_execucao.marcos.length}</Badge>
            </CardTitle>
            <CardDescription>
              Marcos e prazos da execução
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início Real</Label>
                <Input
                  type="date"
                  value={executionData.cronograma_execucao.data_inicio_real}
                  onChange={(e) => setExecutionData(prev => ({
                    ...prev,
                    cronograma_execucao: {
                      ...prev.cronograma_execucao,
                      data_inicio_real: e.target.value
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Data Fim Prevista</Label>
                <Input
                  type="date"
                  value={executionData.cronograma_execucao.data_fim_prevista}
                  onChange={(e) => setExecutionData(prev => ({
                    ...prev,
                    cronograma_execucao: {
                      ...prev.cronograma_execucao,
                      data_fim_prevista: e.target.value
                    }
                  }))}
                />
              </div>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {executionData.cronograma_execucao.marcos.map((marco) => (
                <div key={marco.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{marco.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Previsto: {new Date(marco.data_prevista).toLocaleDateString('pt-BR')}
                      {marco.data_real && (
                        <span className="ml-2">
                          | Real: {new Date(marco.data_real).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={marco.status}
                      onChange={(e) => updateMilestoneStatus(marco.id, e.target.value as any)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="concluido">Concluído</option>
                      <option value="atrasado">Atrasado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowMilestoneDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marco
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trabalhos de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Trabalhos de Auditoria
            <Badge variant="outline">{executionData.trabalhos_auditoria.length}</Badge>
          </CardTitle>
          <CardDescription>
            Papéis de trabalho e procedimentos executados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => setShowWorkPaperDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Trabalho
            </Button>
            
            <div className="space-y-3">
              {executionData.trabalhos_auditoria.map((trabalho) => (
                <div key={trabalho.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{trabalho.codigo} - {trabalho.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{trabalho.tipo.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={trabalho.status}
                        onChange={(e) => updateWorkPaperStatus(trabalho.id, e.target.value as WorkPaper['status'])}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="planejado">Planejado</option>
                        <option value="em_execucao">Em Execução</option>
                        <option value="concluido">Concluído</option>
                        <option value="revisado">Revisado</option>
                      </select>
                      <Badge variant={
                        trabalho.status === 'revisado' ? 'default' :
                        trabalho.status === 'concluido' ? 'secondary' :
                        trabalho.status === 'em_execucao' ? 'outline' : 'destructive'
                      }>
                        {trabalho.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Responsável:</span>
                      <p>{trabalho.auditor_responsavel || 'Não definido'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horas:</span>
                      <p>{trabalho.horas_realizadas}h / {trabalho.horas_planejadas}h</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progresso:</span>
                      <Progress 
                        value={trabalho.horas_planejadas > 0 ? (trabalho.horas_realizadas / trabalho.horas_planejadas) * 100 : 0} 
                        className="h-2 mt-1" 
                      />
                    </div>
                  </div>
                  
                  {trabalho.descricao && (
                    <p className="text-sm text-muted-foreground mt-2">{trabalho.descricao}</p>
                  )}
                </div>
              ))}
              
              {executionData.trabalhos_auditoria.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum trabalho de auditoria criado ainda
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${completeness >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {completeness >= 80 ? 'Execução completa - Pronto para próxima fase' : 
                 completeness >= 50 ? `${completeness}% completo - Bom progresso` :
                 `${completeness}% completo - Continue executando`}
              </span>
              {autoSaving && (
                <Badge variant="outline" className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Auto-salvando...
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadExecutionData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Recarregar
              </Button>
              <Button onClick={saveExecutionData} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Salvando...' : 'Salvar Agora'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Novo Trabalho */}
      <Dialog open={showWorkPaperDialog} onOpenChange={setShowWorkPaperDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Trabalho de Auditoria</DialogTitle>
            <DialogDescription>
              Adicione um novo papel de trabalho
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={newWorkPaper.codigo}
                  onChange={(e) => setNewWorkPaper(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: PT-001"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  value={newWorkPaper.tipo}
                  onChange={(e) => setNewWorkPaper(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="teste_controle">Teste de Controle</option>
                  <option value="teste_substantivo">Teste Substantivo</option>
                  <option value="analitico">Procedimento Analítico</option>
                  <option value="inspecao">Inspeção</option>
                  <option value="observacao">Observação</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={newWorkPaper.titulo}
                onChange={(e) => setNewWorkPaper(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título do trabalho"
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={newWorkPaper.descricao}
                onChange={(e) => setNewWorkPaper(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do procedimento"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsavel">Auditor Responsável</Label>
                <Input
                  id="responsavel"
                  value={newWorkPaper.auditor_responsavel}
                  onChange={(e) => setNewWorkPaper(prev => ({ ...prev, auditor_responsavel: e.target.value }))}
                  placeholder="Nome do auditor"
                />
              </div>
              <div>
                <Label htmlFor="horas">Horas Planejadas</Label>
                <Input
                  id="horas"
                  type="number"
                  value={newWorkPaper.horas_planejadas}
                  onChange={(e) => setNewWorkPaper(prev => ({ ...prev, horas_planejadas: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkPaperDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addWorkPaper}>
              Criar Trabalho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Novo Marco */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Marco</DialogTitle>
            <DialogDescription>
              Adicione um marco ao cronograma de execução
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="marco-descricao">Descrição</Label>
              <Input
                id="marco-descricao"
                value={newMilestone.descricao}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Conclusão dos testes de controles"
              />
            </div>
            <div>
              <Label htmlFor="marco-data">Data Prevista</Label>
              <Input
                id="marco-data"
                type="date"
                value={newMilestone.data_prevista}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, data_prevista: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addMilestone}>
              Adicionar Marco
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}