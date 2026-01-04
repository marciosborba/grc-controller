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
import { ArrowRightLeft, Link as LinkIcon, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface Framework {
    id: string;
    nome: string;
    is_standard?: boolean;
}

interface Requirement {
    id: string;
    codigo: string;
    titulo: string;
    descricao: string;
}

interface Mapping {
    id: string;
    source_requirement_id: string;
    target_requirement_id: string;
    type: string;
    confidence: number;
}

export default function ComplianceMappings() {
    const { user } = useAuth(); // Added useAuth hook
    const selectedTenantId = useCurrentTenantId();
    // Logic: If platform admin, use selector. If regular user, use profile tenant.
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [sourceFramework, setSourceFramework] = useState<string>('');
    const [targetFramework, setTargetFramework] = useState<string>('');

    const [sourcerequirements, setSourceRequirements] = useState<Requirement[]>([]);
    const [targetrequirements, setTargetRequirements] = useState<Requirement[]>([]);
    const [mappings, setMappings] = useState<Mapping[]>([]);

    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

    useEffect(() => {
        if (effectiveTenantId) {
            loadFrameworks();
        }
    }, [effectiveTenantId]);

    useEffect(() => {
        if (sourceFramework) loadRequirements(sourceFramework, setSourceRequirements);
    }, [sourceFramework]);

    useEffect(() => {
        if (targetFramework) loadRequirements(targetFramework, setTargetRequirements);
    }, [targetFramework]);

    useEffect(() => {
        if (sourceFramework && targetFramework && effectiveTenantId) loadMappings();
    }, [sourceFramework, targetFramework, effectiveTenantId]);

    const loadFrameworks = async () => {
        if (!effectiveTenantId) return;

        const { data, error } = await supabase
            .from('frameworks_compliance')
            .select('id, nome, is_standard')
            .eq('status', 'ativo')
            .or(`tenant_id.eq.${effectiveTenantId},is_standard.eq.true`)
            .order('nome');

        if (data) setFrameworks(data);
        if (error) {
            console.error('Error loading frameworks:', error);
            toast.error('Erro ao carregar frameworks: ' + error.message);
        }
    };

    const loadRequirements = async (frameworkId: string, setter: (reqs: Requirement[]) => void) => {
        const { data } = await supabase
            .from('requisitos_compliance')
            .select('id, codigo, titulo, descricao')
            .eq('framework_id', frameworkId)
            .order('codigo');

        if (data) setter(data);
    };

    const loadMappings = async () => {
        if (!effectiveTenantId) return;

        // This is a bit complex because we need to get mappings where source is in sourceFramework AND target is in targetFramework
        // OR source is in targetFramework AND target is in sourceFramework (bidirectional)
        // For simplicity, we assume strict Direction: Source -> Target selection.

        // First get IDs
        const { data, error } = await supabase
            .from('framework_mappings')
            .select('*')
            .eq('tenant_id', effectiveTenantId);

        if (data) setMappings(data);
    };

    const handleMap = async () => {
        if (!selectedSource || !selectedTarget) return;

        try {
            const { data, error } = await supabase
                .from('framework_mappings')
                .insert({
                    source_requirement_id: selectedSource,
                    target_requirement_id: selectedTarget,
                    tenant_id: effectiveTenantId,
                    type: 'equivalent'
                })
                .select()
                .single();

            if (error) throw error;

            setMappings([...mappings, data]);
            toast.success('Mapeamento criado com sucesso');
            setSelectedSource(null);
            setSelectedTarget(null);
        } catch (error) {
            console.error('Error mapping:', error);
            toast.error('Erro ao criar mapeamento (possível duplicidade)');
        }
    };

    const handleUnmap = async (mappingId: string) => {
        const { error } = await supabase
            .from('framework_mappings')
            .delete()
            .eq('id', mappingId);

        if (!error) {
            setMappings(mappings.filter(m => m.id !== mappingId));
            toast.success('Mapeamento removido');
        }
    };

    const isMapped = (reqId: string, isSource: boolean) => {
        return mappings.some(m => isSource ? m.source_requirement_id === reqId : m.target_requirement_id === reqId);
    };

    const getMappedPartner = (reqId: string, isSource: boolean) => {
        const mapping = mappings.find(m => isSource ? m.source_requirement_id === reqId : m.target_requirement_id === reqId);
        if (!mapping) return null;

        const partnerId = isSource ? mapping.target_requirement_id : mapping.source_requirement_id;
        const partnerList = isSource ? targetrequirements : sourcerequirements;
        return partnerList.find(r => r.id === partnerId);
    };

    const standardFrameworks = frameworks.filter(f => f.is_standard);
    const customFrameworks = frameworks.filter(f => !f.is_standard);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Matriz de Conectividade</h2>
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
