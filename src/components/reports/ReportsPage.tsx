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

      downloadReport(data, `relatorio-${selectedModule}`);
      
      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso!",
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

  const downloadReport = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <span>{isLoading ? 'Gerando...' : 'Gerar Relatório'}</span>
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