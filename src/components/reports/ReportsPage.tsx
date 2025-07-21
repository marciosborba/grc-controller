import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, TrendingUp, Shield, AlertTriangle, FileCheck, Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  risks: number;
  policies: number;
  assessments: number;
  incidents: number;
  vendors: number;
  auditReports: number;
  complianceRecords: number;
}

export const ReportsPage = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData>({
    risks: 0,
    policies: 0,
    assessments: 0,
    incidents: 0,
    vendors: 0,
    auditReports: 0,
    complianceRecords: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [
        { count: risks },
        { count: policies },
        { count: assessments },
        { count: incidents },
        { count: vendors },
        { count: auditReports },
        { count: complianceRecords }
      ] = await Promise.all([
        supabase.from('risk_assessments').select('*', { count: 'exact', head: true }),
        supabase.from('policies').select('*', { count: 'exact', head: true }),
        supabase.from('assessments').select('*', { count: 'exact', head: true }),
        supabase.from('security_incidents').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('audit_reports').select('*', { count: 'exact', head: true }),
        supabase.from('compliance_records').select('*', { count: 'exact', head: true })
      ]);

      setReportData({
        risks: risks || 0,
        policies: policies || 0,
        assessments: assessments || 0,
        incidents: incidents || 0,
        vendors: vendors || 0,
        auditReports: auditReports || 0,
        complianceRecords: complianceRecords || 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos relatórios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      if (selectedModule === 'all') {
        // Para 'all', vamos gerar um relatório consolidado
        const allData = await Promise.all([
          supabase.from('risk_assessments').select('*'),
          supabase.from('policies').select('*'),
          supabase.from('assessments').select('*'),
          supabase.from('security_incidents').select('*'),
          supabase.from('vendors').select('*'),
          supabase.from('audit_reports').select('*'),
          supabase.from('compliance_records').select('*')
        ]);
        
        const consolidatedData = {
          risks: allData[0].data || [],
          policies: allData[1].data || [],
          assessments: allData[2].data || [],
          incidents: allData[3].data || [],
          vendors: allData[4].data || [],
          auditReports: allData[5].data || [],
          complianceRecords: allData[6].data || []
        };
        
        downloadReport(consolidatedData, 'relatorio-consolidado');
        return;
      }

      let data, error;

      switch (selectedModule) {
        case 'risks':
          ({ data, error } = await supabase.from('risk_assessments').select('*'));
          break;
        case 'policies':
          ({ data, error } = await supabase.from('policies').select('*'));
          break;
        case 'assessments':
          ({ data, error } = await supabase.from('assessments').select('*'));
          break;
        case 'incidents':
          ({ data, error } = await supabase.from('security_incidents').select('*'));
          break;
        case 'vendors':
          ({ data, error } = await supabase.from('vendors').select('*'));
          break;
        case 'audit':
          ({ data, error } = await supabase.from('audit_reports').select('*'));
          break;
        case 'compliance':
          ({ data, error } = await supabase.from('compliance_records').select('*'));
          break;
        default:
          throw new Error('Módulo não encontrado');
      }
      
      if (error) throw error;

      generatePrintableReport(data, selectedModule);
      
      toast({
        title: "Sucesso",
        description: "Relatório aberto para impressão!",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrintableReport = (data: any, moduleType: string) => {
    const reportDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const moduleNames: { [key: string]: string } = {
      'all': 'Relatório Consolidado - Todos os Módulos',
      'risks': 'Gestão de Riscos',
      'policies': 'Políticas Corporativas',
      'assessments': 'Assessments e Avaliações',
      'incidents': 'Incidentes de Segurança',
      'vendors': 'Gestão de Fornecedores',
      'audit': 'Relatórios de Auditoria',
      'compliance': 'Registros de Conformidade'
    };

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório GRC - ${moduleNames[moduleType] || moduleType}</title>
        <style>
          @media print {
            @page {
              margin: 1in;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          
          .header h2 {
            color: #64748b;
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
          }
          
          .header .date {
            color: #6b7280;
            font-size: 14px;
            margin-top: 10px;
          }
          
          .summary {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .summary h3 {
            color: #1e40af;
            margin-top: 0;
            margin-bottom: 15px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .stat-card {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: #6b7280;
            font-size: 14px;
          }
          
          .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          
          .section h3 {
            color: #1e40af;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          
          .data-table th {
            background: #f1f5f9;
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: #374151;
          }
          
          .data-table td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            vertical-align: top;
          }
          
          .data-table tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
          
          .status-active { background: #dcfce7; color: #166534; }
          .status-inactive { background: #fee2e2; color: #991b1b; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-draft { background: #e0e7ff; color: #3730a3; }
          .status-approved { background: #dcfce7; color: #166534; }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          
          .no-data {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 40px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GRC Controller</h1>
          <h2>${moduleNames[moduleType] || moduleType}</h2>
          <div class="date">Relatório gerado em ${reportDate}</div>
        </div>
    `;

    if (moduleType === 'all' && typeof data === 'object' && !Array.isArray(data)) {
      // Relatório consolidado
      const totalRecords = Object.values(data).reduce((total: number, arr: any) => 
        total + (Array.isArray(arr) ? arr.length : 0), 0
      );

      htmlContent += `
        <div class="summary">
          <h3>Resumo Executivo</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${totalRecords}</div>
              <div class="stat-label">Total de Registros</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.risks?.length || 0}</div>
              <div class="stat-label">Riscos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.policies?.length || 0}</div>
              <div class="stat-label">Políticas</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.incidents?.length || 0}</div>
              <div class="stat-label">Incidentes</div>
            </div>
          </div>
        </div>
      `;

      // Seções para cada módulo
      const modules = [
        { key: 'risks', title: 'Gestão de Riscos', data: data.risks },
        { key: 'policies', title: 'Políticas', data: data.policies },
        { key: 'assessments', title: 'Assessments', data: data.assessments },
        { key: 'incidents', title: 'Incidentes', data: data.incidents },
        { key: 'vendors', title: 'Fornecedores', data: data.vendors },
        { key: 'auditReports', title: 'Auditoria', data: data.auditReports },
        { key: 'complianceRecords', title: 'Conformidade', data: data.complianceRecords }
      ];

      modules.forEach(module => {
        if (module.data && module.data.length > 0) {
          htmlContent += `<div class="section">`;
          htmlContent += `<h3>${module.title} (${module.data.length} registros)</h3>`;
          htmlContent += formatDataTable(module.data, module.key);
          htmlContent += `</div>`;
        }
      });
    } else {
      // Relatório de módulo específico
      htmlContent += `
        <div class="summary">
          <h3>Resumo</h3>
          <div class="stat-card" style="max-width: 300px; margin: 0 auto;">
            <div class="stat-number">${Array.isArray(data) ? data.length : 0}</div>
            <div class="stat-label">Total de Registros</div>
          </div>
        </div>
      `;

      if (Array.isArray(data) && data.length > 0) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Dados Detalhados</h3>`;
        htmlContent += formatDataTable(data, moduleType);
        htmlContent += `</div>`;
      } else {
        htmlContent += `<div class="no-data">Nenhum dado encontrado para este módulo.</div>`;
      }
    }

    htmlContent += `
        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo Sistema GRC Controller</p>
          <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    // Abrir em nova janela e imprimir
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar carregamento e então imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  const formatDataTable = (data: any[], moduleType: string): string => {
    if (!Array.isArray(data) || data.length === 0) {
      return '<div class="no-data">Nenhum dado disponível</div>';
    }

    const firstItem = data[0];
    const columns = Object.keys(firstItem).filter(key => 
      !['id', 'created_at', 'updated_at'].includes(key)
    ).slice(0, 6); // Limitar a 6 colunas para caber na página

    let tableHtml = `
      <table class="data-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${formatColumnName(col)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    data.slice(0, 50).forEach(item => { // Limitar a 50 registros por página
      tableHtml += '<tr>';
      columns.forEach(col => {
        let value = item[col];
        
        // Formatação especial para campos específicos
        if (col.includes('status') || col.includes('severity') || col.includes('priority')) {
          const statusClass = getStatusClass(value);
          value = `<span class="status-badge ${statusClass}">${value || 'N/A'}</span>`;
        } else if (col.includes('date')) {
          value = value ? new Date(value).toLocaleDateString('pt-BR') : 'N/A';
        } else if (typeof value === 'string' && value.length > 100) {
          value = value.substring(0, 100) + '...';
        } else if (value === null || value === undefined) {
          value = 'N/A';
        }
        
        tableHtml += `<td>${value}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += `
        </tbody>
      </table>
    `;

    if (data.length > 50) {
      tableHtml += `<p style="text-align: center; color: #6b7280; font-size: 12px;">
        Mostrando os primeiros 50 registros de ${data.length} total.
      </p>`;
    }

    return tableHtml;
  };

  const formatColumnName = (column: string): string => {
    const columnNames: { [key: string]: string } = {
      'title': 'Título',
      'description': 'Descrição',
      'status': 'Status',
      'severity': 'Severidade',
      'priority': 'Prioridade',
      'category': 'Categoria',
      'name': 'Nome',
      'email': 'Email',
      'phone': 'Telefone',
      'risk_level': 'Nível de Risco',
      'risk_category': 'Categoria de Risco',
      'assigned_to': 'Responsável',
      'due_date': 'Data Limite',
      'completion_percentage': 'Progresso (%)',
      'control_type': 'Tipo de Controle',
      'implementation_status': 'Status de Implementação',
      'framework': 'Framework',
      'audit_type': 'Tipo de Auditoria',
      'incident_type': 'Tipo de Incidente',
      'affected_systems': 'Sistemas Afetados',
      'detection_date': 'Data de Detecção',
      'resolution_date': 'Data de Resolução'
    };
    
    return columnNames[column] || column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusClass = (status: string): string => {
    if (!status) return '';
    
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('ativo') || lowerStatus.includes('active') || 
        lowerStatus.includes('aprovado') || lowerStatus.includes('approved') ||
        lowerStatus.includes('implementado') || lowerStatus.includes('resolvido')) {
      return 'status-active';
    } else if (lowerStatus.includes('inativo') || lowerStatus.includes('inactive') ||
               lowerStatus.includes('rejeitado') || lowerStatus.includes('rejected')) {
      return 'status-inactive';
    } else if (lowerStatus.includes('pendente') || lowerStatus.includes('pending') ||
               lowerStatus.includes('aberto') || lowerStatus.includes('open')) {
      return 'status-pending';
    } else if (lowerStatus.includes('rascunho') || lowerStatus.includes('draft')) {
      return 'status-draft';
    }
    
    return '';
  };

  const downloadReport = (data: any, filename: string) => {
    // Esta função não é mais usada, mas mantida para compatibilidade
  };

  const moduleOptions = [
    { value: 'all', label: 'Todos os Módulos', icon: FileText },
    { value: 'risks', label: 'Gestão de Riscos', icon: AlertTriangle },
    { value: 'policies', label: 'Políticas', icon: FileCheck },
    { value: 'assessments', label: 'Assessments', icon: FileCheck },
    { value: 'incidents', label: 'Incidentes', icon: Shield },
    { value: 'vendors', label: 'Fornecedores', icon: Users },
    { value: 'audit', label: 'Auditoria', icon: Eye },
    { value: 'compliance', label: 'Conformidade', icon: FileCheck }
  ];

  const getModuleData = (module: string) => {
    switch (module) {
      case 'risks': return reportData.risks;
      case 'policies': return reportData.policies;
      case 'assessments': return reportData.assessments;
      case 'incidents': return reportData.incidents;
      case 'vendors': return reportData.vendors;
      case 'audit': return reportData.auditReports;
      case 'compliance': return reportData.complianceRecords;
      default: return Object.values(reportData).reduce((a, b) => a + b, 0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere relatórios personalizados dos módulos do sistema GRC
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(reportData).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os módulos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riscos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.risks}</div>
            <p className="text-xs text-muted-foreground">
              Avaliações de risco
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Políticas</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.policies}</div>
            <p className="text-xs text-muted-foreground">
              Documentos de política
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.incidents}</div>
            <p className="text-xs text-muted-foreground">
              Incidentes registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gerador de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Gerador de Relatórios</span>
          </CardTitle>
          <CardDescription>
            Selecione um módulo para gerar um relatório detalhado dos dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Módulo</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um módulo" />
                </SelectTrigger>
                <SelectContent>
                  {moduleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registros Disponíveis</label>
              <div className="h-10 flex items-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {getModuleData(selectedModule)} registros
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            
            <Button 
              onClick={generateReport} 
              disabled={isLoading || getModuleData(selectedModule) === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isLoading ? 'Gerando...' : 'Gerar PDF'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Módulos */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos Disponíveis</CardTitle>
          <CardDescription>
            Visão geral dos dados disponíveis em cada módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {moduleOptions.slice(1).map((option) => {
              const Icon = option.icon;
              const count = getModuleData(option.value);
              
              return (
                <div key={option.value} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'registro' : 'registros'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={count > 0 ? "default" : "secondary"}>
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};