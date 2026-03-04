import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Activity, Calendar, ExternalLink, FileText, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VendorRiskActionPlan } from '@/hooks/useVendorRiskManagement';

export const VendorActionPlans = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [actionPlans, setActionPlans] = useState<VendorRiskActionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPlan, setSelectedPlan] = useState<VendorRiskActionPlan | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({
        progress_percentage: 0,
        status: 'planned' as VendorRiskActionPlan['status'],
        verification_evidence: '',
        notes: '',
    });

    useEffect(() => {
        fetchActionPlans();
    }, [user]);

    const fetchActionPlans = async () => {
        if (!user) return;
        try {
            setIsLoading(true);

            const { data: vendorUser, error: vendorError } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user.id)
                .single();

            if (vendorError || !vendorUser) {
                throw new Error("Perfil de fornecedor não encontrado.");
            }

            const { data: plans, error: plansError } = await supabase
                .from('vendor_risk_action_plans')
                .select(`
          *
        `)
                .eq('vendor_id', vendorUser.vendor_id)
                .order('created_at', { ascending: false });

            if (plansError) throw plansError;

            setActionPlans(plans as VendorRiskActionPlan[]);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao carregar planos de ação",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateClick = (plan: VendorRiskActionPlan) => {
        setSelectedPlan(plan);
        setUpdateFormData({
            progress_percentage: plan.progress_percentage || 0,
            status: plan.status,
            verification_evidence: plan.verification_evidence || '',
            notes: plan.notes || '',
        });
        setIsUpdateModalOpen(true);
    };

    const submitUpdate = async () => {
        if (!selectedPlan) return;
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('vendor_risk_action_plans')
                .update({
                    progress_percentage: updateFormData.progress_percentage,
                    status: updateFormData.status,
                    verification_evidence: updateFormData.verification_evidence,
                    notes: updateFormData.notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedPlan.id);

            if (error) throw error;

            toast({
                title: "Plano atualizado",
                description: "Suas alterações foram salvas com sucesso."
            });

            setIsUpdateModalOpen(false);
            fetchActionPlans();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-emerald-100 text-emerald-800">Concluído</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
            case 'overdue': return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
            default: return <Badge variant="outline">Planejado</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge className="bg-red-500 hover:bg-red-600 border-red-500">Urgente</Badge>;
            case 'high': return <Badge variant="destructive">Alto</Badge>;
            case 'medium': return <Badge className="bg-amber-500 hover:bg-amber-600">Médio</Badge>;
            default: return <Badge variant="secondary">Baixo</Badge>;
        }
    };

    if (isLoading && actionPlans.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Planos de Ação
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-base">
                        Acompanhe, gerencie e responda aos planos de ação sugeridos para mitigar riscos e garantir a conformidade da sua empresa.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="h-48 w-48 text-primary transform rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actionPlans.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-gray-50 border border-dashed rounded-xl">
                        <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum plano de ação</h3>
                        <p className="text-sm">Não há planos de ação designados à sua empresa no momento.</p>
                    </div>
                ) : (
                    actionPlans.map(plan => (
                        <Card key={plan.id} className="flex flex-col hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 overflow-hidden group">
                            <CardHeader className="pb-3 border-b border-gray-100 mb-3 bg-gradient-to-r from-gray-50/80 to-white">
                                <div className="flex justify-between items-start mb-2">
                                    {getPriorityBadge(plan.priority)}
                                    {getStatusBadge(plan.status)}
                                </div>
                                <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{plan.description}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Prazo: {plan.due_date ? new Date(plan.due_date).toLocaleDateString('pt-BR') : 'Não definido'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Tipo: <span className="capitalize ml-1">{plan.action_type || 'Geral'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">Progresso</span>
                                            <span className="font-medium">{plan.progress_percentage || 0}%</span>
                                        </div>
                                        <Progress value={plan.progress_percentage || 0} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t border-gray-100 bg-gray-50/80 mt-auto items-center justify-between p-4">
                                <Button
                                    variant={plan.status === 'completed' ? 'outline' : 'default'}
                                    className={`w-full font-medium transition-colors ${plan.status === 'completed' ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'}`}
                                    onClick={() => handleUpdateClick(plan)}
                                >
                                    {plan.status === 'completed' ? (
                                        <><CheckCircle className="h-4 w-4 mr-2" /> Visualizar / Editar Envio</>
                                    ) : (
                                        <><FileText className="h-4 w-4 mr-2" /> Responder / Enviar Plano</>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Enviar Plano de Ação</DialogTitle>
                        <DialogDescription>
                            Lance o progresso, atualize o status para "Concluído" quando terminar, e forneça evidências para o contratante validar.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlan && (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted p-3 rounded-md mb-4 text-sm text-gray-700">
                                <span className="font-semibold block mb-1">Ação:</span>
                                {selectedPlan.title}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status Atual</Label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={updateFormData.status}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value as any })}
                                    >
                                        <option value="planned">Planejado</option>
                                        <option value="in_progress">Em Andamento</option>
                                        <option value="completed">Concluído</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Progresso (%)</Label>
                                    <Input
                                        type="number"
                                        min="0" max="100"
                                        value={updateFormData.progress_percentage}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, progress_percentage: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>Link de Evidência / Anexo URL</Label>
                                <Input
                                    placeholder="https://sua-empresa.com/evidencia.pdf"
                                    value={updateFormData.verification_evidence}
                                    onChange={(e) => setUpdateFormData({ ...updateFormData, verification_evidence: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Forneça um link para o documento ou imagem que comprove a ação.</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>Observações / Considerações</Label>
                                <Textarea
                                    placeholder="Destaque as medidas tomadas, sugestões de prazo ou justificativas..."
                                    value={updateFormData.notes}
                                    onChange={(e) => setUpdateFormData({ ...updateFormData, notes: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-6 flex gap-2">
                        <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={submitUpdate}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? 'Salvando...' : updateFormData.status === 'completed' ? 'Enviar para Validação' : 'Salvar Progresso'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VendorActionPlans;
