import React, { useState, useRef, useEffect } from 'react';
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
import { useAIChat, type AIChatConfig } from '@/hooks/useAIChat';

interface AIChatProps extends AIChatConfig {
  trigger?: React.ReactNode;
  title?: string;
  mode?: 'dialog' | 'widget' | 'inline';
  defaultOpen?: boolean;
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  type = 'general',
  context,
  trigger,
  title,
  mode = 'widget',
  defaultOpen = false,
  className = ''
}) => {
  const { messages, isLoading, sendMessage, initializeChat } = useAIChat({ type, context });
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen || mode === 'inline') {
      initializeChat();
    }
  }, [isOpen, mode, initializeChat]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue;
    setInputValue('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTypeLabel = () => {
    const labels = {
      general: 'Assistente Geral',
      assessment: 'Assessment',
      risk: 'Gestão de Riscos',
      audit: 'Auditoria',
      policy: 'Políticas',
      compliance: 'Compliance'
    };
    return title || labels[type] || 'Assistente IA';
  };

  const getTypeColor = () => {
    const colors = {
      general: 'bg-blue-500',
      assessment: 'bg-purple-500',
      risk: 'bg-red-500',
      audit: 'bg-green-500',
      policy: 'bg-indigo-500',
      compliance: 'bg-orange-500'
    };
    return colors[type] || 'bg-blue-500';
  };

  const ChatContent = () => (
    <Card className={`grc-card border-primary/30 ${isMinimized ? 'h-16' : 'h-96'} transition-all duration-300 ${className}`}>
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${getTypeColor()}`}>
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{getTypeLabel()}</CardTitle>
              <Badge variant="outline" className="text-xs">
                Assistente IA
              </Badge>
            </div>
          </div>
          {mode === 'widget' && (
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
          )}
        </div>
      </CardHeader>

      {(!isMinimized || mode !== 'widget') && (
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
  );

  if (mode === 'inline') {
    return <ChatContent />;
  }

  if (mode === 'dialog') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Chat com IA</span>
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-full ${getTypeColor()}`}>
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span>{getTypeLabel()}</span>
              <Badge variant="outline" className="text-xs">
                Assistente IA
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-96">
            <ScrollArea className="flex-1 p-4 border rounded-lg">
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

            <div className="mt-4 flex space-x-2">
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
        </DialogContent>
      </Dialog>
    );
  }

  // Widget mode
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
    </>
  );
};