import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function PlanningPhase({ project }: PlanningPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

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
  const [newObjective, setNewObjective] = useState('');
  const [newCriteria, setNewCriteria] = useState('');

  useEffect(() => {
    loadPlanningData();
  }, [project.id]);

  const loadPlanningData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados de planejamento do projeto
      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          recursos_auditoria(*),
          cronograma_auditoria(*),
          riscos_auditoria(*)
        `)
        .eq('id', project.id)
        .single();

      if (error) throw error;

      if (data) {
        setPlanningData({
          objetivos: data.objetivos || [],
          escopo: data.escopo || '',
          recursos_humanos: data.recursos_auditoria || [],
          cronograma: data.cronograma_auditoria || [],
          orcamento: data.orcamento_estimado || 0,
          riscos_identificados: data.riscos_auditoria || [],
          metodologia: data.metodologia || '',
          criterios_auditoria: data.criterios_auditoria || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de planejamento:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  const savePlanningData = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          objetivos: planningData.objetivos,
          escopo: planningData.escopo,
          orcamento_estimado: planningData.orcamento,
          metodologia: planningData.metodologia,
          criterios_auditoria: planningData.criterios_auditoria,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Dados de planejamento salvos com sucesso!');
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

  const calculateCompleteness = () => {
    let completed = 0;
    const total = 6; // Total de seções

    if (planningData.objetivos.length > 0) completed++;
    if (planningData.escopo.trim()) completed++;
    if (planningData.recursos_humanos.length > 0) completed++;
    if (planningData.cronograma.length > 0) completed++;
    if (planningData.metodologia.trim()) completed++;
    if (planningData.criterios_auditoria.length > 0) completed++;

    return Math.round((completed / total) * 100);
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
                <Target className="h-5 w-5" />
                Planejamento da Auditoria
              </CardTitle>
              <CardDescription>
                Defina objetivos, escopo, recursos e metodologia
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-lg font-bold">{completeness}%</p>
              </div>
              <Progress value={completeness} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objetivos da Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objetivos da Auditoria
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
            
            <div className="space-y-2">
              {planningData.objetivos.map((objetivo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{objetivo}</span>
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
          </CardContent>
        </Card>

        {/* Metodologia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Metodologia
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
          </CardContent>
        </Card>

        {/* Critérios de Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Critérios de Auditoria
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
            
            <div className="space-y-2">
              {planningData.criterios_auditoria.map((criterio, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{criterio}</span>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Auditor Líder</p>
                  <p className="text-sm text-muted-foreground">{project.auditor_lider}</p>
                </div>
                <Badge variant="secondary">Líder</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Orçamento Estimado (R$)</Label>
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
              
              <div className="text-sm text-muted-foreground">
                <p>Recursos alocados: {planningData.recursos_humanos.length}</p>
                <p>Horas estimadas: {planningData.recursos_humanos.reduce((sum, r) => sum + r.horas_alocadas, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p><strong>Início:</strong> {new Date(project.data_inicio).toLocaleDateString('pt-BR')}</p>
                <p><strong>Fim Previsto:</strong> {new Date(project.data_fim_prevista).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Cronograma
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${completeness >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {completeness >= 80 ? 'Planejamento completo' : `${completeness}% completo - Complete pelo menos 80% para avançar`}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadPlanningData}>
                Recarregar
              </Button>
              <Button onClick={savePlanningData} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Planejamento'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}