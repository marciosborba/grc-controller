import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Shield,
  FileText,
  Download,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  Calendar,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Evidence {
  id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface Control {
  id: string;
  name: string;
  description: string;
  category: string;
  domain: string;
  guidance?: string;
  compliance_criteria?: string;
}

interface AssessmentResponse {
  id: string;
  assessee_response: string;
  answered_at: string;
  answered_by_user_id: string;
  auditor_maturity_level?: number;
  auditor_comments?: string;
  assessor_analysis?: string;
}

interface MaturityLevel {
  level: number;
  label: string;
  description: string;
  characteristics: string[];
}

const MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: 1,
    label: 'Inicial',
    description: 'Processos são ad hoc e caóticos. Dependem de esforços individuais.',
    characteristics: [
      'Processos não documentados ou mal documentados',
      'Dependência de conhecimento individual',
      'Resultados imprevisíveis',
      'Falta de padronização'
    ]
  },
  {
    level: 2,
    label: 'Repetível',
    description: 'Processos básicos são estabelecidos e alguns são repetíveis.',
    characteristics: [
      'Processos básicos documentados',
      'Alguns controles estabelecidos',
      'Resultados mais previsíveis',
      'Início de padronização'
    ]
  },
  {
    level: 3,
    label: 'Definido',
    description: 'Processos bem definidos, documentados e padronizados.',
    characteristics: [
      'Processos bem documentados',
      'Padrões organizacionais definidos',
      'Treinamento regular',
      'Métricas básicas coletadas'
    ]
  },
  {
    level: 4,
    label: 'Gerenciado',
    description: 'Processos são medidos e controlados através de métricas.',
    characteristics: [
      'Métricas detalhadas coletadas',
      'Controle estatístico de processos',
      'Performance previsível',
      'Melhoria baseada em dados'
    ]
  },
  {
    level: 5,
    label: 'Otimizado',
    description: 'Processos são continuamente melhorados através de inovação.',
    characteristics: [
      'Melhoria contínua estabelecida',
      'Inovação tecnológica aplicada',
      'Otimização proativa',
      'Excelência operacional'
    ]
  }
];

export const ControlReviewPage: React.FC = () => {
  const { assessmentId, controlId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [control, setControl] = useState<Control | null>(null);
  const [response, setResponse] = useState<AssessmentResponse | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedMaturityLevel, setSelectedMaturityLevel] = useState<number | null>(null);
  const [auditorComments, setAuditorComments] = useState('');
  const [assessorAnalysis, setAssessorAnalysis] = useState('');

  // Mock data - substitua pela integração real com Supabase
  useEffect(() => {
    const mockControl: Control = {
      id: controlId || '',
      name: 'A.5.1.1',
      description: 'Políticas para segurança da informação',
      category: 'Organizacional',
      domain: 'Políticas de Segurança',
      guidance: 'Um conjunto de políticas para segurança da informação deve ser definido, aprovado pela direção, publicado e comunicado para todos os funcionários e partes externas relevantes.',
      compliance_criteria: '• Política de segurança aprovada pela alta direção\n• Política publicada e comunicada\n• Revisão periódica definida\n• Responsabilidades claramente definidas'
    };

    const mockResponse: AssessmentResponse = {
      id: '1',
      assessee_response: 'Possuímos uma política de segurança da informação aprovada pela alta direção em dezembro de 2023. A política está publicada na intranet corporativa e foi comunicada a todos os colaboradores através de treinamento obrigatório. A política é revisada anualmente pelo comitê de segurança e aprovada pela diretoria. Temos um responsável pela segurança da informação designado que coordena a implementação e monitoramento das políticas.',
      answered_at: '2024-08-01T10:00:00Z',
      answered_by_user_id: 'user-1',
      auditor_maturity_level: 3,
      auditor_comments: 'Política bem estruturada e formalizada. Processo de aprovação adequado. Comunicação efetiva realizada.',
      assessor_analysis: 'Controle está conforme os requisitos básicos. Sugere-se implementar métricas de efetividade para evoluir para nível 4.'
    };

    const mockEvidence: Evidence[] = [
      {
        id: '1',
        file_name: 'Politica_Seguranca_Informacao_v2.0.pdf',
        file_size: 2048576,
        file_path: '/evidence/politica-seguranca.pdf',
        uploaded_at: '2024-08-01T09:30:00Z',
        uploaded_by: 'João Silva'
      },
      {
        id: '2',
        file_name: 'Ata_Aprovacao_Diretoria.pdf',
        file_size: 1024768,
        file_path: '/evidence/ata-aprovacao.pdf',
        uploaded_at: '2024-08-01T09:45:00Z',
        uploaded_by: 'Maria Santos'
      },
      {
        id: '3',
        file_name: 'Comprovante_Treinamento_Colaboradores.xlsx',
        file_size: 856432,
        file_path: '/evidence/treinamento.xlsx',
        uploaded_at: '2024-08-01T10:15:00Z',
        uploaded_by: 'João Silva'
      }
    ];

    setControl(mockControl);
    setResponse(mockResponse);
    setEvidence(mockEvidence);
    setSelectedMaturityLevel(mockResponse.auditor_maturity_level || null);
    setAuditorComments(mockResponse.auditor_comments || '');
    setAssessorAnalysis(mockResponse.assessor_analysis || '');
    setIsLoading(false);
  }, [controlId]);

  const handleSaveReview = async () => {
    if (!selectedMaturityLevel) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione um nível de maturidade.",
        variant: "destructive",
      });
      return;
    }

    if (!auditorComments.trim()) {
      toast({
        title: "Comentários obrigatórios",
        description: "Por favor, adicione comentários sobre sua avaliação.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Aqui você implementaria a integração com Supabase
      // await supabase.from('assessment_responses').update({
      //   auditor_maturity_level: selectedMaturityLevel,
      //   auditor_comments: auditorComments,
      //   assessor_analysis: assessorAnalysis,
      //   reviewed_at: new Date().toISOString(),
      //   reviewed_by_user_id: currentUser.id
      // }).eq('id', response.id);

      toast({
        title: "Avaliação salva",
        description: "Sua avaliação foi salva com sucesso.",
      });

      // Redirecionar de volta para a lista de controles
      setTimeout(() => {
        navigate(`/assessments/${assessmentId}/controls`);
      }, 1000);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getMaturityColor = (level: number): string => {
    const colors = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-blue-100 text-blue-800 border-blue-200',
      5: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  if (!control || !response) {
    return <div className="p-6 text-center text-destructive">Dados não encontrados.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/assessments/${assessmentId}/controls`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Controles
        </Button>
        <div className="flex-1">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            Auditar Controle {control.name}
          </h1>
          <p className="text-muted-foreground">{control.domain}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Control Info & Response */}
        <div className="space-y-6">
          {/* Control Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações do Controle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Descrição</h3>
                <p className="text-muted-foreground">{control.description}</p>
              </div>

              {control.compliance_criteria && (
                <div>
                  <h3 className="font-medium mb-2">Critérios de Conformidade</h3>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {control.compliance_criteria}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Badge variant="secondary">{control.category}</Badge>
                <Badge variant="outline">{control.domain}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Response from Assessee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Resposta do Auditado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{response.assessee_response}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Respondido em {formatDate(response.answered_at)}
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidências ({evidence.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evidence.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma evidência anexada.
                </div>
              ) : (
                <div className="space-y-3">
                  {evidence.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{file.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)} • {file.uploaded_by}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Auditor Review */}
        <div className="space-y-6">
          {/* Maturity Level Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Avaliação de Maturidade CMMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Star className="h-4 w-4" />
                <AlertDescription>
                  Avalie o nível de maturidade baseado nas evidências apresentadas e na resposta do auditado.
                </AlertDescription>
              </Alert>

              <RadioGroup 
                value={selectedMaturityLevel?.toString() || ''} 
                onValueChange={(value) => setSelectedMaturityLevel(parseInt(value))}
                className="space-y-4"
              >
                {MATURITY_LEVELS.map((level) => (
                  <div key={level.level} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={level.level.toString()} id={`level-${level.level}`} />
                      <Label htmlFor={`level-${level.level}`} className="flex items-center gap-2 font-medium">
                        <Badge className={getMaturityColor(level.level)}>
                          {level.level}
                        </Badge>
                        {level.label}
                      </Label>
                    </div>
                    <div className="ml-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        {level.description}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {level.characteristics.slice(0, 2).map((char, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Auditor Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentários da Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Descreva os pontos observados, justifique o nível de maturidade selecionado e inclua recomendações de melhoria.
                </AlertDescription>
              </Alert>

              <Textarea
                placeholder="Digite seus comentários e observações da auditoria..."
                value={auditorComments}
                onChange={(e) => setAuditorComments(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Assessment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Análise e Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Forneça uma análise técnica do controle e recomendações específicas para melhorar a maturidade.
                </AlertDescription>
              </Alert>

              <Textarea
                placeholder="Digite sua análise técnica e recomendações para evolução..."
                value={assessorAnalysis}
                onChange={(e) => setAssessorAnalysis(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/assessments/${assessmentId}/controls`)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveReview}
              disabled={isSaving || !selectedMaturityLevel || !auditorComments.trim()}
            >
              {isSaving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Avaliação
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};