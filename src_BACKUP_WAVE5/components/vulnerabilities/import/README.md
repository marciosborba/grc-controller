# Sistema Avançado de Importação de Vulnerabilidades

## 📋 Visão Geral

Este sistema permite a importação de vulnerabilidades de diversas ferramentas de segurança através de arquivos ou APIs, com mapeamento flexível de campos e processamento em background.

## 🚀 Funcionalidades

### ✅ Fontes de Dados Suportadas

#### 🛡️ Scanners de Vulnerabilidade
- **Nessus** (Tenable)
  - Arquivo: `.nessus` (XML)
  - API: REST API v2
  - Autenticação: API Key + Secret Key
  - Documentação: [Nessus API](https://docs.tenable.com/nessus/Content/NessusRESTAPI.htm)

- **Qualys VMDR**
  - Arquivo: XML/CSV
  - API: REST API v2.0
  - Autenticação: Basic Auth
  - Documentação: [Qualys API](https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf)

- **OpenVAS/Greenbone**
  - Arquivo: XML (GMP format)
  - Documentação: [Greenbone Docs](https://docs.greenbone.net/)

- **Rapid7 Nexpose/InsightVM**
  - API: REST API v3
  - Autenticação: Basic Auth
  - Documentação: [Rapid7 API](https://help.rapid7.com/insightvm/en-us/api/)

#### 🐛 Ferramentas DAST
- **Burp Suite**
  - Arquivo: XML
  - Documentação: [Burp Docs](https://portswigger.net/burp/documentation)

- **OWASP ZAP**
  - Arquivo: XML/JSON
  - API: REST API
  - Autenticação: API Key
  - Documentação: [ZAP API](https://www.zaproxy.org/docs/api/)

#### 💻 Ferramentas SAST
- **SonarQube**
  - API: Web API
  - Autenticação: Token
  - Documentação: [SonarQube API](https://docs.sonarqube.org/latest/extend/web-api/)

- **Checkmarx**
  - API: REST API
  - Autenticação: OAuth
  - Documentação: [Checkmarx API](https://checkmarx.atlassian.net/wiki/spaces/KC/pages/914096139/CxSAST+REST+API)

- **Veracode**
  - API: REST API
  - Autenticação: API Key
  - Documentação: [Veracode API](https://docs.veracode.com/r/c_rest_api)

#### ☁️ Segurança em Nuvem
- **AWS Inspector**
  - API: AWS API
  - Autenticação: AWS Credentials
  - Documentação: [AWS Inspector API](https://docs.aws.amazon.com/inspector/latest/APIReference/)

- **Microsoft Defender for Cloud**
  - API: REST API
  - Autenticação: OAuth
  - Documentação: [Azure Security API](https://docs.microsoft.com/en-us/rest/api/securitycenter/)

- **GCP Security Command Center**
  - API: REST API
  - Autenticação: OAuth
  - Documentação: [GCP Security API](https://cloud.google.com/security-command-center/docs/reference/rest)

- **Orca Security**
  - API: REST API
  - Autenticação: API Key
  - Documentação: [Orca Security API](https://docs.orcasecurity.io/docs/api-reference)

#### 📄 Formatos Genéricos
- **CSV** - Formato de valores separados por vírgula
- **JSON** - JavaScript Object Notation
- **XML** - Extensible Markup Language
- **API Genérica** - Qualquer API REST personalizada

## 🏗️ Arquitetura

### Componentes Principais

```
src/components/vulnerabilities/import/
├── VulnerabilityImportDropdown.tsx    # Dropdown principal
├── ImportSourceSelector.tsx           # Seletor de fonte
├── FieldMappingInterface.tsx          # Interface de mapeamento
├── ImportPreview.tsx                  # Preview dos dados
├── ConnectionTester.tsx               # Teste de conectividade
├── ImportHistory.tsx                  # Histórico de importações
├── connectors/                        # Conectores por ferramenta
│   ├── NessusConnector.ts
│   ├── QualysConnector.ts
│   └── GenericAPIConnector.ts
├── parsers/                           # Parsers de arquivo
│   ├── NessusParser.ts
│   ├── QualysParser.ts
│   └── CSVParser.ts
└── types/
    └── import.ts                      # Tipos TypeScript
```

### Serviços

```
src/services/
└── VulnerabilityImportService.ts      # Serviço principal
```

### Banco de Dados

```sql
-- Tabelas principais
import_configurations    # Configurações salvas
import_jobs             # Jobs de importação
field_mappings          # Mapeamentos de campos
integration_credentials # Credenciais criptografadas
import_logs            # Logs detalhados
```

## 🔧 Como Usar

### 1. Importação por Arquivo

1. Clique no dropdown "Importar" na lista de vulnerabilidades
2. Selecione a ferramenta de origem (ex: "Nessus (.nessus)")
3. Faça upload do arquivo
4. Configure o mapeamento de campos
5. Inicie a importação

### 2. Importação por API

1. Clique no dropdown "Importar"
2. Selecione a opção de API (ex: "Nessus API")
3. Configure a conexão:
   - URL da API
   - Credenciais de autenticação
   - Parâmetros adicionais
4. Teste a conexão
5. Configure o mapeamento de campos
6. Inicie a importação

### 3. Mapeamento de Campos

O sistema permite mapear campos da fonte para os campos de destino:

#### Campos Obrigatórios
- **Título**: Nome da vulnerabilidade
- **Descrição**: Descrição detalhada
- **Severidade**: Nível de criticidade
- **Nome do Ativo**: Identificação do ativo
- **Ferramenta de Origem**: Nome da ferramenta

#### Campos Opcionais
- **CVSS Score**: Pontuação CVSS
- **CVE ID**: Identificador CVE
- **CWE ID**: Identificador CWE
- **IP do Ativo**: Endereço IP
- **Porta**: Porta do serviço
- **Protocolo**: Protocolo utilizado
- **Solução**: Passos de remediação

## 🔐 Segurança

### Autenticação
- **API Keys**: Armazenadas criptografadas
- **Tokens**: Criptografia AES-256
- **Senhas**: Hash bcrypt
- **OAuth**: Tokens de acesso seguros

### Validação
- Validação de entrada rigorosa
- Sanitização de dados
- Verificação de tipos
- Limites de tamanho de arquivo

### Auditoria
- Log completo de todas as operações
- Rastreamento de alterações
- Histórico de importações
- Monitoramento de erros

## 📊 Monitoramento

### Métricas Disponíveis
- Total de jobs executados
- Taxa de sucesso/falha
- Tempo médio de processamento
- Vulnerabilidades importadas
- Erros por categoria

### Logs
- Logs detalhados por job
- Categorização por nível (INFO, WARN, ERROR)
- Rastreamento de progresso
- Detalhes de erros

## 🛠️ Configuração

### Variáveis de Ambiente
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Limites de importação
VITE_MAX_FILE_SIZE=100MB
VITE_MAX_RECORDS_PER_IMPORT=10000
VITE_IMPORT_TIMEOUT=300000
```

### Configuração do Banco
Execute o script SQL para criar as tabelas:
```bash
psql -f create-import-tables.sql
```

## 🔄 Fluxo de Importação

1. **Seleção da Fonte**: Usuário escolhe ferramenta/formato
2. **Configuração**: Define conexão ou faz upload
3. **Teste**: Valida conectividade (APIs)
4. **Preview**: Mostra amostra dos dados
5. **Mapeamento**: Configura campos
6. **Validação**: Verifica dados
7. **Importação**: Processa em background
8. **Resultado**: Exibe estatísticas e logs

## 🚨 Tratamento de Erros

### Tipos de Erro
- **Conectividade**: Falha na conexão com API
- **Autenticação**: Credenciais inválidas
- **Parsing**: Erro no formato do arquivo
- **Validação**: Dados inválidos
- **Banco**: Erro na inserção

### Recuperação
- Retry automático para erros temporários
- Continuação de onde parou
- Rollback em caso de falha crítica
- Notificação de erros

## 📈 Performance

### Otimizações
- Processamento em lotes
- Inserção bulk no banco
- Cache de configurações
- Compressão de dados

### Limites
- Máximo 100MB por arquivo
- Máximo 10.000 registros por importação
- Timeout de 5 minutos por job
- Máximo 5 jobs simultâneos

## 🧪 Testes

### Teste de Conectividade
```typescript
const result = await testNessusConnection({
  api_url: 'https://nessus.example.com',
  api_key: 'your_api_key',
  password: 'your_secret_key'
});
```

### Teste de Parser
```typescript
const vulnerabilities = parseNessusFile(xmlContent);
console.log(`Parsed ${vulnerabilities.length} vulnerabilities`);
```

## 📚 Exemplos

### Configuração Nessus API
```json
{
  "api_url": "https://nessus.company.com:8834",
  "api_key": "your_access_key",
  "password": "your_secret_key"
}
```

### Configuração Qualys API
```json
{
  "api_url": "https://qualysapi.qualys.com",
  "username": "your_username",
  "password": "your_password"
}
```

### Configuração Orca Security API
```json
{
  "api_url": "https://api.orcasecurity.io",
  "api_key": "your_api_key"
}
```

### Mapeamento CSV Personalizado
```json
{
  "title": "vulnerability_name",
  "description": "description",
  "severity": "risk_level",
  "asset_name": "hostname",
  "asset_ip": "ip_address"
}
```

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Agendamento de importações
- [ ] Webhooks para notificações
- [ ] Importação incremental
- [ ] Deduplicação avançada
- [ ] Templates de mapeamento
- [ ] Exportação de configurações
- [ ] API para integração externa
- [ ] Dashboard de métricas

### Novas Integrações
- [ ] Acunetix
- [ ] Invicti (Netsparker)
- [ ] Fortify
- [ ] AppScan
- [ ] WhiteSource
- [ ] Snyk
- [ ] GitLab Security
- [ ] GitHub Security

## 🤝 Contribuição

Para adicionar suporte a uma nova ferramenta:

1. Crie um conector em `connectors/`
2. Implemente a interface `APIResponse`
3. Adicione parser se necessário
4. Atualize os tipos em `import.ts`
5. Adicione à lista de fontes
6. Documente a integração

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte os logs de importação
- Verifique a conectividade
- Valide as credenciais
- Teste com arquivo pequeno
- Contate o suporte técnico

---

*Sistema desenvolvido para máxima flexibilidade e segurança na importação de vulnerabilidades.*