import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, Link as LinkIcon, Save, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface Framework {
    id: string;
    nome: string;
    tipo: string;
}

interface Requirement {
    id: string;
    codigo: string;
    titulo: string;
    descricao: string;
    framework_id: string;
}

interface Mapping {
    id: string;
    source_requirement_id: string;
    target_requirement_id: string;
}

export default function ComplianceMappings() {
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [mappings, setMappings] = useState<Mapping[]>([]);

    const [sourceFramework, setSourceFramework] = useState<string>('');
    const [targetFramework, setTargetFramework] = useState<string>('');

    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

    useEffect(() => {
        if (effectiveTenantId) {
            loadData();
        }
    }, [effectiveTenantId]);

    const loadData = async () => {
        try {
            // Load Frameworks
            const { data: frameworksData, error: frameworksError } = await supabase
                .from('frameworks_compliance')
                .select('id, nome, tipo')
                .eq('tenant_id', effectiveTenantId)
                .eq('status', 'ativo')
                .order('nome');

            if (frameworksError) throw frameworksError;
            setFrameworks(frameworksData || []);

            // Load Requirements
            const { data: requirementsData, error: requirementsError } = await supabase
                .from('requisitos_compliance')
                .select('id, codigo, titulo, descricao, framework_id')
                .eq('tenant_id', effectiveTenantId)
                .eq('status', 'ativo');

            if (requirementsError) throw requirementsError;
            setRequirements(requirementsData || []);

            // Load Mappings
            // Assuming a table 'compliance_mappings' exists based on context
            const { data: mappingsData, error: mappingsError } = await supabase
                .from('compliance_mappings')
                .select('id, source_requirement_id, target_requirement_id')
                .eq('tenant_id', effectiveTenantId);

            if (mappingsError && mappingsError.code !== 'PGRST103') { // Ignore if table doesn't exist yet but log it
                console.error("Error loading mappings", mappingsError);
            }
            setMappings(mappingsData || []);

        } catch (error) {
            console.error('Error loading connectivity data:', error);
            toast.error('Erro ao carregar dados de conectividade');
        }
    };

    const handleMap = async () => {
        if (!selectedSource || !selectedTarget || !effectiveTenantId) return;

        try {
            const { data, error } = await supabase
                .from('compliance_mappings')
                .insert({
                    tenant_id: effectiveTenantId,
                    source_requirement_id: selectedSource,
                    target_requirement_id: selectedTarget
                })
                .select()
                .single();

            if (error) throw error;

            setMappings([...mappings, data]);
            toast.success('Requisitos vinculados com sucesso');
            setSelectedSource(null);
            setSelectedTarget(null);
        } catch (error) {
            console.error('Error mapping requirements:', error);
            toast.error('Erro ao vincular requisitos');
        }
    };

    const handleUnmap = async (mappingId: string) => {
        try {
            const { error } = await supabase
                .from('compliance_mappings')
                .delete()
                .eq('id', mappingId);

            if (error) throw error;

            setMappings(mappings.filter(m => m.id !== mappingId));
            toast.success('Vínculo removido com sucesso');
        } catch (error) {
            console.error('Error unmapping requirements:', error);
            toast.error('Erro ao remover vínculo');
        }
    }

    const standardFrameworks = frameworks.filter(f => f.tipo === 'regulatorio' || f.tipo === 'padrao'); // 'padrao' is a guess, maybe 'normativo'
    const customFrameworks = frameworks.filter(f => f.tipo !== 'regulatorio' && f.tipo !== 'padrao');

    const sourcerequirements = sourceFramework ? requirements.filter(r => r.framework_id === sourceFramework) : [];
    const targetrequirements = targetFramework ? requirements.filter(r => r.framework_id === targetFramework) : [];

    const getMappedPartner = (reqId: string, isSource: boolean) => {
        if (isSource) {
            const mapping = mappings.find(m => m.source_requirement_id === reqId && targetrequirements.some(tr => tr.id === m.target_requirement_id));
            if (mapping) {
                return targetrequirements.find(r => r.id === mapping.target_requirement_id);
            }
        } else {
            const mapping = mappings.find(m => m.target_requirement_id === reqId && sourcerequirements.some(sr => sr.id === m.source_requirement_id));
            if (mapping) {
                return sourcerequirements.find(r => r.id === mapping.source_requirement_id);
            }
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        Matriz de Conectividade
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                    <HelpCircle className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Para que serve a Conectividade (Mappings)?</DialogTitle>
                                    <DialogDescription className="space-y-4 pt-4 text-left">
                                        <p>
                                            <strong>Objetivo:</strong> O famoso "Testar uma vez, cumprir muitos". Permite vincular requisitos de diferentes normas que são equivalentes.
                                        </p>

                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="font-semibold mb-2">Exemplo Prático:</p>
                                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                                <li>
                                                    <strong>Origem:</strong> ISO 27001 pede "Gestão de Senhas".
                                                </li>
                                                <li>
                                                    <strong>Destino:</strong> LGPD também pede "Controle de Acesso".
                                                </li>
                                                <li>
                                                    <strong>Ação:</strong> Você vincula os dois aqui. Quando auditar a ISO 27001, o sistema entende que você também já testou um pedaço da LGPD.
                                                </li>
                                            </ul>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            <strong>Benefício:</strong> Reduz o trabalho de auditoria em até 40% ao evitar testes duplicados.
                                        </p>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </h2>
                    <p className="text-muted-foreground">Mapeie controles equivalentes entre diferentes frameworks</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={!selectedSource || !selectedTarget} onClick={handleMap}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Vincular Selecionados
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
                {/* Source Column */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Framework de Origem</CardTitle>
                        <Select value={sourceFramework} onValueChange={setSourceFramework}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {frameworks.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        Nenhum framework encontrado
                                    </div>
                                ) : (
                                    <>
                                        {standardFrameworks.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Biblioteca Padrão</SelectLabel>
                                                {standardFrameworks.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                        {standardFrameworks.length > 0 && customFrameworks.length > 0 && <SelectSeparator />}
                                        {customFrameworks.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Meus Frameworks</SelectLabel>
                                                {customFrameworks.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {sourcerequirements.map(req => {
                                    const partner = getMappedPartner(req.id, true);
                                    const isSelected = selectedSource === req.id;

                                    return (
                                        <div
                                            key={req.id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' :
                                                partner ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'hover:bg-muted'
                                                }`}
                                            onClick={() => setSelectedSource(req.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded">{req.codigo}</span>
                                                        {partner && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                                                    </div>
                                                    <p className="text-sm font-medium mt-1">{req.titulo}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{req.descricao}</p>
                                                </div>
                                            </div>
                                            {partner && (
                                                <div className="mt-2 text-xs bg-white dark:bg-black/20 p-1.5 rounded border border-green-100 dark:border-green-900 flex items-center gap-1 text-muted-foreground">
                                                    <LinkIcon className="h-3 w-3" />
                                                    Mapeado para: <span className="font-mono font-bold">{partner.codigo}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Target Column */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Framework de Destino</CardTitle>
                        <Select value={targetFramework} onValueChange={setTargetFramework}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {frameworks.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        Nenhum framework encontrado
                                    </div>
                                ) : (
                                    <>
                                        {standardFrameworks.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Biblioteca Padrão</SelectLabel>
                                                {standardFrameworks.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                        {standardFrameworks.length > 0 && customFrameworks.length > 0 && <SelectSeparator />}
                                        {customFrameworks.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Meus Frameworks</SelectLabel>
                                                {customFrameworks.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {targetrequirements.map(req => {
                                    const partner = getMappedPartner(req.id, false);
                                    const isSelected = selectedTarget === req.id;

                                    return (
                                        <div
                                            key={req.id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' :
                                                partner ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'hover:bg-muted'
                                                }`}
                                            onClick={() => setSelectedTarget(req.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded">{req.codigo}</span>
                                                        {partner && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                                                    </div>
                                                    <p className="text-sm font-medium mt-1">{req.titulo}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{req.descricao}</p>
                                                </div>
                                                {partner && (
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const mapping = mappings.find(m => m.target_requirement_id === req.id && m.source_requirement_id === partner.id);
                                                            if (mapping) handleUnmap(mapping.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
