import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Palette,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Eye
} from 'lucide-react';

import { UIConfiguration, CustomFieldDefinition, UI_LAYOUTS } from '@/types/compliance-process-templates';

interface UIBuilderPanelProps {
  config: UIConfiguration;
  fields: CustomFieldDefinition[];
  onChange: (config: UIConfiguration) => void;
  readonly?: boolean;
}

export const UIBuilderPanel: React.FC<UIBuilderPanelProps> = ({
  config,
  fields,
  onChange,
  readonly = false
}) => {
  const handleConfigChange = (key: keyof UIConfiguration, value: any) => {
    if (readonly) return;
    onChange({
      ...config,
      [key]: value
    });
  };

  const handleNestedConfigChange = (section: string, key: string, value: any) => {
    if (readonly) return;
    onChange({
      ...config,
      [section]: {
        ...config[section as keyof UIConfiguration],
        [key]: value
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Construtor de Interface</h3>
            <p className="text-sm text-muted-foreground">
              Configure a aparência e comportamento da interface
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layout className="h-5 w-5" />
                <span>Layout</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Layout Principal</Label>
                  <Select
                    value={config.layout}
                    onValueChange={(value) => handleConfigChange('layout', value)}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_column">Coluna Única</SelectItem>
                      <SelectItem value="two_columns">Duas Colunas</SelectItem>
                      <SelectItem value="three_columns">Três Colunas</SelectItem>
                      <SelectItem value="tabs">Abas</SelectItem>
                      <SelectItem value="accordion">Accordion</SelectItem>
                      <SelectItem value="wizard">Assistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={config.theme}
                    onValueChange={(value) => handleConfigChange('theme', value)}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="compact">Compacto</SelectItem>
                      <SelectItem value="modern">Moderno</SelectItem>
                      <SelectItem value="classic">Clássico</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.show_progress_bar}
                    onCheckedChange={(checked) => handleConfigChange('show_progress_bar', checked)}
                    disabled={readonly}
                  />
                  <Label>Barra de Progresso</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.allow_draft_save}
                    onCheckedChange={(checked) => handleConfigChange('allow_draft_save', checked)}
                    disabled={readonly}
                  />
                  <Label>Salvar Rascunho</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Navegação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.navigation.show_section_navigation}
                    onCheckedChange={(checked) => handleNestedConfigChange('navigation', 'show_section_navigation', checked)}
                    disabled={readonly}
                  />
                  <Label>Mostrar Navegação de Seções</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.navigation.enable_jump_to_section}
                    onCheckedChange={(checked) => handleNestedConfigChange('navigation', 'enable_jump_to_section', checked)}
                    disabled={readonly}
                  />
                  <Label>Permitir Pular para Seção</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.navigation.show_completion_percentage}
                    onCheckedChange={(checked) => handleNestedConfigChange('navigation', 'show_completion_percentage', checked)}
                    disabled={readonly}
                  />
                  <Label>Mostrar % de Conclusão</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Validação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.validation.validate_on_change}
                    onCheckedChange={(checked) => handleNestedConfigChange('validation', 'validate_on_change', checked)}
                    disabled={readonly}
                  />
                  <Label>Validar ao Alterar</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.validation.validate_on_save}
                    onCheckedChange={(checked) => handleNestedConfigChange('validation', 'validate_on_save', checked)}
                    disabled={readonly}
                  />
                  <Label>Validar ao Salvar</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.validation.show_inline_errors}
                    onCheckedChange={(checked) => handleNestedConfigChange('validation', 'show_inline_errors', checked)}
                    disabled={readonly}
                  />
                  <Label>Mostrar Erros Inline</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.validation.highlight_required_fields}
                    onCheckedChange={(checked) => handleNestedConfigChange('validation', 'highlight_required_fields', checked)}
                    disabled={readonly}
                  />
                  <Label>Destacar Campos Obrigatórios</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Responsividade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile</span>
                  </Label>
                  <Select
                    value={config.responsive.mobile_layout}
                    onValueChange={(value) => handleNestedConfigChange('responsive', 'mobile_layout', value)}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stacked">Empilhado</SelectItem>
                      <SelectItem value="collapsed">Colapsado</SelectItem>
                      <SelectItem value="tabbed">Em Abas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Tablet className="h-4 w-4" />
                    <span>Tablet</span>
                  </Label>
                  <Select
                    value={config.responsive.tablet_columns.toString()}
                    onValueChange={(value) => handleNestedConfigChange('responsive', 'tablet_columns', parseInt(value))}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Coluna</SelectItem>
                      <SelectItem value="2">2 Colunas</SelectItem>
                      <SelectItem value="3">3 Colunas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>Desktop</span>
                  </Label>
                  <Select
                    value={config.responsive.desktop_columns.toString()}
                    onValueChange={(value) => handleNestedConfigChange('responsive', 'desktop_columns', parseInt(value))}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Coluna</SelectItem>
                      <SelectItem value="2">2 Colunas</SelectItem>
                      <SelectItem value="3">3 Colunas</SelectItem>
                      <SelectItem value="4">4 Colunas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview da Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Preview interativo da interface será implementado em uma versão futura
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                  <Badge variant="outline">{config.layout}</Badge>
                  <Badge variant="outline">{config.theme}</Badge>
                  <Badge variant="outline">{fields.length} campos</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};