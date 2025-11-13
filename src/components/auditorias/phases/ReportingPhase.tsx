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
          printButton.className = 'print-button';
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
          
          printButton.onclick = () => {
            // Remover título para evitar aparecer na impressão
            const originalTitle = newWindow.document.title;
            newWindow.document.title = ' '; // Espaço em branco em vez de string vazia
            
            // Executar impressão imediatamente
            setTimeout(() => {
              newWindow.print();
              
              // Restaurar título após impressão
              setTimeout(() => {
                newWindow.document.title = originalTitle;
              }, 500);
            }, 100);
          };
          
          newWindow.document.body.appendChild(printButton);
          
          // Configurar meta tags para melhor controle de impressão
          const metaViewport = newWindow.document.createElement('meta');
          metaViewport.name = 'viewport';
          metaViewport.content = 'width=device-width, initial-scale=1.0';
          newWindow.document.head.appendChild(metaViewport);
          
          const metaPrint = newWindow.document.createElement('meta');
          metaPrint.name = 'print';
          metaPrint.content = 'no-header-footer';
          newWindow.document.head.appendChild(metaPrint);
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
    const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Análise detalhada dos dados
    const totalApontamentos = projetoDetalhado?.apontamentos_auditoria?.length || 0;
    const apontamentosCriticos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'critica').length || 0;
    const apontamentosAltos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'alta').length || 0;
    const apontamentosMedios = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'media').length || 0;
    const apontamentosBaixos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'baixa').length || 0;
    
    const totalTrabalhos = projetoDetalhado?.trabalhos_auditoria?.length || 0;
    const trabalhosConcluidos = projetoDetalhado?.trabalhos_auditoria?.filter(t => t.status === 'concluido').length || 0;
    const planosAcao = projetoDetalhado?.planos_acao?.length || 0;
    
    // Novos indicadores baseados em dados reais
    const planosConcluidos = projetoDetalhado?.planos_acao?.filter(p => p.status === 'concluido').length || 0;
    const totalHorasAuditoria = projetoDetalhado?.trabalhos_auditoria?.reduce((sum, t) => sum + (t.horas_trabalhadas || 0), 0) || 0;
    
    // Cálculo do score de compliance
    const complianceScore = totalApontamentos > 0 ? 
      Math.max(0, 100 - (apontamentosCriticos * 25 + apontamentosAltos * 15 + apontamentosMedios * 8 + apontamentosBaixos * 3)) : 95;
    
    // Análise de risco
    const nivelRisco = apontamentosCriticos > 0 ? 'ALTO' : 
                      apontamentosAltos > 2 ? 'MÉDIO-ALTO' : 
                      apontamentosAltos > 0 ? 'MÉDIO' : 'BAIXO';
    
    const corRisco = nivelRisco === 'ALTO' ? '#dc2626' : 
                     nivelRisco === 'MÉDIO-ALTO' ? '#ea580c' : 
                     nivelRisco === 'MÉDIO' ? '#d97706' : '#059669';
    
    const tipoTitulos = {
      executivo: 'RELATÓRIO EXECUTIVO DE AUDITORIA',
      tecnico: 'RELATÓRIO TÉCNICO DE AUDITORIA',
      compliance: 'RELATÓRIO DE COMPLIANCE',
      seguimento: 'RELATÓRIO DE SEGUIMENTO'
    };
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <title>${tipoTitulos[tipo]} - ${projeto.titulo}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            line-height: 1.4; 
            color: #1a1a1a; 
            background: #ffffff;
            font-size: 13px;
          }
          
          .page { 
            max-width: 210mm; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 297mm;
          }
          
          .header-page {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 45px 35px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header-page::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            z-index: 0;
          }
          
          .header-content { position: relative; z-index: 1; }
          

          
          .main-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          
          .project-title {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 25px;
            opacity: 0.95;
          }
          
          .header-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-top: 30px;
          }
          
          .info-item {
            background: rgba(255,255,255,0.15);
            padding: 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
          }
          
          .info-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            opacity: 0.8;
            margin-bottom: 6px;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: 600;
          }
          
          .content {
            padding: 35px 30px;
          }
          

          
          .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 18px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          

          
          .executive-summary {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 1px solid #cbd5e1;
            border-left: 4px solid #1e3a8a;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            position: relative;
          }
          
          .summary-highlight {
            background: #1e3a8a;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin: 18px 0;
            text-align: center;
            font-size: 14px;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin: 20px 0;
          }
          
          .metric-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 18px 15px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s;
          }
          
          .metric-card:hover { transform: translateY(-1px); }
          
          .metric-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 6px;
            line-height: 1;
          }
          
          .metric-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          
          .metric-description {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 6px;
          }
          
          .risk-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 12px;
            background: ${corRisco};
            color: white;
          }
          
          .findings-table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .findings-table th {
            background: #f8fafc;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .findings-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
            font-size: 12px;
          }
          
          .findings-table tr:hover {
            background: #f9fafb;
          }
          
          .severity-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .severity-critica { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
          .severity-alta { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
          .severity-media { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
          .severity-baixa { background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0; }
          
          .recommendations {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 1px solid #a7f3d0;
            border-left: 4px solid #059669;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
          }
          
          .recommendation-item {
            background: white;
            border: 1px solid #d1fae5;
            border-radius: 6px;
            padding: 15px;
            margin: 12px 0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          
          .recommendation-priority {
            background: #059669;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            flex-shrink: 0;
          }
          
          .footer {
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
            padding: 25px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
          }
          
          .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .footer-section h4 {
            color: #374151;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 11px;
          }
          
          .compliance-score {
            font-size: 32px;
            font-weight: 700;
            color: ${complianceScore >= 80 ? '#059669' : complianceScore >= 60 ? '#d97706' : '#dc2626'};
          }
          
          .page-break { page-break-before: always; }
          
          @media print {
            .page { box-shadow: none; margin: 0; }
            body { background: white; margin: 0 !important; padding: 0 !important; }
            .print-button { display: none !important; }
            
            /* Configurar margens adequadas para impressão */
            @page {
              margin: 0.75in 0.5in 0.5in 0.5in; /* top right bottom left */
              size: A4;
            }
            
            /* Ajustar conteúdo para margens da página */
            .page {
              padding: 0 !important;
              margin: 0 !important;
            }
            
            .header-page {
              padding: 30px 20px !important;
            }
            
            .content {
              padding: 20px !important;
            }
            
            .footer {
              padding: 20px !important;
            }
            
            /* Espaçamento das seções */
            .section {
              margin-bottom: 30px !important;
              page-break-inside: avoid;
            }
            
            .section-title {
              margin-top: 20px !important;
              margin-bottom: 15px !important;
            }
            
            .findings-table {
              margin: 20px 0 !important;
            }
            
            .metrics-grid {
              margin: 20px 0 !important;
              gap: 15px !important;
            }
            
            .executive-summary, .recommendations {
              margin: 20px 0 !important;
              padding: 20px !important;
            }
            
            /* Ocultar informações de impressão */
            html {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- PÁGINA DE CAPA -->
          <div class="header-page">
            <div class="header-content">
              <h1 class="main-title">${tipoTitulos[tipo]}</h1>
              <h2 class="project-title">${projeto.titulo}</h2>
              
              <div class="header-info">
                <div class="info-item">
                  <div class="info-label">Código do Projeto</div>
                  <div class="info-value">${projeto.codigo}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Período de Execução</div>
                  <div class="info-value">${new Date(projeto.data_inicio).toLocaleDateString('pt-BR')} - ${new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Auditor Líder</div>
                  <div class="info-value">${projeto.auditor_lider || projeto.chefe_auditoria}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Data do Relatório</div>
                  <div class="info-value">${dataFormatada}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Nível de Risco</div>
                  <div class="info-value">${nivelRisco}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Score de Compliance</div>
                  <div class="info-value">${complianceScore}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CONTEÚDO PRINCIPAL -->
          <div class="content">
            <!-- RESUMO EXECUTIVO -->
            <div class="section">
              <h2 class="section-title">
                RESUMO EXECUTIVO
              </h2>
              
              <div class="executive-summary">
                <p style="font-size: 13px; margin-bottom: 15px; font-weight: 500; line-height: 1.4;">
                  <strong>Objetivo:</strong> Este relatório apresenta os resultados da auditoria realizada em "${projeto.titulo}", 
                  executada no período de ${new Date(projeto.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}, 
                  com o objetivo de avaliar a eficácia dos controles internos e identificar oportunidades de melhoria.
                </p>
                
                <div class="summary-highlight">
                  <strong>CONCLUSÃO GERAL:</strong> ${totalApontamentos === 0 ? 
                    'Os controles avaliados demonstram adequação e efetividade, com ambiente de controle robusto.' :
                    `Foram identificadas ${totalApontamentos} oportunidades de melhoria, sendo ${apontamentosCriticos} de criticidade alta que requerem ação imediata da administração.`
                  }
                </div>
                
                <p style="font-size: 12px; margin-bottom: 12px; line-height: 1.4;">
                  <strong>Escopo da Auditoria:</strong> ${projeto.escopo || 'Avaliação abrangente dos processos e controles internos da área auditada, incluindo análise de conformidade regulatória e eficiência operacional.'}
                </p>
                
                <p style="font-size: 12px; margin-bottom: 12px; line-height: 1.4;">
                  <strong>Metodologia:</strong> ${projeto.metodologia || 'Aplicação de técnicas de auditoria baseadas em riscos, incluindo testes de controles, análises substantivas e entrevistas com gestores responsáveis.'}
                </p>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 18px;">
                  <span style="font-weight: 600; font-size: 12px;">Classificação de Risco:</span>
                  <span class="risk-indicator">🚨 ${nivelRisco}</span>
                </div>
              </div>
            </div>
            
            <!-- INDICADORES PRINCIPAIS -->
            <div class="section">
              <h2 class="section-title">
                INDICADORES PRINCIPAIS
              </h2>
              
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value" style="color: #1e3a8a;">${totalApontamentos}</div>
                  <div class="metric-label">Total de Apontamentos</div>
                  <div class="metric-description">Oportunidades de melhoria identificadas</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value" style="color: #dc2626;">${apontamentosCriticos}</div>
                  <div class="metric-label">Criticidade Alta</div>
                  <div class="metric-description">Requerem ação imediata</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value compliance-score">${complianceScore}%</div>
                  <div class="metric-label">Score de Compliance</div>
                  <div class="metric-description">Índice de conformidade geral</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value" style="color: #059669;">${trabalhosConcluidos}/${totalTrabalhos}</div>
                  <div class="metric-label">Trabalhos Executados</div>
                  <div class="metric-description">Procedimentos de auditoria realizados</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value" style="color: #ea580c;">${apontamentosAltos}</div>
                  <div class="metric-label">Criticidade Média-Alta</div>
                  <div class="metric-description">Atenção prioritária necessária</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value" style="color: #d97706;">${planosAcao}</div>
                  <div class="metric-label">Planos de Ação</div>
                  <div class="metric-description">Ações corretivas propostas</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value" style="color: #059669;">${planosConcluidos}</div>
                  <div class="metric-label">Planos Concluídos</div>
                  <div class="metric-description">Ações implementadas com sucesso</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value" style="color: #7c3aed;">${totalHorasAuditoria}h</div>
                  <div class="metric-label">Horas de Auditoria</div>
                  <div class="metric-description">Tempo total investido no projeto</div>
                </div>
              </div>
            </div>
            
            ${totalApontamentos > 0 ? `
            <!-- PRINCIPAIS APONTAMENTOS -->
            <div class="section">
              <h2 class="section-title">
                PRINCIPAIS APONTAMENTOS
              </h2>
              
              <table class="findings-table">
                <thead>
                  <tr>
                    <th style="width: 40%;">Descrição do Apontamento</th>
                    <th style="width: 15%;">Criticidade</th>
                    <th style="width: 20%;">Categoria</th>
                    <th style="width: 15%;">Status</th>
                    <th style="width: 10%;">Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  ${projetoDetalhado?.apontamentos_auditoria?.slice(0, 10).map((apontamento, index) => `
                    <tr>
                      <td>
                        <strong>${apontamento.titulo || `Apontamento ${index + 1}`}</strong>
                        <br><small style="color: #6b7280;">${apontamento.descricao ? apontamento.descricao.substring(0, 100) + '...' : 'Descrição não disponível'}</small>
                      </td>
                      <td>
                        <span class="severity-badge severity-${apontamento.criticidade || 'baixa'}">
                          ${(apontamento.criticidade || 'baixa').toUpperCase()}
                        </span>
                      </td>
                      <td>${(apontamento.categoria || 'Não categorizado').replace('_', ' ')}</td>
                      <td>${apontamento.status || 'Identificado'}</td>
                      <td style="text-align: right;">
                        ${apontamento.valor_impacto ? 
                          'R$ ' + apontamento.valor_impacto.toLocaleString('pt-BR') : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <!-- RECOMENDAÇÕES -->
            <div class="section">
              <h2 class="section-title">
                RECOMENDAÇÕES ESTRATÉGICAS
              </h2>
              
              <div class="recommendations">
                <h3 style="color: #059669; margin-bottom: 18px; font-size: 16px;">Plano de Ação Recomendado</h3>
                
                ${apontamentosCriticos > 0 ? `
                <div class="recommendation-item">
                  <div class="recommendation-priority">1</div>
                  <div>
                    <strong style="font-size: 12px;">Ação Imediata - Apontamentos Críticos</strong>
                    <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Implementar correções urgentes para os ${apontamentosCriticos} apontamentos de criticidade alta identificados. 
                    Prazo recomendado: 30 dias. Responsabilidade: Alta Administração.</p>
                  </div>
                </div>
                ` : ''}
                
                ${apontamentosAltos > 0 ? `
                <div class="recommendation-item">
                  <div class="recommendation-priority">2</div>
                  <div>
                    <strong style="font-size: 12px;">Melhorias Prioritárias</strong>
                    <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Desenvolver planos de ação para os ${apontamentosAltos} apontamentos de criticidade média-alta. 
                    Prazo recomendado: 60-90 dias. Responsabilidade: Gestores de Área.</p>
                  </div>
                </div>
                ` : ''}
                
                <div class="recommendation-item">
                  <div class="recommendation-priority">3</div>
                  <div>
                    <strong style="font-size: 12px;">Fortalecimento do Ambiente de Controle</strong>
                    <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Implementar programa de monitoramento contínuo e revisões periódicas dos controles internos. 
                    Estabelecer indicadores de performance e métricas de efetividade.</p>
                  </div>
                </div>
                
                <div class="recommendation-item">
                  <div class="recommendation-priority">4</div>
                  <div>
                    <strong style="font-size: 12px;">Capacitação e Treinamento</strong>
                    <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Desenvolver programa de capacitação para equipes sobre melhores práticas de controles internos 
                    e gestão de riscos. Foco em conscientização e cultura de compliance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- RODAPÉ -->
          <div class="footer">
            <div class="footer-grid">
              <div class="footer-section">
                <h4>Equipe de Auditoria</h4>
                <p>Auditor Líder: ${projeto.auditor_lider || projeto.chefe_auditoria}</p>
                <p>Data de Conclusão: ${dataFormatada}</p>
              </div>
              <div class="footer-section">
                <h4>Classificação</h4>
                <p>Documento: Confidencial</p>
                <p>Distribuição: Restrita</p>
              </div>
              <div class="footer-section">
                <h4>Próximos Passos</h4>
                <p>Follow-up: 30 dias</p>
                <p>Revisão: Trimestral</p>
              </div>
            </div>
            
            <div style="border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 15px;">
              <p style="font-size: 11px;"><strong>Sistema GRC - Governance, Risk & Compliance</strong></p>
              <p style="font-size: 10px;">Relatório gerado automaticamente em ${timestamp}</p>
              <p style="font-size: 9px; margin-top: 8px; line-height: 1.3;">
                Este documento contém informações confidenciais e deve ser tratado de acordo com as políticas de segurança da informação da organização.
              </p>
            </div>
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