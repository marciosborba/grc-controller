/**
 * SISTEMA DE MONITORAMENTO INTELIGENTE PARA DESENVOLVIMENTO
 * 
 * Monitora segurança sem atrapalhar o desenvolvimento
 */

export interface MonitoringConfig {
  environment: 'development' | 'production' | 'staging';
  enableRealTimeAlerts: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  alertThresholds: {
    failedLogins: number;
    slowOperations: number; // ms
    suspiciousPatterns: number;
  };
  excludePatterns: string[]; // IPs ou usuários para ignorar em dev
}

// ============================================================================
// CONFIGURAÇÕES POR AMBIENTE
// ============================================================================

const developmentMonitoring: MonitoringConfig = {
  environment: 'development',
  enableRealTimeAlerts: false, // ❌ Não enviar alertas em dev
  enablePerformanceMonitoring: true, // ✅ Útil para otimização
  enableSecurityLogging: true, // ✅ Log local apenas
  logLevel: 'warn', // Apenas warnings e erros
  alertThresholds: {
    failedLogins: 20, // Mais permissivo para testes
    slowOperations: 5000, // 5s (mais permissivo)
    suspiciousPatterns: 50 // Muito permissivo
  },
  excludePatterns: [
    '127.0.0.1',
    'localhost',
    '::1',
    'dev@empresa.com',
    'test@empresa.com'
  ]
};

const productionMonitoring: MonitoringConfig = {
  environment: 'production',
  enableRealTimeAlerts: true, // ✅ Alertas críticos
  enablePerformanceMonitoring: true, // ✅ Monitoramento completo
  enableSecurityLogging: true, // ✅ Log completo
  logLevel: 'info', // Log detalhado
  alertThresholds: {
    failedLogins: 5, // Restritivo
    slowOperations: 1000, // 1s
    suspiciousPatterns: 3 // Muito restritivo
  },
  excludePatterns: [] // Nenhuma exclusão
};

// ============================================================================
// CLASSE DE MONITORAMENTO INTELIGENTE
// ============================================================================

export class IntelligentMonitoring {
  private config: MonitoringConfig;
  private isDevelopment: boolean;
  private alertBuffer: Map<string, number> = new Map();
  private performanceBuffer: Array<{ operation: string; time: number; timestamp: Date }> = [];

  constructor(config?: MonitoringConfig) {
    this.config = config || this.getConfigForEnvironment();
    this.isDevelopment = this.config.environment === 'development';
  }

  private getConfigForEnvironment(): MonitoringConfig {
    const env = process.env.NODE_ENV || 'development';
    return env === 'production' ? productionMonitoring : developmentMonitoring;
  }

  // ========================================================================
  // MONITORAMENTO DE SEGURANÇA INTELIGENTE
  // ========================================================================

  /**
   * Log de evento de segurança com filtragem inteligente
   */
  logSecurityEvent(event: {
    type: 'login_failure' | 'suspicious_activity' | 'crypto_operation' | 'access_denied';
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }) {
    // Filtrar eventos de desenvolvimento
    if (this.isDevelopment && this.shouldIgnoreEvent(event)) {
      return;
    }

    // Log baseado no nível configurado
    if (this.shouldLog(event.severity)) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        ...event
      };

      this.writeLog(logEntry);
    }

    // Verificar se precisa alertar
    if (this.shouldAlert(event)) {
      this.handleAlert(event);
    }
  }

  /**
   * Monitoramento de performance com buffer inteligente
   */
  logPerformanceEvent(operation: string, duration: number, details?: any) {
    if (!this.config.enablePerformanceMonitoring) return;

    const event = {
      operation,
      time: duration,
      timestamp: new Date(),
      details
    };

    // Adicionar ao buffer
    this.performanceBuffer.push(event);

    // Manter apenas últimos 100 eventos
    if (this.performanceBuffer.length > 100) {
      this.performanceBuffer.shift();
    }

    // Alertar apenas se muito lento
    if (duration > this.config.alertThresholds.slowOperations) {
      this.logSecurityEvent({
        type: 'crypto_operation',
        details: { operation, duration, ...details },
        severity: duration > this.config.alertThresholds.slowOperations * 2 ? 'high' : 'medium'
      });
    }
  }

  /**
   * Análise de padrões suspeitos com contexto de desenvolvimento
   */
  analyzePatterns() {
    if (this.isDevelopment) {
      // Em desenvolvimento, apenas log estatísticas
      const stats = this.getPerformanceStats();
      if (stats.averageTime > this.config.alertThresholds.slowOperations) {
        console.warn('🐌 Performance degradada detectada:', stats);
      }
      return;
    }

    // Em produção, análise completa
    this.performFullPatternAnalysis();
  }

  // ========================================================================
  // MÉTODOS AUXILIARES
  // ========================================================================

  private shouldIgnoreEvent(event: any): boolean {
    // Ignorar eventos de IPs/usuários de desenvolvimento
    if (event.ip && this.config.excludePatterns.some(pattern => 
      event.ip.includes(pattern))) {
      return true;
    }

    if (event.userId && this.config.excludePatterns.some(pattern => 
      event.userId.includes(pattern))) {
      return true;
    }

    return false;
  }

  private shouldLog(severity: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.logLevel);
    const eventLevel = levels.indexOf(severity === 'critical' ? 'error' : severity);
    
    return eventLevel >= configLevel;
  }

  private shouldAlert(event: any): boolean {
    if (!this.config.enableRealTimeAlerts) return false;

    // Implementar lógica de throttling para evitar spam
    const alertKey = `${event.type}_${event.ip || 'unknown'}`;
    const currentCount = this.alertBuffer.get(alertKey) || 0;
    
    if (currentCount >= this.config.alertThresholds.suspiciousPatterns) {
      return false; // Já alertou muito
    }

    this.alertBuffer.set(alertKey, currentCount + 1);
    
    // Limpar buffer a cada hora
    setTimeout(() => {
      this.alertBuffer.delete(alertKey);
    }, 3600000);

    return event.severity === 'critical' || event.severity === 'high';
  }

  private writeLog(logEntry: any) {
    if (this.isDevelopment) {
      // Em desenvolvimento, apenas console
      console.log('🔒 Security Event:', logEntry);
    } else {
      // Em produção, enviar para sistema de logs
      this.sendToLogSystem(logEntry);
    }
  }

  private handleAlert(event: any) {
    if (this.isDevelopment) {
      console.warn('🚨 Security Alert (DEV):', event);
    } else {
      this.sendAlert(event);
    }
  }

  private getPerformanceStats() {
    if (this.performanceBuffer.length === 0) return null;

    const times = this.performanceBuffer.map(e => e.time);
    return {
      count: times.length,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      slowOperations: times.filter(t => t > this.config.alertThresholds.slowOperations).length
    };
  }

  private performFullPatternAnalysis() {
    // Implementação completa para produção
    console.log('Performing full pattern analysis...');
  }

  private sendToLogSystem(logEntry: any) {
    // Implementar envio para sistema de logs (ELK, Splunk, etc.)
    console.log('Sending to log system:', logEntry);
  }

  private sendAlert(event: any) {
    // Implementar envio de alertas (email, Slack, PagerDuty, etc.)
    console.log('Sending alert:', event);
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS PARA DESENVOLVIMENTO
  // ========================================================================

  /**
   * Estatísticas para desenvolvedores
   */
  getDevStats() {
    return {
      environment: this.config.environment,
      performanceStats: this.getPerformanceStats(),
      alertsBuffered: this.alertBuffer.size,
      config: this.config
    };
  }

  /**
   * Limpar buffers (útil para testes)
   */
  clearBuffers() {
    this.alertBuffer.clear();
    this.performanceBuffer.length = 0;
  }

  /**
   * Configurar temporariamente para debugging
   */
  setDebugMode(enabled: boolean) {
    if (this.isDevelopment) {
      this.config.logLevel = enabled ? 'debug' : 'warn';
      this.config.enableRealTimeAlerts = enabled;
      console.log(`🔧 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
}

// ============================================================================
// INTEGRAÇÃO COM SISTEMA EXISTENTE
// ============================================================================

export class CryptoMonitoringIntegration {
  private monitor: IntelligentMonitoring;

  constructor() {
    this.monitor = new IntelligentMonitoring();
  }

  /**
   * Integração com sistema de criptografia existente
   */
  logCryptoOperation(
    operation: 'encrypt' | 'decrypt' | 'key_rotation',
    tenantId: string,
    duration: number,
    success: boolean,
    error?: string
  ) {
    this.monitor.logPerformanceEvent(`crypto_${operation}`, duration, {
      tenantId,
      success,
      error
    });

    if (!success) {
      this.monitor.logSecurityEvent({
        type: 'crypto_operation',
        details: { operation, tenantId, error },
        severity: 'high'
      });
    }
  }

  /**
   * Integração com sistema de autenticação
   */
  logAuthEvent(
    type: 'login_success' | 'login_failure' | 'logout',
    userId: string,
    ip: string,
    userAgent: string
  ) {
    if (type === 'login_failure') {
      this.monitor.logSecurityEvent({
        type: 'login_failure',
        userId,
        ip,
        userAgent,
        severity: 'medium'
      });
    }
  }

  /**
   * Obter estatísticas para dashboard
   */
  getDashboardStats() {
    return this.monitor.getDevStats();
  }
}

// ============================================================================
// INSTÂNCIA GLOBAL
// ============================================================================

export const developmentMonitor = new IntelligentMonitoring();
export const cryptoMonitor = new CryptoMonitoringIntegration();

export default {
  IntelligentMonitoring,
  CryptoMonitoringIntegration,
  developmentMonitor,
  cryptoMonitor
};