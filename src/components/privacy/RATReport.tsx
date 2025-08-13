import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Building, 
  Shield, 
  Globe, 
  AlertTriangle, 
  CheckCircle,
  Filter,
  Printer,
  Mail,
  Eye,
  Database,
  Users,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { useProcessingActivities, ProcessingActivityFilters } from '@/hooks/useProcessingActivities';
import { ProcessingActivity, ProcessingActivityStatus, ProcessingPurpose } from '@/types/privacy-management';

interface RATReportData {
  activities: ProcessingActivity[];
  summary: {
    total: number;
    active: number;
    suspended: number;
    high_risk: number;
    with_international_transfer: number;
    by_department: Record<string, number>;
    generated_at: string;
  };
}

export function RATReport() {
  const { generateRATReport } = useProcessingActivities();
  
  const [reportData, setReportData] = useState<RATReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProcessingActivityFilters>({});
  const [reportFormat, setReportFormat] = useState<'detailed' | 'summary' | 'audit'>('detailed');

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const report = await generateRATReport(filters);
      setReportData(report as RATReportData);
      toast.success('Relatório RAT gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar relatório RAT');
      console.error('Error generating RAT report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with basic report
  useEffect(() => {
    handleGenerateReport();
  }, []);

  // Handle filter change
  const handleFilterChange = (key: keyof ProcessingActivityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Export functions (placeholder implementations)
  const handleExportPDF = () => {
    toast.success('Exportação PDF iniciada');
    // In a real implementation, this would generate and download a PDF
  };

  const handleExportExcel = () => {
    toast.success('Exportação Excel iniciada');
    // In a real implementation, this would generate and download an Excel file
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    toast.success('Relatório enviado por email');
    // In a real implementation, this would open email composition
  };

  // Get status color for badges
  const getStatusColor = (status: ProcessingActivityStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: ProcessingActivityStatus) => {
    const labels = {
      active: 'Ativa',
      suspended: 'Suspensa',
      under_review: 'Em Revisão'
    };
    return labels[status] || status;
  };

  // Get purpose label
  const getPurposeLabel = (purpose: ProcessingPurpose) => {
    const labels = {
      marketing: 'Marketing',
      comunicacao_comercial: 'Comunicação Comercial',
      analise_comportamental: 'Análise Comportamental',
      gestao_rh: 'Gestão de RH',
      folha_pagamento: 'Folha de Pagamento',
      controle_acesso: 'Controle de Acesso',
      contabilidade: 'Contabilidade',
      declaracoes_fiscais: 'Declarações Fiscais',
      videomonitoramento: 'Videomonitoramento',
      seguranca: 'Segurança',
      atendimento_cliente: 'Atendimento ao Cliente',
      suporte_tecnico: 'Suporte Técnico',
      pesquisa_satisfacao: 'Pesquisa de Satisfação',
      desenvolvimento_produtos: 'Desenvolvimento de Produtos',
      outros: 'Outros'
    };
    return labels[purpose] || purpose;
  };

  if (!reportData) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">
          {loading ? 'Gerando relatório RAT...' : 'Carregando relatório...'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Relatório RAT - Registro de Atividades de Tratamento
          </h1>
          <p className="text-muted-foreground">
            Relatório oficial conforme Art. 37 da LGPD
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Filters and Options */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Opções do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Select onValueChange={(value) => setReportFormat(value as any)} value={reportFormat}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Formato do Relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detalhado</SelectItem>
                  <SelectItem value="summary">Resumo Executivo</SelectItem>
                  <SelectItem value="audit">Auditoria</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="suspended">Suspensas</SelectItem>
                  <SelectItem value="under_review">Em Revisão</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('department', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="TI">Tecnologia da Informação</SelectItem>
                  <SelectItem value="RH">Recursos Humanos</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Juridico">Jurídico</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleGenerateReport} disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Header */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              REGISTRO DE ATIVIDADES DE TRATAMENTO DE DADOS PESSOAIS
            </h2>
            <p className="text-lg text-muted-foreground">
              Conforme Art. 37 da Lei Geral de Proteção de Dados (LGPD)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Data de Geração</p>
                <p className="font-medium">
                  {new Date(reportData.summary.generated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Atividades</p>
                <p className="font-medium text-xl">{reportData.summary.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formato</p>
                <p className="font-medium capitalize">{reportFormat}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reportData.summary.active}</div>
              <div className="text-sm text-muted-foreground">Ativas</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{reportData.summary.high_risk}</div>
              <div className="text-sm text-muted-foreground">Alto Risco</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{reportData.summary.with_international_transfer}</div>
              <div className="text-sm text-muted-foreground">Transf. Internacional</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{reportData.summary.suspended}</div>
              <div className="text-sm text-muted-foreground">Suspensas</div>
            </div>
          </div>

          {reportData.summary.high_risk > 0 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Atenção:</strong> {reportData.summary.high_risk} atividade(s) de alto risco identificada(s). 
                Recomenda-se a elaboração de Relatório de Impacto à Proteção de Dados (DPIA/RIPD).
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Activities by Department */}
      {Object.keys(reportData.summary.by_department).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Distribuição por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(reportData.summary.by_department).map(([department, count]) => (
                <div key={department} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{department}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Activities List */}
      {reportFormat === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Atividades de Tratamento Detalhadas
            </CardTitle>
            <CardDescription>
              Lista completa de todas as atividades de tratamento registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reportData.activities.map((activity, index) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {index + 1}. {activity.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                      {activity.is_high_risk && (
                        <Badge variant="destructive">Alto Risco</Badge>
                      )}
                      {activity.has_international_transfer && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Transf. Internacional
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Descrição:</strong> {activity.description}</p>
                      <p><strong>Finalidade:</strong> {getPurposeLabel(activity.purpose)}</p>
                      {activity.department && (
                        <p><strong>Departamento:</strong> {activity.department}</p>
                      )}
                      {activity.data_controller && (
                        <p><strong>Controlador:</strong> {activity.data_controller}</p>
                      )}
                    </div>

                    <div>
                      {activity.data_categories && activity.data_categories.length > 0 && (
                        <div>
                          <p><strong>Categorias de Dados:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activity.data_categories.map(category => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {activity.retention_period && (
                        <p className="mt-2"><strong>Prazo de Retenção:</strong> {activity.retention_period}</p>
                      )}

                      <p className="mt-2">
                        <strong>Criada em:</strong> {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {activity.legal_basis && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Base Legal:</strong> {activity.legal_basis.name} 
                        <Badge variant="outline" className="ml-2">
                          {activity.legal_basis.legal_basis_type}
                        </Badge>
                      </p>
                    </div>
                  )}

                  {index < reportData.activities.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Format */}
      {reportFormat === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Resumo das Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-2 text-left">Nome</th>
                    <th className="border border-gray-300 p-2 text-left">Departamento</th>
                    <th className="border border-gray-300 p-2 text-left">Finalidade</th>
                    <th className="border border-gray-300 p-2 text-left">Status</th>
                    <th className="border border-gray-300 p-2 text-left">Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="border border-gray-300 p-2">{activity.name}</td>
                      <td className="border border-gray-300 p-2">{activity.department || '-'}</td>
                      <td className="border border-gray-300 p-2">{getPurposeLabel(activity.purpose)}</td>
                      <td className="border border-gray-300 p-2">
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusLabel(activity.status)}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 p-2">
                        {activity.is_high_risk ? (
                          <Badge variant="destructive">Alto</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Este relatório foi gerado automaticamente pelo sistema de gestão LGPD
            </p>
            <p className="text-sm text-muted-foreground">
              Data de geração: {new Date(reportData.summary.generated_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Conforme Art. 37 da Lei nº 13.709/2018 (LGPD)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}