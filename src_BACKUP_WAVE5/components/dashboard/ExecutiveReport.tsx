import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  risks: any[];
  policies: any[];
  vendors: any[];
  incidents: any[];
  assessments: any[];
  compliance: any[];
  auditReports: any[];
  ethics: any[];
}

export const generateExecutiveReport = async () => {
  try {
    // Buscar todos os dados necessários
    const [
      risksResult,
      policiesResult,
      vendorsResult,
      incidentsResult,
      assessmentsResult,
      complianceResult,
      auditResult,
      ethicsResult
    ] = await Promise.all([
      supabase.from('risk_assessments').select('*'),
      supabase.from('policies').select('*'),
      supabase.from('vendors').select('*'),
      supabase.from('security_incidents').select('*'),
      supabase.from('assessments').select('*'),
      supabase.from('compliance_records').select('*'),
      supabase.from('audit_reports').select('*'),
      supabase.from('ethics_reports').select('*')
    ]);

    const data: ReportData = {
      risks: risksResult.data || [],
      policies: policiesResult.data || [],
      vendors: vendorsResult.data || [],
      incidents: incidentsResult.data || [],
      assessments: assessmentsResult.data || [],
      compliance: complianceResult.data || [],
      auditReports: auditResult.data || [],
      ethics: ethicsResult.data || []
    };

    // Calcular métricas
    const metrics = calculateMetrics(data);
    
    // Gerar HTML do relatório
    const htmlContent = generateReportHTML(data, metrics);
    
    // Abrir em nova janela para impressão/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    toast.error('Erro ao gerar relatório executivo');
    return false;
  }
};

const calculateMetrics = (data: ReportData) => {
  // Métricas de Riscos
  const totalRisks = data.risks.length;
  const criticalRisks = data.risks.filter(r => r.severity === 'critical').length;
  const highRisks = data.risks.filter(r => r.severity === 'high').length;
  const openRisks = data.risks.filter(r => r.status === 'open').length;
  
  // Métricas de Compliance
  const totalCompliance = data.compliance.length;
  const compliantRecords = data.compliance.filter(r => r.compliance_status === 'compliant').length;
  const compliancePercentage = totalCompliance > 0 ? Math.round((compliantRecords / totalCompliance) * 100) : 0;
  
  // Métricas de Fornecedores
  const totalVendors = data.vendors.length;
  const highRiskVendors = data.vendors.filter(v => v.risk_level === 'high').length;
  const activeVendors = data.vendors.filter(v => v.status === 'active').length;
  
  // Métricas de Incidentes
  const totalIncidents = data.incidents.length;
  const openIncidents = data.incidents.filter(i => i.status === 'open').length;
  const criticalIncidents = data.incidents.filter(i => i.severity === 'critical').length;
  
  // Métricas de Políticas
  const totalPolicies = data.policies.length;
  const approvedPolicies = data.policies.filter(p => p.status === 'approved').length;
  
  // Métricas de Assessments
  const totalAssessments = data.assessments.length;
  const completedAssessments = data.assessments.filter(a => a.status === 'completed').length;
  
  // Métricas de Ética
  const totalEthicsReports = data.ethics.length;
  const openEthicsReports = data.ethics.filter(e => e.status === 'open').length;
  
  // Métricas de Auditoria
  const totalAudits = data.auditReports.length;
  const completedAudits = data.auditReports.filter(a => a.status === 'completed').length;
  
  // Score de Risco Geral (baseado em múltiplos fatores)
  const riskScore = calculateRiskScore(data);
  
  return {
    totalRisks,
    criticalRisks,
    highRisks,
    openRisks,
    compliancePercentage,
    totalVendors,
    highRiskVendors,
    activeVendors,
    totalIncidents,
    openIncidents,
    criticalIncidents,
    totalPolicies,
    approvedPolicies,
    totalAssessments,
    completedAssessments,
    totalEthicsReports,
    openEthicsReports,
    totalAudits,
    completedAudits,
    riskScore
  };
};

const calculateRiskScore = (data: ReportData) => {
  // Algoritmo simplificado para score de risco
  const weights = {
    criticalRisks: 0.4,
    openIncidents: 0.3,
    compliance: 0.2,
    vendorRisk: 0.1
  };
  
  const criticalRisksFactor = data.risks.filter(r => r.severity === 'critical').length;
  const openIncidentsFactor = data.incidents.filter(i => i.status === 'open').length;
  const complianceFactor = data.compliance.length > 0 ? 
    (data.compliance.filter(r => r.compliance_status !== 'compliant').length / data.compliance.length) * 10 : 0;
  const vendorRiskFactor = data.vendors.filter(v => v.risk_level === 'high').length;
  
  const score = (
    criticalRisksFactor * weights.criticalRisks +
    openIncidentsFactor * weights.openIncidents +
    complianceFactor * weights.compliance +
    vendorRiskFactor * weights.vendorRisk
  );
  
  return Math.min(10, Math.max(0, score));
};

const generateReportHTML = (data: ReportData, metrics: any) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Executivo GRC</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: #fff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 0;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 30px;
        }
        
        .executive-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
        }
        
        .executive-summary h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 3px solid #667eea;
        }
        
        .metric-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .metric-label {
            font-size: 0.75rem;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .risk-critical .metric-value { color: #e74c3c; }
        .risk-high .metric-value { color: #f39c12; }
        .compliance-good .metric-value { color: #27ae60; }
        .compliance-warning .metric-value { color: #f39c12; }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section h3 {
            color: #2c3e50;
            font-size: 1.2rem;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .data-table th,
        .data-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
            font-size: 0.85rem;
        }
        
        .data-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .data-table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-critical { background: #fee; color: #e74c3c; }
        .status-high { background: #fef9e7; color: #f39c12; }
        .status-medium { background: #fff3cd; color: #856404; }
        .status-low { background: #d1edff; color: #0066cc; }
        .status-open { background: #fee; color: #e74c3c; }
        .status-closed { background: #d4edda; color: #155724; }
        .status-approved { background: #d4edda; color: #155724; }
        .status-draft { background: #e2e3e5; color: #383d41; }
        
        .recommendations {
            background: #e8f5e8;
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #27ae60;
        }
        
        .recommendations h3 {
            color: #27ae60;
            margin-bottom: 15px;
        }
        
        .recommendations ul {
            list-style: none;
        }
        
        .recommendations li {
            padding: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .recommendations li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
            margin-top: 50px;
        }
        
        @media print {
            body { font-size: 12px; }
            .header { background: #667eea !important; -webkit-print-color-adjust: exact; }
            .metric-card, .data-table { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>Relatório Executivo GRC</h1>
            <p>Governança, Risco e Compliance • ${currentDate}</p>
        </div>
    </div>

    <div class="container">
        <div class="executive-summary">
            <h2>Resumo Executivo</h2>
            <p>
                Este relatório apresenta uma visão consolidada da postura de Governança, Risco e Compliance da organização. 
                Com base nos dados coletados até ${currentDate}, observamos uma postura de risco controlada com 
                <strong>${metrics.compliancePercentage}% de conformidade</strong> e 
                <strong>${metrics.criticalRisks} riscos críticos</strong> que requerem atenção imediata.
            </p>
            <br>
            <p>
                <strong>Score de Risco Geral:</strong> ${metrics.riskScore.toFixed(1)}/10 
                ${metrics.riskScore <= 3 ? '(Baixo)' : metrics.riskScore <= 6 ? '(Médio)' : '(Alto)'}
            </p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card ${metrics.criticalRisks > 0 ? 'risk-critical' : 'compliance-good'}">
                <div class="metric-value">${metrics.criticalRisks}</div>
                <div class="metric-label">Riscos Críticos</div>
            </div>
            
            <div class="metric-card ${metrics.compliancePercentage >= 90 ? 'compliance-good' : 'compliance-warning'}">
                <div class="metric-value">${metrics.compliancePercentage}%</div>
                <div class="metric-label">Conformidade</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${metrics.totalPolicies}</div>
                <div class="metric-label">Políticas</div>
            </div>
            
            <div class="metric-card ${metrics.openIncidents > 0 ? 'risk-critical' : 'compliance-good'}">
                <div class="metric-value">${metrics.openIncidents}</div>
                <div class="metric-label">Incidentes Abertos</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${metrics.totalEthicsReports}</div>
                <div class="metric-label">Canal de Ética</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${metrics.totalAudits}</div>
                <div class="metric-label">Auditorias</div>
            </div>
        </div>

        <div class="section">
            <h3>Riscos Críticos e de Alto Impacto</h3>
            ${generateRiskTable(data.risks.filter(r => ['critical', 'high'].includes(r.severity)).slice(0, 10))}
        </div>

        <div class="section">
            <h3>Status de Compliance por Framework</h3>
            ${generateComplianceTable(data.compliance)}
        </div>

        <div class="section">
            <h3>Incidentes de Segurança Recentes</h3>
            ${generateIncidentTable(data.incidents.slice(0, 10))}
        </div>

        <div class="section">
            <h3>Políticas e Documentos</h3>
            ${generatePolicyTable(data.policies)}
        </div>

        <div class="section">
            <h3>Canal de Ética - Relatórios</h3>
            ${generateEthicsTable(data.ethics)}
        </div>

        <div class="section">
            <h3>Auditorias</h3>
            ${generateAuditTable(data.auditReports)}
        </div>

        <div class="section">
            <h3>Fornecedores de Alto Risco</h3>
            ${generateVendorTable(data.vendors.filter(v => v.risk_level === 'high'))}
        </div>

        <div class="recommendations">
            <h3>Recomendações Estratégicas</h3>
            <ul>
                ${metrics.criticalRisks > 0 ? '<li>Priorizar tratamento dos riscos críticos identificados</li>' : ''}
                ${metrics.compliancePercentage < 90 ? '<li>Intensificar esforços de conformidade para atingir meta de 90%</li>' : ''}
                ${metrics.openIncidents > 0 ? '<li>Acelerar resolução dos incidentes de segurança em aberto</li>' : ''}
                ${metrics.highRiskVendors > 0 ? '<li>Revisar contratos e controles dos fornecedores de alto risco</li>' : ''}
                <li>Manter programa de monitoramento contínuo</li>
                <li>Implementar automações para otimizar processos de GRC</li>
                <li>Promover treinamentos de conscientização em segurança</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <div class="container">
            <p>Relatório gerado automaticamente pelo Sistema GRC • ${currentDate}</p>
            <p>Este documento contém informações confidenciais e deve ser tratado adequadamente.</p>
        </div>
    </div>
</body>
</html>`;
};

const generateRiskTable = (risks: any[]) => {
  if (risks.length === 0) {
    return '<p>Nenhum risco crítico ou alto identificado.</p>';
  }
  
  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            ${risks.map(risk => `
                <tr>
                    <td>${risk.title}</td>
                    <td>${risk.risk_category}</td>
                    <td><span class="status-badge status-${risk.severity}">${risk.severity}</span></td>
                    <td><span class="status-badge status-${risk.status}">${risk.status}</span></td>
                    <td>${risk.risk_score || 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
};

const generateComplianceTable = (compliance: any[]) => {
  // Agrupar por framework
  const grouped = compliance.reduce((acc, record) => {
    if (!acc[record.framework]) {
      acc[record.framework] = { total: 0, compliant: 0 };
    }
    acc[record.framework].total++;
    if (record.compliance_status === 'compliant') {
      acc[record.framework].compliant++;
    }
    return acc;
  }, {} as Record<string, { total: number; compliant: number }>);

  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Framework</th>
                <th>Controles Totais</th>
                <th>Controles Conformes</th>
                <th>% Conformidade</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(grouped).map(([framework, data]: [string, { total: number; compliant: number }]) => {
              const percentage = Math.round((data.compliant / data.total) * 100);
              return `
                <tr>
                    <td>${framework}</td>
                    <td>${data.total}</td>
                    <td>${data.compliant}</td>
                    <td><span class="status-badge ${percentage >= 90 ? 'status-approved' : 'status-medium'}">${percentage}%</span></td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>
  `;
};

const generateIncidentTable = (incidents: any[]) => {
  if (incidents.length === 0) {
    return '<p>Nenhum incidente de segurança registrado.</p>';
  }
  
  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Data de Detecção</th>
            </tr>
        </thead>
        <tbody>
            ${incidents.map(incident => `
                <tr>
                    <td>${incident.title}</td>
                    <td>${incident.incident_type}</td>
                    <td><span class="status-badge status-${incident.severity}">${incident.severity}</span></td>
                    <td><span class="status-badge status-${incident.status}">${incident.status}</span></td>
                    <td>${new Date(incident.detection_date).toLocaleDateString('pt-BR')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
};

const generatePolicyTable = (policies: any[]) => {
  if (policies.length === 0) {
    return '<p>Nenhuma política registrada.</p>';
  }
  
  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Versão</th>
                <th>Data Efetiva</th>
            </tr>
        </thead>
        <tbody>
            ${policies.slice(0, 10).map(policy => `
                <tr>
                    <td>${policy.title}</td>
                    <td>${policy.category}</td>
                    <td><span class="status-badge status-${policy.status}">${policy.status}</span></td>
                    <td>${policy.version}</td>
                    <td>${policy.effective_date ? new Date(policy.effective_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
};

const generateEthicsTable = (ethics: any[]) => {
  if (ethics.length === 0) {
    return '<p>Nenhum relatório de ética registrado.</p>';
  }
  
  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Data de Criação</th>
            </tr>
        </thead>
        <tbody>
            ${ethics.slice(0, 10).map(report => `
                <tr>
                    <td>${report.title}</td>
                    <td>${report.category}</td>
                    <td><span class="status-badge status-${report.severity}">${report.severity}</span></td>
                    <td><span class="status-badge status-${report.status}">${report.status}</span></td>
                    <td>${new Date(report.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
};

const generateAuditTable = (audits: any[]) => {
  if (audits.length === 0) {
    return '<p>Nenhuma auditoria registrada.</p>';
  }
  
  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data de Início</th>
                <th>Data de Fim</th>
            </tr>
        </thead>
        <tbody>
            ${audits.slice(0, 10).map(audit => `
                <tr>
                    <td>${audit.title}</td>
                    <td>${audit.audit_type}</td>
                    <td><span class="status-badge status-${audit.status}">${audit.status}</span></td>
                    <td>${audit.start_date ? new Date(audit.start_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                    <td>${audit.end_date ? new Date(audit.end_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
};

const generateVendorTable = (vendors: any[]) => {
  if (vendors.length === 0) {
    return '<p>Nenhum fornecedor de alto risco identificado.</p>';
  }
  
  return `
    <table class="data-table">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Nível de Risco</th>
                <th>Status</th>
                <th>Última Avaliação</th>
            </tr>
        </thead>
        <tbody>
            ${vendors.map(vendor => `
                <tr>
                    <td>${vendor.name}</td>
                    <td>${vendor.category}</td>
                    <td><span class="status-badge status-${vendor.risk_level}">${vendor.risk_level}</span></td>
                    <td><span class="status-badge status-${vendor.status}">${vendor.status}</span></td>
                    <td>${vendor.last_assessment_date ? new Date(vendor.last_assessment_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
};

interface ExecutiveReportButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
}

const ExecutiveReportButton: React.FC<ExecutiveReportButtonProps> = ({ 
  className = '', 
  size = 'default',
  variant = 'default'
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await generateExecutiveReport();
      toast.success('Relatório executivo gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório executivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerateReport}
      disabled={loading}
      className={className}
      style={{
        backgroundColor: loading ? '#94a3b8' : 'hsl(var(--primary))', // Usa variável CSS primary ou cinza quando loading
        color: 'white', // Texto branco para melhor contraste
        border: `1px solid ${loading ? '#94a3b8' : 'hsl(var(--primary))'}`,
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        if (!loading) e.currentTarget.style.opacity = '1';
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {loading ? 'Gerando...' : 'Relatório Executivo'}
    </button>
  );
};

export default ExecutiveReportButton;