import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssessments, Assessment } from '@/hooks/useAssessments';

interface AssessmentResponse {
  id: string;
  control_id: string;
  maturity_level: number | null;
  assessee_response: string | null;
  assessor_analysis: string | null;
  control: {
    control_code: string;
    control_text: string;
    domain: string;
  };
}

const AssessmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessments, isLoading } = useAssessments();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (assessments.length > 0 && id) {
      const foundAssessment = assessments.find(a => a.id === id);
      setAssessment(foundAssessment || null);
    }
  }, [assessments, id]);

  useEffect(() => {
    if (id) {
      fetchResponses();
    }
  }, [id]);

  const fetchResponses = async () => {
    try {
      setIsLoadingResponses(true);
      const { data, error } = await supabase
        .from('assessment_responses')
        .select(`
          *,
          control:framework_controls (
            control_code,
            control_text,
            domain
          )
        `)
        .eq('assessment_id', id)
        .order('control.control_code');

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar respostas do assessment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const updateResponse = async (responseId: string, field: string, value: any) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('assessment_responses')
        .update({ [field]: value, last_updated_by_user_id: (await supabase.auth.getUser()).data.user?.id })
        .eq('id', responseId);

      if (error) throw error;

      // Update local state
      setResponses(prev => prev.map(response => 
        response.id === responseId 
          ? { ...response, [field]: value }
          : response
      ));

      toast({
        title: 'Sucesso',
        description: 'Resposta atualizada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar resposta.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedResponses = responses.filter(r => r.maturity_level !== null).length;
  const totalResponses = responses.length;
  const progressPercentage = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/assessments')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{assessment.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">{assessment.framework?.short_name}</Badge>
            <Badge className={
              assessment.status === 'Concluído' ? 'bg-green-100 text-green-800' :
              assessment.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
              assessment.status === 'Em Revisão' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }>
              {assessment.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Progresso do Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">Progresso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedResponses}</div>
              <div className="text-sm text-muted-foreground">Controles Avaliados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalResponses}</div>
              <div className="text-sm text-muted-foreground">Total de Controles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Controles do Framework</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Controle</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Nível de Maturidade</TableHead>
                <TableHead>Resposta</TableHead>
                <TableHead>Análise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingResponses ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando controles...
                  </TableCell>
                </TableRow>
              ) : responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum controle encontrado para este assessment.
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.control?.control_code}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        {response.control?.control_text?.length > 100 
                          ? `${response.control.control_text.substring(0, 100)}...`
                          : response.control?.control_text
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{response.control?.domain}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={response.maturity_level?.toString() || ''}
                        onValueChange={(value) => updateResponse(response.id, 'maturity_level', parseInt(value))}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-40">
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
                      {response.maturity_level && (
                        <Badge className={`mt-1 ${getMaturityLevelColor(response.maturity_level)}`}>
                          {getMaturityLevelText(response.maturity_level)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={response.assessee_response || ''}
                        onChange={(e) => updateResponse(response.id, 'assessee_response', e.target.value)}
                        placeholder="Descreva a implementação do controle..."
                        className="min-h-[60px]"
                        disabled={isSaving}
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={response.assessor_analysis || ''}
                        onChange={(e) => updateResponse(response.id, 'assessor_analysis', e.target.value)}
                        placeholder="Análise do auditor..."
                        className="min-h-[60px]"
                        disabled={isSaving}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDetailPage;