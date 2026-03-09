import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Shield, Plus, Pencil, Trash2, Users, ToggleLeft, Key, ShieldCheck,
    Mail, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface TenantRole {
    id: string;
    name: string;
    description: string | null;
    color: string;
    created_at: string;
}

interface RolePermission {
    id: string;
    role_id: string;
    module_key: string;
    can_access: boolean;
}

interface GuestUser {
    id: string;
    email: string;
    full_name: string;
    system_role: string;
    is_active: boolean;
    created_at: string;
    last_login_at: string | null;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const MODULES = [
    { key: 'dashboard', label: 'Dashboard Principal', description: 'Visão geral, métricas e painel executivo' },
    { key: 'risk_management', label: 'Gestão de Riscos', description: 'Módulo de registro e gestão de riscos' },
    { key: 'compliance', label: 'Compliance', description: 'Frameworks e controles de compliance' },
    { key: 'audit', label: 'Auditoria', description: 'Módulo de auditoria interna' },
    { key: 'incidents', label: 'Incidentes', description: 'Gestão de incidentes de segurança' },
    { key: 'assets', label: 'Ativos', description: 'Inventário e gestão de ativos' },
    { key: 'vulnerabilities', label: 'Vulnerabilidades', description: 'Gestão de vulnerabilidades' },
    { key: 'privacy', label: 'Privacidade (LGPD/GDPR)', description: 'Gestão de privacidade e proteção de dados' },
    { key: 'ethics', label: 'Canal de Ética', description: 'Denúncias e acompanhamento ético' },
    { key: 'tprm', label: 'Gestão de Terceiros', description: 'Avaliação de riscos de fornecedores (TPRM)' },
    { key: 'action_plans', label: 'Planos de Ação', description: 'Gestão e acompanhamento de planos de ação' },
    { key: 'reports', label: 'Analytics e Relatórios', description: 'Geração de relatórios gerenciais e técnicos' },
    { key: 'strategic_planning', label: 'Planejamento Estratégico', description: 'Metas e objetivos corporativos' },
    { key: 'policies', label: 'Políticas', description: 'Gestão de políticas e documentos normativos' },
    { key: 'risk_portal', label: 'Portal de Riscos', description: 'Acesso ao portal para partes interessadas' },
    { key: 'vendor_portal', label: 'Portal do Fornecedor', description: 'Acesso ao portal de fornecedores' },
    { key: 'settings', label: 'Configurações', description: 'Configurações da organização e IAM' },
];

const ROLE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

export const RolesTab = ({ tenantId }: { tenantId: string }) => {
    const [roles, setRoles] = useState<TenantRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editRole, setEditRole] = useState<TenantRole | null>(null);
    const [form, setForm] = useState({ name: '', description: '', color: ROLE_COLORS[0] });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchRoles(); }, [tenantId]);

    const fetchRoles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tenant_roles')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at');
        if (!error) setRoles(data || []);
        setLoading(false);
    };

    const openCreate = () => {
        setEditRole(null);
        setForm({ name: '', description: '', color: ROLE_COLORS[0] });
        setIsOpen(true);
    };

    const openEdit = (role: TenantRole) => {
        setEditRole(role);
        setForm({ name: role.name, description: role.description || '', color: role.color || ROLE_COLORS[0] });
        setIsOpen(true);
    };

    const save = async () => {
        if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
        setSaving(true);
        try {
            if (editRole) {
                const { error } = await supabase.from('tenant_roles').update({
                    name: form.name, description: form.description || null, color: form.color,
                }).eq('id', editRole.id);
                if (error) throw error;
                toast.success('Função atualizada!');
            } else {
                const { error } = await supabase.from('tenant_roles').insert({
                    tenant_id: tenantId, name: form.name, description: form.description || null, color: form.color,
                });
                if (error) throw error;
                toast.success('Função criada!');
            }
            setIsOpen(false);
            fetchRoles();
        } catch (err: any) {
            toast.error(err.message);
        } finally { setSaving(false); }
    };

    const remove = async (roleId: string, roleName: string) => {
        if (!confirm(`Excluir a função "${roleName}"? Usuários associados perderão essa função.`)) return;
        const { error } = await supabase.from('tenant_roles').delete().eq('id', roleId);
        if (error) toast.error(error.message);
        else { toast.success('Função excluída!'); fetchRoles(); }
    };

    if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-foreground">Funções de Acesso</h3>
                    <p className="text-sm text-muted-foreground">Crie funções personalizadas para controlar o acesso dos usuários</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nova Função</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editRole ? 'Editar Função' : 'Nova Função'}</DialogTitle>
                            <DialogDescription>Defina um nome e as permissões para esta função de acesso.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label>Nome da Função *</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Analista de Riscos" />
                            </div>
                            <div>
                                <Label>Descrição</Label>
                                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva as responsabilidades desta função" />
                            </div>
                            <div>
                                <Label>Cor de identificação</Label>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {ROLE_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setForm({ ...form, color: c })}
                                            className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {roles.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-14 text-center">
                        <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">Nenhuma função criada</p>
                        <p className="text-sm text-muted-foreground mb-4">Comece criando uma função para atribuir aos usuários convidados</p>
                        <Button onClick={openCreate} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Nova Função</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roles.map(role => (
                        <Card key={role.id} className="border border-border hover:shadow-sm transition-shadow">
                            <CardContent className="p-4 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: (role.color || '#3b82f6') + '20' }}>
                                        <Shield className="h-4 w-4" style={{ color: role.color || '#3b82f6' }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{role.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{role.description || 'Sem descrição'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(role)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(role.id, role.name)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const RBACTab = ({ tenantId }: { tenantId: string }) => {
    const [roles, setRoles] = useState<TenantRole[]>([]);
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
    const [selectedRole, setSelectedRole] = useState<TenantRole | null>(null);
    const [saving, setSaving] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [enabledModules, setEnabledModules] = useState<string[]>([]);

    useEffect(() => { fetchData(); }, [tenantId]);

    const fetchData = async () => {
        setLoading(true);
        const { data: rolesData } = await supabase.from('tenant_roles').select('*').eq('tenant_id', tenantId).order('name');
        const { data: permsData } = await supabase.from('role_module_permissions').select('*').in('role_id', (rolesData || []).map(r => r.id));
        const { data: tenantModules } = await supabase.from('tenant_modules').select('module_key, is_enabled').eq('tenant_id', tenantId);

        let enabledKeys: string[] = [];
        if (tenantModules && tenantModules.length > 0) {
            enabledKeys = tenantModules.filter(m => m.is_enabled).map(m => m.module_key);
        } else {
            // Fallback default
            enabledKeys = ['dashboard', 'risk_management', 'compliance', 'incidents', 'settings'];
        }
        setEnabledModules(enabledKeys);

        const permsMap: Record<string, Record<string, boolean>> = {};
        (permsData || []).forEach((p: RolePermission) => {
            if (!permsMap[p.role_id]) permsMap[p.role_id] = {};
            permsMap[p.role_id][p.module_key] = p.can_access;
        });

        setRoles(rolesData || []);
        setPermissions(permsMap);
        if (rolesData && rolesData.length > 0 && !selectedRole) setSelectedRole(rolesData[0]);
        setLoading(false);
    };

    const togglePermission = async (roleId: string, moduleKey: string, currentVal: boolean) => {
        const key = `${roleId}-${moduleKey}`;
        setSaving(key);
        const newVal = !currentVal;
        try {
            const { data: existing } = await supabase.from('role_module_permissions').select('id').eq('role_id', roleId).eq('module_key', moduleKey).maybeSingle();
            if (existing) {
                await supabase.from('role_module_permissions').update({ can_access: newVal }).eq('id', existing.id);
            } else {
                await supabase.from('role_module_permissions').insert({ role_id: roleId, module_key: moduleKey, can_access: newVal });
            }
            setPermissions(prev => ({ ...prev, [roleId]: { ...(prev[roleId] || {}), [moduleKey]: newVal } }));
        } catch (err: any) {
            toast.error(err.message);
        } finally { setSaving(null); }
    };

    if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando RBAC...</div>;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-bold text-foreground">Controle de Acesso por Módulo</h3>
                <p className="text-sm text-muted-foreground">Defina quais módulos cada função pode acessar</p>
            </div>

            {roles.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-14 text-center">
                        <Key className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">Crie funções primeiro</p>
                        <p className="text-sm text-muted-foreground">Vá para a aba "Funções" para criar as funções de acesso</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Role selector */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funções</p>
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedRole?.id === role.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'}`}
                            >
                                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: role.color || '#3b82f6' }} />
                                {role.name}
                            </button>
                        ))}
                    </div>

                    {/* Permissions grid */}
                    {selectedRole && (
                        <div className="md:col-span-3">
                            <Card className="border border-border">
                                <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm">Permissões — {selectedRole.name}</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">{selectedRole.description || 'Selecione quais módulos esta função pode acessar'}</CardDescription>
                                    </div>
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: (selectedRole.color || '#3b82f6') + '20' }}>
                                        <Shield className="h-4 w-4" style={{ color: selectedRole.color || '#3b82f6' }} />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {MODULES.filter(m => enabledModules.includes(m.key) || m.key === 'settings').map(mod => {
                                            const allowed = permissions[selectedRole.id]?.[mod.key] ?? false;
                                            const isSaving = saving === `${selectedRole.id}-${mod.key}`;
                                            return (
                                                <div key={mod.key} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{mod.label}</p>
                                                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {allowed ? (
                                                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/20">✓ Permitido</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-500/20">✕ Negado</Badge>
                                                        )}
                                                        <Switch
                                                            checked={allowed}
                                                            disabled={isSaving}
                                                            onCheckedChange={() => togglePermission(selectedRole.id, mod.key, allowed)}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const GuestUsersTab = ({ tenantId }: { tenantId: string }) => {
    const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', full_name: '' });
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    useEffect(() => { fetchGuests(); }, [tenantId]);

    const fetchGuests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, system_role, is_active, created_at, last_login_at')
            .eq('tenant_id', tenantId)
            .eq('system_role', 'guest')
            .order('created_at', { ascending: false });
        if (!error) setGuestUsers(data || []);
        setLoading(false);
    };

    const sendInvite = async () => {
        if (!inviteForm.email.trim()) { toast.error('E-mail obrigatório'); return; }
        setInviting(true);
        try {
            const { error } = await supabase.functions.invoke('invite-risk-stakeholder', {
                body: {
                    email: inviteForm.email.trim().toLowerCase(),
                    full_name: inviteForm.full_name.trim(),
                    tenant_id: tenantId,
                }
            });
            if (error) throw new Error(error.message);
            toast.success(`Convite enviado para ${inviteForm.email}`);
            setIsInviteOpen(false);
            setInviteForm({ email: '', full_name: '' });
            setTimeout(fetchGuests, 1500);
        } catch (err: any) {
            toast.error(`Erro ao enviar convite: ${err.message}`);
        } finally { setInviting(false); }
    };

    const resendInvite = async (email: string) => {
        try {
            const { error } = await supabase.functions.invoke('invite-risk-stakeholder', {
                body: { email, tenant_id: tenantId, resend: true }
            });
            if (error) throw new Error(error.message);
            toast.success(`Convite reenviado para ${email}`);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando usuários...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-foreground">Usuários Convidados</h3>
                    <p className="text-sm text-muted-foreground">Partes interessadas com acesso ao Portal de Riscos</p>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Mail className="h-4 w-4" /> Convidar Usuário</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Convidar Usuário Convidado</DialogTitle>
                            <DialogDescription>
                                O usuário receberá um e-mail para definir sua senha e acessar o Portal de Riscos.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label>E-mail *</Label>
                                <Input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="usuario@empresa.com" />
                            </div>
                            <div>
                                <Label>Nome Completo</Label>
                                <Input value={inviteForm.full_name} onChange={e => setInviteForm({ ...inviteForm, full_name: e.target.value })} placeholder="João Silva" />
                            </div>
                            <div className="bg-blue-500/10 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                <strong>Tipo de acesso:</strong> Convidado — Pode acessar apenas o Portal de Riscos onde for parte interessada. Acesso aos demais módulos pode ser configurado na aba RBAC.
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
                            <Button onClick={sendInvite} disabled={inviting} className="gap-2">
                                <Mail className="h-4 w-4" />{inviting ? 'Enviando...' : 'Enviar Convite'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {guestUsers.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-14 text-center">
                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">Nenhum usuário convidado</p>
                        <p className="text-sm text-muted-foreground mb-4">Ao notificar partes interessadas sobre riscos, elas serão listadas aqui</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Usuário</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden md:table-cell">Último Acesso</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guestUsers.map(u => (
                                <TableRow key={u.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                                                {u.full_name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{u.full_name || 'Sem nome'}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {u.is_active ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Ativo</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs"><Clock className="h-3 w-3 mr-1" />Convite Pendente</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('pt-BR') : 'Nunca acessou'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!u.is_active && (
                                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => resendInvite(u.email)}>
                                                <Mail className="h-3 w-3" /> Reenviar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────

export const AccessPermissionsTab = () => {
    const { selectedTenantId } = useTenantSelector();

    if (!selectedTenantId) return (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Selecione uma organização.</CardContent></Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Permissões de Acesso</h2>
                    <p className="text-sm text-muted-foreground">Gerencie funções, controle de acesso por módulo e usuários convidados</p>
                </div>
            </div>

            <Tabs defaultValue="roles" className="space-y-4">
                <TabsList className="h-auto bg-muted/50 p-1 gap-0.5 w-full sm:w-auto">
                    {[
                        { value: 'roles', icon: Shield, label: 'Funções' },
                        { value: 'rbac', icon: Key, label: 'RBAC' },
                    ].map(({ value, icon: Icon, label }) => (
                        <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                            <Icon className="h-3.5 w-3.5" /> {label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="roles"><RolesTab tenantId={selectedTenantId} /></TabsContent>
                <TabsContent value="rbac"><RBACTab tenantId={selectedTenantId} /></TabsContent>
            </Tabs>
        </div>
    );
};

export default AccessPermissionsTab;
