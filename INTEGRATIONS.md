# 🔗 Integrações com Ferramentas de Segurança

## 📋 Visão Geral

O GRC Controller agora possui integrações **reais e funcionais** com as principais ferramentas de segurança do mercado. As conexões não são mais simulações - são implementações completas que se conectam diretamente com as APIs das ferramentas.

## ✅ Ferramentas Implementadas

### 🛡️ Qualys VMDR
- **Status**: ✅ **Implementado e Funcional**
- **API**: Qualys API v2.0
- **Autenticação**: Basic Auth (username/password)
- **Endpoints**: 
  - `qualysapi.qualys.com` (US)
  - `qualysapi.qualys.eu` (EU) 
  - `qualysapi.qg2.apps.qualys.in` (India)
- **Dados Importados**: QID, título, severidade, CVSS, CVE, host, porta, solução

### 🔍 Tenable Nessus
- **Status**: ✅ **Implementado e Funcional**
- **API**: Nessus REST API
- **Autenticação**: Username/Password → Session Token
- **Endpoint**: `https://nessus-server:8834`
- **Dados Importados**: Plugin ID, nome, severidade, host, porta, descrição, CVSS

### 🌐 Burp Suite Enterprise
- **Status**: ✅ **Implementado e Funcional**
- **API**: Burp Suite Enterprise API v1
- **Autenticação**: Bearer Token (API Key)
- **Endpoint**: `https://burp-server/api/v1`
- **Dados Importados**: Issue type, severidade, host, path, detalhes, evidências

## 🚧 Ferramentas Planejadas

### 📊 OpenVAS
- **Status**: 🔄 **Em Desenvolvimento**
- **Previsão**: Q2 2024

### 🎯 Rapid7 Nexpose
- **Status**: 🔄 **Em Desenvolvimento**  
- **Previsão**: Q2 2024

### 💻 SonarQube
- **Status**: 🔄 **Em Desenvolvimento**
- **Previsão**: Q3 2024

### 🔧 API Genérica
- **Status**: 🔄 **Em Desenvolvimento**
- **Previsão**: Q3 2024

## 🚀 Como Usar

### 1. **Configurar Credenciais**
```javascript
// Exemplo para Qualys
const credentials = {
  server: 'qualysapi.qualys.com', // ou .eu, .in
  username: 'seu_usuario',
  password: 'sua_senha',
  scanRef: 'scan/1234567890.123456' // opcional
};
```

### 2. **Testar Conexão**
- Clique em "Importar" → Selecione a ferramenta
- Preencha as credenciais
- Clique em "Testar Conexão"
- ✅ Sucesso: "Conexão estabelecida com sucesso!"
- ❌ Erro: Verifique credenciais e conectividade

### 3. **Importar Vulnerabilidades**
- Após testar conexão com sucesso
- Configure filtros (opcional):
  - Severidade: Todas, Apenas Critical, High+Critical
  - Scan específico (se disponível)
- Clique em "Iniciar Importação"
- Aguarde o processamento (pode levar alguns minutos)

## 🔒 Segurança

### **Criptografia de Credenciais**
- Todas as credenciais são criptografadas com AES-256-GCM
- Chaves armazenadas de forma segura no servidor
- Nunca expostas no frontend

### **Isolamento por Tenant**
- Row Level Security (RLS) no banco de dados
- Cada tenant vê apenas suas próprias vulnerabilidades
- Credenciais isoladas por organização

### **Auditoria**
- Logs de todas as importações
- Rastreamento de uso de credenciais
- Histórico de conexões

## 📊 Estrutura de Dados

### **Vulnerabilidades Importadas**
```sql
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- Critical, High, Medium, Low, Info
    status VARCHAR(20) DEFAULT 'Open',
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
    raw_data JSONB, -- Dados originais da ferramenta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Credenciais Armazenadas**
```sql
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    encrypted_credentials TEXT NOT NULL, -- Criptografado
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ APIs Disponíveis

### **Testar Conexão**
```bash
POST /api/integrations/test-connection
Content-Type: application/json

{
  "type": "qualys",
  "credentials": {
    "server": "qualysapi.qualys.com",
    "username": "usuario",
    "password": "senha"
  }
}
```

### **Importar Vulnerabilidades**
```bash
POST /api/integrations/import-vulnerabilities
Content-Type: application/json

{
  "type": "qualys",
  "credentials": { ... },
  "tenantId": "uuid-do-tenant",
  "filters": {
    "severityFilter": "high-critical",
    "maxResults": 1000
  }
}
```

### **Listar Integrações Suportadas**
```bash
GET /api/integrations/supported
```

## 🔧 Configuração do Ambiente

### **Variáveis Necessárias (.env)**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Segurança
ENCRYPTION_KEY=sua_chave_de_criptografia_segura

# Configurações
INTEGRATION_TIMEOUT=30000
MAX_VULNERABILITIES_PER_IMPORT=1000
```

### **Dependências**
```bash
npm install fast-xml-parser  # Para parsing XML (Qualys)
```

## 📈 Performance

### **Otimizações Implementadas**
- ✅ Timeout configurável (30s padrão)
- ✅ Limite de vulnerabilidades por importação
- ✅ Índices otimizados no banco de dados
- ✅ Processamento em lotes
- ✅ Cache de sessões de API

### **Métricas Esperadas**
- **Qualys**: ~100-500 vulnerabilidades/minuto
- **Nessus**: ~200-800 vulnerabilidades/minuto  
- **Burp**: ~50-200 issues/minuto

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **❌ "Falha na conexão"**
- Verifique URL do servidor
- Confirme credenciais
- Teste conectividade de rede
- Verifique firewall/proxy

#### **❌ "Timeout na importação"**
- Reduza filtros (apenas Critical)
- Aumente INTEGRATION_TIMEOUT
- Verifique performance da rede

#### **❌ "Credenciais inválidas"**
- Confirme username/password
- Verifique se API está habilitada
- Teste credenciais na ferramenta original

### **Logs de Debug**
```bash
# Verificar logs do servidor
tail -f logs/integrations.log

# Logs do banco de dados
SELECT * FROM vulnerabilities WHERE created_at > NOW() - INTERVAL '1 hour';
```

## 📞 Suporte

### **Documentação das APIs**
- [Qualys API Guide](https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf)
- [Nessus API Reference](https://developer.tenable.com/reference/navigate)
- [Burp Suite Enterprise API](https://portswigger.net/burp/documentation/enterprise/api-documentation)

### **Contato**
- 📧 Email: suporte@grc-controller.com
- 💬 Chat: Disponível no sistema
- 📚 Wiki: [Documentação Completa](./docs/)

---

## 🎯 Status Atual: **100% Funcional**

✅ **Qualys VMDR**: Totalmente implementado e testado  
✅ **Nessus**: Totalmente implementado e testado  
✅ **Burp Suite**: Totalmente implementado e testado  
🔄 **OpenVAS**: Em desenvolvimento  
🔄 **Rapid7**: Em desenvolvimento  
🔄 **SonarQube**: Em desenvolvimento  

**As integrações não são mais simulações - são conexões reais e funcionais com as ferramentas de mercado!**