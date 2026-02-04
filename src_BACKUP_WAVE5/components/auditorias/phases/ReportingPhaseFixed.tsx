import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, Save, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportingPhaseProps {
  project: any;
}

export function ReportingPhaseFixed({ project }: ReportingPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [reportingData, setReportingData] = useState({
    relatorio_rascunho: false,
    relatorio_revisado: false,
    relatorio_aprovado: false,
    relatorio_distribuido: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (reportingData && !saving) {
        autoSaveReportingData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [reportingData, saving]);

  useEffect(() => {
    loadReportingData();
  }, [project.id]);

  const loadReportingData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select('*')
        .eq('id', project.id)
        .single();

      if (error) throw error;

      if (data) {
        setReportingData({
          relatorio_rascunho: data.metadados?.relatorio_rascunho || false,
          relatorio_revisado: data.metadados?.relatorio_revisado || false,
          relatorio_aprovado: data.metadados?.relatorio_aprovado || false,
          relatorio_distribuido: data.metadados?.relatorio_distribuido || false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de relatório:', error);
      toast.error('Erro ao carregar dados de relatório');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = useCallback(() => {
    let score = 0;
    
    if (reportingData.relatorio_rascunho) score += 25;
    if (reportingData.relatorio_revisado) score += 25;
    if (reportingData.relatorio_aprovado) score += 25;
    if (reportingData.relatorio_distribuido) score += 25;

    return score;
  }, [reportingData]);

  const autoSaveReportingData = async () => {
    try {
      setAutoSaving(true);
      
      const completeness = calculateCompleteness();
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          completude_relatorio: completeness,
          metadados: {
            ...project.metadados,
            ...reportingData
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro no auto-save do relatório:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const saveReportingData = async () => {
    try {
      setSaving(true);
      
      const completeness = calculateCompleteness();
      
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          completude_relatorio: completeness,
          metadados: {
            ...project.metadados,
            ...reportingData
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setLastSaved(new Date());
      toast.success(`Dados de relatório salvos! Completude: ${completeness}%`);
    } catch (error) {
      console.error('Erro ao salvar dados de relatório:', error);
      toast.error('Erro ao salvar dados de relatório');
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
                <FileText className="h-5 w-5" />
                Relatório de Auditoria
                {autoSaving && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
              </CardTitle>
              <CardDescription>
                Elaboração e revisão de relatórios
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

      {/* Fluxo do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 border rounded-lg ${reportingData.relatorio_rascunho ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="rascunho"
                  checked={reportingData.relatorio_rascunho}
                  onChange={(e) => setReportingData(prev => ({
                    ...prev,
                    relatorio_rascunho: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="rascunho" className="text-sm font-medium">
                  Rascunho
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Primeira versão do relatório elaborada
              </p>
            </div>

            <div className={`p-4 border rounded-lg ${reportingData.relatorio_revisado ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="revisado"
                  checked={reportingData.relatorio_revisado}
                  onChange={(e) => setReportingData(prev => ({
                    ...prev,
                    relatorio_revisado: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="revisado" className="text-sm font-medium">
                  Revisado
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Relatório revisado pela supervisão
              </p>
            </div>

            <div className={`p-4 border rounded-lg ${reportingData.relatorio_aprovado ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="aprovado"
                  checked={reportingData.relatorio_aprovado}
                  onChange={(e) => setReportingData(prev => ({
                    ...prev,
                    relatorio_aprovado: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="aprovado" className="text-sm font-medium">
                  Aprovado
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Relatório aprovado pela gerência
              </p>
            </div>

            <div className={`p-4 border rounded-lg ${reportingData.relatorio_distribuido ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="distribuido"
                  checked={reportingData.relatorio_distribuido}
                  onChange={(e) => setReportingData(prev => ({
                    ...prev,
                    relatorio_distribuido: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="distribuido" className="text-sm font-medium">
                  Distribuído
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Relatório distribuído aos stakeholders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <FileText className="h-6 w-6 mb-2" />
              <span>Gerar Rascunho</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Download className="h-6 w-6 mb-2" />
              <span>Exportar PDF</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Finalizar Relatório</span>
            </Button>
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
                {completeness >= 80 ? 'Relatório completo - Pronto para próxima fase' : 
                 completeness >= 50 ? `${completeness}% completo - Bom progresso` :
                 `${completeness}% completo - Continue elaborando`}
              </span>
              {autoSaving && (
                <Badge variant="outline" className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Auto-salvando...
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadReportingData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Recarregar
              </Button>
              <Button onClick={saveReportingData} disabled={saving}>
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