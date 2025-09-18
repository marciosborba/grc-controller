import { useState, useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const {
    maxAttempts,
    windowMs,
    blockDurationMs = windowMs * 2
  } = config;

  const stateRef = useRef<RateLimitState>({
    attempts: 0,
    windowStart: Date.now(),
    blocked: false
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;

    // Verificar se ainda está bloqueado
    if (state.blocked && state.blockedUntil && now < state.blockedUntil) {
      return {
        allowed: false,
        blocked: true,
        remainingTime: state.blockedUntil - now,
        attemptsRemaining: 0
      };
    }

    // Resetar se passou da janela de tempo ou se não está mais bloqueado
    if (now - state.windowStart > windowMs || (state.blocked && state.blockedUntil && now >= state.blockedUntil)) {
      state.attempts = 0;
      state.windowStart = now;
      state.blocked = false;
      state.blockedUntil = undefined;
    }

    // Verificar se excedeu o limite
    if (state.attempts >= maxAttempts) {
      state.blocked = true;
      state.blockedUntil = now + blockDurationMs;
      
      return {
        allowed: false,
        blocked: true,
        remainingTime: blockDurationMs,
        attemptsRemaining: 0
      };
    }

    // Permitir a ação
    state.attempts++;
    
    return {
      allowed: true,
      blocked: false,
      remainingTime: 0,
      attemptsRemaining: maxAttempts - state.attempts
    };
  }, [maxAttempts, windowMs, blockDurationMs]);

  const resetRateLimit = useCallback(() => {
    stateRef.current = {
      attempts: 0,
      windowStart: Date.now(),
      blocked: false
    };
  }, []);

  const getRemainingTime = useCallback(() => {
    const state = stateRef.current;
    if (state.blocked && state.blockedUntil) {
      return Math.max(0, state.blockedUntil - Date.now());
    }
    return 0;
  }, []);

  return {
    checkRateLimit,
    resetRateLimit,
    getRemainingTime
  };
};

// Hook para rate limiting de operações CRUD
export const useCRUDRateLimit = () => {
  return useRateLimit({
    maxAttempts: 10, // 10 operações por minuto
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000 // 5 minutos bloqueado
  });
};

// Hook para rate limiting de login
export const useLoginRateLimit = () => {
  return useRateLimit({
    maxAttempts: 5, // 5 tentativas por 15 minutos
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 30 * 60 * 1000 // 30 minutos bloqueado
  });
};

// Hook para rate limiting de API calls gerais
export const useAPIRateLimit = () => {
  return useRateLimit({
    maxAttempts: 50, // 50 requests por minuto
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 2 * 60 * 1000 // 2 minutos bloqueado
  });
};