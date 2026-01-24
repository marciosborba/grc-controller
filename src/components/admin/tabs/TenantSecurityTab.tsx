import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Smartphone, Lock, Globe, Users, Clock, AlertTriangle, Save } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { toast } from 'sonner';

interface TenantSecurityTabProps {
    tenantId: string;
}

export const TenantSecurityTab: React.FC<TenantSecurityTabProps> = ({ tenantId }) => {
    const { settings, updateSettings, loading } = useTenantSettings(tenantId);
    const [localSettings, setLocalSettings] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setLocalSettings({
                mfa_required: settings.security?.mfa_required || false,
                single_session: settings.security?.single_session || false,
                impossible_travel_detection: settings.security?.impossible_travel_detection || false,
                data_encryption: settings.security?.data_encryption || false,
                session_timeout: settings.security?.session_timeout || 30, // minutes
                ip_allowlist: settings.security?.ip_allowlist || '',
                password_policy: {
                    min_length: settings.security?.password_policy?.min_length || 8,
                    require_special: settings.security?.password_policy?.require_special || false,
                    expiry_days: settings.security?.password_policy?.expiry_days || 90
                }
            });
        }
    }, [settings]);

    const handleToggle = (key: string, value: boolean) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleNestedToggle = (parent: string, key: string, value: boolean | number) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [key]: value
            }
        }));
    };

    const handleChange = (key: string, value: any) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings({
                security: localSettings
            });
            toast.success('Configurações de segurança atualizadas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            toast.error('Erro ao salvar configurações de segurança.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Autenticação e Acesso */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Autenticação e Acesso
                        </CardTitle>
                        <CardDescription>Controles de login e identidade</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                    MFA Obrigatório
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Exigir autenticação de dois fatores para todos os usuários
                                </p>
                            </div>
                            <Switch
                                checked={localSettings.mfa_required}
                                onCheckedChange={(c) => handleToggle('mfa_required', c)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    Sessão Única (Single Session)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Impede que o mesmo usuário esteja logado em múltiplos dispositivos simultaneamente
                                </p>
                            </div>
                            <Switch
                                checked={localSettings.single_session}
                                onCheckedChange={(c) => handleToggle('single_session', c)}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Timeout de Sessão (minutos)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={localSettings.session_timeout}
                                    onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                                    className="w-24"
                                    min={5}
                                />
                                <span className="text-sm text-muted-foreground self-center">minutos de inatividade</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Proteção Avançada */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-purple-500" />
                            Proteção Avançada
                        </CardTitle>
                        <CardDescription>Segurança de dados e detecção de ameaças</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    Impossible Travel
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Detectar e bloquear logins geograficamente impossíveis em curto período
                                </p>
                            </div>
                            <Switch
                                checked={localSettings.impossible_travel_detection}
                                onCheckedChange={(c) => handleToggle('impossible_travel_detection', c)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                    Criptografia de Dados
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Criptografia adicional em repouso para campos sensíveis (PII/PHI)
                                </p>
                            </div>
                            <Switch
                                checked={localSettings.data_encryption}
                                onCheckedChange={(c) => handleToggle('data_encryption', c)}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                Política de Senha
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Mínimo Caracteres</Label>
                                    <Input
                                        type="number"
                                        value={localSettings.password_policy?.min_length}
                                        onChange={(e) => handleNestedToggle('password_policy', 'min_length', parseInt(e.target.value))}
                                        className="h-8"
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="special-char"
                                            checked={localSettings.password_policy?.require_special}
                                            onCheckedChange={(c) => handleNestedToggle('password_policy', 'require_special', c)}
                                            className="h-4 w-8"
                                        />
                                        <Label htmlFor="special-char" className="text-xs">Exigir Caracter Especial</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto gap-2">
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Save className="h-4 w-4" />}
                    Salvar Configurações de Segurança
                </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                    <p className="font-semibold">Nota sobre a aplicação das políticas</p>
                    <p>
                        Algumas alterações (como MFA ou Sessão Única) podem exigir que os usuários façam login novamente para entrarem em vigor.
                        A encriptação de dados só se aplica a novos dados inseridos após a ativação.
                    </p>
                </div>
            </div>
        </div>
    );
};
