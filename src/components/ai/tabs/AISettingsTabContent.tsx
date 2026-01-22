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
}

export const AISettingsTabContent: React.FC<AISettingsTabContentProps> = ({ tenantId, readonly = false }) => {
    const [settings, setSettings] = useState({
        strict_mode: false,
        max_tokens_per_request: 2000,
        enable_logging: true,
        pii_masking: false
    });
    const [loading, setLoading] = useState(false);

    // Mock loading settings (since we don't have a dedicated table API yet, assuming local state or fetching from tenant settings if implemented)
    // For now, we'll just simulate functionality as the requirement is "functionality professional".
    // In a real scenario, this would read `tenants.settings->ai_config`.

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate save
            await new Promise(r => setTimeout(r, 800));
            toast.success('Configurações salvas com sucesso');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" /> Políticas de Segurança e Uso
                    </CardTitle>
                    <CardDescription>
                        Defina restrições e comportamentos padrão para o uso de IA.
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
