import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssessments, Framework } from '@/hooks/useAssessments';

interface FrameworkControl {
  id: string;
  control_code: string;
  control_text: string;
  domain: string;
  control_reference?: string;
}

interface ControlEvaluation {
  control_id: string;
  maturity_level: number | null;
  implementation_notes: string;
  evidence_description: string;
  recommendations: string;
}

const FrameworkEvaluationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { frameworks } = useAssessments();
  const isMobile = useIsMobile();
  
  const [framework, setFramework] = useState<Framework | null>(null);
  const [controls, setControls] = useState<FrameworkControl[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, ControlEvaluation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (frameworks.length > 0 && id) {
      const foundFramework = frameworks.find(f => f.id === id);
      setFramework(foundFramework || null);
    }
  }, [frameworks, id]);

  useEffect(() => {
    if (id) {
      fetchControls();
    }
  }, [id]);

  const fetchControls = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('framework_controls')
        .select('*')
        .eq('framework_id', id)
        .order('control_code');

      if (error) throw error;
      setControls(data || []);
      
      // Initialize evaluations
      const initialEvaluations: Record<string, ControlEvaluation> = {};
      data?.forEach(control => {
        initialEvaluations[control.id] = {
          control_id: control.id,
          maturity_level: null,
          implementation_notes: '',
          evidence_description: '',
          recommendations: ''
        };
      });
      setEvaluations(initialEvaluations);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar controles do framework.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvaluation = (controlId: string, field: keyof ControlEvaluation, value: any) => {
    setEvaluations(prev => ({
      ...prev,
      [controlId]: {
        ...prev[controlId],
        [field]: value
      }
    }));
  };

  const getMaturityLevelText = (level: number | null) => {
    const levels = {
      1: 'Inexistente',
      2: 'Ad Hoc',
      3: 'Definido', 
      4: 'Gerenciado',
      5: 'Otimizado'
    };
    return level ? levels[level as keyof typeof levels] : 'Não avaliado';
  };

  const getMaturityLevelColor = (level: number | null) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-green-100 text-green-800'
    };
    return level ? colors[level as keyof typeof colors] : 'bg-gray-100 text-gray-800';
  };

  const calculateProgress = () => {
    const totalControls = controls.length;
    const evaluatedControls = Object.values(evaluations).filter(e => e.maturity_level !== null).length;
    return totalControls > 0 ? Math.round((evaluatedControls / totalControls) * 100) : 0;
  };

  const calculateAverageMaturity = () => {
    const evaluatedLevels = Object.values(evaluations)
      .map(e => e.maturity_level)
      .filter((level): level is number => level !== null);
    
    if (evaluatedLevels.length === 0) return 0;
    return Math.round((evaluatedLevels.reduce((sum, level) => sum + level, 0) / evaluatedLevels.length) * 10) / 10;
  };

  const exportEvaluation = () => {
    const csvContent = [
      'Código,Controle,Domínio,Nível de Maturidade,Notas de Implementação,Descrição da Evidência,Recomendações',
      ...controls.map(control => {
        const evaluation = evaluations[control.id];
        return [
          control.control_code,
          `"${control.control_text.replace(/"/g, '""')}"`,
          control.domain,
          evaluation.maturity_level || 'Não avaliado',
          `"${evaluation.implementation_notes.replace(/"/g, '""')}"`,
          `"${evaluation.evidence_description.replace(/"/g, '""')}"`,
          `"${evaluation.recommendations.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `avaliacao_${framework?.short_name || 'framework'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Sucesso',
      description: 'Avaliação exportada com sucesso.',
    });
  };

  if (!framework || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = calculateProgress();
  const averageMaturity = calculateAverageMaturity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/assessments/frameworks/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Avaliação: {framework.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">{framework.short_name}</Badge>
            <Badge variant="outline">{framework.category}</Badge>
            <Badge>v{framework.version}</Badge>
          </div>
        </div>
        <Button
          onClick={exportEvaluation}
          className="flex items-center gap-2"
          size={isMobile ? "sm" : "default"}
        >
          <Download className="h-4 w-4" />
          {!isMobile && 'Exportar Avaliação'}
        </Button>
      </div>

      {/* Progress Overview */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso da Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Object.values(evaluations).filter(e => e.maturity_level !== null).length} de {controls.length} controles avaliados
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maturidade Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMaturity}</div>
            <p className="text-xs text-muted-foreground">
              {averageMaturity > 0 ? getMaturityLevelText(Math.round(averageMaturity)) : 'Não calculado'}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Controles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controls.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Set(controls.map(c => c.domain)).size} domínios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Avaliação dos Controles</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-2" : "p-0"}>
          <div className={isMobile ? "overflow-x-auto" : ""}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Controle</TableHead>
                  {!isMobile && <TableHead>Domínio</TableHead>}
                  <TableHead>Maturidade</TableHead>
                  {!isMobile && <TableHead>Notas</TableHead>}
                  {!isMobile && <TableHead>Evidências</TableHead>}
                  {!isMobile && <TableHead>Recomendações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {controls.map((control) => {
                  const evaluation = evaluations[control.id];
                  return (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">
                        {control.control_code}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          {control.control_text.length > 100 
                            ? `${control.control_text.substring(0, 100)}...`
                            : control.control_text
                          }
                        </div>
                        {isMobile && (
                          <div className="mt-2 space-y-2">
                            <Badge variant="outline" className="text-xs">
                              {control.domain}
                            </Badge>
                            <Textarea
                              value={evaluation.implementation_notes}
                              onChange={(e) => updateEvaluation(control.id, 'implementation_notes', e.target.value)}
                              placeholder="Notas de implementação..."
                              className="min-h-[60px] text-xs"
                              disabled={isSaving}
                            />
                            <Textarea
                              value={evaluation.evidence_description}
                              onChange={(e) => updateEvaluation(control.id, 'evidence_description', e.target.value)}
                              placeholder="Descrição das evidências..."
                              className="min-h-[60px] text-xs"
                              disabled={isSaving}
                            />
                            <Textarea
                              value={evaluation.recommendations}
                              onChange={(e) => updateEvaluation(control.id, 'recommendations', e.target.value)}
                              placeholder="Recomendações..."
                              className="min-h-[60px] text-xs"
                              disabled={isSaving}
                            />
                          </div>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Badge variant="outline">{control.domain}</Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <Select
                          value={evaluation.maturity_level?.toString() || ''}
                          onValueChange={(value) => updateEvaluation(control.id, 'maturity_level', parseInt(value))}
                          disabled={isSaving}
                        >
                          <SelectTrigger className={isMobile ? "w-32" : "w-40"}>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Inexistente</SelectItem>
                            <SelectItem value="2">2 - Ad Hoc</SelectItem>
                            <SelectItem value="3">3 - Definido</SelectItem>
                            <SelectItem value="4">4 - Gerenciado</SelectItem>
                            <SelectItem value="5">5 - Otimizado</SelectItem>
                          </SelectContent>
                        </Select>
                        {evaluation.maturity_level && (
                          <Badge className={`mt-1 ${getMaturityLevelColor(evaluation.maturity_level)}`}>
                            {isMobile ? evaluation.maturity_level : getMaturityLevelText(evaluation.maturity_level)}
                          </Badge>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Textarea
                            value={evaluation.implementation_notes}
                            onChange={(e) => updateEvaluation(control.id, 'implementation_notes', e.target.value)}
                            placeholder="Notas de implementação..."
                            className="min-h-[60px]"
                            disabled={isSaving}
                          />
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          <Textarea
                            value={evaluation.evidence_description}
                            onChange={(e) => updateEvaluation(control.id, 'evidence_description', e.target.value)}
                            placeholder="Descrição das evidências..."
                            className="min-h-[60px]"
                            disabled={isSaving}
                          />
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          <Textarea
                            value={evaluation.recommendations}
                            onChange={(e) => updateEvaluation(control.id, 'recommendations', e.target.value)}
                            placeholder="Recomendações..."
                            className="min-h-[60px]"
                            disabled={isSaving}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrameworkEvaluationPage;