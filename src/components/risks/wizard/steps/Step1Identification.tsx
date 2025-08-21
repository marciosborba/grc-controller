import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, Info, Calendar, Building, Tag, AlertTriangle } from 'lucide-react';

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
  { value: 'strategic_planning', label: 'Planejamento Estratégico' }
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
  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const isRequired = (field: string) => {
    const requiredFields = ['risk_title', 'risk_description', 'risk_category'];
    return requiredFields.includes(field);
  };

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Identificação do Risco
          </CardTitle>
          <CardDescription>
            Forneça as informações básicas sobre o risco identificado para iniciar o processo de análise e tratamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Seja específico e detalhado na descrição do risco. 
              Isso facilitará as análises nas etapas seguintes e garantirá um tratamento adequado.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título do Risco */}
            <div className="md:col-span-2">
              <Label htmlFor="risk_title" className="flex items-center gap-2">
                Título do Risco *
                {isRequired('risk_title') && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="risk_title"
                value={data.risk_title || ''}
                onChange={(e) => handleInputChange('risk_title', e.target.value)}
                placeholder="Ex: Falha no sistema de backup de dados críticos"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Descreva o risco de forma clara e concisa
              </p>
            </div>

            {/* Categoria do Risco */}
            <div>
              <Label htmlFor="risk_category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categoria do Risco *
                {isRequired('risk_category') && <span className="text-red-500">*</span>}
              </Label>
              <Select 
                value={data.risk_category || ''} 
                onValueChange={(value) => handleInputChange('risk_category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a categoria" />
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
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Como o risco foi identificado?" />
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
              Descrição Detalhada do Risco *
              {isRequired('risk_description') && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="risk_description"
              value={data.risk_description || ''}
              onChange={(e) => handleInputChange('risk_description', e.target.value)}
              placeholder="Descreva detalhadamente o risco, suas possíveis causas e consequências..."
              rows={6}
              className="mt-1"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Inclua contexto, causas potenciais e possíveis impactos
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
              eficaz e um tratamento adequado. Dedique tempo suficiente para esta etapa inicial.
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