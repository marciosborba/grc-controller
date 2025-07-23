import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const maturityLevels = [
  { level: 1, label: 'Inicial', description: 'Processos imprevisíveis, mal controlados.' },
  { level: 2, label: 'Gerenciado', description: 'Processos planejados e executados conforme política.' },
  { level: 3, label: 'Definido', description: 'Processos bem caracterizados e entendidos.' },
  { level: 4, label: 'Quantitativamente Gerenciado', description: 'Processos controlados e medidos.' },
  { level: 5, label: 'Otimização', description: 'Foco em melhoria contínua.' },
];

const getCMMILevel = (score: number) => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

const AssessmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [responses, setResponses] = useState<any>({});
  const [evidenceFiles, setEvidenceFiles] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_assessments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao carregar assessment', variant: 'destructive' });
        navigate('/vendors');
        return;
      }
      if (!data) {
        toast({ title: 'Erro', description: 'Assessment não encontrado', variant: 'destructive' });
        navigate('/vendors');
        return;
      }
      setAssessment(data);
      setResponses(data.responses || {});
      setEvidenceFiles(data.evidence_files || []);
      setLoading(false);
    };
    if (id) fetchAssessment();
  }, [id, navigate, toast]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!assessment) return null;

  const questions = assessment.questionnaire_data?.questions || [];

  // Cálculo de score simples: cada resposta "positiva" soma pontos
  const calcScore = () => {
    let total = 0;
    let max = 0;
    for (const q of questions) {
      max += 10;
      const r = responses[q.id];
      if (q.type === 'boolean') total += r ? 10 : 0;
      else if (q.type === 'select' && q.options) {
        const idx = q.options.indexOf(r);
        total += idx === 0 ? 10 : idx === 1 ? 8 : idx === 2 ? 6 : idx === 3 ? 4 : 0;
      } else if (q.type === 'multiple' && Array.isArray(r)) {
        total += Math.min(10, (r.length / (q.options?.length || 1)) * 10);
      } else if (q.type === 'number') {
        total += Math.min(10, Math.max(0, r / 10));
      }
    }
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const score = calcScore();
  const maturity = maturityLevels.find(m => m.level === getCMMILevel(score));

  const handleChange = (qid: string, value: any) => {
    setResponses((prev: any) => ({ ...prev, [qid]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('vendor_assessments')
      .update({ 
        responses,
        evidence_files: evidenceFiles,
        score: calcScore(),
        completed_at: new Date().toISOString()
      })
      .eq('id', id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar respostas', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Respostas salvas com sucesso!' });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${questionId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vendor-evidence')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const newFile = {
        name: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
        upload_date: new Date().toISOString()
      };

      const updatedEvidenceFiles = [...evidenceFiles];
      const questionEvidenceIndex = updatedEvidenceFiles.findIndex(e => e.question_id === questionId);
      
      if (questionEvidenceIndex >= 0) {
        updatedEvidenceFiles[questionEvidenceIndex].files.push(newFile);
      } else {
        updatedEvidenceFiles.push({
          question_id: questionId,
          files: [newFile]
        });
      }

      setEvidenceFiles(updatedEvidenceFiles);
      toast({ title: 'Sucesso', description: 'Arquivo enviado com sucesso!' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha ao enviar arquivo', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (questionId: string, fileIndex: number, filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('vendor-evidence')
        .remove([filePath]);

      if (error) throw error;

      const updatedEvidenceFiles = evidenceFiles.map((evidence: any) => {
        if (evidence.question_id === questionId) {
          return {
            ...evidence,
            files: evidence.files.filter((_: any, index: number) => index !== fileIndex)
          };
        }
        return evidence;
      }).filter((evidence: any) => evidence.files.length > 0);

      setEvidenceFiles(updatedEvidenceFiles);
      toast({ title: 'Sucesso', description: 'Arquivo removido com sucesso!' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha ao remover arquivo', variant: 'destructive' });
    }
  };

  const getQuestionEvidence = (questionId: string) => {
    return evidenceFiles.find((evidence: any) => evidence.question_id === questionId)?.files || [];
  };

  const getMaturityIcon = (level: string) => {
    switch (level) {
      case 'initial': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'managed': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'defined': return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'quantitatively_managed': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'optimized': return <Star className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMaturityLabel = (level: string) => {
    switch (level) {
      case 'initial': return 'Inicial';
      case 'managed': return 'Gerenciado';
      case 'defined': return 'Definido';
      case 'quantitatively_managed': return 'Quant. Gerenciado';
      case 'optimized': return 'Otimizado';
      default: return 'Não definido';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateMaturityDistribution = () => {
    const distribution = { initial: 0, managed: 0, defined: 0, quantitatively_managed: 0, optimized: 0 };
    questions.forEach((q: any) => {
      if (q.maturity_level) {
        distribution[q.maturity_level as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const maturityDistribution = calculateMaturityDistribution();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{assessment.title}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Framework: {assessment.questionnaire_data?.framework || 'Personalizado'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{score}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <Badge variant="outline" className="text-sm">
                {getMaturityIcon(maturity?.label?.toLowerCase() || '')}
                <span className="ml-2">{maturity?.label}</span>
              </Badge>
            </div>
          </div>
          <Progress value={score} className="w-full mt-4" />
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="questionnaire" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questionnaire">Questionário</TabsTrigger>
          <TabsTrigger value="maturity">Análise CMMI</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        {/* Questionário Tab */}
        <TabsContent value="questionnaire">
          <Card>
            <CardHeader>
              <CardTitle>Questionário de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Pergunta</TableHead>
                      <TableHead className="w-32">Nível CMMI</TableHead>
                      <TableHead className="w-48">Resposta</TableHead>
                      <TableHead className="w-32">Evidências</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q: any, idx: number) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{q.question}</div>
                            {q.required && <span className="text-xs text-red-500">*Obrigatório</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMaturityIcon(q.maturity_level)}
                            <span className="text-sm">{getMaturityLabel(q.maturity_level)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {q.type === 'boolean' && (
                              <div className="flex gap-2">
                                <Button 
                                  type="button" 
                                  size="sm"
                                  variant={responses[q.id] === true ? 'default' : 'outline'} 
                                  onClick={() => handleChange(q.id, true)}
                                >
                                  Sim
                                </Button>
                                <Button 
                                  type="button" 
                                  size="sm"
                                  variant={responses[q.id] === false ? 'default' : 'outline'} 
                                  onClick={() => handleChange(q.id, false)}
                                >
                                  Não
                                </Button>
                              </div>
                            )}
                            {q.type === 'select' && (
                              <select 
                                className="w-full px-3 py-2 border rounded-md text-sm" 
                                value={responses[q.id] || ''} 
                                onChange={e => handleChange(q.id, e.target.value)}
                              >
                                <option value="">Selecione...</option>
                                {q.options?.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                            {q.type === 'multiple' && (
                              <div className="space-y-1">
                                {q.options?.map((opt: string) => (
                                  <label key={opt} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={Array.isArray(responses[q.id]) && responses[q.id].includes(opt)}
                                      onChange={e => {
                                        const arr = Array.isArray(responses[q.id]) ? [...responses[q.id]] : [];
                                        if (e.target.checked) arr.push(opt);
                                        else arr.splice(arr.indexOf(opt), 1);
                                        handleChange(q.id, arr);
                                      }}
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                            {q.type === 'number' && (
                              <Input
                                type="number"
                                value={responses[q.id] || ''}
                                onChange={e => handleChange(q.id, Number(e.target.value))}
                                className="w-full"
                              />
                            )}
                            {q.type === 'text' && (
                              <Textarea
                                value={responses[q.id] || ''}
                                onChange={e => handleChange(q.id, e.target.value)}
                                rows={3}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedQuestion(q.id)}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enviar Evidências</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="file-upload">Selecionar arquivo</Label>
                                    <Input
                                      id="file-upload"
                                      type="file"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(q.id, file);
                                      }}
                                      disabled={uploading}
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Formatos aceitos: PDF, Word, Excel, Imagens
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Arquivos enviados:</Label>
                                    {getQuestionEvidence(q.id).map((file: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                          {getFileIcon(file.type)}
                                          <div>
                                            <div className="text-sm font-medium">{file.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {formatFileSize(file.size)}
                                            </div>
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleFileDelete(q.id, index, file.path)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    {getQuestionEvidence(q.id).length === 0 && (
                                      <div className="text-sm text-muted-foreground">
                                        Nenhuma evidência enviada
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <span className="text-xs text-muted-foreground">
                              {getQuestionEvidence(q.id).length}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex gap-2 justify-end pt-6">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Assessment'}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise CMMI Tab */}
        <TabsContent value="maturity">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Maturidade CMMI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nível Atual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {getCMMILevel(score)}
                      </div>
                      <div className="text-lg font-medium">
                        {maturity?.label}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {maturity?.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribuição por Nível</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(maturityDistribution).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMaturityIcon(level)}
                            <span className="text-sm">{getMaturityLabel(level)}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {score < 40 && (
                      <div className="p-4 border-l-4 border-red-500 bg-red-50">
                        <div className="font-medium text-red-700">Nível Inicial - Ações Urgentes</div>
                        <div className="text-sm text-red-600 mt-1">
                          Estabeleça processos básicos de gestão e controle. Foque em documentação e padronização.
                        </div>
                      </div>
                    )}
                    {score >= 40 && score < 60 && (
                      <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                        <div className="font-medium text-orange-700">Nível Gerenciado - Melhorias Necessárias</div>
                        <div className="text-sm text-orange-600 mt-1">
                          Implemente políticas formais e melhore o planejamento de projetos.
                        </div>
                      </div>
                    )}
                    {score >= 60 && score < 75 && (
                      <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                        <div className="font-medium text-yellow-700">Nível Definido - Bom Progresso</div>
                        <div className="text-sm text-yellow-600 mt-1">
                          Padronize processos organizacionais e implemente medições consistentes.
                        </div>
                      </div>
                    )}
                    {score >= 75 && score < 90 && (
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                        <div className="font-medium text-blue-700">Nível Quantitativamente Gerenciado - Excelente</div>
                        <div className="text-sm text-blue-600 mt-1">
                          Implemente métricas avançadas e controle estatístico de processos.
                        </div>
                      </div>
                    )}
                    {score >= 90 && (
                      <div className="p-4 border-l-4 border-green-500 bg-green-50">
                        <div className="font-medium text-green-700">Nível Otimizado - Parabéns!</div>
                        <div className="text-sm text-green-600 mt-1">
                          Mantenha o foco em melhoria contínua e inovação de processos.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidências Tab */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Evidências Enviadas</CardTitle>
            </CardHeader>
            <CardContent>
              {evidenceFiles.length > 0 ? (
                <div className="space-y-4">
                  {evidenceFiles.map((evidence: any, index: number) => {
                    const question = questions.find((q: any) => q.id === evidence.question_id);
                    return (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {question?.question || `Pergunta ${evidence.question_id}`}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {evidence.files.map((file: any, fileIndex: number) => (
                              <div key={fileIndex} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  {getFileIcon(file.type)}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{file.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)} • {new Date(file.upload_date).toLocaleDateString('pt-BR')}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleFileDelete(evidence.question_id, fileIndex, file.path)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Nenhuma evidência enviada ainda.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentDetailPage; 