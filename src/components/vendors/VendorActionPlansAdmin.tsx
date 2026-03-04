import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Search, ExternalLink, FileText, CheckCircle, Clock, CheckSquare, Settings2, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const VendorActionPlansAdmin = () => {
    const { user } = useAuth();
    const [actionPlans, setActionPlans] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<Record<string, unknown> | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const [updateFormData, setUpdateFormData] = useState({
        status: '',
        notes: '',
    });

    useEffect(() => {
        fetchActionPlans();
    }, [user?.tenantId]);

    const fetchActionPlans = async () => {
        try {
            setLoading(true);
            if (!user?.tenantId) return;

            const { data, error } = await supabase
                .from('vendor_risk_action_plans')
                .select(`
                    *,
                    vendor_registry (
                        name
                    )
                `)
                .eq('tenant_id', user.tenantId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setActionPlans((data as Record<string, unknown>[]) || []);
        } catch (error) {
            console.error('Erro ao buscar planos de ação:', error);
            toast.error('Erro ao carregar planos de ação');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClick = (plan: Record<string, unknown>) => {
        setSelectedPlan(plan);
        setUpdateFormData({
            status: (plan.status as string) || '',
            notes: (plan.notes as string) || '',
        });
        setIsUpdateModalOpen(true);
    };

    const submitUpdate = async () => {
        try {
            if (!selectedPlan) return;

            const { error } = await supabase
                .from('vendor_risk_action_plans')
                .update({
                    status: updateFormData.status,
                    notes: updateFormData.notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedPlan.id);

            if (error) throw error;

            toast.success('Plano de ação validado com sucesso');
            setIsUpdateModalOpen(false);
            fetchActionPlans();
        } catch (error) {
            console.error('Erro ao atualizar plano:', error);
            toast.error('Erro ao atualizar plano de ação');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Concluído</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-800"><Activity className="w-3 h-3 mr-1" /> Em Progresso</Badge>;
            case 'planned': return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" /> Planejado</Badge>;
            case 'overdue': return <Badge className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" /> Em Atraso</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredPlans = actionPlans.filter(plan => {
        const title = (plan.title as string) || '';
        const vendorName = ((plan.vendor_registry as any)?.name as string) || '';
        const desc = (plan.description as string) || '';

        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-primary" />
                                Validação de Planos de Ação
                            </CardTitle>
                            <CardDescription>
                                Analise e valide as ações de mitigação propostas e executadas pelos fornecedores
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 min-w-4 min-h-4 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Buscar planos..."
                                className="pl-9 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p className="text-sm text-muted-foreground">Carregando planos de ação...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-gray-50/50">
                            <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Nenhum plano de ação</h3>
                            <p className="text-sm text-gray-500 max-w-sm mt-2">
                                Nenhum plano de ação de fornecedor encontrado com os filtros atuais.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPlans.map(plan => (
                                <Card key={plan.id as string} className="overflow-hidden hover:shadow-md transition-all duration-200">
                                    <div className="h-1 w-full bg-primary/20">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${(plan.progress_percentage as number) || 0}%` }}
                                        />
                                    </div>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start mb-2">
                                            {getStatusBadge(plan.status as string)}
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {plan.priority === 'urgent' ? 'Urgente' : plan.priority === 'high' ? 'Alta' : plan.priority === 'medium' ? 'Média' : 'Baixa'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base font-semibold line-clamp-2" title={plan.title as string}>
                                            {plan.title as React.ReactNode}
                                        </CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                                            <Building2 className="w-4 h-4 mr-1.5" />
                                            <span className="truncate">{((plan.vendor_registry as any)?.name as string) || 'Fornecedor Desconhecido'}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 h-15">
                                            {plan.description as React.ReactNode}
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" /> Prazo
                                                </span>
                                                <span className="font-medium">
                                                    {plan.due_date ? format(new Date(plan.due_date as string), "dd/MM/yyyy", { locale: ptBR }) : 'Não definido'}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs">
                                                    <span>Progresso Reportado</span>
                                                    <span className="font-medium">{(plan.progress_percentage as number) || 0}%</span>
                                                </div>
                                                <Progress value={(plan.progress_percentage as number) || 0} className="h-1.5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 border-t bg-gray-50/50 p-4 flex justify-between">
                                        <div className="text-xs text-muted-foreground flex items-center max-w-[50%]">
                                            {plan.verification_evidence && (
                                                <span className="flex items-center text-blue-600 truncate" title="Evidência anexada">
                                                    <FileText className="w-3 h-3 mr-1" /> Com evidência
                                                </span>
                                            )}
                                        </div>
                                        <Button size="sm" onClick={() => handleUpdateClick(plan)}>
                                            <Settings2 className="w-4 h-4 mr-2" />
                                            Validar Ação
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Validar Plano do Fornecedor</DialogTitle>
                        <DialogDescription>
                            Revise o progresso e as evidências submetidas e atualize a situação do plano de ação.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlan && (
                        <div className="space-y-5 my-4">
                            <div className="p-4 bg-muted/30 rounded-lg border space-y-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">{selectedPlan.title as React.ReactNode}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{selectedPlan.description as React.ReactNode}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 text-sm border-t">
                                    <span className="font-medium text-gray-700">Progresso do Fornecedor:</span>
                                    <Badge variant="outline">{(selectedPlan.progress_percentage as number) || 0}% concluído</Badge>
                                </div>
                            </div>

                            {selectedPlan.verification_evidence && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Link de Evidência Submetida</Label>
                                    <div className="flex border rounded-md p-3 items-center bg-blue-50/50 border-blue-100">
                                        <ExternalLink className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                                        <a href={selectedPlan.verification_evidence as string} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate w-full">
                                            {selectedPlan.verification_evidence as React.ReactNode}
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Decisão / Novo Status</Label>
                                    <Select
                                        value={updateFormData.status}
                                        onValueChange={(val) => setUpdateFormData({ ...updateFormData, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a situação atual" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Planejado (Retornar ao Planejamento)</SelectItem>
                                            <SelectItem value="in_progress">Em Progresso (Aprovado Parcialmente)</SelectItem>
                                            <SelectItem value="completed">Concluído e Aprovado</SelectItem>
                                            <SelectItem value="on_hold">Em Espera / Pausado</SelectItem>
                                            <SelectItem value="cancelled">Cancelado / Rejeitado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Anotações do Administrador</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Adicione feedback, justificativa de rejeição ou observações internas..."
                                        value={updateFormData.notes}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, notes: e.target.value })}
                                        className="h-24 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Este comentário ficará visível para o fornecedor.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitUpdate}>Salvar Validação</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VendorActionPlansAdmin;
