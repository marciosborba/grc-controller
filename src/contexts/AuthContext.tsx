import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  jobTitle?: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  theme: 'light' | 'dark';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'admin@grc.com': {
    id: '1',
    email: 'admin@grc.com',
    name: 'Ana Silva',
    jobTitle: 'CISO',
    tenantId: 'tenant1',
    roles: ['admin', 'ciso'],
    permissions: ['all'],
    theme: 'light'
  },
  'risk@grc.com': {
    id: '2',
    email: 'risk@grc.com',
    name: 'Carlos Santos',
    jobTitle: 'Chief Risk Officer',
    tenantId: 'tenant1',
    roles: ['risk_manager'],
    permissions: ['risk.read', 'risk.write'],
    theme: 'light'
  },
  'compliance@grc.com': {
    id: '3',
    email: 'compliance@grc.com',
    name: 'Maria Costa',
    jobTitle: 'Compliance Officer',
    tenantId: 'tenant1',
    roles: ['compliance_officer'],
    permissions: ['compliance.read', 'compliance.write'],
    theme: 'light'
  },
  'auditor@grc.com': {
    id: '4',
    email: 'auditor@grc.com',
    name: 'João Oliveira',
    jobTitle: 'Internal Auditor',
    tenantId: 'tenant1',
    roles: ['auditor'],
    permissions: ['audit.read', 'audit.write'],
    theme: 'light'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stored auth
    const storedUser = localStorage.getItem('grc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Apply theme
    if (user?.theme) {
      document.documentElement.classList.toggle('dark', user.theme === 'dark');
    }
  }, [user?.theme]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[email];
    if (mockUser && password === 'demo123') {
      setUser(mockUser);
      localStorage.setItem('grc_user', JSON.stringify(mockUser));
    } else {
      throw new Error('Credenciais inválidas');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grc_user');
  };

  const toggleTheme = () => {
    if (user) {
      const newTheme: 'light' | 'dark' = user.theme === 'light' ? 'dark' : 'light';
      const updatedUser: User = { ...user, theme: newTheme };
      setUser(updatedUser);
      localStorage.setItem('grc_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};