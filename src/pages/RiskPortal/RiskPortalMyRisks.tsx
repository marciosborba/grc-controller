import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, ShieldAlert, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RESP_LABELS: Record<string, string> = {
    pending: '⏳ Pendente', acknowledged: '👁️ Ciência Tomada',
    approved: '✅ Aprovado', rejected: '❌ Rejeitado',
};
const LEVEL_COLORS: Record<string, string> = {
    'Muito Alto': 'bg-red-500/10 text-red-700 border-red-500/20',
    'Alto': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Médio': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    'Baixo': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    critical: 'bg-red-500/10 text-red-700 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
};

export const RiskPortalMyRisks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [allRisks, setAllRisks] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => { fetchMyRisks(); }, [user]);

    const fetchMyRisks = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('risk_stakeholders')
                .select(`id, notification_type, response_status, risk_registration_id,
          risk_registrations!inner(id, risk_title, risk_description, risk_level, risk_category, status, created_at)`)
                .eq('email', user.email?.trim().toLowerCase() || '');
            if (error) throw error;
            setAllRisks((data || []).map((s: any) => ({
                stakeholder_id: s.id, notification_type: s.notification_type,
                response_status: s.response_status, ...s.risk_registrations,
            })));
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally { setIsLoading(false); }
    };

    const updateStatus = async (stakeholderId: string, newStatus: string) => {
        setUpdatingId(stakeholderId);
        try {
            const now = new Date().toISOString();
            const updatePayload: any = { response_status: newStatus };
            if (newStatus === 'acknowledged') updatePayload.acknowledged_at = now;
            if (newStatus === 'approved' || newStatus === 'rejected') updatePayload.approved_at = now;
            const { error } = await supabase.from('risk_stakeholders').update(updatePayload).eq('id', stakeholderId);
            if (error) throw error;
            setAllRisks(prev => prev.map(r => r.stakeholder_id === stakeholderId ? { ...r, response_status: newStatus } : r));
            toast({ title: 'Resposta registrada!', description: RESP_LABELS[newStatus] });
        } catch (err: any) {
            toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
        } finally { setUpdatingId(null); }
    };

    const filtered = allRisks.filter(r => {
        const matchSearch = !search || r.risk_title?.toLowerCase().includes(search.toLowerCase()) || r.risk_category?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || r.response_status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4" />
            <p className="text-muted-foreground animate-pulse">Carregando seus riscos...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-red-600" /> Meus Riscos
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">{allRisks.length} risco(s) associados ao seu e-mail</p>
            </div>

            <Card className="border border-border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por título ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-48"><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                <SelectItem value="pending">⏳ Pendente</SelectItem>
                                <SelectItem value="acknowledged">👁️ Ciência Tomada</SelectItem>
                                <SelectItem value="approved">✅ Aprovado</SelectItem>
                                <SelectItem value="rejected">❌ Rejeitado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {filtered.length === 0 ? (
                <Card className="border border-border shadow-sm">
                    <CardContent className="text-center py-16">
                        <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold text-foreground">Nenhum risco encontrado</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map((risk) => (
                        <Card key={risk.stakeholder_id} className="border border-border shadow-sm hover:shadow-md transition-shadow group">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <Badge variant="outline" className={LEVEL_COLORS[risk.risk_level] || 'bg-gray-500/10'}>{risk.risk_level || 'Não definido'}</Badge>
                                            <Badge variant="outline" className="text-xs">{risk.risk_category || 'Sem categoria'}</Badge>
                                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                                                {risk.notification_type === 'approval' ? '🔐 Aprovação' : '👁️ Ciência'}
                                            </Badge>
                                        </div>
                                        <h3 className="font-bold text-foreground text-base sm:text-lg truncate group-hover:text-red-600 transition-colors mb-1">{risk.risk_title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{risk.risk_description || 'Sem descrição'}</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                        {risk.response_status === 'pending' ? (
                                            <>
                                                {risk.notification_type !== 'approval' ? (
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updatingId === risk.stakeholder_id} onClick={() => updateStatus(risk.stakeholder_id, 'acknowledged')}>👁️ Tomar Ciência</Button>
                                                ) : (
                                                    <>
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updatingId === risk.stakeholder_id} onClick={() => updateStatus(risk.stakeholder_id, 'approved')}>✅ Aprovar</Button>
                                                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-600 hover:bg-red-600/10" disabled={updatingId === risk.stakeholder_id} onClick={() => updateStatus(risk.stakeholder_id, 'rejected')}>❌ Rejeitar</Button>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <Badge className="text-sm h-9 px-3" variant="outline">{RESP_LABELS[risk.response_status] || risk.response_status}</Badge>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/risk-portal/risk/${risk.id}`)}>Detalhes <ArrowRight className="ml-1 h-3 w-3" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiskPortalMyRisks;
