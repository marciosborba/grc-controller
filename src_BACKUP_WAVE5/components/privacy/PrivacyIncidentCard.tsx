import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Send,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Shield,
  Bell,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { PrivacyIncident } from '@/types/privacy-management';

interface PrivacyIncidentCardProps {
  incident: PrivacyIncident;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: (updates: Partial<PrivacyIncident>) => Promise<{ success: boolean; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  onContain: (measures: string[]) => Promise<{ success: boolean; error?: string }>;
  onClose: (report: string) => Promise<{ success: boolean; error?: string }>;
  onNotifyANPD: () => void;
  onGenerateNotification: () => void;
}

export function PrivacyIncidentCard({
  incident,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onContain,
  onClose,
  onNotifyANPD,
  onGenerateNotification
}: PrivacyIncidentCardProps) {
  const [loading, setLoading] = useState(false);
  const [showContainDialog, setShowContainDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [containmentMeasures, setContainmentMeasures] = useState('');
  const [finalReport, setFinalReport] = useState('');

  // Get status badge properties
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, {
      variant: "default" | "secondary" | "destructive" | "outline",
      label: string,
      color: string,
      icon?: React.ComponentType<any>
    }> = {
      open: { variant: 'destructive', label: 'Aberto', color: 'text-red-600 dark:text-red-400', icon: AlertTriangle },
      investigating: { variant: 'secondary', label: 'Investigando', color: 'text-blue-600 dark:text-blue-400', icon: Eye },
      escalated: { variant: 'secondary', label: 'Escalado', color: 'text-orange-600 dark:text-orange-400', icon: AlertTriangle },
      resolved: { variant: 'outline', label: 'Resolvido', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
      closed: { variant: 'default', label: 'Encerrado', color: 'text-gray-600 dark:text-gray-400', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, {
      variant: "default" | "secondary" | "destructive" | "outline",
      label: string,
      color: string
    }> = {
      low: { variant: 'outline', label: 'Baixa', color: 'text-green-600 dark:text-green-400' },
      medium: { variant: 'secondary', label: 'Média', color: 'text-yellow-600 dark:text-yellow-400' },
      high: { variant: 'default', label: 'Alta', color: 'text-orange-600 dark:text-orange-400' },
      critical: { variant: 'destructive', label: 'Crítica', color: 'text-red-600 dark:text-red-400' }
    };

    const config = severityConfig[severity] || severityConfig.low;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Check if notification to ANPD is overdue (72 hours)
  const isANPDNotificationOverdue = () => {
    if (!incident.anpd_notification_required || incident.anpd_notified) return false;

    const discoveryDate = new Date(incident.discovered_at);
    const seventyTwoHoursLater = new Date(discoveryDate.getTime() + (72 * 60 * 60 * 1000));

    return new Date() > seventyTwoHoursLater;
  };

  // Calculate resolution progress
  const getResolutionProgress = () => {
    let progress = 0;
    const steps = [
      incident.discovered_at, // Discovered
      incident.contained_at,   // Contained
      incident.investigation_findings, // Investigated
      incident.corrective_actions?.length > 0, // Actions taken
      ['resolved', 'closed'].includes(incident.status) // Resolved
    ];

    progress = (steps.filter(Boolean).length / steps.length) * 100;
    return Math.round(progress);
  };

  // Handle actions
  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este incidente?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await onDelete();
      if (result.success) {
        toast.success('Incidente excluído com sucesso');
      } else {
        toast.error(result.error || 'Erro ao excluir incidente');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleContain = async () => {
    if (!containmentMeasures.trim()) {
      toast.error('Descreva as medidas de contenção');
      return;
    }

    setLoading(true);
    try {
      const measures = containmentMeasures.split('\n').filter(m => m.trim());
      const result = await onContain(measures);
      if (result.success) {
        toast.success('Incidente contido');
        setShowContainDialog(false);
        setContainmentMeasures('');
      } else {
        toast.error(result.error || 'Erro ao conter incidente');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!finalReport.trim()) {
      toast.error('Relatório final é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const result = await onClose(finalReport);
      if (result.success) {
        toast.success('Incidente encerrado');
        setShowCloseDialog(false);
        setFinalReport('');
      } else {
        toast.error(result.error || 'Erro ao encerrar incidente');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString('pt-BR');
  };

  const resolutionProgress = getResolutionProgress();
  const isOverdue = isANPDNotificationOverdue();

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-lg ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selected}
                  onCheckedChange={onSelect}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg text-foreground">{incident.title}</h3>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        ANPD VENCIDA
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {incident.description}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={loading}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onGenerateNotification}>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Documento ANPD
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {!incident.contained_at && incident.status === 'open' && (
                    <DropdownMenuItem onClick={() => setShowContainDialog(true)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Conter Incidente
                    </DropdownMenuItem>
                  )}

                  {incident.anpd_notification_required && !incident.anpd_notified && (
                    <DropdownMenuItem onClick={onNotifyANPD} className="text-orange-600">
                      <Send className="w-4 h-4 mr-2" />
                      Notificar ANPD
                    </DropdownMenuItem>
                  )}

                  {incident.status !== 'closed' && incident.status !== 'resolved' && (
                    <DropdownMenuItem onClick={() => setShowCloseDialog(true)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Encerrar Incidente
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status and Severity Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(incident.status)}
              {getSeverityBadge(incident.severity_level)}

              {incident.anpd_notification_required && (
                <Badge variant={incident.anpd_notified ? "default" : "outline"}
                  className={incident.anpd_notified ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}>
                  <Bell className="w-3 h-3 mr-1" />
                  {incident.anpd_notified ? 'ANPD Notificada' : 'Requer ANPD'}
                </Badge>
              )}

              {incident.data_subjects_notification_required && (
                <Badge variant={incident.data_subjects_notified ? "default" : "outline"}>
                  <Users className="w-3 h-3 mr-1" />
                  {incident.data_subjects_notified ? 'Titulares Notificados' : 'Notificar Titulares'}
                </Badge>
              )}

              <Badge variant="outline">
                {incident.incident_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da Resolução</span>
                <span>{resolutionProgress}%</span>
              </div>
              <Progress value={resolutionProgress} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-destructive">
                  {formatNumber(incident.estimated_affected_individuals)}
                </div>
                <div className="text-xs text-muted-foreground">Indivíduos Afetados</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">
                  {incident.affected_data_categories?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Categorias de Dados</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  R$ {incident.financial_impact?.toLocaleString('pt-BR') || '0'}
                </div>
                <div className="text-xs text-muted-foreground">Impacto Financeiro</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">
                  {incident.corrective_actions?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Ações Corretivas</div>
              </div>
            </div>

            {/* Data Categories */}
            {incident.affected_data_categories && incident.affected_data_categories.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Categorias de Dados Afetadas:</p>
                <div className="flex flex-wrap gap-1">
                  {incident.affected_data_categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs capitalize">
                      {category.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline and Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Descoberto: </span>
                    {formatDate(incident.discovered_at)}
                  </span>
                </div>

                {incident.occurred_at && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Ocorrido: </span>
                      {formatDate(incident.occurred_at)}
                    </span>
                  </div>
                )}

                {incident.contained_at && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <span className="font-medium">Contido: </span>
                      {formatDate(incident.contained_at)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {(incident as any).incident_manager_user && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Gestor: </span>
                      {(incident as any).incident_manager_user?.raw_user_meta_data?.name ||
                        (incident as any).incident_manager_user?.email}
                    </span>
                  </div>
                )}

                {incident.incident_source && (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Fonte: </span>
                      {incident.incident_source}
                    </span>
                  </div>
                )}

                {incident.anpd_notification_date && (
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <span className="font-medium">ANPD Notificada: </span>
                      {formatDate(incident.anpd_notification_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contain Incident Dialog */}
      <Dialog open={showContainDialog} onOpenChange={setShowContainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conter Incidente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descreva as medidas de contenção implementadas (uma por linha):
            </p>
            <Textarea
              placeholder={`Exemplo:
Desconexão do sistema afetado da rede
Alteração de senhas de acesso
Auditoria de logs de acesso
Notificação da equipe de segurança`}
              value={containmentMeasures}
              onChange={(e) => setContainmentMeasures(e.target.value)}
              rows={6}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowContainDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleContain}
                disabled={loading || !containmentMeasures.trim()}
              >
                {loading ? 'Contendo...' : 'Conter Incidente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Incident Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar Incidente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Forneça um relatório final detalhado sobre o incidente e sua resolução:
            </p>
            <Textarea
              placeholder="Descreva a resolução final, lições aprendidas e medidas preventivas implementadas..."
              value={finalReport}
              onChange={(e) => setFinalReport(e.target.value)}
              rows={8}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCloseDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleClose}
                disabled={loading || !finalReport.trim()}
              >
                {loading ? 'Encerrando...' : 'Encerrar Incidente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}