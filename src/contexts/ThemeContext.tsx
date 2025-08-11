
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  colorPalette: ColorPalette;
}

interface ThemeContextType {
  preferences: ThemePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ThemePreferences>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ThemePreferences>({
    theme: 'system',
    colorPalette: {
      primary: '#0d26e3',
      secondary: '#7e22ce',
      tertiary: '#be185d',
    },
  });

  useTheme(preferences.colorPalette);

  useEffect(() => {
    const fetchThemePreferences = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching theme preferences:', error);
        } else if (data && data.notification_preferences) {
          const prefs = data.notification_preferences as any;
          if (prefs.colorPalette) {
            setPreferences(prev => ({ ...prev, ...prefs }));
          }
        }
      }
    };

    fetchThemePreferences();
  }, [user]);

  const value = useMemo(() => ({ preferences, setPreferences }), [preferences]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
