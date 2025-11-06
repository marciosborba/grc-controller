# 🛡️ Configuração da Tabela de Vulnerabilidades

## Problema Identificado
Os relatórios de vulnerabilidades estavam exibindo dados mock ao invés dos dados reais do banco de dados.

## Solução Implementada

### 1. Diagnóstico Automático
O sistema agora detecta automaticamente:
- ✅ Se a tabela de vulnerabilidades existe
- ✅ Se há dados na tabela
- ✅ Se há erros de carregamento
- ✅ Estado de carregamento dos dados

### 2. Alertas Visuais
A página de relatórios agora exibe alertas informativos:
- 🔴 **Tabela não encontrada**: Orienta para executar o script SQL
- 🔵 **Carregando dados**: Indica que os dados estão sendo carregados
- 🟡 **Sem dados**: Orienta para importar ou criar vulnerabilidades
- 🔴 **Erro**: Exibe mensagem de erro específica

### 3. Script SQL Completo
Criado arquivo `setup_vulnerabilities_complete.sql` que:
- ✅ Cria a tabela de vulnerabilidades com todos os campos necessários
- ✅ Configura índices para performance
- ✅ Habilita RLS (Row Level Security)
- ✅ Cria políticas de isolamento por tenant
- ✅ Popula com 12 vulnerabilidades de exemplo realistas
- ✅ Exibe estatísticas finais

## Como Configurar

### Passo 1: Executar o Script SQL
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `setup_vulnerabilities_complete.sql`
4. Execute o script
5. Verifique as mensagens de sucesso no console

### Passo 2: Verificar os Dados
1. Acesse a página de relatórios: `http://localhost:8080/vulnerabilities/reports`
2. Verifique se os alertas de erro desapareceram
3. Confirme se as métricas estão sendo exibidas corretamente
4. Teste a geração de relatórios

### Passo 3: Dados de Exemplo Criados
O script cria automaticamente:
- **3 vulnerabilidades críticas** (SQL Injection, IDOR, Sensitive Data Exposure)
- **4 vulnerabilidades altas** (XSS, Outdated Components, Broken Auth, XXE)
- **3 vulnerabilidades médias** (Insecure Storage, Weak Password, Insufficient Logging)
- **1 vulnerabilidade baixa resolvida** (Missing Headers)
- **1 vulnerabilidade informativa** (Information Disclosure)

### Estatísticas Esperadas
Após executar o script, você deve ver:
- **Total**: 12 vulnerabilidades
- **Críticas**: 3
- **Altas**: 4
- **Médias**: 3
- **Baixas**: 1
- **Info**: 1
- **SLA Compliance**: ~85%
- **MTTR**: Variável baseado nos dados

## Estrutura da Tabela

```sql
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    cvss_score DECIMAL(3,1),
    cve_id VARCHAR(50),
    asset_name VARCHAR(255) NOT NULL,
    asset_ip INET,
    source_tool VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    port INTEGER,
    protocol VARCHAR(20),
    first_found_date TIMESTAMP WITH TIME ZONE,
    last_found_date TIMESTAMP WITH TIME ZONE,
    solution TEXT,
    references TEXT[],
    assigned_to VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    sla_breach BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    exploit_available BOOLEAN DEFAULT FALSE,
    asset_type VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);
```

## Funcionalidades dos Relatórios

### Relatório Executivo
- 📊 Dashboard executivo de risco
- 💰 Análise de impacto financeiro
- 🎯 Análise por criticidade de negócio
- 🛡️ Status de compliance (LGPD, SOX)
- 🎯 Recomendações estratégicas
- 📅 Roadmap de priorização

### Relatório Técnico
- 🔧 Resumo técnico detalhado
- 📈 Distribuição por fonte/ferramenta
- 🚨 Lista de vulnerabilidades críticas
- 💻 Recomendações técnicas com comandos
- 🛠️ Procedimentos de remediação

### Relatório de SLA
- ⏱️ Performance de SLA por severidade
- 📊 Métricas de MTTR
- 🎯 Vulnerabilidades em atraso
- 📈 Recomendações de melhoria

## Troubleshooting

### Problema: "Tabela não encontrada"
**Solução**: Execute o script `setup_vulnerabilities_complete.sql`

### Problema: "Nenhuma vulnerabilidade encontrada"
**Soluções**:
1. Execute o script SQL para criar dados de exemplo
2. Importe vulnerabilidades via `/vulnerabilities/import`
3. Crie vulnerabilidades manualmente via `/vulnerabilities/create`

### Problema: "Erro ao carregar dados"
**Verificações**:
1. Confirme se o usuário tem permissões na tabela
2. Verifique se o RLS está configurado corretamente
3. Confirme se existe um tenant válido
4. Verifique logs do Supabase para erros específicos

### Problema: Dados não aparecem nos relatórios
**Verificações**:
1. Confirme se `tableExists === true`
2. Verifique se `vulnerabilities.length > 0`
3. Confirme se `metrics` está sendo carregado
4. Verifique console do navegador para logs de debug

## Logs de Debug

O sistema agora inclui logs detalhados:
```javascript
console.log('🔍 [VULNERABILITY REPORTS] Estado atual:', {
  vulnerabilities: vulnerabilities?.length || 0,
  metrics,
  loading,
  error,
  tableExists,
  timestamp: new Date().toISOString()
});
```

Monitore estes logs no console do navegador para diagnosticar problemas.

## Próximos Passos

1. ✅ Execute o script SQL
2. ✅ Verifique os dados na interface
3. ✅ Teste a geração de relatórios
4. ✅ Configure importação de dados reais (opcional)
5. ✅ Personalize os dados conforme necessário

## Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Confirme se o script SQL foi executado com sucesso
3. Verifique se há mensagens de erro no Supabase Dashboard
4. Teste com dados de exemplo primeiro antes de usar dados reais