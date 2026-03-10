import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AISettingsTabContentProps {
    tenantId: string;
    readonly?: boolean;
    mode?: 'platform' | 'tenant';
}

interface AIConfig {
    strict_mode: boolean;
    max_tokens_per_request: number;
    enable_logging: boolean;
    pii_masking: boolean;
}

const DEFAULT_SETTINGS: AIConfig = {
    strict_mode: false,
    max_tokens_per_request: 2000,
    enable_logging: true,
    pii_masking: false
};

export const AISettingsTabContent: React.FC<AISettingsTabContentProps> = ({ tenantId, readonly = false, mode = 'tenant' }) => {
    const [settings, setSettings] = useState<AIConfig>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('settings')
                .eq('id', tenantId)
                .single();

            if (error) throw error;

            if (data?.settings && typeof data.settings === 'object' && 'ai_config' in data.settings) {
                // Merge com defaults para garantir que novos campos existam
                setSettings({ ...DEFAULT_SETTINGS, ...(data.settings as any).ai_config });
            } else {
                setSettings(DEFAULT_SETTINGS);
            }

        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) loadSettings();
    }, [tenantId]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Fetch current settings first to avoid overwriting other fields
            const { data: currentData, error: fetchError } = await supabase
                .from('tenants')
                .select('settings')
                .eq('id', tenantId)
                .single();

            if (fetchError) throw fetchError;

            // 2. Prepare new settings object
            const currentSettings = (currentData?.settings as object) || {};
            const newSettings = {
                ...currentSettings,
                ai_config: settings
            };

            // 3. Update
            const { error: updateError } = await supabase
                .from('tenants')
                .update({ settings: newSettings })
                .eq('id', tenantId);

            if (updateError) throw updateError;

            toast.success('Configurações salvas com sucesso');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !settings) {
        return <div className="text-center py-8 text-muted-foreground">Carregando configurações...</div>;
    }

    const isPlatform = mode === 'platform';

    return (
        <div className="space-y-6">
            <Card className={`border-white/10 backdrop-blur-md ${isPlatform ? 'bg-orange-500/5' : 'bg-white/5'}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className={`h-5 w-5 ${isPlatform ? 'text-orange-400' : 'text-blue-400'}`} />
                        {isPlatform ? 'Políticas Padrão (Fallback Geral)' : 'Políticas de Segurança e Uso'}
                    </CardTitle>
                    <CardDescription>
                        {isPlatform
                            ? 'Este é o fallback global. Tenants que não tiverem configuração própria usarão estas definições.'
                            : 'Defina restrições e comportamentos padrão para o uso de IA.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-white">Log de Auditoria Completo</Label>
                            <p className="text-sm text-muted-foreground">Registrar entrada e saída de todos os prompts (pode conter dados sensíveis).</p>
                        </div>
                        <Switch
                            checked={settings.enable_logging}
                            onCheckedChange={(checked) => setSettings({ ...settings, enable_logging: checked })}
                            disabled={readonly}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-white">Mascaramento de PII</Label>
                            <p className="text-sm text-muted-foreground">Detectar e ocultar dados pessoais antes de enviar ao provedor.</p>
                        </div>
                        <Switch
                            checked={settings.pii_masking}
                            onCheckedChange={(checked) => setSettings({ ...settings, pii_masking: checked })}
                            disabled={readonly}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="max_tokens">Limite de Tokens por Requisição</Label>
                        <Input
                            id="max_tokens"
                            type="number"
                            value={settings.max_tokens_per_request}
                            onChange={(e) => setSettings({ ...settings, max_tokens_per_request: parseInt(e.target.value) })}
                            className="bg-black/20 border-white/10 max-w-[200px]"
                            disabled={readonly}
                        />
                        <p className="text-sm text-muted-foreground">Hard limit para evitar custos excessivos.</p>
                    </div>

                    {!readonly && (
                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};
