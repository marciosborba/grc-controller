import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListTodo, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActionItem {
    id: string;
    title: string;
    is_completed: boolean;
}

interface ActionPlanProps {
    vulnerabilityId: string;
    isTask?: boolean;
}

export function ActionPlan({ vulnerabilityId }: ActionPlanProps) {
    const [items, setItems] = useState<ActionItem[]>([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        fetchItems();
    }, [vulnerabilityId]);

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('vulnerability_action_items')
            .select('*')
            .eq('vulnerability_id', vulnerabilityId)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching action items:', error);
        else setItems(data || []);
    };

    const handleAddItem = async () => {
        if (!newItem.trim()) return;

        const { error } = await supabase
            .from('vulnerability_action_items')
            .insert({
                vulnerability_id: vulnerabilityId,
                title: newItem.trim(),
                is_completed: false
            });

        if (error) {
            toast.error('Erro ao adicionar item');
        } else {
            setNewItem('');
            fetchItems();
        }
    };

    const toggleItem = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setItems(items.map(i => i.id === id ? { ...i, is_completed: !currentStatus } : i));

        const { error } = await supabase
            .from('vulnerability_action_items')
            .update({ is_completed: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error('Erro ao atualizar item');
            fetchItems(); // Revert on error
        }
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase
            .from('vulnerability_action_items')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Erro ao deletar item');
        } else {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const progress = items.length > 0
        ? Math.round((items.filter(i => i.is_completed).length / items.length) * 100)
        : 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            Plano de Ação
                        </CardTitle>
                        <CardDescription>
                            Checklist de tarefas para execução da correção
                        </CardDescription>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        {progress}% Concluído
                    </div>
                </div>
                {items.length > 0 && (
                    <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Adicionar nova tarefa..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button size="icon" onClick={handleAddItem}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group">
                            <Checkbox
                                checked={item.is_completed}
                                onCheckedChange={() => toggleItem(item.id, item.is_completed)}
                            />
                            <span className={`flex-1 text-sm ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {item.title}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteItem(item.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                            Nenhuma tarefa pendente
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
