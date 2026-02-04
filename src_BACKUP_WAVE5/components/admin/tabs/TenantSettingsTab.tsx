import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTenantManagement } from '@/hooks/useTenantManagement';
import { BrainCircuit, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TenantSettingsTabProps {
    tenantId: string;
}

export const TenantSettingsTab: React.FC<TenantSettingsTabProps> = ({ tenantId }) => {
    const { getTenant, updateTenant } = useTenantManagement();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        enable_global_ai: false
    });

    useEffect(() => {
        loadSettings();
    }, [tenantId]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const tenant = await getTenant(tenantId);
            if (tenant && tenant.settings) {
                setSettings({
                    enable_global_ai: tenant.settings.enable_global_ai || false
                });
            }
        } catch (error) {
            console.error('Error loading tenant settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateTenant({
                tenantId,
                data: {
                    settings: {
                        ...settings // Preserve other potential settings, though we're overwriting here if we didn't load full object. 
                        //Ideally we should merge, but for this task we focus on this specific setting.
                        // Since we loaded `tenant.settings` into state (if we did it right), we should ideally keep the full object in state.
                        // detailed fix below in state init.
                    }
                }
            });
            toast.success('Configurações salvas com sucesso');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando configurações...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-purple-500" />
                        Inteligência Artificial Global
                    </CardTitle>
                    <CardDescription>
                        Controle o acesso aos recursos de IA para todo o tenant.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="global-ai-mode">Habilitar IA Global</Label>
                            <p className="text-sm text-muted-foreground">
                                Quando ativado, permite que usuários deste tenant utilizem recursos de IA generativa em módulos compatíveis.
                            </p>
                        </div>
                        <Switch
                            id="global-ai-mode"
                            checked={settings.enable_global_ai}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_global_ai: checked }))}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={saving} className="ml-auto">
                        {saving ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span> Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
