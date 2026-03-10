import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQ = () => {
  const faqs = [
    {
      question: 'Como faço para redefinir minha senha?',
      answer: 'Você pode redefinir sua senha clicando em "Esqueceu a senha?" na página de login e seguindo as instruções.'
    },
    {
      question: 'Onde posso encontrar os relatórios de auditoria?',
      answer: 'Os relatórios de auditoria estão disponíveis na seção "Auditoria" do menu lateral.'
    },
    {
      question: 'Como entro em contato com o suporte técnico?',
      answer: 'Você pode usar o formulário de contato nesta página ou o chat de ajuda para falar com nossa equipe de suporte.'
    },
    {
      question: 'Posso personalizar meu dashboard?',
      answer: 'Atualmente, a personalização do dashboard é limitada, mas estamos trabalhando em mais opções para futuras atualizações.'
    }
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Perguntas Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQ;
