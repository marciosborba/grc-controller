import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  Database,
  Clock,
  Trash2,
  Bell,
  Zap,
  Webhook,
  Plus,
  Settings
} from 'lucide-react';

import { 
  ComplianceProcessTemplate,
  SECURITY_ACCESS_LEVELS 
} from '@/types/compliance-process-templates';

interface SecurityConfigPanelProps {
  config: ComplianceProcessTemplate['security_config'];
  automationConfig: ComplianceProcessTemplate['automation_config'];
  onChange: (config: any) => void;
  readonly?: boolean;
}

export const SecurityConfigPanel: React.FC<SecurityConfigPanelProps> = ({
  config,
  automationConfig,
  onChange,
  readonly = false
}) => {
  const handleSecurityChange = (key: string, value: any) => {
    if (readonly) return;
    onChange({
      security_config: {
        ...config,
        [key]: value
      },
      automation_config: automationConfig
    });
  };

  const handleAutomationChange = (key: string, value: any) => {
    if (readonly) return;
    onChange({
      security_config: config,
      automation_config: {
        ...automationConfig,
        [key]: value
      }
    });
  };

  const addComplianceTag = () => {
    if (readonly) return;
    const newTag = `tag_${Date.now()}`;
    handleSecurityChange('compliance_tags', [...(config.compliance_tags || []), newTag]);
  };

  const removeComplianceTag = (index: number) => {
    if (readonly) return;
    const newTags = [...(config.compliance_tags || [])];
    newTags.splice(index, 1);
    handleSecurityChange('compliance_tags', newTags);
  };

  const updateComplianceTag = (index: number, value: string) => {
    if (readonly) return;
    const newTags = [...(config.compliance_tags || [])];
    newTags[index] = value;
    handleSecurityChange('compliance_tags', newTags);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
            <p className="text-sm text-muted-foreground">
              Configure a segurança e automação do template
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {config.encryption_required && <Badge variant="outline" className="bg-green-50">Criptografado</Badge>}
            {config.audit_trail && <Badge variant="outline" className="bg-blue-50">Auditoria</Badge>}
            <Badge variant="outline" className={
              config.access_level === 'public' ? 'bg-green-50' :
              config.access_level === 'internal' ? 'bg-yellow-50' :
              config.access_level === 'confidential' ? 'bg-orange-50' :
              config.access_level === 'restricted' ? 'bg-red-50' :
              config.access_level === 'top_secret' ? 'bg-purple-50' : 'bg-gray-50'
            }>
              {config.access_level}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Proteção de Dados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select
                    value={config.access_level}
                    onValueChange={(value) => handleSecurityChange('access_level', value)}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Público</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="internal">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span>Interno</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="confidential">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span>Confidencial</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="restricted">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Restrito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="top_secret">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span>Ultra Secreto</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tratamento de PII</Label>
                  <Select
                    value={config.pii_handling}
                    onValueChange={(value) => handleSecurityChange('pii_handling', value)}
                    disabled={readonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="anonymize">Anonimizar</SelectItem>
                      <SelectItem value="encrypt">Criptografar</SelectItem>
                      <SelectItem value="delete">Excluir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.encryption_required}
                    onCheckedChange={(checked) => handleSecurityChange('encryption_required', checked)}
                    disabled={readonly}
                  />
                  <Label>Criptografia Obrigatória</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.audit_trail}
                    onCheckedChange={(checked) => handleSecurityChange('audit_trail', checked)}
                    disabled={readonly}
                  />
                  <Label>Trilha de Auditoria</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Retenção de Dados (dias)</Label>
                <Input
                  type="number"
                  value={config.data_retention_days}
                  onChange={(e) => handleSecurityChange('data_retention_days', parseInt(e.target.value))}
                  disabled={readonly}
                  min="1"
                  max="7300"
                />
                <p className="text-xs text-muted-foreground">
                  {config.data_retention_days} dias = {Math.round(config.data_retention_days / 365 * 10) / 10} anos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Tags de Compliance</span>
                </div>
                {!readonly && (
                  <Button variant="outline" size="sm" onClick={addComplianceTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tag
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config.compliance_tags?.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Input
                      value={tag}
                      onChange={(e) => updateComplianceTag(index, e.target.value)}
                      placeholder="Nome da tag"
                      disabled={readonly}
                    />
                    {!readonly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeComplianceTag(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {(!config.compliance_tags || config.compliance_tags.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma tag de compliance configurada</p>
                    <p className="text-sm">Tags ajudam na categorização e busca</p>
                  </div>
                )}
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={automationConfig.notifications_enabled}
                    onCheckedChange={(checked) => handleAutomationChange('notifications_enabled', checked)}
                    disabled={readonly}
                  />
                  <Label className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Notificações Ativas</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={automationConfig.auto_assignment}
                    onCheckedChange={(checked) => handleAutomationChange('auto_assignment', checked)}
                    disabled={readonly}
                  />
                  <Label className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Atribuição Automática</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={automationConfig.ai_assistance}
                    onCheckedChange={(checked) => handleAutomationChange('ai_assistance', checked)}
                    disabled={readonly}
                  />
                  <Label className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Assistência de IA</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Triggers</Label>
                <Textarea
                  value={automationConfig.webhook_triggers?.join('\n') || ''}
                  onChange={(e) => handleAutomationChange('webhook_triggers', e.target.value.split('\n').filter(Boolean))}
                  placeholder="https://api.exemplo.com/webhook&#10;https://outro-webhook.com/endpoint"
                  rows={3}
                  disabled={readonly}
                />
                <p className="text-xs text-muted-foreground">
                  Um webhook por linha. Serão chamados em eventos do workflow.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Warnings */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Avisos de Segurança</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {!config.encryption_required && (
                  <div className="flex items-start space-x-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Criptografia desabilitada:</strong> Dados sensíveis podem ficar expostos.
                    </div>
                  </div>
                )}

                {config.access_level === 'public' && (
                  <div className="flex items-start space-x-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Acesso público:</strong> Qualquer usuário poderá acessar este template.
                    </div>
                  </div>
                )}

                {!config.audit_trail && (
                  <div className="flex items-start space-x-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Auditoria desabilitada:</strong> Mudanças não serão rastreadas.
                    </div>
                  </div>
                )}

                {config.data_retention_days < 365 && (
                  <div className="flex items-start space-x-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Retenção curta:</strong> Dados serão excluídos em menos de 1 ano.
                    </div>
                  </div>
                )}
              </div>

              {config.encryption_required && config.audit_trail && config.access_level !== 'public' && (
                <div className="flex items-center space-x-2 text-green-700">
                  <Shield className="h-4 w-4" />
                  <span>Configuração de segurança adequada</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Database className="h-5 w-5" />
                <span>Boas Práticas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Criptografia:</strong> Sempre habilite para dados sensíveis como PII, informações financeiras ou estratégicas.
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Auditoria:</strong> Mantenha ativa para compliance com regulamentações como LGPD, SOX, ISO 27001.
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Retenção:</strong> Configure conforme política da organização. Padrão: 7 anos para dados financeiros.
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Acesso:</strong> Use o nível mais restritivo possível. Comece com "Interno" e ajuste conforme necessário.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};