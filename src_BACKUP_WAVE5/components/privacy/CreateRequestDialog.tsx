import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Info,
  Plus,
  Minus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { DataSubjectRequest, DataSubjectRequestType, REQUEST_TYPES, DATA_CATEGORIES } from '@/types/privacy-management';

// Validation schema
const createRequestSchema = z.object({
  requester_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  requester_email: z.string().email('Email inválido'),
  requester_document: z.string().optional(),
  requester_phone: z.string().optional(),
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
  request_description: z.string().optional(),
  specific_data_requested: z.string().optional(),
  data_categories: z.array(z.string()).optional()
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

interface CreateRequestDialogProps {
  onCreateRequest: (data: Partial<DataSubjectRequest>) => Promise<void>;
}

export function CreateRequestDialog({ onCreateRequest }: CreateRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      requester_name: '',
      requester_email: '',
      requester_document: '',
      requester_phone: '',
      request_description: '',
      specific_data_requested: '',
      data_categories: []
    }
  });

  const requestType = form.watch('request_type');

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);

    setSelectedCategories(newCategories);
    form.setValue('data_categories', newCategories);
  };

  // Handle form submission
  const handleSubmit = async (data: CreateRequestFormData) => {
    try {
      setLoading(true);

      const requestData: Partial<DataSubjectRequest> = {
        ...data,
        data_categories: selectedCategories.length > 0 ? selectedCategories : undefined
      };

      await onCreateRequest(requestData);

      // Reset form
      form.reset();
      setSelectedCategories([]);

    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get request type description
  const getRequestTypeDescription = (type: DataSubjectRequestType) => {
    const descriptions = {
      acesso: 'Solicitação de acesso aos dados pessoais tratados pela organização.',
      correcao: 'Solicitação de correção de dados pessoais incompletos, inexatos ou desatualizados.',
      anonimizacao: 'Solicitação de anonimização dos dados pessoais.',
      bloqueio: 'Solicitação de bloqueio ou cessão do uso dos dados pessoais.',
      eliminacao: 'Solicitação de eliminação dos dados pessoais tratados com consentimento.',
      portabilidade: 'Solicitação de portabilidade dos dados pessoais a outro fornecedor.',
      informacao_uso_compartilhamento: 'Solicitação de informação sobre uso e compartilhamento dos dados.',
      revogacao_consentimento: 'Solicitação de revogação do consentimento para tratamento.',
      oposicao: 'Solicitação de oposição ao tratamento de dados pessoais.',
      revisao_decisoes_automatizadas: 'Solicitação de revisão de decisões automatizadas.'
    };
    return descriptions[type] || '';
  };

  // Get request urgency/complexity
  const getRequestComplexity = (type: DataSubjectRequestType) => {
    const high = ['eliminacao', 'portabilidade', 'revisao_decisoes_automatizadas'];
    const medium = ['acesso', 'correcao', 'informacao_uso_compartilhamento'];

    if (high.includes(type)) return { level: 'Alta', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', days: '15 dias' };
    if (medium.includes(type)) return { level: 'Média', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', days: '15 dias' };
    return { level: 'Baixa', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', days: '15 dias' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nova Solicitação do Titular</h2>
        <p className="text-muted-foreground">
          Registre uma nova solicitação de exercício de direitos do titular de dados pessoais
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Requester Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Titular
              </CardTitle>
              <CardDescription>
                Dados de identificação da pessoa que está fazendo a solicitação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requester_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="João Silva Santos"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requester_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="joao.silva@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requester_document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento (CPF/CNPJ)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Documento para verificação de identidade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requester_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Telefone para contato se necessário
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Request Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tipo de Solicitação
              </CardTitle>
              <CardDescription>
                Selecione o direito que o titular deseja exercer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="request_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direito a ser Exercido *</FormLabel>
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

              {/* Show description and complexity when type is selected */}
              {requestType && (
                <div className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {getRequestTypeDescription(requestType)}
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Complexidade:</span>
                      <Badge className={getRequestComplexity(requestType).color}>
                        {getRequestComplexity(requestType).level}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Prazo legal: <strong>{getRequestComplexity(requestType).days}</strong>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Solicitação</CardTitle>
              <CardDescription>
                Informações específicas sobre a solicitação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="request_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Solicitação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente o que está sendo solicitado..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Forneça detalhes específicos sobre a solicitação para facilitar o processamento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show specific data field for relevant request types */}
              {(requestType === 'acesso' || requestType === 'correcao' || requestType === 'eliminacao') && (
                <FormField
                  control={form.control}
                  name="specific_data_requested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dados Específicos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Especifique quais dados pessoais são objeto desta solicitação..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Liste especificamente quais dados pessoais estão sendo solicitados
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Data Categories Selection */}
              <div className="space-y-3">
                <Label>Categorias de Dados Envolvidas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(DATA_CATEGORIES).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${key}`}
                        checked={selectedCategories.includes(key)}
                        onCheckedChange={(checked) => handleCategoryChange(key, !!checked)}
                      />
                      <Label
                        htmlFor={`category-${key}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione as categorias de dados pessoais relacionadas a esta solicitação
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Informações Importantes:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• A identidade do titular será verificada antes do processamento</li>
                <li>• O prazo legal para resposta é de 15 dias corridos</li>
                <li>• Em caso de complexidade, o prazo pode ser prorrogado por mais 15 dias</li>
                <li>• Todas as comunicações serão registradas para fins de auditoria</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <Separator />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Solicitação'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}