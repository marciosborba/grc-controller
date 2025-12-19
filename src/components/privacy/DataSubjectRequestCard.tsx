import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  FileText,
  Send,
  MoreHorizontal,
  Edit,
  Eye,
  Download,
  MessageSquare,
  Users,
  ArrowUp,
  Shield
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { DataSubjectRequest, DataSubjectRequestStatus, DataSubjectRequestType, VerificationMethod, REQUEST_TYPES } from '@/types/privacy-management';

interface DataSubjectRequestCardProps {
  request: DataSubjectRequest;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onVerifyIdentity: (verificationData: {
    verification_method: VerificationMethod;
    verification_documents?: string[];
    verification_notes?: string;
    verified_by: string;
  }) => Promise<void>;
  onProcessRequest: () => void;
  onAssignRequest: (assignedTo: string, notes?: string) => void;
  onEscalateRequest: (escalatedTo: string, reason: string) => void;
  onGenerateTemplate: () => void;
}

export function DataSubjectRequestCard({
  request,
  selected = false,
  onSelect,
  onVerifyIdentity,
  onProcessRequest,
  onAssignRequest,
  onEscalateRequest,
  onGenerateTemplate
}: DataSubjectRequestCardProps) {
  const [loading, setLoading] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);

  // Verification form state
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('document_upload');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationDocuments, setVerificationDocuments] = useState<string[]>([]);

  // Assignment form state
  const [assignedTo, setAssignedTo] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Escalation form state
  const [escalatedTo, setEscalatedTo] = useState('');
  const [escalationReason, setEscalationReason] = useState('');

  // Get status badge properties
  const getStatusBadge = (status: DataSubjectRequestStatus) => {
    const statusConfig: Record<DataSubjectRequestStatus, {
      variant: "default" | "secondary" | "destructive" | "outline",
      label: string,
      color: string,
      icon?: React.ComponentType<any>
    }> = {
      received: { variant: 'secondary', label: 'Recebida', color: 'text-blue-600 dark:text-blue-400', icon: Mail },
      under_verification: { variant: 'secondary', label: 'Em Verificação', color: 'text-yellow-600 dark:text-yellow-400', icon: UserCheck },
      verified: { variant: 'outline', label: 'Verificada', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
      in_progress: { variant: 'secondary', label: 'Em Andamento', color: 'text-purple-600 dark:text-purple-400', icon: Clock },
      completed: { variant: 'default', label: 'Concluída', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
      rejected: { variant: 'destructive', label: 'Rejeitada', color: 'text-red-600 dark:text-red-400', icon: AlertTriangle },
      partially_completed: { variant: 'secondary', label: 'Parcialmente Concluída', color: 'text-orange-600 dark:text-orange-400', icon: CheckCircle },
      escalated: { variant: 'destructive', label: 'Escalada', color: 'text-red-600 dark:text-red-400', icon: ArrowUp }
    };

    return statusConfig[status] || { variant: 'outline' as const, label: status, color: 'text-gray-600 dark:text-gray-400' };
  };

  // Get severity badge for request type
  const getRequestTypeBadge = (type: DataSubjectRequestType) => {
    const criticalTypes: DataSubjectRequestType[] = ['eliminacao', 'bloqueio', 'anonimizacao'];
    const highTypes: DataSubjectRequestType[] = ['acesso', 'correcao', 'portabilidade'];

    if (criticalTypes.includes(type)) {
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    }
    if (highTypes.includes(type)) {
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  };

  // Calculate days until due
  const getDaysUntilDue = () => {
    const due = new Date(request.due_date);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

  // Handle identity verification
  const handleVerifyIdentity = async () => {
    try {
      setLoading(true);
      await onVerifyIdentity({
        verification_method: verificationMethod,
        verification_documents: verificationDocuments.length > 0 ? verificationDocuments : undefined,
        verification_notes: verificationNotes || undefined,
        verified_by: 'current-user-id' // This should come from auth context
      });
      setShowVerifyDialog(false);
      toast.success('Identidade verificada com sucesso');
    } catch (error) {
      toast.error('Erro ao verificar identidade');
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment
  const handleAssignRequest = () => {
    if (!assignedTo.trim()) {
      toast.error('Selecione um usuário para atribuir');
      return;
    }

    onAssignRequest(assignedTo, assignmentNotes || undefined);
    setShowAssignDialog(false);
    setAssignedTo('');
    setAssignmentNotes('');
    toast.success('Solicitação atribuída');
  };

  // Handle escalation
  const handleEscalateRequest = () => {
    if (!escalatedTo.trim() || !escalationReason.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    onEscalateRequest(escalatedTo, escalationReason);
    setShowEscalateDialog(false);
    setEscalatedTo('');
    setEscalationReason('');
    toast.success('Solicitação escalada');
  };

  const statusBadge = getStatusBadge(request.status);
  const StatusIcon = statusBadge.icon;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''
      } ${isOverdue
        ? 'border-red-200 bg-red-50 dark:bg-card dark:border-red-800'
        : isUrgent
          ? 'border-orange-200 bg-orange-50 dark:bg-card dark:border-orange-800'
          : ''
      }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
            )}

            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {request.requester_name}
                  </h3>
                  {request.identity_verified && (
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-500" />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant={statusBadge.variant}
                    className="flex items-center gap-1"
                  >
                    {StatusIcon && <StatusIcon className="w-3 h-3" />}
                    {statusBadge.label}
                  </Badge>

                  {isOverdue && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Atrasada
                    </Badge>
                  )}

                  {isUrgent && !isOverdue && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      <Clock className="w-3 h-3" />
                      Urgente
                    </Badge>
                  )}
                </div>
              </div>

              {/* Request details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{request.requester_email}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge className={getRequestTypeBadge(request.request_type)}>
                    {REQUEST_TYPES[request.request_type]}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Recebida:</span>
                  <span className="font-medium">
                    {new Date(request.received_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-muted-foreground'}`} />
                  <span className="text-muted-foreground">Prazo:</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
                    {isOverdue ? `${Math.abs(daysUntilDue)} dias atrasada` :
                      daysUntilDue === 0 ? 'Vence hoje' :
                        `${daysUntilDue} dias restantes`}
                  </span>
                </div>
              </div>

              {/* Description */}
              {request.request_description && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Descrição:</strong> {request.request_description}
                  </p>
                </div>
              )}

              {/* Additional details if available */}
              {(request.assigned_to || request.verified_by || request.responded_by) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {request.assigned_to && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Atribuída para:</span>
                      <span className="font-medium">{request.assigned_to}</span>
                    </div>
                  )}

                  {request.verified_by && (
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">Verificada por:</span>
                      <span className="font-medium">{request.verified_by}</span>
                    </div>
                  )}

                  {request.responded_by && (
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span className="text-muted-foreground">Respondida por:</span>
                      <span className="font-medium">{request.responded_by}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onGenerateTemplate()}>
                <Download className="w-4 h-4 mr-2" />
                Gerar Template de Resposta
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {!request.identity_verified && (
                <DropdownMenuItem onClick={() => setShowVerifyDialog(true)}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Verificar Identidade
                </DropdownMenuItem>
              )}

              {request.identity_verified && !request.assigned_to && (
                <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Atribuir Solicitação
                </DropdownMenuItem>
              )}

              {(request.status === 'verified' || request.status === 'in_progress') && (
                <DropdownMenuItem onClick={onProcessRequest}>
                  <FileText className="w-4 h-4 mr-2" />
                  Processar Solicitação
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowEscalateDialog(true)}
                className="text-red-600"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Escalar Solicitação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress indicator */}
        {request.status !== 'received' && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {request.status === 'completed' ? '100%' :
                  request.status === 'in_progress' ? '60%' :
                    request.status === 'verified' ? '40%' :
                      request.status === 'under_verification' ? '20%' : '10%'}
              </span>
            </div>
            <Progress
              value={
                request.status === 'completed' ? 100 :
                  request.status === 'in_progress' ? 60 :
                    request.status === 'verified' ? 40 :
                      request.status === 'under_verification' ? 20 : 10
              }
              className="h-2"
            />
          </div>
        )}
      </CardContent>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Identidade do Titular</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-method">Método de Verificação</Label>
              <Select value={verificationMethod} onValueChange={(value: VerificationMethod) => setVerificationMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document_upload">Upload de Documento</SelectItem>
                  <SelectItem value="email_confirmation">Confirmação por Email</SelectItem>
                  <SelectItem value="phone_verification">Verificação por Telefone</SelectItem>
                  <SelectItem value="video_call">Videochamada</SelectItem>
                  <SelectItem value="in_person">Presencial</SelectItem>
                  <SelectItem value="digital_certificate">Certificado Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="verification-notes">Observações da Verificação</Label>
              <Textarea
                id="verification-notes"
                placeholder="Descreva como a identidade foi verificada..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleVerifyIdentity} disabled={loading}>
                {loading ? 'Verificando...' : 'Confirmar Verificação'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assigned-to">Atribuir para</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">João Silva</SelectItem>
                  <SelectItem value="user2">Maria Santos</SelectItem>
                  <SelectItem value="user3">Carlos Oliveira</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignment-notes">Observações</Label>
              <Textarea
                id="assignment-notes"
                placeholder="Instruções adicionais para o responsável..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAssignRequest}>
                Atribuir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalar Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalated-to">Escalar para</Label>
              <Select value={escalatedTo} onValueChange={setEscalatedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor1">Ana Costa (Supervisora)</SelectItem>
                  <SelectItem value="dpo">DPO - Pedro Lima</SelectItem>
                  <SelectItem value="legal">Jurídico - Sarah Mendes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="escalation-reason">Motivo da Escalação *</Label>
              <Textarea
                id="escalation-reason"
                placeholder="Descreva o motivo da escalação..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEscalateRequest} variant="destructive">
                Escalar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}