import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  Clock,
  Shield,
  Zap,
  FileText,
  Grid,
  Palette,
  GitBranch,
  Star,
  Settings,
  Database
} from 'lucide-react';

import { 
  ComplianceProcessTemplate,
  TemplateValidationResult,
  getFieldTypeIcon
} from '@/types/compliance-process-templates';

interface TemplatePreviewProps {
  template: Partial<ComplianceProcessTemplate>;
  validationResult?: TemplateValidationResult | null;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  validationResult
}) => {
  const fields = template.field_definitions?.fields || [];
  const states = template.workflow_definition?.states || [];
  const transitions = template.workflow_definition?.transitions || [];

  const getFieldIcon = (type: string) => {
    const iconName = getFieldTypeIcon(type as any);
    const icons = {
      Shield, Star, Grid, FileText, Settings, Database,
      Eye, CheckCircle, AlertTriangle, Info, Users, Clock
    };
    return icons[iconName as keyof typeof icons] || Info;
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-50 text-green-700 border-green-200';
      case 'internal': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confidential': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'restricted': return 'bg-red-50 text-red-700 border-red-200';
      case 'top_secret': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStateTypeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-100 text-green-700';
      case 'end': return 'bg-red-100 text-red-700';
      case 'task': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'approval': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Preview do Template</h3>
            <p className="text-sm text-muted-foreground">
              Visualize como o template ficará configurado
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {validationResult && (
              validationResult.isValid ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Válido
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationResult.errors.length} erro(s)
                </Badge>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Nome</div>
                  <div className="text-lg font-semibold">
                    {template.name || <span className="text-muted-foreground italic">Não definido</span>}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Framework</div>
                  <div className="text-lg">
                    <Badge variant="outline">
                      {template.framework || 'Não definido'}
                    </Badge>
                  </div>
                </div>
              </div>

              {template.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Descrição</div>
                  <div className="text-sm p-3 bg-gray-50 rounded-lg">
                    {template.description}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{template.is_active ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>{template.is_default_for_framework ? 'Padrão do Framework' : 'Template Customizado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    v{template.version || '1.0'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Configurações de Segurança</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSecurityLevelColor(template.security_config?.access_level || 'internal')}`}>
                    {template.security_config?.access_level || 'internal'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Nível de Acesso</div>
                </div>

                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    template.security_config?.encryption_required 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {template.security_config?.encryption_required ? 'Sim' : 'Não'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Criptografia</div>
                </div>

                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    template.security_config?.audit_trail 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {template.security_config?.audit_trail ? 'Ativa' : 'Inativa'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Auditoria</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    {template.security_config?.data_retention_days || 2555}d
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Retenção</div>
                </div>
              </div>

              {template.security_config?.compliance_tags && template.security_config.compliance_tags.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Tags de Compliance</div>
                  <div className="flex flex-wrap gap-2">
                    {template.security_config.compliance_tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fields Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Grid className="h-5 w-5" />
                  <span>Campos</span>
                </div>
                <Badge variant="outline">{fields.length} campo(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Grid className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum campo configurado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.slice(0, 5).map((field, index) => {
                    const IconComponent = getFieldIcon(field.type);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded ${
                            field.sensitive ? 'bg-red-100 text-red-600' :
                            field.required ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{field.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {field.name} • {field.type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {field.required && <Badge variant="outline" className="text-xs">Obrigatório</Badge>}
                          {field.sensitive && <Badge variant="outline" className="text-xs bg-red-50">Sensível</Badge>}
                        </div>
                      </div>
                    );
                  })}
                  
                  {fields.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... e mais {fields.length - 5} campo(s)
                    </div>
                  )}
                </div>
              )}

              {/* Field Statistics */}
              {fields.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-orange-600">
                        {fields.filter(f => f.required).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Obrigatórios</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {fields.filter(f => f.sensitive).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Sensíveis</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {new Set(fields.map(f => f.type)).size}
                      </div>
                      <div className="text-xs text-muted-foreground">Tipos Únicos</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5" />
                  <span>Workflow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{states.length} estado(s)</Badge>
                  <Badge variant="outline">{transitions.length} transição(ões)</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {states.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum workflow configurado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* States */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Estados</div>
                    <div className="flex flex-wrap gap-2">
                      {states.map((state, index) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className={`${getStateTypeColor(state.type)} text-xs`}
                        >
                          {state.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Transitions */}
                  {transitions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Principais Transições</div>
                      <div className="space-y-2">
                        {transitions.slice(0, 3).map((transition, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <span className="font-medium">{transition.name}:</span> {' '}
                            {states.find(s => s.id === transition.from_state)?.name} → {' '}
                            {states.find(s => s.id === transition.to_state)?.name}
                          </div>
                        ))}
                        {transitions.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            ... e mais {transitions.length - 3} transição(ões)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* UI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Configuração de Interface</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="font-medium">{template.ui_configuration?.layout || 'two_columns'}</div>
                  <div className="text-xs text-muted-foreground">Layout</div>
                </div>
                <div>
                  <div className="font-medium">{template.ui_configuration?.theme || 'default'}</div>
                  <div className="text-xs text-muted-foreground">Tema</div>
                </div>
                <div>
                  <div className={`font-medium ${
                    template.ui_configuration?.show_progress_bar ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {template.ui_configuration?.show_progress_bar ? 'Sim' : 'Não'}
                  </div>
                  <div className="text-xs text-muted-foreground">Progresso</div>
                </div>
                <div>
                  <div className={`font-medium ${
                    template.ui_configuration?.allow_draft_save ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {template.ui_configuration?.allow_draft_save ? 'Sim' : 'Não'}
                  </div>
                  <div className="text-xs text-muted-foreground">Rascunho</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Automação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    template.automation_config?.notifications_enabled ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">Notificações</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    template.automation_config?.auto_assignment ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">Auto-atribuição</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    template.automation_config?.ai_assistance ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">IA Assistente</span>
                </div>
              </div>

              {template.automation_config?.webhook_triggers && template.automation_config.webhook_triggers.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Webhooks Configurados</div>
                  <Badge variant="outline" className="text-xs">
                    {template.automation_config.webhook_triggers.length} webhook(s)
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && !validationResult.isValid && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Problemas de Validação</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>{error.field}:</strong> {error.message}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="flex-shrink-0 px-6 py-3 border-t bg-gray-50 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            Template: {template.name || 'Sem nome'} • {template.framework || 'Sem framework'}
          </span>
          <div className="flex items-center space-x-4">
            <span>{fields.length} campos</span>
            <span>{states.length} estados</span>
            <span>{transitions.length} transições</span>
          </div>
        </div>
      </div>
    </div>
  );
};