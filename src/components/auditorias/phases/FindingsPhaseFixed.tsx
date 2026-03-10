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
        <CardHeader className="pb-3 px-4 sm:pb-6 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg tracking-tight">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                Achados e Apontamentos
                {autoSaving && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Análise e classificação de apontamentos
                {lastSaved && (
                  <span className="block text-[10px] sm:text-xs text-green-600 mt-1">
                    Último salvamento: {lastSaved.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-col sm:items-end w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mb-1 sm:mb-0">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Completude</p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm sm:text-lg font-bold leading-none">{completeness}%</p>
                    <Badge className="text-[9px] px-1.5 py-0 h-4 rounded" variant={completeness >= 80 ? 'default' : completeness >= 50 ? 'secondary' : 'outline'}>
                      {completeness >= 80 ? 'Excelente' : completeness >= 50 ? 'Bom' : 'Em progresso'}
                    </Badge>
                  </div>
                  <Progress value={completeness} className="w-20 sm:w-24 h-2 sm:h-3 ml-auto sm:ml-2" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo dos Achados */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm sm:text-base tracking-tight">Resumo dos Achados</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'critica').length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Críticos</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'alta').length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Altos</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'media').length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Médios</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {findingsData.apontamentos.filter(a => a.criticidade === 'baixa').length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Baixos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Status */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm sm:text-base tracking-tight">Status da Análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
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
            <label htmlFor="analise-concluida" className="text-xs sm:text-sm font-medium">
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
            <label htmlFor="classificacao-realizada" className="text-xs sm:text-sm font-medium">
              Classificação de riscos realizada
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Apontamentos */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base tracking-tight">
            Apontamentos Identificados
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{findingsData.apontamentos.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {findingsData.apontamentos.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {findingsData.apontamentos.map((apontamento, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-medium text-xs sm:text-sm">{apontamento.titulo || `Apontamento ${index + 1}`}</h4>
                    <Badge className="text-[10px] px-1.5 py-0 h-5" variant={
                      apontamento.criticidade === 'critica' ? 'destructive' :
                        apontamento.criticidade === 'alta' ? 'default' :
                          apontamento.criticidade === 'media' ? 'secondary' : 'outline'
                    }>
                      {apontamento.criticidade?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {apontamento.descricao || 'Descrição não disponível'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
              <h3 className="mt-3 text-sm sm:text-base font-medium">Nenhum apontamento identificado</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto">
                Os apontamentos serão carregados automaticamente dos trabalhos de auditoria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <CheckCircle className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${completeness >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-[10px] sm:text-xs text-muted-foreground flex-1 sm:flex-none leading-tight">
                {completeness >= 80 ? 'Completo' :
                  completeness >= 50 ? `${completeness}% completo - Bom progresso` :
                    `${completeness}% completo - Continue analisando`}
              </span>
              {autoSaving && (
                <Badge variant="outline" className="hidden sm:inline-flex ml-2 text-[9px] px-1 py-0 h-4">
                  <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" />
                  Auto-salvando
                </Badge>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" onClick={loadFindingsData} className="text-[10px] sm:text-xs h-8">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Recarregar
              </Button>
              <Button size="sm" onClick={saveFindingsData} disabled={saving} className="text-[10px] sm:text-xs h-8">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}