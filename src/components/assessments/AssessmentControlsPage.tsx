import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Filter,
  Edit3,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  BarChart3,
  User,
  Shield,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface Control {
  id: string;
  name: string;
  description: string;
  category: string;
  domain: string;
  response?: {
    id: string;
    assessee_response: string | null;
    answered_at: string | null;
    answered_by_user_id: string | null;
    auditor_maturity_level: number | null;
    auditor_comments: string | null;
    assessor_analysis: string | null;
  };
  evidence_count: number;
  maturity_level: number;
  status: 'pending' | 'answered' | 'reviewed' | 'approved';
}

const getMaturityLabel = (level: number): string => {
  const labels = {
    1: 'Inicial',
    2: 'Repetível', 
    3: 'Definido',
    4: 'Gerenciado',
    5: 'Otimizado'
  };
  return labels[level as keyof typeof labels] || 'N/A';
};

const getMaturityColor = (level: number): string => {
  const colors = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-blue-100 text-blue-800',
    5: 'bg-green-100 text-green-800'
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string): string => {
  const colors = {
    'pending': 'bg-gray-100 text-gray-800',
    'answered': 'bg-blue-100 text-blue-800',
    'reviewed': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status: string) => {
  const icons = {
    'pending': Clock,
    'answered': FileText,
    'reviewed': AlertCircle,
    'approved': CheckCircle
  };
  const Icon = icons[status as keyof typeof icons] || Clock;
  return <Icon className="h-3 w-3" />;
};

export const AssessmentControlsPage: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');
  const [expandedControls, setExpandedControls] = useState<Set<string>>(new Set());

  // Mock data
  useEffect(() => {
    const mockAssessment = {
      id: assessmentId,
      name: 'Assessment ISO 27001 - 2024',
      framework: { name: 'ISO 27001:2013', short_name: 'ISO27001' },
      status: 'Em Andamento',
      progress: 45,
      due_date: '2024-12-31',
      created_at: '2024-01-15'
    };

    const mockControls: Control[] = [
      {
        id: '1',
        name: 'A.5.1.1',
        description: 'Políticas para segurança da informação devem ser definidas, aprovadas pela direção e comunicadas',
        category: 'Organizacional',
        domain: 'Políticas de Segurança',
        evidence_count: 3,
        maturity_level: 3,
        status: 'approved',
        response: {
          id: '1',
          assessee_response: 'Possuímos política de segurança aprovada pela alta direção, publicada na intranet e comunicada através de treinamentos.',
          answered_at: '2024-08-01T10:00:00Z',
          answered_by_user_id: 'user-1',
          auditor_maturity_level: 3,
          auditor_comments: 'Política bem estruturada e comunicada. Processo de aprovação adequado.',
          assessor_analysis: 'Conforme com os requisitos. Sugere-se implementar métricas de efetividade.'
        }
      },
      {
        id: '2',
        name: 'A.5.1.2',
        description: 'Análise crítica das políticas para segurança da informação em intervalos planejados',
        category: 'Organizacional',
        domain: 'Políticas de Segurança',
        evidence_count: 1,
        maturity_level: 2,
        status: 'reviewed',
        response: {
          id: '2',
          assessee_response: 'Realizamos análise anual das políticas pelo comitê de segurança.',
          answered_at: '2024-08-02T14:30:00Z',
          answered_by_user_id: 'user-2',
          auditor_maturity_level: 2,
          auditor_comments: 'Processo existe mas pode ser formalizado melhor.',
          assessor_analysis: 'Necessita melhoria no processo de revisão e documentação.'
        }
      },
      {
        id: '3',
        name: 'A.6.1.1',
        description: 'Funções e responsabilidades para segurança da informação devem ser definidas e atribuídas',
        category: 'Organizacional',
        domain: 'Organização da Segurança',
        evidence_count: 0,
        maturity_level: 1,
        status: 'answered',
        response: {
          id: '3',
          assessee_response: 'Temos um responsável pela segurança designado informalmente.',
          answered_at: '2024-08-03T09:15:00Z',
          answered_by_user_id: 'user-1',
          auditor_maturity_level: null,
          auditor_comments: null,
          assessor_analysis: null
        }
      },
      {
        id: '4',
        name: 'A.7.1.1',
        description: 'Triagem de antecedentes deve ser realizada para todos os candidatos',
        category: 'Pessoas',
        domain: 'Recursos Humanos',
        evidence_count: 0,
        maturity_level: 0,
        status: 'pending'
      },
      {
        id: '5',
        name: 'A.8.1.1',
        description: 'Inventário dos ativos associados com informação e instalações de processamento',
        category: 'Ativos',
        domain: 'Gestão de Ativos',
        evidence_count: 2,
        maturity_level: 4,
        status: 'approved',
        response: {
          id: '5',
          assessee_response: 'Mantemos inventário completo e atualizado de todos os ativos com responsáveis definidos.',
          answered_at: '2024-07-30T16:20:00Z',
          answered_by_user_id: 'user-3',
          auditor_maturity_level: 4,
          auditor_comments: 'Excelente controle de ativos. Processo bem definido e automatizado.',
          assessor_analysis: 'Processo maduro com ferramentas adequadas. Pode evoluir para nível 5 com IA.'
        }
      }
    ];

    setAssessment(mockAssessment);
    setControls(mockControls);
    setIsLoading(false);
  }, [assessmentId]);

  const filteredControls = controls.filter(control => {
    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || control.status === statusFilter;
    const matchesDomain = domainFilter === 'all' || control.domain === domainFilter;
    const matchesMaturity = maturityFilter === 'all' || 
      (maturityFilter === '0' && control.maturity_level === 0) ||
      control.maturity_level.toString() === maturityFilter;
    
    return matchesSearch && matchesStatus && matchesDomain && matchesMaturity;
  });

  const domains = [...new Set(controls.map(c => c.domain))];
  const statusCounts = {
    total: controls.length,
    pending: controls.filter(c => c.status === 'pending').length,
    answered: controls.filter(c => c.status === 'answered').length,
    reviewed: controls.filter(c => c.status === 'reviewed').length,
    approved: controls.filter(c => c.status === 'approved').length
  };

  const avgMaturity = controls.filter(c => c.maturity_level > 0).length > 0 
    ? Math.round(controls.filter(c => c.maturity_level > 0)
        .reduce((acc, c) => acc + c.maturity_level, 0) / 
        controls.filter(c => c.maturity_level > 0).length * 10) / 10
    : 0;

  const handleControlAction = (controlId: string, action: 'respond' | 'review') => {
    if (action === 'respond') {
      navigate(`/assessments/${assessmentId}/controls/${controlId}/respond`);
    } else if (action === 'review') {
      navigate(`/assessments/${assessmentId}/controls/${controlId}/review`);
    }
  };

  const toggleExpanded = (controlId: string) => {
    setExpandedControls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(controlId)) {
        newSet.delete(controlId);
      } else {
        newSet.add(controlId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/assessments/manage')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{assessment?.name}</h1>
          <p className="text-sm text-muted-foreground">
            {assessment?.framework?.name} • {controls.length} controles
          </p>
        </div>
      </div>

      {/* KPIs Compactos */}
      <div className="grid gap-3 grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{statusCounts.total}</p>
            </div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Maturidade</p>
              <p className="text-lg font-bold">{avgMaturity}</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Aprovados</p>
              <p className="text-lg font-bold text-green-600">{statusCounts.approved}</p>
            </div>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-lg font-bold text-orange-600">{statusCounts.pending}</p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Filtros Compactos */}
      <Card className="p-3">
        <div className="grid gap-2 grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="answered">Respondidos</SelectItem>
              <SelectItem value="reviewed">Em Revisão</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Domínio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {domains.map(domain => (
                <SelectItem key={domain} value={domain}>{domain}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={maturityFilter} onValueChange={setMaturityFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Maturidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="0">N/A</SelectItem>
              <SelectItem value="1">Nível 1</SelectItem>
              <SelectItem value="2">Nível 2</SelectItem>
              <SelectItem value="3">Nível 3</SelectItem>
              <SelectItem value="4">Nível 4</SelectItem>
              <SelectItem value="5">Nível 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Controles Compacta */}
      <div className="space-y-2">
        {filteredControls.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum controle encontrado.' : 'Nenhum controle disponível.'}
            </p>
          </Card>
        ) : (
          filteredControls.map((control) => (
            <Card key={control.id} className="p-3">
              <Collapsible
                open={expandedControls.has(control.id)}
                onOpenChange={() => toggleExpanded(control.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Info Principal */}
                  <div className="flex-1 grid grid-cols-6 gap-2 items-center text-xs">
                    <div>
                      <div className="font-medium">{control.name}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {control.domain}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-xs line-clamp-2">{control.description}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center mb-1">
                        {getStatusIcon(control.status)}
                        <Badge className={`${getStatusColor(control.status)} text-xs`}>
                          {control.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      {control.maturity_level > 0 ? (
                        <Badge className={`${getMaturityColor(control.maturity_level)} text-xs`}>
                          {control.maturity_level} - {getMaturityLabel(control.maturity_level)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">N/A</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Upload className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{control.evidence_count}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 ml-2">
                    {(control.status === 'pending' || control.status === 'answered') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleControlAction(control.id, 'respond')}
                        className="h-7 px-2 text-xs"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Responder
                      </Button>
                    )}
                    {(control.status === 'answered' || control.status === 'reviewed') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleControlAction(control.id, 'review')}
                        className="h-7 px-2 text-xs"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Auditar
                      </Button>
                    )}
                    
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        {expandedControls.has(control.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent className="mt-3">
                  <Separator className="mb-3" />
                  
                  {control.response && (
                    <div className="space-y-3">
                      {/* Resposta do Auditado */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="text-xs font-medium">Resposta do Auditado:</span>
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          {control.response.assessee_response || 'Não respondido'}
                        </div>
                      </div>

                      {/* Comentários do Auditor */}
                      {control.response.auditor_comments && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-medium">Comentários do Auditor:</span>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded text-xs">
                            {control.response.auditor_comments}
                          </div>
                        </div>
                      )}

                      {/* Recomendações */}
                      {control.response.assessor_analysis && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs font-medium">Recomendações:</span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded text-xs">
                            {control.response.assessor_analysis}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};