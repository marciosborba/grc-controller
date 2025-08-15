# 📋 Guia do Usuário - Configurações Gerais

## 🎯 Visão Geral

O módulo **Configurações Gerais** é o centro de comando para integrar sua plataforma GRC com serviços externos, ampliando significativamente as funcionalidades e valor da aplicação. Através desta interface, você pode conectar APIs, configurar provedores de IA, integrar serviços de email, SSO, webhooks, e muito mais.

### 🚀 Acesso Rápido
- **URL:** `/settings/general`
- **Menu:** Sidebar → Configurações Gerais
- **Permissão:** Usuários Admin ou com role "all"

---

## 📊 Dashboard - Visão Geral

Ao acessar as Configurações Gerais, você encontrará o **Dashboard de Status** com:

### KPIs em Tempo Real
- **Provedores Conectados:** Número de integrações ativas vs total
- **Tokens Utilizados:** Consumo de tokens de IA hoje
- **Requests Realizados:** Número de chamadas de API
- **Uptime Médio:** Disponibilidade das integrações

### Monitor de Atividade
- **Logs Recentes:** Últimas atividades das integrações
- **Status Health Check:** Verificação automática de saúde
- **Alertas:** Notificações de problemas de conectividade

---

## 🔌 Integrações de APIs

### Tipos Suportados
- **REST API** - Para serviços modernos
- **GraphQL** - Para consultas flexíveis
- **SOAP** - Para sistemas legados

### Como Configurar uma API

1. **Acesse a aba "APIs"**
2. **Clique em "Nova Integração"**
3. **Preencha os dados básicos:**
   - Nome da integração
   - Tipo (REST/GraphQL/SOAP)
   - URL base
4. **Configure a autenticação:**
   - **None:** Sem autenticação
   - **API Key:** Chave de API simples
   - **Bearer Token:** Token de autorização
   - **Basic Auth:** Usuário e senha
   - **OAuth 2.0:** Fluxo completo OAuth
5. **Adicione headers personalizados (opcional)**
6. **Configure rate limiting**
7. **Teste a conexão**

### Exemplo Prático - Slack API
```
Nome: Slack Notifications
Tipo: REST
URL Base: https://hooks.slack.com/services/
Autenticação: Bearer Token
Token: xoxb-your-slack-token
Rate Limit: 100 requests/min
```

### ⚡ Teste de Conectividade
- Use o botão "Testar Conexão" para validar
- Monitore logs em tempo real
- Verifique status de resposta e latência

---

## 🤖 Model Context Protocol (MCP)

Configure provedores de IA para análises avançadas e assistência inteligente.

### Provedores Disponíveis
- **Anthropic Claude** (3.5 Sonnet, etc.)
- **OpenAI GPT** (4 Turbo, etc.)
- **Provedores Customizados**

### Como Configurar um Provedor de IA

1. **Acesse a aba "MCP"**
2. **Selecione o provedor**
3. **Configure as credenciais:**
   - API Key do provedor
   - Endpoint (se customizado)
4. **Defina parâmetros do modelo:**
   - **Modelo:** Versão específica (ex: gpt-4-turbo)
   - **Context Window:** Tamanho do contexto (ex: 32000 tokens)
   - **Temperatura:** Criatividade (0.1 = conservador, 0.9 = criativo)
   - **Max Tokens:** Limite de resposta
5. **Selecione perfis de contexto:**
   - **Análise de Riscos:** ISO 31000, COSO, NIST
   - **Compliance LGPD:** Guidelines ANPD
   - **Perfis Customizados:** Prompts especializados

### Perfis de Contexto Pré-configurados

#### 📊 Análise de Riscos
- Frameworks: ISO 31000, COSO, NIST
- Foco: Identificação, avaliação e tratamento de riscos
- Outputs: Relatórios estruturados de risco

#### 🛡️ Compliance LGPD
- Base: Guidelines da ANPD
- Foco: Proteção de dados pessoais
- Outputs: Análises de conformidade e DPIAs

### Exemplo de Configuração - Claude
```
Provedor: Anthropic Claude
Modelo: claude-3-5-sonnet-20240620
API Key: sk-ant-api03-***
Context Window: 200000 tokens
Temperatura: 0.3
Perfil: Análise de Riscos + Compliance LGPD
```

---

## 📧 Configuração de E-mail

Integre provedores de email para notificações automáticas e comunicação.

### Provedores Suportados
- **SMTP Genérico** - Qualquer servidor SMTP
- **SendGrid** - Serviço especializado
- **Amazon SES** - AWS Simple Email Service
- **Mailgun** - API robusta de email
- **Microsoft Graph** - Office 365/Outlook

### Como Configurar Email

1. **Acesse a aba "E-mail"**
2. **Escolha o provedor**
3. **Configure as credenciais:**

#### SMTP Genérico
```
Servidor: smtp.gmail.com
Porta: 587
Segurança: TLS
Usuário: seu-email@empresa.com
Senha: sua-senha-app
```

#### SendGrid
```
API Key: SG.***
From Email: noreply@empresa.com
From Name: Sistema GRC
```

4. **Configure templates de email:**
   - **Variáveis dinâmicas:** {{nome_usuario}}, {{data}}, etc.
   - **Preview em tempo real**
   - **Versionamento de templates**

### Templates Disponíveis
- **Notificação de Risco:** Alertas de novos riscos
- **Assessment Concluído:** Finalização de avaliações
- **Incidente Criado:** Notificação de novos incidentes
- **Política Publicada:** Nova política disponível

### Monitoramento de Email
- **Taxa de Entrega:** % de emails entregues
- **Bounces:** Emails rejeitados
- **Opens/Clicks:** Engajamento dos usuários
- **Fila de Envio:** Emails pendentes

---

## 🔐 Single Sign-On (SSO)

Configure autenticação única para facilitar o acesso dos usuários.

### Provedores Suportados
- **Azure Active Directory** - Microsoft 365
- **Google Workspace** - G Suite
- **Okta** - Plataforma de identidade
- **Auth0** - Serviço de autenticação
- **SAML 2.0** - Padrão genérico
- **OpenID Connect** - Protocolo moderno

### Como Configurar SSO

#### Azure Active Directory
1. **No Azure Portal:**
   - Registre uma nova aplicação
   - Configure URLs de callback
   - Obtenha Client ID e Secret

2. **Na Plataforma GRC:**
   - Provider: Azure AD
   - Tenant ID: seu-tenant-id
   - Client ID: obtido do Azure
   - Client Secret: obtido do Azure
   - Callback URL: https://sua-plataforma.com/auth/callback

### Mapeamento de Atributos
Configure como os dados do provedor SSO são mapeados para o sistema:

```
Email: user.mail → email
Nome: user.displayName → full_name
Grupos: user.groups → roles
Departamento: user.department → department
```

### Configurações Avançadas
- **Auto-provisioning:** Criar usuários automaticamente
- **Sincronização de Roles:** Mapear grupos para permissões
- **Session Timeout:** Tempo limite da sessão
- **2FA Required:** Exigir autenticação dupla

---

## 🔗 Sistema de Webhooks

Configure notificações em tempo real para sistemas externos.

### Eventos Disponíveis
- **Riscos:** created, updated, deleted
- **Incidentes:** created, resolved
- **Assessments:** started, completed
- **Compliance:** updated
- **Usuários:** created
- **Políticas:** published

### Como Configurar um Webhook

1. **Acesse a aba "Webhooks"**
2. **Clique em "Novo Webhook"**
3. **Configure os dados:**
   - **Nome:** Identificação do webhook
   - **URL:** Endpoint de destino
   - **Eventos:** Selecione os eventos para monitorar
   - **Método HTTP:** POST (padrão)
4. **Configure segurança:**
   - **Assinatura HMAC:** Chave secreta para validação
   - **Headers customizados:** Autenticação adicional
5. **Política de retry:**
   - **Tentativas:** Número de reenvios (padrão: 3)
   - **Delay:** Intervalo entre tentativas
   - **Timeout:** Tempo limite por request

### Exemplo de Configuração
```
Nome: Slack Notifications
URL: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
Eventos: incident.created, risk.updated
HMAC Secret: sua-chave-secreta-aqui
Timeout: 30 segundos
```

### Payload de Exemplo
```json
{
  "event": "risk.created",
  "timestamp": "2025-08-15T10:30:00Z",
  "data": {
    "risk_id": "risk-123",
    "title": "Falha no Sistema de Backup",
    "severity": "high",
    "impact": 4,
    "likelihood": 3,
    "created_by": "user@empresa.com"
  }
}
```

### Monitoramento de Webhooks
- **Taxa de Sucesso:** % de deliveries bem-sucedidas
- **Tempo de Resposta:** Latência média
- **Eventos Recentes:** Log das últimas tentativas
- **Falhas:** Logs de erro detalhados

---

## ☁️ Backup e Sincronização

Configure backup automático e sincronização de dados.

### Destinos de Backup
- **Sistema Local** - Arquivo local
- **Amazon S3** - Storage na AWS
- **Google Drive** - Google Cloud Storage
- **Microsoft OneDrive** - Azure Storage
- **FTP/SFTP** - Servidor de arquivos

### Como Configurar Backup

1. **Acesse a aba "Backup"**
2. **Escolha o destino**
3. **Configure credenciais:**

#### Amazon S3
```
Access Key ID: AKIA***
Secret Access Key: ***
Bucket: backup-grc-empresa
Region: us-east-1
Pasta: backups/
```

#### Google Drive
```
Service Account Email: backup@projeto.iam.gserviceaccount.com
Private Key File: Carregar arquivo JSON
Pasta ID: 1ABC2DEF3GHI4JKL5MNO
```

4. **Configure agendamento:**
   - **Manual:** Backup sob demanda
   - **Horário:** A cada X horas
   - **Diário:** Todos os dias às X horas
   - **Semanal:** Dia da semana específico
   - **Mensal:** Dia do mês específico

### Tipos de Dados para Backup
- ✅ **Database Completo:** Todas as tabelas
- ✅ **Uploads e Documentos:** Arquivos anexados
- ✅ **Configurações:** Settings do sistema
- ✅ **Logs de Auditoria:** Histórico de ações
- ✅ **Relatórios:** Exports salvos

### Configurações Avançadas

#### Segurança
- **Criptografia:** AES-256 end-to-end
- **Compressão:** Reduzir tamanho dos arquivos
- **Verificação de Integridade:** Checksums MD5/SHA256

#### Retenção
- **Manter:** Últimas X versões
- **Deletar após:** X dias/meses
- **Arquivo:** Mover para storage de longo prazo

### Sincronização Bidirecional
- **One-way:** Apenas envio (backup)
- **Two-way:** Sincronização completa
- **Resolução de Conflitos:**
  - Sobrescrever (local ganha)
  - Manter remoto (remoto ganha)
  - Criar versão duplicada
  - Perguntar ao usuário

---

## 🎨 Interface e Navegação

### Estrutura de Abas
1. **Visão Geral** - Dashboard e status geral
2. **APIs** - Integrações REST/GraphQL/SOAP
3. **MCP** - Configuração de IA
4. **E-mail** - Provedores de email
5. **SSO** - Single Sign-On
6. **Webhooks** - Notificações em tempo real
7. **Backup** - Backup e sincronização

### Recursos da Interface
- **Responsiva:** Funciona em mobile e desktop
- **Status em Tempo Real:** Indicadores visuais de conexão
- **Teste de Conectividade:** Botões para validar configurações
- **Logs Visuais:** Histórico de atividades
- **Notificações:** Feedback instantâneo de ações

### Indicadores de Status
- 🟢 **Conectado:** Integração funcionando
- 🔴 **Erro:** Problema de conexão
- 🟡 **Pendente:** Configuração em andamento
- ⚪ **Desconectado:** Não configurado

---

## 🔍 Monitoramento e Troubleshooting

### Dashboard de Monitoramento
O dashboard principal oferece visão em tempo real de:
- **Saúde das Integrações:** Status individual
- **Performance:** Tempo de resposta e throughput
- **Erros:** Taxa de falhas e tipos de erro
- **Uso:** Consumo de recursos e limits

### Problemas Comuns e Soluções

#### ❌ "Conexão Falhou"
**Possíveis Causas:**
- Credenciais incorretas
- URL mal configurada
- Firewall bloqueando
- Serviço fora do ar

**Soluções:**
1. Verifique credenciais
2. Teste URL manualmente
3. Verifique conectividade de rede
4. Consulte status do provedor

#### ❌ "Rate Limit Exceeded"
**Causa:** Muitas requests em pouco tempo

**Soluções:**
1. Aumente intervalo entre requests
2. Configure rate limiting adequado
3. Considere upgrade do plano do provedor

#### ❌ "Webhook não chegou"
**Possíveis Causas:**
- URL incorreta
- Assinatura HMAC inválida
- Endpoint não responde
- Timeout muito baixo

**Soluções:**
1. Verifique URL do webhook
2. Confirme chave HMAC
3. Teste endpoint manualmente
4. Aumente timeout

### Ferramentas de Diagnóstico
- **Teste de Conectividade:** Validação imediata
- **Logs em Tempo Real:** Acompanhe tentativas
- **Simulações:** Teste sem impacto real
- **Health Checks:** Verificação automática

---

## 🛡️ Segurança e Boas Práticas

### Armazenamento Seguro
- **Credenciais criptografadas** em banco de dados
- **Máscaras de password** na interface
- **API keys ocultas** com toggle de visibilidade
- **Logs auditáveis** de todas as configurações

### Práticas Recomendadas

#### Credenciais
- ✅ Use service accounts dedicados
- ✅ Crie API keys com escopo limitado
- ✅ Rotacione credenciais regularmente
- ✅ Monitore uso de tokens

#### Webhooks
- ✅ Sempre use assinatura HMAC
- ✅ Configure HTTPS obrigatório
- ✅ Implemente idempotência
- ✅ Monitore tentativas de retry

#### Backup
- ✅ Habilite criptografia
- ✅ Teste restore regularmente
- ✅ Configure retenção adequada
- ✅ Monitore integridade dos backups

### Conformidade
- **LGPD:** Dados pessoais protegidos
- **ISO 27001:** Controles de segurança
- **SOC 2:** Auditoria de processos
- **GDPR:** Proteção de dados EU

---

## 📞 Suporte e Ajuda

### Recursos de Autoajuda
- **Documentação Integrada:** Clique no botão "Documentação"
- **Tooltips Contextuais:** Hover sobre campos
- **Exemplos Práticos:** Templates pré-configurados
- **Logs Detalhados:** Informações de debug

### Quando Buscar Ajuda
- Erro persistente após tentativas
- Configuração complexa de SSO
- Integração com sistema proprietário
- Performance abaixo do esperado

### Informações para Suporte
Quando contatar suporte, tenha em mãos:
1. **Logs de erro** específicos
2. **Configurações** utilizadas (sem credenciais)
3. **Passos para reproduzir** o problema
4. **Horário** em que ocorreu o erro

---

## 🚀 Próximos Passos

### Para Começar
1. **Avalie suas necessidades:** Quais integrações são prioritárias?
2. **Configure uma por vez:** Comece com a mais crítica
3. **Teste extensivamente:** Use ambiente de desenvolvimento
4. **Monitore ativamente:** Acompanhe logs e métricas
5. **Documente customizações:** Mantenha registro das configurações

### Expansão Futura
- **APIs adicionais** conforme necessidade
- **Automações** via webhooks
- **Analytics avançados** de integrações
- **Integração com SIEM** para segurança

---

**📅 Última atualização:** 15 de agosto de 2025  
**📊 Versão do módulo:** 1.0  
**✅ Status:** Funcional e pronto para uso

*Esta documentação é mantida atualizada conforme novas funcionalidades são adicionadas ao módulo.*