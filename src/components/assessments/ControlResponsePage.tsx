import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  id?: string;
  assessee_response: string;
  answered_at?: string;
  answered_by_user_id?: string;
}

export const ControlResponsePage: React.FC = () => {
  const { assessmentId, controlId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [control, setControl] = useState<Control | null>(null);
  const [response, setResponse] = useState<AssessmentResponse>({ assessee_response: '' });
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; evidenceId: string | null }>({
    isOpen: false,
    evidenceId: null
  });

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
      assessee_response: 'Possuímos uma política de segurança da informação aprovada pela alta direção em dezembro de 2023. A política está publicada na intranet corporativa e foi comunicada a todos os colaboradores através de treinamento obrigatório.',
      answered_at: '2024-08-01T10:00:00Z',
      answered_by_user_id: 'user-1'
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
    setIsLoading(false);
  }, [controlId]);

  const handleSaveResponse = async () => {
    setIsSaving(true);
    
    try {
      // Aqui você implementaria a integração com Supabase
      // await supabase.from('assessment_responses').upsert({
      //   assessment_id: assessmentId,
      //   control_id: controlId,
      //   assessee_response: response.assessee_response,
      //   answered_at: new Date().toISOString(),
      //   answered_by_user_id: currentUser.id
      // });

      toast({
        title: "Resposta salva",
        description: "Sua resposta foi salva com sucesso.",
      });

      // Redirecionar de volta para a lista de controles
      setTimeout(() => {
        navigate(`/assessments/${assessmentId}/controls`);
      }, 1000);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar resposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validação de tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo ${file.name} excede o limite de 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Aqui você implementaria o upload para Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('evidence')
        //   .upload(`${assessmentId}/${controlId}/${file.name}`, file);

        // Simular upload bem-sucedido
        const newEvidence: Evidence = {
          id: Date.now().toString(),
          file_name: file.name,
          file_size: file.size,
          file_path: `/evidence/${file.name}`,
          uploaded_at: new Date().toISOString(),
          uploaded_by: 'Usuário Atual'
        };

        setEvidence(prev => [...prev, newEvidence]);

        toast({
          title: "Upload concluído",
          description: `${file.name} foi enviado com sucesso.`,
        });

      } catch (error) {
        toast({
          title: "Erro no upload",
          description: `Erro ao enviar ${file.name}. Tente novamente.`,
          variant: "destructive",
        });
      }
    }

    // Limpar o input
    event.target.value = '';
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      // Aqui você implementaria a exclusão no Supabase
      // await supabase.storage.from('evidence').remove([evidencePath]);
      // await supabase.from('assessment_evidence').delete().eq('id', evidenceId);

      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
      setDeleteDialog({ isOpen: false, evidenceId: null });

      toast({
        title: "Evidência removida",
        description: "A evidência foi removida com sucesso.",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover evidência. Tente novamente.",
        variant: "destructive",
      });
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

  if (isLoading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  if (!control) {
    return <div className="p-6 text-center text-destructive">Controle não encontrado.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/assessments/${assessmentId}/controls`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Controles
        </Button>
        <div className="flex-1">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            Responder Controle {control.name}
          </h1>
          <p className="text-muted-foreground">{control.domain}</p>
        </div>
      </div>

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

          {control.guidance && (
            <div>
              <h3 className="font-medium mb-2">Orientação</h3>
              <p className="text-sm text-muted-foreground">{control.guidance}</p>
            </div>
          )}

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

      {/* Response Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Resposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Descreva detalhadamente como sua organização atende a este controle. 
              Inclua informações sobre processos, procedimentos, responsáveis e controles implementados.
            </AlertDescription>
          </Alert>

          <Textarea
            placeholder="Digite sua resposta detalhada aqui..."
            value={response.assessee_response}
            onChange={(e) => setResponse(prev => ({ ...prev, assessee_response: e.target.value }))}
            className="min-h-[200px]"
          />

          {response.answered_at && (
            <div className="text-sm text-muted-foreground">
              Última atualização: {formatDate(response.answered_at)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Evidências
            </span>
            <div>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <Button asChild variant="outline" size="sm">
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Evidências
                </label>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Anexe documentos que comprovem a implementação do controle. 
              Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG. 
              Tamanho máximo: 10MB por arquivo.
            </AlertDescription>
          </Alert>

          {evidence.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma evidência anexada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{file.file_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • Enviado por {file.uploaded_by} • {formatDate(file.uploaded_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ isOpen: true, evidenceId: file.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          onClick={handleSaveResponse}
          disabled={isSaving || !response.assessee_response.trim()}
        >
          {isSaving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Resposta
            </>
          )}
        </Button>
      </div>

      {/* Delete Evidence Dialog */}
      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(open) => setDeleteDialog({ isOpen: open, evidenceId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Evidência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta evidência? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.evidenceId && handleDeleteEvidence(deleteDialog.evidenceId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};