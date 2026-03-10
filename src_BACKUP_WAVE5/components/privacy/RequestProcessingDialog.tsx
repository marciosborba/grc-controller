import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Send,
  Upload,
  Download,
  AlertCircle,
  Clock,
  User,
  Mail,
  MessageSquare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DataSubjectRequestStatus, ResponseMethod } from '@/types/privacy-management';

// Validation schema
const processingSchema = z.object({
  status: z.enum(['completed', 'rejected', 'partially_completed'] as const),
  response: z.string().min(10, 'Resposta deve ter pelo menos 10 caracteres'),
  response_method: z.enum(['email', 'portal', 'phone', 'mail', 'in_person'] as const),
  response_attachments: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
  partially_completed_reason: z.string().optional()
});

type ProcessingFormData = z.infer<typeof processingSchema>;

interface RequestProcessingDialogProps {
  requestId: string | null;
  onProcessRequest: (data: ProcessingFormData) => Promise<void>;
}

export function RequestProcessingDialog({ requestId, onProcessRequest }: RequestProcessingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('response');
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [templateContent, setTemplateContent] = useState('');

  const form = useForm<ProcessingFormData>({
    resolver: zodResolver(processingSchema),
    defaultValues: {
      status: 'completed',
      response: '',
      response_method: 'email',
      response_attachments: [],
      internal_notes: ''
    }
  });

  const status = form.watch('status');

  // Load template when component mounts or requestId changes
  useEffect(() => {
    if (requestId) {
      loadTemplate();
    }
  }, [requestId]);

  const loadTemplate = async () => {
    // In a real implementation, this would fetch the request details and generate a template
    // For now, we'll use a basic template
    setTemplateContent(`Prezado(a) Titular,

Em resposta à sua solicitação de exercício de direitos sobre seus dados pessoais, informamos que:

[Inserir resposta específica conforme o tipo de solicitação]

Para quaisquer esclarecimentos adicionais, entre em contato conosco através dos canais oficiais.

Atenciosamente,
Equipe de Privacidade e Proteção de Dados`);
    
    form.setValue('response', templateContent);
  };

  const handleSubmit = async (data: ProcessingFormData) => {
    try {
      setLoading(true);
      
      const finalData = {
        ...data,
        response_attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined,
        responded_by: 'current-user-id' // This should come from auth context
      };

      await onProcessRequest(finalData);
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = (attachment: string, checked: boolean) => {
    const newAttachments = checked
      ? [...selectedAttachments, attachment]
      : selectedAttachments.filter(a => a !== attachment);
    
    setSelectedAttachments(newAttachments);
  };

  // Pre-defined templates based on request type
  const getTemplateByType = (type: string) => {
    const templates = {
      acesso: `Prezado(a) Titular,

Em resposta à sua solicitação de acesso aos seus dados pessoais, segue em anexo relatório detalhado contendo:

• Dados pessoais que tratamos sobre você
• Finalidades do tratamento
• Categorias de dados tratados
• Período de retenção
• Informações sobre compartilhamento com terceiros

Os dados foram organizados de forma clara e estruturada para facilitar sua compreensão.

Atenciosamente,
Equipe de Privacidade`,

      eliminacao: `Prezado(a) Titular,

Confirmamos o atendimento de sua solicitação de eliminação de dados pessoais.

Os seguintes dados foram eliminados de nossos sistemas:
• [Listar dados eliminados]

Data da eliminação: [Data]
Sistemas afetados: [Lista de sistemas]

Importante: Alguns dados podem ser mantidos por obrigação legal ou legítimo interesse, conforme previsto na LGPD.

Atenciosamente,
Equipe de Privacidade`,

      correcao: `Prezado(a) Titular,

Sua solicitação de correção de dados pessoais foi processada com sucesso.

Dados corrigidos:
• [Listar alterações realizadas]

As alterações foram aplicadas em todos os sistemas relevantes e entrarão em vigor imediatamente.

Atenciosamente,
Equipe de Privacidade`
    };

    return templates[type as keyof typeof templates] || templateContent;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Processar Solicitação</h2>
        <p className="text-muted-foreground">
          Finalize o processamento da solicitação do titular
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="response">Resposta</TabsTrigger>
              <TabsTrigger value="attachments">Anexos</TabsTrigger>
              <TabsTrigger value="review">Revisão</TabsTrigger>
            </TabsList>

            {/* Response Tab */}
            <TabsContent value="response" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Status da Solicitação
                  </CardTitle>
                  <CardDescription>
                    Defina como a solicitação foi processada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Final</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="completed" id="completed" />
                              <Label htmlFor="completed" className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>Concluída</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                  A solicitação foi atendida completamente
                                </p>
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="partially_completed" id="partially_completed" />
                              <Label htmlFor="partially_completed" className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-orange-600" />
                                  <span>Parcialmente Atendida</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                  A solicitação foi atendida parcialmente
                                </p>
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rejected" id="rejected" />
                              <Label htmlFor="rejected" className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span>Rejeitada</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                  A solicitação não pode ser atendida
                                </p>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Show reason field for rejection or partial completion */}
                  {status === 'rejected' && (
                    <FormField
                      control={form.control}
                      name="rejection_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo da Rejeição *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explique detalhadamente o motivo da rejeição..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Forneça uma justificativa legal e clara para a rejeição
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {status === 'partially_completed' && (
                    <FormField
                      control={form.control}
                      name="partially_completed_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Justificativa do Atendimento Parcial *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explique por que a solicitação foi atendida apenas parcialmente..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Explique quais partes foram atendidas e quais não foram
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resposta ao Titular</CardTitle>
                  <CardDescription>
                    Redija a resposta oficial que será enviada ao titular
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="response_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Resposta</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                              </div>
                            </SelectItem>
                            <SelectItem value="portal">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Portal do Titular
                              </div>
                            </SelectItem>
                            <SelectItem value="mail">Correio</SelectItem>
                            <SelectItem value="phone">Telefone</SelectItem>
                            <SelectItem value="in_person">Presencial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="response"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo da Resposta *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite a resposta que será enviada ao titular..."
                            rows={10}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta será a resposta oficial enviada ao titular. Seja claro e objetivo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('response', getTemplateByType('acesso'))}
                    >
                      Template: Acesso
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('response', getTemplateByType('eliminacao'))}
                    >
                      Template: Eliminação
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('response', getTemplateByType('correcao'))}
                    >
                      Template: Correção
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Anexos da Resposta
                  </CardTitle>
                  <CardDescription>
                    Selecione os documentos que serão enviados junto com a resposta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Documentos Disponíveis</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Relatório de Dados Pessoais',
                        'Política de Privacidade',
                        'Termos de Uso',
                        'Comprovante de Eliminação',
                        'Registro de Alterações',
                        'Formulário de Revogação'
                      ].map((attachment) => (
                        <div key={attachment} className="flex items-center space-x-2">
                          <Checkbox
                            id={`attachment-${attachment}`}
                            checked={selectedAttachments.includes(attachment)}
                            onCheckedChange={(checked) => handleAttachmentChange(attachment, !!checked)}
                          />
                          <Label
                            htmlFor={`attachment-${attachment}`}
                            className="text-sm font-normal cursor-pointer flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            {attachment}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedAttachments.length > 0 && (
                    <Alert>
                      <Download className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{selectedAttachments.length}</strong> documento(s) selecionado(s) para envio.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para fazer upload de documentos adicionais
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Selecionar Arquivos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Revisão Final
                  </CardTitle>
                  <CardDescription>
                    Revise todas as informações antes de finalizar o processamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Status Final:</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={
                            status === 'completed' ? 'default' :
                            status === 'partially_completed' ? 'secondary' : 'destructive'
                          }
                        >
                          {status === 'completed' ? 'Concluída' :
                           status === 'partially_completed' ? 'Parcialmente Atendida' : 'Rejeitada'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Método de Resposta:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {form.watch('response_method') === 'email' ? 'Email' :
                         form.watch('response_method') === 'portal' ? 'Portal do Titular' :
                         form.watch('response_method')}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Anexos:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAttachments.length > 0 ? 
                          `${selectedAttachments.length} documento(s) selecionado(s)` :
                          'Nenhum anexo selecionado'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Prévia da Resposta:</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                        {form.watch('response')?.substring(0, 200)}
                        {(form.watch('response')?.length || 0) > 200 ? '...' : ''}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Atenção:</strong> Após confirmar, a resposta será enviada ao titular e a solicitação será finalizada.
                      Esta ação não pode ser desfeita.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Internas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações internas sobre o processamento desta solicitação..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Estas observações são apenas para uso interno e não serão enviadas ao titular
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Separator />
          
          <div className="flex justify-between">
            <div className="flex space-x-2">
              {currentTab !== 'response' && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (currentTab === 'attachments') setCurrentTab('response');
                    if (currentTab === 'review') setCurrentTab('attachments');
                  }}
                >
                  Anterior
                </Button>
              )}
              
              {currentTab !== 'review' && (
                <Button 
                  type="button"
                  onClick={() => {
                    if (currentTab === 'response') setCurrentTab('attachments');
                    if (currentTab === 'attachments') setCurrentTab('review');
                  }}
                >
                  Próximo
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              
              {currentTab === 'review' && (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processando...' : 'Finalizar Solicitação'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}