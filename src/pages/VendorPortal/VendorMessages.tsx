import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessagesSquare, Send, Paperclip, Loader2, File, Download, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VendorMessages = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            initChat();
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initChat = async () => {
        try {
            setIsLoading(true);
            let currentVendorId = null;

            const { data: vendorUser } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user!.id)
                .limit(1)
                .maybeSingle();

            if (vendorUser?.vendor_id) {
                currentVendorId = vendorUser.vendor_id;
            } else {
                const { data: portalUser } = await supabase
                    .from('vendor_portal_users')
                    .select('vendor_id')
                    .eq('email', user!.email?.trim().toLowerCase())
                    .limit(1)
                    .maybeSingle();

                if (portalUser?.vendor_id) {
                    currentVendorId = portalUser.vendor_id;
                }
            }

            if (!currentVendorId) {
                throw new Error("Perfil de fornecedor não encontrado.");
            }

            setVendorId(currentVendorId);
            await fetchMessages(currentVendorId);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao carregar mensagens",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (vid: string) => {
        const { data, error } = await supabase
            .from('vendor_risk_messages')
            .select('*')
            .eq('vendor_id', vid)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return;
        }

        if (data) {
            setMessages(data);

            // Mark unread admin messages as read
            const unreadIds = data
                .filter((msg: any) => msg.sender_type === 'internal' && msg.read === false)
                .map((msg: any) => msg.id);

            if (unreadIds.length > 0) {
                await supabase
                    .from('vendor_risk_messages')
                    .update({ read: true })
                    .in('id', unreadIds);
            }
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        const newAttachments = [...attachments];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('chat-attachments')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chat-attachments')
                    .getPublicUrl(fileName);

                newAttachments.push({
                    name: file.name,
                    url: publicUrl,
                    type: file.type,
                    size: file.size
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                toast({ title: "Erro no Upload", description: `Falha ao enviar ${file.name}`, variant: "destructive" });
            }
        }

        setAttachments(newAttachments);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorId) return;
        if (!newMessage.trim() && attachments.length === 0) return;

        try {
            setIsSending(true);
            const { error } = await supabase.from('vendor_risk_messages').insert({
                vendor_id: vendorId,
                sender_type: 'vendor',
                content: newMessage
            });

            if (error) throw error;

            setNewMessage('');
            setAttachments([]);
            await fetchMessages(vendorId);
            toast({ title: "Enviado", description: "Mensagem enviada com sucesso." });
        } catch (error) {
            console.error('Error sending message:', error);
            toast({ title: "Erro", description: "Não foi possível enviar a mensagem.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Central de Comunicação</h1>
                <p className="text-muted-foreground mt-1">
                    Fale diretamente com nossa equipe de Compliance e Segurança da Informação.
                </p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-card shadow-sm border-border">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessagesSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Equipe de Compliance</h3>
                        <p className="text-xs text-muted-foreground">Normalmente responde em algumas horas</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
                            <MessagesSquare className="h-12 w-12 opacity-20" />
                            <p className="text-sm">Nenhuma mensagem ainda. Inicie uma conversa!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isVendor = msg.sender_type === 'vendor';
                            return (
                                <div key={msg.id} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[75%] p-4 rounded-2xl shadow-sm space-y-2
                                        ${isVendor
                                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                            : 'bg-card border border-border text-foreground rounded-tl-sm'}
                                    `}>
                                        {msg.content && (
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.content}
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="space-y-2 mt-2">
                                                {msg.attachments.map((att: any, idx: number) => (
                                                    <div key={idx} className={`flex items-center gap-3 p-2 rounded-md ${isVendor ? 'bg-primary-foreground/10 border border-primary-foreground/20' : 'bg-muted border border-border'}`}>
                                                        <div className={`p-2 rounded ${isVendor ? 'bg-primary-foreground/20' : 'bg-card'}`}>
                                                            <File className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">{att.name}</p>
                                                            <p className="text-[10px] opacity-70">{(att.size / 1024).toFixed(1)} KB</p>
                                                        </div>
                                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded transition-colors ${isVendor ? 'hover:bg-primary-foreground/20' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isVendor ? 'justify-end text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            {isVendor && <CheckCircle2 className="h-3 w-3 inline ml-1 opacity-80" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-border">
                    {attachments.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
                            {attachments.map((att, idx) => (
                                <div key={idx} className="bg-muted border border-border p-2 rounded text-xs flex items-center gap-2">
                                    <File className="h-3 w-3 text-muted-foreground" />
                                    <span className="truncate max-w-[100px]">{att.name}</span>
                                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-bold ml-1">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 shrink-0 border-border text-muted-foreground hover:text-foreground"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isSending}
                        >
                            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                        </Button>
                        <Input
                            placeholder="Escreva sua mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 h-12 bg-muted/50 border-border focus:bg-card transition-colors"
                            disabled={isSending}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 shrink-0"
                            disabled={isSending || isUploading || (!newMessage.trim() && attachments.length === 0)}
                        >
                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default VendorMessages;
