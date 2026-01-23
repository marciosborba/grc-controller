import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ShieldCheck,
    Bot,
    Play,
    BarChart3,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    ChevronRight,
    Search,
    Trash2
} from 'lucide-react';
import { policyAuditorService } from '@/services/policyAuditorService';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { ControlMappingEditor } from './ControlMappingEditor';

export default function PolicyAuditorDashboard() {
    const tenantId = useCurrentTenantId();
    const { user } = useAuth(); // Assuming we might need API key from somewhere, or ENV

    // States
    const [policies, setPolicies] = useState<any[]>([]);
    const [dbFrameworks, setDbFrameworks] = useState<any[]>([]);
    const [audits, setAudits] = useState<any[]>([]);
    const [selectedAudit, setSelectedAudit] = useState<any>(null);
    const [auditMatches, setAuditMatches] = useState<any[]>([]);
    const [totalRequirements, setTotalRequirements] = useState<number>(0);

    // UI States
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
    const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>(''); // Now storing ID
    const [editingMatch, setEditingMatch] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        if (tenantId) {
            loadData();
        }
    }, [tenantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load policies first to ensure dropdown populates
            const policiesData = await policyAuditorService.getActivePolicies(tenantId!);
            setPolicies(policiesData);

            // Load other data in parallel
            const [fetchedAudits, frameworks] = await Promise.all([
                policyAuditorService.getAudits(tenantId!),
                policyAuditorService.getFrameworks()
            ]);

            setAudits(fetchedAudits);
            setDbFrameworks(frameworks);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados do Auditor');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAudit = async () => {
        if (!selectedPolicyId) {
            toast.error('Selecione uma política');
            return;
        }

        /* Framework selection is now optional. If none selected, run against all available. */
        const targetFrameworks = selectedFrameworkId
            ? dbFrameworks.filter(f => f.id === selectedFrameworkId)
            : dbFrameworks;

        if (targetFrameworks.length === 0) {
            toast.error('Nenhum framework disponível para análise.');
            return;
        }

        setAnalyzing(true);
        try {
            // Fetch effective AI Provider
            const { aiConfigService } = await import('@/services/aiConfigService');
            const provider = await aiConfigService.getEffectiveProvider(tenantId!);

            if (!provider) {
                toast.error('Nenhum provedor de IA configurado. Vá em Configurações > IA para configurar.');
                setAnalyzing(false);
                return;
            }

            const policy = policies.find(p => p.id === selectedPolicyId);

            // Loop through frameworks
            let completed = 0;
            toast.info(`Iniciando análise de ${targetFrameworks.length} framework(s)...`);

            for (const framework of targetFrameworks) {
                try {
                    toast.loading(`Analisando contra ${framework.name} (${completed + 1}/${targetFrameworks.length})...`, { id: 'audit-progress' });

                    await policyAuditorService.startAudit(
                        policy,
                        framework.id,
                        framework.name,
                        provider
                    );
                    completed++;
                } catch (err) {
                    console.error(`Erro ao auditar ${framework.name}:`, err);
                    toast.error(`Falha ao auditar ${framework.name}`, { id: 'audit-progress' });
                }
            }

            toast.dismiss('audit-progress');
            toast.success(`Auditoria concluída! ${completed}/${targetFrameworks.length} frameworks processados.`);
            await loadData(); // Refresh list
        } catch (error: any) {
            console.error('Falha audit:', error);
            toast.error(`Falha geral na auditoria: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleViewAudit = async (auditId: string) => {
        setLoading(true);
        try {
            const { audit, matches, totalRequirements } = await policyAuditorService.getAuditDetails(auditId);
            setSelectedAudit(audit);
            setAuditMatches(matches);
            setTotalRequirements(totalRequirements);
        } catch (error) {
            toast.error('Erro ao carregar detalhes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAudit = async (e: React.MouseEvent, auditId: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir esta auditoria?')) return;

        setDeletingId(auditId);
        try {
            await policyAuditorService.deleteAudit(auditId);
            toast.success('Auditoria excluída com sucesso');
            setAudits(audits.filter(a => a.id !== auditId));
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir auditoria');
        } finally {
            setDeletingId(null);
        }
    };

    const handleMatchUpdate = () => {
        if (selectedAudit) {
            handleViewAudit(selectedAudit.id); // Refresh details
        }
    };

    // Render Logic
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant': return 'bg-green-500';
            case 'partial': return 'bg-yellow-500';
            case 'non_compliant': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    // Calculate metrics for selected audit
    const metrics = selectedAudit ? {
        compliance: Math.round(selectedAudit.adequacy_percentage || 0),
        totalControls: auditMatches.length,
        compliantCount: auditMatches.filter(m => m.status === 'compliant').length,
        partialCount: auditMatches.filter(m => m.status === 'partial').length,
        nonCompliantCount: auditMatches.filter(m => m.status === 'non_compliant').length,
        missingCount: Math.max(0, totalRequirements - auditMatches.length)
    } : null;

    if (loading && !selectedAudit) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Actions */}
            {!selectedAudit ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* New Audit Card */}
                    <Card className="md:col-span-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" />
                                Nova Auditoria IA
                            </CardTitle>
                            <CardDescription>
                                Analise suas políticas automaticamente contra frameworks de mercado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Política Ativa</label>
                                <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma política..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {policies.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Framework de Referência</label>
                                {dbFrameworks.length === 0 ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="text-xs text-muted-foreground text-yellow-600 dark:text-yellow-400">
                                            Biblioteca de frameworks vazia.
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                const toastId = toast.loading('Inicializando frameworks...');
                                                try {
                                                    await policyAuditorService.seedFrameworks(tenantId!);
                                                    await loadData();
                                                    toast.success('Biblioteca atualizada!', { id: toastId });
                                                } catch (e) {
                                                    console.error(e);
                                                    toast.error('Erro ao inicializar', { id: toastId });
                                                }
                                            }}
                                        >
                                            <ShieldCheck className="mr-2 h-3 w-3" /> Inicializar Biblioteca
                                        </Button>
                                    </div>
                                ) : (
                                    <Select value={selectedFrameworkId} onValueChange={setSelectedFrameworkId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos os Frameworks (Padrão)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dbFrameworks.map(fw => (
                                                <SelectItem key={fw.id} value={fw.id}>{fw.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleStartAudit}
                                disabled={analyzing || !selectedPolicyId || (dbFrameworks.length === 0)}
                            >
                                {analyzing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando...</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4" /> Iniciar Auditoria</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent Audits List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Auditorias Recentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {audits.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhuma auditoria realizada ainda.
                                    </div>
                                ) : (
                                    audits.map(audit => (
                                        <div
                                            key={audit.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                            onClick={() => handleViewAudit(audit.id)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{audit.policies?.title || 'Política Removida'}</span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-[10px]">{audit.framework_name}</Badge>
                                                    <span>•</span>
                                                    <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-medium">Adequação</span>
                                                    {audit.status === 'failed' ? (
                                                        <Badge variant="destructive">FALHA</Badge>
                                                    ) : (
                                                        <Badge variant={audit.adequacy_percentage > 80 ? 'secondary' : 'destructive'}>
                                                            {Math.round(audit.adequacy_percentage)}%
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    disabled={deletingId === audit.id}
                                                    onClick={(e) => handleDeleteAudit(e, audit.id)}
                                                >
                                                    {deletingId === audit.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Detail View */
                <div className="space-y-6">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => setSelectedAudit(null)}>
                        ← Voltar para Dashboard
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{selectedAudit.policies?.title}</CardTitle>
                                        <CardDescription>Auditoria contra {selectedAudit.framework_name}</CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{metrics?.compliance}%</div>
                                        <div className="text-xs text-muted-foreground">Adequação Geral</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics?.compliantCount}</div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Conformes
                                        </div>
                                    </div>
                                    <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-center">
                                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics?.partialCount}</div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Parciais
                                        </div>
                                    </div>
                                    <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-center">
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics?.nonCompliantCount}</div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Não Conformes
                                        </div>
                                    </div>
                                    <div className="bg-gray-500/10 p-4 rounded-lg border border-gray-500/20 text-center">
                                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{metrics?.missingCount}</div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Não Detectados
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5" />
                                            Controles Mapeados
                                        </h3>
                                        <div className="flex gap-2">
                                            {/* Filters could go here */}
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        {auditMatches.map(match => (
                                            <div
                                                key={match.id}
                                                className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {/* Policy Section */}
                                                            <div className="flex items-center gap-1" title="Seção da Política">
                                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Política:</span>
                                                                <Badge variant="outline" className="font-mono">{match.control_code}</Badge>
                                                            </div>

                                                            {/* Framework Reference */}
                                                            {match.framework_requirement_code && (
                                                                <div className="flex items-center gap-1" title="Controle do Framework">
                                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Ref:</span>
                                                                    <Badge variant="secondary" className="font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 hover:bg-blue-200">
                                                                        {match.framework_requirement_code}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            <div className={`h-2 w-2 rounded-full ${getStatusColor(match.status)} ml-auto`} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-foreground">
                                                                {match.framework_title || match.control_description}
                                                            </p>
                                                            <div className="bg-muted/50 p-2 rounded border border-muted mt-2">
                                                                <p className="text-xs font-semibold text-muted-foreground mb-1">Evidência na Política:</p>
                                                                <p className="text-xs italic text-foreground">"{match.detected_evidence}"</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold">{match.adequacy_score}%</div>
                                                            <div className="text-[10px] text-muted-foreground">Adequação</div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingMatch(match)}
                                                        >
                                                            Editar / Avaliar
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                                                    <div className="flex items-center gap-1">
                                                        <BarChart3 className="h-3 w-3" />
                                                        Maturidade: <span className={`font-medium ${!match.maturity_level || match.maturity_level === 'Not Assessed' ? 'text-yellow-500' : 'text-foreground'}`}>
                                                            {match.maturity_level && match.maturity_level !== 'Not Assessed' ? match.maturity_level : 'Definir (Manual)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-base">Distribuição de Maturidade</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {['Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing'].map(level => {
                                    const count = auditMatches.filter(m => m.maturity_level === level).length;
                                    const percentage = metrics ? Math.round((count / metrics.totalControls) * 100) : 0;

                                    return (
                                        <div key={level} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>{level}</span>
                                                <span className="font-medium">{count} ({percentage}%)</span>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <ControlMappingEditor
                match={editingMatch}
                isOpen={!!editingMatch}
                onClose={() => setEditingMatch(null)}
                onSave={handleMatchUpdate}
            />
        </div>
    );
}
