import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Assessment, AssessmentFramework } from '@/types/assessment';
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  BarChart3, 
  PieChart, 
  Target,
  Calendar,
  Filter,
  Share
} from 'lucide-react';

interface AssessmentReportsProps {
  assessments: Assessment[];
  frameworks: AssessmentFramework[];
}

export function AssessmentReports({ assessments, frameworks }: AssessmentReportsProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');

  const reportTypes = [
    {
      id: 'executive_summary',
      title: 'Relatório Executivo',
      description: 'Visão geral para alta gestão com métricas principais',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      id: 'detailed_assessment',
      title: 'Relatório Detalhado de Assessment',
      description: 'Análise completa de um assessment específico',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'maturity_analysis',
      title: 'Análise de Maturidade',
      description: 'Comparativo de níveis de maturidade por framework',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      id: 'gaps_report',
      title: 'Relatório de Gaps',
      description: 'Identificação e priorização de lacunas',
      icon: PieChart,
      color: 'text-orange-600'
    },
    {
      id: 'action_plans',
      title: 'Planos de Ação',
      description: 'Status e progresso dos planos de melhoria',
      icon: Calendar,
      color: 'text-red-600'
    },
    {
      id: 'compliance_dashboard',
      title: 'Dashboard de Compliance',
      description: 'Painel interativo de conformidade',
      icon: BarChart3,
      color: 'text-cyan-600'
    }
  ];

  const filteredAssessments = assessments.filter(assessment => {
    const frameworkMatch = selectedFramework === 'all' || assessment.framework_id === selectedFramework;
    
    let periodMatch = true;
    if (selectedPeriod !== 'all' && assessment.created_at) {
      const assessmentDate = new Date(assessment.created_at);
      const now = new Date();
      
      switch (selectedPeriod) {
        case '30_days':
          periodMatch = (now.getTime() - assessmentDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
          break;
        case '90_days':
          periodMatch = (now.getTime() - assessmentDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
          break;
        case '1_year':
          periodMatch = (now.getTime() - assessmentDate.getTime()) <= (365 * 24 * 60 * 60 * 1000);
          break;
      }
    }
    
    return frameworkMatch && periodMatch;
  });

  const generateSampleReport = (reportType: string) => {
    // Simular geração de relatório
    console.log(`Gerando relatório: ${reportType} para ${filteredAssessments.length} assessments`);
    setReportDialogOpen(false);
    // Aqui você implementaria a lógica real de geração de relatórios
  };

  const exportFormats = [
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'excel', label: 'Excel', icon: BarChart3 },
    { id: 'powerpoint', label: 'PowerPoint', icon: PieChart }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Relatórios e Exportações</h2>
        </div>
        
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerar Novo Relatório</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReportType === type.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedReportType(type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <type.icon className={`h-5 w-5 ${type.color} mt-0.5`} />
                        <div>
                          <h4 className="font-medium text-sm">{type.title}</h4>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Framework</label>
                  <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Frameworks</SelectItem>
                      {frameworks.map((fw) => (
                        <SelectItem key={fw.id} value={fw.id}>
                          {fw.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Períodos</SelectItem>
                      <SelectItem value="30_days">Últimos 30 dias</SelectItem>
                      <SelectItem value="90_days">Últimos 90 dias</SelectItem>
                      <SelectItem value="1_year">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Formato de Exportação</label>
                <div className="flex gap-2 mt-2">
                  {exportFormats.map((format) => (
                    <Button key={format.id} variant="outline" size="sm">
                      <format.icon className="h-4 w-4 mr-2" />
                      {format.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => generateSampleReport(selectedReportType)}
                  disabled={!selectedReportType}
                >
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros de Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Framework</label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Frameworks</SelectItem>
                  {frameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>
                      {fw.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                  <SelectItem value="30_days">Últimos 30 dias</SelectItem>
                  <SelectItem value="90_days">Últimos 90 dias</SelectItem>
                  <SelectItem value="1_year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Badge variant="outline" className="mb-1">
                {filteredAssessments.length} assessments selecionados
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <type.icon className={`h-5 w-5 ${type.color}`} />
                {type.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {type.description}
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSelectedReportType(type.id);
                    setReportDialogOpen(true);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Gerar
                </Button>
                
                <Button variant="outline" size="sm">
                  <Printer className="h-3 w-3 mr-1" />
                  Imprimir
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share className="h-3 w-3 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'Relatório Executivo - Q4 2024',
                type: 'PDF',
                date: '2024-12-15',
                size: '2.3 MB',
                downloads: 12
              },
              {
                name: 'Análise de Maturidade ISO 27001',
                type: 'Excel',
                date: '2024-12-10',
                size: '1.8 MB',
                downloads: 8
              },
              {
                name: 'Dashboard de Compliance LGPD',
                type: 'PowerPoint',
                date: '2024-12-05',
                size: '5.1 MB',
                downloads: 15
              }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.size} • {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {report.downloads} downloads
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}