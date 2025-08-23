# 🔐 **Melhorias de Segurança da Informação - GRC Controller**

## 📋 **Análise de Segurança Atual**

**Status:** Aplicação possui algumas medidas de segurança implementadas, mas requer melhorias críticas para atender padrões enterprise de GRC.

**Pontos Positivos Identificados:**
- ✅ Autenticação via Supabase com JWT
- ✅ Rate limiting implementado
- ✅ Logging de segurança básico
- ✅ Validação de senhas
- ✅ Scanner OWASP implementado

**Vulnerabilidades Críticas Identificadas:**
- ❌ **Credenciais hardcoded** no código fonte
- ❌ **Logs de debug** expostos em produção
- ❌ **Falta de CSP** (Content Security Policy)
- ❌ **Headers de segurança** ausentes
- ❌ **Sanitização XSS** incompleta
- ❌ **Gestão de sessões** inadequada

---

## 🚨 **Vulnerabilidades Críticas a Corrigir**

### **1. 🔑 Credenciais Expostas (CRÍTICO)**
**Risco:** Alto - Exposição de chaves de API e URLs

```typescript
// ❌ PROBLEMA: Credenciais hardcoded
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// 🔧 SOLUÇÃO: Usar variáveis de ambiente
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Variáveis de ambiente Supabase não configuradas');
}
```

### **2. 🐛 Logs de Debug em Produção (CRÍTICO)**
**Risco:** Alto - Vazamento de informações sensíveis

```typescript
// ❌ PROBLEMA: 211+ console.log em produção
// Logs contêm dados sensíveis de usuários e sistema

// 🔧 SOLUÇÃO: Sistema de logging seguro
// src/utils/secureLogger.ts
class SecureLogger {
  private logLevel: number;
  private sensitiveFields = ['password', 'token', 'key', 'secret', 'email'];

  constructor() {
    this.logLevel = import.meta.env.PROD ? 2 : 0; // WARN+ em produção
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) return data;
    
    const sanitized = { ...data };
    this.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }

  debug(message: string, data?: any) {
    if (this.logLevel <= 0) {
      console.log(`[DEBUG] ${message}`, this.sanitizeData(data));
    }
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, this.sanitizeData(error));
    
    if (import.meta.env.PROD) {
      this.sendToMonitoring(message, error);
    }
  }
}

export const logger = new SecureLogger();
```

### **3. 🛡️ Headers de Segurança Ausentes (ALTO)**
**Risco:** Médio-Alto - Vulnerabilidades XSS, Clickjacking

```typescript
// 🔧 SOLUÇÃO: Configurar headers de segurança
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://myxvxponlmulnjstbjwd.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      
      // Outros headers de segurança
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-XSS-Protection': '1; mode=block'
    }
  }
});
```

### **4. 🔒 Gestão de Sessões Insegura (ALTO)**
**Risco:** Médio-Alto - Session hijacking, fixation

```typescript
// 🔧 SOLUÇÃO: Gestão segura de sessões
// src/utils/sessionSecurity.ts
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min
  private static readonly IDLE_TIMEOUT = 15 * 60 * 1000; // 15 min
  private static lastActivity = Date.now();

  static initializeSession() {
    this.updateActivity();
    this.startSessionMonitoring();
    this.detectMultipleTabs();
  }

  static updateActivity() {
    this.lastActivity = Date.now();
    this.resetIdleTimer();
  }

  private static startSessionMonitoring() {
    // Monitor de timeout de sessão
    setTimeout(() => {
      this.forceLogout('Session expired');
    }, this.SESSION_TIMEOUT);

    // Monitor de atividade
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), true);
    });
  }

  private static async forceLogout(reason: string) {
    await logger.warn('Session terminated', { reason });
    await supabase.auth.signOut();
    window.location.href = '/login';
  }
}
```

### **5. 🧹 Sanitização XSS Incompleta (MÉDIO)**
**Risco:** Médio - Cross-Site Scripting

```typescript
// 🔧 SOLUÇÃO: Sanitização robusta
// src/utils/xssPrevention.ts
import DOMPurify from 'dompurify';

export class XSSPrevention {
  private static readonly DANGEROUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi
  ];

  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remover padrões perigosos
    let sanitized = input;
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Escapar caracteres HTML
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    return sanitized.trim().substring(0, 1000); // Limitar tamanho
  }

  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não permitido' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande (máx. 10MB)' };
    }
    
    return { valid: true };
  }
}
```

---

## 🛡️ **Implementações de Segurança Recomendadas**

### **A. Autenticação e Autorização**

#### 1. **Multi-Factor Authentication (MFA)**
```typescript
// src/utils/mfaService.ts
export class MFAService {
  static async enableTOTP(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `GRC Controller (${userId})`,
      issuer: 'GRC Controller'
    });
    
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Salvar secret temporário (não confirmado)
    await supabase
      .from('user_mfa')
      .upsert({
        user_id: userId,
        secret_temp: secret.base32,
        enabled: false
      });
    
    return { secret: secret.base32, qrCode };
  }
  
  static async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_mfa')
      .select('secret, secret_temp')
      .eq('user_id', userId)
      .single();
    
    if (!data) return false;
    
    const secret = data.secret || data.secret_temp;
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }
}
```

#### 2. **Controle de Acesso Baseado em Funções (RBAC)**
```typescript
// src/utils/rbacService.ts
export class RBACService {
  private static permissions = {
    'admin': ['*'],
    'ciso': ['risks.*', 'compliance.*', 'reports.read'],
    'risk_manager': ['risks.*', 'assessments.*'],
    'compliance_officer': ['compliance.*', 'policies.*'],
    'auditor': ['*.read', 'reports.*'],
    'user': ['dashboard.read', 'profile.*']
  };
  
  static hasPermission(userRoles: string[], requiredPermission: string): boolean {
    return userRoles.some(role => {
      const rolePermissions = this.permissions[role as keyof typeof this.permissions] || [];
      
      return rolePermissions.some(permission => {
        if (permission === '*') return true;
        if (permission === requiredPermission) return true;
        
        // Wildcard matching
        const permissionRegex = new RegExp('^' + permission.replace('*', '.*') + '$');
        return permissionRegex.test(requiredPermission);
      });
    });
  }
}
```

### **B. Criptografia e Proteção de Dados**

#### 1. **Criptografia de Dados Sensíveis**
```typescript
// src/utils/encryption.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static readonly ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
  
  static encrypt(data: string): string {
    if (!this.ENCRYPTION_KEY) {
      throw new Error('Chave de criptografia não configurada');
    }
    
    const encrypted = CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
    return encrypted;
  }
  
  static decrypt(encryptedData: string): string {
    if (!this.ENCRYPTION_KEY) {
      throw new Error('Chave de criptografia não configurada');
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const passwordSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.PBKDF2(password, passwordSalt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
    
    return { hash, salt: passwordSalt };
  }
}
```

#### 2. **Proteção de Dados Pessoais (LGPD/GDPR)**
```typescript
// src/utils/dataProtection.ts
export class DataProtectionService {
  private static readonly PII_FIELDS = [
    'email', 'phone', 'cpf', 'rg', 'address', 'birth_date'
  ];
  
  static anonymizeData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };
    
    this.PII_FIELDS.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.anonymizeField(field, anonymized[field]);
      }
    });
    
    return anonymized;
  }
  
  private static anonymizeField(fieldType: string, value: string): string {
    switch (fieldType) {
      case 'email':
        const [local, domain] = value.split('@');
        return `${local.substring(0, 2)}***@${domain}`;
      case 'phone':
        return value.replace(/.(?=.{4})/g, '*');
      case 'cpf':
        return value.replace(/(\\d{3})\\d{6}(\\d{2})/, '$1.***.**-$2');
      default:
        return '***';
    }
  }
  
  static async logDataAccess(userId: string, dataType: string, action: string) {
    await supabase
      .from('data_access_logs')
      .insert({
        user_id: userId,
        data_type: dataType,
        action: action,
        timestamp: new Date().toISOString(),
        ip_address: await this.getUserIP()
      });
  }
}
```

### **C. Monitoramento e Detecção de Ameaças**

#### 1. **Sistema de Detecção de Intrusão**
```typescript
// src/utils/intrusionDetection.ts
export class IntrusionDetectionService {
  private static suspiciousPatterns = {
    bruteForce: { maxAttempts: 5, timeWindow: 15 * 60 * 1000 },
    rapidRequests: { maxRequests: 100, timeWindow: 60 * 1000 },
    suspiciousUserAgent: /bot|crawler|spider|scraper/i,
    sqlInjectionPatterns: [
      /('|(\\-\\-)|(;)|(\\||\\|)|(\\*|\\*))/i,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i
    ]
  };
  
  static async detectSuspiciousActivity(request: {
    ip: string;
    userAgent: string;
    endpoint: string;
    payload?: any;
    userId?: string;
  }): Promise<{ threat: boolean; reason?: string; severity: 'low' | 'medium' | 'high' }> {
    
    // Verificar força bruta
    const bruteForceCheck = await this.checkBruteForce(request.ip);
    if (bruteForceCheck.threat) {
      return { threat: true, reason: 'Brute force detected', severity: 'high' };
    }
    
    // Verificar user agent suspeito
    if (this.suspiciousPatterns.suspiciousUserAgent.test(request.userAgent)) {
      return { threat: true, reason: 'Suspicious user agent', severity: 'medium' };
    }
    
    // Verificar SQL injection
    const sqlInjectionCheck = this.checkSQLInjection(request.payload);
    if (sqlInjectionCheck.threat) {
      return { threat: true, reason: 'SQL injection attempt', severity: 'high' };
    }
    
    return { threat: false, severity: 'low' };
  }
  
  private static async checkBruteForce(ip: string): Promise<{ threat: boolean }> {
    const { data } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - this.suspiciousPatterns.bruteForce.timeWindow).toISOString());
    
    return { threat: (data?.length || 0) >= this.suspiciousPatterns.bruteForce.maxAttempts };
  }
  
  private static checkSQLInjection(payload: any): { threat: boolean } {
    if (!payload) return { threat: false };
    
    const payloadString = JSON.stringify(payload).toLowerCase();
    
    return {
      threat: this.suspiciousPatterns.sqlInjectionPatterns.some(pattern => 
        pattern.test(payloadString)
      )
    };
  }
}
```

#### 2. **Auditoria e Compliance**
```typescript
// src/utils/auditService.ts
export class AuditService {
  static async logSecurityEvent(event: {
    type: 'login' | 'logout' | 'data_access' | 'permission_change' | 'security_violation';
    userId?: string;
    details: Record<string, any>;
    severity: 'info' | 'warning' | 'error' | 'critical';
    ipAddress?: string;
  }) {
    const auditLog = {
      event_type: event.type,
      user_id: event.userId,
      details: event.details,
      severity: event.severity,
      ip_address: event.ipAddress,
      timestamp: new Date().toISOString(),
      session_id: this.getCurrentSessionId()
    };
    
    // Salvar no banco
    await supabase.from('audit_logs').insert(auditLog);
    
    // Alertar em tempo real para eventos críticos
    if (event.severity === 'critical') {
      await this.sendSecurityAlert(auditLog);
    }
  }
  
  private static async sendSecurityAlert(auditLog: any) {
    // Implementar notificação para equipe de segurança
    // Slack, email, SMS, etc.
  }
  
  static async generateComplianceReport(startDate: Date, endDate: Date) {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });
    
    return {
      period: { start: startDate, end: endDate },
      totalEvents: data?.length || 0,
      securityViolations: data?.filter(log => log.event_type === 'security_violation').length || 0,
      criticalEvents: data?.filter(log => log.severity === 'critical').length || 0,
      events: data || []
    };
  }
}
```

---

## 🚀 **Plano de Implementação de Segurança**

### **Fase 1: Correções Críticas (1-2 dias)**
1. 🔥 **Remover credenciais hardcoded**
   - Mover para variáveis de ambiente
   - Implementar validação de configuração

2. 🔥 **Implementar logging seguro**
   - Substituir console.log por sistema seguro
   - Sanitizar dados sensíveis

3. 🔥 **Configurar headers de segurança**
   - CSP, X-Frame-Options, HSTS
   - Configurar no Vite e servidor

### **Fase 2: Melhorias de Autenticação (3-5 dias)**
1. 🔐 **Implementar MFA**
   - TOTP com Google Authenticator
   - Backup codes

2. 🔐 **Melhorar gestão de sessões**
   - Timeout automático
   - Detecção de múltiplas abas

3. 🔐 **RBAC robusto**
   - Controle granular de permissões
   - Decorators para métodos

### **Fase 3: Proteção de Dados (5-7 dias)**
1. 🛡️ **Criptografia de dados**
   - Dados sensíveis em repouso
   - Chaves rotacionáveis

2. 🛡️ **Sanitização XSS**
   - DOMPurify para HTML
   - Validação de uploads

3. 🛡️ **Compliance LGPD/GDPR**
   - Anonimização de dados
   - Logs de acesso

### **Fase 4: Monitoramento (7-10 dias)**
1. 📊 **Sistema de detecção**
   - IDS básico
   - Alertas em tempo real

2. 📊 **Auditoria completa**
   - Logs de segurança
   - Relatórios de compliance

---

## 📋 **Checklist de Segurança**

### **Crítico (Implementar Imediatamente):**
- [ ] Remover credenciais hardcoded do código
- [ ] Implementar sistema de logging seguro
- [ ] Configurar headers de segurança (CSP, HSTS, etc.)
- [ ] Sanitizar todos os inputs do usuário

### **Alto Impacto (Próxima Sprint):**
- [ ] Implementar Multi-Factor Authentication
- [ ] Melhorar gestão de sessões com timeout
- [ ] Implementar RBAC granular
- [ ] Criptografar dados sensíveis

### **Médio Impacto (Próximo Mês):**
- [ ] Sistema de detecção de intrusão
- [ ] Auditoria e compliance automatizada
- [ ] Monitoramento de segurança em tempo real
- [ ] Testes de penetração automatizados

### **Baixo Impacto (Backlog):**
- [ ] WAF (Web Application Firewall)
- [ ] Honeypots para detecção de ataques
- [ ] Análise comportamental de usuários
- [ ] Integração com SIEM

---

## 🎯 **Métricas de Segurança Esperadas**

### **Antes das Melhorias:**
- **Vulnerabilidades Críticas:** 6
- **Score OWASP:** ~40/100
- **Tempo de Detecção:** N/A
- **Compliance:** ~30%

### **Após Implementação:**
- **Vulnerabilidades Críticas:** 0
- **Score OWASP:** ~90/100
- **Tempo de Detecção:** <5 minutos
- **Compliance:** ~95%

---

**🔐 Implementando essas melhorias de segurança, o GRC Controller atenderá aos mais altos padrões de segurança da informação, protegendo dados sensíveis e garantindo compliance com regulamentações como LGPD, GDPR e frameworks de segurança corporativa.**

---

*Análise de Segurança gerada em: Janeiro 2025*  
*Baseada em: Análise de código fonte, configurações, padrões de segurança e melhores práticas*  
*Estimativa de implementação: 2-3 semanas para melhorias completas de segurança*