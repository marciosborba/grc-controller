/**
 * HOOK PARA GESTAO DE CRIPTOGRAFIA POR TENANT - VERSÃO CORRIGIDA
 * 
 * Hook personalizado que facilita o uso do sistema de criptografia
 * por tenant em componentes React - SEM LOOP INFINITO.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  tenantCrypto, 
  type TenantKeyInfo, 
  type EncryptionPurpose,
  type EncryptionResult,
  type DecryptionResult
} from '@/utils/tenantCrypto';
import { toast } from 'sonner';

interface UseTenantCryptoOptions {
  autoLoadKeys?: boolean;
  autoLoadStats?: boolean;
  statsDays?: number;
}

interface CryptoStats {
  operationType: string;
  operationDate: string;
  operationCount: number;
  successCount: number;
  errorCount: number;
  avgPerformanceMs: number;
  maxPerformanceMs: number;
}

interface UseTenantCryptoReturn {
  // Estados
  keyInfo: TenantKeyInfo[];
  cryptoStats: CryptoStats[];
  cacheStats: any;
  loading: boolean;
  error: string | null;
  
  // Funcoes de criptografia
  encrypt: (data: string, purpose?: EncryptionPurpose, options?: { tableName?: string; fieldName?: string }) => Promise<EncryptionResult>;
  decrypt: (encryptedData: string, purpose?: EncryptionPurpose, options?: { tableName?: string; fieldName?: string }) => Promise<DecryptionResult>;
  
  // Funcoes de conveniencia
  encryptPII: (data: string) => Promise<string | null>;
  decryptPII: (encryptedData: string) => Promise<string | null>;
  encryptFinancial: (data: string) => Promise<string | null>;
  decryptFinancial: (encryptedData: string) => Promise<string | null>;
  encryptAudit: (data: string) => Promise<string | null>;
  decryptAudit: (encryptedData: string) => Promise<string | null>;
  encryptCompliance: (data: string) => Promise<string | null>;
  decryptCompliance: (encryptedData: string) => Promise<string | null>;
  
  // Funcoes de gerenciamento
  loadKeyInfo: () => Promise<void>;
  loadCryptoStats: () => Promise<void>;
  rotateKey: (purpose: EncryptionPurpose, reason?: string) => Promise<boolean>;
  createTenantKeys: () => Promise<boolean>;
  clearCache: (purpose?: EncryptionPurpose) => void;
  
  // Funcoes de teste
  testEncryption: (testData: string, purposes?: EncryptionPurpose[]) => Promise<any[]>;
  
  // Utilitarios
  isEncrypted: (data: string) => boolean;
  estimateEncryptedSize: (plaintext: string) => number;
}

export const useTenantCryptoFixed = (
  tenantId?: string,
  options: UseTenantCryptoOptions = {}
): UseTenantCryptoReturn => {
  const { user } = useAuth();
  const {
    autoLoadKeys = false, // MUDANÇA: padrão false para evitar carregamento automático
    autoLoadStats = false, // MUDANÇA: padrão false para evitar carregamento automático
    statsDays = 30
  } = options;
  
  // Usar tenantId do usuario se nao fornecido
  const effectiveTenantId = tenantId || user?.tenantId;
  
  // Estados
  const [keyInfo, setKeyInfo] = useState<TenantKeyInfo[]>([]);
  const [cryptoStats, setCryptoStats] = useState<CryptoStats[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Funcao para carregar informacoes das chaves - SEM useCallback para evitar dependências
  const loadKeyInfo = async () => {
    if (!effectiveTenantId) {
      setError('Tenant ID nao fornecido');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const keys = await tenantCrypto.getTenantKeyInfo(effectiveTenantId);
      setKeyInfo(keys);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar informacoes das chaves';
      setError(errorMessage);
      console.error('Erro ao carregar informacoes das chaves:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Funcao para carregar estatisticas - SEM useCallback para evitar dependências
  const loadCryptoStats = async () => {
    if (!effectiveTenantId) {
      setError('Tenant ID nao fornecido');
      return;
    }
    
    try {
      setError(null);
      
      const [stats, cache] = await Promise.all([
        tenantCrypto.getCryptoStats(effectiveTenantId, statsDays),
        Promise.resolve(tenantCrypto.getCacheStats())
      ]);
      
      setCryptoStats(stats);
      setCacheStats(cache);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar estatisticas';
      setError(errorMessage);
      console.error('Erro ao carregar estatisticas:', err);
    }
  };
  
  // Funcoes de criptografia
  const encrypt = useCallback(async (
    data: string, 
    purpose: EncryptionPurpose = 'general',
    options?: { tableName?: string; fieldName?: string }
  ): Promise<EncryptionResult> => {
    if (!effectiveTenantId) {
      return {
        success: false,
        error: 'Tenant ID nao fornecido'
      };
    }
    
    return await tenantCrypto.encrypt(effectiveTenantId, data, purpose, options);
  }, [effectiveTenantId]);
  
  const decrypt = useCallback(async (
    encryptedData: string, 
    purpose: EncryptionPurpose = 'general',
    options?: { tableName?: string; fieldName?: string }
  ): Promise<DecryptionResult> => {
    if (!effectiveTenantId) {
      return {
        success: false,
        error: 'Tenant ID nao fornecido'
      };
    }
    
    return await tenantCrypto.decrypt(effectiveTenantId, encryptedData, purpose, options);
  }, [effectiveTenantId]);
  
  // Funcoes de conveniencia
  const encryptPII = useCallback(async (data: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.encrypt(effectiveTenantId, data, 'pii');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const decryptPII = useCallback(async (encryptedData: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.decrypt(effectiveTenantId, encryptedData, 'pii');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const encryptFinancial = useCallback(async (data: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.encrypt(effectiveTenantId, data, 'financial');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const decryptFinancial = useCallback(async (encryptedData: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.decrypt(effectiveTenantId, encryptedData, 'financial');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const encryptAudit = useCallback(async (data: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.encrypt(effectiveTenantId, data, 'audit');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const decryptAudit = useCallback(async (encryptedData: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.decrypt(effectiveTenantId, encryptedData, 'audit');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const encryptCompliance = useCallback(async (data: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.encrypt(effectiveTenantId, data, 'compliance');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  const decryptCompliance = useCallback(async (encryptedData: string): Promise<string | null> => {
    if (!effectiveTenantId) return null;
    
    const result = await tenantCrypto.decrypt(effectiveTenantId, encryptedData, 'compliance');
    return result.success ? result.data! : null;
  }, [effectiveTenantId]);
  
  // Funcoes de gerenciamento
  const rotateKey = useCallback(async (
    purpose: EncryptionPurpose, 
    reason: string = 'manual'
  ): Promise<boolean> => {
    if (!effectiveTenantId) {
      toast.error('Tenant ID nao fornecido');
      return false;
    }
    
    try {
      const success = await tenantCrypto.rotateKey(effectiveTenantId, purpose, reason);
      
      if (success) {
        // Recarregar informacoes apos rotacao
        await loadKeyInfo();
        await loadCryptoStats();
      }
      
      return success;
    } catch (err: any) {
      console.error('Erro ao rotacionar chave:', err);
      toast.error('Erro ao rotacionar chave');
      return false;
    }
  }, [effectiveTenantId]);
  
  const createTenantKeys = useCallback(async (): Promise<boolean> => {
    if (!effectiveTenantId) {
      toast.error('Tenant ID nao fornecido');
      return false;
    }
    
    try {
      const success = await tenantCrypto.createTenantKeys(effectiveTenantId);
      
      if (success) {
        // Recarregar informacoes apos criacao
        await loadKeyInfo();
        await loadCryptoStats();
      }
      
      return success;
    } catch (err: any) {
      console.error('Erro ao criar chaves:', err);
      toast.error('Erro ao criar chaves criptograficas');
      return false;
    }
  }, [effectiveTenantId]);
  
  const clearCache = useCallback((purpose?: EncryptionPurpose) => {
    if (!effectiveTenantId) {
      toast.error('Tenant ID nao fornecido');
      return;
    }
    
    try {
      tenantCrypto.clearCache(effectiveTenantId, purpose);
      
      // Atualizar estatisticas do cache
      const newCacheStats = tenantCrypto.getCacheStats();
      setCacheStats(newCacheStats);
      
      toast.success(
        purpose 
          ? `Cache da chave ${purpose} limpo` 
          : 'Cache do tenant limpo'
      );
    } catch (err: any) {
      console.error('Erro ao limpar cache:', err);
      toast.error('Erro ao limpar cache');
    }
  }, [effectiveTenantId]);
  
  // Funcao de teste
  const testEncryption = useCallback(async (
    testData: string,
    purposes: EncryptionPurpose[] = ['general', 'pii', 'financial', 'audit', 'compliance']
  ): Promise<any[]> => {
    if (!effectiveTenantId) {
      toast.error('Tenant ID nao fornecido');
      return [];
    }
    
    if (!testData.trim()) {
      toast.error('Dados de teste sao obrigatorios');
      return [];
    }
    
    const results = [];
    
    for (const purpose of purposes) {
      const startTime = performance.now();
      
      try {
        // Testar criptografia
        const encryptResult = await encrypt(testData, purpose, {
          tableName: 'test',
          fieldName: 'test_field'
        });
        
        if (!encryptResult.success) {
          throw new Error(encryptResult.error || 'Falha na criptografia');
        }
        
        // Testar descriptografia
        const decryptResult = await decrypt(encryptResult.data!, purpose, {
          tableName: 'test',
          fieldName: 'test_field'
        });
        
        if (!decryptResult.success) {
          throw new Error(decryptResult.error || 'Falha na descriptografia');
        }
        
        const endTime = performance.now();
        const performanceMs = Math.round(endTime - startTime);
        
        results.push({
          purpose,
          testData,
          encrypted: encryptResult.data!,
          decrypted: decryptResult.data!,
          success: decryptResult.data === testData,
          performanceMs
        });
        
      } catch (error: any) {
        const endTime = performance.now();
        const performanceMs = Math.round(endTime - startTime);
        
        results.push({
          purpose,
          testData,
          encrypted: '',
          decrypted: '',
          success: false,
          performanceMs,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      toast.success(`Todos os testes passaram! (${successCount}/${totalCount})`);
    } else {
      toast.warning(`${successCount}/${totalCount} testes passaram`);
    }
    
    return results;
  }, [effectiveTenantId, encrypt, decrypt]);
  
  // Utilitarios
  const isEncrypted = useCallback((data: string): boolean => {
    return tenantCrypto.constructor.isEncrypted(data);
  }, []);
  
  const estimateEncryptedSize = useCallback((plaintext: string): number => {
    return tenantCrypto.constructor.estimateEncryptedSize(plaintext);
  }, []);
  
  // CORRIGIDO: useEffect SEM dependências problemáticas
  useEffect(() => {
    if (effectiveTenantId && autoLoadKeys) {
      loadKeyInfo();
    }
  }, [effectiveTenantId, autoLoadKeys]); // Apenas dependências primitivas
  
  useEffect(() => {
    if (effectiveTenantId && autoLoadStats) {
      loadCryptoStats();
    }
  }, [effectiveTenantId, autoLoadStats, statsDays]); // Apenas dependências primitivas
  
  return {
    // Estados
    keyInfo,
    cryptoStats,
    cacheStats,
    loading,
    error,
    
    // Funcoes de criptografia
    encrypt,
    decrypt,
    
    // Funcoes de conveniencia
    encryptPII,
    decryptPII,
    encryptFinancial,
    decryptFinancial,
    encryptAudit,
    decryptAudit,
    encryptCompliance,
    decryptCompliance,
    
    // Funcoes de gerenciamento
    loadKeyInfo,
    loadCryptoStats,
    rotateKey,
    createTenantKeys,
    clearCache,
    
    // Funcoes de teste
    testEncryption,
    
    // Utilitarios
    isEncrypted,
    estimateEncryptedSize
  };
};

export default useTenantCryptoFixed;