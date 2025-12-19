import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Copy,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

import { DPIAAssessment } from '@/types/privacy-management';

interface DPIACardProps {
  dpia: DPIAAssessment;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onApprove: () => Promise<{ success: boolean; error?: string }>;
  onReject: (reason: string) => Promise<{ success: boolean; error?: string }>;
  onDuplicate: () => Promise<{ success: boolean; error?: string }>;
  onExport: () => Promise<{ success: boolean; error?: string }>;
  onUpdate: (updates: Partial<DPIAAssessment>) => Promise<{ success: boolean; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}

export function DPIACard({
  dpia,
  selected,
  onSelect,
  onApprove,
  onReject,
  onDuplicate,
  onExport,
  onUpdate,
  onDelete
}: DPIACardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Get status badge properties
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, color: string }> = {
      draft: { variant: 'outline', label: 'Rascunho', color: 'text-gray-600' },
      in_progress: { variant: 'secondary', label: 'Em Andamento', color: 'text-blue-600' },
      pending_approval: { variant: 'secondary', label: 'Pendente Aprovação', color: 'text-yellow-600' },
      pending_anpd_consultation: { variant: 'secondary', label: 'Consulta ANPD', color: 'text-orange-600' },
      approved: { variant: 'default', label: 'Aprovada', color: 'text-green-600' },
      rejected: { variant: 'destructive', label: 'Rejeitada', color: 'text-red-600' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Get risk level badge
  const getRiskBadge = (riskLevel: string) => {
    const riskConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      low: { variant: 'outline', label: 'Baixo' },
      medium: { variant: 'secondary', label: 'Médio' },
      high: { variant: 'default', label: 'Alto' },
      critical: { variant: 'destructive', label: 'Crítico' }
    };

    const config = riskConfig[riskLevel] || riskConfig.low;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 8; // Number of assessment criteria

    if (dpia.involves_high_risk !== null) completed++;
    if (dpia.involves_sensitive_data !== null) completed++;
    if (dpia.involves_large_scale !== null) completed++;
    if (dpia.involves_profiling !== null) completed++;
    if (dpia.involves_automated_decisions !== null) completed++;
    if (dpia.involves_vulnerable_individuals !== null) completed++;
    if (dpia.involves_new_technology !== null) completed++;
    if (dpia.risk_level) completed++;

    return Math.round((completed / total) * 100);
  };

  // Handle actions
  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await onApprove();
      if (result.success) {
        toast.success('DPIA aprovada com sucesso');
      } else {
        toast.error(result.error || 'Erro ao aprovar DPIA');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Motivo da rejeição é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const result = await onReject(rejectReason);
      if (result.success) {
        toast.success('DPIA rejeitada');
        setShowRejectDialog(false);
        setRejectReason('');
      } else {
        toast.error(result.error || 'Erro ao rejeitar DPIA');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta DPIA?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await onDelete();
      if (result.success) {
        toast.success('DPIA excluída com sucesso');
      } else {
        toast.error(result.error || 'Erro ao excluir DPIA');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-lg ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
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
                  <h3 className="font-semibold text-lg text-foreground">{dpia.title}</h3>
                </div>
                {dpia.description && (
                  <p className="text-muted-foreground text-sm">
                    {dpia.description}
                  </p>
                )}
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
                <DropdownMenuItem onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {dpia.status === 'pending_approval' && (
                  <>
                    <DropdownMenuItem onClick={handleApprove} className="text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowRejectDialog(true)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive dark:text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status and Risk Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(dpia.status)}
            {dpia.risk_level && getRiskBadge(dpia.risk_level)}
            {dpia.anpd_consultation_required && (
              <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Consulta ANPD
              </Badge>
            )}
            {dpia.involves_high_risk && (
              <Badge variant="secondary">Alto Risco</Badge>
            )}
            {dpia.dpia_required && (
              <Badge variant="default">DPIA Obrigatória</Badge>
            )}
          </div>

          {/* Processing Activity */}
          {(dpia as any).processing_activity && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Atividade: </span>
                {(dpia as any).processing_activity.name}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Avaliação</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Assessment Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold">
                {dpia.likelihood_assessment || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Probabilidade</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {dpia.impact_assessment || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Impacto</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {dpia.privacy_risks?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Riscos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {dpia.mitigation_measures?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Medidas</div>
            </div>
          </div>

          {/* Risk Factors */}
          {(dpia.involves_high_risk || dpia.involves_sensitive_data || dpia.involves_large_scale) && (
            <div>
              <p className="text-sm font-medium mb-2">Fatores de Risco:</p>
              <div className="flex flex-wrap gap-1">
                {dpia.involves_high_risk && (
                  <Badge variant="outline" className="text-xs">Alto Risco</Badge>
                )}
                {dpia.involves_sensitive_data && (
                  <Badge variant="outline" className="text-xs">Dados Sensíveis</Badge>
                )}
                {dpia.involves_large_scale && (
                  <Badge variant="outline" className="text-xs">Grande Escala</Badge>
                )}
                {dpia.involves_profiling && (
                  <Badge variant="outline" className="text-xs">Perfilamento</Badge>
                )}
                {dpia.involves_automated_decisions && (
                  <Badge variant="outline" className="text-xs">Decisões Automatizadas</Badge>
                )}
                {dpia.involves_vulnerable_individuals && (
                  <Badge variant="outline" className="text-xs">Indivíduos Vulneráveis</Badge>
                )}
                {dpia.involves_new_technology && (
                  <Badge variant="outline" className="text-xs">Nova Tecnologia</Badge>
                )}
              </div>
            </div>
          )}

          {/* Team and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              {(dpia as any).conducted_by_user && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Conduzida por: </span>
                    {(dpia as any).conducted_by_user?.raw_user_meta_data?.name ||
                      (dpia as any).conducted_by_user?.email}
                  </span>
                </div>
              )}

              {(dpia as any).reviewed_by_user && (
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Revisada por: </span>
                    {(dpia as any).reviewed_by_user?.raw_user_meta_data?.name ||
                      (dpia as any).reviewed_by_user?.email}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Iniciada: </span>
                  {formatDate(dpia.started_at)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Atualizada: </span>
                  {formatDate(dpia.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar DPIA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Informe o motivo da rejeição desta DPIA:
            </p>
            <Textarea
              placeholder="Descreva os motivos para rejeição..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
              >
                {loading ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}