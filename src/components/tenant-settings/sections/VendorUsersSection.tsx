import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Users, Building2, CheckCircle2, Clock, Trash2, PowerOff, Power,
    AlertCircle, Shield, Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExternalUser {
    email: string;
    full_name?: string;
    vendor_id?: string;
    vendor_name?: string;
    is_active: boolean;
    created_at: string;
    force_password_change?: boolean;
    
    // Access Badges
    has_vendor_access: boolean;
    has_risk_access: boolean;
    has_vulnerability_access: boolean;
    
    // Internal Profile ID logic
    profile_id?: string;
    vpu_id?: string; // vendor_portal_users ID
    system_role?: string;
}

interface VendorUsersSectionProps {
    tenantId: string;
}

export const VendorUsersSection: React.FC<VendorUsersSectionProps> = ({ tenantId }) => {
    const [users, setUsers] = useState<ExternalUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ExternalUser | null>(null);

    useEffect(() => {
        if (tenantId) loadExternalUsers();
    }, [tenantId]);

    const loadExternalUsers = async () => {
        setIsLoading(true);
        try {
            const externalUsersMap = new Map<string, ExternalUser>();

            // 1. Fetch ALL Profiles for the tenant to check roles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, full_name, is_active, created_at, override_risk_portal, override_vulnerability_portal, system_role')
                .eq('tenant_id', tenantId);

            if (profilesError) throw profilesError;

            // Only consider 'guest' and 'vendor' as natively "External" from the profiles side
            profilesData?.forEach(profile => {
                if (!profile.email) return;
                const email = profile.email.toLowerCase();
                
                // If the user is an internal role, we won't ADD them to the map here.
                // But we store their role info to filter them out later if they appear in vendors.
                if (profile.system_role === 'guest' || profile.system_role === 'vendor') {
                    externalUsersMap.set(email, {
                        email,
                        full_name: profile.full_name || '',
                        is_active: profile.is_active ?? true,
                        created_at: profile.created_at || '',
                        profile_id: profile.id,
                        has_risk_access: !!profile.override_risk_portal,
                        has_vulnerability_access: !!profile.override_vulnerability_portal,
                        has_vendor_access: false,
                        system_role: profile.system_role
                    });
                }
            });

            const internalEmails = new Set(
                profilesData?.filter(p => !['guest', 'vendor'].includes(p.system_role || ''))
                    .map(p => p.email?.toLowerCase())
                    .filter(Boolean)
            );

            // 2. Fetch Vendors
            const { data: registries, error: regError } = await supabase
                .from('vendor_registry')
                .select('id, name')
                .eq('tenant_id', tenantId);

            if (regError) throw regError;
            
            if (registries && registries.length > 0) {
                const registryMap = Object.fromEntries(registries.map(r => [r.id, r.name]));
                const vendorIds = registries.map(r => r.id);

                const { data: portalUsers, error: puError } = await supabase
                    .from('vendor_portal_users')
                    .select('id, email, vendor_id, tenant_id, created_at, force_password_change, is_active')
                    .in('vendor_id', vendorIds);

                if (puError) throw puError;

                const { data: vendorUsersData } = await supabase
                    .from('vendor_users')
                    .select('email, is_active')
                    .in('vendor_id', vendorIds);
                    
                const vendorUserMap = Object.fromEntries((vendorUsersData || []).map(vu => [vu.email?.toLowerCase(), vu.is_active]));

                portalUsers?.forEach(pu => {
                    if (!pu.email) return;
                    const email = pu.email.toLowerCase();
                    
                    // CRITICAL: If this email belongs to an INTERNAL user, we skip it in the External Users list
                    // to avoid confusing duplication. Internal users manage their vendor access via internal roles
                    // or we assume they are there for administration/testing.
                    if (internalEmails.has(email)) return;

                    const is_active_vendor = pu.is_active ?? vendorUserMap[email] ?? true;

                    if (externalUsersMap.has(email)) {
                        const existing = externalUsersMap.get(email)!;
                        existing.vendor_id = pu.vendor_id;
                        existing.vendor_name = registryMap[pu.vendor_id] || 'Empresa desconhecida';
                        existing.vpu_id = pu.id;
                        existing.has_vendor_access = true;
                        existing.force_password_change = pu.force_password_change;
                        existing.is_active = existing.is_active && is_active_vendor; 
                    } else {
                        externalUsersMap.set(email, {
                            email,
                            vendor_id: pu.vendor_id,
                            vendor_name: registryMap[pu.vendor_id] || 'Empresa desconhecida',
                            vpu_id: pu.id,
                            is_active: is_active_vendor,
                            created_at: pu.created_at || new Date().toISOString(),
                            force_password_change: pu.force_password_change,
                            has_vendor_access: true,
                            has_risk_access: false,
                            has_vulnerability_access: false
                        });
                    }
                });
            }

            const combinedUsers = Array.from(externalUsersMap.values()).sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setUsers(combinedUsers);
        } catch (err) {
            console.error('Error loading external users:', err);
            toast.error('Erro ao carregar usuários externos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (user: ExternalUser) => {
        const newActive = !user.is_active;
        setIsProcessing(user.email);
        try {
            const { error } = await supabase.rpc('toggle_user_active_status', {
                p_email: user.email,
                p_active: newActive
            });

            if (error) throw error;

            toast.success(newActive ? `${user.email} reativado.` : `${user.email} desativado e sessões encerradas.`);
            await loadExternalUsers();
        } catch (err: any) {
            console.error('Error toggling user status:', err);
            toast.error(`Erro: ${err.message}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleResendInvite = async (user: ExternalUser) => {
        setIsProcessing(`invite-${user.email}`);
        try {
            const { error } = await supabase.functions.invoke('invite-risk-stakeholder', {
                body: {
                    email: user.email,
                    full_name: user.full_name || user.email.split('@')[0],
                    tenant_id: tenantId,
                    resend: true
                }
            });
            if (error) throw new Error(error.message);
            toast.success(`Credenciais/Convite reenviados para ${user.email}`);
        } catch (err: any) {
            toast.error(`Erro ao reenviar convite: ${err.message}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDelete = async (user: ExternalUser) => {
        setIsProcessing(user.email);
        try {
            if (user.vpu_id) {
                await supabase.from('vendor_portal_users').delete().eq('id', user.vpu_id);
            }
            if (user.vendor_id) {
                await supabase.from('vendor_users').delete()
                    .eq('email', user.email)
                    .eq('vendor_id', user.vendor_id);
            }
            if (user.profile_id) {
                await supabase.rpc('toggle_user_active_status', {
                    p_email: user.email,
                    p_active: false
                });
            }

            toast.success(`Acessos de ${user.email} removidos.`);
            setDeleteTarget(null);
            await loadExternalUsers();
        } catch (err: any) {
            toast.error(`Erro ao remover: ${err.message}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const filtered = users.filter(u => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return u.email.toLowerCase().includes(t) || 
               (u.vendor_name || '').toLowerCase().includes(t) ||
               (u.full_name || '').toLowerCase().includes(t);
    });

    const getStatusBadge = (user: ExternalUser) => {
        if (!user.is_active) {
            return (
                <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 text-xs">
                    <PowerOff className="h-3 w-3 mr-1" />Desativado
                </Badge>
            );
        }
        if (user.force_password_change) {
            return (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs">
                    <Clock className="h-3 w-3 mr-1" />Convite Pendente
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />Ativo
            </Badge>
        );
    };

    const renderAccessBadges = (user: ExternalUser) => {
        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {user.has_vendor_access && (
                    <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
                        <Building2 className="w-3 h-3 mr-1" /> Fornecedor
                    </Badge>
                )}
                {user.has_risk_access && (
                    <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20">
                        <Shield className="w-3 h-3 mr-1" /> Riscos
                    </Badge>
                )}
                {user.has_vulnerability_access && (
                    <Badge variant="secondary" className="text-[10px] bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20">
                        <Shield className="w-3 h-3 mr-1" /> Vulnerabilidades
                    </Badge>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">Carregando usuários externos...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Usuários Externos
                    </CardTitle>
                    <CardDescription>
                        Contas de convidados corporativos e fornecedores. Verifique os acessos por meio dos selos ao lado.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por email, nome ou empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <Users className="h-10 w-10 text-muted-foreground/50 mb-4" />
                            <h3 className="text-base font-medium">
                                {searchTerm ? 'Nenhum resultado encontrado' : 'Sem usuários externos'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                {searchTerm
                                    ? 'Tente um termo diferente.'
                                    : 'Convidados responsáveis por tratativas ou preenchimento de portais aparecerão aqui.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile */}
                            <div className="sm:hidden space-y-2">
                                {filtered.map(u => (
                                    <div key={u.email} className="rounded-lg border p-3 bg-card space-y-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{u.full_name || u.vendor_name || 'Usuário'}</span>
                                            <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                                        </div>
                                        {renderAccessBadges(u)}
                                        <div className="mt-1">{getStatusBadge(u)}</div>
                                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
                                            <Button
                                                size="sm" variant="outline" className="text-xs h-7 gap-1"
                                                onClick={() => handleToggleActive(u)}
                                                disabled={isProcessing === u.email}
                                            >
                                                {u.is_active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                                                {u.is_active ? 'Desativar' : 'Reativar'}
                                            </Button>
                                            <Button
                                                size="sm" variant="outline" className="text-xs h-7 gap-1"
                                                onClick={() => handleResendInvite(u)}
                                                disabled={isProcessing === `invite-${u.email}`}
                                            >
                                                <Mail className="h-3 w-3" /> Reenviar
                                            </Button>
                                            <Button
                                                size="sm" variant="outline" className="text-xs h-7 gap-1 text-red-600 hover:text-red-700"
                                                onClick={() => setDeleteTarget(u)}
                                                disabled={isProcessing === u.email}
                                            >
                                                <Trash2 className="h-3 w-3" /> Remover
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop */}
                            <div className="hidden sm:block rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Acessos Autorizados</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map(u => (
                                            <TableRow key={u.email} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                                                            {u.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{u.full_name || u.vendor_name || 'Convidado Externo'}</span>
                                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {renderAccessBadges(u)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(u)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm" variant="outline" className="h-8 gap-1.5 text-xs"
                                                            title="Reenviar e-mail de acesso/senha"
                                                            onClick={() => handleResendInvite(u)}
                                                            disabled={isProcessing === `invite-${u.email}`}
                                                        >
                                                            <Mail className="h-3.5 w-3.5" /> Reenviar
                                                        </Button>
                                                        <Button
                                                            size="sm" variant="outline" className="h-8 gap-1.5 text-xs"
                                                            onClick={() => handleToggleActive(u)}
                                                            disabled={isProcessing === u.email}
                                                        >
                                                            {u.is_active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                                                        </Button>
                                                        <Button
                                                            size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                                                            title="Remover acessos"
                                                            onClick={() => setDeleteTarget(u)}
                                                            disabled={isProcessing === u.email}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Remover Acesso Externo
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja desativar remover <strong>{deleteTarget?.email}</strong>?
                            <br />Esta ação removerá o acesso do usuário aos portais vinculados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteTarget && handleDelete(deleteTarget)}
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
