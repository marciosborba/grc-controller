import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Trash2,
    Save,
    Plus,
    UploadCloud,
    FileText,
    Paperclip,
    MoreVertical,
    User,
    Users,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface RemediationBlockProps {
    task: any;
    onUpdate: () => void;
    onDelete: () => void;
    standardStatusOptions: { value: string; label: string }[];
    customStatusOptions: { value: string; label: string }[];
    onManageStatus: () => void;
    onAddNext: () => void;
    isAdmin: boolean;
    vulnerabilityStatus: string;
    onUpdateVulnerabilityStatus: (status: string) => void;
}

export function RemediationBlock({
    task,
    onUpdate,
    onDelete,
    standardStatusOptions,
    customStatusOptions,
    onManageStatus,
    onAddNext,
    isAdmin,
    vulnerabilityStatus,
    onUpdateVulnerabilityStatus
}: RemediationBlockProps) {
    const [description, setDescription] = useState(task.description || '');
    const [assignedTo, setAssignedTo] = useState(task.assigned_to || '');
    const [assignedTeam, setAssignedTeam] = useState(task.assigned_team || '');
    const [status, setStatus] = useState(task.status || 'open');
    const [isSaving, setIsSaving] = useState(false);

    // Action Items State
    const [actionItems, setActionItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState('');

    // Attachments State
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchActionItems();
        fetchAttachments();
    }, [task.id]);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('remediation_tasks')
            .update({
                description,
                assigned_to: assignedTo,
                assigned_team: assignedTeam,
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', task.id);

        setIsSaving(false);
        if (error) {
            toast.error('Erro ao salvar etapa');
        } else {
            toast.success('Etapa salva com sucesso');
            onUpdate();

            // Check if status changed and is different from main vulnerability status
            if (status !== vulnerabilityStatus) {
                setTimeout(() => {
                    if (window.confirm(`Você alterou o status da etapa para "${status}".\nDeseja atualizar o status principal da vulnerabilidade também?`)) {
                        onUpdateVulnerabilityStatus(status);
                    }
                }, 500);
            }
        }
    };

    const fetchActionItems = async () => {
        const { data } = await supabase
            .from('vulnerability_action_items')
            .select('*')
            .eq('task_id', task.id)
            .order('created_at', { ascending: true });
        if (data) setActionItems(data);
    };

    const addItem = async () => {
        if (!newItem.trim()) return;
        const { error } = await supabase
            .from('vulnerability_action_items')
            .insert({
                title: newItem,
                is_completed: false,
                task_id: task.id,
                vulnerability_id: task.vulnerability_id
            });

        if (!error) {
            setNewItem('');
            fetchActionItems();
        } else {
            toast.error('Erro ao adicionar item');
        }
    };

    const toggleItem = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from('vulnerability_action_items')
            .update({ is_completed: !current })
            .eq('id', id);
        if (!error) fetchActionItems();
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase
            .from('vulnerability_action_items')
            .delete()
            .eq('id', id);
        if (!error) fetchActionItems();
    };

    // Attachments Logic
    const fetchAttachments = async () => {
        const { data } = await supabase
            .from('vulnerability_attachments')
            .select('*')
            .eq('task_id', task.id);
        if (data) setAttachments(data);
    };

    const onDrop = async (acceptedFiles: File[]) => {
        setIsUploading(true);
        for (const file of acceptedFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${task.vulnerability_id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('vulnerability-evidence')
                .upload(filePath, file);

            if (uploadError) {
                toast.error(`Erro ao fazer upload de ${file.name}`);
                continue;
            }

            const { error: dbError } = await supabase.from('vulnerability_attachments').insert({
                vulnerability_id: task.vulnerability_id,
                task_id: task.id,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type,
                size: file.size
            });

            if (dbError) {
                console.error('Error saving attachment metadata:', dbError);
                toast.error(`Erro ao salvar metadados do arquivo: ${dbError.message}`);
            }
        }
        await fetchAttachments();
        setIsUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const deleteAttachment = async (id: string, path: string) => {
        const { error } = await supabase.storage
            .from('vulnerability-evidence')
            .remove([path]);

        if (!error) {
            await supabase.from('vulnerability_attachments').delete().eq('id', id);
            fetchAttachments();
        } else {
            toast.error('Erro ao deletar arquivo');
        }
    };

    // Find label for current status
    const getCurrentStatusLabel = () => {
        const standard = standardStatusOptions.find(o => o.value === status);
        if (standard) return standard.label;
        const custom = customStatusOptions.find(o => o.value === status);
        if (custom) return custom.label;
        return status;
    };

    const getStatusColor = () => {
        if (status === 'Resolved' || status === 'done') return 'default';
        if (status === 'In_Progress' || status === 'in_progress') return 'secondary';
        return 'outline';
    };

    return (
        <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="py-3 px-4 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                    <Badge variant={getStatusColor()} className="uppercase">
                        {getCurrentStatusLabel()}
                    </Badge>
                    {assignedTeam && (
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {assignedTeam}
                        </span>
                    )}
                    {assignedTo && (
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" /> {assignedTo}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Salvando...' : 'Salvar Etapa'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Context & Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Contexto Técnico & Detalhes</Label>
                        <Textarea
                            placeholder="Descreva o que precisa ser feito, logs de erro, ou detalhes técnicos..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="resize-none bg-background"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Responsável</Label>
                                <Input
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    placeholder="Email ou Nome"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Equipe</Label>
                                <Input
                                    value={assignedTeam}
                                    onChange={(e) => setAssignedTeam(e.target.value)}
                                    placeholder="Ex: DevOps"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status da Etapa</Label>
                            <Select value={status} onValueChange={(value) => {
                                if (value === 'manage_custom_status') {
                                    onManageStatus();
                                } else {
                                    setStatus(value);
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {standardStatusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                    {customStatusOptions.length > 0 && <div className="h-px bg-muted my-1" />}
                                    {customStatusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}

                                    {isAdmin && (
                                        <>
                                            <div className="h-px bg-muted my-1" />
                                            <SelectItem value="manage_custom_status" className="text-primary font-medium focus:text-primary focus:bg-primary/10">
                                                <div className="flex items-center">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Gerenciar Status
                                                </div>
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                    {/* Action Plan */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" /> Plano de Ação
                        </h4>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Nova ação..."
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                className="h-8 text-sm"
                            />
                            <Button size="sm" variant="secondary" onClick={addItem}>Adicionar</Button>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {actionItems.map(item => (
                                <div key={item.id} className="flex items-start gap-2 text-sm group">
                                    <Checkbox
                                        checked={item.is_completed}
                                        onCheckedChange={() => toggleItem(item.id, item.is_completed)}
                                        className="mt-1"
                                    />
                                    <span className={`flex-1 ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.title}
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteItem(item.id)}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {actionItems.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma ação definida.</p>}
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                            <Paperclip className="h-4 w-4" /> Anexos & Evidências
                        </h4>

                        <div
                            {...getRootProps()}
                            className={`border border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <p className="text-xs text-muted-foreground">Enviando...</p>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <UploadCloud className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Arraste ou clique para anexar</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {attachments.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30 text-xs group">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                                        <span className="truncate max-w-[150px]" title={file.file_name}>{file.file_name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteAttachment(file.id, file.file_path)}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={onAddNext} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar Nova Etapa
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
