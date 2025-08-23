import { useState } from 'react';
import type { UserMFA, MFASetupData, MFAVerificationRequest } from '@/types/user-management';

// Hook temporário desabilitado até que as tabelas MFA sejam criadas
export const useMFA = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getMFAStatus = async (userId: string): Promise<UserMFA | null> => {
    console.warn('MFA ainda não implementado - tabelas não existem');
    return null;
  };

  const setupMFA = async (userId: string): Promise<MFASetupData> => {
    console.warn('MFA ainda não implementado - tabelas não existem');
    throw new Error('MFA ainda não implementado');
  };

  const verifyMFA = async (userId: string, verification: MFAVerificationRequest): Promise<boolean> => {
    console.warn('MFA ainda não implementado - tabelas não existem');
    return false;
  };

  const disableMFA = async (userId: string): Promise<boolean> => {
    console.warn('MFA ainda não implementado - tabelas não existem');
    return false;
  };

  return {
    // Dados
    mfaConfig: null,
    setupData: null,
    isMFAEnabled: false,
    newBackupCodes: [],
    
    // Estados de loading
    isLoadingMFA: false,
    isSettingUpMFA: false,
    isEnablingMFA: false,
    isDisablingMFA: false,
    isRegeneratingCodes: false,
    isLoading,
    
    // Funções
    getMFAStatus,
    setupMFA,
    verifyMFA,
    disableMFA,
    enableMFA: setupMFA,
    regenerateBackupCodes: () => Promise.resolve([])
  };
};