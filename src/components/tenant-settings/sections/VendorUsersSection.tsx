import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Building2, Mail, User, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VendorPortalUser {
    id: string;
    email: string;
    vendor_id: string;
    vendor_name: string;
    tenant_id: string | null;
    created_at: string;
    force_password_change: boolean;
}

interface VendorUsersSectionProps {
    tenantId: string;
}

export const VendorUsersSection: React.FC<VendorUsersSectionProps> = ({ tenantId }) => {
    const [users, setUsers] = useState<VendorPortalUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (tenantId) loadVendorPortalUsers();
    }, [tenantId]);

    const loadVendorPortalUsers = async () => {
        setIsLoading(true);
        try {
            // 1. Get all vendor registries that belong to this tenant
            const { data: registries, error: regError } = await supabase
                .from('vendor_registry')
                .select('id, name')
                .eq('tenant_id', tenantId);

            if (regError) {
                console.error('vendor_registry error:', regError);
                setUsers([]);
                setIsLoading(false);
                return;
            }

            if (!registries || registries.length === 0) {
                setUsers([]);
                setIsLoading(false);
                return;
            }

            const registryMap = Object.fromEntries(registries.map(r => [r.id, r.name]));
            const vendorIds = registries.map(r => r.id);

            // 2. Get vendor_portal_users that belong to those vendors
            const { data: portalUsers, error: puError } = await supabase
                .from('vendor_portal_users')
                .select('id, email, vendor_id, tenant_id, created_at, force_password_change')
                .in('vendor_id', vendorIds)
                .order('created_at', { ascending: false });

            if (puError) {
                console.error('vendor_portal_users error:', puError);
                setUsers([]);
                setIsLoading(false);
                return;
            }

            const mapped: VendorPortalUser[] = (portalUsers || []).map(u => ({
                id: u.id,
                email: u.email || '',
                vendor_id: u.vendor_id,
                vendor_name: registryMap[u.vendor_id] || 'Empresa desconhecida',
                tenant_id: u.tenant_id,
                created_at: u.created_at || '',
                force_password_change: u.force_password_change ?? true,
            }));

            setUsers(mapped);
        } catch (err) {
            console.error('Error loading vendor portal users:', err);
            toast.error('Erro ao carregar usuários de fornecedores');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = users.filter(u => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return (
            u.email.toLowerCase().includes(t) ||
            u.vendor_name.toLowerCase().includes(t)
        );
    });

    const getStatusBadge = (set: boolean) => {
        // force_password_change = true means they've never logged in yet (pending)
        if (set) {
            return (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs">
                    <Clock className="h-3 w-3 mr-1" />Acesso Pendente
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />Ativo
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">Carregando usuários de fornecedores...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Usuários de Fornecedores
                    </CardTitle>
                    <CardDescription>
                        Contas com acesso ao Portal do Fornecedor. Cada acesso fica vinculado ao fornecedor cadastrado.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por email ou empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <Building2 className="h-10 w-10 text-muted-foreground/50 mb-4" />
                            <h3 className="text-base font-medium">
                                {searchTerm ? 'Nenhum resultado encontrado' : 'Sem usuários fornecedores'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                {searchTerm
                                    ? 'Tente um termo diferente.'
                                    : 'Quando um fornecedor receber credenciais de acesso ao portal, aparecerá aqui.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile */}
                            <div className="sm:hidden space-y-2">
                                {filtered.map(u => (
                                    <div key={u.id} className="rounded-lg border p-3 bg-card space-y-2">
                                        <div className="font-medium text-sm truncate">{u.email}</div>
                                        <div className="text-xs text-muted-foreground">{u.vendor_name}</div>
                                        {getStatusBadge(u.force_password_change)}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop */}
                            <div className="hidden sm:block rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Empresa (Fornecedor)</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Adicionado em</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map(u => (
                                            <TableRow key={u.id} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                                            {u.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <p className="text-sm font-medium">{u.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {u.vendor_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(u.force_password_change)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
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
        </div>
    );
};
