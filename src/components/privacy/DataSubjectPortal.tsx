import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Shield, 
  User, 
  Mail, 
  CreditCard,
  FileText, 
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Info,
  Send,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { DataSubjectRequestType, REQUEST_TYPES } from '@/types/privacy-management';
import { useDataSubjectRequests } from '@/hooks/useDataSubjectRequests';

// Schema for new request form
const newRequestSchema = z.object({
  requester_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  requester_email: z.string().email('Email inválido'),
  requester_document: z.string().min(11, 'CPF deve ter 11 dígitos'),
  request_type: z.enum([
    'acesso',
    'correcao',
    'anonimizacao',
    'bloqueio',
    'eliminacao',
    'portabilidade',
    'informacao_uso_compartilhamento',
    'revogacao_consentimento',
    'oposicao',
    'revisao_decisoes_automatizadas'
  ] as const),
  request_description: z.string().min(10, 'Descreva sua solicitação com pelo menos 10 caracteres')
});

// Schema for tracking form
const trackingSchema = z.object({
  email: z.string().email('Email inválido'),
  document: z.string().min(11, 'CPF deve ter 11 dígitos')
});

type NewRequestFormData = z.infer<typeof newRequestSchema>;
type TrackingFormData = z.infer<typeof trackingSchema>;

export function DataSubjectPortal() {
  const [currentTab, setCurrentTab] = useState('new-request');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [trackingResults, setTrackingResults] = useState<any[]>([]);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const { createRequest, loading } = useDataSubjectRequests();

  // Form for new request
  const newRequestForm = useForm<NewRequestFormData>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: {
      requester_name: '',
      requester_email: '',
      requester_document: '',
      request_description: ''
    }
  });

  // Form for tracking
  const trackingForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      email: '',
      document: ''
    }
  });

  const selectedRequestType = newRequestForm.watch('request_type');

  // Handle new request submission
  const handleNewRequestSubmit = async (data: NewRequestFormData) => {
    try {
      const result = await createRequest(data);
      if (result.success) {
        setSubmitSuccess(true);
        newRequestForm.reset();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  // Handle tracking request
  const handleTrackingSubmit = async (data: TrackingFormData) => {
    try {
      // In a real implementation, this would call an API to fetch user's requests
      // For now, we'll simulate some results
      setTrackingResults([
        {
          id: '1',
          request_type: 'acesso',
          status: 'in_progress',
          received_at: '2024-01-15',
          due_date: '2024-01-30',
          response: null
        },
        {
          id: '2',
          request_type: 'eliminacao',
          status: 'completed',
          received_at: '2024-01-10',
          due_date: '2024-01-25',
          response: 'Seus dados foram eliminados conforme solicitado.'
        }
      ]);
    } catch (error) {
      console.error('Error tracking requests:', error);
    }
  };

  // Get request type info
  const getRequestTypeInfo = (type: DataSubjectRequestType) => {
    const info = {
      acesso: {
        description: 'Solicite uma cópia de todos os dados pessoais que temos sobre você.',
        icon: <Eye className="w-5 h-5" />,
        color: 'text-blue-600',
        complexity: 'Média'
      },
      correcao: {
        description: 'Solicite a correção de dados pessoais incorretos ou desatualizados.',
        icon: <FileText className="w-5 h-5" />,
        color: 'text-green-600',
        complexity: 'Baixa'
      },
      eliminacao: {
        description: 'Solicite a eliminação completa de seus dados pessoais.',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-red-600',
        complexity: 'Alta'
      },
      bloqueio: {
        description: 'Solicite o bloqueio temporário do tratamento de seus dados.',
        icon: <Lock className="w-5 h-5" />,
        color: 'text-orange-600',
        complexity: 'Média'
      },
      anonimizacao: {
        description: 'Solicite que seus dados sejam anonimizados.',
        icon: <Shield className="w-5 h-5" />,
        color: 'text-purple-600',
        complexity: 'Alta'
      },
      portabilidade: {
        description: 'Solicite a portabilidade de seus dados para outro fornecedor.',
        icon: <Download className="w-5 h-5" />,
        color: 'text-blue-600',
        complexity: 'Alta'
      },
      informacao_uso_compartilhamento: {
        description: 'Obtenha informações sobre como seus dados são usados e compartilhados.',
        icon: <Info className="w-5 h-5" />,
        color: 'text-gray-600',
        complexity: 'Baixa'
      },
      revogacao_consentimento: {
        description: 'Revogue o consentimento para tratamento de seus dados pessoais.',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'text-yellow-600',
        complexity: 'Baixa'
      },
      oposicao: {
        description: 'Oponha-se ao tratamento de seus dados pessoais.',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-red-600',
        complexity: 'Média'
      },
      revisao_decisoes_automatizadas: {
        description: 'Solicite revisão de decisões tomadas automaticamente.',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-indigo-600',
        complexity: 'Alta'
      }
    };

    return info[type] || { description: '', icon: <FileText className="w-5 h-5" />, color: 'text-gray-600', complexity: 'Média' };
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusInfo = {
      received: { label: 'Recebida', color: 'bg-blue-100 text-blue-800', icon: <Mail className="w-3 h-3" /> },
      under_verification: { label: 'Em Verificação', color: 'bg-yellow-100 text-yellow-800', icon: <Search className="w-3 h-3" /> },
      verified: { label: 'Verificada', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      in_progress: { label: 'Em Andamento', color: 'bg-purple-100 text-purple-800', icon: <Clock className="w-3 h-3" /> },
      completed: { label: 'Concluída', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> }
    };

    return statusInfo[status as keyof typeof statusInfo] || statusInfo.received;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Portal de Privacidade</h1>
              <p className="text-lg text-gray-600">Seus Direitos de Privacidade</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Exercite seus direitos sobre dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).
            Este portal permite fazer solicitações e acompanhar o status de seus pedidos.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new-request" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Nova Solicitação
              </TabsTrigger>
              <TabsTrigger value="track-request" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Acompanhar Pedido
              </TabsTrigger>
              <TabsTrigger value="my-rights" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Meus Direitos
              </TabsTrigger>
            </TabsList>

            {/* New Request Tab */}
            <TabsContent value="new-request" className="space-y-6">
              {submitSuccess ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Solicitação Enviada!</h3>
                    <p className="text-gray-600 mb-4">
                      Sua solicitação foi recebida e será processada em até 15 dias úteis.
                      Você receberá um email de confirmação em breve.
                    </p>
                    <Button onClick={() => setSubmitSuccess(false)} className="mr-2">
                      Nova Solicitação
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentTab('track-request')}>
                      Acompanhar Status
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Nova Solicitação de Privacidade
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados abaixo para exercer seus direitos sobre dados pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...newRequestForm}>
                      <form onSubmit={newRequestForm.handleSubmit(handleNewRequestSubmit)} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Informações Pessoais</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={newRequestForm.control}
                              name="requester_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome Completo *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu nome completo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={newRequestForm.control}
                              name="requester_email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="seu@email.com" type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={newRequestForm.control}
                            name="requester_document"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPF *</FormLabel>
                                <FormControl>
                                  <Input placeholder="000.000.000-00" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Necessário para verificar sua identidade
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        {/* Request Type */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Tipo de Solicitação</h4>
                          
                          <FormField
                            control={newRequestForm.control}
                            name="request_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Qual direito você deseja exercer? *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo de solicitação" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(REQUEST_TYPES).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Show description when type is selected */}
                          {selectedRequestType && (
                            <Alert>
                              <div className="flex items-start gap-3">
                                <div className={getRequestTypeInfo(selectedRequestType).color}>
                                  {getRequestTypeInfo(selectedRequestType).icon}
                                </div>
                                <div>
                                  <AlertDescription>
                                    <strong>{REQUEST_TYPES[selectedRequestType]}</strong>
                                    <br />
                                    {getRequestTypeInfo(selectedRequestType).description}
                                    <br />
                                    <span className="text-sm text-muted-foreground">
                                      Complexidade: {getRequestTypeInfo(selectedRequestType).complexity} | 
                                      Prazo: 15 dias úteis
                                    </span>
                                  </AlertDescription>
                                </div>
                              </div>
                            </Alert>
                          )}
                        </div>

                        <FormField
                          control={newRequestForm.control}
                          name="request_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição da Solicitação *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva detalhadamente sua solicitação..."
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Seja específico sobre o que você está solicitando para facilitar o processamento
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Privacy Policy Agreement */}
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Ao enviar esta solicitação, você confirma que leu e concorda com nossa{' '}
                            <Button
                              type="button"
                              variant="link"
                              className="p-0 h-auto text-blue-600 underline"
                              onClick={() => setShowPrivacyPolicy(true)}
                            >
                              Política de Privacidade
                            </Button>
                            {' '}e que as informações fornecidas são verdadeiras.
                          </AlertDescription>
                        </Alert>

                        <Button type="submit" disabled={loading} className="w-full">
                          {loading ? 'Enviando...' : 'Enviar Solicitação'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Track Request Tab */}
            <TabsContent value="track-request" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Acompanhar Solicitação
                  </CardTitle>
                  <CardDescription>
                    Digite seus dados para verificar o status de suas solicitações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...trackingForm}>
                    <form onSubmit={trackingForm.handleSubmit(handleTrackingSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={trackingForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="seu@email.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={trackingForm.control}
                          name="document"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input placeholder="000.000.000-00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Consultar Solicitações
                      </Button>
                    </form>
                  </Form>

                  {/* Results */}
                  {trackingResults.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-medium text-gray-900">Suas Solicitações</h4>
                      {trackingResults.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        return (
                          <Card key={request.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {REQUEST_TYPES[request.request_type as keyof typeof REQUEST_TYPES]}
                                </h5>
                                <Badge className={statusInfo.color}>
                                  <div className="flex items-center gap-1">
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                  </div>
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Recebida em: {new Date(request.received_at).toLocaleDateString('pt-BR')}</p>
                                <p>Prazo: {new Date(request.due_date).toLocaleDateString('pt-BR')}</p>
                                
                                {request.response && (
                                  <div className="mt-2 p-2 bg-green-50 rounded border">
                                    <p className="text-green-800"><strong>Resposta:</strong> {request.response}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Rights Tab */}
            <TabsContent value="my-rights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Seus Direitos de Privacidade
                  </CardTitle>
                  <CardDescription>
                    Conheça todos os seus direitos conforme a Lei Geral de Proteção de Dados (LGPD)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(REQUEST_TYPES).map(([key, label]) => {
                      const info = getRequestTypeInfo(key as DataSubjectRequestType);
                      return (
                        <Card key={key} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={info.color}>
                                {info.icon}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
                                <p className="text-sm text-gray-600">{info.description}</p>
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Complexidade: {info.complexity}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Alert className="mt-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Importante:</strong> Todos os direitos são garantidos pela Lei nº 13.709/2018 (LGPD).
                      O prazo legal para resposta é de 15 dias úteis, podendo ser prorrogado por mais 15 dias
                      em casos de alta complexidade.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Privacy Policy Dialog */}
        <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Política de Privacidade</DialogTitle>
              <DialogDescription>
                Como tratamos seus dados pessoais neste portal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p>
                Este portal coleta apenas os dados necessários para processar suas solicitações de privacidade,
                incluindo nome, email, CPF e a descrição de sua solicitação.
              </p>
              <p>
                Seus dados são protegidos por medidas técnicas e organizacionais adequadas e são utilizados
                exclusivamente para:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verificar sua identidade</li>
                <li>Processar sua solicitação</li>
                <li>Comunicar sobre o andamento</li>
                <li>Cumprir obrigações legais</li>
              </ul>
              <p>
                Não compartilhamos seus dados com terceiros, exceto quando exigido por lei.
                Você pode exercer todos os seus direitos de privacidade através deste portal.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}