
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Send,
  Clock,
  ChevronRight,
  Search,
  Inbox,
  CheckCircle2,
  Paperclip,
  X,
  File,
  Loader2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VendorRegistry, VendorAssessment } from '@/hooks/useVendorRiskManagement';
import { supabase } from '@/integrations/supabase/client';

export interface VendorNotificationSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors?: VendorRegistry[];
  assessments?: VendorAssessment[];
}

export const VendorNotificationSystem: React.FC<VendorNotificationSystemProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  // Message State
  const [messages, setMessages] = useState<any[]>([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<any>(null);

  // New Attachments State
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);

  const fetchMessages = async () => {
    try {
      // Try fetching with attachments
      const { data, error } = await supabase
        .from('vendor_risk_messages')
        .select(`
          id,
          content,
          created_at,
          sender_type,
          vendor_registry:vendor_id (name),
          vendor_id,
          assessment_id,
          attachments
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // If error is due to missing column (Postgres code 42703), retry without attachments
        if (error.code === '42703') {
          console.warn('Attachments column missing, fetching legacy format.');
          const { data: legacyData, error: legacyError } = await supabase
            .from('vendor_risk_messages')
            .select(`
              id,
              content,
              created_at,
              sender_type,
              vendor_registry:vendor_id (name),
              vendor_id,
              assessment_id
            `)
            .order('created_at', { ascending: false });

          if (legacyError) throw legacyError;

          if (legacyData) {
            const formatted = legacyData.map((msg: any) => ({
              id: msg.id,
              vendor: msg.vendor_registry?.name || 'Fornecedor',
              subject: 'Nova Mensagem',
              date: msg.created_at,
              status: msg.sender_type === 'vendor' ? 'received' : 'sent',
              preview: msg.content.substring(0, 50) + '...',
              content: msg.content,
              vendorId: msg.vendor_id,
              assessmentId: msg.assessment_id,
              attachments: [] // Default to empty
            }));
            setMessages(formatted);
          }
          return;
        }
        throw error;
      }

      if (data) {
        const formatted = data.map((msg: any) => ({
          id: msg.id,
          vendor: msg.vendor_registry?.name || 'Fornecedor',
          subject: 'Nova Mensagem',
          date: msg.created_at,
          status: msg.sender_type === 'vendor' ? 'received' : 'sent',
          preview: msg.content.substring(0, 50) + '...',
          content: msg.content,
          vendorId: msg.vendor_id,
          assessmentId: msg.assessment_id,
          attachments: msg.attachments || []
        }));
        setMessages(formatted);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar",
        description: "Falha ao sincronizar mensagens.",
        variant: "destructive"
      });
    }
  };

  // Group messages by vendor (Threads)
  const threads = React.useMemo(() => {
    const threadMap = new Map();

    messages.forEach(msg => {
      const key = msg.vendorId || msg.vendor || 'unknown';
      if (!threadMap.has(key)) {
        threadMap.set(key, {
          vendorId: msg.vendorId,
          vendorName: msg.vendor,
          avatar: msg.vendor ? msg.vendor.substring(0, 2).toUpperCase() : '??',
          messages: [],
          unreadCount: 0,
          lastMessageDate: null
        });
      }
      const thread = threadMap.get(key);
      thread.messages.push(msg);
    });

    return Array.from(threadMap.values()).map((thread: any) => {
      thread.messages.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const lastMsg = thread.messages[thread.messages.length - 1];
      thread.lastMessage = lastMsg;
      thread.lastMessageDate = lastMsg.date;
      thread.unreadCount = thread.messages.filter((m: any) => m.status === 'received').length;
      return thread;
    }).sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());
  }, [messages]);

  // Handle File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      // Convert File[] to FileList-like object not needed, just loop
      // But I want to reuse logic, so...
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      handleFileUpload(dt.files);
    }
  };

  const handleSendReply = async (content: string) => {
    if (!selectedThread || !selectedThread.vendorId) return;
    if (!content.trim() && attachments.length === 0) return;

    const lastMsgWithAssessment = [...selectedThread.messages].reverse().find((m: any) => m.assessmentId);

    try {
      const { error } = await supabase.from('vendor_risk_messages').insert({
        vendor_id: selectedThread.vendorId,
        assessment_id: lastMsgWithAssessment?.assessmentId || null,
        sender_type: 'internal',
        content: content,
        attachments: attachments
      });

      if (error) throw error;

      toast({ title: "Enviado", description: "Mensagem enviada com sucesso." });
      setAttachments([]);
      await fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ title: "Erro", description: "Não foi possível enviar.", variant: "destructive" });
    }
  };

  // Re-sync selectedThread
  useEffect(() => {
    if (selectedThread) {
      const updated = threads.find(t => t.vendorId === selectedThread.vendorId || t.vendorName === selectedThread.vendorName);
      if (updated) setSelectedThread(updated);
    }
  }, [messages, threads]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <div className="p-6 border-b bg-muted/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-semibold">Central de Dúvidas do Fornecedor</span>
                <span className="text-muted-foreground font-normal ml-2 text-base">Suporte</span>
              </div>
            </DialogTitle>
            <DialogDescription className="ml-11">
              Canal direto para resolver dúvidas e solicitações dos fornecedores.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
            {!selectedThread ? (
              // THREAD LIST VIEW (Simplified for brevity in plan, but mostly unchanged)
              <div className="flex flex-col h-full">
                <div className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 shrink-0">
                  <div>
                    <h3 className="text-lg font-semibold">Conversas</h3>
                    <p className="text-sm text-muted-foreground mt-1">Selecione um fornecedor para iniciar o atendimento.</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={fetchMessages} title="Atualizar">
                      <Clock className="h-4 w-4 mr-1" />
                      Atualizar
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar fornecedor..."
                        className="pl-9 w-64"
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-3 overflow-y-auto flex-1">
                  {threads.length > 0 ? (
                    threads.filter(t => t.vendorName.toLowerCase().includes(messageSearch.toLowerCase())).map(thread => (
                      <div
                        key={thread.vendorId || thread.vendorName}
                        onClick={() => setSelectedThread(thread)}
                        className="group flex items-center gap-4 p-4 bg-card border rounded-xl hover:shadow-md transition-all cursor-pointer hover:border-primary/30 relative"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold flex-shrink-0">
                          {thread.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-base truncate">{thread.vendorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(thread.lastMessageDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground truncate max-w-[80%]">
                              <span className="font-medium text-foreground/80">
                                {thread.lastMessage.sender_type === 'internal' ? 'Você: ' : ''}
                              </span>
                              {thread.lastMessage.content ? thread.lastMessage.content : (thread.lastMessage.attachments?.length ? '📎 Anexo' : '')}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Inbox className="h-12 w-12 mb-4 opacity-20" />
                      <p>Nenhuma conversa encontrada.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // CHAT INTERFACE VIEW
              <div className="flex flex-col h-full bg-background absolute inset-0 z-20">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-card text-card-foreground shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedThread(null)} className="-ml-2 hover:bg-muted/50">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {selectedThread.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedThread.vendorName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedThread.messages.length} mensagens
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchMessages}>
                    <Clock className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
                  {selectedThread.messages.map((msg: any, idx: number) => {
                    const isInternal = msg.status === 'sent';
                    return (
                      <div key={msg.id} className={`flex ${isInternal ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[70%] p-4 rounded-2xl shadow-sm relative space-y-2
                            ${isInternal
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border text-card-foreground rounded-tl-sm'}
                            `}>
                          {msg.content && (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.content}
                            </div>
                          )}

                          {/* Attachments Display */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {msg.attachments.map((att: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-background/20 rounded-md border border-white/10">
                                  <div className="bg-white/20 p-2 rounded">
                                    <File className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{att.name}</p>
                                    <p className="text-[10px] opacity-70">{(att.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/20 rounded transition-colors">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className={`text-[10px] mt-2 flex items-center gap-1 opacity-70 ${isInternal ? 'justify-end text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {new Date(msg.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {isInternal && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Footer (Input) */}
                <div className="p-4 border-t bg-background shrink-0 space-y-3">

                  {/* Attachment Preview Area */}
                  {attachments.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="relative group bg-muted p-2 rounded-lg border w-32 shrink-0">
                          <button
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="flex flex-col items-center text-center gap-1">
                            <File className="h-8 w-8 text-primary/50" />
                            <span className="text-xs truncate w-full">{att.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.elements.namedItem('replyContent') as HTMLInputElement;
                      handleSendReply(input.value);
                      input.value = '';
                    }}
                    className="flex gap-2 items-end"
                  >
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                    </Button>
                    <Input
                      name="replyContent"
                      placeholder="Digite sua resposta ou cole uma imagem..."
                      className="flex-1"
                      autoComplete="off"
                      onPaste={handlePaste}
                    />
                    <Button type="submit" size="icon" className="shrink-0" disabled={isUploading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};