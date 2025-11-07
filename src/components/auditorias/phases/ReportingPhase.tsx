import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Send,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Printer,
  Mail,
  Share2,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Report {
  id: string;
  tipo: 'executivo' | 'tecnico' | 'compliance' | 'seguimento';
  titulo: string;
  status: 'rascunho' | 'revisao' | 'aprovado' | 'publicado' | 'distribuido';
  versao: string;
  data_criacao: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  resumo_executivo: string;
  total_apontamentos: number;
  apontamentos_criticos: number;
  compliance_score: number;
  destinatarios: string[];
}

interface ReportTemplate {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
  estrutura: any;
}

interface ReportingPhaseProps {
  project: any;
}

export function ReportingPhase({ project }: ReportingPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReportingData();
  }, [project.id]);

  const loadReportingData = async () => {
    try {
      setLoading(true);
      
      // Carregar relatórios do projeto
      const { data: reportsData, error: reportsError } = await supabase
        .from('relatorios_auditoria')
        .select('*')
        .eq('projeto_id', project.id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Carregar templates disponíveis
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates_relatorios')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('ativo', true)
        .order('nome');

      if (templatesError) throw templatesError;

      setReports(reportsData || []);
      setTemplates(templatesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados de relatórios:', error);
      toast.error('Erro ao carregar dados de relatórios');
    } finally {
      setLoading(false);
    }
  };

  const generateProjectReport = async (tipo: string) => {
    try {
      setGeneratingReport(true);
      toast.loading('Gerando relatório...', { id: 'report-generation' });
      
      // Carregar dados específicos do projeto
      const { data: projetoDetalhado, error: projetoError } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          trabalhos_auditoria(*),
          apontamentos_auditoria(*),
          planos_acao(*)
        `)
        .eq('id', project.id)
        .eq('tenant_id', effectiveTenantId)
        .single();
      
      if (projetoError) throw projetoError;
      
      // Gerar relatório HTML
      const reportContent = generateReportHTML(project, projetoDetalhado, tipo);
      
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.document.title = `Relatório ${tipo} - ${project.codigo}`;
        
        setTimeout(() => {
          const printButton = newWindow.document.createElement('button');
          printButton.innerHTML = '🖨️ Imprimir/Salvar como PDF';
          printButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: system-ui;
          `;
          printButton.onclick = () => newWindow.print();
          newWindow.document.body.appendChild(printButton);
        }, 1000);
      }
      
      toast.success('Relatório gerado com sucesso!', {
        id: 'report-generation',
        description: `Use Ctrl+P para salvar como PDF`
      });
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório', { id: 'report-generation' });
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateReportHTML = (projeto: any, projetoDetalhado: any, tipo: string) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const totalApontamentos = projetoDetalhado?.apontamentos_auditoria?.length || 0;
    const apontamentosCriticos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'critica').length || 0;
    const totalTrabalhos = projetoDetalhado?.trabalhos_auditoria?.length || 0;
    const planosAcao = projetoDetalhado?.planos_acao?.length || 0;
    
    const tipoTitulos = {
      executivo: 'Relatório Executivo',
      tecnico: 'Relatório Técnico',
      compliance: 'Relatório de Compliance',
      seguimento: 'Relatório de Seguimento'
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${tipoTitulos[tipo]} - ${projeto.titulo}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px; }
          .title { font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }
          .subtitle { font-size: 16px; color: #64748b; margin-bottom: 5px; }
          .section { margin: 40px 0; }
          .section-title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 20px; border-bottom: 3px solid #e2e8f0; padding-bottom: 12px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .metric-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 6px solid #3b82f6; }
          .metric-value { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
          .metric-label { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .critical { color: #dc2626; border-left-color: #dc2626; }
          .high { color: #ea580c; border-left-color: #ea580c; }
          .success { color: #059669; border-left-color: #059669; }
          .warning { color: #d97706; border-left-color: #d97706; }
          table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          th, td { padding: 16px; text-align: left; border-bottom: 2px solid #e2e8f0; }
          th { background: #f8fafc; font-weight: 700; color: #374151; }
          .executive-summary { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 6px solid #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">📊 ${tipoTitulos[tipo]}</h1>
            <p class="subtitle"><strong>${projeto.titulo}</strong></p>
            <p class="subtitle">Código: ${projeto.codigo} | Status: ${projeto.status?.toUpperCase()}</p>
            <p class="subtitle">Gerado em: ${timestamp}</p>
            <p class="subtitle">Confidencial - Uso Interno</p>
          </div>
          
          <div class="executive-summary">
            <h2 style="margin-top: 0; color: #0ea5e9;">📋 Resumo Executivo</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              O projeto de auditoria "${projeto.titulo}" foi executado conforme planejado, 
              resultando em ${totalApontamentos} apontamentos identificados, sendo ${apontamentosCriticos} de criticidade alta.
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              Foram executados ${totalTrabalhos} trabalhos de auditoria e elaborados ${planosAcao} planos de ação 
              para endereçar as deficiências identificadas.
            </p>
          </div>
          
          <div class="section">
            <h2 class="section-title">📈 Indicadores Principais</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${totalApontamentos}</div>
                <div class="metric-label">Total de Apontamentos</div>
              </div>
              <div class="metric-card critical">
                <div class="metric-value">${apontamentosCriticos}</div>
                <div class="metric-label">Apontamentos Críticos</div>
              </div>
              <div class="metric-card success">
                <div class="metric-value">${totalTrabalhos}</div>
                <div class="metric-label">Trabalhos Executados</div>
              </div>
              <div class="metric-card warning">
                <div class="metric-value">${planosAcao}</div>
                <div class="metric-label">Planos de Ação</div>
              </div>
            </div>
          </div>
          
          ${totalApontamentos > 0 ? `
          <div class="section">
            <h2 class="section-title">🚨 Principais Apontamentos</h2>
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Criticidade</th>
                  <th>Categoria</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${projetoDetalhado?.apontamentos_auditoria?.slice(0, 10).map(apontamento => `
                  <tr>
                    <td><strong>${apontamento.titulo || 'Sem título'}</strong></td>
                    <td>
                      <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${
                        apontamento.criticidade === 'critica' ? '#fef2f2; color: #dc2626' :
                        apontamento.criticidade === 'alta' ? '#fff7ed; color: #ea580c' :
                        '#f0fdf4; color: #059669'
                      };">
                        ${(apontamento.criticidade || 'baixa').toUpperCase()}
                      </span>
                    </td>
                    <td>${apontamento.categoria || 'Não categorizado'}</td>
                    <td>${apontamento.status || 'Pendente'}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align: center; color: #64748b;">Nenhum apontamento disponível</td></tr>'}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="section">
            <h2 class="section-title">🎯 Conclusões e Recomendações</h2>
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; border-left: 6px solid #059669;">
              <h3 style="color: #059669; margin-top: 0;">📄 Conclusão</h3>
              <p style="font-size: 16px; line-height: 1.6;">
                Com base nos trabalhos executados, concluímos que ${totalApontamentos > 0 ? 
                  `foram identificadas ${totalApontamentos} oportunidades de melhoria` : 
                  'os controles avaliados estão adequados'}.
                ${apontamentosCriticos > 0 ? ` ${apontamentosCriticos} apontamentos requerem ação imediata.` : ''}
              </p>
            </div>
          </div>
          
          <div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid #e2e8f0; text-align: center; color: #64748b;">
            <p><strong>Relatório gerado automaticamente pelo Sistema GRC</strong></p>
            <p>Auditor Líder: ${projeto.auditor_lider} | Data: ${timestamp}</p>
            <p>Documento confidencial - Distribuição restrita</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      rascunho: 'bg-gray-100 text-gray-800',
      revisao: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-blue-100 text-blue-800',
      publicado: 'bg-green-100 text-green-800',
      distribuido: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateCompleteness = () => {
    if (reports.length === 0) return 0;
    const approved = reports.filter(r => ['aprovado', 'publicado', 'distribuido'].includes(r.status)).length;
    return Math.round((approved / reports.length) * 100);
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
                Relatórios de Auditoria
              </CardTitle>
              <CardDescription>
                Elaboração, revisão e aprovação de relatórios
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

      {/* Geração Rápida de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Geração Rápida de Relatórios</CardTitle>
          <CardDescription>
            Gere relatórios profissionais baseados nos dados do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Relatório Executivo</h4>
                    <p className="text-xs text-muted-foreground mt-1">Visão estratégica para alta administração</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => generateProjectReport('executivo')}
                      disabled={generatingReport}
                    >
                      {generatingReport ? 'Gerando...' : 'Gerar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Relatório Técnico</h4>
                    <p className="text-xs text-muted-foreground mt-1">Análise detalhada de processos</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => generateProjectReport('tecnico')}
                      disabled={generatingReport}
                    >
                      {generatingReport ? 'Gerando...' : 'Gerar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Relatório de Compliance</h4>
                    <p className="text-xs text-muted-foreground mt-1">Conformidade regulatória</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => generateProjectReport('compliance')}
                      disabled={generatingReport}
                    >
                      {generatingReport ? 'Gerando...' : 'Gerar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Relatório de Seguimento</h4>
                    <p className="text-xs text-muted-foreground mt-1">Acompanhamento de ações</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => generateProjectReport('seguimento')}
                      disabled={generatingReport}
                    >
                      {generatingReport ? 'Gerando...' : 'Gerar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Existentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatórios do Projeto</CardTitle>
              <CardDescription>
                Relatórios criados para este projeto de auditoria
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum relatório criado</h3>
              <p className="text-muted-foreground">Use a geração rápida acima para criar seu primeiro relatório.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{report.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            Versão {report.versao} • {new Date(report.data_criacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        {report.status === 'aprovado' && (
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-1" />
                            Distribuir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                {completeness >= 80 ? 'Relatórios aprovados' : `${completeness}% aprovado - Aprove pelo menos 80% para avançar`}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Todos
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Enviar por Email
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}