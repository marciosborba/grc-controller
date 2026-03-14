import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CommunicationTabProps {
    risk: any;
    user: any;
    userTenantId: string | null;
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({ risk, user, userTenantId }) => {
    const { toast } = useToast();
    const stakeholders: any[] = risk.risk_stakeholders || [];
    const [addingPerson, setAddingPerson] = useState(false);
    const [newPerson, setNewPerson] = useState({ name: '', email: '', position: '' });
    const [sending, setSending] = useState<string | null>(null);
    const [addingSending, setAddingSending] = useState(false);

    const handleResendEmail = async (stk: any) => {
        if (!stk.email) { toast({ title: 'E-mail não informado', variant: 'destructive' }); return; }
        setSending(stk.email);
        try {
            const { data: inviteData } = await supabase.functions.invoke('invite-risk-stakeholder', {
                body: {
                    email: stk.email,
                    full_name: stk.name || stk.email,
                    tenant_id: userTenantId || (risk as any).tenant_id,
                }
            });
            const customPortalUrl = inviteData?.inviteLink || undefined;
            const { error } = await supabase.functions.invoke('risk-notification', {
                body: {
                    recipientName: stk.name || 'Stakeholder',
                    recipientEmail: stk.email,
                    riskTitle: risk.title || risk.risk_title || risk.name || 'Risco',
                    riskDescription: risk.description || risk.risk_description || '',
                    riskLevel: risk.riskLevel || risk.risk_level || 'Não definido',
                    riskCategory: risk.category || risk.risk_category || '',
                    senderName: user?.email || 'Sistema',
                    customPortalUrl,
                }
            });
            if (error) throw error;
            toast({ title: 'E-mail reenviado', description: `Notificação enviada para ${stk.email}` });
        } catch (err: any) {
            toast({ title: 'Erro ao reenviar', description: err.message, variant: 'destructive' });
        } finally {
            setSending(null);
        }
    };

    const handleAddPerson = async () => {
        if (!newPerson.name.trim() || !newPerson.email.trim()) {
            toast({ title: 'Nome e e-mail são obrigatórios', variant: 'destructive' }); return;
        }
        setAddingSending(true);
        try {
            const effectiveTenantId = userTenantId || (risk as any).tenant_id;
            const { error: dbErr } = await supabase.from('risk_stakeholders').insert({
                risk_registration_id: risk.id,
                tenant_id: effectiveTenantId,
                name: newPerson.name.trim(),
                position: newPerson.position.trim() || null,
                email: newPerson.email.trim().toLowerCase(),
                notification_type: 'awareness',
                response_status: 'pending',
                notified_at: new Date().toISOString(),
            });
            if (dbErr) throw dbErr;

            const { data: inviteData } = await supabase.functions.invoke('invite-risk-stakeholder', {
                body: {
                    email: newPerson.email.trim().toLowerCase(),
                    full_name: newPerson.name.trim(),
                    tenant_id: userTenantId || (risk as any).tenant_id,
                }
            });
            const customPortalUrl = inviteData?.inviteLink || undefined;
            await supabase.functions.invoke('risk-notification', {
                body: {
                    recipientName: newPerson.name,
                    recipientEmail: newPerson.email.trim().toLowerCase(),
                    riskTitle: risk.title || risk.risk_title || risk.name || 'Risco',
                    riskDescription: risk.description || risk.risk_description || '',
                    riskLevel: risk.riskLevel || risk.risk_level || 'Não definido',
                    riskCategory: risk.category || risk.risk_category || '',
                    senderName: user?.email || 'Sistema',
                    customPortalUrl,
                }
            });
            toast({ title: 'Pessoa adicionada e notificada!', description: `E-mail enviado para ${newPerson.email}` });
            setNewPerson({ name: '', email: '', position: '' });
            setAddingPerson(false);
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally {
            setAddingSending(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Pessoas comunicadas ({stakeholders.length})
                </h4>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setAddingPerson(v => !v)}>
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Pessoa
                </Button>
            </div>

            {/* Stakeholder list */}
            {stakeholders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                    <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma pessoa comunicada neste risco.</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Use "Adicionar Pessoa" para notificar alguém.</p>
                </div>
            ) : (
                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b">
                                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">Nome</th>
                                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground hidden sm:table-cell">Cargo</th>
                                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground hidden md:table-cell">E-mail</th>
                                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground hidden lg:table-cell">Comunicado em</th>
                                <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stakeholders.map((stk: any, i: number) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                                                {(stk.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm leading-tight">{stk.name || '—'}</p>
                                                <p className="text-xs text-muted-foreground md:hidden truncate max-w-[140px]">{stk.email || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{stk.position || stk.role || '—'}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">
                                        <span className="truncate block max-w-[180px]">{stk.email || '—'}</span>
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground text-xs hidden lg:table-cell">
                                        {stk.created_at
                                            ? new Date(stk.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="Reenviar e-mail"
                                            disabled={sending === stk.email}
                                            onClick={() => handleResendEmail(stk)}
                                        >
                                            {sending === stk.email ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add person form */}
            {addingPerson && (
                <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                    <h5 className="text-sm font-medium">Nova pessoa para comunicar</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="grid gap-1">
                            <Label className="text-xs">Nome *</Label>
                            <Input placeholder="Nome completo" value={newPerson.name} onChange={(e) => setNewPerson(p => ({ ...p, name: e.target.value }))} className="h-9" />
                        </div>
                        <div className="grid gap-1">
                            <Label className="text-xs">E-mail *</Label>
                            <Input placeholder="email@empresa.com" type="email" value={newPerson.email} onChange={(e) => setNewPerson(p => ({ ...p, email: e.target.value }))} className="h-9" />
                        </div>
                        <div className="grid gap-1">
                            <Label className="text-xs">Cargo</Label>
                            <Input placeholder="Ex: Diretor de TI" value={newPerson.position} onChange={(e) => setNewPerson(p => ({ ...p, position: e.target.value }))} className="h-9" />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setAddingPerson(false); setNewPerson({ name: '', email: '', position: '' }); }}>
                            Cancelar
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={handleAddPerson} disabled={addingSending}>
                            {addingSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Enviar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
