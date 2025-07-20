import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  constructor(private config: RateLimitConfig) {}

  async checkLimit(identifier: string): Promise<{ allowed: boolean; resetTime?: number }> {
    const now = Date.now();
    const key = identifier;
    
    let entry = this.limits.get(key);
    
    // Reset if window has passed
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      this.limits.set(key, entry);
      return { allowed: true };
    }
    
    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return { 
        allowed: false, 
        resetTime: entry.resetTime 
      };
    }
    
    // Increment counter
    entry.count++;
    this.limits.set(key, entry);
    
    return { allowed: true };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Rate limiters for different operations
export const loginRateLimit = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

export const apiRateLimit = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  message: 'Muitas requisições. Aguarde um momento.'
});

export const reportRateLimit = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Limite de relatórios atingido. Tente novamente em 1 hora.'
});

// Função utilitária para aplicar rate limit
export const applyRateLimit = async (
  rateLimiter: RateLimiter, 
  identifier: string
): Promise<{ success: boolean; error?: string; resetTime?: number }> => {
  try {
    const result = await rateLimiter.checkLimit(identifier);
    
    if (!result.allowed) {
      const resetIn = result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : 0;
      return {
        success: false,
        error: `Rate limit excedido. Tente novamente em ${resetIn} segundos.`,
        resetTime: result.resetTime
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro no rate limiting:', error);
    return { success: true }; // Fail open em caso de erro
  }
};

// Cleanup function to be called periodically
export const cleanupRateLimiters = (): void => {
  loginRateLimit.cleanup();
  apiRateLimit.cleanup();
  reportRateLimit.cleanup();
};

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimiters, 5 * 60 * 1000);
}