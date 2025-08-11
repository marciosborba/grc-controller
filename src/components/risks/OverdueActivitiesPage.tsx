import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Search,
  Download,
  FileText,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Target,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface OverdueActivity {
  id: string;
  description: string;
  responsible_person: string;
  deadline: string;
  status: string;
  evidence_url: string | null;
  evidence_description: string | null;
  risk_title: string;
  risk_id: string;
  risk_category: string;
  risk_level: string;
  action_plan_id: string;
  treatment_type: string;
  days_overdue: number;
}

const getRiskLevelColor = (level: string): string => {
  const colors = {
    'Muito Baixo': 'bg-green-100 text-green-800',
    'Baixo': 'bg-green-100 text-green-800',
    'Médio': 'bg-yellow-100 text-yellow-800',
    'Alto': 'bg-orange-100 text-orange-800',
    'Muito Alto': 'bg-red-100 text-red-800',
    'Crítico': 'bg-red-100 text-red-800'
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string): string => {
  const colors = {
    'Pendente': 'bg-gray-100 text-gray-800',
    'Em Progresso': 'bg-yellow-100 text-yellow-800',
    'Concluído': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const OverdueActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [activities, setActivities] = useState<OverdueActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - atividades vencidas
  useEffect(() => {
    const mockActivities: OverdueActivity[] = [
      {
        id: '1',
        description: 'Configurar servidor de backup secundário',
        responsible_person: 'João Silva',
        deadline: '2024-08-01',
        status: 'Em Progresso',
        evidence_url: null,
        evidence_description: null,
        risk_title: 'Falha no Sistema de Backup',
        risk_id: '1',
        risk_category: 'Tecnológico',
        risk_level: 'Alto',
        action_plan_id: '1',
        treatment_type: 'Mitigar',
        days_overdue: 8
      },
      {
        id: '2',
        description: 'Implementar firewall de aplicação web',
        responsible_person: 'Ana Costa',
        deadline: '2024-07-15',
        status: 'Pendente',
        evidence_url: null,
        evidence_description: null,
        risk_title: 'Vazamento de Dados Pessoais',
        risk_id: '2',
        risk_category: 'Segurança da Informação',
        risk_level: 'Crítico',
        action_plan_id: '2',
        treatment_type: 'Mitigar',
        days_overdue: 25
      },
      {
        id: '3',
        description: 'Revisar contratos com fornecedores críticos',
        responsible_person: 'Pedro Oliveira',
        deadline: '2024-07-30',
        status: 'Em Progresso',
        evidence_url: null,
        evidence_description: null,
        risk_title: 'Interrupção de Fornecedor Crítico',
        risk_id: '3',
        risk_category: 'Operacional',
        risk_level: 'Médio',
        action_plan_id: '3',
        treatment_type: 'Transferir',
        days_overdue: 10
      },
      {
        id: '4',
        description: 'Atualizar política de backup',
        responsible_person: 'Maria Santos',
        deadline: '2024-06-20',
        status: 'Em Progresso',
        evidence_url: null,
        evidence_description: null,
        risk_title: 'Falha no Sistema de Backup',
        risk_id: '1',
        risk_category: 'Tecnológico',
        risk_level: 'Alto',
        action_plan_id: '1',
        treatment_type: 'Mitigar',
        days_overdue: 50
      }
    ];

    setActivities(mockActivities);
    setIsLoading(false);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.risk_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.responsible_person.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = riskLevelFilter === 'all' || activity.risk_level === riskLevelFilter;
    const matchesCategory = categoryFilter === 'all' || activity.risk_category === categoryFilter;
    const matchesResponsible = responsibleFilter === 'all' || activity.responsible_person === responsibleFilter;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesResponsible;
  });

  const categories = [...new Set(activities.map(a => a.risk_category))];
  const responsibles = [...new Set(activities.map(a => a.responsible_person))];

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalOverdueActivities: filteredActivities.length,
      activitiesByRiskLevel: {
        'Crítico': filteredActivities.filter(a => a.risk_level === 'Crítico').length,
        'Alto': filteredActivities.filter(a => a.risk_level === 'Alto').length,
        'Médio': filteredActivities.filter(a => a.risk_level === 'Médio').length,
        'Baixo': filteredActivities.filter(a => a.risk_level === 'Baixo').length,
      },
      activitiesByCategory: categories.reduce((acc, cat) => {
        acc[cat] = filteredActivities.filter(a => a.risk_category === cat).length;
        return acc;
      }, {} as Record<string, number>),
      activities: filteredActivities
    };

    // Simular download do relatório
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atividades-vencidas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório Gerado",
      description: "Relatório de atividades vencidas foi baixado com sucesso.",
    });
  };

  const handleActivityClick = (riskId: string) => {
    navigate(`/risks?highlight=${riskId}`);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando atividades vencidas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/risks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Gestão de Riscos
        </Button>
        <div className="flex-1">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            Atividades Vencidas
          </h1>
          <p className="text-muted-foreground">
            Atividades de planos de ação com prazo vencido
          </p>
        </div>
        <Button onClick={generateReport} className="h-8 text-xs">
          <Download className="h-3 w-3 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vencidas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activities.length}</div>
            <p className="text-xs text-muted-foreground">atividades em atraso</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activities.filter(a => a.risk_level === 'Crítico').length}
            </div>
            <p className="text-xs text-muted-foreground">risco crítico</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Atrasada</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...activities.map(a => a.days_overdue))}
            </div>
            <p className="text-xs text-muted-foreground">dias em atraso</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responsibles.length}
            </div>
            <p className="text-xs text-muted-foreground">pessoas envolvidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-5'}`}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Baixo">Baixo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Responsáveis</SelectItem>
                {responsibles.map(responsible => (
                  <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Atividades Vencidas ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Risco Associado</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Atraso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nível</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? 'Nenhuma atividade encontrada.' : 'Não há atividades vencidas.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow 
                      key={activity.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleActivityClick(activity.risk_id)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.treatment_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{activity.risk_title}</div>
                          <Badge variant="secondary" className="text-xs">
                            {activity.risk_category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {activity.responsible_person}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(activity.deadline).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          {activity.days_overdue} dias
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(activity.risk_level)}>
                          {activity.risk_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverdueActivitiesPage;