// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Send,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Shield,
  X,
  Mail,
  ArrowUpDown,
  ChevronDown,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import type { Risk } from '@/types/risk-management';

interface StakeholderRow {
  id: string;
  risk_registration_id: string;
  name: string;
  email: string;
  position: string | null;
  phone: string | null;
  notification_type: 'awareness' | 'approval';
  response_status: 'pending' | 'acknowledged' | 'approved' | 'rejected';
  notified_at: string | null;
  acknowledged_at: string | null;
  approved_at: string | null;
  response_notes: string | null;
  created_at: string;
  risk_title: string;
}

interface CommunicationCenterIntegratedProps {
  risks: Risk[];
  onSendMessage?: (message: any) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ComponentType<any> }> = {
  pending:      { label: 'Pendente',  className: 'bg-amber-50  text-amber-700  border-amber-200',  icon: Clock },
  acknowledged: { label: 'Ciente',    className: 'bg-green-50  text-green-700  border-green-200',  icon: CheckCircle },
  approved:     { label: 'Aprovado',  className: 'bg-blue-50   text-blue-700   border-blue-200',   icon: CheckCircle },
  rejected:     { label: 'Rejeitado', className: 'bg-red-50    text-red-700    border-red-200',    icon: AlertCircle },
};

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  awareness: { label: 'Ciência',   className: 'bg-violet-50 text-violet-700 border-violet-200' },
  approval:  { label: 'Aprovação', className: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export const CommunicationCenterIntegrated: React.FC<CommunicationCenterIntegratedProps> = ({ risks }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stakeholders, setStakeholders] = useState<StakeholderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    position: '',
    notification_type: 'awareness' as 'awareness' | 'approval',
    riskId: '',
  });
  const [addSending, setAddSending] = useState(false);

  const loadStakeholders = useCallback(async () => {
    setIsLoading(true);
    try {
      // RLS handles tenant isolation via the risk_registrations FK chain
      const { data, error } = await supabase
        .from('risk_stakeholders')
        .select(`
          id,
          risk_registration_id,
          name,
          email,
          position,
          phone,
          notification_type,
          response_status,
          notified_at,
          acknowledged_at,
          approved_at,
          response_notes,
          created_at,
          risk_registrations!risk_stakeholders_risk_registration_id_fkey(risk_title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows: StakeholderRow[] = (data || []).map((row: any) => ({
        ...row,
        risk_title: row.risk_registrations?.risk_title || '—',
      }));
      setStakeholders(rows);
    } catch (err: any) {
      console.error('[CommunicationHub] load error:', err.message);
      toast({ title: 'Erro ao carregar dados', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStakeholders(); }, [loadStakeholders]);

  const fireNotification = (name: string, email: string, riskId: string, portalUrl?: string) => {
    const risk = risks.find(r => r.id === riskId);
    supabase.functions.invoke('risk-notification', {
      body: {
        recipientName: name || 'Stakeholder',
        recipientEmail: email,
        riskTitle: risk?.title || risk?.name || 'Risco',
        riskDescription: risk?.description || '',
        riskLevel: risk?.riskLevel || '',
        riskCategory: risk?.category || '',
        senderName: user?.email || 'Sistema',
        customPortalUrl: portalUrl,
      }
    }).catch((e: any) => console.error('[risk-notification]', e.message));
  };

  const handleResend = async (stk: StakeholderRow) => {
    if (!stk.email) { toast({ title: 'E-mail não informado', variant: 'destructive' }); return; }
    setProcessingId(stk.id + '_resend');
    try {
      const { data: inviteData, error: inviteErr } = await supabase.functions.invoke('invite-risk-stakeholder', {
        body: { email: stk.email, full_name: stk.name || stk.email }
      });
      if (inviteErr) throw inviteErr;
      await supabase.from('risk_stakeholders').update({ notified_at: new Date().toISOString() }).eq('id', stk.id);
      fireNotification(stk.name, stk.email, stk.risk_registration_id, inviteData?.inviteLink);
      toast({ title: 'Notificação reenviada', description: `E-mail enviado para ${stk.email}` });
      loadStakeholders();
    } catch (err: any) {
      toast({ title: 'Erro ao reenviar', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeType = async (stk: StakeholderRow, newType: 'awareness' | 'approval') => {
    setProcessingId(stk.id + '_type');
    try {
      const { error } = await supabase.from('risk_stakeholders').update({ notification_type: newType }).eq('id', stk.id);
      if (error) throw error;
      toast({ title: 'Tipo atualizado', description: `${stk.name} → ${TYPE_CONFIG[newType].label}` });
      loadStakeholders();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (stk: StakeholderRow) => {
    if (!confirm(`Remover ${stk.name} da comunicação?\n\nRisco: ${stk.risk_title}`)) return;
    setProcessingId(stk.id + '_del');
    try {
      const { error } = await supabase.from('risk_stakeholders').delete().eq('id', stk.id);
      if (error) throw error;
      toast({ title: 'Removido com sucesso' });
      loadStakeholders();
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.riskId) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha nome, e-mail e selecione o risco.', variant: 'destructive' });
      return;
    }
    setAddSending(true);
    try {
      const riskReg = risks.find(r => r.id === addForm.riskId);
      const tenantId = (riskReg as any)?.tenant_id || null;

      const insertPayload: any = {
        risk_registration_id: addForm.riskId,
        name: addForm.name.trim(),
        position: addForm.position.trim() || null,
        email: addForm.email.trim().toLowerCase(),
        notification_type: addForm.notification_type,
        response_status: 'pending',
        notified_at: new Date().toISOString(),
      };
      if (tenantId) insertPayload.tenant_id = tenantId;

      const { error: dbErr } = await supabase.from('risk_stakeholders').insert(insertPayload);
      if (dbErr) throw dbErr;

      const { data: inviteData, error: inviteErr } = await supabase.functions.invoke('invite-risk-stakeholder', {
        body: { email: addForm.email.trim().toLowerCase(), full_name: addForm.name.trim() }
      });
      if (inviteErr) throw inviteErr;

      fireNotification(addForm.name, addForm.email.trim().toLowerCase(), addForm.riskId, inviteData?.inviteLink);
      toast({ title: 'Parte interessada adicionada', description: `Notificação enviada para ${addForm.email}` });
      setAddForm({ name: '', email: '', position: '', notification_type: 'awareness', riskId: '' });
      setShowAddModal(false);
      loadStakeholders();
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, variant: 'destructive' });
    } finally {
      setAddSending(false);
    }
  };

  // Unique risks list for filter dropdown
  const uniqueRisks = Array.from(
    new Map(stakeholders.map(s => [s.risk_registration_id, { id: s.risk_registration_id, title: s.risk_title }])).values()
  );

  const filtered = stakeholders.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.risk_title?.toLowerCase().includes(q) || s.position?.toLowerCase().includes(q);
    const matchType   = filterType   === 'all' || s.notification_type  === filterType;
    const matchStatus = filterStatus === 'all' || s.response_status    === filterStatus;
    const matchRisk   = filterRisk   === 'all' || s.risk_registration_id === filterRisk;
    return matchSearch && matchType && matchStatus && matchRisk;
  });

  const stats = {
    total:      stakeholders.length,
    pending:    stakeholders.filter(s => s.response_status === 'pending').length,
    ciencia:    stakeholders.filter(s => s.notification_type === 'awareness').length,
    aprovacao:  stakeholders.filter(s => s.notification_type === 'approval').length,
    confirmados: stakeholders.filter(s => s.response_status === 'acknowledged' || s.response_status === 'approved').length,
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const hasFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterRisk !== 'all';

  return (
    <div className="space-y-4">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Ciência de Risco
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão centralizada de todas as comunicações e aprovações de riscos
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadStakeholders} disabled={isLoading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Adicionar Parte Interessada
          </Button>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total,       color: 'border-slate-300  bg-slate-50  text-slate-700',  icon: Users },
          { label: 'Pendentes', value: stats.pending,  color: 'border-amber-300  bg-amber-50  text-amber-700',  icon: Clock },
          { label: 'Ciência',   value: stats.ciencia,  color: 'border-violet-300 bg-violet-50 text-violet-700', icon: Eye },
          { label: 'Aprovação', value: stats.aprovacao, color: 'border-orange-300 bg-orange-50 text-orange-700', icon: CheckCircle },
          { label: 'Confirmados', value: stats.confirmados, color: 'border-green-300 bg-green-50 text-green-700', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className={`border ${color} shadow-none`}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="h-5 w-5 opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium opacity-80 truncate">{label}</p>
                <p className="text-2xl font-bold leading-none mt-0.5">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── FILTERS ────────────────────────────────────────────────────── */}
      <Card className="shadow-none border">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
              <Input
                placeholder="Buscar por nome, e-mail ou risco..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="h-8 px-2 border border-input rounded-md bg-background text-sm text-foreground"
            >
              <option value="all">Todos os Riscos</option>
              {uniqueRisks.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="h-8 px-2 border border-input rounded-md bg-background text-sm text-foreground"
            >
              <option value="all">Todos os Tipos</option>
              <option value="awareness">Ciência</option>
              <option value="approval">Aprovação</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="h-8 px-2 border border-input rounded-md bg-background text-sm text-foreground"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="acknowledged">Ciente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterStatus('all'); setFilterRisk('all'); }}
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}

            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── TABLE ──────────────────────────────────────────────────────── */}
      <Card className="shadow-none border">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Carregando comunicações...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-muted-foreground">
              {stakeholders.length === 0
                ? 'Nenhuma comunicação registrada'
                : 'Nenhum resultado para os filtros aplicados'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {stakeholders.length === 0
                ? 'Use "Adicionar Parte Interessada" ou cadastre pela aba Comunicação do card de risco.'
                : 'Tente ajustar ou limpar os filtros.'}
            </p>
            {stakeholders.length === 0 && (
              <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                Adicionar agora
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">Pessoa</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide hidden md:table-cell">Risco</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide hidden sm:table-cell">Cargo</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">Tipo</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide hidden lg:table-cell">Notificado em</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(stk => {
                  const statusCfg = STATUS_CONFIG[stk.response_status] ?? STATUS_CONFIG.pending;
                  const typeCfg   = TYPE_CONFIG[stk.notification_type]  ?? TYPE_CONFIG.awareness;
                  const StatusIcon = statusCfg.icon;
                  const isProcessing = processingId?.startsWith(stk.id);

                  return (
                    <tr key={stk.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Person */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                            {(stk.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate max-w-[140px]">{stk.name || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{stk.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Risk */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{stk.risk_title}</span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {stk.position || '—'}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs font-medium ${typeCfg.className}`}>
                          {typeCfg.label}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs font-medium gap-1 ${statusCfg.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                        {formatDate(stk.notified_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={!!isProcessing}
                            >
                              {isProcessing
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <MoreVertical className="h-3.5 w-3.5" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleResend(stk)} className="gap-2 cursor-pointer">
                              <Send className="h-3.5 w-3.5" />
                              Reenviar notificação
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleChangeType(stk, stk.notification_type === 'awareness' ? 'approval' : 'awareness')}
                              className="gap-2 cursor-pointer"
                            >
                              <ArrowUpDown className="h-3.5 w-3.5" />
                              Mudar para {stk.notification_type === 'awareness' ? 'Aprovação' : 'Ciência'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(stk)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── ADD MODAL ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  Adicionar Parte Interessada
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A pessoa receberá um e-mail de notificação e acesso ao portal.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Risco <span className="text-destructive">*</span></Label>
                <select
                  value={addForm.riskId}
                  onChange={e => setAddForm(p => ({ ...p, riskId: e.target.value }))}
                  className="w-full h-9 px-3 border border-input rounded-md bg-background text-sm text-foreground"
                >
                  <option value="">Selecione o risco...</option>
                  {risks.map(r => (
                    <option key={r.id} value={r.id}>{r.title || r.name || r.id}</option>
                  ))}
                </select>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nome completo <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Ex: João da Silva"
                    value={addForm.name}
                    onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">E-mail <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    placeholder="joao.silva@empresa.com"
                    value={addForm.email}
                    onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Position + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Cargo</Label>
                  <Input
                    placeholder="Ex: Diretor de TI"
                    value={addForm.position}
                    onChange={e => setAddForm(p => ({ ...p, position: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tipo</Label>
                  <select
                    value={addForm.notification_type}
                    onChange={e => setAddForm(p => ({ ...p, notification_type: e.target.value as 'awareness' | 'approval' }))}
                    className="w-full h-9 px-3 border border-input rounded-md bg-background text-sm text-foreground"
                  >
                    <option value="awareness">Ciência</option>
                    <option value="approval">Aprovação</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)} disabled={addSending}>
                  Cancelar
                </Button>
                <Button className="flex-1 gap-2" onClick={handleAdd} disabled={addSending}>
                  {addSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Adicionar e Notificar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
