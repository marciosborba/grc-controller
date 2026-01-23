
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users2, Database, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { useTenantManagement } from '@/hooks/useTenantManagement';
import { toast } from 'sonner';

interface TenantOverviewTabProps {
    tenantId: string;
}

export const TenantOverviewTab: React.FC<TenantOverviewTabProps> = ({ tenantId }) => {
    const { getTenant, updateTenant, getTenantUsers } = useTenantManagement();
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Stats
    const [usersCount, setUsersCount] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        contact_email: '',
        contact_phone: '',
        billing_email: '',
    });

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const loadData = async () => {
        try {
            const tenantData = await getTenant(tenantId);
            if (tenantData) {
                setTenant(tenantData);
                setFormData({
                    name: tenantData.name,
                    slug: tenantData.slug,
                    contact_email: tenantData.contact_email,
                    contact_phone: tenantData.contact_phone || '',
                    billing_email: tenantData.billing_email || ''
                });
            }

            const users = await getTenantUsers(tenantId);
            setUsersCount(users?.length || 0);

            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTenant({
                tenantId,
                data: formData
            });
            toast.success("Dados atualizados com sucesso!");
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Carregando...</div>;
    if (!tenant) return <div>Erro ao carregar tenant.</div>;

    const usagePercent = Math.round((usersCount / tenant.max_users) * 100);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                            <Users2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                            <h3 className="text-2xl font-bold">{usersCount} / {tenant.max_users}</h3>
                            <Progress value={usagePercent} className="h-2 mt-2 w-32" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                            <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                            <h3 className="text-2xl font-bold capitalize">{tenant.subscription_plan}</h3>
                            <Badge variant={tenant.is_active ? 'default' : 'destructive'} className="mt-1">
                                {tenant.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                            <h3 className="text-lg font-bold">
                                {new Date(tenant.created_at).toLocaleDateString()}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Utima atualização: {new Date(tenant.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações da Organização</CardTitle>
                    <CardDescription>Dados cadastrais e informações de contato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome da Empresa</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug (URL)</Label>
                            <Input value={formData.slug} disabled className="bg-muted" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email de Contato</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <div className="relative">
                                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" value={formData.contact_phone} onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Email Financeiro</Label>
                        <Input value={formData.billing_email} onChange={e => setFormData({ ...formData, billing_email: e.target.value })} />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
