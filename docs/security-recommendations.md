# RECOMENDAÇÕES DE SEGURANÇA - SISTEMA GRC

## 🔐 CRIPTOGRAFIA EM TRÂNSITO - MELHORIAS NECESSÁRIAS

### 1. HTTPS LOCAL PARA DESENVOLVIMENTO

#### Configurar SSL/TLS no Vite:
```bash
# Instalar mkcert para certificados locais
npm install -g mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1

# Configurar Vite com HTTPS
# vite.config.ts
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    port: 8081
  }
})
```

#### Resultado:
- ✅ `https://localhost:8081` em desenvolvimento
- ✅ Criptografia completa end-to-end
- ✅ Ambiente dev igual à produção

### 2. CONFIGURAÇÕES DE PRODUÇÃO

#### Nginx/Apache com SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name grc.empresa.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### 3. HEADERS DE SEGURANÇA

#### Implementar no servidor:
```typescript
// middleware de segurança
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self' https:");
  next();
});
```

## 🛡️ VALIDAÇÃO DE SEGURANÇA

### Checklist de Implementação:

#### ✅ Criptografia em Repouso:
- [x] AES-256-GCM implementado
- [x] Chaves únicas por tenant
- [x] Rotação de chaves
- [x] Auditoria completa
- [x] Cache seguro

#### ⚠️ Criptografia em Trânsito:
- [x] HTTPS para APIs Supabase
- [x] SSL/TLS para banco
- [ ] HTTPS local (desenvolvimento)
- [ ] Certificados SSL (produção)
- [ ] Headers de segurança

### Ferramentas de Teste:

#### SSL Labs Test:
```bash
# Testar configuração SSL
curl -I https://grc.empresa.com
openssl s_client -connect grc.empresa.com:443
```

#### Verificação de Criptografia:
```sql
-- Verificar dados criptografados no banco
SELECT 
  table_name,
  column_name,
  CASE 
    WHEN data_type = 'text' AND 
         (sample_value LIKE '\\x%' OR sample_value LIKE '%BEGIN PGP%')
    THEN 'ENCRYPTED'
    ELSE 'PLAIN'
  END as encryption_status
FROM information_schema.columns;
```

## 🎯 COMPLIANCE E CERTIFICAÇÕES

### Padrões Atendidos:
- ✅ **LGPD:** Criptografia de dados pessoais
- ✅ **SOX:** Proteção de dados financeiros
- ✅ **ISO 27001:** Controles criptográficos
- ✅ **NIST:** Algoritmos aprovados (AES-256)

### Padrões Pendentes:
- ⚠️ **PCI DSS:** Requer HTTPS completo
- ⚠️ **HIPAA:** Necessita criptografia em trânsito
- ⚠️ **FedRAMP:** Exige certificação SSL

## 📋 PLANO DE IMPLEMENTAÇÃO

### Fase 1 - Desenvolvimento (Imediato):
1. Configurar HTTPS local com mkcert
2. Atualizar Vite config
3. Testar aplicação com SSL

### Fase 2 - Produção (1-2 semanas):
1. Obter certificados SSL válidos
2. Configurar servidor web (Nginx/Apache)
3. Implementar headers de segurança
4. Configurar redirects HTTP → HTTPS

### Fase 3 - Monitoramento (Contínuo):
1. Monitorar expiração de certificados
2. Auditar logs de segurança
3. Testes regulares de penetração
4. Atualizações de segurança

## 🚨 RISCOS ATUAIS

### Alto Risco:
- **Desenvolvimento HTTP:** Dados sensíveis em texto claro localmente
- **Man-in-the-middle:** Possível interceptação em dev

### Médio Risco:
- **Headers ausentes:** Vulnerabilidades de navegador
- **Certificados:** Dependência de configuração manual

### Baixo Risco:
- **Cache local:** Dados já criptografados
- **Logs:** Auditoria implementada

## 📞 CONTATOS DE EMERGÊNCIA

### Incidente de Segurança:
1. **Rotacionar chaves** imediatamente
2. **Verificar logs** de auditoria
3. **Notificar stakeholders**
4. **Documentar incidente**

### Comandos de Emergência:
```sql
-- Rotacionar todas as chaves de um tenant
SELECT rotate_tenant_key('tenant-id', 'general', 'security_incident');
SELECT rotate_tenant_key('tenant-id', 'pii', 'security_incident');
SELECT rotate_tenant_key('tenant-id', 'financial', 'security_incident');
SELECT rotate_tenant_key('tenant-id', 'audit', 'security_incident');
SELECT rotate_tenant_key('tenant-id', 'compliance', 'security_incident');
```