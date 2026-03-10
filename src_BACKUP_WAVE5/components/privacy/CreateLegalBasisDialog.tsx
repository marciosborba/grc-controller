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

import { LegalBasis, LegalBasisType, LEGAL_BASIS_TYPES, DATA_CATEGORIES } from '@/types/privacy-management';

// Validation schema
const createLegalBasisSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  legal_basis_type: z.enum([
    'consentimento',
    'contrato',
    'obrigacao_legal',
    'protecao_vida',
    'interesse_publico',
    'interesse_legitimo',
    'exercicio_direitos'
  ] as const),
  legal_article: z.string().min(5, 'Artigo legal deve ser especificado'),
  justification: z.string().min(20, 'Justificativa deve ter pelo menos 20 caracteres'),
  applies_to_categories: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria de dados'),
  applies_to_processing: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de processamento'),
  valid_from: z.string().min(1, 'Data de início é obrigatória'),
  valid_until: z.string().optional(),
  legal_responsible_id: z.string().optional()
});

type CreateLegalBasisFormData = z.infer<typeof createLegalBasisSchema>;

interface CreateLegalBasisDialogProps {
  onCreateBasis: (data: Partial<LegalBasis>) => Promise<void>;
}

const PROCESSING_TYPES = [
  'marketing',
  'comunicacao_comercial',
  'analise_comportamental',
  'gestao_rh',
  'folha_pagamento',
  'controle_acesso',
  'contabilidade',
  'declaracoes_fiscais',
  'videomonitoramento',
  'seguranca',
  'atendimento_cliente',
  'suporte_tecnico',
  'pesquisa_satisfacao',
  'desenvolvimento_produtos',
  'outros'
];

export function CreateLegalBasisDialog({ onCreateBasis }: CreateLegalBasisDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProcessing, setSelectedProcessing] = useState<string[]>([]);

  const form = useForm<CreateLegalBasisFormData>({
    resolver: zodResolver(createLegalBasisSchema),
    defaultValues: {
      name: '',
      description: '',
      legal_article: '',
      justification: '',
      applies_to_categories: [],
      applies_to_processing: [],
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      legal_responsible_id: ''
    }
  });

  const legalBasisType = form.watch('legal_basis_type');

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    setSelectedCategories(newCategories);
    form.setValue('applies_to_categories', newCategories);
  };

  // Handle processing type selection
  const handleProcessingChange = (processing: string, checked: boolean) => {
    const newProcessing = checked
      ? [...selectedProcessing, processing]
      : selectedProcessing.filter(p => p !== processing);
    
    setSelectedProcessing(newProcessing);
    form.setValue('applies_to_processing', newProcessing);
  };

  // Handle form submission
  const handleSubmit = async (data: CreateLegalBasisFormData) => {
    try {
      setLoading(true);
      
      const basisData: Partial<LegalBasis> = {
        ...data,
        applies_to_categories: selectedCategories,
        applies_to_processing: selectedProcessing,
        valid_until: data.valid_until || undefined
      };

      await onCreateBasis(basisData);
      
      // Reset form
      form.reset();
      setSelectedCategories([]);
      setSelectedProcessing([]);
      
    } catch (error) {
      console.error('Error creating legal basis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get legal basis type info
  const getLegalBasisInfo = (type: LegalBasisType) => {
    const info = {
      consentimento: {
        description: 'O titular forneceu consentimento livre, informado e inequívoco.',
        article: 'Art. 7º, I da LGPD',
        examples: 'Newsletters, marketing, análise comportamental',
        color: 'text-blue-600'
      },
      contrato: {
        description: 'Necessário para execução de contrato do qual o titular é parte.',
        article: 'Art. 7º, V da LGPD',
        examples: 'Dados de funcionários, clientes, fornecedores',
        color: 'text-green-600'
      },
      obrigacao_legal: {
        description: 'Para cumprimento de obrigação legal ou regulatória.',
        article: 'Art. 7º, II da LGPD',
        examples: 'Declarações fiscais, obrigações trabalhistas',
        color: 'text-purple-600'
      },
      protecao_vida: {
        description: 'Para proteção da vida ou incolumidade física do titular.',
        article: 'Art. 7º, III da LGPD',
        examples: 'Emergências médicas, situações de risco',
        color: 'text-red-600'
      },
      interesse_publico: {
        description: 'Para execução de políticas públicas previstas em lei.',
        article: 'Art. 7º, IV da LGPD',
        examples: 'Serviços públicos, políticas governamentais',
        color: 'text-orange-600'
      },
      interesse_legitimo: {
        description: 'Para atender interesses legítimos do controlador.',
        article: 'Art. 7º, IX da LGPD',
        examples: 'Segurança, prevenção de fraudes, apoio ao cliente',
        color: 'text-yellow-600'
      },
      exercicio_direitos: {
        description: 'Para exercício regular de direitos em processo judicial.',
        article: 'Art. 7º, VI da LGPD',
        examples: 'Processos judiciais, defesa de direitos',
        color: 'text-indigo-600'
      }
    };

    return info[type] || { description: '', article: '', examples: '', color: 'text-gray-600' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nova Base Legal</h2>
        <p className="text-muted-foreground">
          Crie uma nova base legal para tratamento de dados pessoais conforme a LGPD
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados fundamentais da base legal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Base Legal *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Consentimento para Marketing"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente esta base legal..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explique claramente o propósito e contexto desta base legal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Legal Basis Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tipo de Base Legal
              </CardTitle>
              <CardDescription>
                Selecione o fundamento legal conforme a LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="legal_basis_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fundamento Legal *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de base legal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(LEGAL_BASIS_TYPES).map(([key, label]) => (
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
              {legalBasisType && (
                <Alert>
                  <div className="flex items-start gap-3">
                    <Info className={`w-5 h-5 mt-0.5 ${getLegalBasisInfo(legalBasisType).color}`} />
                    <div>
                      <AlertDescription>
                        <strong>{LEGAL_BASIS_TYPES[legalBasisType]}</strong>
                        <br />
                        {getLegalBasisInfo(legalBasisType).description}
                        <br />
                        <span className="text-sm font-medium">
                          Fundamento: {getLegalBasisInfo(legalBasisType).article}
                        </span>
                        <br />
                        <span className="text-sm text-muted-foreground">
                          Exemplos: {getLegalBasisInfo(legalBasisType).examples}
                        </span>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="legal_article"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artigo Legal *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Art. 7º, I da LGPD"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Referência específica do artigo da lei
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legal_responsible_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável Legal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Nenhum responsável específico</SelectItem>
                          <SelectItem value="00000000-0000-0000-0000-000000000001">DPO - Data Protection Officer</SelectItem>
                          <SelectItem value="00000000-0000-0000-0000-000000000002">Departamento Jurídico</SelectItem>
                          <SelectItem value="00000000-0000-0000-0000-000000000003">Compliance Officer</SelectItem>
                          <SelectItem value="00000000-0000-0000-0000-000000000004">Diretor de TI</SelectItem>
                          <SelectItem value="00000000-0000-0000-0000-000000000005">Diretor de RH</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificativa Legal *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Justifique detalhadamente a necessidade e adequação desta base legal..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explique por que esta base legal é apropriada e necessária para o tratamento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Applicability */}
          <Card>
            <CardHeader>
              <CardTitle>Aplicabilidade</CardTitle>
              <CardDescription>
                Defina a quais categorias de dados e tipos de processamento esta base se aplica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Categories */}
              <div className="space-y-3">
                <Label>Categorias de Dados Aplicáveis *</Label>
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
                  Selecione as categorias de dados pessoais às quais esta base legal se aplica
                </p>
              </div>

              {/* Processing Types */}
              <div className="space-y-3">
                <Label>Tipos de Processamento Aplicáveis *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PROCESSING_TYPES.map((processing) => (
                    <div key={processing} className="flex items-center space-x-2">
                      <Checkbox
                        id={`processing-${processing}`}
                        checked={selectedProcessing.includes(processing)}
                        onCheckedChange={(checked) => handleProcessingChange(processing, !!checked)}
                      />
                      <Label
                        htmlFor={`processing-${processing}`}
                        className="text-sm font-normal cursor-pointer capitalize"
                      >
                        {processing.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione os tipos de processamento cobertos por esta base legal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Período de Validade
              </CardTitle>
              <CardDescription>
                Defina quando esta base legal é válida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valid_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válida a partir de *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válida até (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Deixe em branco se não houver prazo de validade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Informações Importantes:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Esta base legal será submetida à validação jurídica</li>
                <li>• Todas as alterações são registradas para auditoria</li>
                <li>• A base legal deve estar alinhada com as finalidades do tratamento</li>
                <li>• Consentimentos podem ser revogados a qualquer momento pelo titular</li>
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
              {loading ? 'Criando...' : 'Criar Base Legal'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}