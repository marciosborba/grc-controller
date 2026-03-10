import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Sliders,
    Plus,
    X,
    Edit2,
    Check,
    Trash2,
    GripVertical
} from 'lucide-react';

interface CustomFieldDef {
    id: string;
    tenant_id: string;
    field_name: string;
    field_key: string;
    field_type: string;
    options: string[] | null;
    required: boolean;
    position: number;
    show_on_card: boolean;
    show_in_interior?: boolean;
    show_in_filters: boolean;
    target_module: string;
    editable: boolean;
    created_at: string;
}

const MODULE_LABELS: Record<string, string> = {
    // Fornecedores
    vendor_registration: 'Fornecedores (Modal: Novo / Editar Fornecedor)',
    vendor_assessment: 'Fornecedores (Modal: Nova Avaliação)',
    vendor_contract: 'Fornecedores (Modal: Novo Ponto de Análise / Contrato)',

    // Riscos & Incidentes
    risk_assessment: 'Riscos (Modal: Novo Risco / Wizard)',
    incident: 'Incidentes (Modal: Novo Incidente)',

    // Ativos & Vulnerabilidades
    asset: 'CMDB (Modal: Novo Ativo)',
    vulnerability: 'Vulnerabilidades (Modal: Nova Vulnerabilidade)',

    // Políticas & Conformidade
    policy: 'Políticas (Modal: Criar Política)',
    compliance: 'Compliance (Modal: Novo Teste de Conformidade)',

    // Assessments
    assessment: 'Assessments (Modal: Novo Assessment / Nova Avaliação)',

    // Controles & Planos de Ação
    control: 'Controles (Modal: Novo Controle)',
    action_plan: 'Planos de Ação (Modal: Novo Plano de Ação)',

    // Auditoria & Estratégia
    audit: 'Auditorias (Modal: Nova Auditoria)',
    audit_project: 'Auditorias (Modal: Novo Projeto)',
    strategic_planning: 'Estratégia (Modal: Novo Planejamento)',

    // Outros
    ethics: 'Canal de Denúncias (Modal: Nova Denúncia)',
    privacy: 'Privacidade LGPD (Modal: Novo Incidente de Privacidade)',
    privacy_ropa: 'Privacidade LGPD (Modal: Nova Atividade de Tratamento)',
    privacy_inventory: 'Privacidade LGPD (Modal: Novo Item do Inventário)',
    training: 'Treinamentos (Modal: Novo Treinamento)',
};

const FIELD_TYPE_LABELS: Record<string, string> = {
    text: 'Texto Curto',
    textarea: 'Texto Longo',
    number: 'Número',
    date: 'Data',
    boolean: 'Sim/Não',
    select: 'Lista (Única)',
    multiselect: 'Lista (Múltipla)',
    file: 'Anexo (Arquivo)',
};

interface Props {
    tenantId: string | null;
}

export const CustomFieldsConfigSection: React.FC<Props> = ({ tenantId }) => {
    const { toast } = useToast();
    const [fields, setFields] = useState<CustomFieldDef[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<CustomFieldDef>>({});
    const [newField, setNewField] = useState<{
        field_name: string;
        field_type: string;
        options: string;
        show_on_card: boolean;
        show_in_interior: boolean;
        show_in_filters: boolean;
        target_module: string[];
        required: boolean;
    }>({
        field_name: '',
        field_type: 'text',
        options: '',
        show_on_card: false,
        show_in_interior: true,
        show_in_filters: false,
        target_module: [],
        required: false,
    });

    const fetchFields = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('custom_field_definitions')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('target_module')
                .order('position', { ascending: true });
            if (error) throw error;
            setFields((data as any[]) || []);
        } catch (e: any) {
            console.error('Error fetching custom fields:', e);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => { fetchFields(); }, [fetchFields]);

    const handleAdd = async () => {
        if (!newField.field_name || !tenantId) return;
        if (newField.target_module.length === 0) {
            toast({ title: 'Atenção', description: 'Selecione ao menos um módulo alvo para o campo.', variant: 'destructive' });
            return;
        }
        const fieldKey = newField.field_name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '');
        try {
            const inserts = newField.target_module.map(mod => {
                const moduleFields = fields.filter(f => f.target_module === mod);
                return {
                    tenant_id: tenantId,
                    field_name: newField.field_name,
                    field_key: fieldKey,
                    field_type: newField.field_type,
                    options: newField.field_type === 'select' || newField.field_type === 'multiselect'
                        ? (newField.options ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : null)
                        : null,
                    position: moduleFields.length,
                    show_on_card: newField.show_on_card,
                    show_in_interior: newField.show_in_interior,
                    show_in_filters: newField.show_in_filters,
                    target_module: mod,
                    required: newField.required,
                };
            });
            const { error } = await supabase.from('custom_field_definitions').insert(inserts);
            if (error) throw error;
            toast({ title: 'Campo criado', description: `"${newField.field_name}" adicionado a ${newField.target_module.length} módulo(s).` });
            setNewField({ field_name: '', field_type: 'text', options: '', show_on_card: false, show_in_interior: true, show_in_filters: false, target_module: [], required: false });
            setShowAddForm(false);
            fetchFields();
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        }
    };

    const handleDelete = async (field: CustomFieldDef) => {
        if (!confirm(`Remover o campo "${field.field_name}"? Os valores salvos nos registros não serão excluídos, mas o campo deixará de aparecer nos formulários.`)) return;
        try {
            const { error } = await supabase.from('custom_field_definitions').delete().eq('id', field.id);
            if (error) throw error;
            toast({ title: 'Campo removido' });
            fetchFields();
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        }
    };

    const startEdit = (field: CustomFieldDef) => {
        setEditingId(field.id);
        setEditForm({
            field_name: field.field_name,
            field_type: field.field_type,
            options: field.options,
            show_on_card: field.show_on_card || false,
            show_in_interior: field.show_in_interior !== false,
            show_in_filters: field.show_in_filters || false,
            target_module: field.target_module,
            required: field.required,
        });
    };

    const saveEdit = async (fieldId: string) => {
        try {
            const updateData: any = {
                field_name: editForm.field_name,
                show_on_card: editForm.show_on_card,
                show_in_filters: editForm.show_in_filters,
                target_module: editForm.target_module,
                required: editForm.required,
            };
            // Only update field_type and options if type changed
            if (editForm.field_type) {
                updateData.field_type = editForm.field_type;
                if (editForm.field_type === 'select' && editForm.options) {
                    updateData.options = editForm.options;
                } else if (editForm.field_type !== 'select') {
                    updateData.options = null;
                }
            }
            const { error } = await supabase.from('custom_field_definitions').update(updateData).eq('id', fieldId);
            if (error) throw error;
            toast({ title: 'Campo atualizado' });
            setEditingId(null);
            fetchFields();
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        }
    };

    // Group fields by target_module
    const groupedFields = fields.reduce<Record<string, CustomFieldDef[]>>((acc, field) => {
        const mod = field.target_module || 'vendor_registration';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(field);
        return acc;
    }, {});

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            Informações Adicionais
                        </CardTitle>
                        <Button
                            size="sm"
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="h-8 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Novo Campo
                        </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Crie campos personalizados que aparecerão nos formulários dos módulos selecionados. Esses campos se tornam parte do cadastro padrão para todos os usuários da organização.
                    </p>
                </CardHeader>

                {/* Add Form */}
                {showAddForm && (
                    <CardContent className="pt-0 pb-4">
                        <Card className="border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
                            <CardContent className="p-4 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Nome do Campo *</label>
                                        <Input
                                            placeholder="Ex: ERP ID, Código SAP..."
                                            value={newField.field_name}
                                            onChange={e => setNewField(p => ({ ...p, field_name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-medium mb-1 block">Módulos Alvo *</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal bg-background h-10 px-3">
                                                    {newField.target_module.length === 0 ? (
                                                        <span className="text-muted-foreground">Selecione um ou mais módulos...</span>
                                                    ) : (
                                                        <span className="truncate">
                                                            {newField.target_module.length} módulo(s) selecionado(s)
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
                                                    {Object.entries(MODULE_LABELS).map(([key, label]) => (
                                                        <div key={key} className="flex items-start gap-2 hover:bg-muted/50 p-1.5 rounded-sm">
                                                            <Checkbox
                                                                id={`popover_mod_${key}`}
                                                                checked={newField.target_module.includes(key)}
                                                                onCheckedChange={(checked) => {
                                                                    setNewField(prev => {
                                                                        const targets = new Set(prev.target_module);
                                                                        if (checked) targets.add(key);
                                                                        else targets.delete(key);
                                                                        return { ...prev, target_module: Array.from(targets) };
                                                                    });
                                                                }}
                                                            />
                                                            <label htmlFor={`popover_mod_${key}`} className="text-xs leading-tight cursor-pointer pt-0.5 flex-1">{label}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Tipo *</label>
                                        <Select
                                            value={newField.field_type}
                                            onValueChange={v => setNewField(p => ({ ...p, field_type: v }))}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(FIELD_TYPE_LABELS).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {(newField.field_type === 'select' || newField.field_type === 'multiselect') && (
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">Opções (separadas por vírgula)</label>
                                            <Input
                                                placeholder="Opção 1, Opção 2, Opção 3"
                                                value={newField.options}
                                                onChange={e => setNewField(p => ({ ...p, options: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="new_show_on_card"
                                            checked={newField.show_on_card}
                                            onCheckedChange={c => setNewField(p => ({ ...p, show_on_card: !!c }))}
                                        />
                                        <label htmlFor="new_show_on_card" className="text-xs cursor-pointer">Exibir no resumo (card)</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="new_show_in_interior"
                                            checked={newField.show_in_interior !== false} // default to true
                                            onCheckedChange={c => setNewField(p => ({ ...p, show_in_interior: !!c }))}
                                        />
                                        <label htmlFor="new_show_in_interior" className="text-xs cursor-pointer">Exibir nos detalhes (interior)</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="new_show_in_filters"
                                            checked={newField.show_in_filters}
                                            onCheckedChange={c => setNewField(p => ({ ...p, show_in_filters: !!c }))}
                                        />
                                        <label htmlFor="new_show_in_filters" className="text-xs cursor-pointer">Usar como Filtro</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="new_required"
                                            checked={newField.required}
                                            onCheckedChange={c => setNewField(p => ({ ...p, required: !!c }))}
                                        />
                                        <label htmlFor="new_required" className="text-xs cursor-pointer">Obrigatório</label>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleAdd} className="h-8">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Criar Campo
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-8">
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                )}
            </Card>

            {/* Fields by module */}
            {Object.keys(MODULE_LABELS).map(moduleKey => {
                const moduleFields = groupedFields[moduleKey];
                if (!moduleFields || moduleFields.length === 0) return null;

                return (
                    <Card key={moduleKey}>
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-normal">{MODULE_LABELS[moduleKey]}</Badge>
                                <span className="text-muted-foreground font-normal text-xs">({moduleFields.length} campo{moduleFields.length !== 1 ? 's' : ''})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="space-y-1.5">
                                {moduleFields.map(field => (
                                    <div key={`${moduleKey}-${field.id}`} className="group">
                                        {editingId === field.id ? (
                                            /* Edit mode */
                                            <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <Input
                                                        value={editForm.field_name || ''}
                                                        onChange={e => setEditForm(p => ({ ...p, field_name: e.target.value }))}
                                                        className="h-8 text-xs"
                                                        placeholder="Nome do campo"
                                                    />
                                                    <Select
                                                        value={editForm.target_module as string || 'vendor_registration'}
                                                        onValueChange={v => setEditForm(p => ({ ...p, target_module: v }))}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(MODULE_LABELS).map(([k, l]) => (
                                                                <SelectItem key={k} value={k}>{l}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Select
                                                        value={editForm.field_type || 'text'}
                                                        onValueChange={v => setEditForm(p => ({ ...p, field_type: v }))}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(FIELD_TYPE_LABELS).map(([k, l]) => (
                                                                <SelectItem key={k} value={k}>{l}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {(editForm.field_type === 'select' || editForm.field_type === 'multiselect') && (
                                                    <Input
                                                        value={Array.isArray(editForm.options) ? editForm.options.join(', ') : ''}
                                                        onChange={e => setEditForm(p => ({ ...p, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) as any }))}
                                                        className="h-8 text-xs"
                                                        placeholder="Opções separadas por vírgula"
                                                    />
                                                )}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between shadow-sm p-4 rounded-lg border border-border">
                                                        <div className="space-y-0.5">
                                                            <Label>Mostrar no Card Resumo</Label>
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-[200px]">Exibe o valor no card do elemento</p>
                                                        </div>
                                                        <Switch
                                                            checked={editForm.show_on_card || false}
                                                            onCheckedChange={c => setEditForm(p => ({ ...p, show_on_card: !!c }))}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between shadow-sm p-4 rounded-lg border border-border">
                                                        <div className="space-y-0.5">
                                                            <Label>Usar como Filtro</Label>
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-[200px]">Adiciona o campo na barra de filtros</p>
                                                        </div>
                                                        <Switch
                                                            checked={editForm.show_in_filters || false}
                                                            onCheckedChange={c => setEditForm(p => ({ ...p, show_in_filters: !!c }))}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-4">
                                                        <Checkbox
                                                            id={`required-${field.id}`}
                                                            checked={editForm.required || false}
                                                            onCheckedChange={c => setEditForm(p => ({ ...p, required: !!c }))}
                                                        />
                                                        <Label htmlFor={`required-${field.id}`} className="text-xs">Este campo é obrigatório</Label>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <Button size="sm" className="h-7 text-xs" onClick={() => saveEdit(field.id)}>
                                                        <Check className="h-3 w-3 mr-1" /> Salvar
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View mode */
                                            <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                                                    <span className="text-sm font-medium truncate">{field.field_name}</span>
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">{FIELD_TYPE_LABELS[field.field_type] || field.field_type}</Badge>
                                                    {field.show_on_card && <Badge className="text-[9px] px-1.5 py-0 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 shrink-0">Resumo</Badge>}
                                                    {field.show_in_interior && <Badge className="text-[9px] px-1.5 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">Interior</Badge>}
                                                    {field.required && <Badge className="text-[9px] px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shrink-0">Obrigatório</Badge>}
                                                    {(field.field_type === 'select' || field.field_type === 'multiselect') && field.options && (
                                                        <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                                                            ({field.options.join(', ')})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(field)}>
                                                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(field)}>
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Empty state */}
            {fields.length === 0 && !loading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Sliders className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <h3 className="text-sm font-medium mb-1">Nenhum campo customizado</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Clique em "Novo Campo" para criar campos personalizados que aparecerão nos formulários dos módulos da plataforma.
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Criar Primeiro Campo
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CustomFieldsConfigSection;
