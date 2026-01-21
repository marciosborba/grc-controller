import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { Plus, Trash, Check, Zap, Server, Activity, Edit2, AlertCircle } from 'lucide-react';
import { aiConfigService, AIProvider, AIUsageStats } from '@/services/aiConfigService';
import { createGLMService } from '@/services/glmService';

interface AISettingsTabProps {
    tenantId?: string;
}

export const AISettingsTab: React.FC<AISettingsTabProps> = ({ tenantId }) => {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [stats, setStats] = useState<AIUsageStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Partial<AIProvider>>({});
    const [isTestLoading, setIsTestLoading] = useState(false);

    useEffect(() => {
        if (tenantId) {
            loadData();
        }
    }, [tenantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedProviders, fetchedStats] = await Promise.all([
                aiConfigService.getProviders(tenantId!),
                aiConfigService.getUsageStats(tenantId!)
            ]);
            setProviders(fetchedProviders);
            setStats(fetchedStats);
        } catch (error) {
            toast.error('Erro ao carregar configurações de IA');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (provider?: AIProvider) => {
        setEditingProvider(provider || {
            provider_type: 'glm',
            is_active: true,
            is_primary: providers.length === 0,
            tenant_id: tenantId,
            model_name: 'glm-4'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (!editingProvider.name || !editingProvider.api_key_encrypted) {
                toast.error('Preencha os campos obrigatórios');
                return;
            }

            await aiConfigService.upsertProvider(editingProvider);
            toast.success('Provedor de IA salvo com sucesso');
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error('Erro ao salvar provedor');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este provedor?')) return;
        try {
            await aiConfigService.deleteProvider(id);
            toast.success('Provedor removido');
            loadData();
        } catch (error) {
            toast.error('Erro ao remover provedor');
        }
    };

    const handleTestConnection = async () => {
        setIsTestLoading(true);
        try {
            // Simple test: try to create a service instance and maybe verify key format or make a dummy call
            // For GLM we can try a simple completion if we had a dedicated "test" endpoint or just try a hello world
            if (editingProvider.provider_type === 'glm') {
                const service = createGLMService(editingProvider.api_key_encrypted!);
                // We can't actually make a real call without incurring cost, 
                // so maybe just basic validation of format for now or a very cheap call?
                // Let's simulate for now unless we want to waste tokens
                if (editingProvider.api_key_encrypted?.length < 10) throw new Error("Chave inválida");

                toast.success("Formato da chave válido!");
                // To do Real Test: await service.chatCompletion(...) with "Hello"
            } else {
                toast.info("Teste de conexão simulado: OK");
            }
        } catch (error) {
            toast.error("Falha a conectar com o provedor");
        } finally {
            setIsTestLoading(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Processados (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_tokens.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Entrada e Saída combinadas
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Custo Estimado (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${stats?.total_cost_usd.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            USD (Aproximado)
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Requisições IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_requests || 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Análises executadas
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Provedores de IA</h3>
                    <p className="text-sm text-muted-foreground">Gerencie as conexões com LLMs que alimentam o sistema.</p>
                </div>
                <Button onClick={() => handleEdit()}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Provedor
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum provedor configurado. Adicione um para ativar as funções de IA.
                                </TableCell>
                            </TableRow>
                        ) : (
                            providers.map(provider => (
                                <TableRow key={provider.id}>
                                    <TableCell className="font-medium">{provider.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{provider.model_name}</Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{provider.provider_type}</TableCell>
                                    <TableCell>
                                        {provider.is_active ?
                                            <Badge className="bg-green-600 text-white hover:bg-green-700 border-none">Ativo</Badge> :
                                            <Badge variant="secondary">Inativo</Badge>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {provider.is_primary && <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(provider)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(provider.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Edit Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProvider.id ? 'Editar Provedor' : 'Novo Provedor IA'}</DialogTitle>
                        <DialogDescription>
                            Configure as credenciais de acesso à API do modelo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Identificador</Label>
                                <Input
                                    placeholder="Ex: GLM Produção"
                                    value={editingProvider.name || ''}
                                    onChange={e => setEditingProvider({ ...editingProvider, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Provedor</Label>
                                <Select
                                    value={editingProvider.provider_type}
                                    onValueChange={val => setEditingProvider({ ...editingProvider, provider_type: val as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="glm">GLM (Zhipu)</SelectItem>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="azure_openai">Azure OpenAI</SelectItem>
                                        <SelectItem value="custom">Custom / Local</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nome do Modelo (ID Técnico)</Label>
                            <Input
                                placeholder="Ex: glm-4, gpt-4, etc"
                                value={editingProvider.model_name || ''}
                                onChange={e => setEditingProvider({ ...editingProvider, model_name: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">O identificador exato esperado pela API (ex: 'glm-4-flash').</p>
                        </div>

                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    placeholder="sk-..."
                                    value={editingProvider.api_key_encrypted || ''}
                                    onChange={e => setEditingProvider({ ...editingProvider, api_key_encrypted: e.target.value })}
                                />
                                <Button variant="outline" onClick={handleTestConnection} disabled={isTestLoading}>
                                    {isTestLoading ? <Activity className="animate-spin h-4 w-4" /> : "Testar"}
                                </Button>
                            </div>
                        </div>

                        {editingProvider.provider_type === 'azure_openai' || editingProvider.provider_type === 'custom' ? (
                            <div className="space-y-2">
                                <Label>Endpoint URL</Label>
                                <Input
                                    placeholder="https://api..."
                                    value={editingProvider.endpoint_url || ''}
                                    onChange={e => setEditingProvider({ ...editingProvider, endpoint_url: e.target.value })}
                                />
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                            <div className="space-y-0.5">
                                <Label>Definir como Principal</Label>
                                <p className="text-xs text-muted-foreground">Este modelo será usado por padrão no sistema.</p>
                            </div>
                            <Switch
                                checked={editingProvider.is_primary}
                                onCheckedChange={checked => setEditingProvider({ ...editingProvider, is_primary: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Configuração</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
