import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  Settings,
  Eye,
  FileSpreadsheet,
  Globe,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReportConfig {
  id?: string;
  name: string;
  description: string;
  report_type: string;
  filters: {
    date_range: {
      start: Date;
      end: Date;
    };
    risk_categories: string[];
    risk_levels: string[];
    status: string[];
    departments: string[];
    assigned_users: string[];
  };
  sections: {
    executive_summary: boolean;
    risk_overview: boolean;
    detailed_analysis: boolean;
    mitigation_status: boolean;
    compliance_status: boolean;
    recommendations: boolean;
    appendices: boolean;
  };
  format: string;
  schedule: {
    enabled: boolean;
    frequency: string;
    recipients: string[];
  };
  created_by: string;
  created_at: string;
}

interface RiskMetrics {
  total_risks: number;
  by_level: Record<string, number>;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  trend_data: {
    period: string;
    new_risks: number;
    closed_risks: number;
    total_risks: number;
  }[];
  top_risks: any[];
  overdue_actions: number;
  compliance_score: number;
}

const REPORT_TYPES = {
  executive: {
    name: 'Relatório Executivo',
    description: 'Visão estratégica para alta liderança',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-800'
  },
  operational: {
    name: 'Relatório Operacional',
    description: 'Detalhes operacionais e planos de ação',
    icon: Settings,
    color: 'bg-blue-100 text-blue-800'
  },
  compliance: {
    name: 'Relatório de Compliance',
    description: 'Status de conformidade regulatória',
    icon: Shield,
    color: 'bg-green-100 text-green-800'
  },
  risk_register: {
    name: 'Registro de Riscos',
    description: 'Inventário completo de riscos',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800'
  },
  dashboard: {
    name: 'Dashboard Analítico',
    description: 'Métricas e KPIs visuais',
    icon: BarChart3,
    color: 'bg-indigo-100 text-indigo-800'
  }
};

const EXPORT_FORMATS = {
  pdf: { name: 'PDF', icon: FileText, description: 'Documento formatado para impressão' },
  docx: { name: 'Word', icon: FileText, description: 'Documento editável do Microsoft Word' },
  xlsx: { name: 'Excel', icon: FileSpreadsheet, description: 'Planilha com dados e gráficos' },
  txt: { name: 'Texto', icon: FileText, description: 'Arquivo de texto simples' },
  xml: { name: 'XML', icon: FileText, description: 'Dados estruturados em XML' },
  html: { name: 'HTML', icon: Globe, description: 'Página web interativa' }
};

export const RiskReports: React.FC = () => {
  const [reportConfigs, setReportConfigs] = useState<ReportConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    report_type: 'executive',
    filters: {
      date_range: {
        start: subMonths(new Date(), 3),
        end: new Date()
      },
      risk_categories: [],
      risk_levels: [],
      status: [],
      departments: [],
      assigned_users: []
    },
    sections: {
      executive_summary: true,
      risk_overview: true,
      detailed_analysis: false,
      mitigation_status: true,
      compliance_status: false,
      recommendations: true,
      appendices: false
    },
    format: 'pdf',
    schedule: {
      enabled: false,
      frequency: 'monthly',
      recipients: []
    },
    created_by: '',
    created_at: ''
  });
  
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReportConfigs();
    fetchMetrics();
  }, []);

  const fetchReportConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_report_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportConfigs(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Buscar dados de riscos
      const { data: risks, error: risksError } = await supabase
        .from('risk_assessments')
        .select('*');

      if (risksError) throw risksError;

      // Calcular métricas
      const totalRisks = risks?.length || 0;
      
      const byLevel = risks?.reduce((acc: Record<string, number>, risk) => {
        acc[risk.risk_level] = (acc[risk.risk_level] || 0) + 1;
        return acc;
      }, {}) || {};

      const byCategory = risks?.reduce((acc: Record<string, number>, risk) => {
        acc[risk.risk_category] = (acc[risk.risk_category] || 0) + 1;
        return acc;
      }, {}) || {};

      const byStatus = risks?.reduce((acc: Record<string, number>, risk) => {
        acc[risk.status] = (acc[risk.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Buscar ações em atraso
      const { data: overdueActions } = await supabase
        .from('risk_action_activities')
        .select('*')
        .lt('deadline', new Date().toISOString())
        .neq('status', 'Concluída');

      setMetrics({
        total_risks: totalRisks,
        by_level: byLevel,
        by_category: byCategory,
        by_status: byStatus,
        trend_data: [], // Implementar cálculo de tendências
        top_risks: risks?.slice(0, 10) || [],
        overdue_actions: overdueActions?.length || 0,
        compliance_score: 85 // Implementar cálculo real
      });
    } catch (error: any) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    
    try {
      // Aqui você implementaria a geração real do relatório
      // Por enquanto, vamos simular o processo
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular download do arquivo
      const blob = new Blob(['Relatório de Riscos Simulado'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-riscos-${format(new Date(), 'yyyy-MM-dd')}.${currentConfig.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Relatório Gerado',
        description: `Relatório ${currentConfig.report_type} gerado com sucesso`,
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao gerar relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReportConfig = async () => {
    try {
      const configData = {
        ...currentConfig,
        created_by: user?.id,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('risk_report_configs')
        .insert([configData]);

      if (error) throw error;

      toast({
        title: 'Configuração Salva',
        description: 'Template de relatório salvo com sucesso',
      });

      fetchReportConfigs();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configuração',
        variant: 'destructive',
      });
    }
  };

  const loadTemplate = (config: ReportConfig) => {
    setCurrentConfig(config);
    setSelectedTemplate(config.id || '');
  };

  const scheduleReport = async () => {
    try {
      // Implementar agendamento de relatórios
      toast({
        title: 'Relatório Agendado',
        description: `Relatório agendado para ${currentConfig.schedule.frequency}`,
      });
    } catch (error: any) {
      console.error('Erro ao agendar relatório:', error);
    }
  };

  const formatMetricValue = (value: number, type: string = 'number') => {
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span>Relatórios de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gere relatórios executivos, operacionais e de compliance em múltiplos formatos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Sair da Prévia' : 'Prévia'}
          </Button>
          
          <Button variant="outline" onClick={saveReportConfig}>
            <Settings className="h-4 w-4 mr-2" />
            Salvar Template
          </Button>
          
          <Button onClick={generateReport} disabled={loading}>
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Riscos</p>
                  <p className="text-2xl font-bold">{metrics.total_risks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                  <p className="text-2xl font-bold">{metrics.by_level['Alto'] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ações Atrasadas</p>
                  <p className="text-2xl font-bold">{metrics.overdue_actions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{formatMetricValue(metrics.compliance_score, 'percentage')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                  <p className="text-2xl font-bold">{metrics.by_status['in_progress'] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mitigados</p>
                  <p className="text-2xl font-bold">{metrics.by_status['mitigated'] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="filters">Filtros</TabsTrigger>
                  <TabsTrigger value="sections">Seções</TabsTrigger>
                  <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="report_name">Nome do Relatório</Label>
                      <Input
                        id="report_name"
                        value={currentConfig.name}
                        onChange={(e) => setCurrentConfig({
                          ...currentConfig,
                          name: e.target.value
                        })}
                        placeholder="Ex: Relatório Mensal de Riscos"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="report_type">Tipo de Relatório</Label>
                      <Select
                        value={currentConfig.report_type}
                        onValueChange={(value) => setCurrentConfig({
                          ...currentConfig,
                          report_type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(REPORT_TYPES).map(([key, type]) => (
                            <SelectItem key={key} value={key}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={currentConfig.description}
                        onChange={(e) => setCurrentConfig({
                          ...currentConfig,
                          description: e.target.value
                        })}
                        placeholder="Descreva o propósito e escopo do relatório..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="format">Formato de Exportação</Label>
                      <Select
                        value={currentConfig.format}
                        onValueChange={(value) => setCurrentConfig({
                          ...currentConfig,
                          format: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <format.icon className="h-4 w-4" />
                                <span>{format.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sections" className="space-y-4">
                  <div className="space-y-3">
                    <Label>Seções do Relatório</Label>
                    <div className="space-y-2">
                      {Object.entries(currentConfig.sections).map(([section, enabled]) => (
                        <div key={section} className="flex items-center space-x-2">
                          <Checkbox
                            id={section}
                            checked={enabled}
                            onCheckedChange={(checked) => setCurrentConfig({
                              ...currentConfig,
                              sections: {
                                ...currentConfig.sections,
                                [section]: checked as boolean
                              }
                            })}
                          />
                          <Label htmlFor={section} className="capitalize">
                            {section.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="schedule_enabled"
                        checked={currentConfig.schedule.enabled}
                        onCheckedChange={(checked) => setCurrentConfig({
                          ...currentConfig,
                          schedule: {
                            ...currentConfig.schedule,
                            enabled: checked as boolean
                          }
                        })}
                      />
                      <Label htmlFor="schedule_enabled">Agendar relatório automático</Label>
                    </div>
                    
                    {currentConfig.schedule.enabled && (
                      <>
                        <div>
                          <Label htmlFor="frequency">Frequência</Label>
                          <Select
                            value={currentConfig.schedule.frequency}
                            onValueChange={(value) => setCurrentConfig({
                              ...currentConfig,
                              schedule: {
                                ...currentConfig.schedule,
                                frequency: value
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button onClick={scheduleReport} className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          Agendar Relatório
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Templates and Preview */}
        <div className="space-y-6">
          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Templates Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportConfigs.slice(0, 5).map((config) => (
                  <div 
                    key={config.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === config.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => loadTemplate(config)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{config.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {REPORT_TYPES[config.report_type]?.name} • {config.format.toUpperCase()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(config.created_at), 'dd/MM', { locale: ptBR })}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {reportConfigs.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Nenhum template salvo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Types */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(REPORT_TYPES).map(([key, type]) => {
                  const Icon = type.icon;
                  return (
                    <div 
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        currentConfig.report_type === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentConfig({
                        ...currentConfig,
                        report_type: key
                      })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{type.name}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Export Formats */}
          <Card>
            <CardHeader>
              <CardTitle>Formatos de Exportação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(EXPORT_FORMATS).map(([key, format]) => {
                  const Icon = format.icon;
                  return (
                    <div 
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                        currentConfig.format === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentConfig({
                        ...currentConfig,
                        format: key
                      })}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">{format.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};