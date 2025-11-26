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
  Target, 
  Calendar, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  BarChart3,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLog } from '@/utils/securityLogger';
import { usePhaseCompleteness } from '@/contexts/ProjectCompletenessContext';

interface PlanningData {
  objetivos: string[];
  escopo: string;
  recursos_humanos: Resource[];
  cronograma: TimelineItem[];
  orcamento: number;
  riscos_identificados: Risk[];
  metodologia: string;
  criterios_auditoria: string[];
}

interface Resource {
  id: string;
  nome: string;
  funcao: string;
  horas_alocadas: number;
  custo_hora: number;
}

interface TimelineItem {
  id: string;
  atividade: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
}

interface Risk {
  id: string;
  descricao: string;
  probabilidade: 'baixa' | 'media' | 'alta';
  impacto: 'baixo' | 'medio' | 'alto';
  mitigacao: string;
}

interface PlanningPhaseProps {
  project: any;
}

export function PlanningPhaseFixed({ project }: PlanningPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  // Hook para completude da fase de planejamento
  const {
    interfaceCompleteness,
    databaseCompleteness,
    filledElements,
    totalElements,
    updateInterface,
    saveToDatabase
  } = usePhaseCompleteness('planejamento');

  const [planningData, setPlanningData] = useState<PlanningData>({
    objetivos: [],
    escopo: '',
    recursos_humanos: [],
    cronograma: [],
    orcamento: 0,
    riscos_identificados: [],
    metodologia: '',
    criterios_auditoria: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newObjective, setNewObjective] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newResource, setNewResource] = useState({ nome: '', funcao: '', horas_alocadas: 0, custo_hora: 0 });
  const [newTimelineItem, setNewTimelineItem] = useState({ atividade: '', data_inicio: '', data_fim: '', responsavel: '' });

  // Função para calcular orçamento total
  const calculateTotalBudget = useCallback(() => {
    const resourcesCost = planningData.recursos_humanos.reduce((sum, r) => 
      sum + (r.horas_alocadas * r.custo_hora), 0
    );
    return resourcesCost + planningData.orcamento;
  }, [planningData.recursos_humanos, planningData.orcamento]);

  // Função para calcular completude baseada no preenchimento real dos elementos
  const calculateInterfaceCompleteness = useCallback(() => {
    let filledCount = 0;
    const totalCount = 6; // Total de elementos principais

    // 1. Objetivos (pelo menos 1 objetivo)
    if (planningData.objetivos.length > 0) filledCount++;
    
    // 2. Escopo (pelo menos 50 caracteres)
    if (planningData.escopo.trim().length >= 50) filledCount++;
    
    // 3. Metodologia (pelo menos 50 caracteres)
    if (planningData.metodologia.trim().length >= 50) filledCount++;
    
    // 4. Critérios de auditoria (pelo menos 1 critério)
    if (planningData.criterios_auditoria.length > 0) filledCount++;
    
    // 5. Recursos humanos (pelo menos 1 recurso além do líder)
    if (planningData.recursos_humanos.length > 0) filledCount++;
    
    // 6. Cronograma (pelo menos 1 atividade)
    if (planningData.cronograma.length > 0) filledCount++;

    console.log('PlanningPhaseFixed - Interface completeness calculation:', {
      project_id: project.id,
      filledCount,
      totalCount,
      percentage: Math.round((filledCount / totalCount) * 100),
      details: {
        objetivos: planningData.objetivos.length > 0,
        escopo: planningData.escopo.trim().length >= 50,
        metodologia: planningData.metodologia.trim().length >= 50,
        criterios: planningData.criterios_auditoria.length > 0,
        recursos: planningData.recursos_humanos.length > 0,
        cronograma: planningData.cronograma.length > 0
      }
    });

    return { filledCount, totalCount };
  }, [planningData, project.id]);

  // Auto-save a cada 30 segundos (apenas se houver dados)
  useEffect(() => {
    // Não configurar auto-save durante carregamento inicial
    if (loading) return;
    
    const hasData = planningData.objetivos.length > 0 || 
                   planningData.escopo.length > 0 || 
                   planningData.metodologia.length > 0 || 
                   planningData.criterios_auditoria.length > 0;
    
    if (!hasData) return;
    
    const interval = setInterval(() => {
      if (!saving && !autoSaving) {
        autoSavePlanningData();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [
    planningData.objetivos.length,
    planningData.escopo.length,
    planningData.metodologia.length,
    planningData.criterios_auditoria.length,
    saving,
    autoSaving,
    loading
  ]);
  
  // Atualizar completude da interface quando dados mudam
  useEffect(() => {
    // Evitar atualização durante carregamento inicial
    if (loading) return;
    
    const { filledCount, totalCount } = calculateInterfaceCompleteness();
    
    // Atualizar completude da interface no contexto
    updateInterface(filledCount, totalCount);
    
    console.log('PlanningPhaseFixed - Interface completeness updated:', {
      project_id: project.id,
      filledCount,
      totalCount,
      percentage: Math.round((filledCount / totalCount) * 100)
    });
  }, [
    planningData.objetivos.length,
    planningData.escopo.length,
    planningData.metodologia.length,
    planningData.criterios_auditoria.length,
    planningData.recursos_humanos.length,
    planningData.cronograma.length,
    loading,
    updateInterface,
    calculateInterfaceCompleteness
  ]);

  useEffect(() => {
    loadPlanningData();
  }, [project.id]);

  const loadPlanningData = async () => {
    try {
      setLoading(true);
      
      console.log('PlanningPhaseFixed - Loading data for project:', project.id);
      
      // Carregar dados de planejamento do projeto
      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          id,
          objetivos,
          escopo,
          metodologia,
          criterios_auditoria,
          orcamento_estimado,
          completude_planejamento,
          data_inicio,
          data_fim_planejada,
          auditor_lider,
          chefe_auditoria
        `)
        .eq('id', project.id)
        .single();

      console.log('PlanningPhaseFixed - Database response:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (data) {
        const newPlanningData = {
          objetivos: Array.isArray(data.objetivos) ? data.objetivos : [],
          escopo: data.escopo || '',
          recursos_humanos: [], // Inicializar vazio por enquanto
          cronograma: [], // Inicializar vazio por enquanto
          orcamento: data.orcamento_estimado || 0,
          riscos_identificados: [], // Inicializar vazio por enquanto
          metodologia: data.metodologia || '',
          criterios_auditoria: Array.isArray(data.criterios_auditoria) ? data.criterios_auditoria : []
        };
        
        console.log('PlanningPhaseFixed - Setting planning data:', newPlanningData);
        setPlanningData(newPlanningData);
        
        // Forçar atualização da completude após carregar dados
        setTimeout(() => {
          const { filledCount, totalCount } = calculateInterfaceCompleteness();
          updateInterface(filledCount, totalCount);
          
          // Se houver dados salvos no banco, também atualizar
          if (data.completude_planejamento && data.completude_planejamento > 0) {
            saveToDatabase(project.id, effectiveTenantId || '', data.completude_planejamento);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de planejamento:', error);
      toast.error(`Erro ao carregar dados de planejamento: ${error.message || 'Erro desconhecido'}`);
      
      // Inicializar com dados vazios em caso de erro
      setPlanningData({
        objetivos: [],
        escopo: '',
        recursos_humanos: [],
        cronograma: [],
        orcamento: 0,
        riscos_identificados: [],
        metodologia: '',
        criterios_auditoria: []
      });
    } finally {
      setLoading(false);
    }
  };



  // Auto-save silencioso
  const autoSavePlanningData = async () => {
    try {
      setAutoSaving(true);
      
      const { error: projectError } = await supabase
        .from('projetos_auditoria')
        .update({
          objetivos: planningData.objetivos,
          escopo: planningData.escopo,
          orcamento_estimado: calculateTotalBudget(),
          metodologia: planningData.metodologia,
          criterios_auditoria: planningData.criterios_auditoria,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Se a completude da interface for 100%, salvar no banco também
      if (interfaceCompleteness === 100) {
        await saveToDatabase(project.id, effectiveTenantId || '', 100);
      }

      setLastSaved(new Date());
      secureLog('info', 'Auto-save do planejamento realizado', { 
        projectId: project.id, 
        interfaceCompleteness 
      });
    } catch (error) {
      secureLog('error', 'Erro no auto-save do planejamento', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Save manual com feedback
  const savePlanningData = async () => {
    try {
      setSaving(true);
      
      // Salvar dados do projeto
      const { error: projectError } = await supabase
        .from('projetos_auditoria')
        .update({
          objetivos: planningData.objetivos,
          escopo: planningData.escopo,
          orcamento_estimado: calculateTotalBudget(),
          metodologia: planningData.metodologia,
          criterios_auditoria: planningData.criterios_auditoria,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Sempre salvar a completude atual no banco
      await saveToDatabase(project.id, effectiveTenantId || '', interfaceCompleteness);

      setLastSaved(new Date());
      toast.success(`Dados salvos! Interface: ${interfaceCompleteness}% | Botão: ${databaseCompleteness}%`);
      
      secureLog('info', 'Planejamento salvo manualmente', { 
        projectId: project.id, 
        interfaceCompleteness,
        databaseCompleteness
      });
    } catch (error) {
      console.error('Erro ao salvar dados de planejamento:', error);
      toast.error('Erro ao salvar dados de planejamento');
    } finally {
      setSaving(false);
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setPlanningData(prev => ({
        ...prev,
        objetivos: [...prev.objetivos, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setPlanningData(prev => ({
      ...prev,
      objetivos: prev.objetivos.filter((_, i) => i !== index)
    }));
  };

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setPlanningData(prev => ({
        ...prev,
        criterios_auditoria: [...prev.criterios_auditoria, newCriteria.trim()]
      }));
      setNewCriteria('');
    }
  };

  const removeCriteria = (index: number) => {
    setPlanningData(prev => ({
      ...prev,
      criterios_auditoria: prev.criterios_auditoria.filter((_, i) => i !== index)
    }));
  };

  const addResource = () => {
    if (newResource.nome.trim() && newResource.funcao.trim()) {
      const resource: Resource = {
        id: Date.now().toString(),
        nome: newResource.nome.trim(),
        funcao: newResource.funcao.trim(),
        horas_alocadas: newResource.horas_alocadas,
        custo_hora: newResource.custo_hora
      };
      
      setPlanningData(prev => ({
        ...prev,
        recursos_humanos: [...prev.recursos_humanos, resource]
      }));
      
      setNewResource({ nome: '', funcao: '', horas_alocadas: 0, custo_hora: 0 });
      setShowResourceDialog(false);
    }
  };

  const removeResource = (id: string) => {
    setPlanningData(prev => ({
      ...prev,
      recursos_humanos: prev.recursos_humanos.filter(r => r.id !== id)
    }));
  };

  const addTimelineItem = () => {
    if (newTimelineItem.atividade.trim() && newTimelineItem.data_inicio && newTimelineItem.data_fim) {
      const timelineItem: TimelineItem = {
        id: Date.now().toString(),
        atividade: newTimelineItem.atividade.trim(),
        data_inicio: newTimelineItem.data_inicio,
        data_fim: newTimelineItem.data_fim,
        responsavel: newTimelineItem.responsavel.trim(),
        status: 'pendente'
      };
      
      setPlanningData(prev => ({
        ...prev,
        cronograma: [...prev.cronograma, timelineItem]
      }));
      
      setNewTimelineItem({ atividade: '', data_inicio: '', data_fim: '', responsavel: '' });
      setShowScheduleDialog(false);
    }
  };

  const removeTimelineItem = (id: string) => {
    setPlanningData(prev => ({
      ...prev,
      cronograma: prev.cronograma.filter(t => t.id !== id)
    }));
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Usar completude da interface para exibição nas abas
  const displayCompleteness = interfaceCompleteness;
  
  console.log('PlanningPhaseFixed - Completeness display:', {
    project_id: project.id,
    interfaceCompleteness, // Baseado no preenchimento da interface
    databaseCompleteness,   // Baseado nos dados salvos no banco
    displayCompleteness,    // O que será exibido na aba
    filledElements,
    totalElements,
    planningData: {
      objetivos: planningData.objetivos.length,
      escopo: planningData.escopo.length,
      metodologia: planningData.metodologia.length,
      criterios: planningData.criterios_auditoria.length,
      recursos: planningData.recursos_humanos.length,
      cronograma: planningData.cronograma.length
    }
  });

  return (
    <div className="space-y-6">
      {/* Header com Progresso MELHORADO */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Planejamento da Auditoria
                {autoSaving && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
              </CardTitle>
              <CardDescription>
                Defina objetivos, escopo, recursos e metodologia
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
                <p className="text-lg font-bold">{displayCompleteness}%</p>
                <Badge variant={displayCompleteness >= 80 ? 'default' : displayCompleteness >= 50 ? 'secondary' : 'outline'}>
                  {displayCompleteness >= 80 ? 'Excelente' : displayCompleteness >= 50 ? 'Bom' : 'Em progresso'}
                </Badge>
              </div>
              <Progress value={displayCompleteness} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Indicadores de Progresso por Seção */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso por Seção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {planningData.objetivos.length}
              </div>
              <div className="text-sm text-muted-foreground">Objetivos</div>
              <Progress value={Math.min(100, planningData.objetivos.length * 25)} className="h-2 mt-1" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {planningData.criterios_auditoria.length}
              </div>
              <div className="text-sm text-muted-foreground">Critérios</div>
              <Progress value={Math.min(100, planningData.criterios_auditoria.length * 20)} className="h-2 mt-1" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {planningData.recursos_humanos.length}
              </div>
              <div className="text-sm text-muted-foreground">Recursos</div>
              <Progress value={Math.min(100, planningData.recursos_humanos.length * 33)} className="h-2 mt-1" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {planningData.cronograma.length}
              </div>
              <div className="text-sm text-muted-foreground">Atividades</div>
              <Progress value={Math.min(100, planningData.cronograma.length * 20)} className="h-2 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objetivos da Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objetivos da Auditoria
              <Badge variant="outline">{planningData.objetivos.length}</Badge>
            </CardTitle>
            <CardDescription>
              Defina os objetivos específicos desta auditoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar novo objetivo..."
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addObjective()}
              />
              <Button onClick={addObjective} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {planningData.objetivos.map((objetivo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm flex-1">{objetivo}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {planningData.objetivos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum objetivo definido ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Escopo da Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Escopo da Auditoria
              <Badge variant="outline">
                {planningData.escopo.length} caracteres
              </Badge>
            </CardTitle>
            <CardDescription>
              Descreva o escopo e limitações da auditoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva o escopo da auditoria, incluindo processos, sistemas, períodos e limitações..."
              value={planningData.escopo}
              onChange={(e) => setPlanningData(prev => ({ ...prev, escopo: e.target.value }))}
              rows={6}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Recomendado: pelo menos 100 caracteres para uma descrição adequada
            </div>
          </CardContent>
        </Card>

        {/* Metodologia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Metodologia
              <Badge variant="outline">
                {planningData.metodologia.length} caracteres
              </Badge>
            </CardTitle>
            <CardDescription>
              Descreva a metodologia e abordagem da auditoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva a metodologia, técnicas de auditoria, amostragem e abordagem a ser utilizada..."
              value={planningData.metodologia}
              onChange={(e) => setPlanningData(prev => ({ ...prev, metodologia: e.target.value }))}
              rows={4}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Inclua: técnicas de auditoria, amostragem, ferramentas e abordagem
            </div>
          </CardContent>
        </Card>

        {/* Critérios de Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Critérios de Auditoria
              <Badge variant="outline">{planningData.criterios_auditoria.length}</Badge>
            </CardTitle>
            <CardDescription>
              Defina os critérios e padrões de avaliação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar novo critério..."
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCriteria()}
              />
              <Button onClick={addCriteria} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {planningData.criterios_auditoria.map((criterio, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm flex-1">{criterio}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriteria(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {planningData.criterios_auditoria.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum critério definido ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recursos e Orçamento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recursos Humanos
              <Badge variant="outline">{planningData.recursos_humanos.length + 1}</Badge>
            </CardTitle>
            <CardDescription>
              {planningData.recursos_humanos.length} recursos alocados + líder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                <div>
                  <p className="font-medium">{project.auditor_lider}</p>
                  <p className="text-sm text-muted-foreground">Auditor Líder</p>
                </div>
                <Badge variant="default">Líder</Badge>
              </div>
              
              {planningData.recursos_humanos.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{resource.nome}</p>
                    <p className="text-sm text-muted-foreground">{resource.funcao}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.horas_alocadas}h × R$ {resource.custo_hora.toFixed(2)}/h = R$ {(resource.horas_alocadas * resource.custo_hora).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowResourceDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Recurso
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Orçamento
            </CardTitle>
            <CardDescription>
              Total: R$ {calculateTotalBudget().toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Custos Adicionais (R$)</Label>
                <Input
                  type="number"
                  value={planningData.orcamento}
                  onChange={(e) => setPlanningData(prev => ({ 
                    ...prev, 
                    orcamento: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recursos Humanos:</span>
                  <span>R$ {planningData.recursos_humanos.reduce((sum, r) => sum + (r.horas_alocadas * r.custo_hora), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custos Adicionais:</span>
                  <span>R$ {planningData.orcamento.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {calculateTotalBudget().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Recursos: {planningData.recursos_humanos.length + 1}</p>
                <p>Horas totais: {planningData.recursos_humanos.reduce((sum, r) => sum + r.horas_alocadas, 0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
              <Badge variant="outline">{planningData.cronograma.length}</Badge>
            </CardTitle>
            <CardDescription>
              {planningData.cronograma.length} atividades planejadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm p-3 bg-muted rounded-lg">
                <p><strong>Início:</strong> {new Date(project.data_inicio).toLocaleDateString('pt-BR')}</p>
                <p><strong>Fim Previsto:</strong> {new Date(project.data_fim_prevista).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {planningData.cronograma.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.atividade}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.data_inicio).toLocaleDateString('pt-BR')} - {new Date(item.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                      {item.responsavel && (
                        <p className="text-xs text-muted-foreground">Responsável: {item.responsavel}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'concluido' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimelineItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações MELHORADAS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${displayCompleteness >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {displayCompleteness >= 80 ? 'Planejamento completo - Pronto para próxima fase' : 
                 displayCompleteness >= 50 ? `${displayCompleteness}% completo - Bom progresso` :
                 `${displayCompleteness}% completo - Continue preenchendo`}
              </span>
              {autoSaving && (
                <Badge variant="outline" className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Auto-salvando...
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadPlanningData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Recarregar
              </Button>
              <Button onClick={savePlanningData} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Salvando...' : 'Salvar Agora'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Adicionar Recurso */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Recurso Humano</DialogTitle>
            <DialogDescription>
              Adicione um novo membro à equipe de auditoria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={newResource.nome}
                onChange={(e) => setNewResource(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do auditor"
              />
            </div>
            <div>
              <Label htmlFor="funcao">Função</Label>
              <Input
                id="funcao"
                value={newResource.funcao}
                onChange={(e) => setNewResource(prev => ({ ...prev, funcao: e.target.value }))}
                placeholder="Ex: Auditor Sênior, Especialista em TI"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horas">Horas Alocadas</Label>
                <Input
                  id="horas"
                  type="number"
                  value={newResource.horas_alocadas}
                  onChange={(e) => setNewResource(prev => ({ ...prev, horas_alocadas: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="custo">Custo/Hora (R$)</Label>
                <Input
                  id="custo"
                  type="number"
                  value={newResource.custo_hora}
                  onChange={(e) => setNewResource(prev => ({ ...prev, custo_hora: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResourceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addResource}>
              Adicionar Recurso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Adicionar Atividade do Cronograma */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Atividade</DialogTitle>
            <DialogDescription>
              Adicione uma nova atividade ao cronograma da auditoria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="atividade">Atividade</Label>
              <Input
                id="atividade"
                value={newTimelineItem.atividade}
                onChange={(e) => setNewTimelineItem(prev => ({ ...prev, atividade: e.target.value }))}
                placeholder="Ex: Reunião de abertura, Testes de controles"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={newTimelineItem.data_inicio}
                  onChange={(e) => setNewTimelineItem(prev => ({ ...prev, data_inicio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={newTimelineItem.data_fim}
                  onChange={(e) => setNewTimelineItem(prev => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="responsavel">Responsável (Opcional)</Label>
              <Input
                id="responsavel"
                value={newTimelineItem.responsavel}
                onChange={(e) => setNewTimelineItem(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addTimelineItem}>
              Adicionar Atividade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}