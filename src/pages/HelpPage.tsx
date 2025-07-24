import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/layout/ContactForm';
import HelpChat from '@/components/layout/HelpChat';

const FAQContent = () => {
  const faqs = [
    {
      question: 'Como faço para redefinir minha senha?',
      answer: 'Você pode redefinir sua senha clicando em "Esqueceu a senha?" na página de login. Se precisar de mais ajuda, entre em contato conosco.'
    },
    {
      question: 'Onde posso encontrar os relatórios de auditoria?',
      answer: (
        <>
          Os relatórios de auditoria estão disponíveis na seção <Link to="/audit" className="text-primary hover:underline">Auditoria</Link> do menu lateral. Lá você pode visualizar e gerenciar todos os relatórios.
        </>
      )
    },
    {
      question: 'Como faço para gerenciar os riscos da minha organização?',
      answer: (
        <>
          A gestão de riscos é feita na seção <Link to="/risks" className="text-primary hover:underline">Gestão de Riscos</Link>. Você pode identificar, avaliar e mitigar riscos por lá.
        </>
      )
    },
    {
      question: 'Onde posso ver os incidentes de segurança?',
      answer: (
        <>
          Os incidentes de segurança são registrados e gerenciados na seção <Link to="/incidents" className="text-primary hover:underline">Incidentes</Link>. Mantenha-se atualizado sobre as ocorrências.
        </>
      )
    },
    {
      question: 'Como posso verificar a conformidade da minha empresa?',
      answer: (
        <>
          A conformidade pode ser verificada na seção <Link to="/compliance" className="text-primary hover:underline">Conformidade</Link>, onde você encontrará controles e diretrizes.
        </>
      )
    },
    {
      question: 'Como faço para gerenciar as políticas da empresa?',
      answer: (
        <>
          As políticas estão disponíveis na seção <Link to="/policies" className="text-primary hover:underline">Políticas</Link>. Você pode criar, editar e publicar políticas aqui.
        </>
      )
    },
    {
      question: 'Onde posso encontrar informações sobre fornecedores?',
      answer: (
        <>
          As informações e gestão de riscos de fornecedores estão na seção <Link to="/vendors" className="text-primary hover:underline">Fornecedores</Link>.
        </>
      )
    },
    {
      question: 'Como acesso os relatórios e dashboards personalizados?',
      answer: (
        <>
          Todos os relatórios e dashboards estão centralizados na seção <Link to="/reports" className="text-primary hover:underline">Relatórios</Link> para uma visão abrangente.
        </>
      )
    },
    {
      question: 'Existe um canal para denúncias éticas?',
      answer: (
        <>
          Sim, você pode acessar o <Link to="/ethics" className="text-primary hover:underline">Canal de Ética</Link> para fazer denúncias de forma segura e anônima.
        </>
      )
    },
    {
      question: 'Como gerencio os usuários do sistema?',
      answer: (
        <>
          A gestão de usuários e permissões é feita em <Link to="/settings" className="text-primary hover:underline">Configurações</Link> na subseção de Gerenciamento de Usuários.
        </>
      )
    },
    {
      question: 'Onde vejo os logs de atividade do sistema?',
      answer: (
        <>
          Os logs de atividade estão disponíveis em <Link to="/settings/activity-logs" className="text-primary hover:underline">Configurações</Link> na subseção de Logs de Atividade.
        </>
      )
    },
  ];

  return (
    <Card className="w-full">
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

const HelpPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Central de Ajuda</h1>
      <p className="text-center text-muted-foreground mb-12">Encontre respostas para suas perguntas, entre em contato com o suporte ou inicie um chat.</p>

      <Tabs defaultValue="faq" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Fale Conosco</TabsTrigger>
          <TabsTrigger value="chat">Chat de Ajuda</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <FAQContent />
        </TabsContent>
        <TabsContent value="contact">
          <ContactForm />
        </TabsContent>
        <TabsContent value="chat">
          <HelpChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPage;
