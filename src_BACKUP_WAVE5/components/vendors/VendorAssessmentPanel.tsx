import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileCheck, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit2,
  Trash2,
  Target,
  Shield,
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  Award,
  Zap,
  AlertTriangle,
  Activity,
  Star,
  X,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VendorAssessment {
  id: string;
  vendor_id: string;
  title: string;
  assessment_type: string;
  status: string;
  overall_score?: number;
  risk_level?: string;
  completed_at?: string;
  created_at: string;
  planned_start_date?: string;
  planned_completion_date?: string;
  lead_assessor?: string;
  assessors?: string[];
  scope_description?: string;
}

interface VendorAssessmentPanelProps {
  vendors: any[];
  assessments: VendorAssessment[];
  onCreateAssessment: (data: any) => void;
}

const VendorAssessmentPanel = ({ 
  vendors, 
  assessments, 
  onCreateAssessment 
}: VendorAssessmentPanelProps) => {
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newAssessment, setNewAssessment] = useState({
    vendor_id: '',
    title: '',
    assessment_type: 'Risk Assessment',
    scope_description: '',
    planned_start_date: '',
    planned_completion_date: '',
    lead_assessor: '',
    assessors: [] as string[]
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const assessmentTypes = [
    { value: 'Initial Due Diligence', label: 'Due Diligence Inicial', icon: Shield },
    { value: 'Periodic Review', label: 'Revisão Periódica', icon: Clock },
    { value: 'Risk Assessment', label: 'Avaliação de Riscos', icon: AlertTriangle },
    { value: 'Security Assessment', label: 'Avaliação de Segurança', icon: Shield },
    { value: 'Compliance Assessment', label: 'Avaliação de Conformidade', icon: FileCheck },
    { value: 'Financial Assessment', label: 'Avaliação Financeira', icon: TrendingUp },
    { value: 'Performance Review', label: 'Revisão de Performance', icon: Target },
    { value: 'Business Continuity Assessment', label: 'Avaliação de Continuidade', icon: Activity },
    { value: 'Privacy Assessment', label: 'Avaliação de Privacidade', icon: Lock },
    { value: 'Incident Review', label: 'Revisão de Incidentes', icon: Zap }
  ];

  const statusOptions = [
    { value: 'Not Started', label: 'Não Iniciado', color: 'bg-gray-100 text-gray-800', icon: Clock },
    { value: 'In Progress', label: 'Em Progresso', color: 'bg-blue-100 text-blue-800', icon: Activity },
    { value: 'Completed', label: 'Concluído', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'Under Review', label: 'Em Revisão', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
    { value: 'Approved', label: 'Aprovado', color: 'bg-purple-100 text-purple-800', icon: Award },
    { value: 'Requires Remediation', label: 'Requer Remediação', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    { value: 'Failed', label: 'Falhado', color: 'bg-red-100 text-red-800', icon: X },
    { value: 'Expired', label: 'Expirado', color: 'bg-gray-100 text-gray-600', icon: Clock },
    { value: 'Overdue', label: 'Atrasado', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  ];

  const handleInputChange = (field: string, value: any) => {
    setNewAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    if (field === 'start') {
      setStartDate(date);
      handleInputChange('planned_start_date', date.toISOString());
    } else {
      setEndDate(date);
      handleInputChange('planned_completion_date', date.toISOString());
    }
  };

  const handleSubmit = () => {
    onCreateAssessment(newAssessment);
    setNewAssessment({
      vendor_id: '',
      title: '',
      assessment_type: 'Risk Assessment',
      scope_description: '',
      planned_start_date: '',
      planned_completion_date: '',
      lead_assessor: '',
      assessors: []
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setIsNewAssessmentOpen(false);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.assessment_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'in_progress') return matchesSearch && assessment.status === 'In Progress';
    if (activeTab === 'completed') return matchesSearch && assessment.status === 'Completed';
    if (activeTab === 'overdue') return matchesSearch && assessment.status === 'Overdue';
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.icon : AlertCircle;
  };

  const getTypeIcon = (type: string) => {
    const typeObj = assessmentTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : FileCheck;
  };

  const getRiskLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    
    switch (level.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Métricas dos assessments
  const metrics = {
    total: assessments.length,
    inProgress: assessments.filter(a => a.status === 'In Progress').length,
    completed: assessments.filter(a => a.status === 'Completed').length,
    overdue: assessments.filter(a => a.status === 'Overdue').length,
    avgScore: assessments.filter(a => a.overall_score).length > 0
      ? Math.round(assessments.filter(a => a.overall_score).reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessments.filter(a => a.overall_score).length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <FileCheck className="h-5 w-5 text-blue-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-orange-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-lg font-bold">{metrics.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Concluídos</p>
                <p className="text-lg font-bold">{metrics.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Atrasados</p>
                <p className="text-lg font-bold">{metrics.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Score Médio</p>
                <p className={`text-lg font-bold ${getScoreColor(metrics.avgScore)}`}>
                  {metrics.avgScore > 0 ? `${metrics.avgScore}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              
              <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Assessment de Fornecedor</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informações Básicas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Fornecedor *</Label>
                            <Select 
                              value={newAssessment.vendor_id} 
                              onValueChange={(value) => handleInputChange('vendor_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar fornecedor" />
                              </SelectTrigger>
                              <SelectContent>
                                {vendors.map((vendor) => (
                                  <SelectItem key={vendor.id} value={vendor.id}>
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4" />
                                      {vendor.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo de Assessment *</Label>
                            <Select 
                              value={newAssessment.assessment_type} 
                              onValueChange={(value) => handleInputChange('assessment_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {assessmentTypes.map((type) => {
                                  const IconComponent = type.icon;
                                  return (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Título do Assessment *</Label>
                          <Input
                            value={newAssessment.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Ex: Avaliação de Riscos de Segurança - Q1 2024"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Descrição do Escopo</Label>
                          <Textarea
                            value={newAssessment.scope_description}
                            onChange={(e) => handleInputChange('scope_description', e.target.value)}
                            placeholder="Descreva o escopo e objetivos do assessment..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cronograma */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Cronograma</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data Início Planejada</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={startDate}
                                  onSelect={(date) => handleDateChange('start', date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>Data Conclusão Planejada</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={(date) => handleDateChange('end', date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsNewAssessmentOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSubmit}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Assessment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos ({assessments.length})</TabsTrigger>
              <TabsTrigger value="in_progress">Em Progresso ({metrics.inProgress})</TabsTrigger>
              <TabsTrigger value="completed">Concluídos ({metrics.completed})</TabsTrigger>
              <TabsTrigger value="overdue">Atrasados ({metrics.overdue})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Nenhum assessment encontrado
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === 'all' 
                      ? 'Comece criando seu primeiro assessment de fornecedor.'
                      : `Nenhum assessment encontrado para o filtro "${activeTab}".`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAssessments.map((assessment) => {
                    const TypeIcon = getTypeIcon(assessment.assessment_type);
                    const StatusIcon = getStatusIcon(assessment.status);
                    const selectedVendor = vendors.find(v => v.id === assessment.vendor_id);
                    
                    return (
                      <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="flex-shrink-0">
                                <TypeIcon className="h-8 w-8 text-blue-500" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-medium truncate">
                                    {assessment.title}
                                  </h3>
                                  <Badge className={`text-xs ${getStatusColor(assessment.status)}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusOptions.find(s => s.value === assessment.status)?.label || assessment.status}
                                  </Badge>
                                  {assessment.risk_level && (
                                    <Badge className={`text-xs ${getRiskLevelColor(assessment.risk_level)}`}>
                                      {assessment.risk_level}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{selectedVendor?.name || 'Fornecedor não encontrado'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {formatDistanceToNow(new Date(assessment.created_at), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {assessmentTypes.find(t => t.value === assessment.assessment_type)?.label || assessment.assessment_type}
                                  </Badge>
                                </div>
                                
                                {assessment.scope_description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {assessment.scope_description}
                                  </p>
                                )}

                                {assessment.overall_score && (
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium">Score:</span>
                                    <div className="flex items-center space-x-2">
                                      <Progress value={assessment.overall_score} className="w-24 h-2" />
                                      <span className={`text-sm font-bold ${getScoreColor(assessment.overall_score)}`}>
                                        {assessment.overall_score}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAssessmentPanel;