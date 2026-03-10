import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Info, Calendar, Building, Tag, AlertTriangle, Library, Lightbulb, Star, TrendingUp, Copy, Sparkles } from 'lucide-react';
import { RiskLibraryIntegrated } from '../../shared/RiskLibraryIntegrated';
import type { RiskTemplate } from '@/types/riskTemplate';
import { useToast } from '@/hooks/use-toast';

interface Step1Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  onSave?: () => void;
}

const RISK_CATEGORIES = [
  { value: 'strategic', label: 'Estratégico', icon: '🎯' },
  { value: 'operational', label: 'Operacional', icon: '⚙️' },
  { value: 'financial', label: 'Financeiro', icon: '💰' },
  { value: 'compliance', label: 'Compliance', icon: '📋' },
  { value: 'reputation', label: 'Reputacional', icon: '🏆' },
  { value: 'technology', label: 'Tecnológico', icon: '💻' },
  { value: 'environmental', label: 'Ambiental', icon: '🌱' },
  { value: 'security', label: 'Segurança', icon: '🔒' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'market', label: 'Mercado', icon: '📈' },
  { value: 'credit', label: 'Crédito', icon: '💳' },
  { value: 'liquidity', label: 'Liquidez', icon: '🔄' }
];

const RISK_SOURCES = [
  { value: 'internal_audit', label: 'Auditoria Interna' },
  { value: 'external_audit', label: 'Auditoria Externa' },
  { value: 'compliance_review', label: 'Revisão de Compliance' },
  { value: 'risk_assessment', label: 'Avaliação de Riscos' },
  { value: 'incident_report', label: 'Relatório de Incidente' },
  { value: 'regulatory_change', label: 'Mudança Regulatória' },
  { value: 'market_analysis', label: 'Análise de Mercado' },
  { value: 'employee_report', label: 'Relato de Funcionário' },
  { value: 'customer_feedback', label: 'Feedback de Cliente' },
  { value: 'supplier_assessment', label: 'Avaliação de Fornecedor' },
  { value: 'technology_review', label: 'Revisão Tecnológica' },
  { value: 'strategic_planning', label: 'Planejamento Estratégico' },
  { value: 'risk_library', label: 'Biblioteca de Riscos' }
];

const BUSINESS_AREAS = [
  { value: 'governance', label: 'Governança Corporativa' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'operations', label: 'Operações' },
  { value: 'technology', label: 'Tecnologia da Informação' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'legal', label: 'Jurídico' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'sales', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'procurement', label: 'Compras/Procurement' },
  { value: 'risk_management', label: 'Gestão de Riscos' },
  { value: 'internal_audit', label: 'Auditoria Interna' },
  { value: 'customer_service', label: 'Atendimento ao Cliente' },
  { value: 'logistics', label: 'Logística' },
  { value: 'quality', label: 'Qualidade' },
  { value: 'security', label: 'Segurança' }
];

export const Step1Identification: React.FC<Step1Props> = ({
  data,
  updateData
}) => {
  const [showRiskLibrary, setShowRiskLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RiskTemplate | null>(
    data.template_id ? { 
      id: data.template_id, 
      name: data.risk_title, 
      description: data.risk_description,
      category: data.risk_category,
      methodology: data.template_methodology,
      probability: data.template_probability,
      impact: data.template_impact
    } as RiskTemplate : null
  );
  const { toast } = useToast();

  const handleTemplateSelect = (template: RiskTemplate) => {
    setSelectedTemplate(template);
    
    // Mapear dados do template para os campos do formulário
    const templateData = {
      risk_title: template.name,
      risk_description: template.description,
      risk_category: template.category,
      risk_source: 'risk_library',
      identified_date: new Date().toISOString().split('T')[0],
      // Dados adicionais do template
      template_id: template.id,
      template_methodology: template.methodology,
      template_probability: template.probability,
      template_impact: template.impact
    };
    
    updateData(templateData);
    setShowRiskLibrary(false);
    
    toast({
      title: '📚 Template Aplicado',
      description: `Risco "${template.name}" foi carregado da biblioteca como base para este registro.`,
    });
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    updateData({
      risk_title: '',
      risk_description: '',
      risk_category: '',
      risk_source: '',
      template_id: null,
      template_methodology: null,
      template_probability: null,
      template_impact: null
    });
    
    toast({
      title: '🗑️ Template Removido',
      description: 'Os dados do template foram limpos. Você pode preencher manualmente.',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const isRequired = (field: string) => {
    const requiredFields = ['risk_title', 'risk_description', 'risk_category'];
    return requiredFields.includes(field);
  };

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Identificação do Risco
          </CardTitle>
          <CardDescription>
            Forneça as informações básicas para identificar e categorizar este risco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Etapa 1 de 7:</strong> Defina claramente o risco, sua categoria e origem. 
              Essas informações servirão de base para todas as análises subsequentes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Integração com Biblioteca de Riscos */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="h-5 w-5 text-purple-500" />
            Biblioteca de Riscos
            <Badge variant="outline" className="ml-2 text-purple-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Acelere o processo
            </Badge>
          </CardTitle>
          <CardDescription>
            Use um template da biblioteca como base ou preencha manualmente os dados do risco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTemplate ? (
            <div className="space-y-4">
              {/* Template Selecionado */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                        <Star className="h-3 w-3 mr-1" />
                        Template da Biblioteca
                      </Badge>
                      {selectedTemplate.isPopular && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-lg">{selectedTemplate.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Categoria: {selectedTemplate.category}</span>
                      <span>Metodologia: {selectedTemplate.methodology}</span>
                      <span>Impacto: {selectedTemplate.impact}/5</span>
                      <span>Probabilidade: {selectedTemplate.probability}/5</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearTemplate}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remover
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Template Aplicado:</strong> Os campos abaixo foram preenchidos com base no template selecionado. 
                  Você pode modificar qualquer informação conforme necessário.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Usar Template da Biblioteca?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Acelere o processo selecionando um risco predefinido da nossa biblioteca como ponto de partida.
                </p>
                <Dialog open={showRiskLibrary} onOpenChange={setShowRiskLibrary}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Library className="h-4 w-4" />
                      Explorar Biblioteca de Riscos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Library className="h-5 w-5 text-purple-500" />
                        Biblioteca de Riscos
                      </DialogTitle>
                      <DialogDescription>
                        Selecione um template de risco para usar como base para este registro.
                      </DialogDescription>
                    </DialogHeader>
                    <RiskLibraryIntegrated onSelectTemplate={handleTemplateSelect} />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou preencher manualmente</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Básicas do Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Dados Básicos do Risco
            {selectedTemplate && (
              <Badge variant="outline" className="ml-2 text-purple-600">
                <Copy className="h-3 w-3 mr-1" />
                Baseado em Template
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {selectedTemplate 
              ? 'Revise e ajuste as informações carregadas do template conforme necessário.'
              : 'Identifique e descreva claramente o risco identificado.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título do Risco */}
            <div className="md:col-span-2">
              <Label htmlFor="risk_title" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Título do Risco *
                {selectedTemplate && (
                  <Badge variant="outline" className="text-xs text-purple-600">
                    Do template
                  </Badge>
                )}
                {isRequired('risk_title') && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="risk_title"
                value={data.risk_title || ''}
                onChange={(e) => handleInputChange('risk_title', e.target.value)}
                placeholder={selectedTemplate ? "Título carregado do template (editável)" : "Ex: Falha no sistema de backup de dados críticos"}
                className={`mt-1 ${selectedTemplate ? 'border-purple-200 bg-purple-50/50' : ''}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedTemplate 
                  ? "Você pode modificar o título carregado do template conforme necessário."
                  : "Descreva o risco de forma clara e concisa"}
              </p>
            </div>

            {/* Categoria do Risco */}
            <div>
              <Label htmlFor="risk_category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categoria do Risco *
                {selectedTemplate && (
                  <Badge variant="outline" className="text-xs text-purple-600">
                    Do template
                  </Badge>
                )}
                {isRequired('risk_category') && <span className="text-red-500">*</span>}
              </Label>
              <Select 
                value={data.risk_category || ''} 
                onValueChange={(value) => handleInputChange('risk_category', value)}
              >
                <SelectTrigger className={`mt-1 ${selectedTemplate ? 'border-purple-200 bg-purple-50/50' : ''}`}>
                  <SelectValue placeholder={selectedTemplate ? "Categoria do template selecionada" : "Selecione a categoria"} />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        {category.icon} {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fonte do Risco */}
            <div>
              <Label htmlFor="risk_source" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Fonte de Identificação
              </Label>
              <Select 
                value={data.risk_source || ''} 
                onValueChange={(value) => handleInputChange('risk_source', value)}
              >
                <SelectTrigger className={`mt-1 ${data.risk_source === 'risk_library' ? 'border-purple-200 bg-purple-50/50' : ''}`}>
                  <SelectValue placeholder={selectedTemplate ? "Origem: Biblioteca de Riscos" : "Como o risco foi identificado?"} />
                </SelectTrigger>
                <SelectContent>
                  {RISK_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Identificação */}
            <div>
              <Label htmlFor="identified_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Identificação
              </Label>
              <Input
                id="identified_date"
                type="date"
                value={data.identified_date || ''}
                onChange={(e) => handleInputChange('identified_date', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Área de Negócio */}
            <div>
              <Label htmlFor="business_area" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Área de Negócio Afetada
              </Label>
              <Select 
                value={data.business_area || ''} 
                onValueChange={(value) => handleInputChange('business_area', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Área impactada pelo risco" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_AREAS.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <Label htmlFor="risk_description" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Descrição Detalhada do Risco *
              {selectedTemplate && (
                <Badge variant="outline" className="text-xs text-purple-600">
                  Do template
                </Badge>
              )}
              {isRequired('risk_description') && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="risk_description"
              value={data.risk_description || ''}
              onChange={(e) => handleInputChange('risk_description', e.target.value)}
              placeholder={selectedTemplate ? "Descrição carregada do template (editável)" : "Descreva detalhadamente o risco, suas possíveis causas e consequências..."}
              rows={6}
              className={`mt-1 ${selectedTemplate ? 'border-purple-200 bg-purple-50/50' : ''}`}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {selectedTemplate 
                  ? "Você pode ajustar a descrição do template para adequar ao contexto específico."
                  : "Inclua contexto, causas potenciais e possíveis impactos"}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.risk_description?.length || 0}/500 caracteres
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines e Boas Práticas */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Diretrizes para Identificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-2">✅ Boas Práticas</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use templates da biblioteca quando disponíveis</li>
                <li>• Use títulos específicos e descritivos</li>
                <li>• Identifique causas e consequências</li>
                <li>• Considere diferentes cenários</li>
                <li>• Documente evidências disponíveis</li>
                <li>• Relacione com objetivos estratégicos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">⚠️ Evite</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Descrições muito genéricas</li>
                <li>• Confundir riscos com problemas</li>
                <li>• Omitir contexto importante</li>
                <li>• Usar jargão técnico excessivo</li>
                <li>• Deixar campos obrigatórios vazios</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm">
              <strong>Lembre-se:</strong> Um risco bem identificado é a base para uma análise 
              eficaz e um tratamento adequado. Use a biblioteca de riscos para acelerar o processo 
              com templates testados e aprovados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Campos Obrigatórios */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                data.risk_title && data.risk_description && data.risk_category 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 1: Identificação
              </span>
              {selectedTemplate && (
                <Badge variant="outline" className="text-xs text-purple-600">
                  <Library className="h-3 w-3 mr-1" />
                  Com template
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {[data.risk_title, data.risk_description, data.risk_category].filter(Boolean).length}/3 campos obrigatórios
            </div>
          </div>
          
          {(!data.risk_title || !data.risk_description || !data.risk_category) && (
            <div className="mt-3 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Complete todos os campos obrigatórios (*) para prosseguir para a próxima etapa.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};