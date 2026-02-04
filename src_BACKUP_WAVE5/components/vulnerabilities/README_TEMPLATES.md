# Sistema de Templates de Classificação de Vulnerabilidades

## Visão Geral

O sistema de templates de classificação permite criar regras automáticas para classificar vulnerabilidades baseadas em três critérios principais:

1. **Criticidade** - CVSS 3.1/4.0, classificação de ferramentas, etc.
2. **Ativo** - EOL, Internet facing, EDR, etc.
3. **Aplicação** - Nível de criticidade ao negócio, LGPD, SOX, etc.

## Funcionalidades Principais

### 1. Templates Pré-configurados

O sistema inclui templates prontos para diferentes classes de vulnerabilidades:

- **Infraestrutura** - Vulnerabilidades críticas em servidores e dispositivos de rede
- **Aplicação Web** - Vulnerabilidades em aplicações que processam dados sensíveis
- **Banco de Dados** - Vulnerabilidades em sistemas de banco de dados legados
- **Rede** - Vulnerabilidades em dispositivos de rede
- **Sistema Operacional** - Vulnerabilidades em SOs
- **Aplicação Mobile** - Vulnerabilidades em apps móveis
- **Serviço em Nuvem** - Vulnerabilidades em serviços cloud
- **API** - Vulnerabilidades em APIs
- **Dispositivo IoT** - Vulnerabilidades em dispositivos IoT
- **Terceiros** - Vulnerabilidades em componentes de terceiros

### 2. Critérios de Classificação

#### Criticidade
- **Versão CVSS**: 3.1 ou 4.0
- **Faixa de Score CVSS**: Mínimo e máximo
- **Níveis de Severidade**: Critical, High, Medium, Low, Info
- **Fonte de Classificação**: CVSS, Ferramenta, Manual, Padrão da Indústria
- **Exploit Disponível**: Sim/Não
- **Patch Disponível**: Sim/Não
- **Divulgação Pública**: Sim/Não
- **Idade Máxima**: Dias desde a descoberta

#### Ativo
- **Status do Ativo**: EOL, Suportado, Legado, Atual
- **Nível de Exposição**: Internet, Interno, DMZ, Isolado
- **Controles de Segurança**: EDR, WAF, IPS, Firewall, Antivírus, SIEM
- **Tipos de Ativo**: Web App, Mobile, API, Database, Server, etc.
- **Segmento de Rede**: Configurável
- **Sistema Operacional**: Configurável
- **Nível de Patch**: Atual, Desatualizado, Crítico
- **Status de Backup**: Protegido, Parcial, Nenhum

#### Aplicação
- **Criticidade do Negócio**: Crítico, Alto, Médio, Baixo
- **Frameworks de Compliance**: LGPD, SOX, PCI DSS, HIPAA, ISO 27001, NIST, CIS
- **Classificação de Dados**: Público, Interno, Confidencial, Restrito
- **Tamanho da Base de Usuários**: Pequeno, Médio, Grande, Enterprise
- **Impacto na Receita**: Nenhum, Baixo, Médio, Alto, Crítico
- **Voltado ao Cliente**: Sim/Não
- **Processa PII**: Sim/Não
- **Dados Financeiros**: Sim/Não
- **Requisitos Regulatórios**: Configurável

### 3. Ações Automáticas

Quando os critérios são atendidos, o template pode executar:

- **Definir Prioridade**: Critical, High, Medium, Low
- **Definir SLA**: Horas para resolução
- **Atribuir à Equipe**: Equipe responsável
- **Adicionar Tags**: Tags automáticas
- **Definir Impacto no Negócio**: Nível de impacto
- **Requer Aprovação**: Sim/Não
- **Escalar Para**: Pessoa/cargo para escalação
- **Canais de Notificação**: Email, Slack, SMS

### 4. Análise e Recomendações

Cada template pode incluir:

- **Template de Análise**: Texto automático para análise da vulnerabilidade
- **Template de Recomendação**: Texto automático para recomendações de remediação

## Como Usar

### 1. Acessar Templates

1. Navegue para `/vulnerabilities/classification`
2. Clique na aba "Templates"

### 2. Criar Novo Template

1. Clique em "Novo Template"
2. Preencha as informações básicas:
   - Nome do template
   - Descrição
   - Classe de vulnerabilidade
   - Prioridade (1-4)
   - Status (Ativo/Inativo)

3. Configure os critérios nas três abas:
   - **Criticidade**: Configure CVSS, severidade, exploits, etc.
   - **Ativo**: Configure status, exposição, controles de segurança
   - **Aplicação**: Configure criticidade do negócio, compliance, dados

4. Configure as ações que serão executadas
5. Adicione templates de análise e recomendação
6. Salve o template

### 3. Editar Template Existente

1. Clique no ícone de edição no card do template
2. Modifique os critérios conforme necessário
3. Salve as alterações

### 4. Ativar/Desativar Template

- Use o switch no card do template
- **Importante**: Apenas um template pode estar ativo por classe de vulnerabilidade

### 5. Testar Template

1. Clique no ícone de play no card do template
2. Visualize como o template seria aplicado em vulnerabilidades de exemplo
3. Verifique se os critérios estão corretos

## Regras Importantes

### 1. Uma Regra por Classe
- Cada classe de vulnerabilidade pode ter apenas um template ativo
- Ao ativar um template, outros da mesma classe devem ser desativados primeiro

### 2. Prioridade de Execução
- Templates com prioridade 1 são executados primeiro
- Em caso de empate, o mais recente é executado

### 3. Validação de Critérios
- Pelo menos um critério deve ser configurado
- Critérios vazios são ignorados na avaliação

## Exemplos de Templates

### Template: Vulnerabilidades Críticas de Infraestrutura

**Critérios:**
- Criticidade: CVSS 3.1, Score 7.0-10.0, Severidade Critical/High, Exploit disponível
- Ativo: Status Atual/Suportado, Exposição Internet/DMZ, Controles Firewall/IPS
- Aplicação: Criticidade Critical/High, Compliance SOX/ISO27001, Voltado ao cliente

**Ações:**
- Prioridade: Critical
- SLA: 4 horas
- Equipe: Security Team
- Tags: critical-infra, internet-facing
- Requer aprovação: Sim
- Escalar para: CISO

### Template: Aplicações Web com Dados Sensíveis

**Critérios:**
- Criticidade: CVSS 4.0, Score 6.0-10.0, Severidade Critical/High/Medium
- Ativo: Exposição Internet, Controles WAF/EDR, Tipo Web Application
- Aplicação: Criticidade Critical/High, Compliance LGPD/PCI DSS, Processa PII/Dados Financeiros

**Ações:**
- Prioridade: High
- SLA: 8 horas
- Equipe: Application Security
- Tags: web-app, pii, lgpd
- Requer aprovação: Não

## Métricas e Monitoramento

O sistema fornece métricas sobre:

- Total de templates configurados
- Templates ativos por classe
- Número de execuções
- Taxa de sucesso
- Tempo médio de execução
- Template mais utilizado
- Histórico de execuções

## Integração com Workflow

Os templates se integram automaticamente com:

1. **Importação de Vulnerabilidades**: Aplicados durante a importação
2. **Criação Manual**: Aplicados ao criar vulnerabilidades manualmente
3. **Atualização**: Reaplicados quando vulnerabilidades são atualizadas
4. **Relatórios**: Métricas incluídas nos relatórios de vulnerabilidades

## Troubleshooting

### Template não está sendo executado
1. Verifique se está ativo
2. Confirme se não há outro template ativo para a mesma classe
3. Verifique se os critérios estão corretos
4. Teste o template com dados de exemplo

### Múltiplos templates ativos
- Sistema permite apenas um template ativo por classe
- Desative outros templates da mesma classe

### Critérios muito restritivos
- Use a função de teste para verificar se vulnerabilidades correspondem
- Ajuste os critérios conforme necessário

### Performance lenta
- Simplifique critérios complexos
- Monitore métricas de tempo de execução
- Considere dividir templates muito complexos