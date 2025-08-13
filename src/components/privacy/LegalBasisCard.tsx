import React, { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  User,
  MoreHorizontal,
  Edit,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { LegalBasis, LegalBasisStatus, LegalBasisType, LEGAL_BASIS_TYPES } from '@/types/privacy-management';

interface LegalBasisCardProps {
  basis: LegalBasis;
  onSuspend: (reason: string) => void;
  onReactivate: () => void;
  onValidate: (isValid: boolean, notes?: string) => void;
  onGenerateReport: () => void;
}

export function LegalBasisCard({ 
  basis, 
  onSuspend,
  onReactivate,
  onValidate,
  onGenerateReport
}: LegalBasisCardProps) {
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [validationValid, setValidationValid] = useState(true);
  const [validationNotes, setValidationNotes] = useState('');

  // Get status badge properties
  const getStatusBadge = (status: LegalBasisStatus) => {
    const statusConfig: Record<LegalBasisStatus, { 
      variant: "default" | "secondary" | "destructive" | "outline", 
      label: string, 
      color: string,
      icon?: React.ComponentType<any>
    }> = {
      active: { variant: 'default', label: 'Ativa', color: 'text-green-600', icon: CheckCircle },
      suspended: { variant: 'secondary', label: 'Suspensa', color: 'text-yellow-600', icon: Pause },
      expired: { variant: 'destructive', label: 'Expirada', color: 'text-red-600', icon: AlertTriangle },
      revoked: { variant: 'destructive', label: 'Revogada', color: 'text-red-600', icon: XCircle }
    };

    return statusConfig[status] || { variant: 'outline' as const, label: status, color: 'text-gray-600' };
  };

  // Get type color
  const getTypeColor = (type: LegalBasisType) => {
    const colors = {
      consentimento: 'bg-blue-100 text-blue-800',
      contrato: 'bg-green-100 text-green-800',
      obrigacao_legal: 'bg-purple-100 text-purple-800',
      protecao_vida: 'bg-red-100 text-red-800',
      interesse_publico: 'bg-orange-100 text-orange-800',
      interesse_legitimo: 'bg-yellow-100 text-yellow-800',
      exercicio_direitos: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Check if basis is expiring soon (within 30 days)
  const isExpiringSoon = () => {
    if (!basis.valid_until) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(basis.valid_until) < thirtyDaysFromNow && new Date(basis.valid_until) > new Date();
  };

  // Check if basis has expired
  const isExpired = () => {
    if (!basis.valid_until) return false;
    return new Date(basis.valid_until) < new Date();
  };

  const handleSuspend = () => {
    if (!suspensionReason.trim()) return;
    onSuspend(suspensionReason);
    setSuspendDialogOpen(false);
    setSuspensionReason('');
  };

  const handleValidate = () => {
    onValidate(validationValid, validationNotes || undefined);
    setValidateDialogOpen(false);
    setValidationNotes('');
  };

  const statusBadge = getStatusBadge(basis.status);
  const StatusIcon = statusBadge.icon;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isExpired() ? 'border-red-200 bg-red-50' : 
      isExpiringSoon() ? 'border-orange-200 bg-orange-50' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {basis.name}
                </h3>
                {basis.is_validated && (
                  <Shield className="w-4 h-4 text-green-600" title="Validada Juridicamente" />
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
                
                {isExpired() && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Expirada
                  </Badge>
                )}
                
                {isExpiringSoon() && !isExpired() && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
                    <Clock className="w-3 h-3" />
                    Expira em breve
                  </Badge>
                )}
              </div>
            </div>

            {/* Type and Article */}
            <div className="flex items-center space-x-4">
              <Badge className={getTypeColor(basis.legal_basis_type)}>
                {LEGAL_BASIS_TYPES[basis.legal_basis_type]}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {basis.legal_article}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {basis.description}
            </p>

            {/* Justification */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <strong>Justificativa:</strong> {basis.justification}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Categorias aplicáveis:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {basis.applies_to_categories?.map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  )) || <span className="text-muted-foreground">Não especificado</span>}
                </div>
              </div>

              <div>
                <strong>Processamentos aplicáveis:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {basis.applies_to_processing?.map(processing => (
                    <Badge key={processing} variant="outline" className="text-xs">
                      {processing}
                    </Badge>
                  )) || <span className="text-muted-foreground">Não especificado</span>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Válida desde:</span>
                <span className="font-medium">
                  {new Date(basis.valid_from).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {basis.valid_until && (
                <div className="flex items-center space-x-2">
                  <Calendar className={`w-4 h-4 ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : 'text-muted-foreground'}`} />
                  <span className="text-muted-foreground">Válida até:</span>
                  <span className={`font-medium ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : ''}`}>
                    {new Date(basis.valid_until).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {basis.legal_responsible_id && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Responsável:</span>
                  <span className="font-medium">{basis.legal_responsible_id}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criada em:</span>
                <span className="font-medium">
                  {new Date(basis.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Validation info */}
            {basis.is_validated && basis.validated_at && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Validação Jurídica</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Validada em {new Date(basis.validated_at).toLocaleDateString('pt-BR')}
                  {basis.validation_notes && (
                    <span className="block mt-1">{basis.validation_notes}</span>
                  )}
                </p>
              </div>
            )}

            {/* Suspension info */}
            {basis.status === 'suspended' && basis.suspended_at && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Pause className="w-4 h-4" />
                  <span className="font-medium">Base Suspensa</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Suspensa em {new Date(basis.suspended_at).toLocaleDateString('pt-BR')}
                  {basis.suspension_reason && (
                    <span className="block mt-1">{basis.suspension_reason}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onGenerateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório de Uso
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {!basis.is_validated && (
                <DropdownMenuItem onClick={() => setValidateDialogOpen(true)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Validar Juridicamente
                </DropdownMenuItem>
              )}
              
              {basis.status === 'active' ? (
                <DropdownMenuItem onClick={() => setSuspendDialogOpen(true)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Suspender Base Legal
                </DropdownMenuItem>
              ) : basis.status === 'suspended' && (
                <DropdownMenuItem onClick={onReactivate}>
                  <Play className="w-4 h-4 mr-2" />
                  Reativar Base Legal
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Editar Base Legal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Suspension Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender Base Legal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspension-reason">Motivo da Suspensão *</Label>
              <Textarea
                id="suspension-reason"
                placeholder="Descreva o motivo da suspensão da base legal..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSuspend} 
                variant="destructive"
                disabled={!suspensionReason.trim()}
              >
                Suspender
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validação Jurídica da Base Legal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resultado da Validação</Label>
              <RadioGroup value={validationValid ? 'valid' : 'invalid'} onValueChange={(value) => setValidationValid(value === 'valid')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="valid" id="valid" />
                  <Label htmlFor="valid" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Base Legal Válida</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invalid" id="invalid" />
                  <Label htmlFor="invalid" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Base Legal Inválida</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="validation-notes">Observações da Validação</Label>
              <Textarea
                id="validation-notes"
                placeholder="Adicione observações sobre a validação jurídica..."
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setValidateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleValidate}>
                Confirmar Validação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}