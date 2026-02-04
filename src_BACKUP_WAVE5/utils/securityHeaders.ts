/**
 * CONFIGURAÇÃO DE HEADERS DE SEGURANÇA POR AMBIENTE
 * 
 * Sistema que aplica headers diferentes para desenvolvimento e produção
 */

export interface SecurityHeadersConfig {
  environment: 'development' | 'production' | 'staging';
  enableCSP: boolean;
  enableHSTS: boolean;
  enableFrameOptions: boolean;
  enableContentTypeOptions: boolean;
  enableXSSProtection: boolean;
  cspDirectives: Record<string, string[]>;
  monitoringLevel: 'minimal' | 'normal' | 'verbose';
}

// ============================================================================
// CONFIGURAÇÕES POR AMBIENTE
// ============================================================================

const developmentConfig: SecurityHeadersConfig = {
  environment: 'development',
  enableCSP: false, // ❌ Desabilitado para não quebrar hot reload
  enableHSTS: false, // ❌ Desabilitado para permitir HTTP local
  enableFrameOptions: false, // ❌ Desabilitado para Storybook/testes
  enableContentTypeOptions: true, // ✅ Seguro para dev
  enableXSSProtection: true, // ✅ Seguro para dev
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Permissivo para dev
    'style-src': ["'self'", "'unsafe-inline'", "https:"], // Permissivo para dev
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "ws:", "wss:", "http:", "https:"] // WebSocket para hot reload
  },
  monitoringLevel: 'minimal' // Apenas erros críticos
};

const productionConfig: SecurityHeadersConfig = {
  environment: 'production',
  enableCSP: true, // ✅ Proteção completa
  enableHSTS: true, // ✅ Força HTTPS
  enableFrameOptions: true, // ✅ Previne clickjacking
  enableContentTypeOptions: true, // ✅ Previne MIME sniffing
  enableXSSProtection: true, // ✅ Proteção XSS
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': ["'self'"], // Restritivo
    'style-src': ["'self'", "https://fonts.googleapis.com"], // Apenas fontes confiáveis
    'img-src': ["'self'", "data:", "https://images.unsplash.com"],
    'connect-src': ["'self'", "https://myxvxponlmulnjstbjwd.supabase.co"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'frame-ancestors': ["'none'"], // Previne iframe
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  monitoringLevel: 'verbose' // Log completo
};

const stagingConfig: SecurityHeadersConfig = {
  ...productionConfig,
  environment: 'staging',
  enableCSP: true,
  enableHSTS: false, // Pode usar HTTP para testes
  cspDirectives: {
    ...productionConfig.cspDirectives,
    'script-src': ["'self'", "'unsafe-inline'"], // Mais permissivo para testes
  },
  monitoringLevel: 'normal'
};

// ============================================================================
// SELETOR DE CONFIGURAÇÃO
// ============================================================================

export function getSecurityConfig(): SecurityHeadersConfig {
  const env = process.env.NODE_ENV || 'development';
  const customEnv = process.env.VITE_APP_ENV || env;
  
  switch (customEnv) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// ============================================================================
// GERADOR DE HEADERS
// ============================================================================

export function generateSecurityHeaders(config?: SecurityHeadersConfig): Record<string, string> {
  const securityConfig = config || getSecurityConfig();
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (securityConfig.enableCSP) {
    const cspValue = Object.entries(securityConfig.cspDirectives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    headers['Content-Security-Policy'] = cspValue;
  }

  // Strict Transport Security
  if (securityConfig.enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  // Frame Options
  if (securityConfig.enableFrameOptions) {
    headers['X-Frame-Options'] = 'DENY';
  }

  // Content Type Options
  if (securityConfig.enableContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // XSS Protection
  if (securityConfig.enableXSSProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Referrer Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // Permissions Policy (Feature Policy)
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';

  return headers;
}

// ============================================================================
// MIDDLEWARE PARA EXPRESS/FASTIFY
// ============================================================================

export function createSecurityMiddleware() {
  const config = getSecurityConfig();
  const headers = generateSecurityHeaders(config);

  return (req: any, res: any, next: any) => {
    // Aplicar headers de segurança
    Object.entries(headers).forEach(([name, value]) => {
      res.setHeader(name, value);
    });

    // Log apenas em desenvolvimento se verboso
    if (config.environment === 'development' && config.monitoringLevel === 'verbose') {
      console.log(`🔒 Security headers applied for ${req.url}`);
    }

    next();
  };
}

// ============================================================================
// UTILITÁRIOS PARA DESENVOLVIMENTO
// ============================================================================

export class DevelopmentSecurityHelper {
  /**
   * Desabilita temporariamente CSP para debugging
   */
  static disableCSPForDebugging() {
    if (process.env.NODE_ENV === 'development') {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'";
      document.head.appendChild(meta);
      console.warn('🚨 CSP desabilitado para debugging - NÃO usar em produção!');
    }
  }

  /**
   * Verifica se headers estão causando problemas
   */
  static checkSecurityIssues() {
    const issues: string[] = [];

    // Verificar se CSP está bloqueando recursos
    if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      issues.push('CSP detectado - pode bloquear recursos de desenvolvimento');
    }

    // Verificar se HTTPS é forçado
    if (location.protocol === 'http:' && localStorage.getItem('hsts-enabled')) {
      issues.push('HSTS pode estar forçando HTTPS - configure SSL local');
    }

    // Verificar se iframe é bloqueado
    try {
      const iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    } catch (e) {
      issues.push('X-Frame-Options pode estar bloqueando iframes - afeta Storybook');
    }

    if (issues.length > 0) {
      console.warn('🔒 Possíveis problemas de segurança detectados:', issues);
    }

    return issues;
  }

  /**
   * Configuração recomendada para Vite dev server
   */
  static getViteDevConfig() {
    return {
      server: {
        headers: generateSecurityHeaders(developmentConfig)
      }
    };
  }
}

// ============================================================================
// CONFIGURAÇÃO PARA DIFERENTES FERRAMENTAS
// ============================================================================

export const toolSpecificConfigs = {
  // Configuração para Storybook
  storybook: {
    ...developmentConfig,
    enableFrameOptions: false, // Storybook precisa de iframes
    cspDirectives: {
      ...developmentConfig.cspDirectives,
      'frame-ancestors': ["'self'", "http://localhost:*"] // Permite iframe local
    }
  },

  // Configuração para testes E2E
  e2e: {
    ...developmentConfig,
    enableFrameOptions: false, // Cypress/Playwright precisam de iframes
    enableHSTS: false, // Testes podem usar HTTP
    monitoringLevel: 'minimal' as const // Reduz logs durante testes
  },

  // Configuração para desenvolvimento com hot reload
  hotReload: {
    ...developmentConfig,
    cspDirectives: {
      ...developmentConfig.cspDirectives,
      'connect-src': [...developmentConfig.cspDirectives['connect-src'], 'ws://localhost:*', 'wss://localhost:*']
    }
  }
};

export default {
  getSecurityConfig,
  generateSecurityHeaders,
  createSecurityMiddleware,
  DevelopmentSecurityHelper,
  toolSpecificConfigs
};