import React from 'react';
import { X, Book, Settings, Plug, Database, Mail, Shield, Webhook, Cloud, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const moduleFeatures = [
    {
      title: "Dashboard de Status",
      description: "Monitoramento em tempo real de todas as integrações",
      icon: Database,
      features: ["KPI cards com métricas", "Monitor de atividade", "Health checks", "Alertas de conectividade"]
    },
    {
      title: "Integrações de APIs",
      description: "Conecte com serviços externos via REST, GraphQL e SOAP",
      icon: Plug,
      features: ["Múltiplos métodos de autenticação", "Headers customizados", "Rate limiting", "Teste de conectividade"]
    },
    {
      title: "Model Context Protocol (MCP)",
      description: "Configuração avançada para provedores de IA",
      icon: Zap,
      features: ["Anthropic Claude", "OpenAI GPT", "Perfis de contexto", "Prompts especializados"]
    },
    {
      title: "Serviços de E-mail",
      description: "SMTP, SendGrid, AWS SES e outros provedores",
      icon: Mail,
      features: ["Templates personalizados", "Preview em tempo real", "Analytics de entrega", "Logs detalhados"]
    },
    {
      title: "Single Sign-On (SSO)",
      description: "Azure AD, Google, SAML 2.0 e OAuth 2.0",
      icon: Shield,
      features: ["Auto-provisioning", "Mapeamento de atributos", "Sincronização de roles", "Logs de auditoria"]
    },
    {
      title: "Sistema de Webhooks",
      description: "Notificações em tempo real para sistemas externos",
      icon: Webhook,
      features: ["Múltiplos eventos", "Assinatura HMAC", "Retry automático", "Monitoramento de status"]
    },
    {
      title: "Backup & Sincronização",
      description: "AWS S3, Google Drive, Azure Blob Storage",
      icon: Cloud,
      features: ["Agendamento flexível", "Criptografia end-to-end", "Política de retenção", "Sincronização bidirecional"]
    }
  ];

  const configurationSteps = [
    {
      category: "APIs",
      steps: [
        "Selecione o tipo de API (REST, GraphQL, SOAP)",
        "Configure a URL base e endpoints",
        "Escolha o método de autenticação",
        "Adicione headers personalizados se necessário",
        "Configure rate limiting",
        "Teste a conectividade"
      ]
    },
    {
      category: "MCP (IA)",
      steps: [
        "Selecione o provedor (Claude, OpenAI, Custom)",
        "Configure as credenciais da API",
        "Defina o modelo e parâmetros",
        "Configure janela de contexto e temperatura",
        "Selecione ou crie perfis de contexto",
        "Teste a conectividade"
      ]
    },
    {
      category: "E-mail",
      steps: [
        "Escolha o provedor de e-mail",
        "Configure as credenciais SMTP ou API",
        "Defina templates de e-mail",
        "Configure variáveis dinâmicas",
        "Teste o envio de e-mail",
        "Monitore métricas de entrega"
      ]
    },
    {
      category: "SSO",
      steps: [
        "Selecione o provedor de identidade",
        "Configure URLs de callback",
        "Defina mapeamento de atributos",
        "Configure auto-provisioning",
        "Teste o fluxo de autenticação",
        "Ative logs de auditoria"
      ]
    },
    {
      category: "Webhooks",
      steps: [
        "Configure a URL do endpoint",
        "Selecione os eventos a monitorar",
        "Configure assinatura HMAC para segurança",
        "Defina política de retry",
        "Teste o webhook",
        "Monitore logs de entrega"
      ]
    },
    {
      category: "Backup",
      steps: [
        "Escolha o destino de backup",
        "Configure credenciais de acesso",
        "Defina agendamento",
        "Configure criptografia",
        "Selecione dados a incluir",
        "Execute teste de backup"
      ]
    }
  ];

  const securityConsiderations = [
    "Todas as credenciais são armazenadas de forma segura",
    "Máscaras de senha nos inputs sensíveis",
    "Logs de auditoria para todas as configurações",
    "Validação de inputs para prevenção de XSS",
    "Criptografia end-to-end para backups",
    "Assinatura HMAC para webhooks",
    "Timeouts configuráveis para prevenir ataques"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Book className="h-6 w-6" />
            Documentação - Configurações Gerais
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full p-6">
          <div className="space-y-8">
            
            {/* Visão Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Visão Geral do Módulo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  O módulo <strong>Configurações Gerais</strong> permite integrar a plataforma GRC com serviços externos, 
                  ampliando significativamente as funcionalidades e valor da aplicação. Oferece configuração centralizada 
                  para APIs, provedores de IA, serviços de email, SSO, webhooks, backups e sincronizações.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">7</div>
                    <div className="text-sm text-muted-foreground">Categorias de Integração</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">25+</div>
                    <div className="text-sm text-muted-foreground">Provedores Suportados</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-muted-foreground">Monitoramento em Tempo Real</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funcionalidades */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades Disponíveis</CardTitle>
                <CardDescription>
                  Cada categoria oferece configurações específicas e monitoramento detalhado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduleFeatures.map((feature, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <feature.icon className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{feature.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      <div className="space-y-1">
                        {feature.features.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs mr-1 mb-1">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guia de Configuração */}
            <Card>
              <CardHeader>
                <CardTitle>Guia de Configuração Passo a Passo</CardTitle>
                <CardDescription>
                  Instruções detalhadas para configurar cada tipo de integração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {configurationSteps.map((config, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      {config.category}
                    </h4>
                    <div className="ml-8 space-y-2">
                      {config.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-sm mt-0.5">{stepIndex + 1}.</span>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                    {index < configurationSteps.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Considerações de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Considerações de Segurança
                </CardTitle>
                <CardDescription>
                  Práticas de segurança implementadas no módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {securityConsiderations.map((consideration, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{consideration}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navegação e Acesso */}
            <Card>
              <CardHeader>
                <CardTitle>Navegação e Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Como Acessar</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge>Rota</Badge>
                        <code className="bg-muted px-2 py-1 rounded">/settings/general</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Menu</Badge>
                        <span>Sidebar → Configurações Gerais</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Permissão</Badge>
                        <span>Admin ou role "all"</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Estrutura de Navegação</h4>
                    <div className="space-y-2 text-sm">
                      <div>• <strong>Visão Geral</strong> - Dashboard e status</div>
                      <div>• <strong>APIs</strong> - Integrações REST/GraphQL/SOAP</div>
                      <div>• <strong>MCP</strong> - Configuração de IA</div>
                      <div>• <strong>E-mail</strong> - Provedores de email</div>
                      <div>• <strong>SSO</strong> - Single Sign-On</div>
                      <div>• <strong>Webhooks</strong> - Notificações em tempo real</div>
                      <div>• <strong>Backup</strong> - Backup e sincronização</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suporte e Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle>Suporte e Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Problemas Comuns
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <div>• <strong>Conexão falha:</strong> Verifique credenciais e URLs</div>
                    <div>• <strong>Rate limiting:</strong> Ajuste configurações de limite</div>
                    <div>• <strong>Webhooks não chegam:</strong> Verifique URL e assinatura HMAC</div>
                    <div>• <strong>Backup falha:</strong> Verificar permissões de destino</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Recursos de Diagnóstico
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <div>• Use o botão "Testar Conexão" para cada integração</div>
                    <div>• Monitore logs em tempo real no dashboard</div>
                    <div>• Verifique status de health checks</div>
                    <div>• Use simulações para validar configurações</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
        
        <div className="p-6 pt-0">
          <Button onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Fechar Documentação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentationModal;