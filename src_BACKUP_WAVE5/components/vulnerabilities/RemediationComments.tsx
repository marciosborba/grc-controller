import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

interface RemediationCommentsProps {
    vulnerabilityId: string;
}

export function RemediationComments({ vulnerabilityId }: RemediationCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [vulnerabilityId]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('vulnerability_comments')
            .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
            .eq('vulnerability_id', vulnerabilityId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments((data as any) || []);
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario nao autenticado');

            const { error } = await supabase
                .from('vulnerability_comments')
                .insert({
                    vulnerability_id: vulnerabilityId,
                    user_id: user.id,
                    content: newComment
                });

            if (error) throw error;

            setNewComment('');
            fetchComments();
            toast.success('Comentario adicionado');
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Erro ao adicionar comentario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comentários e Atividade
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 text-sm">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.profiles?.avatar_url} />
                                    <AvatarFallback>{comment.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1.5 w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{comment.profiles?.full_name || 'Usuário'}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex gap-2 pt-2">
                    <Textarea
                        placeholder="Escreva um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[40px] max-h-[120px]"
                        rows={1}
                    />
                    <Button size="icon" onClick={handleSubmit} disabled={loading || !newComment.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
