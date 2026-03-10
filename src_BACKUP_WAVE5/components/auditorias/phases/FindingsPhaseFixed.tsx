import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Save, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FindingsPhaseProps {
  project: any;
}

export function FindingsPhaseFixed({ project }: FindingsPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [findingsData, setFindingsData] = useState({
    apontamentos: [],
    analise_concluida: false,
    classificacao_realizada: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (findingsData && !saving) {
        autoSaveFindingsData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [findingsData, saving]);

  useEffect(() => {
    loadFindingsData();
  }, [project.id]);

  const loadFindingsData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          apontamentos_auditoria(*)
        `)
        .eq('id', project.id)
        .single();

      if (error) throw error;

      if (data) {
        setFindingsData({
          apontamentos: data.apontamentos_auditoria || [],
          analise_concluida: data.metadados?.analise_concluida || false,
          classificacao_realizada: data.metadados?.classificacao_realizada || false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de achados:', error);
      toast.error('Erro ao carregar dados de achados');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = useCallback(() => {
    let score = 0;
    
    // Apontamentos identificados (40 pontos)
    if (findingsData.apontamentos.length > 0) {
      score += 40;
    }
    
    // Análise concluída (30 pontos)
    if (findingsData.analise_concluida) {
      score += 30;
    }
    
    // Classificação realizada (30 pontos)
    if (findingsData.classificacao_realizada) {
      score += 30;
    }

    return Math.min(100, score);
  }, [findingsData]);

  const autoSaveFindingsData = async () => {
    try {
      setAutoSaving(true);
      
      const completeness = calculateCompleteness();
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          completude_achados: completeness,
          metadados: {
            ...project.metadados,
            analise_concluida: findingsData.analise_concluida,
            classificacao_realizada: findingsData.classificacao_realizada
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro no auto-save dos achados:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const saveFindingsData = async () => {
    try {
      setSaving(true);
      
      const completeness = calculateCompleteness();
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          completude_achados: completeness,
          metadados: {
            ...project.metadados,
            analise_concluida: findingsData.analise_concluida,
            classificacao_realizada: findingsData.classificacao_realizada
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setLastSaved(new Date());
      toast.success(`Dados de achados salvos! Completude: ${completeness}%`);
    } catch (error) {
      console.error('Erro ao salvar dados de achados:', error);
      toast.error('Erro ao salvar dados de achados');
    } finally {
      setSaving(false);
    }
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
                <AlertTriangle className="h-5 w-5" />
                Achados e Apontamentos
                {autoSaving && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
              </CardTitle>
              <CardDescription>
                Análise e classificação de apontamentos
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

      {/* Resumo dos Achados */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Achados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'critica').length}
              </div>
              <div className="text-sm text-muted-foreground">Críticos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'alta').length}
              </div>
              <div className="text-sm text-muted-foreground">Altos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'media').length}
              </div>
              <div className="text-sm text-muted-foreground">Médios</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'baixa').length}
              </div>
              <div className="text-sm text-muted-foreground">Baixos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="analise-concluida"
              checked={findingsData.analise_concluida}
              onChange={(e) => setFindingsData(prev => ({
                ...prev,
                analise_concluida: e.target.checked
              }))}
              className="rounded"
            />
            <label htmlFor="analise-concluida" className="text-sm font-medium">
              Análise de achados concluída
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="classificacao-realizada"
              checked={findingsData.classificacao_realizada}
              onChange={(e) => setFindingsData(prev => ({
                ...prev,
                classificacao_realizada: e.target.checked
              }))}
              className="rounded"
            />
            <label htmlFor="classificacao-realizada" className="text-sm font-medium">
              Classificação de riscos realizada
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Apontamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Apontamentos Identificados
            <Badge variant="outline">{findingsData.apontamentos.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {findingsData.apontamentos.length > 0 ? (
            <div className="space-y-3">
              {findingsData.apontamentos.map((apontamento, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{apontamento.titulo || `Apontamento ${index + 1}`}</h4>
                    <Badge variant={
                      apontamento.criticidade === 'critica' ? 'destructive' :
                      apontamento.criticidade === 'alta' ? 'default' :
                      apontamento.criticidade === 'media' ? 'secondary' : 'outline'
                    }>
                      {apontamento.criticidade?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {apontamento.descricao || 'Descrição não disponível'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum apontamento identificado</h3>
              <p className="text-muted-foreground">
                Os apontamentos serão carregados automaticamente dos trabalhos de auditoria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${completeness >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {completeness >= 80 ? 'Análise completa - Pronto para próxima fase' : 
                 completeness >= 50 ? `${completeness}% completo - Bom progresso` :
                 `${completeness}% completo - Continue analisando`}
              </span>
              {autoSaving && (
                <Badge variant="outline" className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Auto-salvando...
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadFindingsData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Recarregar
              </Button>
              <Button onClick={saveFindingsData} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Salvando...' : 'Salvar Agora'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}