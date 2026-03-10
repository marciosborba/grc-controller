import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
}

const HelpChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Olá! Como posso ajudar você hoje?', sender: 'agent' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newUserMessage: Message = { id: messages.length + 1, text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput('');

      // Simula uma resposta do agente
      setTimeout(() => {
        const newAgentMessage: Message = { id: messages.length + 2, text: 'Obrigado pela sua mensagem. Um agente estará com você em breve.', sender: 'agent' };
        setMessages((prevMessages) => [...prevMessages, newAgentMessage]);
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Chat de Ajuda</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[400px] p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HelpChat;
