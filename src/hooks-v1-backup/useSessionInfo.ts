import { useState, useEffect } from 'react';
import { captureSessionInfo, getUserIP, getLocationFromIP } from '@/utils/securityLogger';

interface SessionInfo {
  ip_address: string | null;
  user_agent: string;
  location: any;
  browser_info: any;
  timestamp: string;
}

interface UseSessionInfoReturn {
  sessionInfo: SessionInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshSessionInfo: () => Promise<void>;
}

export const useSessionInfo = (): UseSessionInfoReturn => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessionInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const info = await captureSessionInfo();
      setSessionInfo(info as SessionInfo);
    } catch (err) {
      console.error('Erro ao carregar informações de sessão:', err);
      setError('Falha ao carregar informações de sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSessionInfo = async () => {
    await loadSessionInfo();
  };

  useEffect(() => {
    loadSessionInfo();
  }, []);

  return {
    sessionInfo,
    isLoading,
    error,
    refreshSessionInfo
  };
};

// Hook específico para obter apenas o IP
export const useUserIP = () => {
  const [ip, setIP] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIP = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userIP = await getUserIP();
        setIP(userIP);
      } catch (err) {
        console.error('Erro ao obter IP:', err);
        setError('Falha ao obter IP');
      } finally {
        setIsLoading(false);
      }
    };

    loadIP();
  }, []);

  return { ip, isLoading, error };
};

// Hook para obter localização baseada no IP
export const useLocationFromIP = (ip: string | null) => {
  const [location, setLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ip) {
      setLocation(null);
      return;
    }

    const loadLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const locationData = await getLocationFromIP(ip);
        setLocation(locationData);
      } catch (err) {
        console.error('Erro ao obter localização:', err);
        setError('Falha ao obter localização');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, [ip]);

  return { location, isLoading, error };
};