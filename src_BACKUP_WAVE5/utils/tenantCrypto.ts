/**
 * TENANT CRYPTO SYSTEM
 * 
 * Sistema de criptografia por tenant com isolamento completo de dados.
 * Cada tenant possui chaves criptográficas únicas para diferentes propósitos.
 * 
 * Características:
 * - Isolamento criptográfico completo por tenant
 * - Chaves específicas por propósito (PII, financeiro, auditoria, etc.)
 * - Cache inteligente para performance
 * - Auditoria completa de operações
 * - Rotação automática de chaves
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type EncryptionPurpose = 'general' | 'pii' | 'financial' | 'audit' | 'compliance';

export interface EncryptionResult {
  success: boolean;
  data?: string;
  error?: string;
  performanceMs?: number;
}

export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
  performanceMs?: number;
}

export interface TenantKeyInfo {
  tenantId: string;
  purpose: EncryptionPurpose;
  version: number;
  isActive: boolean;
  createdAt: string;
  keyAgeDays: number;
  status: 'OK' | 'ROTATION_WARNING' | 'ROTATION_NEEDED';
}

export interface CryptoAuditEntry {
  tenantId: string;
  operationType: 'encrypt' | 'decrypt' | 'key_generation' | 'key_rotation';
  tableName?: string;
  fieldName?: string;
  success: boolean;
  performanceMs?: number;
  errorMessage?: string;
}

// ============================================================================
// CACHE DE CHAVES PARA PERFORMANCE
// ============================================================================

class TenantCryptoCache {
  private cache = new Map<string, { data: any; expires: number; accessCount: number }>();
  private readonly TTL = 3600000; // 1 hora em milissegundos
  private readonly MAX_CACHE_SIZE = 1000;

  private getCacheKey(tenantId: string, purpose: EncryptionPurpose): string {
    return `${tenantId}:${purpose}`;
  }

  get(tenantId: string, purpose: EncryptionPurpose): any | null {
    const key = this.getCacheKey(tenantId, purpose);
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      cached.accessCount++;
      return cached.data;
    }
    
    // Remove entrada expirada
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  set(tenantId: string, purpose: EncryptionPurpose, data: any): void {
    // Limpar cache se estiver muito grande
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup();
    }

    const key = this.getCacheKey(tenantId, purpose);
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL,
      accessCount: 1
    });
  }

  invalidate(tenantId: string, purpose?: EncryptionPurpose): void {
    if (purpose) {
      const key = this.getCacheKey(tenantId, purpose);
      this.cache.delete(key);
    } else {
      // Invalidar todas as chaves do tenant
      for (const [key] of this.cache) {
        if (key.startsWith(`${tenantId}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remover entradas expiradas
    entries.forEach(([key, value]) => {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    });
    
    // Se ainda estiver muito grande, remover as menos usadas
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([, value]) => value.expires > now)
        .sort((a, b) => a[1].accessCount - b[1].accessCount);
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats(): { size: number; hitRate: number } {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? (this.cache.size / totalAccess) * 100 : 0
    };
  }
}

// Instância global do cache
const cryptoCache = new TenantCryptoCache();

// ============================================================================
// CLASSE PRINCIPAL DE CRIPTOGRAFIA
// ============================================================================

export class TenantCrypto {
  private static instance: TenantCrypto;
  private auditEnabled = true;
  private performanceThreshold = 100; // ms

  private constructor() {}

  static getInstance(): TenantCrypto {
    if (!TenantCrypto.instance) {
      TenantCrypto.instance = new TenantCrypto();
    }
    return TenantCrypto.instance;
  }

  // ========================================================================
  // MÉTODOS PRINCIPAIS DE CRIPTOGRAFIA
  // ========================================================================

  /**
   * Criptografa dados para um tenant específico
   */
  async encrypt(
    tenantId: string,
    plaintext: string,
    purpose: EncryptionPurpose = 'general',
    options?: { tableName?: string; fieldName?: string }
  ): Promise<EncryptionResult> {
    const startTime = performance.now();
    
    try {
      // Validações
      if (!tenantId || !plaintext) {
        throw new Error('TenantId e plaintext são obrigatórios');
      }

      if (plaintext.length > 1000000) { // 1MB limit
        throw new Error('Dados muito grandes para criptografia (limite: 1MB)');
      }

      // Chamar função do banco de dados
      const { data, error } = await supabase.rpc('encrypt_tenant_data', {
        p_tenant_id: tenantId,
        p_plaintext: plaintext,
        p_purpose: purpose
      });

      if (error) {
        throw new Error(`Erro na criptografia: ${error.message}`);
      }

      const endTime = performance.now();
      const performanceMs = Math.round(endTime - startTime);

      // Log de auditoria se performance for ruim
      if (performanceMs > this.performanceThreshold) {
        console.warn(`Criptografia lenta: ${performanceMs}ms para tenant ${tenantId}`);
      }

      // Auditoria opcional
      if (this.auditEnabled) {
        await this.logAuditEntry({
          tenantId,
          operationType: 'encrypt',
          tableName: options?.tableName,
          fieldName: options?.fieldName,
          success: true,
          performanceMs
        });
      }

      return {
        success: true,
        data: data as string,
        performanceMs
      };

    } catch (error: any) {
      const endTime = performance.now();
      const performanceMs = Math.round(endTime - startTime);

      // Log de erro
      if (this.auditEnabled) {
        await this.logAuditEntry({
          tenantId,
          operationType: 'encrypt',
          tableName: options?.tableName,
          fieldName: options?.fieldName,
          success: false,
          performanceMs,
          errorMessage: error.message
        });
      }

      console.error('Erro na criptografia:', error);
      
      return {
        success: false,
        error: error.message,
        performanceMs
      };
    }
  }

  /**
   * Descriptografa dados para um tenant específico
   */
  async decrypt(
    tenantId: string,
    encryptedText: string,
    purpose: EncryptionPurpose = 'general',
    options?: { tableName?: string; fieldName?: string }
  ): Promise<DecryptionResult> {
    const startTime = performance.now();
    
    try {
      // Validações
      if (!tenantId || !encryptedText) {
        throw new Error('TenantId e encryptedText são obrigatórios');
      }

      // Verificar cache primeiro
      const cacheKey = `decrypt:${tenantId}:${purpose}:${encryptedText.substring(0, 50)}`;
      const cached = cryptoCache.get(tenantId, purpose);
      
      if (cached && cached[cacheKey]) {
        return {
          success: true,
          data: cached[cacheKey],
          performanceMs: 1 // Cache hit
        };
      }

      // Chamar função do banco de dados
      const { data, error } = await supabase.rpc('decrypt_tenant_data', {
        p_tenant_id: tenantId,
        p_encrypted_text: encryptedText,
        p_purpose: purpose
      });

      if (error) {
        throw new Error(`Erro na descriptografia: ${error.message}`);
      }

      const endTime = performance.now();
      const performanceMs = Math.round(endTime - startTime);

      // Cachear resultado
      const cacheData = cached || {};
      cacheData[cacheKey] = data;
      cryptoCache.set(tenantId, purpose, cacheData);

      // Log de auditoria se performance for ruim
      if (performanceMs > this.performanceThreshold) {
        console.warn(`Descriptografia lenta: ${performanceMs}ms para tenant ${tenantId}`);
      }

      // Auditoria opcional
      if (this.auditEnabled) {
        await this.logAuditEntry({
          tenantId,
          operationType: 'decrypt',
          tableName: options?.tableName,
          fieldName: options?.fieldName,
          success: true,
          performanceMs
        });
      }

      return {
        success: true,
        data: data as string,
        performanceMs
      };

    } catch (error: any) {
      const endTime = performance.now();
      const performanceMs = Math.round(endTime - startTime);

      // Log de erro
      if (this.auditEnabled) {
        await this.logAuditEntry({
          tenantId,
          operationType: 'decrypt',
          tableName: options?.tableName,
          fieldName: options?.fieldName,
          success: false,
          performanceMs,
          errorMessage: error.message
        });
      }

      console.error('Erro na descriptografia:', error);
      
      return {
        success: false,
        error: error.message,
        performanceMs
      };
    }
  }

  // ========================================================================
  // MÉTODOS DE GERENCIAMENTO DE CHAVES
  // ========================================================================

  /**
   * Cria chaves criptográficas para um novo tenant
   */
  async createTenantKeys(tenantId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('create_tenant_encryption_keys', {
        p_tenant_id: tenantId
      });

      if (error) {
        throw new Error(`Erro ao criar chaves: ${error.message}`);
      }

      console.log(`Chaves criptográficas criadas para tenant ${tenantId}`);
      return true;

    } catch (error: any) {
      console.error('Erro ao criar chaves:', error);
      toast.error('Erro ao criar chaves criptográficas');
      return false;
    }
  }

  /**
   * Rotaciona chave de um tenant
   */
  async rotateKey(
    tenantId: string,
    purpose: EncryptionPurpose = 'general',
    reason: string = 'manual'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('rotate_tenant_key', {
        p_tenant_id: tenantId,
        p_purpose: purpose,
        p_reason: reason
      });

      if (error) {
        throw new Error(`Erro ao rotacionar chave: ${error.message}`);
      }

      // Invalidar cache
      cryptoCache.invalidate(tenantId, purpose);

      console.log(`Chave rotacionada para tenant ${tenantId} (${purpose})`);
      toast.success('Chave rotacionada com sucesso');
      return true;

    } catch (error: any) {
      console.error('Erro ao rotacionar chave:', error);
      toast.error('Erro ao rotacionar chave');
      return false;
    }
  }

  /**
   * Obtém informações sobre as chaves de um tenant
   */
  async getTenantKeyInfo(tenantId: string): Promise<TenantKeyInfo[]> {
    try {
      const { data, error } = await supabase
        .from('v_tenant_encryption_status')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(`Erro ao buscar informações das chaves: ${error.message}`);
      }

      return (data || []).map(item => ({
        tenantId: item.tenant_id,
        purpose: item.key_purpose,
        version: item.encryption_version,
        isActive: item.is_active,
        createdAt: item.key_created_at,
        keyAgeDays: item.key_age_days,
        status: item.key_status
      }));

    } catch (error: any) {
      console.error('Erro ao buscar informações das chaves:', error);
      return [];
    }
  }

  // ========================================================================
  // MÉTODOS DE AUDITORIA E MONITORAMENTO
  // ========================================================================

  /**
   * Log de auditoria
   */
  private async logAuditEntry(entry: CryptoAuditEntry): Promise<void> {
    try {
      // Não aguardar o resultado para não impactar performance
      supabase
        .from('crypto_audit_log')
        .insert({
          tenant_id: entry.tenantId,
          operation_type: entry.operationType,
          table_name: entry.tableName,
          field_name: entry.fieldName,
          success: entry.success,
          performance_ms: entry.performanceMs,
          error_message: entry.errorMessage,
          user_id: await this.getCurrentUserId(),
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        })
        .then(({ error }) => {
          if (error) {
            console.warn('Erro no log de auditoria:', error);
          }
        });

    } catch (error) {
      console.warn('Erro no log de auditoria:', error);
    }
  }

  /**
   * Obtém estatísticas de uso de criptografia
   */
  async getCryptoStats(tenantId: string, days: number = 30): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('v_crypto_usage_stats')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('operation_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('operation_date', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      return data || [];

    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return cryptoCache.getStats();
  }

  // ========================================================================
  // MÉTODOS UTILITÁRIOS
  // ========================================================================

  /**
   * Habilita/desabilita auditoria
   */
  setAuditEnabled(enabled: boolean): void {
    this.auditEnabled = enabled;
  }

  /**
   * Define threshold de performance
   */
  setPerformanceThreshold(ms: number): void {
    this.performanceThreshold = ms;
  }

  /**
   * Limpa cache de um tenant
   */
  clearCache(tenantId: string, purpose?: EncryptionPurpose): void {
    cryptoCache.invalidate(tenantId, purpose);
  }

  /**
   * Obtém ID do usuário atual
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Obtém IP do cliente (simulado)
   */
  private async getClientIP(): Promise<string | null> {
    try {
      // Em produção, isso viria do servidor
      return '127.0.0.1';
    } catch {
      return null;
    }
  }

  /**
   * Valida se dados estão criptografados
   */
  static isEncrypted(data: string): boolean {
    // Dados criptografados com pgcrypto começam com padrões específicos
    return data.startsWith('\\x') || data.includes('-----BEGIN PGP MESSAGE-----');
  }

  /**
   * Estima tamanho dos dados criptografados
   */
  static estimateEncryptedSize(plaintext: string): number {
    // AES-256-GCM + overhead do pgcrypto
    return Math.ceil(plaintext.length * 1.4) + 100;
  }
}

// ============================================================================
// DECORATORS PARA AUTOMAÇÃO
// ============================================================================

/**
 * Decorator para campos criptografados
 */
export function EncryptedField(purpose: EncryptionPurpose = 'general') {
  return function (target: any, propertyKey: string) {
    const privateKey = `_${propertyKey}`;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return this[privateKey];
      },
      set(value: string) {
        this[privateKey] = value;
        this[`${propertyKey}_encrypted`] = null; // Marcar para re-criptografia
        this[`${propertyKey}_purpose`] = purpose;
      },
      enumerable: true,
      configurable: true
    });
  };
}

/**
 * Decorator para métodos que precisam de tenant context
 */
export function RequiresTenant(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    if (!this.tenantId) {
      throw new Error(`Método ${propertyKey} requer tenantId`);
    }
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

// ============================================================================
// INSTÂNCIA GLOBAL
// ============================================================================

export const tenantCrypto = TenantCrypto.getInstance();

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Criptografa dados PII (Personally Identifiable Information)
 */
export async function encryptPII(tenantId: string, data: string): Promise<string | null> {
  const result = await tenantCrypto.encrypt(tenantId, data, 'pii');
  return result.success ? result.data! : null;
}

/**
 * Descriptografa dados PII
 */
export async function decryptPII(tenantId: string, encryptedData: string): Promise<string | null> {
  const result = await tenantCrypto.decrypt(tenantId, encryptedData, 'pii');
  return result.success ? result.data! : null;
}

/**
 * Criptografa dados financeiros
 */
export async function encryptFinancial(tenantId: string, data: string): Promise<string | null> {
  const result = await tenantCrypto.encrypt(tenantId, data, 'financial');
  return result.success ? result.data! : null;
}

/**
 * Descriptografa dados financeiros
 */
export async function decryptFinancial(tenantId: string, encryptedData: string): Promise<string | null> {
  const result = await tenantCrypto.decrypt(tenantId, encryptedData, 'financial');
  return result.success ? result.data! : null;
}

/**
 * Criptografa dados de auditoria
 */
export async function encryptAudit(tenantId: string, data: string): Promise<string | null> {
  const result = await tenantCrypto.encrypt(tenantId, data, 'audit');
  return result.success ? result.data! : null;
}

/**
 * Descriptografa dados de auditoria
 */
export async function decryptAudit(tenantId: string, encryptedData: string): Promise<string | null> {
  const result = await tenantCrypto.decrypt(tenantId, encryptedData, 'audit');
  return result.success ? result.data! : null;
}

/**
 * Criptografa dados de compliance
 */
export async function encryptCompliance(tenantId: string, data: string): Promise<string | null> {
  const result = await tenantCrypto.encrypt(tenantId, data, 'compliance');
  return result.success ? result.data! : null;
}

/**
 * Descriptografa dados de compliance
 */
export async function decryptCompliance(tenantId: string, encryptedData: string): Promise<string | null> {
  const result = await tenantCrypto.decrypt(tenantId, encryptedData, 'compliance');
  return result.success ? result.data! : null;
}

export default tenantCrypto;