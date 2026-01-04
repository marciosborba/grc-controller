import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Shield, ArrowRight, ArrowLeft, Calendar, Target, BookOpen, Download, Search, PlusCircle, CheckSquare, Square, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface NewAssessmentWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function NewAssessmentWizard({ open, onOpenChange, onSuccess }: NewAssessmentWizardProps) {
    const [step, setStep] = useState(1);
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [loading, setLoading] = useState(false);
    const [frameworks, setFrameworks] = useState<any[]>([]);
    const [requirements, setRequirements] = useState<any[]>([]);
    const [showStandardLibrary, setShowStandardLibrary] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [reqSearchTerm, setReqSearchTerm] = useState('');

    // Form Data
    const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
    const [selectedRequirementIds, setSelectedRequirementIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        titulo: '',
        tipo_avaliacao: 'auto_avaliacao',
        metodologia: 'amostragem',
        data_planejada: format(new Date(), 'yyyy-MM-dd'),
        avaliador_responsavel: user?.id || '',
        amostra_testada: 1,
        populacao_total: 1
    });

    // Load Frameworks on Open
    useEffect(() => {
        console.log('NewAssessmentWizard useEffect triggered. Open:', open, 'Tenant:', effectiveTenantId);
        if (open && effectiveTenantId) {
            console.log('Loading frameworks...');
            loadFrameworks();
            setStep(1);
            resetForm();
            setShowStandardLibrary(false);
        }
    }, [open, effectiveTenantId]);

    // Load Requirements when Framework Changes
    useEffect(() => {
        if (selectedFrameworkId && !showStandardLibrary) {
            loadRequirements(selectedFrameworkId);
            setSelectedRequirementIds([]); // Reset selection when framework changes
        } else {
            setRequirements([]);
        }
    }, [selectedFrameworkId, showStandardLibrary]);

    const resetForm = () => {
        setSelectedFrameworkId('');
        setSelectedRequirementIds([]);
        setFormData({
            titulo: '',
            tipo_avaliacao: 'auto_avaliacao',
            metodologia: 'amostragem',
            data_planejada: format(new Date(), 'yyyy-MM-dd'),
            avaliador_responsavel: user?.id || '',
            amostra_testada: 1,
            populacao_total: 1
        });
    };

    const loadFrameworks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('frameworks_compliance')
            .select('id, nome, is_standard, tipo, versao')
            .eq('status', 'ativo')
            .or(`tenant_id.eq.${effectiveTenantId},is_standard.eq.true`)
            .order('nome');

        if (data) setFrameworks(data);
        setLoading(false);
    };

    const loadRequirements = async (frameworkId: string) => {
        const { data } = await supabase
            .from('requisitos_compliance')
            .select('id, codigo, titulo')
            .eq('framework_id', frameworkId)
            .eq('status', 'ativo')
            .order('codigo');

        if (data) setRequirements(data);
    };

    const handleClone = async (framework: any) => {
        if (!effectiveTenantId || !user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('clone_framework', {
                p_framework_id: framework.id,
                p_target_tenant_id: effectiveTenantId,
                p_user_id: user.id
            });

            if (error) throw error;

            toast.success('Framework clonado com sucesso!');
            await loadFrameworks();
            setShowStandardLibrary(false);
        } catch (error: any) {
            console.error('Erro ao clonar:', error);
            toast.error('Erro ao clonar framework: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handleBack = () => {
        if (step === 1 && showStandardLibrary) {
            setShowStandardLibrary(false);
        } else {
            setStep(s => Math.max(s - 1, 1));
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const batchId = `BATCH-${Date.now()}`;

            // Generate payloads for all selected requirements
            const payloads = selectedRequirementIds.map((reqId, index) => {
                const reqCode = requirements.find(r => r.id === reqId)?.codigo || '';
                // Append requirement code to title if multiples are selected, or keep base title?
                // Usually keeping base title for grouping is better, or individualized titles.
                // Let's keep the base title for now, it's a "Batch" title.

                return {
                    tenant_id: effectiveTenantId,
                    requisito_id: reqId,
                    codigo: `AV-${Date.now()}-${reqCode}-${index}`, // Unique code
                    titulo: formData.titulo, // Same title for all (project based)
                    tipo_avaliacao: formData.tipo_avaliacao,
                    metodologia: formData.metodologia,
                    data_planejada: formData.data_planejada,
                    avaliador_responsavel: formData.avaliador_responsavel,
                    amostra_testada: formData.amostra_testada,
                    populacao_total: formData.populacao_total,
                    status: 'planejada',
                    created_by: user?.id
                };
            });

            const { error } = await supabase
                .from('avaliacoes_conformidade')
                .insert(payloads);

            if (error) throw error;

            toast.success(`${selectedRequirementIds.length} avaliações criadas com sucesso!`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar avaliações');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const standardFrameworks = frameworks.filter(f => f.is_standard).filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    const customFrameworks = frameworks.filter(f => !f.is_standard).filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredRequirements = requirements.filter(r =>
        r.codigo.toLowerCase().includes(reqSearchTerm.toLowerCase()) ||
        r.titulo.toLowerCase().includes(reqSearchTerm.toLowerCase())
    );

    // Helpers
    const getSelectedFrameworkName = () => frameworks.find(f => f.id === selectedFrameworkId)?.nome || '';

    const toggleRequirement = (id: string) => {
        setSelectedRequirementIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAllRequirements = () => {
        if (selectedRequirementIds.length === filteredRequirements.length) {
            // Deselect all visible
            const visibleIds = filteredRequirements.map(r => r.id);
            setSelectedRequirementIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            // Select all visible
            const visibleIds = filteredRequirements.map(r => r.id);
            // Union current + visible
            setSelectedRequirementIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    // Check state of "Select All"
    const visibleIds = filteredRequirements.map(r => r.id);
    const isAllSelected = visibleIds.length > 0 && visibleIds.every(id => selectedRequirementIds.includes(id));
    const isSomeSelected = visibleIds.some(id => selectedRequirementIds.includes(id)) && !isAllSelected;


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                {/* Header */}
                <div className="bg-muted/10 p-6 border-b flex-shrink-0 flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl">Nova Avaliação de Conformidade</DialogTitle>
                        <DialogDescription className="mt-1">
                            {step === 1 ? 'Selecione o framework alvo' : step === 2 ? 'Defina o escopo e detalhes' : 'Revise e confirme'}
                        </DialogDescription>
                    </div>

                    {/* Compact Stepper */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2",
                                        step >= s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-transparent"
                                    )}>
                                        {s}
                                    </div>
                                </div>
                                {s < 3 && (
                                    <div className={cn(
                                        "w-12 h-0.5 mx-2 transition-colors duration-300",
                                        step > s ? "bg-primary" : "bg-muted"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900/20">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: FRAMEWORK SELECTION */}
                        {step === 1 && !showStandardLibrary && (
                            <motion.div
                                key="step1-custom"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Meus Frameworks
                                        </h3>
                                        <div className="relative w-64">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar..."
                                                className="pl-8 h-9 bg-background"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {customFrameworks.length === 0 && (
                                            <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                                                <p className="text-muted-foreground mb-4 font-medium">Você ainda não tem frameworks personalizados.</p>
                                                <Button onClick={() => setShowStandardLibrary(true)} variant="outline">
                                                    Buscar na Biblioteca Padrão
                                                </Button>
                                            </div>
                                        )}

                                        {customFrameworks.map(f => (
                                            <div
                                                key={f.id}
                                                onClick={() => {
                                                    setSelectedFrameworkId(f.id);
                                                    setFormData(prev => ({ ...prev, titulo: `Avaliação - ${f.nome}` }));
                                                }}
                                                className={cn(
                                                    "p-4 rounded-xl border bg-card cursor-pointer transition-all duration-200 group relative overflow-hidden",
                                                    selectedFrameworkId === f.id
                                                        ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
                                                        : "hover:border-primary/50 hover:shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-lg transition-colors",
                                                        selectedFrameworkId === f.id ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
                                                    )}>
                                                        <Shield className={cn(
                                                            "h-6 w-6 transition-colors",
                                                            selectedFrameworkId === f.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-base">{f.nome}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="secondary" className="text-[10px]">v{f.versao || '1.0'}</Badge>
                                                            <Badge variant="outline" className="text-[10px]">Personalizado</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedFrameworkId === f.id && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {customFrameworks.length > 0 && (
                                            <div
                                                className="md:col-span-2 mt-4 p-4 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground group"
                                                onClick={() => setShowStandardLibrary(true)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <PlusCircle className="h-5 w-5 group-hover:text-primary transition-colors" />
                                                    <span className="font-medium">Adicionar outro framework da Biblioteca Padrão</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1: STANDARD LIBRARY MODE */}
                        {step === 1 && showStandardLibrary && (
                            <motion.div
                                key="step1-library"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                                <BookOpen className="h-5 w-5" />
                                                Biblioteca Padrão
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Selecione um framework para clonar para sua biblioteca pessoal.
                                            </p>
                                        </div>
                                        <Input
                                            placeholder="Buscar na biblioteca..."
                                            className="w-64 bg-background"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {standardFrameworks.map(f => (
                                            <div
                                                key={f.id}
                                                className="p-4 rounded-lg border bg-card flex items-center justify-between hover:shadow-sm transition-shadow"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                                                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{f.nome}</p>
                                                        <Badge variant="secondary" className="text-[10px] mt-1">{f.tipo || 'Padrão'}</Badge>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => handleClone(f)} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Clonar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: SCOPE & DETAILS (MERGED) */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col space-y-4"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                                    {/* Left: Project Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b">
                                            <Target className="h-5 w-5 text-primary" />
                                            <h3 className="font-semibold">Configuração da Avaliação</h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label>Título do Projeto</Label>
                                                <Input
                                                    value={formData.titulo}
                                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                                    placeholder="Ex: Avaliação Anual de Segurança"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label>Tipo</Label>
                                                <Select
                                                    value={formData.tipo_avaliacao}
                                                    onValueChange={(val) => setFormData({ ...formData, tipo_avaliacao: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="auto_avaliacao">Auto-Avaliação</SelectItem>
                                                        <SelectItem value="auditoria_interna">Auditoria Interna</SelectItem>
                                                        <SelectItem value="auditoria_externa">Auditoria Externa</SelectItem>
                                                        <SelectItem value="revisao_continua">Revisão Contínua</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label>Metodologia</Label>
                                                <Select
                                                    value={formData.metodologia}
                                                    onValueChange={(val) => setFormData({ ...formData, metodologia: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="amostragem">Amostragem</SelectItem>
                                                        <SelectItem value="integral">Análise Integral</SelectItem>
                                                        <SelectItem value="entrevista">Entrevista</SelectItem>
                                                        <SelectItem value="observacao">Observação</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Data Planejada</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.data_planejada}
                                                        onChange={(e) => setFormData({ ...formData, data_planejada: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Responsável</Label>
                                                    <Input value={user?.email || ''} disabled className="bg-muted" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Amostra</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={formData.amostra_testada}
                                                        onChange={(e) => setFormData({ ...formData, amostra_testada: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>População</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={formData.populacao_total}
                                                        onChange={(e) => setFormData({ ...formData, populacao_total: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Requirements Scope */}
                                    <div className="flex flex-col h-full overflow-hidden border rounded-lg bg-card">
                                        <div className="p-3 border-b bg-muted/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="h-5 w-5 text-primary" />
                                                    <h3 className="font-semibold">Escopo (Requisitos)</h3>
                                                </div>
                                                <Badge variant={selectedRequirementIds.length > 0 ? "default" : "secondary"}>
                                                    {selectedRequirementIds.length} selecionados
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Filtrar requisitos..."
                                                        className="h-8 pl-8 text-xs"
                                                        value={reqSearchTerm}
                                                        onChange={e => setReqSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2 px-1">
                                                    <Checkbox
                                                        id="select-all"
                                                        checked={isAllSelected}
                                                        onCheckedChange={toggleAllRequirements}
                                                        ref={ref => {
                                                            if (ref) {
                                                                (ref as any).indeterminate = isSomeSelected;
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="select-all"
                                                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        Selecionar Todos ({filteredRequirements.length})
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-background">
                                            {filteredRequirements.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    Nenhum requisito encontrado.
                                                </div>
                                            )}
                                            {filteredRequirements.map(req => (
                                                <div
                                                    key={req.id}
                                                    className={cn(
                                                        "flex items-start space-x-3 p-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer border border-transparent",
                                                        selectedRequirementIds.includes(req.id) ? "bg-accent/30 border-accent" : ""
                                                    )}
                                                    onClick={() => toggleRequirement(req.id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedRequirementIds.includes(req.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="space-y-1 leading-none">
                                                        <p className="text-xs font-mono font-bold text-muted-foreground bg-muted inline-block px-1 rounded">
                                                            {req.codigo}
                                                        </p>
                                                        <p className="text-sm font-medium leading-snug">
                                                            {req.titulo}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: REVIEW */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
                                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Resumo da Criação em Lote</h3>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="col-span-2 p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-muted-foreground text-xs uppercase font-bold">Framework</p>
                                                <p className="font-medium text-lg">{getSelectedFrameworkName()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-muted-foreground text-xs uppercase font-bold">Avaliações a Criar</p>
                                                <Badge className="text-base px-3 py-1 bg-primary">{selectedRequirementIds.length}</Badge>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-muted-foreground mb-1">Título do Projeto</p>
                                            <p className="font-medium">{formData.titulo}</p>
                                        </div>

                                        <div>
                                            <p className="text-muted-foreground">Tipo</p>
                                            <Badge variant="outline">{formData.tipo_avaliacao}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Metodologia</p>
                                            <p className="font-medium capitalize">{formData.metodologia}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Data Planejada</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{format(new Date(formData.data_planejada), 'dd/MM/yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <Label className="mb-2 block">Amostra de Requisitos Selecionados:</Label>
                                        <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground max-h-32 overflow-y-auto font-mono">
                                            {selectedRequirementIds.slice(0, 10).map(id => {
                                                const r = requirements.find(req => req.id === id);
                                                return <div key={id} className="mb-1">• {r?.codigo} - {r?.titulo.substring(0, 50)}...</div>
                                            })}
                                            {selectedRequirementIds.length > 10 && <div className="italic">... e mais {selectedRequirementIds.length - 10} requisitos.</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                                    <Target className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p>
                                        Você está prestes a criar <strong>{selectedRequirementIds.length} avaliações individuais</strong>, uma para cada requisito selecionado.
                                        Todas terão o mesmo título base, datas e configurações definidas.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-background flex justify-between items-center flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        onClickCapture={(e) => {
                            if (step === 1 && !showStandardLibrary) {
                                e.stopPropagation();
                                onOpenChange(false);
                            }
                        }}
                        className="gap-2"
                    >
                        {step === 1 && !showStandardLibrary ? 'Cancelar' : <><ArrowLeft className="h-4 w-4" /> Voltar</>}
                    </Button>

                    {step < 3 ? (
                        !showStandardLibrary && (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !selectedFrameworkId) ||
                                    (step === 2 && (!formData.titulo || selectedRequirementIds.length === 0))
                                }
                                className="gap-2"
                            >
                                Próximo <ArrowRight className="h-4 w-4" />
                            </Button>
                        )
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="gap-2 min-w-[140px]">
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" /> Confirmar ({selectedRequirementIds.length})
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
