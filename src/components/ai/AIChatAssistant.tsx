import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Brain,
  Send,
  Loader2,
  MessageCircle,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';

interface AIChatAssistantProps {
  type?: 'general' | 'assessment' | 'risk' | 'audit' | 'policy' | 'compliance';
  context?: any;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  type = 'general',
  context,
  trigger,
  defaultOpen = false
}) => {
  const { messages, isLoading, sendMessage, initializeChat } = useAIChat({ type, context });
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length, initializeChat]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const messageContent = inputValue;
    setInputValue('');
    await sendMessage(messageContent);
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const getTypeLabel = useCallback(() => {
    const labels = {
      general: 'Assistente Geral',
      assessment: 'Assessment',
      risk: 'Gestão de Riscos',
      audit: 'Auditoria',
      policy: 'Políticas',
      compliance: 'Compliance'
    };
    return labels[type] || 'Assistente IA';
  }, [type]);

  const getTypeColor = useCallback(() => {
    const colors = {
      general: 'bg-blue-500',
      assessment: 'bg-purple-500',
      risk: 'bg-red-500',
      audit: 'bg-green-500',
      policy: 'bg-indigo-500',
      compliance: 'bg-orange-500'
    };
    return colors[type] || 'bg-blue-500';
  }, [type]);

  const ChatContent = useCallback(() => (
    <Card className={`grc-card border-primary/30 ${isMinimized ? 'h-16' : 'h-96'} transition-all duration-300`}>
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${getTypeColor()}`}>
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{getTypeLabel()}</CardTitle>
              <Badge variant="outline" className="text-xs">
                Assistente IA - Hugging Face
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-80">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Assistente está digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputValue.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  ), [isMinimized, getTypeColor, getTypeLabel, messages, isLoading, messagesEndRef, inputValue, handleKeyPress, handleSendMessage]);

  if (defaultOpen) {
    return <ChatContent />;
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <ChatContent />
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full ${getTypeColor()} hover:opacity-90 transition-all duration-300 shadow-lg`}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {trigger && (
        <Dialog>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>{getTypeLabel()}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="h-96">
              <ChatContent />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};