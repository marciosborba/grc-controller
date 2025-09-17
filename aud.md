# MÓDULO DE AUDITORIA INTERNA - DOCUMENTAÇÃO TÉCNICA COMPLETA

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Integração com Matriz de Risco](#integração-com-matriz-de-risco)
6. [Segregação de Tenants](#segregação-de-tenants)
7. [Sistema de Usuários e Permissões](#sistema-de-usuários-e-permissões)
8. [Componentes React](#componentes-react)
9. [APIs e Integrações](#apis-e-integrações)
10. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

O **Módulo de Auditoria Interna** é um sistema abrangente de gestão de auditoria baseado em:

- **Motor de Assurance Dinâmico e Conectado**: Sistema orientado a objetos com capacidade de vinculação entre entidades
- **Arquitetura Multi-tenant**: Isolamento completo de dados por organização
- **Matriz de Risco Configurável**: Adaptação aos níveis de risco específicos de cada tenant
- **Workflow Completo**: Desde planejamento até follow-up de recomendações
- **Trilha de Auditoria Imutável**: Log blockchain-style de todas as operações

### Objetivos do Sistema
- Automatizar o ciclo completo de auditoria interna
- Fornecer visibilidade em tempo real do status das auditorias
- Integrar riscos, controles e testes em um motor único
- Gerar relatórios automatizados e dashboards executivos
- Garantir compliance e rastreabilidade completa

---

## 🏗️ Arquitetura do Sistema

### Princípios Arquiteturais

1. **Orientação a Objetos Reutilizáveis**
   - Riscos, Controles e Testes como objetos independentes
   - Motor de vinculação (linking engine) conecta objetos
   - Reutilização de procedimentos entre auditorias

2. **Segregação Multi-tenant**
   - Isolamento total de dados por organização
   - Configurações específicas por tenant
   - Políticas RLS (Row Level Security) automáticas

3. **Motor de Assurance Conectado**
   - Relacionamentos dinâmicos entre entidades
   - Rastreabilidade end-to-end
   - Análise de impacto automatizada

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- TanStack Query (estado)
- React Router DOM

**Backend:**
- Supabase (PostgreSQL + Auth + Edge Functions)
- Row Level Security (RLS)
- Triggers e Functions automáticas

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **universo_auditavel**
Entidades que podem ser auditadas (processos, subsidiárias, sistemas)

```sql
-- Campos principais
id, tenant_id, codigo, nome, descricao, tipo, nivel, universo_pai
responsavel_id, criticidade, frequencia_auditoria, ultima_auditoria
proxima_auditoria, status, metadados

-- Tipos suportados
'processo', 'subsidiaria', 'sistema', 'departamento', 'outro'

-- Níveis de criticidade
'baixa', 'media', 'alta', 'critica'
```

#### 2. **riscos_auditoria**
Objetos de risco reutilizáveis com matriz de risco

```sql
-- Matriz de Risco Automática
impacto INTEGER (1-5)
probabilidade INTEGER (1-5)
risco_inerente = impacto * probabilidade (calculado)
risco_residual = impacto_residual * probabilidade_residual (calculado)

-- Gestão de Apetite
tolerancia ('baixa', 'media', 'alta')
apetite INTEGER (1-25)
```

#### 3. **controles_auditoria**
Controles internos vinculados a riscos

```sql
-- Classificação
tipo: 'preventivo', 'detectivo', 'corretivo'
natureza: 'manual', 'automatico', 'semi_automatico'
frequencia: 'continuo', 'diario', 'semanal', 'mensal', 'trimestral', 'anual'

-- Avaliação
design_adequado BOOLEAN
opera_efetivamente BOOLEAN
```

#### 4. **projetos_auditoria**
Container para execuções de auditoria

```sql
-- Status e Fases
status: 'planejamento', 'em_execucao', 'em_revisao', 'concluido', 'cancelado'
fase_atual: 'planejamento', 'fieldwork', 'relatorio', 'followup'

-- Resultados
rating_geral: 'eficaz', 'parcialmente_eficaz', 'ineficaz'
total_apontamentos, apontamentos_criticos, apontamentos_altos
```

#### 5. **trabalhos_auditoria**
Trabalhos específicos dentro dos planos anuais

```sql
-- Tipos de Auditoria
'compliance', 'operational', 'financial', 'it', 'investigative', 'follow_up'

-- Recursos e Orçamento
auditor_lider, equipe_auditores, horas_planejadas, orcamento_estimado
```

#### 6. **execucoes_teste** → **apontamentos** → **planos_acao**
Fluxo completo de teste → finding → remediation

### Motor de Vinculação

#### **audit_object_links**
Sistema de relacionamentos dinâmicos entre objetos

```sql
-- Tipos de Relacionamento
'risco_universo', 'controle_risco', 'teste_controle', 'projeto_universo'

-- Propriedades Flexíveis
properties JSONB
strength DECIMAL(3,2) -- Força da ligação (0.0 a 1.0)
```

### Trilha de Auditoria Imutável

#### **audit_trail**
Log blockchain-style de todas as alterações

```sql
-- Operações Rastreadas
operation: 'CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK'

-- Integridade
hash_previous, hash_current -- Para futuro blockchain
```

---

## ⚙️ Funcionalidades Implementadas

### 1. **Dashboard Principal** (`AuditoriasDashboard.tsx`)

**Métricas em Tempo Real:**
- Total de processos auditáveis
- Processos de alto risco
- Auditorias concluídas
- Projetos em andamento
- Percentual de cobertura

**Módulos Integrados:**
- Planejamento Estratégico
- Gestão de Projetos
- Papéis de Trabalho
- Central de Relatórios

**Heatmap de Riscos:**
- Integração com matriz de risco da tenant
- Distribuição visual de processos por nível de risco
- Responsivo e configurável

### 2. **Universo Auditável** (`UniversoAuditavel.tsx`)

**Gestão Completa:**
- CRUD de entidades auditáveis
- Hierarquia de processos (pai/filho)
- Classificação de criticidade
- Frequência de auditoria
- Metadados flexíveis

**Recursos Avançados:**
- Busca e filtros avançados
- Exportação de dados
- Visualização em cards responsivos
- Integração com matriz de risco

### 3. **Projetos de Auditoria** (`ProjetosAuditoria.tsx`)

**Ciclo Completo:**
- Planejamento de projetos
- Gestão de equipes
- Acompanhamento de progresso
- Controle de orçamento
- Status tracking

**Status Suportados:**
- Planejamento → Em Execução → Em Revisão → Concluído

### 4. **Papéis de Trabalho** (`PapeisTrabalhoCompleto.tsx`)

**Documentação Digital:**
- Templates de procedimentos
- Upload de evidências
- Controle de versões
- Assinatura digital
- Arquivamento automático

### 5. **Central de Relatórios**

**Tipos de Relatórios:**
- Resumo do Universo Auditável
- Status dos Projetos de Auditoria
- Relatório de Avaliação de Riscos
- Conformidade do Plano de Auditoria
- Resumo dos Papéis de Trabalho
- Dashboard Executivo

**Formatos Suportados:**
- PDF, Excel, CSV, PNG
- Envio por email
- Impressão direta

### 6. **Planejamento Estratégico**

**Integração Completa:**
- Planos anuais de auditoria
- Trabalhos específicos
- Cronograma detalhado
- Orçamento e recursos
- Matriz de riscos do planejamento

---

## 📊 Integração com Matriz de Risco

### Sistema Flexível por Tenant

O módulo de auditoria integra-se completamente com a **matriz de risco configurável** de cada tenant:

```typescript
// Função de mapeamento dinâmico
const mapRiskLevel = (numericLevel: number): string => {
  const matrixType = tenantSettings?.risk_matrix?.type || '5x5';
  
  // Configuração personalizada da tenant
  if (tenantSettings?.risk_matrix?.risk_levels_custom) {
    const customLevels = tenantSettings.risk_matrix.risk_levels_custom
      .sort((a, b) => a.value - b.value);
    return customLevels[numericLevel - 1]?.name || 'Baixo';
  }
  
  // Matrizes padrão: 3x3, 4x4, 5x5
  switch (matrixType) {
    case '3x3': return ['Baixo', 'Médio', 'Alto'][numericLevel - 1];
    case '4x4': return ['Baixo', 'Médio', 'Alto', 'Crítico'][numericLevel - 1];
    case '5x5': return ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'][numericLevel - 1];
  }
};
```

### Aplicações da Matriz

1. **Classificação de Riscos de Auditoria**
2. **Priorização de Trabalhos**
3. **Avaliação de Controles**
4. **Níveis de Criticidade de Apontamentos**
5. **Dashboards e Relatórios**

---

## 🏢 Segregação de Tenants

### Implementação Multi-tenant

**Row Level Security (RLS):**
```sql
-- Política aplicada em todas as tabelas
CREATE POLICY audit_tenant_policy ON {table_name}
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));
```

**Isolamento Garantido:**
- Dados completamente isolados por tenant
- Configurações específicas por organização
- Usuários não veem dados de outros tenants
- Backup e restore independentes

### Usuário Super Admin

**Capacidades Especiais:**
```typescript
const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
```

- Acesso cross-tenant para administração
- Seletor de tenant no header
- Visibilidade total para suporte
- Auditoria de ações administrativas

---

## 👥 Sistema de Usuários e Permissões

### Roles Específicas de Auditoria

1. **Auditor Líder**
   - Gestão completa de projetos
   - Aprovação de procedimentos
   - Emissão de relatórios

2. **Auditor Sênior**
   - Execução de testes
   - Elaboração de apontamentos
   - Supervisão de juniores

3. **Auditor Júnior**
   - Execução de procedimentos
   - Coleta de evidências
   - Documentação de papéis

4. **Auditado (Processo Owner)**
   - Fornecimento de informações
   - Upload de evidências
   - Acompanhamento de ações

### Controle de Acesso

```typescript
// Verificação de permissões por contexto
const canEditProject = (project: AuditProject, user: User) => {
  return user.role === 'auditor_lider' || 
         project.chefe_auditoria === user.id ||
         user.isPlatformAdmin;
};
```

---

## 🎨 Componentes React

### Estrutura de Arquivos

```
src/components/auditorias/
├── AuditoriasDashboard.tsx          # Dashboard principal
├── UniversoAuditavel.tsx            # Gestão do universo auditável
├── ProjetosAuditoria.tsx            # Gestão de projetos
├── PapeisTrabalhoCompleto.tsx       # Papéis de trabalho
├── PlanejamentoAuditoria.tsx        # Planejamento
├── RelatoriosAuditoria.tsx          # Central de relatórios
└── PlanejamentoAnualAuditoria.tsx   # Planos anuais

src/components/planejamento/
├── PlanejamentoEstrategicoDashboard.tsx
├── PlanejamentoAuditoriaCompleto.tsx
├── PlanejamentoAuditoriaSimplificado.tsx
└── PlanejamentoAuditoriaDashboard.tsx
```

### Padrões de Desenvolvimento

**Hooks Customizados:**
```typescript
const { tenantSettings } = useTenantSettings();
const { user } = useAuth();
const selectedTenantId = useCurrentTenantId();
```

**Estado e Cache:**
- TanStack Query para cache inteligente
- React Context para estado global
- Local state para formulários

**Responsividade:**
```typescript
// Grid responsivo com breakpoints customizados
<div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
```

---

## 🔌 APIs e Integrações

### Supabase Client

```typescript
// Queries tipadas com RLS automático
const { data: projectsData } = await supabase
  .from('projetos_auditoria')
  .select('*')
  .eq('tenant_id', effectiveTenantId)
  .order('data_inicio', { ascending: false });
```

### Funções RPC

```sql
-- Cálculo de progresso automatizado
CREATE FUNCTION calculate_audit_progress(project_id UUID)
RETURNS DECIMAL AS $$
-- Lógica de cálculo baseada em fases e procedimentos
$$;
```

### Real-time Subscriptions

```typescript
// Atualizações em tempo real
useEffect(() => {
  const subscription = supabase
    .channel('audit_updates')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projetos_auditoria' },
        (payload) => {
          // Atualizar estado local
        })
    .subscribe();
}, []);
```

---

## 🚀 Próximos Passos

### 1. **Integração com Sistema de Notificações**

**Funcionalidades Pendentes:**
- [ ] Notificações em tempo real para atualizações de projetos
- [ ] Alertas de prazos vencidos
- [ ] Notificação de novos apontamentos
- [ ] Lembrete de follow-up de recomendações
- [ ] Escalation automático para gestores

**Implementação:**
```typescript
// Hook para notificações de auditoria
const useAuditNotifications = () => {
  // Integração com sistema de notificações geral
  // WebSocket ou Server-Sent Events
  // Push notifications para mobile
};
```

### 2. **Integração com Módulo de Planos de Ação**

**Funcionalidades Pendentes:**
- [ ] Criação automática de planos de ação a partir de apontamentos
- [ ] Workflow de aprovação de ações corretivas
- [ ] Acompanhamento de progresso das ações
- [ ] Alertas de vencimento de prazos
- [ ] Avaliação de efetividade das ações

**Tabelas Relacionadas:**
- `planos_acao` (já existe na estrutura)
- Integração com `apontamentos`
- Workflow engine para aprovações

### 3. **Módulo de Relatórios Avançados**

**Funcionalidades Pendentes:**
- [ ] Builder de relatórios customizados
- [ ] Templates de relatório por indústria
- [ ] Agendamento automático de relatórios
- [ ] Distribuição automática por email
- [ ] Relatórios de tendências e analytics

### 4. **Inteligência Artificial e Analytics**

**Funcionalidades Pendentes:**
- [ ] Análise preditiva de riscos
- [ ] Recomendação automática de procedimentos
- [ ] Detecção de anomalias em dados
- [ ] Clustering de riscos similares
- [ ] Natural Language Processing para relatórios

### 5. **Módulo de Compliance Integrado**

**Funcionalidades Pendentes:**
- [ ] Mapeamento de controles para frameworks (SOX, COSO, ISO)
- [ ] Compliance dashboard por framework
- [ ] Auditoria de compliance automatizada
- [ ] Relatórios regulatórios pré-configurados

### 6. **Mobile App e Offline Support**

**Funcionalidades Pendentes:**
- [ ] App React Native para auditores de campo
- [ ] Sincronização offline de dados
- [ ] Captura de fotos e evidências mobile
- [ ] Geolocalização para auditorias presenciais

### 7. **Integração com ERPs Externos**

**Funcionalidades Pendentes:**
- [ ] Conectores para SAP, Oracle, Protheus
- [ ] Importação automática de dados transacionais
- [ ] Reconciliação automática de documentos
- [ ] APIs para sistemas legados

### 8. **Segurança e Compliance Avançados**

**Funcionalidades Pendentes:**
- [ ] Assinatura digital de relatórios
- [ ] Blockchain para trilha imutável
- [ ] Criptografia end-to-end
- [ ] Certificação ISO 27001

---

## 📚 Documentação Adicional

### Arquivos de Referência

- `CLAUDE.md` - Instruções gerais do projeto
- `docs/ROLES_SISTEMA.md` - Sistema de roles detalhado
- `docs/USER_MANAGEMENT_SYSTEM.md` - Gestão de usuários
- `supabase/migrations/` - Histórico de migrações do banco

### Scripts Úteis

```bash
# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run build                 # Build de produção
npm run lint                  # Verificação de código

# Banco de dados
npm run check-user-management  # Validação do sistema de usuários
```

---

## 🏷️ Tags e Metadados

**Tecnologias:** React, TypeScript, Supabase, PostgreSQL, Tailwind CSS
**Módulos:** Auditoria, GRC, Compliance, Risk Management
**Status:** Em desenvolvimento ativo
**Versão:** 1.0.0
**Última atualização:** Setembro 2025

---

*Este documento é mantido sincronizado com o código e deve ser atualizado a cada nova implementação significativa.*