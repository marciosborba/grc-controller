import React, { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  User,
  MoreHorizontal,
  Edit,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  FileText,
  Globe,
  Smartphone,
  RefreshCw,
  Eye,
  Download
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Consent, ConsentStatus, CollectionMethod } from '@/types/privacy-management';

interface ConsentCardProps {
  consent: Consent;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onRevoke: (reason?: string) => void;
  onRenew: (newExpiryDate: string) => void;
}

export function ConsentCard({ 
  consent, 
  selected,
  onSelect,
  onRevoke,
  onRenew
}: ConsentCardProps) {
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // Get status badge properties
  const getStatusBadge = (status: ConsentStatus) => {
    const statusConfig: Record<ConsentStatus, { 
      variant: "default" | "secondary" | "destructive" | "outline", 
      label: string, 
      color: string,
      icon?: React.ComponentType<any>
    }> = {
      granted: { variant: 'default', label: 'Concedido', color: 'text-green-600', icon: CheckCircle },
      revoked: { variant: 'destructive', label: 'Revogado', color: 'text-red-600', icon: XCircle },
      expired: { variant: 'destructive', label: 'Expirado', color: 'text-red-600', icon: AlertTriangle },
      pending: { variant: 'secondary', label: 'Pendente', color: 'text-yellow-600', icon: Clock }
    };

    return statusConfig[status] || { variant: 'outline' as const, label: status, color: 'text-gray-600' };
  };

  // Get collection method icon and label
  const getCollectionMethodInfo = (method: CollectionMethod) => {
    const methodConfig: Record<CollectionMethod, { 
      icon: React.ComponentType<any>, 
      label: string,
      color: string
    }> = {
      website_form: { icon: Globe, label: 'Formulário Web', color: 'text-blue-600' },
      mobile_app: { icon: Smartphone, label: 'App Mobile', color: 'text-purple-600' },
      phone_call: { icon: Phone, label: 'Ligação', color: 'text-green-600' },
      email: { icon: Mail, label: 'Email', color: 'text-orange-600' },
      physical_form: { icon: FileText, label: 'Formulário Físico', color: 'text-gray-600' },
      api: { icon: RefreshCw, label: 'API', color: 'text-indigo-600' },
      import: { icon: Download, label: 'Importação', color: 'text-teal-600' },
      other: { icon: FileText, label: 'Outro', color: 'text-gray-600' }
    };

    return methodConfig[method] || { icon: FileText, label: method, color: 'text-gray-600' };
  };

  // Check if consent is expiring soon (within 30 days)
  const isExpiringSoon = () => {
    if (!consent.expired_at) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(consent.expired_at) < thirtyDaysFromNow && new Date(consent.expired_at) > new Date();
  };

  // Check if consent has expired
  const isExpired = () => {
    if (!consent.expired_at) return false;
    return new Date(consent.expired_at) < new Date();
  };

  const handleRevoke = () => {
    onRevoke(revocationReason || undefined);
    setRevokeDialogOpen(false);
    setRevocationReason('');
  };

  const handleRenew = () => {
    if (!newExpiryDate) return;
    onRenew(newExpiryDate);
    setRenewDialogOpen(false);
    setNewExpiryDate('');
  };

  const statusBadge = getStatusBadge(consent.status);
  const StatusIcon = statusBadge.icon;
  const methodInfo = getCollectionMethodInfo(consent.collection_method);
  const MethodIcon = methodInfo.icon;

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!consent.expired_at) return null;
    const now = new Date();
    const expiry = new Date(consent.expired_at);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isExpired() ? 'border-red-200 bg-red-50' : 
      isExpiringSoon() ? 'border-orange-200 bg-orange-50' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Selection checkbox */}
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              className="mt-1"
            />

            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {consent.data_subject_name || consent.data_subject_email}
                    </h3>
                    {consent.is_validated && (
                      <Shield className="w-4 h-4 text-green-600" title="Consentimento Validado" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{consent.data_subject_email}</p>
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
                      Expirado
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

              {/* Purpose */}
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Finalidade:</strong> {consent.purpose}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MethodIcon className={`w-4 h-4 ${methodInfo.color}`} />
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-medium">{methodInfo.label}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Concedido:</span>
                  <span className="font-medium">
                    {new Date(consent.granted_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {consent.expired_at && (
                  <div className="flex items-center space-x-2">
                    <Calendar className={`w-4 h-4 ${
                      isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : 'text-muted-foreground'
                    }`} />
                    <span className="text-muted-foreground">Expira:</span>
                    <span className={`font-medium ${
                      isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : ''
                    }`}>
                      {new Date(consent.expired_at).toLocaleDateString('pt-BR')}
                      {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({daysUntilExpiry} dias)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {consent.collection_source && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Origem:</span>
                    <span className="font-medium">{consent.collection_source}</span>
                  </div>
                )}

                {consent.legal_basis && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Base Legal:</span>
                    <span className="font-medium">{consent.legal_basis.name}</span>
                  </div>
                )}

                {consent.language && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Idioma:</span>
                    <span className="font-medium">{consent.language.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* LGPD Requirements */}
              <div className="flex flex-wrap gap-2">
                {consent.is_informed && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    ✓ Informado
                  </Badge>
                )}
                {consent.is_specific && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    ✓ Específico
                  </Badge>
                )}
                {consent.is_free && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    ✓ Livre
                  </Badge>
                )}
                {consent.is_unambiguous && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    ✓ Inequívoco
                  </Badge>
                )}
              </div>

              {/* Revocation info */}
              {consent.status === 'revoked' && consent.revoked_at && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Consentimento Revogado</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Revogado em {new Date(consent.revoked_at).toLocaleDateString('pt-BR')}
                    {consent.revocation_reason && (
                      <span className="block mt-1">Motivo: {consent.revocation_reason}</span>
                    )}
                  </p>
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
              <DropdownMenuItem onClick={() => setDetailsDialogOpen(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes Completos
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {consent.status === 'granted' && (
                <>
                  <DropdownMenuItem onClick={() => setRevokeDialogOpen(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Revogar Consentimento
                  </DropdownMenuItem>
                  
                  {consent.expired_at && (
                    <DropdownMenuItem onClick={() => setRenewDialogOpen(true)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renovar Consentimento
                    </DropdownMenuItem>
                  )}
                </>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Gerar Comprovante
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Revocation Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar Consentimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="revocation-reason">Motivo da Revogação (opcional)</Label>
              <Textarea
                id="revocation-reason"
                placeholder="Descreva o motivo da revogação do consentimento..."
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRevoke} variant="destructive">
                Revogar Consentimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renewal Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar Consentimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-expiry-date">Nova Data de Expiração *</Label>
              <Input
                id="new-expiry-date"
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleRenew} 
                disabled={!newExpiryDate}
              >
                Renovar Consentimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes Completos do Consentimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Titular dos Dados</Label>
                <p className="text-sm">{consent.data_subject_name || consent.data_subject_email}</p>
              </div>
              <div>
                <Label className="font-medium">Email</Label>
                <p className="text-sm">{consent.data_subject_email}</p>
              </div>
              <div>
                <Label className="font-medium">Status</Label>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <div>
                <Label className="font-medium">Método de Coleta</Label>
                <p className="text-sm">{methodInfo.label}</p>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <Label className="font-medium">Finalidade</Label>
              <p className="text-sm mt-1">{consent.purpose}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="font-medium">Data de Consentimento</Label>
                <p className="text-sm">{new Date(consent.granted_at).toLocaleDateString('pt-BR')}</p>
              </div>
              {consent.expired_at && (
                <div>
                  <Label className="font-medium">Data de Expiração</Label>
                  <p className="text-sm">{new Date(consent.expired_at).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              <div>
                <Label className="font-medium">Última Atualização</Label>
                <p className="text-sm">{new Date(consent.updated_at || consent.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* LGPD Requirements */}
            <div>
              <Label className="font-medium">Requisitos LGPD</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={consent.is_informed ? "default" : "destructive"}>
                  {consent.is_informed ? '✓' : '✗'} Informado
                </Badge>
                <Badge variant={consent.is_specific ? "default" : "destructive"}>
                  {consent.is_specific ? '✓' : '✗'} Específico
                </Badge>
                <Badge variant={consent.is_free ? "default" : "destructive"}>
                  {consent.is_free ? '✓' : '✗'} Livre
                </Badge>
                <Badge variant={consent.is_unambiguous ? "default" : "destructive"}>
                  {consent.is_unambiguous ? '✓' : '✗'} Inequívoco
                </Badge>
              </div>
            </div>

            {/* Additional Info */}
            {(consent.collection_source || consent.evidence_url || consent.language) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consent.collection_source && (
                  <div>
                    <Label className="font-medium">Fonte de Coleta</Label>
                    <p className="text-sm">{consent.collection_source}</p>
                  </div>
                )}
                {consent.language && (
                  <div>
                    <Label className="font-medium">Idioma</Label>
                    <p className="text-sm">{consent.language.toUpperCase()}</p>
                  </div>
                )}
                {consent.evidence_url && (
                  <div className="md:col-span-2">
                    <Label className="font-medium">URL de Evidência</Label>
                    <p className="text-sm text-blue-600">{consent.evidence_url}</p>
                  </div>
                )}
              </div>
            )}

            {/* Revocation Details */}
            {consent.status === 'revoked' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <Label className="font-medium text-red-800">Detalhes da Revogação</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-red-700">
                    <strong>Data:</strong> {consent.revoked_at ? new Date(consent.revoked_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                  {consent.revocation_reason && (
                    <p className="text-sm text-red-700">
                      <strong>Motivo:</strong> {consent.revocation_reason}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}