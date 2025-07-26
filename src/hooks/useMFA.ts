import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { MFASetupData, MFAVerificationRequest, UserMFA } from '@/types/user-management';

// Simulação de biblioteca TOTP (em produção, usar uma biblioteca real como 'otplib')
const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const generateBackupCodes = (): string[] => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
};

const generateQRCode = (secret: string, email: string, issuer: string = 'GRC System'): string => {
  const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  // Em produção, usar uma biblioteca para gerar QR code real
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
};

const verifyTOTP = (token: string, secret: string): boolean => {
  // Em produção, implementar verificação TOTP real
  // Por enquanto, aceitar qualquer token de 6 dígitos
  return /^\d{6}$/.test(token);
};

export const useMFA = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);

  // Buscar configuração MFA do usuário
  const {
    data: mfaConfig,
    isLoading: isLoadingMFA,
    error: mfaError
  } = useQuery({
    queryKey: ['mfa-config', user?.id],
    queryFn: async (): Promise<UserMFA | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_mfa')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Iniciar configuração MFA
  const setupMFAMutation = useMutation({
    mutationFn: async (): Promise<MFASetupData> => {
      if (!user?.id || !user?.email) {
        throw new Error('Usuário não autenticado');
      }

      const secret = generateTOTPSecret();
      const backup_codes = generateBackupCodes();
      const qr_code = generateQRCode(secret, user.email);

      // Salvar configuração temporária (não habilitada ainda)
      const { error } = await supabase
        .from('user_mfa')
        .upsert({
          user_id: user.id,
          secret_key: secret,
          backup_codes,
          is_enabled: false
        });

      if (error) throw error;

      const setupData: MFASetupData = {
        secret,
        qr_code,
        backup_codes
      };

      setSetupData(setupData);

      // Log da atividade
      await supabase.rpc('log_security_event', {
        _user_id: user.id,
        _tenant_id: user.tenantId,
        _event_type: 'mfa_setup_started',
        _severity: 'info'
      });

      return setupData;
    },
    onError: (error: any) => {
      toast.error(`Erro ao configurar MFA: ${error.message}`);
    }
  });

  // Verificar e habilitar MFA
  const enableMFAMutation = useMutation({
    mutationFn: async (verification: MFAVerificationRequest): Promise<void> => {
      if (!user?.id || !setupData) {
        throw new Error('Configuração MFA não iniciada');
      }

      // Verificar token TOTP ou código de backup
      let isValid = false;
      
      if (verification.token) {
        isValid = verifyTOTP(verification.token, setupData.secret);
      } else if (verification.backup_code) {
        isValid = setupData.backup_codes.includes(verification.backup_code.toUpperCase());
      }

      if (!isValid) {
        throw new Error('Código inválido');
      }

      // Habilitar MFA
      const { error } = await supabase
        .from('user_mfa')
        .update({ 
          is_enabled: true,
          last_used_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar perfil
      await supabase
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('user_id', user.id);

      // Log da atividade
      await supabase.rpc('log_security_event', {
        _user_id: user.id,
        _tenant_id: user.tenantId,
        _event_type: 'mfa_enabled',
        _severity: 'info',
        _details: { method: verification.token ? 'totp' : 'backup_code' }
      });

      setSetupData(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-config'] });
      toast.success('MFA habilitado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao habilitar MFA: ${error.message}`);
    }
  });

  // Desabilitar MFA
  const disableMFAMutation = useMutation({
    mutationFn: async (verification: MFAVerificationRequest): Promise<void> => {
      if (!user?.id || !mfaConfig) {
        throw new Error('MFA não configurado');
      }

      // Verificar token TOTP ou código de backup
      let isValid = false;
      
      if (verification.token) {
        isValid = verifyTOTP(verification.token, mfaConfig.secret_key || '');
      } else if (verification.backup_code) {
        isValid = mfaConfig.backup_codes?.includes(verification.backup_code.toUpperCase()) || false;
      }

      if (!isValid) {
        throw new Error('Código inválido');
      }

      // Desabilitar MFA
      const { error } = await supabase
        .from('user_mfa')
        .update({ is_enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar perfil
      await supabase
        .from('profiles')
        .update({ two_factor_enabled: false })
        .eq('user_id', user.id);

      // Log da atividade
      await supabase.rpc('log_security_event', {
        _user_id: user.id,
        _tenant_id: user.tenantId,
        _event_type: 'mfa_disabled',
        _severity: 'warning',
        _details: { method: verification.token ? 'totp' : 'backup_code' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-config'] });
      toast.success('MFA desabilitado');
    },
    onError: (error: any) => {
      toast.error(`Erro ao desabilitar MFA: ${error.message}`);
    }
  });

  // Gerar novos códigos de backup
  const regenerateBackupCodesMutation = useMutation({
    mutationFn: async (verification: MFAVerificationRequest): Promise<string[]> => {
      if (!user?.id || !mfaConfig) {
        throw new Error('MFA não configurado');
      }

      // Verificar token TOTP
      if (!verification.token || !verifyTOTP(verification.token, mfaConfig.secret_key || '')) {
        throw new Error('Código TOTP inválido');
      }

      const new_backup_codes = generateBackupCodes();

      // Atualizar códigos de backup
      const { error } = await supabase
        .from('user_mfa')
        .update({ backup_codes: new_backup_codes })
        .eq('user_id', user.id);

      if (error) throw error;

      // Log da atividade
      await supabase.rpc('log_security_event', {
        _user_id: user.id,
        _tenant_id: user.tenantId,
        _event_type: 'backup_codes_regenerated',
        _severity: 'info'
      });

      return new_backup_codes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-config'] });
      toast.success('Novos códigos de backup gerados');
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar códigos: ${error.message}`);
    }
  });

  // Verificar MFA durante login
  const verifyMFAMutation = useMutation({
    mutationFn: async (verification: MFAVerificationRequest): Promise<boolean> => {
      if (!user?.id || !mfaConfig) {
        throw new Error('MFA não configurado');
      }

      let isValid = false;
      let usedBackupCode = false;

      if (verification.token) {
        isValid = verifyTOTP(verification.token, mfaConfig.secret_key || '');
      } else if (verification.backup_code) {
        isValid = mfaConfig.backup_codes?.includes(verification.backup_code.toUpperCase()) || false;
        usedBackupCode = isValid;
      }

      if (!isValid) {
        // Log tentativa falhada
        await supabase.rpc('log_security_event', {
          _user_id: user.id,
          _tenant_id: user.tenantId,
          _event_type: 'mfa_challenge_failed',
          _severity: 'warning'
        });
        throw new Error('Código inválido');
      }

      // Se usou código de backup, removê-lo da lista
      if (usedBackupCode && verification.backup_code) {
        const updatedCodes = mfaConfig.backup_codes?.filter(
          code => code !== verification.backup_code!.toUpperCase()
        ) || [];

        await supabase
          .from('user_mfa')
          .update({ 
            backup_codes: updatedCodes,
            last_used_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Atualizar último uso
        await supabase
          .from('user_mfa')
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      // Log sucesso
      await supabase.rpc('log_security_event', {
        _user_id: user.id,
        _tenant_id: user.tenantId,
        _event_type: 'mfa_challenge_success',
        _severity: 'info',
        _details: { 
          method: verification.token ? 'totp' : 'backup_code',
          backup_codes_remaining: usedBackupCode ? 
            (mfaConfig.backup_codes?.length || 0) - 1 : 
            mfaConfig.backup_codes?.length || 0
        }
      });

      return true;
    },
    onError: (error: any) => {
      toast.error(`Erro na verificação MFA: ${error.message}`);
    }
  });

  return {
    // Data
    mfaConfig,
    setupData,
    isMFAEnabled: mfaConfig?.is_enabled || false,
    
    // Loading states
    isLoadingMFA,
    
    // Errors
    mfaError,
    
    // Actions
    setupMFA: setupMFAMutation.mutate,
    enableMFA: enableMFAMutation.mutate,
    disableMFA: disableMFAMutation.mutate,
    regenerateBackupCodes: regenerateBackupCodesMutation.mutate,
    verifyMFA: verifyMFAMutation.mutate,
    
    // Loading states for mutations
    isSettingUpMFA: setupMFAMutation.isPending,
    isEnablingMFA: enableMFAMutation.isPending,
    isDisablingMFA: disableMFAMutation.isPending,
    isRegeneratingCodes: regenerateBackupCodesMutation.isPending,
    isVerifyingMFA: verifyMFAMutation.isPending,
    
    // Success data
    newBackupCodes: regenerateBackupCodesMutation.data
  };
};