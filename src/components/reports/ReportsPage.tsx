import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar as CalendarIcon, TrendingUp, Shield, AlertTriangle, FileCheck, Users, Eye, BarChart as BarChartIcon, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { format } from 'date-fns';

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartTitle, setChartTitle] = useState<string>('');
  const [exportType, setExportType] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const processDataForChart = (data: any[], moduleType: string) => {
    let processedData: any[] = [];
    let title = '';

    switch (moduleType) {
      case 'risks':
        title = 'Riscos por Severidade';
        const risksBySeverity = data.reduce((acc, item) => {
          const severity = item.severity || 'Não Definido';
          acc[severity] = (acc[severity] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(risksBySeverity).map(key => ({ name: key, value: risksBySeverity[key] }));
        break;
      case 'incidents':
        title = 'Incidentes por Tipo';
        const incidentsByType = data.reduce((acc, item) => {
          const type = item.incident_type || 'Não Definido';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(incidentsByType).map(key => ({ name: key, value: incidentsByType[key] }));
        break;
      case 'policies':
        title = 'Políticas por Status';
        const policiesByStatus = data.reduce((acc, item) => {
          const status = item.status || 'Não Definido';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(policiesByStatus).map(key => ({ name: key, value: policiesByStatus[key] }));
        break;
      case 'assessments':
        title = 'Assessments por Status';
        const assessmentsByStatus = data.reduce((acc, item) => {
          const status = item.status || 'Não Definido';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(assessmentsByStatus).map(key => ({ name: key, value: assessmentsByStatus[key] }));
        break;
      case 'vendors':
        title = 'Fornecedores por Status';
        const vendorsByStatus = data.reduce((acc, item) => {
          const status = item.status || 'Não Definido';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(vendorsByStatus).map(key => ({ name: key, value: vendorsByStatus[key] }));
        break;
      case 'audit':
        title = 'Auditorias por Tipo';
        const auditsByType = data.reduce((acc, item) => {
          const type = item.audit_type || 'Não Definido';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(auditsByType).map(key => ({ name: key, value: auditsByType[key] }));
        break;
      case 'compliance':
        title = 'Conformidade por Status';
        const complianceByStatus = data.reduce((acc, item) => {
          const status = item.status || 'Não Definido';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        processedData = Object.keys(complianceByStatus).map(key => ({ name: key, value: complianceByStatus[key] }));
        break;
      default:
        title = 'Dados Consolidados';
        processedData = [];
        break;
    }
    setChartTitle(title);
    setChartData(processedData);
  };
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [dateRange]); // Recarrega dados quando o intervalo de datas muda

  const applyDateFilters = (query: any) => {
    if (dateRange?.from) {
      query = query.gte('created_at', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      query = query.lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));
    }
    return query;
  };

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
        applyDateFilters(supabase.from('risk_assessments')).select('*', { count: 'exact', head: true }),
        applyDateFilters(supabase.from('policies')).select('*', { count: 'exact', head: true }),
        applyDateFilters(supabase.from('assessments')).select('*', { count: 'exact', head: true }),
        applyDateFilters(supabase.from('security_incidents')).select('*', { count: 'exact', head: true }),
        applyDateFilters(supabase.from('vendors')).select('*', { count: 'exact', head: true }),
        applyDateFilters(supabase.from('audit_reports')).select('*', { count: 'exact', head: true }),
        applyDateFilters(supabase.from('compliance_records')).select('*', { count: 'exact', head: true })
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
          applyDateFilters(supabase.from('risk_assessments')).select('*'),
          applyDateFilters(supabase.from('policies')).select('*'),
          applyDateFilters(supabase.from('assessments')).select('*'),
          applyDateFilters(supabase.from('security_incidents')).select('*'),
          applyDateFilters(supabase.from('vendors')).select('*'),
          applyDateFilters(supabase.from('audit_reports')).select('*'),
          applyDateFilters(supabase.from('compliance_records')).select('*')
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
        
        generatePrintableReport(consolidatedData, 'relatorio-consolidado');
        return;
      }

      let data, error;

      switch (selectedModule) {
        case 'risks':
          ({ data, error } = await applyDateFilters(supabase.from('risk_assessments')).select('*'));
          break;
        case 'policies':
          ({ data, error } = await applyDateFilters(supabase.from('policies')).select('*'));
          break;
        case 'assessments':
          ({ data, error } = await applyDateFilters(supabase.from('assessments')).select('*'));
          break;
        case 'incidents':
          ({ data, error } = await applyDateFilters(supabase.from('security_incidents')).select('*'));
          break;
        case 'vendors':
          ({ data, error } = await applyDateFilters(supabase.from('vendors')).select('*'));
          break;
        case 'audit':
          ({ data, error } = await applyDateFilters(supabase.from('audit_reports')).select('*'));
          break;
        case 'compliance':
          ({ data, error } = await applyDateFilters(supabase.from('compliance_records')).select('*'));
          break;
        default:
          throw new Error('Módulo não encontrado');
      }
      
      if (error) throw error;

      if (exportType === 'pdf') {
        generatePrintableReport(data, selectedModule);
        toast({
          title: "Sucesso",
          description: "Relatório aberto para impressão!",
          variant: "default",
        });
      } else if (exportType === 'excel') {
        exportToExcel(data, selectedModule);
      } else if (exportType === 'csv') {
        exportToCsv(data, selectedModule);
      }
      
      processDataForChart(data, selectedModule);
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            @page {
              margin: 0.75in;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #2d3748; /* Tailwind gray-800 */
            margin: 0;
            padding: 30px;
            background-color: #f7fafc; /* Tailwind gray-100 */
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .header {
            text-align: center;
            padding-bottom: 25px;
            margin-bottom: 30px;
            border-bottom: 2px solid #e2e8f0; /* Tailwind gray-200 */
          }
          
          .header img {
            max-width: 80px;
            margin-bottom: 15px;
          }

          .header h1 {
            color: #2b6cb0; /* Tailwind blue-700 */
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }
          
          .header h2 {
            color: #4a5568; /* Tailwind gray-700 */
            margin: 8px 0 0;
            font-size: 22px;
            font-weight: 600;
          }
          
          .header .date {
            color: #718096; /* Tailwind gray-600 */
            font-size: 14px;
            margin-top: 10px;
          }
          
          .summary {
            background: #ebf8ff; /* Tailwind blue-50 */
            border: 1px solid #bee3f8; /* Tailwind blue-200 */
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 35px;
          }
          
          .summary h3 {
            color: #2b6cb0; /* Tailwind blue-700 */
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
            border-bottom: 1px solid #90cdf4; /* Tailwind blue-300 */
            padding-bottom: 10px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
          }
          
          .stat-card {
            background: #ffffff;
            border: 1px solid #e2e8f0; /* Tailwind gray-200 */
            border-radius: 6px;
            padding: 18px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          }
          
          .stat-number {
            font-size: 28px;
            font-weight: 700;
            color: #2c5282; /* Tailwind blue-800 */
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: #718096; /* Tailwind gray-600 */
            font-size: 14px;
            font-weight: 400;
          }
          
          .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          
          .section h3 {
            color: #2b6cb0; /* Tailwind blue-700 */
            border-bottom: 2px solid #e2e8f0; /* Tailwind gray-200 */
            padding-bottom: 12px;
            margin-bottom: 25px;
            font-size: 20px;
            font-weight: 600;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
            border: 1px solid #e2e8f0; /* Tailwind gray-200 */
            border-radius: 8px;
            overflow: hidden;
          }
          
          .data-table th {
            background: #edf2f7; /* Tailwind gray-100 */
            border: 1px solid #e2e8f0; /* Tailwind gray-200 */
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            color: #4a5568; /* Tailwind gray-700 */
          }
          
          .data-table td {
            border: 1px solid #e2e8f0; /* Tailwind gray-200 */
            padding: 10px 15px;
            vertical-align: top;
            color: #2d3748; /* Tailwind gray-800 */
          }
          
          .data-table tr:nth-child(even) {
            background: #f7fafc; /* Tailwind gray-50 */
          }
          
          .status-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
            text-transform: capitalize;
          }
          
          .status-active { background: #c6f6d5; color: #22543d; } /* Tailwind green-200 / green-900 */
          .status-inactive { background: #fed7d7; color: #9b2c2c; } /* Tailwind red-200 / red-900 */
          .status-pending { background: #fefcbf; color: #7b341e; } /* Tailwind yellow-200 / yellow-900 */
          .status-draft { background: #e0e7ff; color: #3730a3; } /* Tailwind indigo-200 / indigo-900 */
          .status-approved { background: #c6f6d5; color: #22543d; }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #718096; /* Tailwind gray-600 */
            font-size: 12px;
            border-top: 1px solid #e2e8f0; /* Tailwind gray-200 */
            padding-top: 20px;
          }
          
          .no-data {
            text-align: center;
            color: #718096; /* Tailwind gray-600 */
            font-style: italic;
            padding: 40px;
            background-color: #f7fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e0; /* Tailwind gray-300 */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/placeholder.svg" alt="GRC Logo" />
            <h1>GRC Controller</h1>
            <h2>Relatório de ${moduleNames[moduleType] || moduleType}</h2>
            <div class="date">Gerado em: ${reportDate}</div>
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
        { key: 'policies', title: 'Políticas Corporativas', data: data.policies },
        { key: 'assessments', title: 'Assessments e Avaliações', data: data.assessments },
        { key: 'incidents', title: 'Incidentes de Segurança', data: data.incidents },
        { key: 'vendors', title: 'Gestão de Fornecedores', data: data.vendors },
        { key: 'auditReports', title: 'Relatórios de Auditoria', data: data.auditReports },
        { key: 'complianceRecords', title: 'Registros de Conformidade', data: data.complianceRecords }
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
        </div> <!-- Close container -->
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
    ).slice(0, 12); // Aumentado para 12 colunas para mais detalhes

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

  const exportToExcel = (data: any[], moduleType: string) => {
    const filename = `${moduleType}-report-${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, filename);
    toast({
      title: "Sucesso",
      description: `Relatório ${moduleType} exportado para Excel!`, 
    });
  };

  const exportToCsv = (data: any[], moduleType: string) => {
    const filename = `${moduleType}-report-${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Sucesso",
      description: `Relatório ${moduleType} exportado para CSV!`, 
    });
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
        <Card className="overflow-hidden">
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

        <Card className="overflow-hidden">
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

        <Card className="overflow-hidden">
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

        <Card className="overflow-hidden">
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
      <Card className="overflow-hidden">
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
              <label className="text-sm font-medium">Intervalo de Datas</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={exportType} onValueChange={(value: "pdf" | "excel" | "csv") => setExportType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={generateReport} 
                disabled={isLoading || getModuleData(selectedModule) === 0}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isLoading ? 'Gerando...' : 'Gerar Relatório'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico do Relatório */}
      {chartData.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChartIcon className="h-5 w-5" />
              <span>{chartTitle}</span>
            </CardTitle>
            <CardDescription>
              Visualização gráfica dos dados do módulo selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Módulos */}
      <Card className="overflow-hidden">
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