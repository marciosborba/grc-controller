import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Shield, 
  Calendar, 
  User,
  FileText,
  Info,
  Mail,
  Globe,
  Smartphone,
  Phone,
  Download,
  RefreshCw
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

import { Consent, CollectionMethod } from '@/types/privacy-management';

// Validation schema
const createConsentSchema = z.object({
  data_subject_email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter formato válido')
    .toLowerCase(),
  data_subject_name: z.string().optional(),
  purpose: z.string().min(10, 'Finalidade deve ter pelo menos 10 caracteres'),
  collection_method: z.enum([
    'website_form',
    'mobile_app', 
    'phone_call',
    'email',
    'physical_form',
    'api',
    'import',
    'other'
  ] as const),
  collection_source: z.string().optional(),
  legal_basis_id: z.string().optional(),
  expired_at: z.string().optional(),
  evidence_url: z.string().url().optional().or(z.literal('')),
  language: z.string().min(2, 'Idioma deve ser especificado'),
  is_informed: z.boolean(),
  is_specific: z.boolean(),
  is_free: z.boolean(),
  is_unambiguous: z.boolean(),
  additional_notes: z.string().optional()
});

type CreateConsentFormData = z.infer<typeof createConsentSchema>;

interface CreateConsentDialogProps {
  onCreateConsent: (data: Partial<Consent>) => Promise<void>;
}

const COLLECTION_METHODS: Record<CollectionMethod, { label: string; icon: React.ComponentType<any>; description: string }> = {
  website_form: {
    label: 'Formulário Web',
    icon: Globe,
    description: 'Consentimento coletado através de formulário no website'
  },
  mobile_app: {
    label: 'App Mobile',
    icon: Smartphone,
    description: 'Consentimento coletado através de aplicativo móvel'
  },
  phone_call: {
    label: 'Ligação Telefônica',
    icon: Phone,
    description: 'Consentimento obtido através de ligação telefônica'
  },
  email: {
    label: 'Email',
    icon: Mail,
    description: 'Consentimento obtido através de email'
  },
  physical_form: {
    label: 'Formulário Físico',
    icon: FileText,
    description: 'Consentimento coletado através de formulário impresso'
  },
  api: {
    label: 'API/Integração',
    icon: RefreshCw,
    description: 'Consentimento coletado através de integração API'
  },
  import: {
    label: 'Importação',
    icon: Download,
    description: 'Consentimento importado de sistema externo'
  },
  other: {
    label: 'Outro',
    icon: FileText,
    description: 'Outros métodos de coleta de consentimento'
  }
};

export function CreateConsentDialog({ onCreateConsent }: CreateConsentDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateConsentFormData>({
    resolver: zodResolver(createConsentSchema),
    defaultValues: {
      data_subject_email: '',
      data_subject_name: '',
      purpose: '',
      collection_source: '',
      legal_basis_id: '',
      expired_at: '',
      evidence_url: '',
      language: 'pt-BR',
      is_informed: true,
      is_specific: true,
      is_free: true,
      is_unambiguous: true,
      additional_notes: ''
    }
  });

  const collectionMethod = form.watch('collection_method');

  // Handle form submission
  const handleSubmit = async (data: CreateConsentFormData) => {
    try {
      setLoading(true);
      
      const consentData: Partial<Consent> = {
        ...data,
        expired_at: data.expired_at || undefined,
        evidence_url: data.evidence_url || undefined,
        collection_source: data.collection_source || undefined,
        legal_basis_id: data.legal_basis_id || undefined,
        additional_notes: data.additional_notes || undefined
      };

      await onCreateConsent(consentData);
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Error creating consent:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get collection method info
  const getCollectionMethodInfo = (method?: CollectionMethod) => {
    if (!method) return null;
    return COLLECTION_METHODS[method];
  };

  const methodInfo = getCollectionMethodInfo(collectionMethod);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Registrar Novo Consentimento</h2>
        <p className="text-muted-foreground">
          Registre um consentimento LGPD coletado do titular dos dados
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Data Subject Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Titular
              </CardTitle>
              <CardDescription>
                Informações básicas do titular dos dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="data_subject_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Titular *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="titular@exemplo.com"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Email do titular dos dados pessoais
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_subject_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Titular (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome completo do titular"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nome completo do titular (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Consent Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Detalhes do Consentimento
              </CardTitle>
              <CardDescription>
                Informações específicas do consentimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finalidade do Tratamento *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva claramente a finalidade para qual o consentimento foi coletado..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descreva de forma clara e específica a finalidade do tratamento dos dados
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="collection_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Coleta *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método de coleta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(COLLECTION_METHODS).map(([key, method]) => {
                            const Icon = method.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {method.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma do Consentimento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Collection method info */}
              {methodInfo && (
                <Alert>
                  <div className="flex items-start gap-3">
                    <methodInfo.icon className="w-5 h-5 mt-0.5 text-blue-600" />
                    <div>
                      <AlertDescription>
                        <strong>{methodInfo.label}</strong>
                        <br />
                        {methodInfo.description}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="collection_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte de Coleta (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: site.exemplo.com/cadastro"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL ou localização específica onde foi coletado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidence_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Evidência (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://exemplo.com/evidencia"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Link para comprovante ou evidência do consentimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* LGPD Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requisitos LGPD</CardTitle>
              <CardDescription>
                Confirme que o consentimento atende aos requisitos da Lei Geral de Proteção de Dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="is_informed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Consentimento Informado
                        </FormLabel>
                        <FormDescription>
                          O titular foi devidamente informado sobre o tratamento dos seus dados
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_specific"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Consentimento Específico
                        </FormLabel>
                        <FormDescription>
                          O consentimento é específico para finalidades determinadas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_free"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Consentimento Livre
                        </FormLabel>
                        <FormDescription>
                          O titular pôde escolher livremente, sem coação ou vício
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_unambiguous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Consentimento Inequívoco
                        </FormLabel>
                        <FormDescription>
                          O consentimento foi manifestado de forma clara e inequívoca
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Opções Adicionais
              </CardTitle>
              <CardDescription>
                Configurações opcionais para o consentimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expired_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Expiração (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Data em que o consentimento expira automaticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legal_basis_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Legal Associada (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma base legal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          <SelectItem value="marketing">Base Legal - Marketing</SelectItem>
                          <SelectItem value="comunicacao">Base Legal - Comunicação</SelectItem>
                          <SelectItem value="analise">Base Legal - Análise de Dados</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Base legal específica associada a este consentimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações ou informações complementares sobre este consentimento..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Informações adicionais relevantes para este consentimento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Informações Importantes:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Este registro deve refletir um consentimento já coletado do titular</li>
                <li>• Certifique-se de que todos os requisitos LGPD foram atendidos</li>
                <li>• O consentimento pode ser revogado a qualquer momento pelo titular</li>
                <li>• Mantenha evidências e comprovantes do consentimento coletado</li>
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
              {loading ? 'Registrando...' : 'Registrar Consentimento'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}