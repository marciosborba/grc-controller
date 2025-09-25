# 📋 Manual do Usuário - Módulo de Ética

## 🎯 Visão Geral

O **Módulo de Ética** é um sistema empresarial completo para gestão de denúncias éticas, investigações, ações corretivas e conformidade regulatória. Ele oferece capacidades de nível corporativo para organizações que precisam de controles rigorosos, rastreabilidade completa e conformidade automática com regulamentações.

### 🏢 Principais Funcionalidades

- **Canal de Denúncias Éticas**: Recebimento seguro de denúncias anônimas e identificadas
- **Sistema de Investigação**: Gestão completa de investigações preliminares, completas, externas e legais  
- **Gestão de Evidências**: Sistema forense com chain of custody e proteção legal
- **Ações Corretivas**: Rastreamento de eficácia e monitoramento de implementação
- **Notificações Regulamentares**: Automação de compliance com órgãos reguladores
- **Sistema de Comunicações**: Templates e automação de comunicações com denunciantes
- **Configurações Avançadas**: Integração com sistemas externos e configuração de SLAs

---

## 📊 1. ABA DASHBOARD - Visão Executiva

### 🎛️ **Acesso**
- Navegue para o módulo de Ética
- A aba **Dashboard** é a primeira a ser exibida

### 📈 **KPIs Principais**

#### **Métricas de Volume:**
- **Total**: Número total de casos registrados
- **Em Andamento**: Casos ativos (triaging, investigando, em revisão)
- **Investigando**: Casos com investigação ativa
- **Resolvidos**: Casos com resolução completa
- **Anônimas**: Denúncias feitas anonimamente
- **Críticas**: Casos classificados como severidade crítica

#### **Métricas de Performance:**
- **Taxa de Resolução**: Percentual de casos resolvidos vs. total
- **Conformidade SLA**: Percentual de casos dentro do prazo
- **Violações SLA**: Número de casos com prazo vencido

#### **Widgets Empresariais:**
- **Planos de Investigação**: Ativos, preliminares vs. completas
- **Evidências**: Total coletadas, digitais vs. documentos
- **Ações Corretivas**: Em andamento, implementadas, vencidas
- **Notificações Regulamentares**: Pendentes, SEC vs. outras agências

### 📊 **Gráficos e Análises**
- **Denúncias por Categoria**: Distribuição por tipo de violação
- **Denúncias por Severidade**: Classificação de criticidade com indicadores coloridos
- **Alertas de Compliance**: Status geral, capacidade investigativa, compliance regulatório

### 🎯 **Ações Rápidas**
- **Botão Regulatório**: Acesso direto às notificações regulamentares
- **Botão Investigações**: Acesso direto à gestão de investigações
- **Botão Exportar**: Geração de relatórios executivos

---

## 📋 2. ABA CASOS - Gestão de Denúncias

### 🔍 **Sistema de Filtros**

#### **Busca Textual:**
- **Campo de busca**: Protocolo, título ou descrição
- **Suporte a palavras-chave**: Busca inteligente em múltiplos campos

#### **Filtros Avançados:**
- **Status**: Todos, Aberto, Triagem, Investigando, Resolvido, Fechado
- **Severidade**: Baixa, Média, Alta, Crítica
- **Prioridade**: Baixa, Média, Alta, Crítica
- **Categoria**: Fraude, Assédio, Conflito de interesse, etc.
- **Período**: Data de criação (de/até)
- **Responsável**: Filtro por investigador atribuído

### 📄 **Cards de Casos**

Cada caso é exibido em um card expansível com:

#### **Informações do Header:**
- **Protocolo**: Número único de identificação (ex: ETH-2025-001)
- **Título**: Resumo do caso
- **Status**: Badge colorido com estado atual
- **Severidade**: Indicador de criticidade
- **Prioridade**: Nível de urgência
- **Dias**: Tempo desde criação e até vencimento

#### **Badges Traduzidos (Português):**
- **Status**: Aberto, Triagem, Investigando, Em Revisão, Resolvido, Fechado
- **Severidade**: Baixa, Média, Alta, Crítica  
- **Prioridade**: Baixa, Média, Alta, Crítica

#### **Hover Effects:**
- **Cor primária**: Destaque na cor do sistema
- **Animação suave**: Elevação e sombra
- **Transição**: Movimento fluido ao passar o mouse

### 📑 **Abas Expandidas (8 Abas por Caso)**

Quando um card é expandido, exibe 8 abas especializadas:

#### **1. 📋 Detalhes**
- Informações completas do caso
- Dados do denunciante
- Descrição detalhada
- Classificação de risco

#### **2. 🔍 Investigação** 
- Planos de investigação ativos
- Cronograma e orçamento
- Equipe investigativa
- Metodologia aplicada

#### **3. 🗂️ Evidências**
- Lista de evidências coletadas
- Chain of custody
- Status de preservação
- Proteções legais (legal hold/privilege)

#### **4. 🎯 Ações**
- Ações corretivas implementadas
- Progresso de execução
- Métricas de eficácia
- Cronograma de implementação

#### **5. 📋 Regulatório**
- Notificações obrigatórias
- Status de submissão
- Prazos regulamentares
- Follow-ups necessários

#### **6. ✅ Resolução**
- Status de resolução
- Medidas tomadas
- Lições aprendidas
- Prevenção de recorrência

#### **7. 📈 Timeline**
- Histórico cronológico completo
- Atividades realizadas
- Marcos importantes
- Responsáveis por cada ação

#### **8. ℹ️ Info** (Posicionada por último)
- Metadados técnicos
- Informações do sistema
- IDs e referências
- Dados de auditoria

---

## 🔍 3. ABA INVESTIGAÇÕES - Gestão de Planos Investigativos

### 🎯 **Tipos de Investigação Suportados**

#### **Preliminary (Preliminar):**
- Avaliação inicial de 5-10 dias
- Triagem de evidências básicas
- Determinação de necessidade de investigação completa

#### **Full (Completa):**
- Investigação abrangente de 30-60 dias
- Equipe interna especializada
- Coleta completa de evidências
- Entrevistas formais

#### **External (Externa):**
- Investigação conduzida por terceiros
- Casos de alta sensibilidade
- Expertise especializada necessária
- Independência e imparcialidade

#### **Legal:**
- Investigação com implicações legais
- Envolvimento de advogados
- Proteção de privilégio attorney-client
- Preparação para litígios

### 📋 **Informações do Plano**

#### **Dados Básicos:**
- **Tipo**: Classificação da investigação
- **Escopo**: Definição do que será investigado
- **Objetivos**: Metas específicas da investigação
- **Duração Estimada**: Prazo em dias
- **Datas**: Início planejado e conclusão esperada

#### **Recursos:**
- **Investigador Atribuído**: Responsável principal
- **Empresa Externa**: Se aplicável para investigações externas
- **Orçamento**: Valor alocado e consumido
- **Status**: Planejamento, Ativo, Concluído, Suspenso

#### **Metodologia:**
- **Abordagem**: Descrição da metodologia
- **Preservação de Evidências**: Plano de coleta e manutenção
- **Plano de Entrevistas**: Pessoas a serem ouvidas
- **Revisão Documental**: Documentos a serem analisados

### 🎛️ **Ações Disponíveis**
- **Criar Plano**: Novo plano de investigação
- **Editar**: Modificar plano existente
- **Iniciar**: Ativar investigação planejada
- **Suspender**: Pausar temporariamente
- **Concluir**: Finalizar investigação

---

## 🗂️ 4. ABA EVIDÊNCIAS - Gestão Forense Completa

### 📊 **Tipos de Evidência**

#### **Digital:**
- E-mails e comunicações eletrônicas
- Arquivos de computador
- Logs de sistema
- Dados de aplicativos

#### **Document:**
- Documentos físicos
- Contratos e acordos
- Relatórios impressos
- Formulários assinados

#### **Physical:**
- Objetos físicos
- Equipamentos
- Dispositivos de armazenamento
- Materiais tangíveis

#### **Testimony:**
- Depoimentos gravados
- Entrevistas transcritas
- Declarações testemunhais
- Relatos de testemunhas

### 🔒 **Proteções Legais**

#### **Legal Hold:**
- **Ativação automática**: Para casos com potencial legal
- **Preservação obrigatória**: Impede destruição
- **Rastreamento**: Controle de acesso e modificações
- **Liberação controlada**: Apenas com autorização legal

#### **Attorney-Client Privilege:**
- **Proteção de comunicações**: Entre cliente e advogado
- **Acesso restrito**: Apenas equipe legal autorizada
- **Marcação especial**: Identificação visual clara
- **Auditoria de acesso**: Log de quem acessou quando

#### **Work Product Privilege:**
- **Proteção de análises**: Preparação para litígio
- **Documentos de estratégia**: Planos legais internos
- **Comunicações preparatórias**: Entre equipe legal
- **Segregação**: Separação de outros tipos de evidência

### 📋 **Chain of Custody**

Sistema completo de rastreamento que registra:

#### **Dados de Coleta:**
- **Coletado por**: Identificação do responsável
- **Data/Hora**: Timestamp preciso da coleta
- **Local**: Onde a evidência foi obtida
- **Método**: Como foi coletada

#### **Cadeia de Custódia:**
- **Transferências**: Registro de cada mudança de custódia
- **Responsáveis**: Quem teve acesso em cada momento
- **Ações**: O que foi feito com a evidência
- **Localização**: Onde está armazenada

#### **Integridade:**
- **Hash SHA-256**: Verificação de integridade digital
- **Checksums**: Validação de não alteração
- **Assinaturas**: Confirmação de autenticidade
- **Timestamps**: Prova de quando foi coletada

### 🎛️ **Interface de Gestão**
- **Lista completa**: Todas as evidências do tenant
- **Filtros**: Por tipo, status, legal hold
- **Busca**: Por descrição ou metadados
- **Ações**: Visualizar, editar, transferir custódia

---

## 🎯 5. ABA AÇÕES - Ações Corretivas e Preventivas

### 📊 **Tipos de Ação**

#### **Policy Update (Atualização de Política):**
- Revisão e atualização de políticas existentes
- Criação de novas políticas
- Comunicação de mudanças
- Treinamento em novas diretrizes

#### **Training (Treinamento):**
- Capacitação específica para problemas identificados
- Treinamentos de conscientização
- Certificação de funcionários
- Avaliação de eficácia

#### **Disciplinary (Disciplinar):**
- Medidas disciplinares apropriadas
- Advertências formais
- Suspensões ou demissões
- Planos de desenvolvimento

#### **Process Improvement (Melhoria de Processo):**
- Otimização de processos existentes
- Implementação de controles
- Automação de verificações
- Revisão de workflows

#### **System Update (Atualização de Sistema):**
- Modificações em sistemas de TI
- Implementação de controles automáticos
- Patches de segurança
- Novas funcionalidades preventivas

### 📈 **Monitoramento de Progresso**

#### **Status Tracking:**
- **Planned**: Ação planejada mas não iniciada
- **In Progress**: Em execução
- **Completed**: Completada com sucesso
- **Delayed**: Atrasada em relação ao cronograma
- **Cancelled**: Cancelada por mudança de contexto

#### **Métricas de Eficácia:**
- **Progresso %**: Percentual de conclusão
- **Orçamento**: Planejado vs. realizado
- **Cronograma**: Datas de início e conclusão
- **Verificação**: Métodos de validação de eficácia

#### **Avaliação de Resultados:**
- **Rating de Eficácia**: Escala de 1-5
- **Lições Aprendidas**: Insights para o futuro
- **Recomendações**: Sugestões de melhoria
- **Prevenção**: Como evitar recorrência

### 🎛️ **Gestão Completa**
- **Criação**: Nova ação corretiva
- **Atribuição**: Responsável e prazo
- **Monitoramento**: Acompanhamento de progresso
- **Verificação**: Validação de implementação
- **Relatórios**: Status e eficácia

---

## 📋 6. ABA REGULATÓRIO - Notificações Automáticas

### 🏛️ **Órgãos Reguladores Suportados**

#### **SEC (Securities and Exchange Commission):**
- **Foco**: Violações de valores mobiliários
- **Prazo típico**: 4 dias
- **Urgência**: Alta
- **Método**: Electronic filing

#### **OSHA (Occupational Safety and Health Administration):**
- **Foco**: Segurança no trabalho
- **Prazo típico**: 1 dia (24 horas)
- **Urgência**: Alta
- **Método**: Portal online

#### **DOJ (Department of Justice):**
- **Foco**: Questões criminais, suborno, corrupção
- **Prazo típico**: 2 dias
- **Urgência**: Crítica
- **Método**: Carta formal

#### **FTC (Federal Trade Commission):**
- **Foco**: Proteção ao consumidor, concorrência
- **Prazo típico**: 10 dias
- **Urgência**: Média
- **Método**: E-mail/Portal

#### **CFTC (Commodity Futures Trading Commission):**
- **Foco**: Derivativos, commodities
- **Prazo típico**: 3 dias
- **Urgência**: Alta
- **Método**: Portal seguro

#### **EPA (Environmental Protection Agency):**
- **Foco**: Violações ambientais
- **Prazo típico**: 1 dia
- **Urgência**: Alta
- **Método**: Sistema online

### 📊 **Status de Notificações**

#### **Pending (Pendente):**
- Notificação identificada mas não preparada
- Aguardando coleta de informações
- Em análise pela equipe legal

#### **Prepared (Preparada):**
- Documentação completa
- Pronta para submissão
- Aprovação final pendente

#### **Submitted (Submetida):**
- Enviada ao órgão regulador
- Confirmação de recebimento obtida
- Aguardando resposta

#### **Acknowledged (Reconhecida):**
- Regulador confirmou recebimento
- Em análise pelo órgão
- Possível follow-up necessário

#### **Closed (Fechada):**
- Processo concluído
- Nenhuma ação adicional necessária
- Arquivada para referência

### ⚠️ **Alertas Automáticos**
- **Prazos vencendo**: Notificações com prazo próximo
- **Overdue**: Notificações em atraso
- **Follow-up**: Ações adicionais necessárias
- **Responses**: Respostas recebidas dos reguladores

### 🎛️ **Gestão de Notificações**
- **Criação automática**: Baseada em regras do caso
- **Preparação**: Templates e assistentes
- **Submissão**: Múltiplos métodos suportados
- **Rastreamento**: Acompanhamento completo

---

## 📧 7. ABA COMUNICAÇÕES - Sistema de Comunicação

### 📊 **Central de Métricas**

#### **E-mails Automáticos:**
- **Enviados (30 dias)**: Volume total de e-mails
- **Taxa de Entrega**: Percentual de sucesso (meta: >95%)
- **Falhas**: Números de entregas falhadas
- **Configurar Templates**: Acesso às configurações

#### **Notificações:**
- **Pendentes**: Notificações aguardando envio
- **Ativas Hoje**: Notificações processadas
- **Vencendo**: Alertas próximos do prazo
- **Ver Todas**: Acesso completo às notificações

#### **Canal de Denúncias:**
- **Acessos (Hoje)**: Visitantes no canal
- **Denúncias (Mês)**: Submissões recebidas
- **Taxa Conversão**: Visitas que geraram denúncias
- **Relatório**: Análises detalhadas

### 📝 **Templates de Comunicação**

#### **Confirmação de Recebimento:**
- **Uso**: Enviado automaticamente ao receber denúncia
- **Conteúdo**: Confirmação, protocolo, próximos passos
- **Frequência**: 100% das denúncias
- **Status**: Ativo

#### **Atualização de Status:**
- **Uso**: Mudanças importantes no caso
- **Conteúdo**: Status atual, ações tomadas, cronograma
- **Frequência**: A cada mudança significativa
- **Status**: Ativo

#### **Solicitação de Informações:**
- **Uso**: Quando informações adicionais são necessárias
- **Conteúdo**: Perguntas específicas, prazo de resposta
- **Frequência**: Conforme necessário
- **Status**: Ativo

#### **Encerramento de Caso:**
- **Uso**: Notificação de resolução final
- **Conteúdo**: Resultado, ações tomadas, agradecimentos
- **Frequência**: Casos resolvidos/fechados
- **Status**: Ativo

### 💬 **Comunicações Recentes**

Interface mostra histórico de comunicações com:
- **Status de entrega**: Entregue, Lida, Pendente
- **Timestamp**: Data e hora de envio
- **Tipo**: Template utilizado
- **Protocolo**: Caso relacionado
- **Ações**: Visualizar, reenviar

### 🎛️ **Gestão de Templates**
- **Customização**: Edição de conteúdo
- **Variáveis**: Campos dinâmicos (protocolo, nome, etc.)
- **Agendamento**: Envios automáticos
- **Métricas**: Taxa de abertura e resposta

---

## ⚙️ 8. ABA CONFIGURAÇÕES - Configuração Avançada

### 🎛️ **Configurações do Canal**

#### **Canal Anônimo:**
- **Status**: Ativo/Inativo
- **Função**: Permitir denúncias sem identificação
- **Impacto**: Aumenta volume de denúncias
- **Recomendação**: Manter sempre ativo

#### **Confirmação Automática:**
- **Status**: Ativo/Inativo  
- **Função**: Envio automático de confirmação de recebimento
- **Timing**: Dentro de 24 horas
- **Template**: Configurável

#### **Notificações SLA:**
- **Status**: Ativo/Inativo
- **Função**: Alertas automáticos de prazo
- **Frequência**: Diária para prazos próximos
- **Destinatários**: Gestores e investigadores

#### **Auditoria Detalhada:**
- **Status**: Ativo/Inativo
- **Função**: Log completo de todas as atividades
- **Armazenamento**: Dados sensíveis de auditoria
- **Retenção**: Configurável por política

### ⏱️ **Prazos e SLA**

#### **Confirmação de Recebimento:**
- **Opções**: 1h, 4h, 24h, 48h
- **Padrão**: 24 horas
- **Automação**: Envio automático de confirmação

#### **Início de Investigação:**
- **Opções**: 1, 3, 5, 10 dias úteis
- **Padrão**: 5 dias úteis
- **Trigger**: Atribuição de investigador

#### **Conclusão de Caso:**
- **Opções**: 15, 30, 45, 60 dias
- **Padrão**: 30 dias
- **Medição**: Da data de recebimento

#### **Alerta de Vencimento:**
- **Opções**: 1, 3, 7, 14 dias antes
- **Padrão**: 3 dias antes
- **Destinatários**: Responsáveis e gestores

### 🔌 **Integrações e Automações**

#### **E-mail SMTP:**
- **Status**: Conectado/Desconectado
- **Função**: Envio automático de e-mails
- **Configuração**: Servidor, porta, autenticação
- **Monitoramento**: Taxa de entrega

#### **Slack:**
- **Status**: Desconectado (Configurável)
- **Função**: Alertas em tempo real
- **Notificações**: Casos críticos, SLA
- **Canais**: Configuração por tipo de alerta

#### **SharePoint:**
- **Status**: Conectado
- **Função**: Armazenamento de evidências
- **Sincronização**: Automática
- **Segurança**: Controle de acesso

#### **SIEM (Security Information and Event Management):**
- **Status**: Desconectado (Configurável)
- **Função**: Logs de segurança
- **Eventos**: Acessos, modificações
- **Correlação**: Com outros sistemas de segurança

### 📊 **Ações do Sistema**

#### **Backup e Exportação:**
- **Exportar Casos (CSV)**: Dados estruturados
- **Backup Completo**: Sistema completo
- **Relatório Anual**: Compilação estatística

#### **Manutenção:**
- **Limpar Logs Antigos**: Otimização de performance
- **Reindexar Busca**: Melhoria de pesquisa
- **Verificar Integridade**: Validação de dados

#### **Segurança:**
- **Log de Auditoria**: Histórico completo de ações
- **Gestão de Acesso**: Controle de permissões
- **Alertas de Segurança**: Monitoramento de ameaças

---

## 🚀 GUIA DE CONFIGURAÇÃO INICIAL

### 1️⃣ **Primeiro Acesso**

#### **Configurações Básicas:**
1. Acesse a aba **Configurações**
2. Configure os **Prazos e SLA** conforme sua organização
3. Ative as **Configurações do Canal** necessárias
4. Configure **E-mail SMTP** para automação

#### **Templates de Comunicação:**
1. Vá para aba **Comunicações**
2. Revise e customize os templates padrão
3. Configure variáveis específicas da organização
4. Teste o envio de comunicações

### 2️⃣ **Configuração de Usuários**

#### **Permissões:**
- **Administrador**: Acesso completo a todas as funcionalidades
- **CISO**: Visão executiva e gestão de casos críticos
- **Investigador**: Gestão de investigações e evidências
- **Compliance**: Notificações regulamentares e relatórios
- **Risk Manager**: Análise de riscos e ações corretivas

#### **Atribuições:**
- Configure investigadores padrão para cada tipo de caso
- Defina responsáveis por órgãos reguladores específicos
- Estabeleça aprovadores para ações corretivas

### 3️⃣ **Integrações Externas**

#### **Sistemas Prioritários:**
1. **E-mail**: Essencial para automação de comunicações
2. **SharePoint**: Recomendado para evidências
3. **Slack**: Útil para alertas em tempo real
4. **SIEM**: Importante para auditoria de segurança

#### **Configuração Passo-a-Passo:**
1. Obtenha credenciais dos sistemas externos
2. Configure conexões na aba Configurações
3. Teste conectividade
4. Valide funcionamento com casos de teste

### 4️⃣ **Validação e Testes**

#### **Teste Completo:**
1. Crie um caso de teste
2. Execute uma investigação fictícia
3. Adicione evidências de exemplo
4. Configure ações corretivas
5. Teste notificações regulamentares
6. Valide comunicações automáticas

---

## 📚 BOAS PRÁTICAS

### 🔒 **Segurança e Compliance**

#### **Proteção de Dados:**
- Sempre marque evidências sensíveis com legal hold
- Use privilege protection quando apropriado
- Mantenha chain of custody rigoroso
- Configure retenção adequada de dados

#### **Compliance Regulatório:**
- Configure alertas automáticos para prazos
- Mantenha templates atualizados com regulamentações
- Estabeleça processo de aprovação legal
- Monitore mudanças regulamentares

### 📊 **Gestão Operacional**

#### **Workflow Eficiente:**
- Padronize templates de investigação
- Configure SLAs realistas mas desafiadores
- Use automação para tarefas repetitivas
- Monitore KPIs regularmente

#### **Comunicação Efetiva:**
- Mantenha comunicação frequente com denunciantes
- Use linguagem clara e profissional
- Configure follow-ups automáticos
- Documente todas as interações

### 📈 **Melhoria Contínua**

#### **Análise de Dados:**
- Monitore tendências no dashboard
- Analise eficácia das ações corretivas
- Identifique gargalos no processo
- Use dados para otimização

#### **Feedback e Ajustes:**
- Colete feedback dos usuários
- Ajuste templates conforme necessário
- Otimize workflows baseado na experiência
- Mantenha documentação atualizada

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### ❓ **Problemas Comuns**

#### **Dados Não Aparecem:**
1. Verifique permissões de usuário
2. Confirme filtros aplicados
3. Valide conectividade com banco de dados
4. Verifique configuração de tenant

#### **E-mails Não Enviados:**
1. Verifique configuração SMTP
2. Confirme credenciais de e-mail
3. Teste conectividade de rede
4. Valide templates de e-mail

#### **Performance Lenta:**
1. Execute limpeza de logs antigos
2. Reindexe sistema de busca
3. Verifique integridade dos dados
4. Otimize filtros de consulta

### 📞 **Suporte Técnico**

#### **Canais de Suporte:**
- **Documentação**: Este manual completo
- **Sistema de Tickets**: Para problemas técnicos
- **Treinamento**: Sessões de capacitação
- **Consultoria**: Para configurações complexas

#### **Informações para Suporte:**
- Versão do sistema
- Logs de erro específicos
- Passos para reproduzir problema
- Configurações atuais relevantes

---

## 📖 GLOSSÁRIO

### 📋 **Termos Técnicos**

- **Chain of Custody**: Rastreamento completo de evidências
- **Legal Hold**: Proteção legal contra destruição de evidências  
- **Attorney-Client Privilege**: Proteção de comunicações com advogados
- **SLA**: Service Level Agreement (Acordo de Nível de Serviço)
- **Tenant**: Organização/empresa no sistema multi-inquilino
- **SMTP**: Protocolo para envio de e-mails
- **Hash SHA-256**: Verificação de integridade de arquivos

### 🏛️ **Órgãos Reguladores**

- **SEC**: Securities and Exchange Commission
- **OSHA**: Occupational Safety and Health Administration  
- **DOJ**: Department of Justice
- **FTC**: Federal Trade Commission
- **CFTC**: Commodity Futures Trading Commission
- **EPA**: Environmental Protection Agency

---

*Este manual foi criado para garantir o uso eficiente e seguro do Módulo de Ética. Para sugestões de melhoria ou dúvidas, entre em contato com a equipe de suporte técnico.*

**Versão**: 1.0  
**Última Atualização**: Janeiro 2025  
**Autor**: Sistema GRC - Módulo de Ética