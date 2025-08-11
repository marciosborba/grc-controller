
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useTheme } from '@/hooks/useTheme';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface ThemePreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  colorPalette: ColorPalette;
  notifications?: {
    email?: boolean;
    push?: boolean;
    security?: boolean;
    updates?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showActivity?: boolean;
  };
}

interface ThemeContextType {
  preferences: ThemePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ThemePreferences>>;
  savePreferences: () => Promise<void>;
  saving: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  systemTheme: string | undefined;
  resolvedTheme: string | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeContextInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ThemePreferences>({
    theme: 'system',
    language: 'pt-BR',
    colorPalette: {
      primary: '#0d26e3',
      secondary: '#7e22ce',
      tertiary: '#be185d',
    },
    notifications: {
      email: true,
      push: true,
      security: true,
      updates: true,
    },
    privacy: {
      showEmail: false,
      showActivity: false,
    },
  });

  useTheme(preferences.colorPalette);

  const savePreferences = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current profile:', fetchError);
        throw new Error(`Erro ao buscar dados do perfil atual: ${fetchError.message}`);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: {
            ...preferences,
            theme: theme || 'system',
          },
          language: preferences.language,
          tenant_id: currentProfile.tenant_id,
        })
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchThemePreferences = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences, language')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching theme preferences:', error);
        } else if (data) {
          const prefs = data.notification_preferences as any;
          
          // Set theme from saved preferences
          if (prefs?.theme && prefs.theme !== theme) {
            setTheme(prefs.theme);
          }
          
          setPreferences(prev => ({
            ...prev,
            theme: prefs?.theme || 'system',
            language: data.language || 'pt-BR',
            ...(prefs || {}),
            colorPalette: prefs?.colorPalette || prev.colorPalette,
            notifications: {
              ...prev.notifications,
              ...(prefs?.notifications || {}),
            },
            privacy: {
              ...prev.privacy,
              ...(prefs?.privacy || {}),
            },
          }));
        }
      }
    };

    fetchThemePreferences();
  }, [user]);

  // Sync theme changes with preferences
  useEffect(() => {
    if (theme && theme !== preferences.theme) {
      setPreferences(prev => ({ ...prev, theme: theme as 'light' | 'dark' | 'system' }));
    }
  }, [theme, preferences.theme]);

  const value = useMemo(() => ({ 
    preferences, 
    setPreferences, 
    savePreferences, 
    saving,
    theme,
    setTheme,
    systemTheme,
    resolvedTheme
  }), [preferences, saving, theme, setTheme, systemTheme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeContextInner>
        {children}
      </ThemeContextInner>
    </NextThemeProvider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
