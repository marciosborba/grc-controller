import React, { useState } from 'react';
import {
  Send,
  FileText,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { PrivacyIncident } from '@/types/privacy-management';
import { ANPDNotificationData } from '@/hooks/usePrivacyIncidents';

interface ANPDNotificationDialogProps {
  incidentId: string | null;
  incident: PrivacyIncident | undefined;
  onNotify: (notificationData: ANPDNotificationData) => Promise<void>;
  onCancel: () => void;
}

export function ANPDNotificationDialog({
  incidentId,
  incident,
  onNotify,
  onCancel
}: ANPDNotificationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Omit<ANPDNotificationData, 'incident_id' | 'notified_by'>>({
    notification_date: new Date().toISOString().slice(0, 16), // For datetime-local input
    notification_method: 'online_portal',
    reference_number: '',
    acknowledgment_received: false,
    anpd_response: '',
    follow_up_required: false,
    follow_up_date: ''
  });

  const [additionalInfo, setAdditionalInfo] = useState({
    notification_content: '',
    supporting_documents: [] as string[],
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });

  if (!incidentId || !incident) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Incidente não encontrado.</p>
      </div>
    );
  }

  // Check if notification is overdue
  const isOverdue = () => {
    const discoveryDate = new Date(incident.discovered_at);
    const seventyTwoHoursLater = new Date(discoveryDate.getTime() + (72 * 60 * 60 * 1000));
    return new Date() > seventyTwoHoursLater;
  };

  // Calculate hours since discovery
  const getHoursSinceDiscovery = () => {
    const discoveryDate = new Date(incident.discovered_at);
    const now = new Date();
    return Math.round((now.getTime() - discoveryDate.getTime()) / (1000 * 60 * 60));
  };

  const notificationMethods = [
    {
      value: 'online_portal',
      label: 'Portal Online da ANPD',
      icon: Globe,
      description: 'Notificação através do sistema oficial online'
    },
    {
      value: 'email',
      label: 'E-mail Oficial',
      icon: Mail,
      description: 'Comunicação por e-mail para o endereço oficial'
    },
    {
      value: 'phone',
      label: 'Telefone',
      icon: Phone,
      description: 'Contato telefônico seguido de confirmação escrita'
    },
    {
      value: 'mail',
      label: 'Correios',
      icon: Building,
      description: 'Correspondência física registrada'
    }
  ];

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalInfoChange = (field: keyof typeof additionalInfo, value: any) => {
    setAdditionalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: keyof typeof additionalInfo, value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    setAdditionalInfo(prev => ({ ...prev, [field]: items }));
  };

  const generateNotificationContent = () => {
    const content = `NOTIFICAÇÃO DE INCIDENTE DE SEGURANÇA À ANPD

INFORMAÇÕES DO INCIDENTE:
- Título: ${incident.title}
- Tipo: ${incident.incident_type.replace('_', ' ').toUpperCase()}
- Severidade: ${incident.severity_level.toUpperCase()}
- Data de Descoberta: ${new Date(incident.discovered_at).toLocaleDateString('pt-BR')}
${incident.occurred_at ? `- Data de Ocorrência: ${new Date(incident.occurred_at).toLocaleDateString('pt-BR')}` : ''}

DETALHES DO INCIDENTE:
${incident.description}

IMPACTO:
- Indivíduos Afetados: ${incident.estimated_affected_individuals?.toLocaleString('pt-BR') || 'N/A'}
- Categorias de Dados: ${incident.affected_data_categories?.join(', ') || 'N/A'}
${incident.financial_impact ? `- Impacto Financeiro: R$ ${incident.financial_impact.toLocaleString('pt-BR')}` : ''}

CAUSA RAIZ:
${incident.root_cause || 'Sob investigação'}

MEDIDAS DE CONTENÇÃO:
${incident.containment_measures?.map(measure => `- ${measure}`).join('\n') || 'Nenhuma medida ainda implementada'}

AÇÕES CORRETIVAS:
${incident.corrective_actions?.map(action => `- ${action}`).join('\n') || 'Sob definição'}

Esta notificação está sendo enviada em conformidade com o Art. 48 da LGPD, dentro do prazo estabelecido de 72 horas.`;

    setAdditionalInfo(prev => ({ ...prev, notification_content: content }));
  };

  const validateForm = (): boolean => {
    if (!formData.notification_date) {
      toast.error('Data de notificação é obrigatória');
      return false;
    }

    if (!additionalInfo.notification_content.trim()) {
      toast.error('Conteúdo da notificação é obrigatório');
      return false;
    }

    if (!additionalInfo.contact_person.trim() || !additionalInfo.contact_email.trim()) {
      toast.error('Dados da pessoa responsável são obrigatórios');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const notificationData: ANPDNotificationData = {
        incident_id: incidentId,
        notification_date: new Date(formData.notification_date).toISOString(),
        notification_method: formData.notification_method,
        reference_number: formData.reference_number,
        acknowledgment_received: formData.acknowledgment_received,
        anpd_response: formData.anpd_response,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : undefined,
        notified_by: additionalInfo.contact_person // This should come from auth context in real implementation
      };

      await onNotify(notificationData);
    } catch (error) {
      console.error('Error notifying ANPD:', error);
    } finally {
      setLoading(false);
    }
  };

  const hoursSinceDiscovery = getHoursSinceDiscovery();
  const isNotificationOverdue = isOverdue();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Notificar ANPD</h2>
        <p className="text-muted-foreground">
          Comunicação oficial do incidente à Autoridade Nacional de Proteção de Dados
        </p>

        {/* Timeline Alert */}
        <Alert className={`mt-4 ${isNotificationOverdue
            ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/50'
            : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800/50'
          }`}>
          <AlertTriangle className={`h-4 w-4 ${isNotificationOverdue
              ? 'text-red-600 dark:text-red-400'
              : 'text-yellow-600 dark:text-yellow-400'
            }`} />
          <AlertDescription className={
            isNotificationOverdue
              ? 'text-red-800 dark:text-red-300'
              : 'text-yellow-800 dark:text-yellow-300'
          }>
            <strong>{isNotificationOverdue ? 'NOTIFICAÇÃO EM ATRASO:' : 'ATENÇÃO:'}</strong>{' '}
            {hoursSinceDiscovery}h desde a descoberta do incidente.
            {isNotificationOverdue
              ? ' O prazo legal de 72h foi ultrapassado.'
              : ` Restam ${72 - hoursSinceDiscovery}h para cumprir o prazo legal.`
            }
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        {/* Incident Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resumo do Incidente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Título:</Label>
                <p className="text-sm text-muted-foreground">{incident.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo:</Label>
                <Badge variant="outline">
                  {incident.incident_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Severidade:</Label>
                <Badge variant={incident.severity_level === 'critical' ? 'destructive' : 'secondary'}>
                  {incident.severity_level.replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Indivíduos Afetados:</Label>
                <p className="text-sm text-muted-foreground">
                  {incident.estimated_affected_individuals?.toLocaleString('pt-BR') || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Method */}
        <Card>
          <CardHeader>
            <CardTitle>Método de Notificação</CardTitle>
            <CardDescription>
              Selecione como a notificação será enviada à ANPD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.notification_method}
              onValueChange={(value: any) => handleInputChange('notification_method', value)}
              className="space-y-3"
            >
              {notificationMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={method.value} id={method.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <Label htmlFor={method.value} className="font-medium cursor-pointer">
                          {method.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Notification Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Notificação</CardTitle>
            <CardDescription>
              Configure os detalhes específicos da comunicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification_date">Data/Hora da Notificação *</Label>
                <Input
                  id="notification_date"
                  type="datetime-local"
                  value={formData.notification_date.slice(0, 16)}
                  onChange={(e) => handleInputChange('notification_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reference_number">Número de Referência</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number || ''}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                  placeholder="Ex: ANPD-2024-001"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="notification_content">Conteúdo da Notificação *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateNotificationContent}
                >
                  Gerar Automático
                </Button>
              </div>
              <Textarea
                id="notification_content"
                value={additionalInfo.notification_content}
                onChange={(e) => handleAdditionalInfoChange('notification_content', e.target.value)}
                placeholder="Conteúdo completo da notificação à ANPD..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="supporting_documents">Documentos de Apoio</Label>
              <Textarea
                id="supporting_documents"
                value={additionalInfo.supporting_documents.join('\n')}
                onChange={(e) => handleArrayInputChange('supporting_documents', e.target.value)}
                placeholder={`Um documento por linha, exemplo:
Relatório técnico do incidente
Screenshots das evidências
Logs de sistema relevantes
Plano de ação corretiva`}
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Liste os documentos que acompanharão a notificação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Responsável pela Comunicação</CardTitle>
            <CardDescription>
              Dados da pessoa responsável pela notificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person">Nome Completo *</Label>
                <Input
                  id="contact_person"
                  value={additionalInfo.contact_person}
                  onChange={(e) => handleAdditionalInfoChange('contact_person', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">E-mail Corporativo *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={additionalInfo.contact_email}
                  onChange={(e) => handleAdditionalInfoChange('contact_email', e.target.value)}
                  placeholder="email@empresa.com.br"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Telefone de Contato</Label>
                <Input
                  id="contact_phone"
                  value={additionalInfo.contact_phone}
                  onChange={(e) => handleAdditionalInfoChange('contact_phone', e.target.value)}
                  placeholder="(11) 9999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Options */}
        <Card>
          <CardHeader>
            <CardTitle>Acompanhamento</CardTitle>
            <CardDescription>
              Configurações para acompanhar a resposta da ANPD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acknowledgment_received"
                checked={formData.acknowledgment_received}
                onCheckedChange={(checked) => handleInputChange('acknowledgment_received', checked)}
              />
              <Label htmlFor="acknowledgment_received">
                Confirmação de recebimento já obtida
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow_up_required"
                checked={formData.follow_up_required}
                onCheckedChange={(checked) => handleInputChange('follow_up_required', checked)}
              />
              <Label htmlFor="follow_up_required">
                Programar acompanhamento
              </Label>
            </div>

            {formData.follow_up_required && (
              <div>
                <Label htmlFor="follow_up_date">Data de Acompanhamento</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date?.slice(0, 10) || ''}
                  onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="anpd_response">Resposta da ANPD (se já recebida)</Label>
              <Textarea
                id="anpd_response"
                value={formData.anpd_response || ''}
                onChange={(e) => handleInputChange('anpd_response', e.target.value)}
                placeholder="Transcreva ou cole aqui a resposta oficial da ANPD..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Aviso Legal:</strong> Esta notificação será enviada em conformidade com o
            Art. 48 da LGPD. Certifique-se de que todas as informações estão corretas e completas
            antes de prosseguir. A comunicação inadequada ou tardia pode resultar em sanções administrativas.
          </AlertDescription>
        </Alert>

        {/* Submit */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Notificar ANPD
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}